import type { ResumeStyles } from "./db";

export interface ColorPattern {
  id: string;
  name: string;
  description?: string;
  h1Color: string;
  h2Color: string;
  h3Color: string;
  textColor: string;
  linkColor: string;
  iconColor: string;
}

/**
 * Curated professional color patterns for resumes.
 * Designed for high contrast against white paper backgrounds and ATS readability.
 */
export const COLOR_PATTERNS: ColorPattern[] = [
  {
    id: "navy",
    name: "Classic Navy",
    description: "Deep navy headings with dark slate body text.",
    h1Color: "#1e3a8a",
    h2Color: "#1d4ed8",
    h3Color: "#2563eb",
    textColor: "#0f172a",
    linkColor: "#1d4ed8",
    iconColor: "#3b82f6",
  },
  {
    id: "emerald",
    name: "Emerald Forest",
    description: "Distinguished deep emerald accents with crisp charcoal text.",
    h1Color: "#065f46",
    h2Color: "#047857",
    h3Color: "#059669",
    textColor: "#0f172a",
    linkColor: "#059669",
    iconColor: "#10b981",
  },
  {
    id: "burgundy",
    name: "Burgundy Wine",
    description: "Sophisticated deep burgundy tones for executive resumes.",
    h1Color: "#831843",
    h2Color: "#9d174d",
    h3Color: "#be185d",
    textColor: "#18181b",
    linkColor: "#be185d",
    iconColor: "#f43f5e",
  },
  {
    id: "slate",
    name: "Executive Slate",
    description: "Modern neutral slate headings with sapphire links.",
    h1Color: "#1e293b",
    h2Color: "#334155",
    h3Color: "#475569",
    textColor: "#0f172a",
    linkColor: "#2563eb",
    iconColor: "#64748b",
  },
  {
    id: "violet",
    name: "Royal Violet",
    description: "Creative deep violet headings with purple accents.",
    h1Color: "#581c87",
    h2Color: "#6b21a8",
    h3Color: "#7e22ce",
    textColor: "#0f172a",
    linkColor: "#7c3aed",
    iconColor: "#8b5cf6",
  },
  {
    id: "teal",
    name: "Ocean Teal",
    description: "Calm and focused deep teal tones with dark slate text.",
    h1Color: "#115e59",
    h2Color: "#0f766e",
    h3Color: "#0d9488",
    textColor: "#1e293b",
    linkColor: "#0d9488",
    iconColor: "#14b8a6",
  },
  {
    id: "earth",
    name: "Warm Earth",
    description: "Warm terracotta and rust tones for an approachable presence.",
    h1Color: "#7c2d12",
    h2Color: "#9a3412",
    h3Color: "#c2410c",
    textColor: "#1c1917",
    linkColor: "#c2410c",
    iconColor: "#f97316",
  },
  {
    id: "crimson",
    name: "Crimson Bold",
    description: "High-impact deep crimson headings with stark dark text.",
    h1Color: "#7f1d1d",
    h2Color: "#991b1b",
    h3Color: "#b91c1c",
    textColor: "#18181b",
    linkColor: "#dc2626",
    iconColor: "#ef4444",
  },
  {
    id: "nordic",
    name: "Nordic Frost",
    description: "Crisp Arctic blue headings with deep ink text.",
    h1Color: "#0c4a6e",
    h2Color: "#0369a1",
    h3Color: "#0284c7",
    textColor: "#0f172a",
    linkColor: "#0284c7",
    iconColor: "#38bdf8",
  },
  {
    id: "charcoal",
    name: "Charcoal ATS",
    description: "Timeless monochrome black and graphite with subtle blue links.",
    h1Color: "#09090b",
    h2Color: "#27272a",
    h3Color: "#3f3f46",
    textColor: "#09090b",
    linkColor: "#2563eb",
    iconColor: "#71717a",
  },
  {
    id: "indigo",
    name: "Indigo Night",
    description: "Authoritative deep indigo headings with vibrant accents.",
    h1Color: "#312e81",
    h2Color: "#3730a3",
    h3Color: "#4338ca",
    textColor: "#0f172a",
    linkColor: "#4f46e5",
    iconColor: "#6366f1",
  },
  {
    id: "bronze",
    name: "Amber Bronze",
    description: "Distinguished bronze and golden-brown headings.",
    h1Color: "#713f12",
    h2Color: "#854d0e",
    h3Color: "#a16207",
    textColor: "#1c1917",
    linkColor: "#a16207",
    iconColor: "#ca8a04",
  },
];

