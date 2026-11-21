import { Check, Filter, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ResumeSheet from "@/components/ResumeSheet";
import type { ResumeStyles } from "@/lib/db";
import { THEMES } from "@/lib/themes";

const PREVIEW_MARKDOWN = `::align-center::
# Rohit Chouhan
_Full-Stack Software Engineer_

me@rohitchouhan.com · Gurugram, India
::end-align::

## Experience

::row::
**Adidas Marketing India** — Software Engineer
May 2024 – Present
::end-row::

- Architected AI FP&A platform with LLMs and RAG.
- Optimized calculation runtimes by 80%.

## Skills

::col-2::
- TypeScript, Node.js
- React, Next.js
- AWS, Docker
- PostgreSQL, Redis
::end-col::

## Education

**TU Berlin** — B.Sc. Computer Science
`;

export interface TemplateModalProps {
  open: boolean;
  onClose: () => void;
  styles: ResumeStyles;
  onSelect: (templateId: string) => void;
}

export default function TemplateModal({ open, onClose, styles, onSelect }: TemplateModalProps) {
  const [tag, setTag] = useState("All");

  const tags = useMemo(() => {
    const unique = new Set<string>();
    THEMES.forEach((theme) => theme.tags.forEach((value) => unique.add(value)));
    return ["All", ...Array.from(unique).sort()];
  }, []);

  const visible = useMemo(
    () => (tag === "All" ? THEMES : THEMES.filter((theme) => theme.tags.includes(tag))),
    [tag],
  );

  const previewStyles = useMemo<ResumeStyles>(
    () => ({
      ...styles,
      pageSize: "A4",
      padding: "1.6rem",
      textSize: "10",
      h1Size: "22",
      h2Size: "15",
      h3Size: "12",
      listColumns: 1,
    }),
    [styles],
  );

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

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel max-w-6xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 id="template-title" className="text-lg font-bold text-slate-900 dark:text-white">
              Choose a theme
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Every theme keeps your content and uses your colours and font.
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn-icon" aria-label="Close themes">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden border-b border-slate-200 px-5 py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden dark:border-slate-800">
          <Filter size={14} className="shrink-0 text-slate-400" aria-hidden="true" />
          {tags.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTag(value)}
              aria-pressed={tag === value}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                tag === value
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950 sm:p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((theme) => {
              const selected = styles.template === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    onSelect(theme.id);
                    onClose();
                  }}
                  className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border-2 bg-white text-left transition-all dark:bg-slate-900 ${
                    selected
                      ? "border-brand-500 shadow-md ring-4 ring-brand-500/10"
                      : "border-transparent shadow-sm hover:border-slate-300 hover:shadow-lg dark:hover:border-slate-700"
                  }`}
                >
                  {selected && (
                    <span className="absolute right-2 top-2 z-10 grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-white shadow">
                      <Check size={14} />
                    </span>
                  )}
                  <span className="relative block h-44 w-full overflow-hidden border-b border-slate-200 bg-white dark:border-slate-700">
                    <span
                      className="pointer-events-none absolute left-0 top-0 block"
                      style={{ width: 794, transform: "scale(0.32)", transformOrigin: "top left" }}
                      aria-hidden="true"
                    >
                      <ResumeSheet markdown={PREVIEW_MARKDOWN} styles={{ ...previewStyles, template: theme.id }} />
                    </span>
                    <span className="absolute inset-0 block bg-slate-900/0 transition-colors group-hover:bg-slate-900/5" />
                  </span>
                  <span className="block p-3">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{theme.name}</span>
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: theme.accent }}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="mt-1 block text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                      {theme.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
