"use client";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { FileText } from "lucide-react";
import type { ChatMessage, Citation } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MermaidBlock } from "./MermaidBlock";

function CitationCard({
  citation,
  index,
  onOpen
}: {
  citation: Citation;
  index: number;
  onOpen?: (citation: Citation) => void;
}) {
  return (
    <button
      type="button"
      className="lk-focus flex w-full items-start gap-2 rounded-lg border border-border bg-neutral-50 px-3 py-2 text-left text-xs transition hover:bg-neutral-100"
      onClick={() => onOpen?.(citation)}
    >
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-700">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
          <span className="truncate font-medium text-foreground">{citation.fileName}</span>
          <span className="shrink-0 text-muted-foreground">{citation.locator}</span>
        </div>
        <p className="mt-0.5 line-clamp-2 text-muted-foreground">{citation.excerpt}</p>
      </div>
      <span className="shrink-0 text-[10px] text-muted-foreground">
        {Math.round(citation.score * 100)}%
      </span>
    </button>
  );
}

export function MessageBubble({
  message,
  onCitationClick
}: {
  message: ChatMessage;
  onCitationClick?: (citation: Citation) => void;
}) {
  const isUser = message.role === "user";
  const hasCitations = !isUser && message.citations && message.citations.length > 0;
  return (
    <div className={cn("flex w-full gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white">
          AI
        </div>
      )}
      <div
        className={cn(
          "max-w-[min(780px,85%)] rounded-xl px-4 py-3 text-sm shadow-subtle",
          isUser
            ? "bg-neutral-950 text-white"
            : "border border-line bg-white text-neutral-900"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-6">{message.content}</p>
        ) : (
          <div className="lk-prose">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex, rehypeHighlight]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const language = match?.[1] ?? "";
                  const content = String(children).replace(/\n$/, "");
                  if (language === "mermaid") {
                    return <MermaidBlock chart={content} />;
                  }
                  if (match) {
                    return (
                      <SyntaxHighlighter
                        PreTag="div"
                        language={language}
                        style={oneLight}
                        customStyle={{ margin: 0, background: "transparent" }}
                      >
                        {content}
                      </SyntaxHighlighter>
                    );
                  }
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        {hasCitations && (
          <div className="mt-3 border-t border-border pt-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">引用来源</p>
            <div className="space-y-1.5">
              {message.citations!.map((citation, index) => (
                <CitationCard
                  key={`${citation.sourceId}-${citation.chunkIndex}`}
                  citation={citation}
                  index={index}
                  onOpen={onCitationClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
