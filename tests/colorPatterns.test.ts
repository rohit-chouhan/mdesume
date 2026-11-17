import { describe, expect, it } from "vitest";
import {
  COLOR_PATTERNS,
  extractHueFromHex,
  generateRandomColorPattern,
  getThemeColorPattern,
  hslToHex,
  isPatternActive,
} from "@/lib/colorPatterns";

describe("colorPatterns", () => {
  it("defines curated color patterns with valid hex colors", () => {
    expect(COLOR_PATTERNS.length).toBeGreaterThanOrEqual(10);
    const hexRegex = /^#[0-9a-fA-F]{6}$/;

    for (const pattern of COLOR_PATTERNS) {
      expect(pattern.id).toBeTruthy();
      expect(pattern.name).toBeTruthy();
      expect(pattern.h1Color).toMatch(hexRegex);
      expect(pattern.h2Color).toMatch(hexRegex);
      expect(pattern.h3Color).toMatch(hexRegex);
      expect(pattern.textColor).toMatch(hexRegex);
      expect(pattern.linkColor).toMatch(hexRegex);
      expect(pattern.iconColor).toMatch(hexRegex);
    }
  });

  it("converts HSL to valid 6-character hex strings", () => {
    expect(hslToHex(0, 100, 50)).toBe("#ff0000"); // Red
    expect(hslToHex(120, 100, 50)).toBe("#00ff00"); // Green
    expect(hslToHex(240, 100, 50)).toBe("#0000ff"); // Blue
    expect(hslToHex(0, 0, 0)).toBe("#000000"); // Black
  });

  it("extracts hue accurately from hex", () => {
    expect(extractHueFromHex("#ff0000")).toBe(0);
    expect(extractHueFromHex("#00ff00")).toBe(120);
    expect(extractHueFromHex("#0000ff")).toBe(240);
    expect(extractHueFromHex("invalid")).toBeNull();
  });

  it("generates random harmonious color pattern with valid hex colors", () => {
    const randomPattern = generateRandomColorPattern("#1e3a8a");
    const hexRegex = /^#[0-9a-fA-F]{6}$/;

    expect(randomPattern.id).toMatch(/^random-/);
    expect(randomPattern.name).toBe("Random");
    expect(randomPattern.h1Color).toMatch(hexRegex);
    expect(randomPattern.h2Color).toMatch(hexRegex);
    expect(randomPattern.h3Color).toMatch(hexRegex);
    expect(randomPattern.textColor).toMatch(hexRegex);
    expect(randomPattern.linkColor).toMatch(hexRegex);
    expect(randomPattern.iconColor).toMatch(hexRegex);
  });

  it("correctly identifies active patterns based on h1Color and textColor", () => {
    const navy = COLOR_PATTERNS.find((p) => p.id === "navy")!;
    expect(
      isPatternActive(navy, {
        h1Color: navy.h1Color,
        textColor: navy.textColor,
      }),
    ).toBe(true);

    expect(
      isPatternActive(navy, {
        h1Color: "#123456",
        textColor: navy.textColor,
      }),
    ).toBe(false);

    // Case insensitivity
    expect(
      isPatternActive(
        { h1Color: "#FFFFFF", textColor: "#000000" },
        { h1Color: "#ffffff", textColor: "#000000" },
      ),
    ).toBe(true);
  });

  it("generates theme-compatible color pattern for a given theme", () => {
    const emeraldTheme = { id: "emerald", name: "Emerald", accent: "#047857" };
    const pattern = getThemeColorPattern(emeraldTheme);

    expect(pattern.id).toBe("theme-emerald");
    expect(pattern.name).toBe("Emerald");
    expect(pattern.h1Color).toBe("#047857");
    expect(pattern.h2Color).toBe("#047857");
    expect(pattern.textColor).toBe("#0f172a");

    const monochromeTheme = { id: "monochrome", name: "Monochrome", accent: "#000000" };
    const monoPattern = getThemeColorPattern(monochromeTheme);
    expect(monoPattern.h1Color).toBe("#000000");
    expect(monoPattern.textColor).toBe("#000000");
  });
});
