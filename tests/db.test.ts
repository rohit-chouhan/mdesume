import { describe, expect, it } from "vitest";
import { DEFAULT_STYLES, isResumeExport, normalizeStyles, type ResumeStyles } from "@/lib/db";
import { TEMPLATE_IDS } from "@/lib/themes";

describe("normalizeStyles", () => {
  it("fills in every missing key with updated defaults", () => {
    const styles = normalizeStyles(undefined);
    expect(styles).toEqual(DEFAULT_STYLES);
    expect(styles.h1Color).toBe("#306abb");
    expect(styles.h2Color).toBe("#306abb");
    expect(styles.h3Color).toBe("#306abb");
    expect(styles.textColor).toBe("#000000");
    expect(styles.linkColor).toBe("#0b4ca8");
    expect(styles.iconColor).toBe("#64748b");
    expect(styles.h1Size).toBe("23");
    expect(styles.h2Size).toBe("14");
    expect(styles.h3Size).toBe("12");
    expect(styles.textSize).toBe("10");
    expect(styles.fontFamily).toBe("'Cambria', serif");
    expect(styles.padding).toBe("1rem");
    expect(styles.margin).toBe("0.5rem");
    expect(styles.lineHeight).toBe("1.2");
    expect(styles.textAlign).toBe("justify");
    expect(styles.listColumns).toBe(1);
    expect(styles.pageSize).toBe("A4");
    expect(styles.template).toBe("compact");
    expect(styles.listSpacing).toBe("0");
    expect(styles.sectionSpacing).toBe("0.75rem");
    expect(styles.exportFormat).toBe("single");
    expect(styles.pdfScale).toBe(2);
    expect(styles.showLinkIcons).toBe(true);
    expect(styles.hideLinkUnderline).toBe(false);
  });

  it("migrates the legacy split export format", () => {
    expect(normalizeStyles({ exportFormat: "split" as never }).exportFormat).toBe("paginated");
  });

  it("accepts the current paginated format", () => {
    expect(normalizeStyles({ exportFormat: "paginated" }).exportFormat).toBe("paginated");
    expect(normalizeStyles({ exportFormat: "single" }).exportFormat).toBe("single");
  });

  it("clamps list columns and PDF scale", () => {
    expect(normalizeStyles({ listColumns: 9 }).listColumns).toBe(4);
    expect(normalizeStyles({ listColumns: 0 }).listColumns).toBe(1);
    expect(normalizeStyles({ listColumns: "3" as unknown as number }).listColumns).toBe(3);
    expect(normalizeStyles({ pdfScale: 9 }).pdfScale).toBe(3);
    expect(normalizeStyles({ pdfScale: 0.1 }).pdfScale).toBe(1);
  });

  it("repairs unknown templates and page sizes", () => {
    const styles = normalizeStyles({
      template: "not-a-theme",
      pageSize: "A5" as never,
      textAlign: "sideways" as never,
    });
    expect(TEMPLATE_IDS).toContain(styles.template);
    expect(styles.pageSize).toBe("A4");
    expect(styles.textAlign).toBe("left");
  });

  it("keeps valid custom values", () => {
    const input: Partial<ResumeStyles> = {
      template: "aurora",
      h1Color: "#123456",
      textSize: "11",
      pageSize: "Letter",
      textAlign: "justify",
    };
    const styles = normalizeStyles(input);
    expect(styles).toMatchObject(input);
  });
});

describe("isResumeExport", () => {
  const resume = {
    id: "1",
    title: "Test",
    markdown: "# Test",
    createdAt: 0,
    updatedAt: 0,
    styles: DEFAULT_STYLES,
  };

  it("accepts v1 and v2 backups", () => {
    expect(isResumeExport({ app: "mdesume", version: 1, exportedAt: "", resume })).toBe(true);
    expect(isResumeExport({ app: "mdesume", version: 2, exportedAt: "", resume })).toBe(true);
  });

  it("rejects unrelated files", () => {
    expect(isResumeExport(null)).toBe(false);
    expect(isResumeExport({})).toBe(false);
    expect(isResumeExport({ app: "other", version: 2, resume })).toBe(false);
    expect(isResumeExport({ app: "mdesume", version: 2, resume: {} })).toBe(false);
  });
});
