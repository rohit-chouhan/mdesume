import {
  ArrowUp,
  Bot,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Settings,
  Sparkles,
  User,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { callAi } from "@/lib/ai/client";
import { buildSystemPrompt } from "@/lib/ai/rag";
import { getActiveAiProvider } from "@/lib/ai/storage";
import type { AiMessage, AiProviderConfig } from "@/lib/ai/types";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestedMarkdown?: string;
  applied?: boolean;
}

export interface AiChatDrawerProps {
  open: boolean;
  onClose: () => void;
  markdown: string;
  onApplyMarkdown: (updatedMarkdown: string) => void;
  onOpenAiSettings?: () => void;
  onToast?: (message: string) => void;
}

function AiChatDrawerContent({
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
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "msg-welcome",
      role: "assistant",
      content:
        "Hello! I'm your mdesume AI Resume Assistant. Tell me what you'd like to improve or add (e.g., *'Add a project called AskBot'*, *'Quantify my experience bullets with metrics'*, or *'Format skills into two columns'*).",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || loading) return;

    if (!provider) {
      onOpenAiSettings?.();
      return;
    }

    const userMsg: ChatMessage = {
      id: `msg-${crypto.randomUUID()}`,
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const systemPrompt = buildSystemPrompt({
        currentMarkdown: markdown,
        taskGoal: `The user wants to refine their resume. User instructions: "${text}".
If the request requires updating the resume, provide the full updated resume Markdown wrapped in a single \`\`\`markdown code block at the end of your response, accompanied by a concise explanation of the changes made.
Always use proper mdesume layout directives (::row::, ::col-2::, ::badges::, ::align-center::).`,
      });

      const apiMessages: AiMessage[] = messages
        .filter((m) => m.id !== "msg-welcome")
        .concat(userMsg)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const assistantReply = await callAi(provider, apiMessages, {
        systemPrompt,
        temperature: 0.6,
      });

      let extractedMarkdown: string | undefined;
      const mdFenceMatch = assistantReply.match(/```markdown\n([\s\S]*?)\n```/);
      if (mdFenceMatch && mdFenceMatch[1]) {
        extractedMarkdown = mdFenceMatch[1].trim();
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${crypto.randomUUID()}`,
        role: "assistant",
        content: assistantReply,
        suggestedMarkdown: extractedMarkdown,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error getting AI response.";
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${crypto.randomUUID()}`,
          role: "assistant",
          content: `⚠️ Error: ${msg}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyChanges = (msg: ChatMessage) => {
    if (!msg.suggestedMarkdown) return;
    onApplyMarkdown(msg.suggestedMarkdown);
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, applied: true } : m)),
    );
    onToast?.("Applied AI modifications to resume!");
  };

  const handleCopyMarkdown = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      onToast?.("Copied Markdown to clipboard!");
    } catch {
      // ignore
    }
  };

  const quickPrompts = [
    "Quantify bullets with XYZ metrics",
    "Add a high-impact AI project",
    "Format skills into ::col-2:: columns",
    "Make my summary punchier",
  ];

  return (
    <div
      className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform dark:border-slate-800 dark:bg-slate-900"
      role="dialog"
      aria-modal="true"
      aria-label="AI Resume Assistant"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
            <Sparkles size={16} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI Resume Assistant
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {provider ? `${provider.name} (${provider.model})` : "No AI Provider"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onOpenAiSettings && (
            <button
              type="button"
              onClick={onOpenAiSettings}
              className="btn-icon p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              title="AI Settings"
            >
              <Settings size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="btn-icon p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            aria-label="Close assistant"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 space-y-3.5 overflow-y-auto p-4 text-xs">
        {!provider && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-indigo-900 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
            <p className="font-semibold text-xs">AI Provider Needed</p>
            <p className="mt-0.5 text-[11px]">
              Connect Gemini, OpenAI, Claude, or local Ollama to use the assistant.
            </p>
            {onOpenAiSettings && (
              <button
                type="button"
                onClick={onOpenAiSettings}
                className="btn btn-primary btn-sm mt-2 text-xs gap-1"
              >
                <Settings size={12} />
                <span>Configure Provider</span>
              </button>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              {msg.role === "user" ? (
                <>
                  <span>You</span>
                  <User size={11} />
                </>
              ) : (
                <>
                  <Bot size={11} className="text-indigo-500" />
                  <span>mdesume AI</span>
                </>
              )}
            </div>

            <div
              className={`rounded-2xl px-3.5 py-2.5 max-w-[92%] leading-relaxed ${
                msg.role === "user"
                  ? "bg-brand-600 text-white dark:bg-brand-500"
                  : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700"
              }`}
            >
              <div className="whitespace-pre-wrap break-words">{msg.content}</div>

              {msg.suggestedMarkdown && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-700 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyChanges(msg)}
                    disabled={msg.applied}
                    className={`btn btn-sm gap-1 text-[11px] px-2.5 py-1 ${
                      msg.applied
                        ? "bg-emerald-600 text-white"
                        : "bg-brand-600 text-white hover:bg-brand-700"
                    }`}
                  >
                    {msg.applied ? <CheckCircle2 size={12} /> : <Wand2 size={12} />}
                    <span>{msg.applied ? "Applied to Resume" : "Apply to Resume"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCopyMarkdown(msg.id, msg.suggestedMarkdown!)}
                    className="btn btn-secondary btn-sm gap-1 text-[11px] px-2 py-1"
                  >
                    {copiedId === msg.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copiedId === msg.id ? "Copied" : "Copy Markdown"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-2">
            <Loader2 size={14} className="animate-spin text-indigo-500" />
            <span>Thinking and preparing changes…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="border-t border-slate-200/60 bg-slate-50/50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              type="button"
              disabled={loading || !provider}
              onClick={() => void handleSendMessage(qp)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-600 hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-500"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSendMessage();
        }}
        className="border-t border-slate-200 p-3 dark:border-slate-800"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              provider
                ? "Ask AI to edit, add, or refine anything…"
                : "Configure AI provider above to chat"
            }
            disabled={loading || !provider}
            className="input w-full pr-10 text-xs"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim() || !provider}
            className="absolute right-1.5 grid h-7 w-7 place-items-center rounded-md bg-brand-600 text-white transition-opacity disabled:opacity-30"
            aria-label="Send message"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <ArrowUp size={14} />}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AiChatDrawer(props: AiChatDrawerProps) {
  if (!props.open) return null;
  return <AiChatDrawerContent {...props} />;
}
