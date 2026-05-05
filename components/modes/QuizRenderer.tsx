"use client";

import { useState } from "react";
import { CheckCircle2, CircleHelp, XCircle } from "lucide-react";
import type { QuizPayload } from "@/lib/types";
import { cn } from "@/lib/utils";

export function QuizRenderer({ payload }: { payload: QuizPayload | null }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  if (!payload?.questions?.length) return null;

  return (
    <div className="space-y-3">
      {payload.questions.map((question, index) => {
        const selected = answers[index];
        const correct = selected && selected === question.answer;
        return (
          <div key={`${question.question}-${index}`} className="lk-card p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-neutral-950">{question.question}</p>
                {question.options?.length ? (
                  <div className="mt-3 grid gap-2">
                    {question.options.map((option) => {
                      const active = selected === option;
                      return (
                        <button
                          key={option}
                          className={cn(
                            "lk-focus flex items-center justify-between rounded-app border px-3 py-2 text-left text-sm transition",
                            active && option === question.answer
                              ? "border-green-300 bg-green-50 text-green-800"
                              : active
                                ? "border-red-300 bg-red-50 text-red-800"
                                : "border-line bg-white hover:bg-neutral-50"
                          )}
                          type="button"
                          onClick={() => setAnswers((prev) => ({ ...prev, [index]: option }))}
                        >
                          <span>{option}</span>
                          {active && option === question.answer && <CheckCircle2 className="h-4 w-4" />}
                          {active && option !== question.answer && <XCircle className="h-4 w-4" />}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <button
                    className="lk-focus mt-3 rounded-app border border-line bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [index]: question.answer }))}
                  >
                    查看答案
                  </button>
                )}
                {selected && (
                  <div
                    className={cn(
                      "mt-3 rounded-app border p-3 text-sm leading-6",
                      correct ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"
                    )}
                  >
                    <p className="font-medium">答案：{question.answer}</p>
                    <p className="text-neutral-700">{question.explanation}</p>
                  </div>
                )}
                {!selected && (
                  <p className="mt-3 flex items-center gap-1 text-xs text-neutral-500">
                    <CircleHelp className="h-3.5 w-3.5" />
                    选择后会显示解析。
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
