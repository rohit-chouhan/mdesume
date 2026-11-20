import { Clock, Copy, FileText, Home, Loader2, Plus, Share2, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ShareModal from "@/components/builder/ShareModal";
import ThemeToggle from "@/components/ThemeToggle";
import { db, isResumeExport, type ResumeData } from "@/lib/db";
import { SAMPLE_MARKDOWN } from "@/lib/samples";
import { href } from "@/lib/site";
import { getTheme } from "@/lib/themes";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DashboardApp() {
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [sharingResume, setSharingResume] = useState<ResumeData | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadResumes = useCallback(async () => {
    try {
      setResumes(await db.getAllResumes());
    } catch {
      setImportError("Your local resume library could not be opened. Check that IndexedDB is enabled.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window.location.hash.startsWith("#share=") || window.location.hash.startsWith("#resume="))
    ) {
      window.location.replace(href(`/builder${window.location.hash}`));
      return;
    }

    let cancelled = false;
    db.getAllResumes()
      .then((data) => {
        if (!cancelled) setResumes(data);
      })
      .catch(() => {
        if (!cancelled) {
          setImportError("Your local resume library could not be opened. Check that IndexedDB is enabled.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openResume = (id: string) => {
    window.location.assign(href(`/builder?id=${id}`));
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const resume = await db.createNewResume("Untitled resume", SAMPLE_MARKDOWN);
      openResume(resume.id);
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    await db.duplicateResume(id);
    await loadResumes();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this resume? This cannot be undone.")) return;
    await db.deleteResume(id);
    await loadResumes();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImportError(null);
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isResumeExport(parsed)) {
        throw new Error("This file is not a valid mdesume backup.");
      }
      await db.importResume(parsed.resume);
      await loadResumes();
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "The backup could not be imported.");
    }
  };

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <a href={href("/")} className="brand">
            <span className="brand-mark">
              <FileText size={18} />
            </span>
            <span>mdesume</span>
          </a>
          <div className="flex items-center gap-1.5">
            <a href={href("/")} className="nav-link hidden sm:inline-flex">
              <Home size={16} /> Home
            </a>
            <a href={href("/guide")} className="nav-link hidden md:inline-flex">
              Guide
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container-page py-8 sm:py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Local library</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              My resumes
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400">
              Everything is stored in this browser with IndexedDB. Nothing is uploaded, and no account is needed.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json,.mdesume.json"
              onChange={(event) => void handleImportFile(event)}
              className="hidden"
              aria-label="Import a mdesume backup"
            />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-secondary">
              <Upload size={17} /> Import backup
            </button>
            <button type="button" onClick={() => void handleCreate()} disabled={creating} className="btn btn-primary">
              {creating ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />}
              New resume
            </button>
          </div>
        </div>

        {importError && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
          >
            {importError}
          </p>
        )}

        <div className="mt-8">
          {loading ? (
            <div className="grid place-items-center py-24">
              <div className="flex flex-col items-center gap-3">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600 dark:border-slate-800 dark:border-t-brand-400" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Loading your library…</p>
              </div>
            </div>
          ) : resumes.length === 0 ? (
            <div className="surface grid place-items-center px-6 py-20 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                <FileText size={26} />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No resumes yet</h2>
              <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                Start from a complete sample, then replace the content with your own Markdown.
              </p>
              <button type="button" onClick={() => void handleCreate()} className="btn btn-primary mt-5">
                <Plus size={17} /> Create your first resume
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resumes.map((resume) => {
                const theme = getTheme(resume.styles.template);
                return (
                  <article key={resume.id} className="surface group flex flex-col overflow-hidden">
                    <div
                      className="relative flex h-28 items-center justify-center overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${theme.accent}18, ${theme.accent}05)`,
                      }}
                    >
                      <span
                        className="grid h-12 w-12 place-items-center rounded-xl text-white shadow-sm"
                        style={{ backgroundColor: theme.accent }}
                      >
                        <FileText size={22} />
                      </span>
                      <span className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 shadow-sm dark:bg-slate-900/90 dark:text-slate-300">
                        {theme.name}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <button
                        type="button"
                        onClick={() => openResume(resume.id)}
                        className="cursor-pointer truncate text-left text-base font-semibold text-slate-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-300"
                      >
                        {resume.title || "Untitled resume"}
                      </button>
                      <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <Clock size={12} /> Updated {formatDate(resume.updatedAt)}
                      </p>

                      <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => openResume(resume.id)}
                          className="btn btn-secondary btn-sm flex-1"
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          onClick={() => setSharingResume(resume)}
                          className="btn-icon"
                          aria-label={`Share ${resume.title}`}
                          title="Share"
                        >
                          <Share2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDuplicate(resume.id)}
                          className="btn-icon"
                          aria-label={`Duplicate ${resume.title}`}
                          title="Duplicate"
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(resume.id)}
                          className="btn-icon hover:text-rose-600 dark:hover:text-rose-400"
                          aria-label={`Delete ${resume.title}`}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <p className="mt-10 text-center text-xs text-slate-400 dark:text-slate-500">
          {resumes.length > 0 ? `${resumes.length} resume${resumes.length === 1 ? "" : "s"} in this browser · ` : ""}
          Backups are portable JSON files you can import on any device.
        </p>
      </main>

      {sharingResume && (
        <ShareModal
          open={Boolean(sharingResume)}
          onClose={() => setSharingResume(null)}
          resume={sharingResume}
        />
      )}
    </div>
  );
}
