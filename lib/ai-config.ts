export type AiProviderKind = "openai-compatible" | "anthropic";

export interface AiProviderPreset {
  id: string;
  name: string;
  kind: AiProviderKind;
  baseUrl: string;
  model: string;
  description: string;
}

export interface AiRuntimeConfig {
  enabled: boolean;
  presetId: string;
  kind: AiProviderKind;
  apiKey: string;
  baseUrl: string;
  model: string;
  authHeaderName: string;
  authHeaderPrefix: string;
  extraHeaders: string;
  maxTokens: number;
  temperature: number;
  cloudFallback: boolean;
  localRelevanceThreshold: number;
}

export const AI_CONFIG_STORAGE_KEY = "learnkata.ai.runtime-config.v1";

export const AI_PROVIDER_PRESETS: AiProviderPreset[] = [
  {
    id: "openai",
    name: "OpenAI",
    kind: "openai-compatible",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    description: "Official OpenAI Chat Completions compatible endpoint."
  },
  {
    id: "anthropic",
    name: "Anthropic",
    kind: "anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    model: "claude-3-5-sonnet-latest",
    description: "Official Anthropic Messages API endpoint."
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    kind: "openai-compatible",
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
    description: "DeepSeek official OpenAI-compatible API."
  },
  {
    id: "siliconflow",
    name: "SiliconFlow",
    kind: "openai-compatible",
    baseUrl: "https://api.siliconflow.cn/v1",
    model: "deepseek-ai/DeepSeek-V3",
    description: "SiliconFlow OpenAI-compatible model gateway."
  },
  {
    id: "custom-openai",
    name: "Custom OpenAI-compatible",
    kind: "openai-compatible",
    baseUrl: "https://example.com/v1",
    model: "model-name",
    description: "Any gateway that implements /chat/completions."
  }
];

export const DEFAULT_AI_CONFIG: AiRuntimeConfig = {
  enabled: false,
  presetId: "openai",
  kind: "openai-compatible",
  apiKey: "",
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-4o-mini",
  authHeaderName: "Authorization",
  authHeaderPrefix: "Bearer",
  extraHeaders: "",
  maxTokens: 1600,
  temperature: 0.2,
  cloudFallback: true,
  localRelevanceThreshold: 0.08
};

export function getAiPreset(id: string) {
  return AI_PROVIDER_PRESETS.find((preset) => preset.id === id) ?? AI_PROVIDER_PRESETS[0];
}

export function configFromPreset(id: string, current: AiRuntimeConfig = DEFAULT_AI_CONFIG): AiRuntimeConfig {
  const preset = getAiPreset(id);
  return {
    ...current,
    presetId: preset.id,
    kind: preset.kind,
    baseUrl: preset.baseUrl,
    model: preset.model,
    authHeaderName: preset.kind === "anthropic" ? "x-api-key" : "Authorization",
    authHeaderPrefix: preset.kind === "anthropic" ? "" : "Bearer",
    extraHeaders: preset.kind === "anthropic" ? "anthropic-version: 2023-06-01" : current.extraHeaders
  };
}

export function normalizeAiConfig(value: Partial<AiRuntimeConfig> | null | undefined): AiRuntimeConfig {
  return {
    ...DEFAULT_AI_CONFIG,
    ...value,
    enabled: Boolean(value?.enabled),
    presetId: value?.presetId || DEFAULT_AI_CONFIG.presetId,
    kind: value?.kind || DEFAULT_AI_CONFIG.kind,
    apiKey: value?.apiKey || "",
    baseUrl: (value?.baseUrl || DEFAULT_AI_CONFIG.baseUrl).trim(),
    model: (value?.model || DEFAULT_AI_CONFIG.model).trim(),
    authHeaderName: (value?.authHeaderName || DEFAULT_AI_CONFIG.authHeaderName).trim(),
    authHeaderPrefix: (value?.authHeaderPrefix ?? DEFAULT_AI_CONFIG.authHeaderPrefix).trim(),
    extraHeaders: value?.extraHeaders || "",
    maxTokens: Number(value?.maxTokens || DEFAULT_AI_CONFIG.maxTokens),
    temperature: Number(value?.temperature ?? DEFAULT_AI_CONFIG.temperature),
    cloudFallback: value?.cloudFallback ?? DEFAULT_AI_CONFIG.cloudFallback,
    localRelevanceThreshold: Number(
      value?.localRelevanceThreshold ?? DEFAULT_AI_CONFIG.localRelevanceThreshold
    )
  };
}

export function hasUsableAiConfig(config: Partial<AiRuntimeConfig> | null | undefined) {
  const normalized = normalizeAiConfig(config);
  return Boolean(normalized.enabled && normalized.apiKey && normalized.baseUrl && normalized.model);
}
