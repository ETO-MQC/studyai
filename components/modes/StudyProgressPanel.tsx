"use client";

import { AlertTriangle, BarChart3, CalendarClock, CheckCircle2 } from "lucide-react";
import type { StudyProgress } from "@/lib/types";
import { Card } from "@/components/ui/Card";

export function StudyProgressPanel({ progress }: { progress: StudyProgress }) {
  const answers = Object.values(progress.quizAnswers);
  const wrongAnswers = answers.filter((answer) => !answer.correct);
  const correctCount = answers.filter((answer) => answer.correct).length;
  const accuracy = answers.length ? Math.round((correctCount / answers.length) * 100) : 0;
  const cards = Object.values(progress.flashcards);
  const dueCards = cards.filter((card) => card.dueAt <= Date.now());
  const knownCards = cards.filter((card) => card.status === "known");

  if (!answers.length && !cards.length) return null;

  return (
    <Card className="mb-4 p-4">
      <div className="mb-3 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-brand-600" />
        <h3 className="font-semibold text-neutral-950">学习进度</h3>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <Metric label="正确率" value={answers.length ? `${accuracy}%` : "-"} />
        <Metric label="错题" value={String(wrongAnswers.length)} />
        <Metric label="待复习" value={String(dueCards.length)} />
      </div>
      <div className="mt-3 space-y-2 text-xs text-neutral-600">
        <p className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          已掌握卡片 {knownCards.length} / {cards.length}
        </p>
        {wrongAnswers.slice(0, 3).map((answer) => (
          <p key={answer.question} className="flex items-start gap-1 rounded-md bg-amber-50 p-2 text-amber-800">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 flex-1">
              {answer.question} 正确答案：{answer.answer}
            </span>
          </p>
        ))}
        {dueCards.slice(0, 3).map((card) => (
          <p key={card.front} className="flex items-start gap-1 rounded-md bg-neutral-50 p-2">
            <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-500" />
            <span className="min-w-0 flex-1">{card.front}</span>
          </p>
        ))}
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-neutral-50 px-2 py-3">
      <p className="text-lg font-semibold text-neutral-950">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
