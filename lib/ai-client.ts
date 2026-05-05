import {
  DEFAULT_AI_CONFIG,
  type AiRuntimeConfig,
  hasUsableAiConfig,
  normalizeAiConfig
} from "./ai-config";

export interface AiTextRequest {
  config?: Partial<AiRuntimeConfig> | null;
  system?: string;
  prompt?: string;
  messages?: Array<{ role: "user" | "assistant"; content: string }>;
  temperature?: number;
  maxTokens?: number;
}

function trimSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function endpoint(baseUrl: string, path: string) {
  const normalized = trimSlash(baseUrl.trim());
  if (normalized.endsWith(path)) return normalized;
  return `${normalized}${path}`;
}

function parseExtraHeaders(value: string) {
  const headers: Record<string, string> = {};
  for (const line of value.split(/\r?\n/)) {
    const index = line.indexOf(":");
    if (index <= 0) continue;
    const name = line.slice(0, index).trim();
    const headerValue = line.slice(index + 1).trim();
    if (name && headerValue) headers[name] = headerValue;
  }
  return headers;
}

function authHeaders(config: AiRuntimeConfig) {
  const headers: Record<string, string> = {};
  const name = config.authHeaderName || (config.kind === "anthropic" ? "x-api-key" : "Authorization");
  const value = config.authHeaderPrefix
    ? `${config.authHeaderPrefix} ${config.apiKey}`
    : config.apiKey;
  headers[name] = value;
  return headers;
}

function serverEnvConfig(): AiRuntimeConfig | null {
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";
  if (!apiKey) return null;

  const kind = process.env.AI_PROVIDER_KIND === "anthropic" ? "anthropic" : "openai-compatible";
  const baseUrl =
    process.env.AI_BASE_URL ||
    process.env.OPENAI_BASE_URL ||
    (kind === "anthropic" ? "https://api.anthropic.com/v1" : "https://api.openai.com/v1");

  return normalizeAiConfig({
    ...DEFAULT_AI_CONFIG,
    enabled: true,
    kind,
    presetId: kind === "anthropic" ? "anthropic" : "openai",
    apiKey,
    baseUrl,
    model:
      process.env.AI_MODEL ||
      process.env.OPENAI_MODEL ||
      (kind === "anthropic" ? "claude-3-5-sonnet-latest" : "gpt-4o-mini"),
    authHeaderName: process.env.AI_AUTH_HEADER_NAME || (kind === "anthropic" ? "x-api-key" : "Authorization"),
    authHeaderPrefix: process.env.AI_AUTH_HEADER_PREFIX ?? (kind === "anthropic" ? "" : "Bearer"),
    extraHeaders:
      process.env.AI_EXTRA_HEADERS || (kind === "anthropic" ? "anthropic-version: 2023-06-01" : "")
  });
}

function resolveConfig(config?: Partial<AiRuntimeConfig> | null) {
  if (hasUsableAiConfig(config)) return normalizeAiConfig(config);
  return serverEnvConfig();
}

function normalizeTextContent(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "text" in item) return String(item.text ?? "");
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

export async function generateAiText(request: AiTextRequest): Promise<string | null> {
  const config = resolveConfig(request.config);
  if (!config) return null;

  const temperature = request.temperature ?? config.temperature;
  const maxTokens = request.maxTokens ?? config.maxTokens;
  const userMessages = request.prompt
    ? [{ role: "user" as const, content: request.prompt }]
    : request.messages ?? [];

  if (config.kind === "anthropic") {
    const response = await fetch(endpoint(config.baseUrl, "/messages"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(config),
        ...parseExtraHeaders(config.extraHeaders || "anthropic-version: 2023-06-01")
      },
      body: JSON.stringify({
        model: config.model,
        system: request.system,
        messages: userMessages,
        temperature,
        max_tokens: maxTokens
      })
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.error?.message || data?.message || `Anthropic request failed: ${response.status}`);
    }
    return normalizeTextContent(data?.content);
  }

  const messages = request.system
    ? [{ role: "system", content: request.system }, ...userMessages]
    : userMessages;
  const response = await fetch(endpoint(config.baseUrl, "/chat/completions"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(config),
      ...parseExtraHeaders(config.extraHeaders)
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false
    })
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message || data?.message || `OpenAI-compatible request failed: ${response.status}`);
  }
  return normalizeTextContent(data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text);
}
