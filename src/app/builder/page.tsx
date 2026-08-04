"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { db, ResumeData } from "@/lib/db";
import { ArrowLeft, Save, Settings2, Download, ZoomIn, ZoomOut, Maximize, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";
import Editor from "@/components/Editor";
import Preview from "@/components/Preview";
import Customizer from "@/components/Customizer";
import AnalyzerModal from "@/components/AnalyzerModal";
import ThemeToggle from "@/components/ThemeToggle";

function BuilderContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAnalyzer, setShowAnalyzer] = useState(false);

  // Zoom state
  const [zoom, setZoom] = useState(1);
  const [fitToScreen, setFitToScreen] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Pending write + timer for the debounced IndexedDB save. Typing in the editor
  // fired a structured-clone + IDB transaction on EVERY keystroke, which is what
  // hammered the disk. We now coalesce those into one write per idle window.
  const pendingSaveRef = useRef<ResumeData | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushSave = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    const pending = pendingSaveRef.current;
    if (!pending) return;
    pendingSaveRef.current = null;
    await db.saveResume(pending);
    setSaving(false);
  }, []);

  // Never lose the last keystrokes: flush on unmount and on tab close.
  useEffect(() => {
    const onHide = () => {
      if (pendingSaveRef.current) void flushSave();
    };
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      onHide();
    };
  }, [flushSave]);

  const loadResume = useCallback(async (resumeId: string) => {
    const data = await db.getResume(resumeId);
    if (!data) {
      router.push("/dashboard");
      return;
    }
    // Ensure default page size exists
    if (!data.styles.pageSize) {
      data.styles.pageSize = 'A4';
    }
    setResume(data);
  }, [router]);

  useEffect(() => {
    if (id) {
      // Load the resume by id. Effect-driven because the data lives in
      // IndexedDB (client-only) and must be fetched after render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadResume(id);
    } else {
      router.push("/dashboard");
    }
  }, [id, router, loadResume]);

  useEffect(() => {
    if (!fitToScreen || !containerRef.current || !resume) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // 64px padding
        const usableWidth = entry.contentRect.width - 64;
        const isA4 = resume.styles.pageSize === 'A4' || !resume.styles.pageSize;
        // A4 width ~794px, Letter width ~816px (8.5 inches * 96dpi)
        const paperWidthPx = isA4 ? 794 : 816;
        const next = usableWidth < paperWidthPx ? usableWidth / paperWidthPx : 1;

        // Bail out when the change is sub-pixel: otherwise the observer and the
        // scale transform feed each other and re-render (and re-composite on the
        // GPU) continuously.
        setZoom((prev) => (Math.abs(prev - next) < 0.001 ? prev : next));
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [fitToScreen, resume?.styles.pageSize]);

  useEffect(() => {
    if (!resume || !previewRef.current) return;
    const styles = resume.styles;
    const root = previewRef.current;

    root.style.setProperty("--resume-h1-color", styles.h1Color);
    root.style.setProperty("--resume-h2-color", styles.h2Color);
    root.style.setProperty("--resume-h3-color", styles.h3Color || '#4b5563');
    root.style.setProperty("--resume-text-color", styles.textColor);
    root.style.setProperty("--resume-link-color", styles.linkColor || '#2563eb');
    root.style.setProperty("--resume-icon-color", styles.iconColor || '#64748b');

    root.style.setProperty("--resume-h1-size", `${styles.h1Size || '24'}pt`);
    root.style.setProperty("--resume-h2-size", `${styles.h2Size || '18'}pt`);
    root.style.setProperty("--resume-h3-size", `${styles.h3Size || '14'}pt`);
    root.style.setProperty("--resume-text-size", `${styles.textSize || '12'}pt`);

    root.style.setProperty("--resume-font", styles.fontFamily);
    root.style.setProperty("--resume-padding", styles.padding);
    root.style.setProperty("--resume-margin", styles.margin);
    root.style.setProperty("--resume-line-height", styles.lineHeight);
    root.style.setProperty("--resume-list-cols", styles.listColumns.toString());
    root.style.setProperty("--resume-list-spacing", styles.listSpacing || '0.25rem');
    root.style.setProperty("--resume-section-spacing", styles.sectionSpacing || '1.5rem');
    root.style.setProperty("--resume-text-align", styles.textAlign || 'left');

    // Page Sizing
    if (styles.pageSize === 'Letter') {
      root.style.setProperty("--resume-width", "8.5in");
      root.style.setProperty("--resume-height", "11in");
    } else {
      root.style.setProperty("--resume-width", "210mm");
      root.style.setProperty("--resume-height", "297mm");
    }
  }, [resume?.styles]);

  const updateResume = (updates: Partial<ResumeData>) => {
    if (!resume) return;
    const updated = { ...resume, ...updates };
    setResume(updated);
    setSaving(true);

    // Coalesce rapid edits (typing, dragging a colour/size slider) into a single
    // IndexedDB write once the user pauses.
    pendingSaveRef.current = updated;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void flushSave();
    }, 600);
  };

  const [printHeight, setPrintHeight] = useState(1123); // Default A4 height in pixels at 96dpi

  // Keep track of the actual pixel height of the resume to force a single long PDF page
  useEffect(() => {
    if (!previewRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const minHeight = resume?.styles.pageSize === 'Letter' ? 1056 : 1123;
        // Add a tiny buffer (2px) to prevent accidental overflow pagination
        const next = Math.max(entry.target.scrollHeight + 2, minHeight);
        // Only re-render when the height actually moved — this observer watches a
        // node whose own size depends on the rendered output.
        setPrintHeight((prev) => (prev === next ? prev : next));
      }
    });

    observer.observe(previewRef.current);
    return () => observer.disconnect();
  }, [resume?.styles.pageSize]);

  const handleExportPDF = useReactToPrint({
    contentRef: previewRef,
    documentTitle: resume ? resume.title.replace(/\s+/g, '_') : 'Resume',
  });

  const handleExportMD = () => {
    if (!resume) return;
    const blob = new Blob([resume.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resume.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportBackup = async () => {
    if (!resume) return;
    const backup = await db.exportResume(resume.id);
    if (!backup) return;
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resume.title.replace(/\s+/g, "_")}.mdesume.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate paper dimensions for the wrapper based on selected size
  const isA4 = resume.styles.pageSize !== 'Letter';
  const paperWidth = isA4 ? '210mm' : '8.5in';
  const paperHeight = isA4 ? '297mm' : '11in';

  return (
    <div className="h-screen flex flex-col bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200 overflow-hidden">
      {/* Top Navigation */}
      <header className="h-14 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors" aria-label="Back to dashboard">
            <ArrowLeft size={20} />
          </Link>
          <Link
            href="/guide"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-medium"
            aria-label="Open writing guide"
          >
            <BookOpen size={18} /> Guide
          </Link>
          <input
            type="text"
            value={resume.title}
            onChange={(e) => updateResume({ title: e.target.value })}
            className="bg-transparent border-none text-slate-900 dark:text-white font-medium focus:ring-0 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
            placeholder="Resume Title"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mr-2">
            {saving ? (
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Saving...</span>
            ) : (
              <span className="flex items-center gap-1.5"><Save size={14} /> Saved</span>
            )}
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

          <button onClick={() => setShowAnalyzer(true)} className="text-sm flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors cursor-pointer border border-indigo-500/20">
            <Sparkles size={14} /> Analyze
          </button>

          <button onClick={handleExportMD} className="text-sm flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer">
            <Download size={14} /> MD
          </button>

          <button onClick={handleExportPDF} className="text-sm flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer">
            <Download size={14} /> PDF
          </button>

          <button onClick={handleExportBackup} aria-label="Export full backup (content, styles, template)" className="text-sm flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer">
            <Download size={14} /> Export
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

          {/* Light/Dark theme toggle */}
          <ThemeToggle />

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-2 rounded transition-colors cursor-pointer ${showSidebar ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'}`}
          >
            <Settings2 size={18} />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">

        {/* Editor Column */}
        <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e1e1e] min-w-0 z-20 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.3)]">
          <div className="h-10 border-b border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-[#252526] flex items-center px-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            MARKDOWN
          </div>
          <div className="flex-1 relative">
            <Editor
              value={resume.markdown}
              onChange={(val) => updateResume({ markdown: val })}
            />
          </div>
        </div>

        {/* Preview Column */}
        <div className="flex-[1.5] flex flex-col bg-slate-200 dark:bg-slate-800/40 min-w-0 border-r border-slate-200 dark:border-slate-700 z-10 relative">

          {/* Zoom Toolbar */}
          <div className="absolute bottom-6 right-8 bg-white dark:bg-slate-900 shadow-lg rounded-full flex items-center border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
            <button
              onClick={() => { setFitToScreen(false); setZoom(Math.max(0.2, zoom - 0.1)); }}
              className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>
            <div className="px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 border-x border-slate-100 dark:border-slate-700 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </div>
            <button
              onClick={() => { setFitToScreen(false); setZoom(Math.min(2, zoom + 0.1)); }}
              className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>
            <button
              onClick={() => { setFitToScreen(true); }}
              className={`p-2.5 border-l border-slate-100 dark:border-slate-700 transition-colors ${fitToScreen ? 'text-primary bg-blue-50 dark:bg-blue-950/40' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'}`}
              title="Fit to Screen"
            >
              <Maximize size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-auto relative flex flex-col" ref={containerRef}>
            <div className="flex-1 flex justify-center py-10">
              <div
                className="origin-top transition-transform duration-100 ease-out"
                style={{
                  transform: `scale(${zoom})`,
                  width: paperWidth,
                  // Adjust margin bottom to offset the empty space left by scaling down
                  marginBottom: `calc((${zoom} - 1) * ${paperHeight})`
                }}
              >
                <div ref={previewRef} className="bg-white shadow-xl shadow-slate-300 ring-1 ring-slate-200">
                  <style type="text/css" media="print">
                    {`
                      @page { 
                        size: ${(!resume.styles.exportFormat || resume.styles.exportFormat === 'single')
                        ? `${resume.styles.pageSize === 'Letter' ? '8.5in' : '210mm'} ${printHeight}px`
                        : 'auto'} !important; 
                        margin: 0 !important; 
                      }
                      body { 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important; 
                      }
                    `}
                  </style>
                  <Preview
                    markdown={resume.markdown}
                    listColumns={resume.styles.listColumns}
                    template={resume.styles.template}
                    showLinkIcons={resume.styles.showLinkIcons}
                    hideLinkUnderline={resume.styles.hideLinkUnderline}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customization Panel */}
        {showSidebar && (
          <div className="w-80 bg-white text-slate-900 overflow-y-auto shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20">
            <Customizer
              styles={resume.styles}
              onChange={(styles) => updateResume({ styles })}
            />
          </div>
        )}
      </div>

      <AnalyzerModal
        isOpen={showAnalyzer}
        onClose={() => setShowAnalyzer(false)}
        markdown={resume.markdown}
      />
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <BuilderContent />
    </Suspense>
  );
}
