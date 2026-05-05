"use client";

import { AtSign, ChevronDown, LoaderCircle, Plus, Send, Sparkles } from "lucide-react";
import { FormEvent } from "react";
import type { ChatMode } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface ChatInputProps {
  mode: ChatMode;
  value: string;
  loading: boolean;
  fileName?: string;
  cloudFallback: boolean;
  onModeChange: (mode: ChatMode) => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onOpenSources: () => void;
  onToggleCloudFallback: () => void;
}

export function ChatInput({
  value,
  loading,
  fileName,
  cloudFallback,
  onChange,
  onSubmit,
  onOpenSources,
  onToggleCloudFallback
}: ChatInputProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form
      className="rounded-xl border border-border bg-background shadow-subtle transition focus-within:border-muted-foreground/40"
      onSubmit={handleSubmit}
    >
      <textarea
        className="lk-focus min-h-[84px] w-full resize-none rounded-xl border-0 bg-transparent px-6 py-5 text-lg leading-7 outline-none placeholder:text-muted"
        value={value}
        placeholder="我能帮你什么吗？你也可以 @提及 文件。"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSubmit();
          }
        }}
      />

      <div className="flex items-center justify-between gap-3 px-5 pb-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
          <button
            className="lk-focus inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-background text-neutral-900 transition hover:bg-neutral-50"
            type="button"
            onClick={onOpenSources}
            aria-label="添加资料"
          >
            <Plus className="h-5 w-5" />
          </button>
          <button
            className="lk-focus inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-background text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900"
            type="button"
            onClick={onOpenSources}
            aria-label="提及资料"
          >
            <AtSign className="h-5 w-5" />
          </button>
          <button
            className="lk-focus inline-flex h-11 min-w-0 items-center gap-2 rounded-lg border border-border px-3 text-base text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-900"
            type="button"
            onClick={onToggleCloudFallback}
            title="本地资料不足时，允许模型用云端知识补充"
          >
            <Sparkles className="h-5 w-5 shrink-0 text-purple-700" />
            <span className="truncate">{cloudFallback ? "自动" : "仅本地"}</span>
            <ChevronDown className="h-4 w-4 shrink-0" />
          </button>
          {fileName && (
            <span className="truncate rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
              当前资料库：{fileName}
            </span>
          )}
        </div>
        <Button
          type="submit"
          variant="ghost"
          className="h-11 w-11 shrink-0 rounded-md px-0 text-blue-300 hover:bg-blue-50 hover:text-brand-500"
          disabled={loading || !value.trim()}
          aria-label="发送"
        >
          {loading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </form>
  );
}
