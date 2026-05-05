import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { getSystemPrompt } from "@/lib/prompts";
import type { FlashcardPayload } from "@/lib/types";
import { safeJsonParse, trimForPrompt } from "@/lib/utils";

export const runtime = "nodejs";

function fallbackCards(content: string): FlashcardPayload {
  const topic = content.trim().slice(0, 80) || "当前材料";
  return {
    cards: [
      { front: "这份材料的核心主题是什么？", back: topic },
      { front: "复习时第一步应该做什么？", back: "先用一句话说清定义或结论。" },
      { front: "遇到资料中没有的信息怎么办？", back: "明确说未找到相关信息，不要编造。" }
    ]
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { content?: string; count?: number };
    const content = body.content ?? "";
    if (!content.trim()) {
      return Response.json({ error: "缺少闪卡材料。" }, { status: 400 });
    }
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(fallbackCards(content));
    }

    const result = await generateText({
      model: openai("gpt-4o"),
      system: getSystemPrompt("flashcard"),
      prompt: `请基于以下材料生成 ${body.count ?? 8} 张闪卡：\n\n${trimForPrompt(content)}`,
      temperature: 0.1
    });
    const parsed = safeJsonParse<FlashcardPayload>(result.text);
    if (!parsed?.cards?.length) {
      return Response.json({ error: "模型未返回合法闪卡 JSON。" }, { status: 502 });
    }
    return Response.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return Response.json({ error: message }, { status: 500 });
  }
}
