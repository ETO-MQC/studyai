"use client";

import { CheckCircle2, Link2, User } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function SettingsPanel() {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-brand-600" />
          <h3 className="font-semibold text-neutral-950">个人资料</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            昵称
            <input className="lk-focus rounded-app border border-line px-3 py-2" defaultValue="Learner" />
          </label>
          <label className="grid gap-1 text-sm">
            学科偏好
            <input className="lk-focus rounded-app border border-line px-3 py-2" placeholder="数学 / 编程 / 英语" />
          </label>
        </div>
      </Card>
      <Card className="p-4">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-brand-600" />
          <h3 className="font-semibold text-neutral-950">套餐计划</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-app border border-brand-100 bg-brand-50 p-3">
            <p className="font-medium text-brand-700">本地学习版</p>
            <p className="mt-1 text-sm text-neutral-600">支持本地 UI、资料索引和无密钥兜底体验。</p>
          </div>
          <div className="rounded-app border border-line bg-white p-3">
            <p className="font-medium text-neutral-950">AI 流式版</p>
            <p className="mt-1 text-sm text-neutral-600">配置 OPENAI_API_KEY 后启用真实模型能力。</p>
          </div>
        </div>
      </Card>
      <Card className="p-4">
        <div className="mb-4 flex items-center gap-2">
          <Link2 className="h-4 w-4 text-brand-600" />
          <h3 className="font-semibold text-neutral-950">集成</h3>
        </div>
        <div className="divide-y divide-line rounded-app border border-line">
          {["OpenAI", "本地资料库", "Mermaid 图表"].map((item) => (
            <div key={item} className="flex items-center justify-between px-3 py-2 text-sm">
              <span>{item}</span>
              <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">可用</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
