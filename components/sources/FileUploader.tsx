"use client";

import { ChangeEvent, useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { SourceFile } from "@/lib/types";

interface FileUploaderProps {
  activeFile: SourceFile | null;
  onUploaded: (file: SourceFile) => void;
}

export function FileUploader({ activeFile, onUploaded }: FileUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const response = await fetch("/api/rag/upload", {
        method: "POST",
        body: form
      });
      const data = (await response.json()) as SourceFile & { error?: string };
      if (!response.ok) throw new Error(data.error || "上传失败");
      onUploaded(data);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "上传失败");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line bg-neutral-50 px-4 py-8 text-center transition hover:bg-neutral-100">
        <Upload className="h-7 w-7 text-neutral-500" />
        <span className="mt-3 text-sm font-medium text-neutral-950">
          {loading ? "上传中..." : "上传 txt / md 文本资料"}
        </span>
        <span className="mt-1 text-xs text-neutral-500">本地内存索引，刷新服务后会清空</span>
        <input className="sr-only" type="file" accept=".txt,.md,.csv" onChange={handleFile} />
      </label>
      {activeFile && (
        <div className="flex items-center gap-3 rounded-app border border-line bg-white p-3">
          <FileText className="h-5 w-5 text-brand-600" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-950">{activeFile.name}</p>
            <p className="text-xs text-neutral-500">{activeFile.chunkCount} 个文本片段</p>
          </div>
          <Button variant="secondary" onClick={() => onUploaded(activeFile)}>
            使用中
          </Button>
        </div>
      )}
      {error && <p className="rounded-app bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
