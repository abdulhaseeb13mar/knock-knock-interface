export type AiProviderName = "openai" | "anthropic" | "grok" | "deepseek";

export interface AiKeyRecord {
  provider: AiProviderName;
  priority: number;
  createdAt: string;
}

export interface SaveKeyResponse {
  success: true;
}

export interface SaveAiKeyInput {
  provider: AiProviderName;
  apiKey: string;
}
