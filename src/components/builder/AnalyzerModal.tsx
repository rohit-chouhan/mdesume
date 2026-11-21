import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Settings,
  Sparkles,
  Tag,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { runAiAtsScan, type AiAtsAnalysisResult } from "@/lib/ai/atsAnalyzer";
import { getActiveAiProvider } from "@/lib/ai/storage";
import type { AiProviderConfig } from "@/lib/ai/types";
import { analyzeResume } from "@/lib/analyzer";

export interface AnalyzerModalProps {
  open: boolean;
  onClose: () => void;
  markdown: string;
  onOpenAiSettings?: () => void;
}

function AnalyzerDialog({
  onClose,
  markdown,
  onOpenAiSettings,
}: {
  onClose: () => void;
  markdown: string;
  onOpenAiSettings?: () => void;
}) {
  const classicResult = useMemo(() => analyzeResume(markdown), [markdown]);
  const [provider] = useState<AiProviderConfig | null>(() => getActiveAiProvider());
  const [activeTab, setActiveTab] = useState<"ai" | "classic">(() => (getActiveAiProvider() ? "ai" : "classic"));
  const [aiResult, setAiResult] = useState<AiAtsAnalysisResult | null>(null);
  const [loadingAi, setLoadingAi] = useState(() => Boolean(getActiveAiProvider()));
  const [aiError, setAiError] = useState<string | null>(null);

  const fetchAiScan = useCallback(async (activeProvider: AiProviderConfig) => {
    return await runAiAtsScan(activeProvider, markdown);
  }, [markdown]);

  useEffect(() => {
    if (!provider) return;
    let cancelled = false;

    fetchAiScan(provider)
      .then((res) => {
        if (cancelled) return;
        setAiResult(res);
      })
      .catch((err) => {
        if (cancelled) return;
        setAiError(err instanceof Error ? err.message : "AI ATS scan failed.");
      })
      .finally(() => {
        if (!cancelled) setLoadingAi(false);
      });

    return () => {
      cancelled = true;
    };
  }, [provider, fetchAiScan]);

  const handleManualRescan = async () => {
    if (!provider) return;
    setLoadingAi(true);
    setAiError(null);
    try {
      const res = await fetchAiScan(provider);
      setAiResult(res);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "AI ATS scan failed.");
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
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
  }, [onClose]);

  const isAiTab = activeTab === "ai";
  const hasAiError = isAiTab && Boolean(aiError);
  const isAiLoading = isAiTab && loadingAi;

  let currentScore: number | string = classicResult.score;
  let tone = {
    stroke:
      classicResult.score >= 80
        ? "text-emerald-500"
        : classicResult.score >= 60
          ? "text-amber-500"
          : "text-rose-500",
    label:
      classicResult.score >= 80
        ? "Excellent — highly optimised."
        : classicResult.score >= 60
          ? "Good start, with room to improve."
          : "Needs work to stand out.",
  };

  if (isAiTab) {
    if (hasAiError) {
      currentScore = 0;
      tone = {
        stroke: "text-rose-500",
        label: "Scan failed — score unavailable.",
      };
    } else if (isAiLoading) {
      currentScore = "…";
      tone = {
        stroke: "text-brand-500",
        label: "Evaluating resume against ATS screening engines…",
      };
    } else if (aiResult) {
      currentScore = aiResult.score;
      tone =
        aiResult.score >= 80
          ? { stroke: "text-emerald-500", label: "Excellent — ATS optimized." }
          : aiResult.score >= 60
            ? { stroke: "text-amber-500", label: "Good start, with room to optimize." }
            : { stroke: "text-rose-500", label: "Needs optimization to pass enterprise ATS." };
    } else {
      currentScore = 0;
      tone = {
        stroke: "text-slate-400 dark:text-slate-600",
        label: "Ready to run AI ATS scan.",
      };
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel max-w-2xl max-h-[90vh] flex flex-col"
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
                Resume ATS Analyzer
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeTab === "ai"
                  ? `AI Deep Scan powered by ${provider?.name || "AI"} (${provider?.model || "model"})`
                  : "Rule-based heuristic review of impact, structure and language."}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-icon" aria-label="Close analysis">
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("ai")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "ai"
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <BrainCircuit size={14} />
              <span>AI ATS Deep Scan</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("classic")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "classic"
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <span>Classic Heuristics</span>
            </button>
          </div>

          {activeTab === "ai" && provider && (
            <button
              type="button"
              onClick={() => void handleManualRescan()}
              disabled={loadingAi}
              className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
            >
              <RefreshCw size={12} className={loadingAi ? "animate-spin" : ""} />
              <span>Re-scan</span>
            </button>
          )}
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          {/* Missing AI Provider Prompt */}
          {!provider && (
            <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/70 p-3.5 text-xs dark:border-indigo-500/30 dark:bg-indigo-500/10">
              <div className="flex items-center gap-2.5">
                <BrainCircuit size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <p className="font-semibold text-indigo-900 dark:text-indigo-200">
                    Unlock AI ATS Scoring & Keyword Gap Analysis
                  </p>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                    Connect Gemini, OpenAI, Claude, or local Ollama for deep parsing audits and Google XYZ feedback.
                  </p>
                </div>
              </div>
              {onOpenAiSettings && (
                <button
                  type="button"
                  onClick={onOpenAiSettings}
                  className="btn btn-primary btn-sm shrink-0 gap-1 text-xs"
                >
                  <Settings size={12} />
                  <span>Configure AI</span>
                </button>
              )}
            </div>
          )}

          {/* Score Gauge */}
          <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="relative grid h-28 w-28 place-items-center">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90" aria-hidden="true">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-slate-200 dark:text-slate-700"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${typeof currentScore === "number" ? currentScore : 0}, 100`}
                  className={tone.stroke}
                />
              </svg>
              <div className="absolute text-center">
                <span className="block text-3xl font-black tabular-nums text-slate-900 dark:text-white">
                  {currentScore}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {isAiTab ? "ATS Score" : "Score"}
                </span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {tone.label}
            </p>
            {activeTab === "ai" && aiResult?.summary && (
              <p className="text-xs text-center text-slate-500 max-w-md dark:text-slate-400">
                {aiResult.summary}
              </p>
            )}
          </div>

          {/* AI ATS Deep Scan Tab Content */}
          {activeTab === "ai" && (
            <>
              {loadingAi ? (
                <div className="rounded-xl border border-slate-200 p-8 text-center dark:border-slate-800">
                  <Loader2 size={32} className="mx-auto animate-spin text-brand-600 dark:text-brand-400" />
                  <p className="mt-3 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Evaluating resume against ATS screening engines…
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Checking metric density, action verbs, keyword frequencies, and AST structure.
                  </p>
                </div>
              ) : aiError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                  <p className="font-semibold">AI ATS Scan Failed</p>
                  <p className="mt-0.5">{aiError}</p>
                  <button
                    type="button"
                    onClick={() => void handleManualRescan()}
                    className="btn btn-secondary btn-sm mt-3 gap-1 text-xs"
                  >
                    <RefreshCw size={12} />
                    <span>Try Again</span>
                  </button>
                </div>
              ) : aiResult ? (
                <div className="space-y-5">
                  {/* Category Breakdown Bars */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                      ATS Criteria Breakdown
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {aiResult.categories.map((cat) => (
                        <div
                          key={cat.name}
                          className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/60"
                        >
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-800 dark:text-slate-200">{cat.name}</span>
                            <span
                              className={`tabular-nums font-bold ${
                                cat.score >= 80
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : cat.score >= 60
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {cat.score}%
                            </span>
                          </div>
                          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className={`h-1.5 rounded-full ${
                                cat.score >= 80
                                  ? "bg-emerald-500"
                                  : cat.score >= 60
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                              }`}
                              style={{ width: `${cat.score}%` }}
                            />
                          </div>
                          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                            {cat.summary}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Tag size={14} className="text-brand-600 dark:text-brand-400" />
                      <span>ATS Keyword Analysis</span>
                    </h3>
                    <div className="mt-3 space-y-2">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500">Detected Key Skills:</span>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {aiResult.detectedKeywords.map((kw) => (
                            <span
                              key={kw}
                              className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300"
                            >
                              ✓ {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                      {aiResult.missingKeywords.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[11px] font-semibold text-slate-500">
                            Recommended Target Keywords to Add:
                          </span>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {aiResult.missingKeywords.map((kw) => (
                              <span
                                key={kw}
                                className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300"
                              >
                                + {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Top Strengths */}
                  {aiResult.strengths.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        Key Strengths ({aiResult.strengths.length})
                      </h3>
                      <div className="space-y-1.5">
                        {aiResult.strengths.map((str, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5 text-xs text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                          >
                            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <span>{str}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Improvements */}
                  {aiResult.improvements.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        Priority ATS Fixes ({aiResult.improvements.length})
                      </h3>
                      <div className="space-y-2.5">
                        {aiResult.improvements.map((imp, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                          >
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                                {imp.category}
                              </span>
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                {imp.issue}
                              </span>
                            </div>
                            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                              {imp.suggestion}
                            </p>
                            {imp.example && (
                              <div className="mt-2 rounded bg-slate-50 p-2 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                <strong>Example:</strong> {imp.example}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </>
          )}

          {/* Classic Heuristic Tab Content */}
          {activeTab === "classic" && (
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Detailed feedback
              </h3>
              {classicResult.feedback.map((item, index) => {
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
          )}
        </div>
      </div>
    </div>
  );
}

export default function AnalyzerModal(props: AnalyzerModalProps) {
  if (!props.open) return null;
  return <AnalyzerDialog {...props} />;
}
