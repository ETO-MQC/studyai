"use client";

import { BookOpen, Files, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface MobileNavProps {
  onOpenSources: () => void;
  onOpenSpaces: () => void;
  onOpenSettings: () => void;
}

export function MobileNav({ onOpenSources, onOpenSpaces, onOpenSettings }: MobileNavProps) {
  return (
    <div className="flex items-center justify-between border-b border-line bg-sidebar px-3 py-2 lg:hidden">
      <div className="flex items-center gap-2">
        <Menu className="h-4 w-4" />
        <span className="text-sm font-semibold">LearnKata</span>
      </div>
      <div className="flex gap-1">
        <Button aria-label="资料源" variant="ghost" className="h-8 w-8 px-0" onClick={onOpenSources}>
          <Files className="h-4 w-4" />
        </Button>
        <Button aria-label="学习空间" variant="ghost" className="h-8 w-8 px-0" onClick={onOpenSpaces}>
          <BookOpen className="h-4 w-4" />
        </Button>
        <Button aria-label="设置" variant="ghost" className="h-8 w-8 px-0" onClick={onOpenSettings}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
