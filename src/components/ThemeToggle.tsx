import { Moon, Sun } from "lucide-react";
import { toggleTheme } from "@/lib/theme";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => toggleTheme()}
      aria-label="Toggle colour theme"
      title="Toggle colour theme"
      className={`btn-icon ${className}`.trim()}
    >
      <Sun size={18} className="hidden dark:block" aria-hidden="true" />
      <Moon size={18} className="block dark:hidden" aria-hidden="true" />
    </button>
  );
}
