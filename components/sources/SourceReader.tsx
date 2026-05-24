"use client";

import { useEffect, useState } from "react";
import { ClipboardList, FileText, GitFork, Layers, MessageSquare, PenLine, X } from "lucide-react";
import type { Citation, SourceChunk, SourceDocument } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface SourceReaderProps {
  citation: Citation | null;
  onClose: () => void;
  onAsk?: (text: string) => void;
  onGenerateNotes?: (text: string) => void;
  onGenerateQuiz?: (text: string) => void;
  onGenerateFlashcards?: (text: string) => void;
  onGenerateMindmap?: (text: string) => void;
}

interface SourceResponse {
  document: SourceDocument;
  focusChunk: SourceChunk | null;
  chunks: SourceChunk[];
}

export function SourceReader({
  citation,
  onClose,
  onAsk,
  onGenerateNotes,
  onGenerateQuiz,
  onGenerateFlashcards,
  onGenerateMindmap
}: SourceReaderProps) {
  const [data, setData] = useState<SourceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!citation) {
      setData(null);
      return;
    }

    const currentSourceId = citation.sourceId;
    const currentChunkIndex = citation.chunkIndex;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const url = `/api/rag/source?sourceId=${encodeURIComponent(currentSourceId)}&chunkIndex=${currentChunkIndex}`;
        const response = await fetch(url);
        const result = (await response.json()) as SourceResponse & { error?: string };
        if (!response.ok) throw new Error(result.error || "加载失败");
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [citation]);

  if (!citation) return null;

  const focusText = data?.focusChunk?.text || citation.excerpt;

  return (
    <div className="flex h-full w-full flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          <h3 className="truncate text-sm font-semibold">{citation.fileName}</h3>
          <span className="shrink-0 text-xs text-muted-foreground">{citation.locator}</span>
        </div>
        <button
          type="button"
          className="lk-focus rounded-md p-1 text-muted-foreground transition hover:bg-neutral-100 hover:text-foreground"
          onClick={onClose}
          aria-label="关闭"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading && (
          <p className="text-sm text-muted-foreground">加载中...</p>
        )}
        {error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}
        {data && (
          <div className="space-y-4">
            {data.focusChunk && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">命中片段</p>
                <div className="rounded-lg border-2 border-brand-200 bg-brand-50 p-3 text-sm leading-6 text-foreground">
                  {focusText}
                </div>
              </div>
            )}

            {data.chunks.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">上下文片段</p>
                <div className="space-y-2">
                  {data.chunks.map((chunk) => (
                    <div
                      key={chunk.chunkIndex}
                      className="rounded-lg border border-border bg-background p-3 text-sm leading-6 text-foreground"
                    >
                      <span className="mb-1 block text-[10px] font-medium text-muted-foreground">
                        {chunk.locator}
                      </span>
                      {chunk.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!data.focusChunk && data.chunks.length === 0 && (
              <p className="text-sm text-muted-foreground">未找到文本片段。</p>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 py-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">对此片段操作</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            className="gap-1.5 text-xs"
            onClick={() => onAsk?.(focusText)}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            用此片段提问
          </Button>
          <Button
            variant="secondary"
            className="gap-1.5 text-xs"
            onClick={() => onGenerateNotes?.(focusText)}
          >
            <PenLine className="h-3.5 w-3.5" />
            生成笔记
          </Button>
          <Button
            variant="secondary"
            className="gap-1.5 text-xs"
            onClick={() => onGenerateQuiz?.(focusText)}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            生成测验
          </Button>
          <Button
            variant="secondary"
            className="gap-1.5 text-xs"
            onClick={() => onGenerateFlashcards?.(focusText)}
          >
            <Layers className="h-3.5 w-3.5" />
            生成卡片
          </Button>
          <Button
            variant="secondary"
            className="gap-1.5 text-xs"
            onClick={() => onGenerateMindmap?.(focusText)}
          >
            <GitFork className="h-3.5 w-3.5" />
            生成图谱
          </Button>
        </div>
      </div>
    </div>
  );
}
