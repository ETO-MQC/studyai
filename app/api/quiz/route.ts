import { generateAiText } from "@/lib/ai-client";
import type { AiRuntimeConfig } from "@/lib/ai-config";
import { getSystemPrompt } from "@/lib/prompts";
import type { QuizPayload } from "@/lib/types";
import { safeJsonParse, trimForPrompt } from "@/lib/utils";

export const runtime = "nodejs";

function fallbackQuiz(content: string): QuizPayload {
  const topic = content.trim().slice(0, 80) || "当前材料";
  return {
    questions: [
      {
        type: "multiple-choice",
        question: `关于“${topic}”，最应该先掌握的是什么？`,
        options: ["核心定义", "无关细节", "随机记忆", "跳过练习"],
        answer: "核心定义",
        explanation: "学习新内容时，应先抓住核心定义，再展开例子和练习。"
      },
      {
        type: "true-false",
        question: "如果资料不足，AI 应该明确说明限制，而不是编造答案。",
        answer: "正确",
        explanation: "这是文件问答和学习辅导的可靠性底线。"
      },
      {
        type: "short-answer",
        question: "请用一句话概括这段材料的重点。",
        answer: topic,
        explanation: "本地兜底模式无法深度理解全文，但保留了测验流程和题型结构。"
      }
    ]
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      content?: string;
      count?: number;
      aiConfig?: Partial<AiRuntimeConfig>;
    };
    const content = body.content ?? "";
    if (!content.trim()) {
      return Response.json({ error: "缺少出题材料。" }, { status: 400 });
    }

    const text = await generateAiText({
      config: body.aiConfig,
      system: getSystemPrompt("quiz"),
      prompt: `请基于以下材料生成 ${body.count ?? 5} 道题：\n\n${trimForPrompt(content)}`,
      temperature: 0.1
    });
    if (!text) {
      return Response.json(fallbackQuiz(content));
    }

    const parsed = safeJsonParse<QuizPayload>(text);
    if (!parsed?.questions?.length) {
      return Response.json({ error: "模型未返回合法题目 JSON。" }, { status: 502 });
    }
    return Response.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return Response.json({ error: message }, { status: 500 });
  }
}
