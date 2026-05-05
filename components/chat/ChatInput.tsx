"use client";

import { LoaderCircle, Paperclip, Send } from "lucide-react";
import { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import type { ChatMode } from "@/lib/types";
import { ModeSelector } from "@/components/modes/ModeSelector";

interface ChatInputProps {
  mode: ChatMode;
  value: string;
  loading: boolean;
  fileName?: string;
  onModeChange: (mode: ChatMode) => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onOpenSources: () => void;
}

export function ChatInput({
  mode,
  value,
  loading,
  fileName,
  onModeChange,
  onChange,
  onSubmit,
  onOpenSources
}: ChatInputProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <div className="border-t border-line bg-canvas/80 p-3 backdrop-blur md:p-4">
      <div className="mx-auto max-w-4xl space-y-2">
        <ModeSelector value={mode} onChange={onModeChange} />
        <form className="rounded-xl border border-line bg-white p-2 shadow-soft" onSubmit={handleSubmit}>
          <textarea
            className="lk-focus min-h-20 w-full resize-none rounded-lg border-0 px-3 py-3 text-base leading-6 outline-none placeholder:text-neutral-400"
            value={value}
            placeholder={
              mode === "file_qa"
                ? "先上传资料，再输入基于资料的问题..."
                : mode === "quiz"
                  ? "粘贴材料，生成测验题..."
                  : mode === "flashcard"
                    ? "粘贴材料，生成复习闪卡..."
                    : "输入你的问题..."
            }
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSubmit();
              }
            }}
          />
          <div className="flex items-center justify-between gap-2 px-1 pb-1">
            <Button type="button" variant="ghost" onClick={onOpenSources}>
              <Paperclip className="h-4 w-4" />
              {fileName ? fileName : "资料"}
            </Button>
            <Button type="submit" variant="primary" disabled={loading || !value.trim()}>
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              发送
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
