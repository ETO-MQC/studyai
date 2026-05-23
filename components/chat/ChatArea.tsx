"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage, Citation } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";

export function ChatArea({
  messages,
  onCitationClick
}: {
  messages: ChatMessage[];
  onCitationClick?: (citation: Citation) => void;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!messages.length) {
    return (
      <div className="flex h-full items-center justify-center px-6 py-10 text-center">
        <div className="max-w-2xl">
          <p className="text-base text-muted-foreground">LearnKata</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
            今天想学点什么？
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            先查本地资料库，资料不足时再让云端模型补充。也可以切换讲解、总结、出题、闪卡、笔记和文件问答。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lk-scrollbar mx-auto flex h-full w-full max-w-3xl flex-col gap-5 overflow-y-auto px-4 py-8 md:px-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} onCitationClick={onCitationClick} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
