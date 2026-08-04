"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, ResumeData, isResumeExport } from "@/lib/db";
import { FileText, Plus, Trash2, Clock, Home, Upload } from "lucide-react";

export default function Dashboard() {
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const loadResumes = async () => {
    try {
      const data = await db.getAllResumes();
      setResumes(data);
    } catch (error) {
      console.error("Failed to load resumes", error);
    } finally {
      setLoading(false);
    }
  };

  // Load saved resumes once on mount.
  useEffect(() => {
    // Effect-driven data fetch from IndexedDB (client-only persistence).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadResumes();
  }, []);

  const handleCreateNew = async () => {
    const newResume = await db.createNewResume(
      "Untitled Resume",
      "# New Resume\n\nWrite your resume here in Markdown."
    );
    router.push(`/builder?id=${newResume.id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (confirm("Are you sure you want to delete this resume?")) {
      await db.deleteResume(id);
      await loadResumes();
    }
  };

  const handleImportClick = () => {
    setImportError(null);
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-importing the same file
    if (!file) return;
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      if (!isResumeExport(parsed)) {
        throw new Error("This file is not a valid mdesume backup.");
      }
      await db.importResume(parsed.resume);
      await loadResumes();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Failed to import backup.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-start mb-10">
          <div className="flex flex-col gap-3">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors group w-fit">
              <Home size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              Back to Home
            </Link>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">My Resumes</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Manage and build your markdown-powered resumes.</p>
              {importError && (
                <p className="text-red-600 text-sm mt-2" role="alert">{importError}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json,.mdesume.json"
              onChange={handleImportFile}
              className="hidden"
            />
            <button
              onClick={handleImportClick}
              className="flex items-center gap-2 bg-white border border-slate-300 hover:border-indigo-400 hover:text-indigo-600 text-slate-700 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-400"
            >
              <Upload size={18} />
              Import Backup
            </button>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 dark:shadow-indigo-950/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={20} />
              Create New
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300 shadow-sm dark:bg-slate-900 dark:border-slate-700">
            <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200">No resumes yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Create your first resume to get started.</p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={18} />
              Create Resume
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <Link
                key={resume.id}
                href={`/builder?id=${resume.id}`}
                className="group flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all overflow-hidden dark:bg-slate-900 dark:border-slate-700"
              >
                <div className="h-32 bg-slate-100 border-b border-slate-100 p-4 flex items-center justify-center relative group-hover:bg-blue-50/50 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:group-hover:bg-blue-950/40">
                  <FileText className="text-slate-300 group-hover:text-blue-300 transition-colors dark:text-slate-600 dark:group-hover:text-blue-400" size={48} />

                  <button
                    onClick={(e) => handleDelete(e, resume.id)}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-md text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all shadow-sm dark:bg-slate-800 dark:hover:bg-red-950/40"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg truncate text-slate-900 group-hover:text-primary transition-colors dark:text-white">
                    {resume.title}
                  </h3>
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-auto pt-3">
                    <Clock size={14} className="mr-1.5" />
                    Updated {new Date(resume.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
