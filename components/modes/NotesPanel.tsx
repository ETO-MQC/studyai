"use client";

import { NotebookPen } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function NotesPanel({ source }: { source: string }) {
  const lines = source
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 6);

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <NotebookPen className="h-4 w-4 text-brand-600" />
        <h3 className="font-semibold text-neutral-950">结构化笔记</h3>
      </div>
      {lines.length ? (
        <div className="space-y-3">
          <section>
            <p className="text-xs font-medium uppercase text-neutral-500">重点</p>
            <ul className="mt-2 space-y-2 text-sm leading-6 text-neutral-700">
              {lines.map((line, index) => (
                <li key={`${line}-${index}`} className="rounded-app bg-neutral-50 px-3 py-2">
                  {line}
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-app border border-line bg-brand-50 p-3 text-sm leading-6 text-brand-700">
            复习建议：先复述重点，再用出题模式生成测验，最后用闪卡巩固易忘概念。
          </section>
        </div>
      ) : (
        <p className="text-sm text-neutral-500">输入一段材料后，可以在这里整理成复习笔记。</p>
      )}
    </Card>
  );
}
