"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

/**
 * Light/dark toggle. Uses `aria-label` for accessibility and avoids icon-only
 * ambiguity. The resolved theme is decided client-side (no-flash script runs on
 * initial load, localStorage thereafter), so we render a neutral placeholder
 * until mounted to avoid a server/client hydration mismatch on the icon/labels.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
    const { resolvedTheme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Defer theme-dependent markup until after hydration; the server and the
    // first client render both produce the neutral placeholder below.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => setMounted(true), []);

    const isDark = resolvedTheme === "dark";
    const ariaLabel = isDark ? "Switch to light theme" : "Switch to dark theme";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={mounted ? ariaLabel : "Toggle theme"}
            title={mounted ? ariaLabel : undefined}
            className={`inline-flex items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white ${className}`}
        >
            {/* Neutral icon on server/first paint; swapped to the real one after mount. */}
            {mounted ? (
                isDark ? <Sun size={18} /> : <Moon size={18} />
            ) : (
                <Sun size={18} aria-hidden="true" />
            )}
        </button>
    );
}
