"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import type { FlashcardPayload } from "@/lib/types";
import { Button } from "@/components/ui/Button";

export function FlashcardRenderer({ payload }: { payload: FlashcardPayload | null }) {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  if (!payload?.cards?.length) return null;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {payload.cards.map((card, index) => (
        <button
          key={`${card.front}-${index}`}
          type="button"
          className="lk-focus min-h-40 rounded-xl border border-line bg-white p-5 text-left shadow-subtle transition hover:-translate-y-0.5 hover:shadow-soft"
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
      ))}
      <Button variant="ghost" className="md:col-span-2" onClick={() => setFlipped({})}>
        全部回到正面
      </Button>
    </div>
  );
}
