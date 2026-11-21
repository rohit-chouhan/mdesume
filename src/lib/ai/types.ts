export type AiProviderType = "gemini" | "openai" | "anthropic" | "groq" | "custom";

export interface AiProviderConfig {
  id: string;
  name: string;
  provider: AiProviderType;
  apiKey: string;
  baseUrl?: string;
  model: string;
  /** Whether extended thinking / reasoning is enabled. Default is false. */
  enableThinking: boolean;
  /** Optional token budget for thinking if enabled. */
  thinkingBudget?: number;
  createdAt: number;
}

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AiModelOption {
  id: string;
  name: string;
  supportsThinking?: boolean;
}

export const DEFAULT_MODELS_BY_PROVIDER: Record<AiProviderType, AiModelOption[]> = {
  gemini: [
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash (Recommended)", supportsThinking: true },
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro (Deep Reasoning)", supportsThinking: true },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (Fast)", supportsThinking: true },
  ],
  openai: [
    { id: "gpt-4o", name: "GPT-4o (Omni)", supportsThinking: false },
    { id: "gpt-4o-mini", name: "GPT-4o Mini (Fast & Affordable)", supportsThinking: false },
    { id: "o3-mini", name: "o3-mini (Reasoning)", supportsThinking: true },
    { id: "o1", name: "o1 (Deep Reasoning)", supportsThinking: true },
  ],
  anthropic: [
    { id: "claude-3-7-sonnet-20250219", name: "Claude 3.7 Sonnet (Hybrid Reasoning)", supportsThinking: true },
    { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", supportsThinking: false },
    { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku (Fast)", supportsThinking: false },
  ],
  groq: [
    { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B Versatile", supportsThinking: false },
    { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill Llama 70B (Reasoning)", supportsThinking: true },
    { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B 32k", supportsThinking: false },
  ],
  custom: [
    { id: "llama3", name: "Ollama: Llama 3", supportsThinking: false },
    { id: "deepseek-r1", name: "Ollama: DeepSeek R1 (Reasoning)", supportsThinking: true },
    { id: "mistral", name: "Ollama: Mistral", supportsThinking: false },
    { id: "custom-model", name: "Custom Model Name", supportsThinking: false },
  ],
};

export const PROVIDER_LABELS: Record<AiProviderType, { name: string; defaultBaseUrl?: string; placeholderKey: string }> = {
  gemini: {
    name: "Google Gemini",
    placeholderKey: "AIzaSy...",
  },
  openai: {
    name: "OpenAI",
    placeholderKey: "sk-proj-...",
  },
  anthropic: {
    name: "Anthropic Claude",
    placeholderKey: "sk-ant-...",
  },
  groq: {
    name: "Groq",
    placeholderKey: "gsk_...",
  },
  custom: {
    name: "Ollama / OpenAI-Compatible",
    defaultBaseUrl: "http://localhost:11434/v1",
    placeholderKey: "ollama (or empty if not needed)",
  },
};
