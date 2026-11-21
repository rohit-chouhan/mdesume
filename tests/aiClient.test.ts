import { afterEach, describe, expect, it, vi } from "vitest";
import { callAi, testAiProvider } from "@/lib/ai/client";
import type { AiProviderConfig } from "@/lib/ai/types";

describe("Universal AI Client Dispatcher", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("calls Gemini with correct payload and disables thinking when enableThinking is false", async () => {
    let capturedUrl = "";
    let capturedBody: Record<string, unknown> = {};

    globalThis.fetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      capturedUrl = url;
      capturedBody = JSON.parse(init?.body as string);
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [{ text: "Gemini response text" }],
              },
            },
          ],
        }),
        { status: 200 },
      );
    });

    const geminiConfig: AiProviderConfig = {
      id: "gemini-test",
      name: "Gemini Test",
      provider: "gemini",
      apiKey: "TEST_GEMINI_KEY",
      model: "gemini-2.5-flash",
      enableThinking: false, // Default is OFF
      createdAt: 1700000000000,
    };

    const result = await callAi(geminiConfig, [{ role: "user", content: "Hi" }]);
    expect(result).toBe("Gemini response text");
    expect(capturedUrl).toContain("generativelanguage.googleapis.com");
    expect(capturedUrl).toContain("key=TEST_GEMINI_KEY");
    // thinkingBudget should be 0 when thinking is disabled
    expect((capturedBody.generationConfig as { thinkingConfig: { thinkingBudget: number } }).thinkingConfig.thinkingBudget).toBe(0);
  });

  it("calls Gemini with thinkingBudget when enableThinking is true", async () => {
    let capturedBody: Record<string, unknown> = {};

    globalThis.fetch = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      capturedBody = JSON.parse(init?.body as string);
      return new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: "Thinking answer" }] } }],
        }),
        { status: 200 },
      );
    });

    const geminiConfig: AiProviderConfig = {
      id: "gemini-thinking-test",
      name: "Gemini Thinking",
      provider: "gemini",
      apiKey: "TEST_KEY",
      model: "gemini-2.5-pro",
      enableThinking: true,
      thinkingBudget: 4096,
      createdAt: 1700000000000,
    };

    await callAi(geminiConfig, [{ role: "user", content: "Solve complex reasoning" }]);
    expect((capturedBody.generationConfig as { thinkingConfig: { thinkingBudget: number } }).thinkingConfig.thinkingBudget).toBe(4096);
  });

  it("calls Anthropic with proper headers and direct browser access header", async () => {
    let capturedHeaders: HeadersInit | undefined;
    let capturedBody: Record<string, unknown> = {};

    globalThis.fetch = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      capturedHeaders = init?.headers;
      capturedBody = JSON.parse(init?.body as string);
      return new Response(
        JSON.stringify({
          content: [{ type: "text", text: "Claude response" }],
        }),
        { status: 200 },
      );
    });

    const claudeConfig: AiProviderConfig = {
      id: "claude-test",
      name: "Claude Test",
      provider: "anthropic",
      apiKey: "sk-ant-test-key",
      model: "claude-3-7-sonnet-20250219",
      enableThinking: false,
      createdAt: 1700000000000,
    };

    const res = await callAi(claudeConfig, [{ role: "user", content: "Hello" }]);
    expect(res).toBe("Claude response");
    const headers = capturedHeaders as Record<string, string>;
    expect(headers["x-api-key"]).toBe("sk-ant-test-key");
    expect(headers["anthropic-dangerous-direct-browser-access"]).toBe("true");
    expect(capturedBody.thinking).toBeUndefined();
  });

  it("tests connectivity via testAiProvider returning clean status", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "OK" } }],
        }),
        { status: 200 },
      ),
    );

    const openAiConfig: AiProviderConfig = {
      id: "openai-test",
      name: "OpenAI Test",
      provider: "openai",
      apiKey: "sk-test",
      model: "gpt-4o-mini",
      enableThinking: false,
      createdAt: 1700000000000,
    };

    const status = await testAiProvider(openAiConfig);
    expect(status.success).toBe(true);
    expect(status.message).toContain("OK");
  });
});
