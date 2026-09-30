import { expect, test, describe, vi, beforeEach } from "vitest";
import { db, isResumeExport, ResumeData, ResumeExport } from "../src/lib/db";

// Mock idb-keyval in memory for tests
const store: Record<string, unknown> = {};

vi.mock("idb-keyval", () => ({
  get: vi.fn(async (key: string) => store[key]),
  set: vi.fn(async (key: string, val: unknown) => {
    store[key] = val;
  }),
  del: vi.fn(async (key: string) => {
    delete store[key];
  }),
  keys: vi.fn(async () => Object.keys(store)),
}));

describe("Metadata & JSON Export/Import", () => {
  beforeEach(() => {
    for (const key of Object.keys(store)) {
      delete store[key];
    }
  });

  test("createNewResume initializes default metadata", async () => {
    const resume = await db.createNewResume("Software Engineer Resume", "# Test");
    expect(resume.metadata).toBeDefined();
    expect(resume.metadata?.title).toBe("Software Engineer Resume");
    expect(resume.metadata?.author).toBe("");
    expect(resume.metadata?.subject).toBe("");
    expect(resume.metadata?.keywords).toBe("");
    expect(resume.metadata?.creator).toBe("mdesume");
  });

  test("exportResume includes metadata in exported JSON object", async () => {
    const resume = await db.createNewResume("My Resume", "# My Resume");
    resume.metadata = {
      title: "Senior Full Stack Resume - Rohit Chouhan",
      author: "Rohit Chouhan",
      subject: "Senior Full Stack Software Engineer",
      keywords: "React, Node.js, Next.js, TypeScript",
      creator: "mdesume",
    };
    await db.saveResume(resume);

    const exported = await db.exportResume(resume.id);
    expect(exported).toBeDefined();
    expect(exported?.app).toBe("mdesume");
    expect(exported?.resume.metadata).toEqual({
      title: "Senior Full Stack Resume - Rohit Chouhan",
      author: "Rohit Chouhan",
      subject: "Senior Full Stack Software Engineer",
      keywords: "React, Node.js, Next.js, TypeScript",
      creator: "mdesume",
    });

    // Validate using isResumeExport
    expect(isResumeExport(exported)).toBe(true);
  });

  test("importResume preserves custom metadata from JSON backup", async () => {
    const backupResume: ResumeData = {
      id: "old-id-123",
      title: "Imported Resume",
      markdown: "# Imported",
      createdAt: 1000,
      updatedAt: 2000,
      styles: {
        h1Color: "#000",
        h2Color: "#000",
        h3Color: "#000",
        textColor: "#000",
        h1Size: "24",
        h2Size: "18",
        h3Size: "14",
        textSize: "12",
        fontFamily: "'Inter', sans-serif",
        padding: "2rem",
        margin: "1rem",
        lineHeight: "1.6",
        listColumns: 1,
        pageSize: "A4",
        template: "classic",
        listSpacing: "0.25rem",
        sectionSpacing: "1.5rem",
      },
      metadata: {
        title: "Custom PDF Title",
        author: "Jane Doe",
        subject: "Tech Lead",
        keywords: "Go, Kubernetes",
        creator: "mdesume",
      },
    };

    const imported = await db.importResume(backupResume);
    expect(imported.id).not.toBe("old-id-123");
    expect(imported.metadata?.title).toBe("Custom PDF Title");
    expect(imported.metadata?.author).toBe("Jane Doe");
    expect(imported.metadata?.subject).toBe("Tech Lead");
    expect(imported.metadata?.keywords).toBe("Go, Kubernetes");
  });

  test("importResume populates default metadata if backup has no metadata", async () => {
    const backupWithoutMeta: ResumeData = {
      id: "legacy-id",
      title: "Legacy Resume",
      markdown: "# Legacy",
      createdAt: 1000,
      updatedAt: 2000,
      styles: {
        h1Color: "#000",
        h2Color: "#000",
        h3Color: "#000",
        textColor: "#000",
        h1Size: "24",
        h2Size: "18",
        h3Size: "14",
        textSize: "12",
        fontFamily: "'Inter', sans-serif",
        padding: "2rem",
        margin: "1rem",
        lineHeight: "1.6",
        listColumns: 1,
        pageSize: "A4",
        template: "classic",
        listSpacing: "0.25rem",
        sectionSpacing: "1.5rem",
      },
    };

    const imported = await db.importResume(backupWithoutMeta);
    expect(imported.metadata).toBeDefined();
    expect(imported.metadata?.title).toBe("Legacy Resume");
    expect(imported.metadata?.creator).toBe("mdesume");
  });
});
