export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "mdesume-theme";
const THEME_EVENT = "mdesume:themechange";

export function readTheme(): ThemeChoice {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

export function prefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveTheme(choice: ThemeChoice): ResolvedTheme {
  if (choice === "system") return prefersDark() ? "dark" : "light";
  return choice;
}

export function applyTheme(choice: ThemeChoice): ResolvedTheme {
  if (typeof document === "undefined") return "light";
  const resolved = resolveTheme(choice);
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
  root.dataset.theme = resolved;
  return resolved;
}

export function setTheme(choice: ThemeChoice): ResolvedTheme {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(THEME_STORAGE_KEY, choice);
  }
  const resolved = applyTheme(choice);
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: resolved }));
  return resolved;
}

export function getSnapshot(): ResolvedTheme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function subscribe(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onMediaChange = () => {
    if (readTheme() === "system") {
      applyTheme("system");
      listener();
    }
  };
  const onThemeChange = () => listener();

  media.addEventListener("change", onMediaChange);
  window.addEventListener(THEME_EVENT, onThemeChange as EventListener);

  return () => {
    media.removeEventListener("change", onMediaChange);
    window.removeEventListener(THEME_EVENT, onThemeChange as EventListener);
  };
}

export function toggleTheme(): ResolvedTheme {
  const next: ThemeChoice = getSnapshot() === "dark" ? "light" : "dark";
  return setTheme(next);
}
