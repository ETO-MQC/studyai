"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";

export function ChatArea({ messages }: { messages: ChatMessage[] }) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!messages.length) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div className="max-w-lg">
          <p className="text-sm font-medium text-neutral-500">LearnKata</p>
          <h1 className="mt-2 text-2xl font-semibold text-neutral-950">今天想学点什么？</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            你可以直接提问，或切换到讲解、总结、出题、闪卡、文件问答等模式。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lk-scrollbar flex h-full flex-col gap-5 overflow-y-auto px-4 py-6 md:px-8">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
