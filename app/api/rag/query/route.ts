import { generateAiText } from "@/lib/ai-client";
import type { AiRuntimeConfig } from "@/lib/ai-config";
import { buildFileQaPrompt, getSystemPrompt } from "@/lib/prompts";
import { getRelevantContext, localFileAnswer } from "@/lib/rag";
import { trimForPrompt } from "@/lib/utils";

export const runtime = "nodejs";

function textStream(text: string) {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(text));
        controller.close();
      }
    }),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
}

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

    const answer = await generateAiText({
      config: body.aiConfig,
      system: getSystemPrompt("file_qa"),
      messages: [{ role: "user", content: trimForPrompt(buildFileQaPrompt(result.context, body.question)) }],
      temperature: 0.2
    });
    if (!answer) {
      return textStream(localFileAnswer(result.context, body.question));
    }
    return textStream(answer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return Response.json({ error: message }, { status: 500 });
  }
}
