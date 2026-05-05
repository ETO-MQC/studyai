"use client";

import { Search } from "lucide-react";
import type { ChatMessage } from "@/lib/types";

export function HistoryList({ messages }: { messages: ChatMessage[] }) {
  const userMessages = messages.filter((message) => message.role === "user").slice(-8).reverse();
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-app border border-line bg-white px-3 py-2">
        <Search className="h-4 w-4 text-neutral-400" />
        <input
          className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-neutral-400"
          placeholder="搜索历史"
        />
      </div>
      <div>
        <p className="mb-2 px-1 text-xs font-medium text-neutral-500">今天</p>
        <div className="space-y-1">
          {userMessages.length ? (
            userMessages.map((message) => (
              <div
                key={message.id}
                className="rounded-app px-3 py-2 text-sm leading-5 text-neutral-700 hover:bg-white"
              >
                {message.content.slice(0, 42)}
              </div>
            ))
          ) : (
            <p className="rounded-app border border-dashed border-line bg-white/60 p-3 text-sm text-neutral-500">
              暂无聊天历史
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
