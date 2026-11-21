import { buildSystemPrompt } from "./rag";
import type { AiCompletionOptions, AiMessage, AiProviderConfig } from "./types";

/**
 * Universal client-side AI dispatcher supporting Gemini, OpenAI, Anthropic, Groq, and Ollama/Custom.
 * Operates strictly local-first via direct browser fetch. No backend server required.
 */
export async function callAi(
  provider: AiProviderConfig,
  messages: AiMessage[],
  options?: AiCompletionOptions,
): Promise<string> {
  const systemPrompt = options?.systemPrompt || buildSystemPrompt();

  switch (provider.provider) {
    case "gemini":
      return callGemini(provider, messages, systemPrompt, options);
    case "anthropic":
      return callAnthropic(provider, messages, systemPrompt, options);
    case "openai":
    case "groq":
    case "custom":
    default:
      return callOpenAiCompatible(provider, messages, systemPrompt, options);
  }
}

async function callGemini(
  provider: AiProviderConfig,
  messages: AiMessage[],
  systemPrompt: string,
  options?: AiCompletionOptions,
): Promise<string> {
  const model = provider.model || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(provider.apiKey)}`;

  // Convert messages to Gemini contents
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  // Combine any system messages with the RAG system prompt
  const systemMessages = messages.filter((m) => m.role === "system").map((m) => m.content);
  const fullSystemPrompt = [systemPrompt, ...systemMessages].filter(Boolean).join("\n\n");

  const generationConfig: Record<string, unknown> = {
    temperature: options?.temperature ?? 0.7,
  };
  if (options?.maxTokens) {
    generationConfig.maxOutputTokens = options.maxTokens;
  }

  // Thinking configuration: default is OFF
  if (provider.enableThinking) {
    generationConfig.thinkingConfig = {
      thinkingBudget: provider.thinkingBudget ?? 2048,
    };
  } else {
    // Explicitly disable thinking
    generationConfig.thinkingConfig = {
      thinkingBudget: 0,
    };
  }

  const payload: Record<string, unknown> = {
    contents,
    systemInstruction: fullSystemPrompt ? { parts: [{ text: fullSystemPrompt }] } : undefined,
    generationConfig,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    let errorMsg = `Gemini API error (${res.status}): ${res.statusText}`;
    try {
      const errJson = JSON.parse(errorText);
      if (errJson.error?.message) {
        errorMsg = `Gemini: ${errJson.error.message}`;
      }
    } catch {
      // use text
    }
    throw new Error(errorMsg);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }
  return text;
}

async function callAnthropic(
  provider: AiProviderConfig,
  messages: AiMessage[],
  systemPrompt: string,
  options?: AiCompletionOptions,
): Promise<string> {
  const model = provider.model || "claude-3-7-sonnet-20250219";
  const baseUrl = provider.baseUrl?.replace(/\/+$/, "") || "https://api.anthropic.com";
  const url = `${baseUrl}/v1/messages`;

  const systemMessages = messages.filter((m) => m.role === "system").map((m) => m.content);
  const fullSystemPrompt = [systemPrompt, ...systemMessages].filter(Boolean).join("\n\n");

  const formattedMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  const payload: Record<string, unknown> = {
    model,
    max_tokens: options?.maxTokens ?? 4096,
    system: fullSystemPrompt,
    messages: formattedMessages,
  };

  // Thinking configuration: default is OFF
  if (provider.enableThinking) {
    payload.thinking = {
      type: "enabled",
      budget_tokens: provider.thinkingBudget ?? 2048,
    };
  } else if (options?.temperature !== undefined) {
    payload.temperature = options.temperature;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": provider.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    let errorMsg = `Anthropic API error (${res.status}): ${res.statusText}`;
    try {
      const errJson = JSON.parse(errorText);
      if (errJson.error?.message) {
        errorMsg = `Anthropic: ${errJson.error.message}`;
      }
    } catch {
      // use text
    }
    throw new Error(errorMsg);
  }

  const data = await res.json();
  const textBlock = data.content?.find((c: { type: string; text?: string }) => c.type === "text");
  if (!textBlock?.text) {
    throw new Error("Anthropic returned an empty response.");
  }
  return textBlock.text;
}

async function callOpenAiCompatible(
  provider: AiProviderConfig,
  messages: AiMessage[],
  systemPrompt: string,
  options?: AiCompletionOptions,
): Promise<string> {
  let baseUrl = provider.baseUrl?.replace(/\/+$/, "");
  if (!baseUrl) {
    if (provider.provider === "groq") {
      baseUrl = "https://api.groq.com/openai/v1";
    } else {
      baseUrl = "https://api.openai.com/v1";
    }
  }

  const url = `${baseUrl}/chat/completions`;

  const allMessages: AiMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  const payload: Record<string, unknown> = {
    model: provider.model,
    messages: allMessages,
  };

  if (options?.maxTokens) {
    payload.max_tokens = options.maxTokens;
  }

  // Thinking configuration: default is OFF
  if (provider.enableThinking) {
    // OpenAI o1/o3-mini uses reasoning_effort
    payload.reasoning_effort = "medium";
  } else if (options?.temperature !== undefined) {
    payload.temperature = options.temperature;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (provider.apiKey) {
    headers.Authorization = `Bearer ${provider.apiKey}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    let errorMsg = `AI Provider error (${res.status}): ${res.statusText}`;
    try {
      const errJson = JSON.parse(errorText);
      if (errJson.error?.message) {
        errorMsg = `${provider.name || "AI"}: ${errJson.error.message}`;
      }
    } catch {
      // use text
    }
    throw new Error(errorMsg);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("AI provider returned an empty response.");
  }
  return text;
}

/**
 * Validate connectivity and credentials for an AI provider by sending a lightweight prompt.
 */
export async function testAiProvider(
  provider: AiProviderConfig,
): Promise<{ success: boolean; message: string }> {
  try {
    const testMessages: AiMessage[] = [
      { role: "user", content: "Reply with the word 'OK' only." },
    ];
    const response = await callAi(provider, testMessages, {
      maxTokens: 10,
      temperature: 0,
      systemPrompt: "You are a connectivity test helper. Output 'OK'.",
    });

    if (response && response.length > 0) {
      return { success: true, message: `Connected successfully! Response: "${response.trim()}"` };
    }
    return { success: false, message: "Provider returned an empty response." };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Connection failed.";
    return { success: false, message: msg };
  }
}
