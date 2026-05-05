"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Space } from "@/lib/types";

interface SpacesListProps {
  spaces: Space[];
  onCreate: () => void;
}

export function SpacesList({ spaces, onCreate }: SpacesListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">学习空间</h3>
          <p className="text-sm text-muted-foreground">按课程、项目或考试组织资料与对话。</p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4" />
          新建
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {spaces.map((space) => (
          <div key={space.id} className="rounded-xl border border-border bg-background p-4 shadow-subtle">
            <div className="h-2 w-16 rounded-full" style={{ background: space.color }} />
            <h4 className="mt-4 font-semibold text-foreground">{space.name}</h4>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{space.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
