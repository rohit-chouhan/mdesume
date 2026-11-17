import { AlertTriangle, CheckCircle2, Sparkles, X, XCircle } from "lucide-react";
import { useEffect, useMemo } from "react";
import { analyzeResume } from "@/lib/analyzer";

export interface AnalyzerModalProps {
  open: boolean;
  onClose: () => void;
  markdown: string;
}

export default function AnalyzerModal({ open, onClose, markdown }: AnalyzerModalProps) {
  const result = useMemo(() => (open ? analyzeResume(markdown) : null), [open, markdown]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open || !result) return null;

  const tone =
    result.score >= 80
      ? { stroke: "text-emerald-500", label: "Excellent — highly optimised." }
      : result.score >= 60
        ? { stroke: "text-amber-500", label: "Good start, with room to improve." }
        : { stroke: "text-rose-500", label: "Needs work to stand out." };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel max-w-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="analyzer-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
              <Sparkles size={18} />
            </span>
            <div>
              <h2 id="analyzer-title" className="text-base font-bold text-slate-900 dark:text-white">
                Resume analysis
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Heuristic review of impact, structure and language.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-icon" aria-label="Close analysis">
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="relative grid h-28 w-28 place-items-center">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90" aria-hidden="true">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-200 dark:text-slate-700" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${result.score}, 100`}
                  className={tone.stroke}
                />
              </svg>
              <div className="absolute text-center">
                <span className="block text-3xl font-black tabular-nums text-slate-900 dark:text-white">
                  {result.score}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Score</span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{tone.label}</p>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Detailed feedback
            </h3>
            {result.feedback.map((item, index) => {
              const styles =
                item.type === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
                  : item.type === "warning"
                    ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
                    : "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200";
              return (
                <div key={`${item.type}-${index}`} className={`flex items-start gap-3 rounded-lg border p-3 ${styles}`}>
                  <span className="mt-0.5 shrink-0">
                    {item.type === "error" ? (
                      <XCircle size={16} className="text-rose-500" />
                    ) : item.type === "warning" ? (
                      <AlertTriangle size={16} className="text-amber-500" />
                    ) : (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm leading-snug">{item.message}</p>
                    {item.line !== undefined && <p className="mt-1 text-[11px] opacity-70">Line {item.line}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
