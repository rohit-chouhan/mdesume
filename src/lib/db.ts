import { get, set, del, keys } from "idb-keyval";
import { DEFAULT_TEMPLATE, isTemplateId } from "./themes";

export interface ResumeMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
}

export const DEFAULT_METADATA: ResumeMetadata = {
  title: "",
  author: "",
  subject: "",
  keywords: "",
  creator: "mdesume",
};

export type PageSize = "A4" | "Letter";
export type ExportLayout = "single" | "paginated";

export interface ResumeStyles {
  h1Color: string;
  h2Color: string;
  h3Color: string;
  textColor: string;
  linkColor: string;
  iconColor: string;
  h1Size: string;
  h2Size: string;
  h3Size: string;
  textSize: string;
  fontFamily: string;
  padding: string;
  margin: string;
  lineHeight: string;
  textAlign: "left" | "center" | "right" | "justify";
  listColumns: number;
  pageSize: PageSize;
  template: string;
  listSpacing: string;
  sectionSpacing: string;
  exportFormat: ExportLayout;
  pdfScale: number;
  showLinkIcons: boolean;
  hideLinkUnderline: boolean;
  metadata?: ResumeMetadata;
}

export interface ResumeData {
  id: string;
  title: string;
  markdown: string;
  createdAt: number;
  updatedAt: number;
  styles: ResumeStyles;
  metadata?: ResumeMetadata;
}

export const DEFAULT_STYLES: ResumeStyles = {
  h1Color: "#306abb",
  h2Color: "#306abb",
  h3Color: "#306abb",
  textColor: "#000000",
  linkColor: "#0b4ca8",
  iconColor: "#64748b",
  h1Size: "23",
  h2Size: "14",
  h3Size: "12",
  textSize: "10",
  fontFamily: "'Cambria', serif",
  padding: "1rem",
  margin: "0.5rem",
  lineHeight: "1.2",
  textAlign: "justify",
  listColumns: 1,
  pageSize: "A4",
  template: DEFAULT_TEMPLATE,
  listSpacing: "0",
  sectionSpacing: "0.75rem",
  exportFormat: "single",
  pdfScale: 2,
  showLinkIcons: true,
  hideLinkUnderline: false,
};

const clampNumber = (value: unknown, min: number, max: number, fallback: number): number => {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

/** Fill in missing style keys and fix values written by older versions. */
export function normalizeStyles(input: Partial<ResumeStyles> | undefined): ResumeStyles {
  const styles = { ...DEFAULT_STYLES, ...(input ?? {}) };

  const legacyFormat = (input as { exportFormat?: string } | undefined)?.exportFormat;
  const exportFormat: ExportLayout =
    legacyFormat === "split" || legacyFormat === "paginated" ? "paginated" : "single";

  const textAlign = ["left", "center", "right", "justify"].includes(styles.textAlign)
    ? styles.textAlign
    : "left";

  return {
    ...styles,
    template: isTemplateId(styles.template) ? styles.template : DEFAULT_TEMPLATE,
    pageSize: styles.pageSize === "Letter" ? "Letter" : "A4",
    textAlign,
    listColumns: Math.round(clampNumber(styles.listColumns, 1, 4, 1)),
    pdfScale: clampNumber(styles.pdfScale, 1, 3, 2),
    exportFormat,
    h1Color: styles.h1Color || DEFAULT_STYLES.h1Color,
    h2Color: styles.h2Color || DEFAULT_STYLES.h2Color,
    h3Color: styles.h3Color || DEFAULT_STYLES.h3Color,
    textColor: styles.textColor || DEFAULT_STYLES.textColor,
    linkColor: styles.linkColor || DEFAULT_STYLES.linkColor,
    iconColor: styles.iconColor || DEFAULT_STYLES.iconColor,
  };
}

export interface ResumeExport {
  app: "mdesume";
  version: 2;
  exportedAt: string;
  resume: ResumeData;
}

export function isResumeExport(value: unknown): value is ResumeExport | (Omit<ResumeExport, "version"> & { version: 1 }) {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  const resume = record.resume as Record<string, unknown> | undefined;
  return (
    record.app === "mdesume" &&
    (record.version === 1 || record.version === 2) &&
    typeof resume === "object" &&
    resume !== null &&
    typeof resume.markdown === "string" &&
    typeof resume.styles === "object" &&
    resume.styles !== null
  );
}

export const db = {
  async getResume(id: string): Promise<ResumeData | undefined> {
    const stored = await get<ResumeData>(id);
    if (!stored) return undefined;
    return {
      ...stored,
      styles: normalizeStyles(stored.styles),
      metadata: { ...DEFAULT_METADATA, ...(stored.metadata ?? {}) },
    };
  },

  async saveResume(resume: ResumeData): Promise<void> {
    await set(resume.id, { ...resume, updatedAt: Date.now() });
  },

  async deleteResume(id: string): Promise<void> {
    await del(id);
  },

  async getAllResumes(): Promise<ResumeData[]> {
    const allKeys = await keys();
    const resumes: ResumeData[] = [];
    for (const key of allKeys) {
      if (typeof key !== "string") continue;
      const resume = await get<ResumeData>(key);
      if (resume) {
        resumes.push({
          ...resume,
          styles: normalizeStyles(resume.styles),
          metadata: { ...DEFAULT_METADATA, ...(resume.metadata ?? {}) },
        });
      }
    }
    return resumes.sort((a, b) => b.updatedAt - a.updatedAt);
  },

  async createNewResume(title: string, markdown = ""): Promise<ResumeData> {
    const now = Date.now();
    const resume: ResumeData = {
      id: crypto.randomUUID(),
      title,
      markdown,
      createdAt: now,
      updatedAt: now,
      styles: { ...DEFAULT_STYLES },
      metadata: { ...DEFAULT_METADATA, title },
    };
    await set(resume.id, resume);
    return resume;
  },

  async duplicateResume(id: string): Promise<ResumeData | undefined> {
    const original = await get<ResumeData>(id);
    if (!original) return undefined;
    const now = Date.now();
    const copy: ResumeData = {
      ...original,
      id: crypto.randomUUID(),
      title: `${original.title} (copy)`,
      createdAt: now,
      updatedAt: now,
      styles: normalizeStyles(original.styles),
      metadata: {
        ...DEFAULT_METADATA,
        ...(original.metadata ?? {}),
        title: `${original.metadata?.title || original.title} (copy)`,
      },
    };
    await set(copy.id, copy);
    return copy;
  },

  async exportResume(id: string): Promise<ResumeExport | undefined> {
    const resume = await this.getResume(id);
    if (!resume) return undefined;
    return {
      app: "mdesume",
      version: 2,
      exportedAt: new Date().toISOString(),
      resume,
    };
  },

  async importResume(resume: ResumeData): Promise<ResumeData> {
    const now = Date.now();
    const imported: ResumeData = {
      ...resume,
      id: crypto.randomUUID(),
      title: resume.title || "Imported resume",
      createdAt: now,
      updatedAt: now,
      styles: normalizeStyles(resume.styles),
      metadata: {
        ...DEFAULT_METADATA,
        ...(resume.metadata ?? {}),
        title: resume.metadata?.title || resume.title || "Imported resume",
      },
    };
    await set(imported.id, imported);
    return imported;
  },
};
