import {
  ArrowLeft,
  BookOpen,
  Check,
  Eye,
  Maximize,
  PenLine,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ResumeSheet, { PAPER_HEIGHT_PX, PAPER_WIDTH_PX } from "@/components/ResumeSheet";
import ThemeToggle from "@/components/ThemeToggle";
import AnalyzerModal from "@/components/builder/AnalyzerModal";
import Customizer from "@/components/builder/Customizer";
import Editor from "@/components/builder/Editor";
import ExportMenu from "@/components/builder/ExportMenu";
import PdfNoticeModal, { PDF_NOTICE_STORAGE_KEY } from "@/components/builder/PdfNoticeModal";
import TemplateModal from "@/components/builder/TemplateModal";
import { db, type ExportLayout, type ResumeData } from "@/lib/db";
import { downloadTextFile, safeFilename } from "@/lib/download";
import { printResume } from "@/lib/print";
import { href } from "@/lib/site";
import { getTheme } from "@/lib/themes";

type MobileTab = "write" | "preview" | "design";

const nextFrame = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

export default function BuilderApp() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<MobileTab>("write");
  const [templateOpen, setTemplateOpen] = useState(false);
  const [analyzerOpen, setAnalyzerOpen] = useState(false);
  const [pdfNoticeOpen, setPdfNoticeOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [zoom, setZoom] = useState(1);
  const [fitToWidth, setFitToWidth] = useState(true);
  const [paperHeight, setPaperHeight] = useState<number>(PAPER_HEIGHT_PX.A4);

  const scrollRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef<ResumeData | null>(null);
  const pendingPrintLayoutRef = useRef<ExportLayout>("single");
  const saveTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3800);
  }, []);

  const flushSave = useCallback(async () => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    try {
      await db.saveResume(pending);
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    const onHide = () => {
      if (pendingRef.current) void flushSave();
    };
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      onHide();
    };
  }, [flushSave]);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
      window.location.replace(href("/dashboard"));
      return;
    }

    let cancelled = false;
    db.getResume(id)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setStatus("missing");
          return;
        }
        setResume(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("missing");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const updateResume = (updates: Partial<ResumeData>) => {
    if (!resume) return;
    const next = { ...resume, ...updates };
    setResume(next);
    setSaving(true);
    pendingRef.current = next;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      void flushSave();
    }, 600);
  };

  const pageSize = resume?.styles.pageSize ?? "A4";
  const paperWidth = PAPER_WIDTH_PX[pageSize];

  // Fit-to-width while the pane (or window) changes size.
  useEffect(() => {
    if (!fitToWidth) return;
    const element = scrollRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const usable = entry.contentRect.width - 40;
        const next = Math.min(1, Math.max(0.25, usable / paperWidth));
        setZoom((previous) => (Math.abs(previous - next) < 0.002 ? previous : next));
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
    // Re-run once the resume has loaded and the preview pane is actually mounted.
  }, [fitToWidth, paperWidth, status]);

  // Track the real document height so the scaled wrapper reserves the right space.
  useEffect(() => {
    const element = sheetRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      const height = element.offsetHeight;
      setPaperHeight((previous) => (Math.abs(previous - height) < 1 ? previous : height));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [status]);

  useEffect(
    () => () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    },
    [],
  );

  const revealPreview = useCallback(async () => {
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    setMobileTab("preview");
    await nextFrame();
  }, []);

  const executePrint = useCallback(
    async (layout: ExportLayout) => {
      if (!resume || busy) return;
      setBusy(true);
      try {
        await revealPreview();
        const element = sheetRef.current;
        if (!element) throw new Error("The preview is not ready yet — try again.");
        await printResume({
          element,
          title: (resume.metadata?.title || resume.title).trim() || "Resume",
          pageSize: resume.styles.pageSize,
          layout,
        });
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Could not open the print dialog.");
      } finally {
        setBusy(false);
      }
    },
    [busy, resume, revealPreview, showToast],
  );

  const handleDownloadPdf = useCallback(
    (layoutOverride?: ExportLayout) => {
      if (!resume || busy) return;
      const layout = layoutOverride ?? resume.styles.exportFormat ?? "single";

      if (layout === "single") {
        let hideNotice = false;
        try {
          hideNotice = window.localStorage.getItem(PDF_NOTICE_STORAGE_KEY) === "true";
        } catch {
          // ignore localStorage access errors
        }
        if (!hideNotice) {
          pendingPrintLayoutRef.current = layout;
          setPdfNoticeOpen(true);
          return;
        }
      }

      void executePrint(layout);
    },
    [busy, executePrint, resume],
  );

  const handleExportMarkdown = useCallback(() => {
    if (!resume) return;
    downloadTextFile(safeFilename(resume.title, "resume", ".md"), resume.markdown, "text/markdown");
    showToast("Markdown file downloaded.");
  }, [resume, showToast]);

  const handleExportBackup = useCallback(async () => {
    if (!resume) return;
    await flushSave();
    const backup = await db.exportResume(resume.id);
    if (!backup) {
      showToast("Backup could not be created.");
      return;
    }
    downloadTextFile(
      safeFilename(resume.metadata?.title || resume.title, "resume", ".mdesume.json"),
      JSON.stringify(backup, null, 2),
      "application/json",
    );
    showToast("Backup downloaded.");
  }, [flushSave, resume, showToast]);

  if (status === "loading") {
    return (
      <div className="grid min-h-dvh place-items-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <span className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600 dark:border-slate-800 dark:border-t-brand-400" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Opening your resume…</p>
        </div>
      </div>
    );
  }

  if (status === "missing" || !resume) {
    return (
      <div className="grid min-h-dvh place-items-center bg-slate-50 px-6 dark:bg-slate-950">
        <div className="surface max-w-md p-8 text-center">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Resume not found</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            It may have been deleted, or it lives in another browser profile. Resumes are stored locally in this
            browser.
          </p>
          <a href={href("/dashboard")} className="btn btn-primary mt-5">
            Back to your resumes
          </a>
        </div>
      </div>
    );
  }

  const theme = getTheme(resume.styles.template);
  const words = resume.markdown.trim() ? resume.markdown.trim().split(/\s+/).length : 0;
  const scaledWidth = Math.max(1, Math.round(paperWidth * zoom));
  const scaledHeight = Math.max(1, Math.round(paperHeight * zoom));

  const tabs: { id: MobileTab; label: string; icon: typeof PenLine }[] = [
    { id: "write", label: "Write", icon: PenLine },
    { id: "preview", label: "Preview", icon: Eye },
    { id: "design", label: "Design", icon: SlidersHorizontal },
  ];

  return (
    <div className="builder-shell flex flex-col overflow-hidden bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-200">
      <header className="z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-2.5 dark:border-slate-800 dark:bg-slate-900 sm:px-4">
        <div className="flex min-w-0 items-center gap-1.5">
          <a href={href("/dashboard")} className="btn-icon shrink-0" aria-label="Back to dashboard">
            <ArrowLeft size={18} />
          </a>
          <a
            href={href("/guide")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm hidden shrink-0 md:inline-flex"
          >
            <BookOpen size={15} /> Guide
          </a>
          <input
            type="text"
            value={resume.title}
            onChange={(event) => updateResume({ title: event.target.value })}
            aria-label="Resume title"
            placeholder="Resume title"
            className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1.5 text-sm font-semibold text-slate-900 outline-none transition-colors hover:border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:text-white dark:hover:border-slate-700 sm:max-w-xs"
          />
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <span className="hidden items-center gap-1.5 px-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:flex">
            {saving ? (
              <>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" /> Saving
              </>
            ) : (
              <>
                <Check size={13} className="text-emerald-500" /> Saved
              </>
            )}
          </span>
          <button
            type="button"
            onClick={() => setAnalyzerOpen(true)}
            className="btn btn-sm border border-brand-500/20 bg-brand-500/10 text-brand-700 hover:bg-brand-500/20 dark:text-brand-300"
            aria-label="Analyze resume"
          >
            <Sparkles size={14} />
            <span className="hidden md:inline">Analyze</span>
          </button>
          <ExportMenu
            busy={busy}
            defaultLayout={resume.styles.exportFormat}
            onPdf={(layout) => void handleDownloadPdf(layout)}
            onMarkdown={handleExportMarkdown}
            onBackup={() => void handleExportBackup()}
          />
          <ThemeToggle className="hidden sm:grid" />
          <button
            type="button"
            onClick={() => {
              if (window.matchMedia("(min-width: 1024px)").matches) setSidebarOpen((value) => !value);
              else setMobileTab("design");
            }}
            className={`btn-icon ${sidebarOpen ? "text-slate-900 dark:text-white" : ""}`}
            aria-label="Toggle customiser"
            aria-pressed={sidebarOpen}
          >
            <Settings2 size={18} />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <section
          className={`builder-pane min-w-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 ${
            mobileTab === "write" ? "flex" : "hidden"
          } lg:flex lg:w-[42%] xl:w-[40%]`}
          aria-label="Markdown editor"
        >
          <div className="flex h-9 shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
            <span>Markdown</span>
            <span className="normal-case tracking-normal">{words} words</span>
          </div>
          <div className="relative min-h-0 flex-1">
            <Editor value={resume.markdown} onChange={(value) => updateResume({ markdown: value })} />
          </div>
        </section>

        <section
          className={`builder-pane paper-stage relative min-w-0 flex-1 flex-col ${
            mobileTab === "preview" ? "flex" : "hidden"
          } lg:flex`}
          aria-label="Resume preview"
        >
          <div className="flex h-9 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/70 px-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
            <span>Preview</span>
            <span className="normal-case tracking-normal">
              {theme.name} · {pageSize}
            </span>
          </div>

          <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
            <div className="mx-auto" style={{ width: scaledWidth, height: scaledHeight }}>
              <div className="paper-zoom origin-top-left" style={{ width: paperWidth, transform: `scale(${zoom})` }}>
                <ResumeSheet
                  ref={sheetRef}
                  markdown={resume.markdown}
                  styles={resume.styles}
                  className="paper-shadow"
                />
              </div>
            </div>
            <div className="h-24 lg:h-10" aria-hidden="true" />
          </div>

          <div className="absolute bottom-24 right-4 z-20 flex items-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900 lg:bottom-5 lg:right-6">
            <button
              type="button"
              onClick={() => {
                setFitToWidth(false);
                setZoom((value) => Math.max(0.25, Number((value - 0.1).toFixed(2))));
              }}
              className="grid h-9 w-9 place-items-center text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              title="Zoom out"
              aria-label="Zoom out"
            >
              <ZoomOut size={16} />
            </button>
            <span className="grid min-w-12 place-items-center border-x border-slate-100 text-[11px] font-semibold tabular-nums text-slate-600 dark:border-slate-800 dark:text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => {
                setFitToWidth(false);
                setZoom((value) => Math.min(2, Number((value + 0.1).toFixed(2))));
              }}
              className="grid h-9 w-9 place-items-center text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <ZoomIn size={16} />
            </button>
            <button
              type="button"
              onClick={() => setFitToWidth(true)}
              className={`grid h-9 w-9 place-items-center border-l border-slate-100 transition-colors dark:border-slate-800 ${
                fitToWidth
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              }`}
              title="Fit to width"
              aria-label="Fit to width"
              aria-pressed={fitToWidth}
            >
              <Maximize size={16} />
            </button>
          </div>
        </section>

        <aside
          className={`builder-pane w-full shrink-0 border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 ${
            mobileTab === "design" ? "block" : "hidden"
          } ${sidebarOpen ? "lg:block lg:w-[340px]" : "lg:hidden"}`}
          aria-label="Customiser"
        >
          <Customizer
            styles={resume.styles}
            onChange={(styles) => updateResume({ styles })}
            metadata={resume.metadata ?? {}}
            onMetadataChange={(metadata) => updateResume({ metadata })}
            onOpenTemplates={() => setTemplateOpen(true)}
            onDownloadPdf={(layout) => void handleDownloadPdf(layout)}
            onExportMarkdown={handleExportMarkdown}
            onExportBackup={() => void handleExportBackup()}
            busy={busy}
          />
        </aside>
      </div>

      <nav
        className="z-30 grid shrink-0 grid-cols-3 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-slate-800 dark:bg-slate-900 lg:hidden"
        aria-label="Builder sections"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = mobileTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMobileTab(tab.id)}
              aria-pressed={active}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
                active ? "text-brand-600 dark:text-brand-400" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <TemplateModal
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        styles={resume.styles}
        onSelect={(template) => updateResume({ styles: { ...resume.styles, template } })}
      />
      <AnalyzerModal open={analyzerOpen} onClose={() => setAnalyzerOpen(false)} markdown={resume.markdown} />
      <PdfNoticeModal
        open={pdfNoticeOpen}
        onClose={() => setPdfNoticeOpen(false)}
        onConfirm={() => void executePrint(pendingPrintLayoutRef.current)}
      />
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}
