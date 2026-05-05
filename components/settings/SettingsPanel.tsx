"use client";

import { CheckCircle2, KeyRound, Link2, Save, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  AI_CONFIG_STORAGE_KEY,
  AI_PROVIDER_PRESETS,
  DEFAULT_AI_CONFIG,
  configFromPreset,
  hasUsableAiConfig,
  normalizeAiConfig,
  type AiRuntimeConfig
} from "@/lib/ai-config";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

function loadConfig() {
  if (typeof window === "undefined") return DEFAULT_AI_CONFIG;
  try {
    const raw = window.localStorage.getItem(AI_CONFIG_STORAGE_KEY);
    return normalizeAiConfig(raw ? JSON.parse(raw) : DEFAULT_AI_CONFIG);
  } catch {
    return DEFAULT_AI_CONFIG;
  }
}

export function SettingsPanel() {
  const [config, setConfig] = useState<AiRuntimeConfig>(DEFAULT_AI_CONFIG);
  const [saved, setSaved] = useState(false);
  const usable = useMemo(() => hasUsableAiConfig(config), [config]);

  useEffect(() => {
    setConfig(loadConfig());
  }, []);

  function update(patch: Partial<AiRuntimeConfig>) {
    setSaved(false);
    setConfig((current) => normalizeAiConfig({ ...current, ...patch }));
  }

  function choosePreset(presetId: string) {
    setSaved(false);
    setConfig((current) => configFromPreset(presetId, current));
  }

  function save() {
    const normalized = normalizeAiConfig(config);
    window.localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent("learnkata-ai-config-changed", { detail: normalized }));
    setConfig(normalized);
    setSaved(true);
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-brand-600" />
          <h3 className="font-semibold text-neutral-950">AI 接入</h3>
          <span className="ml-auto rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">
            {usable ? "已配置" : "本地兜底"}
          </span>
        </div>

        <div className="grid gap-3">
          <label className="flex items-center gap-2 text-sm text-neutral-800">
            <input
              type="checkbox"
              className="h-4 w-4 accent-neutral-950"
              checked={config.enabled}
              onChange={(event) => update({ enabled: event.target.checked })}
            />
            启用浏览器保存的 API 配置
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-800">
            <input
              type="checkbox"
              className="h-4 w-4 accent-neutral-950"
              checked={config.cloudFallback}
              onChange={(event) => update({ cloudFallback: event.target.checked })}
            />
            本地资料不足时允许云端模型补充
          </label>

          <label className="grid gap-1 text-sm">
            API 类型
            <select
              className="lk-focus rounded-app border border-line px-3 py-2"
              value={config.presetId}
              onChange={(event) => choosePreset(event.target.value)}
            >
              {AI_PROVIDER_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              格式
              <select
                className="lk-focus rounded-app border border-line px-3 py-2"
                value={config.kind}
                onChange={(event) =>
                  update({
                    kind: event.target.value as AiRuntimeConfig["kind"],
                    authHeaderName: event.target.value === "anthropic" ? "x-api-key" : "Authorization",
                    authHeaderPrefix: event.target.value === "anthropic" ? "" : "Bearer",
                    extraHeaders:
                      event.target.value === "anthropic"
                        ? "anthropic-version: 2023-06-01"
                        : config.extraHeaders
                  })
                }
              >
                <option value="openai-compatible">OpenAI-compatible</option>
                <option value="anthropic">Anthropic Messages</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              模型名称
              <input
                className="lk-focus rounded-app border border-line px-3 py-2"
                value={config.model}
                placeholder="gpt-4o-mini / deepseek-chat / claude..."
                onChange={(event) => update({ model: event.target.value })}
              />
            </label>
          </div>

          <label className="grid gap-1 text-sm">
            Base URL
            <input
              className="lk-focus rounded-app border border-line px-3 py-2"
              value={config.baseUrl}
              placeholder="https://api.openai.com/v1"
              onChange={(event) => update({ baseUrl: event.target.value })}
            />
          </label>

          <label className="grid gap-1 text-sm">
            API Key
            <input
              className="lk-focus rounded-app border border-line px-3 py-2"
              type="password"
              value={config.apiKey}
              placeholder="sk-..."
              onChange={(event) => update({ apiKey: event.target.value })}
            />
          </label>

          <details className="rounded-app border border-line p-3">
            <summary className="cursor-pointer text-sm font-medium text-neutral-800">高级兼容设置</summary>
            <div className="mt-3 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm">
                  鉴权 Header
                  <input
                    className="lk-focus rounded-app border border-line px-3 py-2"
                    value={config.authHeaderName}
                    onChange={(event) => update({ authHeaderName: event.target.value })}
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  Key 前缀
                  <input
                    className="lk-focus rounded-app border border-line px-3 py-2"
                    value={config.authHeaderPrefix}
                    placeholder="Bearer，Anthropic 可留空"
                    onChange={(event) => update({ authHeaderPrefix: event.target.value })}
                  />
                </label>
              </div>
              <label className="grid gap-1 text-sm">
                本地命中阈值
                <input
                  className="lk-focus rounded-app border border-line px-3 py-2"
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={config.localRelevanceThreshold}
                  onChange={(event) => update({ localRelevanceThreshold: Number(event.target.value) })}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm">
                  Max tokens
                  <input
                    className="lk-focus rounded-app border border-line px-3 py-2"
                    type="number"
                    min={256}
                    max={8192}
                    value={config.maxTokens}
                    onChange={(event) => update({ maxTokens: Number(event.target.value) })}
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  Temperature
                  <input
                    className="lk-focus rounded-app border border-line px-3 py-2"
                    type="number"
                    min={0}
                    max={2}
                    step={0.1}
                    value={config.temperature}
                    onChange={(event) => update({ temperature: Number(event.target.value) })}
                  />
                </label>
              </div>
              <label className="grid gap-1 text-sm">
                额外 Headers
                <textarea
                  className="lk-focus min-h-20 resize-none rounded-app border border-line px-3 py-2"
                  value={config.extraHeaders}
                  placeholder={"Header-Name: value\nanthropic-version: 2023-06-01"}
                  onChange={(event) => update({ extraHeaders: event.target.value })}
                />
              </label>
            </div>
          </details>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs leading-5 text-neutral-500">
              DeepSeek 官方和硅基流动通常选择 OpenAI-compatible；Anthropic 官方选择 Anthropic Messages。
            </p>
            <Button type="button" variant="primary" onClick={save}>
              <Save className="h-4 w-4" />
              {saved ? "已保存" : "保存"}
            </Button>
          </div>
        </div>
      </Card>

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
            <p className="mt-1 text-sm text-neutral-600">配置 API 后启用真实模型能力。</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="mb-4 flex items-center gap-2">
          <Link2 className="h-4 w-4 text-brand-600" />
          <h3 className="font-semibold text-neutral-950">集成</h3>
        </div>
        <div className="divide-y divide-line rounded-app border border-line">
          {["多模型 API", "本地资料库", "Mermaid 图表"].map((item) => (
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
