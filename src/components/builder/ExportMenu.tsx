import { FileJson, FileText, Loader2, Printer } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface ExportMenuProps {
  onPdf: (layout?: "single" | "paginated") => void;
  onMarkdown: () => void;
  onBackup: () => void;
  busy?: boolean;
  defaultLayout?: "single" | "paginated";
}

export default function ExportMenu({
  onPdf,
  onMarkdown,
  onBackup,
  busy = false,
  defaultLayout = "single",
}: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="btn btn-primary btn-sm sm:px-3.5 sm:py-2"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Export resume"
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Printer size={15} />}
        <span className="hidden sm:inline">{busy ? "Generating…" : "Export"}</span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Export options"
          className="animate-in absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => run(() => onPdf("single"))}
            className="flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Printer size={16} className="mt-0.5 shrink-0 text-brand-600 dark:text-brand-400" />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                Save as PDF (Single page)
                {defaultLayout === "single" && (
                  <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                    Default
                  </span>
                )}
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                Single continuous large page · no page breaks
              </span>
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => run(() => onPdf("paginated"))}
            className="flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Printer size={16} className="mt-0.5 shrink-0 text-slate-500 dark:text-slate-400" />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                Save as PDF (Multi-page)
                {defaultLayout === "paginated" && (
                  <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                    Default
                  </span>
                )}
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                Standard pages · auto-split / full print
              </span>
            </span>
          </button>
          <div className="my-1 h-px bg-slate-200 dark:bg-slate-800" />
          <button
            type="button"
            role="menuitem"
            onClick={() => run(onMarkdown)}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <FileText size={16} className="shrink-0 text-slate-500" />
            Markdown (.md)
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => run(onBackup)}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <FileJson size={16} className="shrink-0 text-slate-500" />
            Full backup (.json)
          </button>
        </div>
      )}
    </div>
  );
}
