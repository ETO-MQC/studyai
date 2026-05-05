"use client";

import { BookOpen, Files, MessageSquare, Plus, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HistoryList } from "@/components/history/HistoryList";
import type { ChatMessage } from "@/lib/types";

interface SidebarProps {
  messages: ChatMessage[];
  onNewChat: () => void;
  onOpenSources: () => void;
  onOpenSpaces: () => void;
  onOpenSettings: () => void;
}

export function Sidebar({
  messages,
  onNewChat,
  onOpenSources,
  onOpenSpaces,
  onOpenSettings
}: SidebarProps) {
  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-line bg-sidebar p-3 lg:flex lg:flex-col">
      <div className="flex items-center gap-2 px-2 py-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-app bg-neutral-950 text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-950">LearnKata</p>
          <p className="text-xs text-neutral-500">AI Tutor</p>
        </div>
      </div>
      <Button className="mt-3 w-full justify-start" variant="primary" onClick={onNewChat}>
        <Plus className="h-4 w-4" />
        新对话
      </Button>
      <nav className="mt-3 grid gap-1">
        <Button className="justify-start" variant="ghost" onClick={onOpenSources}>
          <Files className="h-4 w-4" />
          资料源
        </Button>
        <Button className="justify-start" variant="ghost" onClick={onOpenSpaces}>
          <BookOpen className="h-4 w-4" />
          学习空间
        </Button>
        <Button className="justify-start" variant="ghost" onClick={onOpenSettings}>
          <Settings className="h-4 w-4" />
          设置
        </Button>
      </nav>
      <div className="mt-5 flex items-center gap-2 px-1 text-xs font-medium text-neutral-500">
        <MessageSquare className="h-4 w-4" />
        聊天历史
      </div>
      <div className="mt-2 min-h-0 flex-1 overflow-y-auto">
        <HistoryList messages={messages} />
      </div>
    </aside>
  );
}
