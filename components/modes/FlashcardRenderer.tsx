"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import type { Flashcard, FlashcardPayload, FlashcardReviewRecord, FlashcardReviewStatus } from "@/lib/types";
import { Button } from "@/components/ui/Button";

function cardKey(card: Flashcard, index: number) {
  return `${index}:${card.front}`;
}

function nextDueAt(status: FlashcardReviewStatus) {
  const minute = 60 * 1000;
  const day = 24 * 60 * minute;
  return Date.now() + (status === "known" ? day : 10 * minute);
}

export function FlashcardRenderer({
  payload,
  reviews,
  onReview
}: {
  payload: FlashcardPayload | null;
  reviews: Record<string, FlashcardReviewRecord>;
  onReview: (key: string, record: FlashcardReviewRecord) => void;
}) {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  if (!payload?.cards?.length) return null;

  function review(key: string, card: Flashcard, status: FlashcardReviewStatus) {
    onReview(key, {
      front: card.front,
      back: card.back,
      status,
      reviewedAt: Date.now(),
      dueAt: nextDueAt(status)
    });
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {payload.cards.map((card, index) => {
        const key = cardKey(card, index);
        const record = reviews[key];
        return (
          <div
            key={key}
            className="min-h-40 rounded-xl border border-line bg-white p-5 text-left shadow-subtle transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            <button
              type="button"
              className="lk-focus w-full text-left"
              onClick={() => setFlipped((prev) => ({ ...prev, [index]: !prev[index] }))}
            >
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>卡片 {index + 1}</span>
                <RotateCcw className="h-4 w-4" />
              </div>
              <p className="mt-5 text-lg font-semibold leading-7 text-neutral-950">
                {flipped[index] ? card.back : card.front}
              </p>
              <p className="mt-4 text-xs text-neutral-500">{flipped[index] ? "点击回到正面" : "点击查看答案"}</p>
            </button>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" className="h-8 flex-1 gap-1 text-xs" onClick={() => review(key, card, "again")}>
                <XCircle className="h-3.5 w-3.5" />
                再练
              </Button>
              <Button variant="secondary" className="h-8 flex-1 gap-1 text-xs" onClick={() => review(key, card, "known")}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                已掌握
              </Button>
            </div>
            {record && (
              <p className="mt-2 text-xs text-muted-foreground">
                {record.status === "known" ? "已掌握" : "需要复习"}，下次复习 {new Date(record.dueAt).toLocaleString()}
              </p>
            )}
          </div>
        );
      })}
      <Button variant="ghost" className="md:col-span-2" onClick={() => setFlipped({})}>
        全部回到正面
      </Button>
    </div>
  );
}
