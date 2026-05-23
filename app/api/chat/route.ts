import { generateAiText } from "@/lib/ai-client";
import type { AiRuntimeConfig } from "@/lib/ai-config";
import { buildFileQaPrompt, getSystemPrompt } from "@/lib/prompts";
import { getRelevantContext, localFileAnswer, MIN_RELEVANCE_SCORE } from "@/lib/rag";
import type { ChatMode } from "@/lib/types";
import { getLastUserMessage, trimForPrompt } from "@/lib/utils";

export const runtime = "nodejs";

function localResponse(mode: ChatMode, question: string) {
  const lead =
    mode === "teach"
      ? "先给结论：这个问题可以拆成定义、例子、步骤和误区来理解。"
      : "先给结论：当前没有可用的 AI API 配置，所以我先给本地兜底回答。";

  return `${lead}

你刚才的问题是：${question || "（空问题）"}

- 要启用真实 AI 回答，请在设置里的“AI 接入”保存 API Key、Base URL 和模型名。
- 也可以在服务端环境变量里设置 AI_API_KEY / AI_BASE_URL / AI_MODEL，或继续使用 OPENAI_API_KEY。
- 当前界面、模式切换、资料问答、测验和闪卡仍可用于本地流程验证。`;
}

function buildHybridPrompt(context: string, question: string, cloudFallback: boolean, isStrongMatch: boolean) {
  if (isStrongMatch || !cloudFallback) {
    return buildFileQaPrompt(context, question);
  }

  return `请先参考本地资料库片段回答。如果本地片段不足以回答，请使用你的通用知识补充，并在回答中明确分成“本地资料依据”和“云端补充”两部分。

【本地资料片段】
${context || "本地资料没有检索到足够相关的片段。"}

【用户问题】
${question}

要求：
1. 本地资料能回答的部分优先引用本地资料。
2. 本地资料不足、矛盾或没有命中时，可以用模型知识补充。
3. 不要假装云端补充来自本地资料。`;
}

function textStream(text: string) {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(text));
        controller.close();
      }
    }),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    }
  );
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      messages?: Array<{ role: "user" | "assistant"; content: string }>;
      mode?: ChatMode;
      fileId?: string;
      aiConfig?: Partial<AiRuntimeConfig>;
    };
    const messages = body.messages ?? [];
    const mode = body.mode ?? "chat";
    const question = getLastUserMessage(messages);

    if (mode === "quiz" || mode === "flashcard") {
      return Response.json({ error: "quiz 和 flashcard 请使用独立接口。" }, { status: 400 });
    }

    if (mode === "file_qa") {
      if (!body.fileId) {
        return Response.json({ error: "缺少 fileId，请先上传资料。" }, { status: 400 });
      }
      const result = getRelevantContext(body.fileId, question);
      if (!result) {
        return Response.json({ error: "未找到对应文件。" }, { status: 404 });
      }
      if (result.maxScore < MIN_RELEVANCE_SCORE || !result.context.trim()) {
        return Response.json({
          answer: "资料不足：当前上传的资料中未找到与问题足够相关的内容。请尝试上传更多相关资料，或换一种方式提问。",
          citations: []
        });
      }
      const normalizedConfig = body.aiConfig;
      const threshold = normalizedConfig?.localRelevanceThreshold ?? 0.08;
      const cloudFallback = normalizedConfig?.cloudFallback ?? true;
      const prompt = buildHybridPrompt(result.context, question, cloudFallback, result.maxScore >= threshold);
      const answer = await generateAiText({
        config: body.aiConfig,
        system: getSystemPrompt("file_qa"),
        messages: [{ role: "user", content: trimForPrompt(prompt) }],
        temperature: 0.2
      });
      const finalAnswer = answer || localFileAnswer(result.context, question);
      return Response.json({ answer: finalAnswer, citations: result.citations });
    }

    if (body.fileId && question) {
      const result = getRelevantContext(body.fileId, question);
      if (result) {
        const threshold = body.aiConfig?.localRelevanceThreshold ?? 0.08;
        const cloudFallback = body.aiConfig?.cloudFallback ?? true;
        const hybridQuestion = buildHybridPrompt(
          result.context,
          question,
          cloudFallback,
          result.maxScore >= threshold
        );
        const answer = await generateAiText({
          config: body.aiConfig,
          system: getSystemPrompt(mode),
          messages: [{ role: "user", content: trimForPrompt(hybridQuestion, 8000) }],
          temperature: 0.2
        });
        if (answer) return textStream(answer);
      }
    }

    const answer = await generateAiText({
      config: body.aiConfig,
      system: getSystemPrompt(mode),
      messages: messages.map((message) => ({
        role: message.role,
        content: trimForPrompt(message.content, 4000)
      })),
      temperature: 0.2
    });

    if (!answer) {
      return textStream(localResponse(mode, question));
    }

    return textStream(answer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return Response.json({ error: message }, { status: 500 });
  }
}
