"use client";

import {
  BookOpen,
  Brain,
  Code2,
  FileQuestion,
  Languages,
  MessageCircle,
  NotebookPen,
  Sparkles,
  SquarePen,
  WandSparkles
} from "lucide-react";
import type { ComponentType } from "react";
import type { ChatMode } from "@/lib/types";
import { cn } from "@/lib/utils";

const modes: Array<{
  value: ChatMode;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { value: "chat", label: "聊天", icon: MessageCircle },
  { value: "teach", label: "讲解", icon: Brain },
  { value: "summary", label: "总结", icon: BookOpen },
  { value: "quiz", label: "出题", icon: SquarePen },
  { value: "flashcard", label: "闪卡", icon: Sparkles },
  { value: "notes", label: "笔记", icon: NotebookPen },
  { value: "file_qa", label: "文件问答", icon: FileQuestion },
  { value: "code", label: "代码", icon: Code2 },
  { value: "rewrite", label: "润色", icon: WandSparkles },
  { value: "translate", label: "翻译", icon: Languages }
];

interface ModeSelectorProps {
  value: ChatMode;
  onChange: (mode: ChatMode) => void;
}

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <div className="lk-scrollbar flex gap-1 overflow-x-auto rounded-md border border-border bg-background p-1">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const active = value === mode.value;
        return (
          <button
            key={mode.value}
            className={cn(
              "lk-focus inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-sm transition",
              active ? "bg-foreground text-background" : "text-muted hover:bg-muted hover:text-foreground"
            )}
            type="button"
            onClick={() => onChange(mode.value)}
          >
            <Icon className="h-4 w-4" />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
