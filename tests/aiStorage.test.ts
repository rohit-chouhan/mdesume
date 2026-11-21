import { beforeEach, describe, expect, it } from "vitest";
import {
  deleteAiProvider,
  getActiveAiProvider,
  getActiveAiProviderId,
  getAiProviders,
  saveAiProvider,
  setActiveAiProviderId,
} from "@/lib/ai/storage";
import type { AiProviderConfig } from "@/lib/ai/types";

describe("AI Storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const mockProvider: AiProviderConfig = {
    id: "test-gemini-1",
    name: "My Gemini Flash",
    provider: "gemini",
    apiKey: "AIzaSyFakeKey123",
    model: "gemini-2.5-flash",
    enableThinking: false, // default is off
    createdAt: 1700000000000,
  };

  it("returns empty array when no providers are stored", () => {
    expect(getAiProviders()).toEqual([]);
    expect(getActiveAiProvider()).toBeNull();
  });

  it("saves a new provider and automatically sets it as active if first", () => {
    saveAiProvider(mockProvider);
    const providers = getAiProviders();
    expect(providers).toHaveLength(1);
    expect(providers[0].name).toBe("My Gemini Flash");
    expect(providers[0].enableThinking).toBe(false);
    expect(getActiveAiProviderId()).toBe("test-gemini-1");
    expect(getActiveAiProvider()?.id).toBe("test-gemini-1");
  });

  it("updates an existing provider by ID without duplicating", () => {
    saveAiProvider(mockProvider);
    const updated: AiProviderConfig = {
      ...mockProvider,
      name: "Updated Gemini Pro",
      model: "gemini-2.5-pro",
      enableThinking: true,
      thinkingBudget: 4096,
    };
    saveAiProvider(updated);
    const providers = getAiProviders();
    expect(providers).toHaveLength(1);
    expect(providers[0].name).toBe("Updated Gemini Pro");
    expect(providers[0].model).toBe("gemini-2.5-pro");
    expect(providers[0].enableThinking).toBe(true);
    expect(providers[0].thinkingBudget).toBe(4096);
  });

  it("deletes a provider and re-assigns active ID cleanly", () => {
    const secondProvider: AiProviderConfig = {
      id: "test-claude-2",
      name: "My Claude Sonnet",
      provider: "anthropic",
      apiKey: "sk-ant-fake-key",
      model: "claude-3-7-sonnet-20250219",
      enableThinking: false,
      createdAt: 1700000001000,
    };
    saveAiProvider(mockProvider);
    saveAiProvider(secondProvider);

    expect(getAiProviders()).toHaveLength(2);
    setActiveAiProviderId("test-gemini-1");

    deleteAiProvider("test-gemini-1");
    expect(getAiProviders()).toHaveLength(1);
    expect(getAiProviders()[0].id).toBe("test-claude-2");
    expect(getActiveAiProvider()?.id).toBe("test-claude-2");
  });
});
