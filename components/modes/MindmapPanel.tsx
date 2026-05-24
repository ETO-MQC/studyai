"use client";

import { ChevronDown, ChevronRight, GitFork, Link2, Plus, Trash2 } from "lucide-react";
import type { Citation, MindmapNode, MindmapPayload } from "@/lib/types";
import { Card } from "@/components/ui/Card";

interface MindmapPanelProps {
  payload: MindmapPayload | null;
  onChange: (payload: MindmapPayload) => void;
  onOpenSource: (citation: Citation) => void;
}

export function MindmapPanel({ payload, onChange, onOpenSource }: MindmapPanelProps) {
  if (!payload) return null;
  const currentPayload = payload;

  function updateNode(nodeId: string, updater: (node: MindmapNode) => MindmapNode) {
    onChange({ root: updateNodeTree(currentPayload.root, nodeId, updater) });
  }

  function removeNode(nodeId: string) {
    onChange({ root: removeNodeTree(currentPayload.root, nodeId) ?? currentPayload.root });
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <GitFork className="h-4 w-4 text-brand-600" />
        <h3 className="font-semibold text-neutral-950">知识图谱</h3>
      </div>
      <div className="space-y-2 rounded-lg border border-line bg-neutral-50 p-3">
        <MindmapNodeEditor
          node={currentPayload.root}
          depth={0}
          onUpdate={updateNode}
          onRemove={removeNode}
          onOpenSource={onOpenSource}
        />
      </div>
    </Card>
  );
}

function MindmapNodeEditor({
  node,
  depth,
  onUpdate,
  onRemove,
  onOpenSource
}: {
  node: MindmapNode;
  depth: number;
  onUpdate: (nodeId: string, updater: (node: MindmapNode) => MindmapNode) => void;
  onRemove: (nodeId: string) => void;
  onOpenSource: (citation: Citation) => void;
}) {
  const hasChildren = node.children.length > 0;

  return (
    <div className="space-y-2" style={{ marginLeft: depth ? 14 : 0 }}>
      <div className="flex items-center gap-1 rounded-md border border-line bg-white px-2 py-2">
        <button
          className="lk-focus shrink-0 rounded p-1 text-muted-foreground hover:bg-neutral-100"
          type="button"
          onClick={() => onUpdate(node.id, (current) => ({ ...current, collapsed: !current.collapsed }))}
          disabled={!hasChildren}
          aria-label={node.collapsed ? "展开节点" : "折叠节点"}
        >
          {hasChildren ? (
            node.collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
          ) : (
            <span className="block h-4 w-4" />
          )}
        </button>
        <input
          className="lk-focus min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-1 text-sm font-medium text-neutral-900 hover:border-line"
          value={node.title}
          onChange={(event) => onUpdate(node.id, (current) => ({ ...current, title: event.target.value }))}
        />
        {node.sourceCitation && (
          <button
            className="lk-focus shrink-0 rounded p-1 text-brand-600 hover:bg-brand-50"
            type="button"
            onClick={() => onOpenSource(node.sourceCitation!)}
            aria-label="打开来源"
          >
            <Link2 className="h-4 w-4" />
          </button>
        )}
        <button
          className="lk-focus shrink-0 rounded p-1 text-muted-foreground hover:bg-neutral-100"
          type="button"
          onClick={() =>
            onUpdate(node.id, (current) => ({
              ...current,
              collapsed: false,
              children: [
                ...current.children,
                {
                  id: `mind_${Date.now()}_${current.children.length}`,
                  title: "新节点",
                  children: [],
                  sourceCitation: current.sourceCitation
                }
              ]
            }))
          }
          aria-label="添加子节点"
        >
          <Plus className="h-4 w-4" />
        </button>
        {depth > 0 && (
          <button
            className="lk-focus shrink-0 rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-700"
            type="button"
            onClick={() => onRemove(node.id)}
            aria-label="删除节点"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      {hasChildren && !node.collapsed && (
        <div className="space-y-2 border-l border-line pl-2">
          {node.children.map((child) => (
            <MindmapNodeEditor
              key={child.id}
              node={child}
              depth={depth + 1}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onOpenSource={onOpenSource}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function updateNodeTree(node: MindmapNode, nodeId: string, updater: (node: MindmapNode) => MindmapNode): MindmapNode {
  if (node.id === nodeId) return updater(node);
  return {
    ...node,
    children: node.children.map((child) => updateNodeTree(child, nodeId, updater))
  };
}

function removeNodeTree(node: MindmapNode, nodeId: string): MindmapNode | null {
  if (node.id === nodeId) return null;
  return {
    ...node,
    children: node.children
      .map((child) => removeNodeTree(child, nodeId))
      .filter((child): child is MindmapNode => Boolean(child))
  };
}
