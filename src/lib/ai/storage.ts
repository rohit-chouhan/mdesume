import type { AiProviderConfig } from "./types";

const PROVIDERS_STORAGE_KEY = "mdesume_ai_providers_v1";
const ACTIVE_PROVIDER_STORAGE_KEY = "mdesume_active_ai_provider_id_v1";

let memoryProviders: AiProviderConfig[] = [];
let memoryActiveId: string | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getAiProviders(): AiProviderConfig[] {
  if (!isBrowser()) return memoryProviders;
  try {
    const raw = window.localStorage.getItem(PROVIDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAiProvider(provider: AiProviderConfig): void {
  const existing = getAiProviders();
  const index = existing.findIndex((p) => p.id === provider.id);
  let updated: AiProviderConfig[];
  if (index >= 0) {
    updated = [...existing];
    updated[index] = provider;
  } else {
    updated = [...existing, provider];
  }

  if (isBrowser()) {
    try {
      window.localStorage.setItem(PROVIDERS_STORAGE_KEY, JSON.stringify(updated));
      // Auto-set as active if this is the only provider or no active exists
      if (!getActiveAiProviderId() || updated.length === 1) {
        setActiveAiProviderId(provider.id);
      }
    } catch {
      // storage quota or disabled
    }
  } else {
    memoryProviders = updated;
    if (!memoryActiveId || updated.length === 1) {
      memoryActiveId = provider.id;
    }
  }
}

export function deleteAiProvider(id: string): void {
  const existing = getAiProviders();
  const updated = existing.filter((p) => p.id !== id);
  if (isBrowser()) {
    try {
      window.localStorage.setItem(PROVIDERS_STORAGE_KEY, JSON.stringify(updated));
      if (getActiveAiProviderId() === id) {
        const nextActive = updated.length > 0 ? updated[0].id : null;
        setActiveAiProviderId(nextActive);
      }
    } catch {
      // ignore
    }
  } else {
    memoryProviders = updated;
    if (memoryActiveId === id) {
      memoryActiveId = updated.length > 0 ? updated[0].id : null;
    }
  }
}

export function getActiveAiProviderId(): string | null {
  if (!isBrowser()) return memoryActiveId;
  try {
    return window.localStorage.getItem(ACTIVE_PROVIDER_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setActiveAiProviderId(id: string | null): void {
  if (isBrowser()) {
    try {
      if (id) {
        window.localStorage.setItem(ACTIVE_PROVIDER_STORAGE_KEY, id);
      } else {
        window.localStorage.removeItem(ACTIVE_PROVIDER_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  } else {
    memoryActiveId = id;
  }
}

export function getActiveAiProvider(): AiProviderConfig | null {
  const providers = getAiProviders();
  if (providers.length === 0) return null;
  const activeId = getActiveAiProviderId();
  if (!activeId) return providers[0];
  return providers.find((p) => p.id === activeId) || providers[0] || null;
}
