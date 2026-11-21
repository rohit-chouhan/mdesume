import {
  BrainCircuit,
  Check,
  CheckCircle2,
  Copy,
  Lightbulb,
  Loader2,
  RefreshCw,
  Settings,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import { callAi } from "@/lib/ai/client";
import { buildSystemPrompt } from "@/lib/ai/rag";
import { getActiveAiProvider } from "@/lib/ai/storage";
import type { AiProviderConfig } from "@/lib/ai/types";

export interface SuggestionItem {
  id: string;
  category: "Bullet Rewrite" | "New Content Idea" | "Layout & AST" | "Impact & Metrics";
  title: string;
  explanation: string;
  originalText?: string;
  suggestedText: string;
}

export interface AiImproveModalProps {
  open: boolean;
  onClose: () => void;
  markdown: string;
  onApplyMarkdown: (updatedMarkdown: string) => void;
  onOpenAiSettings?: () => void;
  onToast?: (message: string) => void;
}

function AiImproveDialog({
  onClose,
  markdown,
  onApplyMarkdown,
  onOpenAiSettings,
  onToast,
}: {
  onClose: () => void;
  markdown: string;
  onApplyMarkdown: (updatedMarkdown: string) => void;
  onOpenAiSettings?: () => void;
  onToast?: (message: string) => void;
}) {
  const [provider] = useState<AiProviderConfig | null>(() => getActiveAiProvider());
  const [loading, setLoading] = useState(() => Boolean(getActiveAiProvider()));
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [overallFeedback, setOverallFeedback] = useState<string>("");
  const [appliedIds, setAppliedIds] = useState<Set<string>>(() => new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const titleId = useId();

  const fetchSuggestions = useCallback(async (activeProvider: AiProviderConfig) => {
    const prompt = `
Analyze this resume and provide high-impact, actionable improvements:

Current Resume Markdown:
"""
${markdown}
"""

Focus on:
1. Bullet point rewrites to follow Google's XYZ formula: Accomplished [X] measured by [Y] doing [Z].
2. High-value content ideas or missing sections (e.g. system design, scale metrics, certifications).
3. mdesume directive enhancements (using ::row::, ::col-2::, ::badges::).

Respond ONLY with a valid JSON object matching this schema:
{
  "overallFeedback": "2-3 sentences on main opportunities to elevate this resume.",
  "suggestions": [
    {
      "id": "sug-1",
      "category": "Bullet Rewrite",
      "title": "Quantify backend performance improvement",
      "explanation": "Why this change makes the candidate stand out.",
      "originalText": "exact text in current resume to be replaced (or empty if new addition)",
      "suggestedText": "improved replacement text with metrics and active verbs"
    }
  ]
}
`;

    const systemPrompt = buildSystemPrompt({
      currentMarkdown: markdown,
      taskGoal: "Provide concrete suggestions to improve resume impact and metrics.",
    });

    const responseText = await callAi(
      activeProvider,
      [
        {
          role: "user",
          content: `${prompt}\n\nIMPORTANT: Respond with valid JSON only.`,
        },
      ],
      {
        systemPrompt,
        temperature: 0.5,
      },
    );

    let cleaned = responseText.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }

    return JSON.parse(cleaned) as { overallFeedback?: string; suggestions?: SuggestionItem[] };
  }, [markdown]);

  useEffect(() => {
    if (!provider) return;
    let cancelled = false;

    fetchSuggestions(provider)
      .then((parsed) => {
        if (cancelled) return;
        setOverallFeedback(parsed.overallFeedback || "");
        setSuggestions(parsed.suggestions || []);
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Failed to generate suggestions.";
        setError(msg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [provider, fetchSuggestions]);

  const handleManualRegenerate = async () => {
    if (!provider) return;
    setLoading(true);
    setError(null);
    try {
      const parsed = await fetchSuggestions(provider);
      setOverallFeedback(parsed.overallFeedback || "");
      setSuggestions(parsed.suggestions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate suggestions.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = (item: SuggestionItem) => {
    let nextMarkdown = markdown;
    if (item.originalText && nextMarkdown.includes(item.originalText)) {
      nextMarkdown = nextMarkdown.replace(item.originalText, item.suggestedText);
    } else {
      nextMarkdown = `${nextMarkdown}\n\n${item.suggestedText}`;
    }

    onApplyMarkdown(nextMarkdown);
    setAppliedIds((prev) => new Set(prev).add(item.id));
    onToast?.(`Applied: "${item.title}"`);
  };

  const handleCopyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      onToast?.("Copied to clipboard!");
    } catch {
      // ignore
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel max-w-2xl max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
              <Lightbulb size={18} />
            </span>
            <div>
              <h2 id={titleId} className="text-base font-bold text-slate-900 dark:text-white">
                AI Resume Improvement Suggestions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Actionable bullet point rewrites, quantified metrics, and impactful content ideas.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-icon" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          {!provider ? (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 text-xs dark:border-indigo-500/30 dark:bg-indigo-500/10">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BrainCircuit size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-indigo-900 dark:text-indigo-200">
                      Connect AI Provider for Intelligent Improvements
                    </p>
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5">
                      Configure Gemini, OpenAI, Claude, or Ollama to get custom bullet rewrites and quantified metrics.
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
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Powered by <strong>{provider.name}</strong> ({provider.model})
              </span>
              <button
                type="button"
                onClick={() => void handleManualRegenerate()}
                disabled={loading}
                className="flex items-center gap-1 font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                <span>Regenerate Suggestions</span>
              </button>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              <p className="font-semibold">Unable to generate suggestions</p>
              <p className="mt-0.5">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="rounded-xl border border-slate-200 p-8 text-center dark:border-slate-800">
              <Loader2 size={32} className="mx-auto animate-spin text-brand-600 dark:text-brand-400" />
              <p className="mt-3 text-xs font-semibold text-slate-800 dark:text-slate-200">
                Analyzing resume impact and wording…
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Finding opportunities for quantification, power phrasing, and missing sections.
              </p>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-4">
              {overallFeedback && (
                <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-3.5 text-xs text-brand-900 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-200">
                  <div className="flex items-center gap-2 font-semibold">
                    <Sparkles size={14} className="text-brand-600 dark:text-brand-400" />
                    <span>Executive Summary of Opportunities</span>
                  </div>
                  <p className="mt-1.5 leading-relaxed text-slate-700 dark:text-slate-300">
                    {overallFeedback}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {suggestions.map((item) => {
                  const applied = appliedIds.has(item.id);
                  const isCopied = copiedId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border p-4 transition-all ${
                        applied
                          ? "border-emerald-300 bg-emerald-50/40 dark:border-emerald-500/30 dark:bg-emerald-500/5"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {item.category}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              {item.title}
                            </h4>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            {item.explanation}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => void handleCopyText(item.id, item.suggestedText)}
                            className="btn btn-secondary btn-sm gap-1 text-[11px] px-2 py-1"
                            title="Copy suggestion"
                          >
                            {isCopied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                            <span>{isCopied ? "Copied" : "Copy"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplySuggestion(item)}
                            disabled={applied}
                            className={`btn btn-sm gap-1 text-[11px] px-2.5 py-1 ${
                              applied
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                                : "btn-primary"
                            }`}
                          >
                            {applied ? (
                              <>
                                <CheckCircle2 size={12} />
                                <span>Applied</span>
                              </>
                            ) : (
                              <>
                                <Wand2 size={12} />
                                <span>Apply to Resume</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Before / After Preview */}
                      <div className="mt-3 space-y-2 text-xs">
                        {item.originalText && (
                          <div className="rounded-lg bg-rose-50/70 p-2.5 text-rose-900 dark:bg-rose-500/10 dark:text-rose-200">
                            <span className="font-semibold text-[10px] uppercase text-rose-600 dark:text-rose-400 block mb-0.5">
                              Current Wording
                            </span>
                            <div className="font-mono text-[11px] opacity-90">{item.originalText}</div>
                          </div>
                        )}

                        <div className="rounded-lg bg-emerald-50/70 p-2.5 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200">
                          <span className="font-semibold text-[10px] uppercase text-emerald-600 dark:text-emerald-400 block mb-0.5">
                            Recommended High-Impact Rewrite
                          </span>
                          <div className="font-mono text-[11px]">{item.suggestedText}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/80">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AiImproveModal(props: AiImproveModalProps) {
  if (!props.open) return null;
  return <AiImproveDialog {...props} />;
}
