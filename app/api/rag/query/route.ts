import { generateAiText } from "@/lib/ai-client";
import type { AiRuntimeConfig } from "@/lib/ai-config";
import { buildFileQaPrompt, getSystemPrompt } from "@/lib/prompts";
import { getRelevantContext, localFileAnswer, MIN_RELEVANCE_SCORE } from "@/lib/rag";
import { trimForPrompt } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      fileId?: string;
      question?: string;
      aiConfig?: Partial<AiRuntimeConfig>;
    };
    if (!body.fileId || !body.question?.trim()) {
      return Response.json({ error: "缺少 fileId 或 question。" }, { status: 400 });
    }
    const result = getRelevantContext(body.fileId, body.question);
    if (!result) {
      return Response.json({ error: "未找到对应文件。" }, { status: 404 });
    }

    if (result.maxScore < MIN_RELEVANCE_SCORE || !result.context.trim()) {
      return Response.json({
        answer: "资料不足：当前上传的资料中未找到与问题足够相关的内容。请尝试上传更多相关资料，或换一种方式提问。",
        citations: []
      });
    }

    const answer = await generateAiText({
      config: body.aiConfig,
      system: getSystemPrompt("file_qa"),
      messages: [{ role: "user", content: trimForPrompt(buildFileQaPrompt(result.context, body.question)) }],
      temperature: 0.2
    });

    const finalAnswer = answer || localFileAnswer(result.context, body.question!);

    return Response.json({
      answer: finalAnswer,
      citations: result.citations
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return Response.json({ error: message }, { status: 500 });
  }
}
