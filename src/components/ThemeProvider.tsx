"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
    theme: Theme;
    resolvedTheme: "light" | "dark";
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "mdesume-theme";

function getSystemTheme(): "light" | "dark" {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function readStoredTheme(): Theme {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system";
}

function resolveTheme(theme: Theme): "light" | "dark" {
    return theme === "system" ? getSystemTheme() : theme;
}

function applyTheme(resolved: "light" | "dark") {
    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    // Initialize both from the persisted choice. The no-flash script in layout.tsx
    // has already applied the matching .dark class to <html>, so there's no flicker
    // and no need to setState in an effect on mount.
    const [theme, setThemeState] = useState<Theme>(readStoredTheme);
    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
        resolveTheme(readStoredTheme())
    );

    // React to OS changes while in "system" mode (setState happens in the event
    // callback, not synchronously in the effect body).
    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = () => {
            if (theme === "system") {
                const next = getSystemTheme();
                setResolvedTheme(next);
                applyTheme(next);
            }
        };
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, [theme]);

    const setTheme = useCallback((next: Theme) => {
        setThemeState(next);
        localStorage.setItem(STORAGE_KEY, next);
        const resolved = resolveTheme(next);
        setResolvedTheme(resolved);
        applyTheme(resolved);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    }, [resolvedTheme, setTheme]);

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
    return ctx;
}
