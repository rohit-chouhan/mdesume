import { get, set, del, keys } from 'idb-keyval';

export interface ResumeData {
  id: string;
  title: string;
  markdown: string;
  createdAt: number;
  updatedAt: number;
  styles: ResumeStyles;
}

export interface ResumeStyles {
  h1Color: string;
  h2Color: string;
  h3Color: string;
  textColor: string;
  h1Size: string;
  h2Size: string;
  h3Size: string;
  textSize: string;
  fontFamily: string;
  padding: string;
  margin: string;
  lineHeight: string;
  textAlign?: string;
  listColumns: number;
  pageSize: 'A4' | 'Letter';
  template: 'classic' | 'modern' | 'minimalist' | 'elegant' | 'creative' | 'brutal' | 'aesthetic' | 'professional' | 'bold' | 'academic';
  listSpacing: string;
  sectionSpacing: string;
  exportFormat?: 'single' | 'split';
  showLinkIcons?: boolean;
  linkColor?: string;
  iconColor?: string;
  hideLinkUnderline?: boolean;
}

const DEFAULT_STYLES: ResumeStyles = {
  h1Color: '#1f2937',
  h2Color: '#374151',
  h3Color: '#4b5563',
  textColor: '#4b5563',
  h1Size: '24',
  h2Size: '18',
  h3Size: '14',
  textSize: '12',
  fontFamily: "'Inter', sans-serif",
  padding: '2rem',
  margin: '1rem',
  lineHeight: '1.6',
  textAlign: 'left',
  listColumns: 1,
  pageSize: 'A4',
  template: 'classic',
  listSpacing: '0.25rem',
  sectionSpacing: '1.5rem',
  exportFormat: 'single',
  showLinkIcons: true,
  linkColor: '#2563eb', // Default blue for links
  iconColor: '#64748b', // Default slate for icons
  hideLinkUnderline: true, // Default to hidden underline
};

export interface ResumeExport {
  app: "mdesume";
  version: 1;
  exportedAt: string;
  resume: ResumeData;
}

export function isResumeExport(value: unknown): value is ResumeExport {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const r = v.resume as Record<string, unknown> | undefined;
  return (
    v.app === "mdesume" &&
    v.version === 1 &&
    typeof r === "object" &&
    r !== null &&
    typeof r.markdown === "string" &&
    typeof r.styles === "object" &&
    r.styles !== null
  );
}

export const db = {
  async getResume(id: string): Promise<ResumeData | undefined> {
    return get(id);
  },

  async saveResume(resume: ResumeData): Promise<void> {
    resume.updatedAt = Date.now();
    await set(resume.id, resume);
  },

  async deleteResume(id: string): Promise<void> {
    await del(id);
  },

  async getAllResumes(): Promise<ResumeData[]> {
    const allKeys = await keys();
    const resumes: ResumeData[] = [];

    for (const key of allKeys) {
      if (typeof key === 'string') {
        const resume = await get<ResumeData>(key);
        if (resume) {
          resumes.push(resume);
        }
      }
    }

    return resumes.sort((a, b) => b.updatedAt - a.updatedAt);
  },

  async createNewResume(title: string, defaultMarkdown: string = ''): Promise<ResumeData> {
    const newResume: ResumeData = {
      id: crypto.randomUUID(),
      title,
      markdown: defaultMarkdown,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      styles: { ...DEFAULT_STYLES },
    };
    await set(newResume.id, newResume);
    return newResume;
  },

  async exportResume(id: string): Promise<ResumeExport | undefined> {
    const resume = await get<ResumeData>(id);
    if (!resume) return undefined;
    return {
      app: "mdesume",
      version: 1,
      exportedAt: new Date().toISOString(),
      resume,
    };
  },

  async importResume(resume: ResumeData): Promise<ResumeData> {
    // New id avoids clobbering an existing resume on the target device.
    const imported: ResumeData = {
      ...resume,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      styles: { ...DEFAULT_STYLES, ...resume.styles },
    };
    await set(imported.id, imported);
    return imported;
  }
};
