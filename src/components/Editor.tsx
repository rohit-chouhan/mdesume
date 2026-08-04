import MonacoEditor, { useMonaco } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

// Monaco fires internal "cancellation" rejections (e.g. when an async loader/
// worker op is superseded on (re)mount). These surface as an `unhandledRejection`
// with reason `{ type: 'cancelation', msg: 'operation is manually canceled' }`.
// We swallow them globally and once, attached at module load so the listener is
// live BEFORE Monaco's async init() can reject (a useEffect would attach too
// late, letting the rejection escape on first paint of the builder).
if (typeof window !== "undefined" && !(window as unknown as { __mdesumeMonacoRejectionGuard?: boolean }).__mdesumeMonacoRejectionGuard) {
  (window as unknown as { __mdesumeMonacoRejectionGuard?: boolean }).__mdesumeMonacoRejectionGuard = true;
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

export default function Editor({ value, onChange }: EditorProps) {
  const monaco = useMonaco();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mounted flag must be set in an effect so the server and first client
    // render match (hydration guard). State reads below are safe post-mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!monaco) return;
    // Define both themes once; the `theme` prop switches between them with no
    // light-then-dark flash (the old setTheme() here caused the flicker).
    monaco.editor.defineTheme("resumeLight", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "heading.md", fontStyle: "bold", foreground: "1d4ed8" },
        { token: "list.md", foreground: "7c3aed" },
        { token: "string.link.md", foreground: "059669" },
      ],
      colors: {
        "editor.background": "#ffffff",
        "editor.lineHighlightBackground": "#f1f5f9",
      },
    });
    monaco.editor.defineTheme("resumeDark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "heading.md", fontStyle: "bold", foreground: "60a5fa" },
        { token: "list.md", foreground: "a78bfa" },
        { token: "string.link.md", foreground: "34d399" },
      ],
      colors: {
        "editor.background": "#1e1e1e",
        "editor.lineHighlightBackground": "#2d2d30",
      },
    });
  }, [monaco]);

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <MonacoEditor
      height="100%"
      language="markdown"
      theme={resolvedTheme === "dark" ? "resumeDark" : "resumeLight"}
      value={value}
      onChange={(val) => onChange(val || "")}
      options={{
        minimap: { enabled: false },
        wordWrap: "on",
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        padding: { top: 16, bottom: 16 },
        fontSize: 14,
        fontFamily: "'Geist Mono', 'Fira Code', monospace",
        smoothScrolling: true,
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        formatOnPaste: true,
      }}
      loading={
        <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm">
          Loading editor...
        </div>
      }
    />
  );
}
