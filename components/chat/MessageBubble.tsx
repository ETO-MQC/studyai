"use client";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MermaidBlock } from "./MermaidBlock";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
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
      </div>
    </div>
  );
}
