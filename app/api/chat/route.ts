import { generateAiText } from "@/lib/ai-client";
import type { AiRuntimeConfig } from "@/lib/ai-config";
import { buildFileQaPrompt, getSystemPrompt } from "@/lib/prompts";
import { getRelevantContext, localFileAnswer } from "@/lib/rag";
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
      const prompt = buildFileQaPrompt(result.context, question);
      const answer = await generateAiText({
        config: body.aiConfig,
        system: getSystemPrompt("file_qa"),
        messages: [{ role: "user", content: trimForPrompt(prompt) }],
        temperature: 0.2
      });
      if (!answer) {
        return textStream(localFileAnswer(result.context, question));
      }
      return textStream(answer);
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
