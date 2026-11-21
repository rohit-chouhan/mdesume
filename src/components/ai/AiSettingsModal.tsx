import {
  BrainCircuit,
  Check,
  CheckCircle2,
  Cpu,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Plus,
  Radio,
  Server,
  Sparkles,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useId, useState } from "react";
import { testAiProvider } from "@/lib/ai/client";
import {
  deleteAiProvider,
  getActiveAiProviderId,
  getAiProviders,
  saveAiProvider,
  setActiveAiProviderId,
} from "@/lib/ai/storage";
import {
  DEFAULT_MODELS_BY_PROVIDER,
  PROVIDER_LABELS,
  type AiProviderConfig,
  type AiProviderType,
} from "@/lib/ai/types";

export interface AiSettingsModalProps {
  open: boolean;
  onClose: () => void;
  onToast?: (message: string) => void;
}

function AiSettingsDialog({ onClose, onToast }: { onClose: () => void; onToast?: (message: string) => void }) {
  const [providers, setProviders] = useState<AiProviderConfig[]>(() => getAiProviders());
  const [activeId, setActiveId] = useState<string | null>(() => getActiveAiProviderId());
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [formProvider, setFormProvider] = useState<AiProviderType>("gemini");
  const [formName, setFormName] = useState("Gemini 2.5 Flash");
  const [formApiKey, setFormApiKey] = useState("");
  const [formBaseUrl, setFormBaseUrl] = useState("");
  const [formModel, setFormModel] = useState("gemini-2.5-flash");
  const [customModelInput, setCustomModelInput] = useState(false);
  const [formEnableThinking, setFormEnableThinking] = useState(false); // DEFAULT IS OFF
  const [formThinkingBudget, setFormThinkingBudget] = useState(2048);

  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const titleId = useId();

  const loadProviders = () => {
    const list = getAiProviders();
    setProviders(list);
    setActiveId(getActiveAiProviderId());
  };

  const resetFormForProvider = (providerType: AiProviderType) => {
    setFormProvider(providerType);
    const defaultModels = DEFAULT_MODELS_BY_PROVIDER[providerType];
    const firstModel = defaultModels[0]?.id || "";
    setFormModel(firstModel);
    setFormName(`${PROVIDER_LABELS[providerType].name} (${defaultModels[0]?.name.split(" ")[0] || "Default"})`);
    setFormBaseUrl(PROVIDER_LABELS[providerType].defaultBaseUrl || "");
    setCustomModelInput(false);
    setFormEnableThinking(false); // DEFAULT IS OFF
    setFormThinkingBudget(2048);
    setTestResult(null);
  };

  const handleStartAdd = () => {
    resetFormForProvider("gemini");
    setFormApiKey("");
    setEditingId(null);
    setIsEditing(true);
  };

  const handleStartEdit = (item: AiProviderConfig) => {
    setEditingId(item.id);
    setFormProvider(item.provider);
    setFormName(item.name);
    setFormApiKey(item.apiKey);
    setFormBaseUrl(item.baseUrl || "");
    setFormModel(item.model);
    setFormEnableThinking(item.enableThinking ?? false);
    setFormThinkingBudget(item.thinkingBudget || 2048);
    const isStandardModel = DEFAULT_MODELS_BY_PROVIDER[item.provider]?.some((m) => m.id === item.model);
    setCustomModelInput(!isStandardModel);
    setTestResult(null);
    setIsEditing(true);
  };

  const handleTestCurrent = async () => {
    if (!formApiKey.trim() && formProvider !== "custom") {
      setTestResult({ success: false, message: "Please enter an API Key first." });
      return;
    }
    setTesting(true);
    setTestResult(null);
    const candidate: AiProviderConfig = {
      id: editingId || `test-${crypto.randomUUID()}`,
      name: formName.trim() || PROVIDER_LABELS[formProvider].name,
      provider: formProvider,
      apiKey: formApiKey.trim(),
      baseUrl: formBaseUrl.trim() || undefined,
      model: formModel.trim(),
      enableThinking: formEnableThinking,
      thinkingBudget: formEnableThinking ? formThinkingBudget : undefined,
      createdAt: Date.now(),
    };
    const res = await testAiProvider(candidate);
    setTestResult(res);
    setTesting(false);
  };

  const handleSave = () => {
    if (!formApiKey.trim() && formProvider !== "custom") {
      onToast?.("Please provide an API key.");
      return;
    }
    const finalModel = formModel.trim();
    if (!finalModel) {
      onToast?.("Please specify a model name.");
      return;
    }

    const item: AiProviderConfig = {
      id: editingId || `ai-p-${crypto.randomUUID()}`,
      name: formName.trim() || PROVIDER_LABELS[formProvider].name,
      provider: formProvider,
      apiKey: formApiKey.trim(),
      baseUrl: formBaseUrl.trim() || undefined,
      model: finalModel,
      enableThinking: formEnableThinking,
      thinkingBudget: formEnableThinking ? formThinkingBudget : undefined,
      createdAt: Date.now(),
    };

    saveAiProvider(item);
    loadProviders();
    setIsEditing(false);
    setEditingId(null);
    onToast?.(`Saved AI provider "${item.name}".`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove AI provider "${name}"?`)) {
      deleteAiProvider(id);
      loadProviders();
      onToast?.(`Removed "${name}".`);
    }
  };

  const handleSelectActive = (id: string) => {
    setActiveAiProviderId(id);
    setActiveId(id);
    const p = providers.find((x) => x.id === id);
    onToast?.(`Active AI provider set to ${p?.name || "selected provider"}.`);
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
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
              <Sparkles size={18} />
            </span>
            <div>
              <h2 id={titleId} className="text-base font-bold text-slate-900 dark:text-white">
                AI Provider Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connect your AI providers (Gemini, OpenAI, Claude, Groq, Ollama) for instant resume generation & ATS audits.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-icon" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {!isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Configured Providers ({providers.length})
                </h3>
                <button
                  type="button"
                  onClick={handleStartAdd}
                  className="btn btn-primary btn-sm gap-1.5"
                >
                  <Plus size={14} />
                  <span>Add Provider</span>
                </button>
              </div>

              {providers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                  <BrainCircuit size={36} className="mx-auto text-slate-400" />
                  <h4 className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    No AI Providers Configured
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                    Add a Google Gemini, OpenAI, Claude, or local Ollama key to unlock AI resume drafting, ATS scoring, and conversational builder improvements.
                  </p>
                  <button
                    type="button"
                    onClick={handleStartAdd}
                    className="btn btn-primary btn-sm mt-4 gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Connect First Provider</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {providers.map((p) => {
                    const isActive = activeId === p.id;
                    return (
                      <div
                        key={p.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 transition-all ${
                          isActive
                            ? "border-brand-500 bg-brand-50/50 dark:border-brand-500/60 dark:bg-brand-500/10 shadow-xs"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/40"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => handleSelectActive(p.id)}
                            className="mt-0.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400"
                            title={isActive ? "Active provider" : "Click to make active"}
                          >
                            {isActive ? (
                              <CheckCircle2 size={18} className="text-brand-600 dark:text-brand-400" />
                            ) : (
                              <Radio size={18} />
                            )}
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-slate-900 dark:text-white">
                                {p.name}
                              </span>
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                {p.provider}
                              </span>
                              {isActive && (
                                <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                                  Active
                                </span>
                              )}
                              {p.enableThinking && (
                                <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                                  Thinking ON
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                              <span className="font-mono">{p.model}</span>
                              {p.baseUrl && <span className="text-[11px] font-mono">({p.baseUrl})</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(p)}
                            className="btn btn-secondary btn-sm text-xs"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id, p.name)}
                            className="btn-icon p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                            title="Delete provider"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingId ? "Edit AI Provider" : "Add AI Provider"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>

              {/* Provider Selection Buttons */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Provider Type
                </label>
                <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(["gemini", "openai", "anthropic", "groq", "custom"] as AiProviderType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => resetFormForProvider(type)}
                      className={`flex flex-col items-center justify-center rounded-lg border p-2.5 text-center text-xs transition-colors ${
                        formProvider === type
                          ? "border-brand-500 bg-brand-50 font-semibold text-brand-700 dark:border-brand-500 dark:bg-brand-500/20 dark:text-brand-300"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {type === "custom" ? <Server size={16} className="mb-1" /> : <Cpu size={16} className="mb-1" />}
                      <span className="capitalize">{type === "custom" ? "Ollama/Custom" : type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Provider Display Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Profile Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Gemini 2.5 Flash, Work Claude"
                  className="input mt-1 w-full text-xs"
                />
              </div>

              {/* API Key */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    API Key {formProvider === "custom" && <span className="text-slate-400 font-normal">(optional for local Ollama)</span>}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    {showApiKey ? <EyeOff size={12} /> : <Eye size={12} />}
                    <span>{showApiKey ? "Hide" : "Show"}</span>
                  </button>
                </div>
                <div className="relative mt-1">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={formApiKey}
                    onChange={(e) => setFormApiKey(e.target.value)}
                    placeholder={PROVIDER_LABELS[formProvider].placeholderKey}
                    className="input w-full pr-8 font-mono text-xs"
                  />
                  <KeyRound size={14} className="absolute right-2.5 top-2.5 text-slate-400" />
                </div>
              </div>

              {/* Base URL (for Custom / Ollama) */}
              {(formProvider === "custom" || formBaseUrl) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Base URL (OpenAI-Compatible endpoint)
                  </label>
                  <input
                    type="text"
                    value={formBaseUrl}
                    onChange={(e) => setFormBaseUrl(e.target.value)}
                    placeholder="http://localhost:11434/v1"
                    className="input mt-1 w-full font-mono text-xs"
                  />
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Default for Ollama is <code>http://localhost:11434/v1</code>.
                  </p>
                </div>
              )}

              {/* Model Selection */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Model
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomModelInput(!customModelInput)}
                    className="text-[11px] text-brand-600 hover:underline dark:text-brand-400"
                  >
                    {customModelInput ? "Choose from presets" : "Type custom model name"}
                  </button>
                </div>

                {customModelInput ? (
                  <input
                    type="text"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    placeholder="Enter exact model string (e.g. gpt-4o, llama-3.3-70b-versatile)"
                    className="input mt-1 w-full font-mono text-xs"
                  />
                ) : (
                  <select
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    className="select mt-1 w-full text-xs"
                  >
                    {DEFAULT_MODELS_BY_PROVIDER[formProvider].map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.supportsThinking ? "(Supports Thinking)" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Extended Thinking Option (Default is OFF) */}
              <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/80">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        Extended Thinking / Deep Reasoning
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                        Default: OFF
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Enables reasoning trace & thought budget for models like Gemini 2.5, Claude 3.7, o3-mini, and DeepSeek R1.
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={formEnableThinking}
                      onChange={(e) => setFormEnableThinking(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="peer h-5 w-9 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-purple-600 peer-checked:after:translate-x-full dark:bg-slate-700" />
                  </label>
                </div>

                {formEnableThinking && (
                  <div className="mt-3 border-t border-slate-100 pt-2.5 dark:border-slate-700/60">
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      Thinking Token Budget
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="number"
                        min="512"
                        max="16384"
                        step="512"
                        value={formThinkingBudget}
                        onChange={(e) => setFormThinkingBudget(Number(e.target.value) || 2048)}
                        className="input w-28 text-xs font-mono"
                      />
                      <span className="text-xs text-slate-500">tokens (default: 2048)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Test Connection Button & Result */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleTestCurrent()}
                    disabled={testing}
                    className="btn btn-secondary btn-sm gap-1.5 text-xs"
                  >
                    {testing ? <Loader2 size={13} className="animate-spin" /> : <BrainCircuit size={13} />}
                    <span>{testing ? "Testing Connection…" : "Test Connection"}</span>
                  </button>
                  <span className="text-[11px] text-slate-500">
                    Sends a 1-token test prompt directly to your provider.
                  </span>
                </div>

                {testResult && (
                  <div
                    className={`flex items-start gap-2 rounded-lg p-2.5 text-xs ${
                      testResult.success
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle size={16} className="shrink-0 text-rose-600 dark:text-rose-400" />
                    )}
                    <span className="flex-1 break-all">{testResult.message}</span>
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="btn btn-primary btn-sm gap-1.5"
                >
                  <Check size={14} />
                  <span>Save Provider</span>
                </button>
              </div>
            </div>
          )}

          {/* Privacy & BYOK Notice */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-900/30">
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              🔒 <strong>Strictly Local-First & BYOK:</strong> Your API keys are stored exclusively in your browser's local storage and used directly to make client-side requests to your AI provider. Keys are never sent to any mdesume server or external telemetry.
            </p>
          </div>
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

export default function AiSettingsModal({ open, onClose, onToast }: AiSettingsModalProps) {
  if (!open) return null;
  return <AiSettingsDialog onClose={onClose} onToast={onToast} />;
}
