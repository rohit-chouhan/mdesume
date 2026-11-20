import { Check, Copy, Download, ExternalLink, Loader2, QrCode, Share2, Smartphone, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import type { ResumeData } from "@/lib/db";
import { downloadTextFile, safeFilename } from "@/lib/download";
import {
  generateQrCodeSvg,
  generateShareUrl,
  isBrotliSupported,
  type CompressionFormat,
  type ShareUrlResult,
} from "@/lib/share";

export interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  resume: ResumeData;
  onToast?: (message: string) => void;
}

export default function ShareModal({ open, onClose, resume, onToast }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [brotliAvailable] = useState(() => (typeof window !== "undefined" ? isBrotliSupported() : false));
  const [format, setFormat] = useState<CompressionFormat>("deflate-raw");
  const [shareData, setShareData] = useState<ShareUrlResult | null>(null);
  const [showDirectUrl, setShowDirectUrl] = useState(false);
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();

  const generating = !shareData || shareData.format !== format;
  const activeUrl = showDirectUrl ? (shareData?.url ?? "") : (shareData?.displayUrl ?? "");

  const handleClose = () => {
    setCopied(false);
    setShowDirectUrl(false);
    setError(null);
    onClose();
  };

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    generateShareUrl(resume, { format })
      .then((result) => {
        if (cancelled) return;
        setShareData(result);
        const svg = generateQrCodeSvg(result.displayUrl);
        setQrSvg(svg);
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Could not create share URL.";
        setError(msg);
        onToast?.(msg);
      });

    return () => {
      cancelled = true;
    };
  }, [open, resume, format, onToast]);

  if (!open) return null;

  const handleCopy = async (customUrl?: string) => {
    const target = customUrl ?? activeUrl;
    if (!target) return;
    try {
      await navigator.clipboard.writeText(target);
      setCopied(true);
      onToast?.(customUrl ? "QR link copied to clipboard!" : showDirectUrl ? "Direct link copied to clipboard!" : "Share link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onToast?.("Could not copy to clipboard. Please copy manually.");
    }
  };

  const handleDownloadQr = () => {
    if (!qrSvg) return;
    downloadTextFile(
      safeFilename(resume.title, "resume-qr", ".svg"),
      qrSvg,
      "image/svg+xml",
    );
    onToast?.("QR Code downloaded as SVG.");
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={handleClose}>
      <div
        className="modal-panel max-w-xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              <Share2 size={18} />
            </span>
            <div>
              <h2 id="share-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                Share Resume
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share across devices with zero servers, accounts, or databases
              </p>
            </div>
          </div>
          <button type="button" onClick={handleClose} className="btn-icon" aria-label="Close share dialog">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
            >
              <p className="font-semibold">Unable to generate share link</p>
              <p className="mt-0.5">{error}</p>
            </div>
          )}

          {/* Format selection */}
          {brotliAvailable ? (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Compression algorithm</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {format === "deflate-raw"
                    ? "Deflate (Universal — 100% device & browser compatibility)"
                    : "Brotli (Ultra — supported on Safari 18.4+, Firefox 147+, Node/Bun)"}
                </p>
              </div>
              <div className="flex rounded-lg bg-slate-200 p-0.5 text-xs font-medium dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setFormat("deflate-raw")}
                  className={`rounded-md px-2.5 py-1 transition-colors ${
                    format === "deflate-raw"
                      ? "bg-white font-semibold text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Universal
                </button>
                <button
                  type="button"
                  onClick={() => setFormat("brotli")}
                  className={`rounded-md px-2.5 py-1 transition-colors ${
                    format === "brotli"
                      ? "bg-white font-semibold text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Brotli
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>
                Using <strong>Universal Stream Compression</strong> (Deflate-raw) for 100% compatibility across all phones & browsers.
              </span>
            </div>
          )}

          {/* Share link input & copy button */}
          <div>
            <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Shareable link
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                id={inputId}
                type="text"
                readOnly
                value={error ? "Unable to generate link" : (activeUrl || (generating ? "Generating compressed link…" : ""))}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="input min-w-0 flex-1 font-mono text-xs text-slate-700 select-all dark:text-slate-200"
              />
              <button
                type="button"
                onClick={() => void handleCopy()}
                disabled={generating || !activeUrl}
                className="btn btn-primary btn-sm shrink-0 gap-1.5"
              >
                {copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
              {activeUrl && (
                <a
                  href={activeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm shrink-0 px-2.5"
                  aria-label="Open link in new tab"
                  title="Open in new tab"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
              {shareData?.shortUrl ? (
                <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>{showDirectUrl ? "Viewing real direct URL" : "Shortened with zip1.io"}</span>
                </div>
              ) : shareData ? (
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span>Real direct URL (zip1.io unavailable)</span>
                </div>
              ) : null}

              {shareData?.shortUrl && (
                <button
                  type="button"
                  onClick={() => setShowDirectUrl((prev) => !prev)}
                  className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                >
                  {showDirectUrl ? "Show short link" : "Show real URL"}
                </button>
              )}
            </div>
          </div>

          {/* QR Code Section for mobile device transfer */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-5">
              <div className="relative grid h-44 w-44 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white p-2 shadow-xs dark:border-slate-700">
                {generating ? (
                  <div className="flex flex-col items-center p-3 text-center text-xs text-slate-500">
                    <Loader2 size={32} className="animate-spin text-brand-600 dark:text-brand-400" />
                    <span className="mt-2.5 font-medium">Generating QR code…</span>
                  </div>
                ) : qrSvg ? (
                  <div
                    className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                ) : (
                  <div className="flex flex-col items-center p-3 text-center text-xs text-slate-500">
                    <QrCode size={36} className="text-slate-300 dark:text-slate-600" />
                    <span className="mt-2">Payload too large for QR. Use the copy link above.</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                  <Smartphone size={13} />
                  <span>Instant Mobile Transfer</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Scan to open on your phone
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Point your phone camera at the QR code to open this resume directly in your mobile browser.
                  No sign-in, cloud storage, or cables required.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {qrSvg && (
                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      className="btn btn-secondary btn-sm gap-1.5 text-xs"
                    >
                      <Download size={13} />
                      Download QR Code
                    </button>
                  )}
                  {shareData?.shortUrl && (
                    <button
                      type="button"
                      onClick={() => void handleCopy(shareData.shortUrl!)}
                      className="btn btn-ghost btn-sm gap-1 text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                    >
                      <Copy size={12} />
                      Copy QR link
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Privacy note */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-900/30">
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              🔒 <strong>100% Private & Local-First:</strong> Resume data is compressed entirely inside the URL fragment (<code>#share=…</code>).
              Browser standards guarantee URL fragments are <strong>never sent to web servers</strong> in HTTP requests, keeping your personal data strictly on your devices.
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/80">
          <button type="button" onClick={handleClose} className="btn btn-secondary btn-sm">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
