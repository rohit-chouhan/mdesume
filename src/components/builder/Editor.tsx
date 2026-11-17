import MonacoEditor, { useMonaco } from "@monaco-editor/react";
import { useEffect } from "react";
import { useResolvedTheme } from "@/components/useResolvedTheme";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

// Monaco can reject an in-flight loader when the island remounts (for example
// after a hot reload). Those cancellations are not application errors.
if (typeof window !== "undefined") {
  const guard = window as typeof window & { __mdesumeMonacoGuard?: boolean };
  if (!guard.__mdesumeMonacoGuard) {
    guard.__mdesumeMonacoGuard = true;
    window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
      const reason = event.reason as { type?: string; msg?: string; message?: string } | null;
      if (
        reason &&
        (reason.type === "cancelation" ||
          reason.msg === "operation is manually canceled" ||
          reason.message === "operation is manually canceled")
      ) {
        event.preventDefault();
      }
    });
  }
}

export default function Editor({ value, onChange }: EditorProps) {
  const monaco = useMonaco();
  const theme = useResolvedTheme();

  useEffect(() => {
    if (!monaco) return;
    monaco.editor.defineTheme("mdesumeLight", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "heading.md", fontStyle: "bold", foreground: "3730a3" },
        { token: "list.md", foreground: "7c3aed" },
        { token: "string.link.md", foreground: "047857" },
      ],
      colors: {
        "editor.background": "#ffffff",
        "editor.lineHighlightBackground": "#f8fafc",
        "editorLineNumber.foreground": "#94a3b8",
      },
    });
    monaco.editor.defineTheme("mdesumeDark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "heading.md", fontStyle: "bold", foreground: "a5b4fc" },
        { token: "list.md", foreground: "c4b5fd" },
        { token: "string.link.md", foreground: "6ee7b7" },
      ],
      colors: {
        "editor.background": "#0f172a",
        "editor.lineHighlightBackground": "#1e293b",
        "editorLineNumber.foreground": "#64748b",
      },
    });
  }, [monaco]);

  return (
    <MonacoEditor
      height="100%"
      language="markdown"
      theme={theme === "dark" ? "mdesumeDark" : "mdesumeLight"}
      value={value}
      onChange={(next) => onChange(next ?? "")}
      options={{
        minimap: { enabled: false },
        wordWrap: "on",
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        padding: { top: 16, bottom: 24 },
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        smoothScrolling: true,
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        formatOnPaste: true,
        tabSize: 2,
        renderLineHighlight: "line",
        scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
      }}
      loading={
        <div className="flex h-full w-full items-center justify-center gap-2 text-sm text-slate-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
          Loading editor…
        </div>
      }
    />
  );
}