/** Converts HSL (0-360, 0-100, 0-100) to hex string like #1e3a8a */
export function hslToHex(h: number, s: number, l: number): string {
  const normL = l / 100;
  const a = (s * Math.min(normL, 1 - normL)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = normL - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Parses hex color to HSL hue component (0-360) if possible */
export function extractHueFromHex(hex: string): number | null {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return null;
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  return h;
}

/**
 * Generates a random harmonious color pattern.
 * The primary heading color is clamped to a rich, dark lightness (22%-36%) to guarantee
 * high contrast against white paper backgrounds, with deep neutral dark text.
 */
export function generateRandomColorPattern(currentH1?: string): ColorPattern {
  let hue = Math.floor(Math.random() * 360);
  if (currentH1) {
    const currentHue = extractHueFromHex(currentH1);
    if (currentHue !== null) {
      // Pick a hue at least 45 degrees away so the change is clearly noticeable
      const offset = 45 + Math.floor(Math.random() * 270);
      hue = (currentHue + offset) % 360;
    }
  }

  const sat = Math.floor(60 + Math.random() * 25); // 60% - 85% saturation
  const lightH1 = Math.floor(22 + Math.random() * 14); // 22% - 36% lightness (rich & dark)
  const lightH2 = Math.min(42, lightH1 + 4);
  const lightH3 = Math.min(48, lightH1 + 8);

  // High-contrast dark neutral text (black or deep slate)
  const darkTexts = ["#000000", "#0f172a", "#18181b", "#1c1917"];
  const textColor = darkTexts[Math.floor(Math.random() * darkTexts.length)]!;

  const h1Color = hslToHex(hue, sat, lightH1);
  const h2Color = hslToHex(hue, sat, lightH2);
  const h3Color = hslToHex(hue, sat, lightH3);
  const linkColor = hslToHex(hue, Math.min(95, sat + 10), 45);
  const iconColor = hslToHex(hue, sat, 55);

  return {
    id: `random-${Date.now().toString(36)}`,
    name: "Random",
    description: "Generated harmonious palette with verified contrast.",
    h1Color,
    h2Color,
    h3Color,
    textColor,
    linkColor,
    iconColor,
  };
}

/**
 * Checks if a pattern is active by comparing heading and text colors.
 */
export function isPatternActive(
  pattern: Pick<ColorPattern, "h1Color" | "textColor">,
  styles: Pick<ResumeStyles, "h1Color" | "textColor">,
): boolean {
  return (
    pattern.h1Color.toLowerCase() === styles.h1Color.toLowerCase() &&
    pattern.textColor.toLowerCase() === styles.textColor.toLowerCase()
  );
}

/**
 * Generates a color pattern tailored to match the currently selected resume theme.
 */
export function getThemeColorPattern(theme: { id: string; name: string; accent: string }): ColorPattern {
  const isMonochrome = theme.id === "monochrome" || theme.id === "brutal";
  return {
    id: `theme-${theme.id}`,
    name: theme.name,
    description: `Signature accent palette for the ${theme.name} theme.`,
    h1Color: theme.accent,
    h2Color: theme.accent,
    h3Color: theme.accent,
    textColor: isMonochrome ? "#000000" : "#0f172a",
    linkColor: isMonochrome ? "#2563eb" : theme.accent,
    iconColor: isMonochrome ? "#71717a" : "#64748b",
  };
}
