import { describe, expect, it } from "vitest";
import { STARTER_TEMPLATES } from "@/lib/templatesGallery";
import { THEMES } from "@/lib/themes";

describe("Starter Templates Gallery", () => {
  it("provides all 5 required starter templates", () => {
    expect(STARTER_TEMPLATES).toHaveLength(5);
    const categories = STARTER_TEMPLATES.map((t) => t.category);
    expect(categories).toContain("Engineering & AI");
    expect(categories).toContain("Leadership & Executive");
    expect(categories).toContain("Product & Agile");
    expect(categories).toContain("Minimal ATS");
    expect(categories).toContain("Finance & Analytics");
  });

  it("features Rohit Chouhan as the flagship Full-Stack & AI Engineer template", () => {
    const rohitTemplate = STARTER_TEMPLATES.find((t) => t.id === "fullstack-ai-engineer");
    expect(rohitTemplate).toBeDefined();
    expect(rohitTemplate?.title).toContain("Rohit Chouhan");
    expect(rohitTemplate?.markdown).toContain("# Rohit Chouhan");
    expect(rohitTemplate?.markdown).toContain("SAP Analytics Cloud");
    expect(rohitTemplate?.markdown).toContain("Adidas");
  });

  it("ensures each template has a valid theme registered in THEMES", () => {
    const validThemeIds = new Set(THEMES.map((t) => t.id));
    for (const template of STARTER_TEMPLATES) {
      expect(validThemeIds.has(template.theme)).toBe(true);
      expect(template.markdown.length).toBeGreaterThan(100);
      expect(template.description.length).toBeGreaterThan(10);
    }
  });
});
