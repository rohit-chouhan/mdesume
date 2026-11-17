import { Check, Info, Printer, X } from "lucide-react";
import { useState } from "react";

export const PDF_NOTICE_STORAGE_KEY = "mdesume-hide-pdf-notice";

export interface PdfNoticeModalProps {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function PdfNoticeModal({ open, onConfirm, onClose }: PdfNoticeModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!open) return null;

  const handleContinue = () => {
    if (dontShowAgain && typeof window !== "undefined") {
      try {
        window.localStorage.setItem(PDF_NOTICE_STORAGE_KEY, "true");
      } catch {
        // Ignore localStorage errors in private mode
      }
    }
    onClose();
    onConfirm();
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel max-w-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-notice-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              <Printer size={18} />
            </span>
            <div>
              <h2 id="pdf-notice-title" className="text-base font-bold text-slate-900 dark:text-white">
                Save as Single-Page PDF
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Print dialog settings for a clean, single-page resume
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-icon" aria-label="Close instructions">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5 text-sm text-slate-600 dark:text-slate-300">
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Browsers cannot change your printer destination or margins automatically for security.
            Please verify these three settings in the print window:
          </p>

          <ol className="space-y-3">
            <li className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                1
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Destination: <span className="text-brand-600 dark:text-brand-400">Save as PDF</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Select &ldquo;Save as PDF&rdquo; (or &ldquo;Microsoft Print to PDF&rdquo;) instead of a physical printer.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                2
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Margins: <span className="text-brand-600 dark:text-brand-400">None</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Switch from &ldquo;Default&rdquo; to &ldquo;None&rdquo;. This prevents the browser from splitting your resume across multiple pages.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                3
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Options: <span className="text-brand-600 dark:text-brand-400">Background graphics</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Under &ldquo;More settings&rdquo;, make sure &ldquo;Background graphics&rdquo; is checked so theme colors and badges render.
                </p>
              </div>
            </li>
          </ol>

          <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            <Info size={15} className="shrink-0" />
            <span>If the preview freezes, press <kbd className="font-mono font-semibold">Ctrl + Shift + P</kbd> (or <kbd className="font-mono font-semibold">Cmd + Option + P</kbd>) for system print.</span>
          </div>

          <label className="flex cursor-pointer items-center gap-2 pt-1">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-xs text-slate-600 dark:text-slate-300">
              Don&apos;t show this guide again
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button type="button" onClick={handleContinue} className="btn btn-primary btn-sm">
            <Check size={14} /> Continue to Print
          </button>
        </div>
      </div>
    </div>
  );
}
