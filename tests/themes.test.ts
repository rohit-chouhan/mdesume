import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_TEMPLATE, getTheme, isTemplateId, TEMPLATE_IDS, THEMES } from "@/lib/themes";

const css = readFileSync(path.join(process.cwd(), "src", "styles", "global.css"), "utf8");

describe("theme registry", () => {
  it("has unique ids", () => {
    expect(new Set(TEMPLATE_IDS).size).toBe(TEMPLATE_IDS.length);
  });

  it("has complete metadata for every theme", () => {
    for (const theme of THEMES) {
      expect(theme.name.length).toBeGreaterThan(2);
      expect(theme.description.length).toBeGreaterThan(20);
      expect(theme.tags.length).toBeGreaterThan(1);
      expect(theme.accent).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("includes all eighteen themes", () => {
    for (const id of [
      "classic",
      "modern",
      "minimalist",
      "elegant",
      "creative",
      "brutal",
      "aesthetic",
      "professional",
      "bold",
      "academic",
      "executive",
      "tech",
      "aurora",
      "nordic",
      "emerald",
      "compact",
      "monochrome",
      "cyber",
    ]) {
      expect(TEMPLATE_IDS).toContain(id);
    }
  });

  it("falls back to the default theme for unknown ids", () => {
    expect(getTheme("does-not-exist").id).toBe(DEFAULT_TEMPLATE);
    expect(isTemplateId("tech")).toBe(true);
    expect(isTemplateId("nope")).toBe(false);
  });
});

describe("theme stylesheet coverage", () => {
  it("defines a rule block for every registered theme", () => {
    for (const theme of THEMES) {
      expect(css, `missing CSS for theme "${theme.id}"`).toContain(`.resume-doc.template-${theme.id}`);
    }
  });

  it("has no orphaned theme CSS for unregistered ids", () => {
    const found = new Set(
      [...css.matchAll(/\.resume-doc\.template-([a-z0-9-]+)/g)].map((match) => match[1]),
    );
    for (const id of found) {
      expect(TEMPLATE_IDS, `orphaned CSS for theme "${id}"`).toContain(id);
    }
  });

  it("does not rely on hover transforms that would leak into the PDF", () => {
    expect(css).not.toMatch(/\.template-[a-z-]+\s*:hover\s*\{[^}]*transform:/);
  });

  it("resets the gap after the name heading", () => {
    expect(css).toMatch(/\.resume-doc h1 \+ h3/);
    expect(css).toMatch(/h1\.resume-name/);
  });
});
