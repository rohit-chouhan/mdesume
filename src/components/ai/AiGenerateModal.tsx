import {
  ArrowRight,
  BrainCircuit,
  Loader2,
  Settings,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { useId, useState } from "react";
import { callAi } from "@/lib/ai/client";
import { buildSystemPrompt } from "@/lib/ai/rag";
import { getActiveAiProvider } from "@/lib/ai/storage";
import type { AiProviderConfig } from "@/lib/ai/types";
import { db } from "@/lib/db";
import { createStarterResume } from "@/lib/samples";
import { href } from "@/lib/site";
import { THEMES } from "@/lib/themes";

export interface AiGenerateModalProps {
  open: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onCreated: (resumeId: string) => void;
  onToast?: (message: string) => void;
}

function AiGenerateDialog({
  onClose,
  onOpenSettings,
  onCreated,
  onToast,
}: {
  onClose: () => void;
  onOpenSettings: () => void;
  onCreated: (resumeId: string) => void;
  onToast?: (message: string) => void;
}) {
  const [provider] = useState<AiProviderConfig | null>(() => getActiveAiProvider());
  const [candidateName, setCandidateName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [rawNotes, setRawNotes] = useState("");
  const [styleVibe, setStyleVibe] = useState("auto");
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const titleId = useId();

  const handleGenerate = async () => {
    if (!provider) {
      onOpenSettings();
      return;
    }

    if (!rawNotes.trim()) {
      setError("Please paste some career notes, work experience, or a bio.");
      return;
    }

    setGenerating(true);
    setError(null);
    setGenerationStep("Analyzing career profile and accomplishments…");

    try {
      const taskPrompt = `
Generate a complete, production-grade mdesume resume based on the following candidate information:
- Candidate Name: ${candidateName.trim() || "Candidate"}
- Target Role / Specialization: ${targetRole.trim() || "Software Engineer"}
- Preferred Style / Vibe: ${styleVibe}
- Background Notes & Accomplishments:
"""
${rawNotes.trim()}
"""

Requirements:
1. Auto-select the most fitting theme from: ${THEMES.map((t) => t.id).join(", ")}.
2. Format using mdesume directives:
   - Header with ::align-center::, # Name, ### _Role_, and contact line with icons.
   - Professional Summary.
   - Technical Skills with ::col-2:: ... ::end-col::.
   - Work Experience with ::row:: ... ::end-row:: for title and dates.
   - Bullet points starting with strong action verbs and quantified impact.
   - Education, Projects, and Languages/Certifications with ::badges::.
3. Return ONLY a valid JSON object with the following schema:
{
  "title": "Candidate Name — Role",
  "theme": "chosen_theme_id",
  "fontFamily": "Inter | Lora | Roboto | JetBrains Mono | Merriweather",
  "markdown": "complete mdesume markdown"
}
`;

      setGenerationStep("Drafting metric-driven resume with mdesume AST directives…");

      const systemPrompt = buildSystemPrompt({
        taskGoal: "Generate a full structured JSON resume matching mdesume format.",
      });

      const responseText = await callAi(
        provider,
        [
          {
            role: "user",
            content: `${taskPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON. Do not wrap in extra prose.`,
          },
        ],
        {
          systemPrompt,
          temperature: 0.7,
        },
      );

      setGenerationStep("Formatting and applying styling preferences…");

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

      const parsed = JSON.parse(cleaned);

      if (!parsed.markdown || typeof parsed.markdown !== "string") {
        throw new Error("AI did not return valid resume markdown.");
      }

      const resumeId = `resume-${crypto.randomUUID()}`;
      const resumeTitle = parsed.title || `${candidateName.trim() || "New"} — Resume`;
      const selectedTheme = parsed.theme || (styleVibe === "auto" ? "modern" : "classic");
      const selectedFont = parsed.fontFamily || "Inter";

      const newResume = createStarterResume(resumeId, resumeTitle, parsed.markdown, {
        template: selectedTheme,
        fontFamily: selectedFont,
      });

      await db.saveResume(newResume);

      onToast?.(`Resume "${resumeTitle}" created with ${selectedTheme} theme!`);
      onCreated(resumeId);
      window.location.href = href(`/builder?id=${encodeURIComponent(resumeId)}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate resume with AI.";
      setError(msg);
      setGenerating(false);
      setGenerationStep("");
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel max-w-2xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              <Wand2 size={18} />
            </span>
            <div>
              <h2 id={titleId} className="text-base font-bold text-slate-900 dark:text-white">
                Create Resume with AI
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Provide rough notes or career highlights — AI will write, format, and style your resume automatically.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-icon" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {provider ? (
            <div className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50/60 p-3 text-xs dark:border-brand-500/30 dark:bg-brand-500/10">
              <div className="flex items-center gap-2">
                <BrainCircuit size={16} className="text-brand-600 dark:text-brand-400" />
                <span>
                  Using <strong>{provider.name}</strong> ({provider.model})
                  {provider.enableThinking && <span className="ml-1 text-purple-600 dark:text-purple-300 font-semibold">• Thinking ON</span>}
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenSettings}
                className="flex items-center gap-1 font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                <Settings size={12} />
                <span>Change Provider</span>
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm">No AI Provider Connected</p>
                  <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">
                    Connect your Gemini, OpenAI, Claude, Groq, or Ollama key to generate resumes with AI.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="btn btn-primary btn-sm shrink-0 gap-1.5"
                >
                  <Sparkles size={13} />
                  <span>Connect AI Provider</span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
            >
              <p className="font-semibold">Generation Failed</p>
              <p className="mt-0.5">{error}</p>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Your Full Name
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="e.g. Rohit Chouhan"
                className="input mt-1 w-full text-xs"
                disabled={generating}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Role / Title
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer | AI Systems"
                className="input mt-1 w-full text-xs"
                disabled={generating}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Styling & Layout Preference
            </label>
            <select
              value={styleVibe}
              onChange={(e) => setStyleVibe(e.target.value)}
              className="select mt-1 w-full text-xs"
              disabled={generating}
            >
              <option value="auto">Auto-Detect Best Theme & Typography (Recommended)</option>
              <option value="modern-tech">Modern Engineering & Tech (Crisp rails, blue accent)</option>
              <option value="corporate-exec">Executive Leadership (Prestige serif, double rules)</option>
              <option value="product-agile">Product & Strategy (Disciplined corporate navy)</option>
              <option value="minimal-ats">High-Density Strict ATS (Single column, max parser score)</option>
              <option value="finance-corporate">Finance & Analytics (Emerald green, classic layout)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Your Background, Experience & Highlights
            </label>
            <textarea
              rows={6}
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              placeholder="Paste your rough bullet points, job duties, past companies, achievements, tech stack, or LinkedIn summary here...

Example:
- 6 years full-stack at Adidas and Deloitte
- Built SAP Analytics Cloud extensions used by 1,000+ daily users
- Led migration of 12 microservices to Kubernetes
- Stack: TypeScript, React, Python, Go, AWS, Docker
- Graduated BCA with 7.5 CGPA"
              className="input mt-1 w-full font-mono text-xs leading-relaxed"
              disabled={generating}
            />
            <p className="mt-1 text-[11px] text-slate-500">
              The AI automatically organizes these notes into quantified XYZ achievement bullets, technical skills columns, and theme styling.
            </p>
          </div>

          {generating && (
            <div className="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50/70 p-4 dark:border-brand-500/30 dark:bg-brand-500/10">
              <Loader2 size={24} className="animate-spin text-brand-600 dark:text-brand-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-brand-900 dark:text-brand-200">
                  Crafting your resume with AI…
                </p>
                <p className="text-[11px] text-brand-700 dark:text-brand-300 mt-0.5">
                  {generationStep}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={onClose}
            disabled={generating}
            className="btn btn-secondary btn-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={generating || !provider}
            className="btn btn-primary btn-sm gap-1.5"
          >
            {generating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Generating…</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Generate Resume</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AiGenerateModal(props: AiGenerateModalProps) {
  if (!props.open) return null;
  return <AiGenerateDialog {...props} />;
}
