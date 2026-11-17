/** Visual themes available in the resume preview and PDF export. */
export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  tags: string[];
  /** Accent used for the dashboard swatch. */
  accent: string;
}

export const THEMES: ThemeDefinition[] = [
  {
    id: "classic",
    name: "Classic",
    description: "A dependable single-column layout with a ruled name and clear sections.",
    tags: ["Simple", "ATS", "Professional"],
    accent: "#1f2937",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Accent rails on the name and section headings for a crisp, current look.",
    tags: ["Modern", "Clean", "Tech"],
    accent: "#2563eb",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Quiet typography, hairline rules and generous whitespace.",
    tags: ["Minimal", "Clean", "Simple"],
    accent: "#475569",
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Centred, letter-spaced headings framed by fine rules.",
    tags: ["Elegant", "Traditional", "Professional"],
    accent: "#7c3aed",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Pill-shaped section labels and a star bullet for design-forward CVs.",
    tags: ["Creative", "Bold", "Modern"],
    accent: "#db2777",
  },
  {
    id: "brutal",
    name: "Neo-Brutal",
    description: "Heavy borders, offset shadows and unapologetic uppercase.",
    tags: ["Bold", "Quirky", "Creative"],
    accent: "#111827",
  },
  {
    id: "aesthetic",
    name: "Aesthetic",
    description: "Right-aligned name with a soft accent rule and airy sections.",
    tags: ["Minimal", "Elegant", "Modern"],
    accent: "#0f766e",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Corporate-ready uppercase headings with disciplined spacing.",
    tags: ["Professional", "Corporate", "ATS"],
    accent: "#1e40af",
  },
  {
    id: "bold",
    name: "Bold Impact",
    description: "A solid name block and tinted section bands that command attention.",
    tags: ["Bold", "Modern", "Corporate"],
    accent: "#b91c1c",
  },
  {
    id: "academic",
    name: "Academic",
    description: "Serif, small-caps section headings for research and academia.",
    tags: ["Traditional", "Academic", "Serif"],
    accent: "#78350f",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Serif name, double rules and restrained, senior-level polish.",
    tags: ["Executive", "Serif", "Professional"],
    accent: "#0f172a",
  },
  {
    id: "tech",
    name: "Tech",
    description: "Monospaced accents and code-style bullets for engineering roles.",
    tags: ["Tech", "Modern", "Developer"],
    accent: "#059669",
  },
  {
    id: "aurora",
    name: "Aurora",
    description: "A gradient rule under the name with softly tinted section labels.",
    tags: ["Modern", "Creative", "Colourful"],
    accent: "#7c3aed",
  },
  {
    id: "nordic",
    name: "Nordic",
    description: "Cool Scandinavian minimalism with crisp slate tones and hairline icy-blue borders.",
    tags: ["Minimal", "Clean", "Modern"],
    accent: "#0284c7",
  },
  {
    id: "emerald",
    name: "Emerald",
    description: "Distinguished forest-green accents with serif headings and subtle double rules.",
    tags: ["Editorial", "Elegant", "Serif"],
    accent: "#047857",
  },
  {
    id: "compact",
    name: "Compact ATS",
    description: "High-density single-column format engineered for maximum parser clarity and efficiency.",
    tags: ["ATS", "Simple", "Compact"],
    accent: "#334155",
  },
  {
    id: "monochrome",
    name: "Monochrome",
    description: "Stark black and white typography with high-contrast weights and geometric section dividers.",
    tags: ["Minimal", "Classic", "ATS"],
    accent: "#000000",
  },
  {
    id: "cyber",
    name: "Terminal",
    description: "CLI-inspired theme with monospace accents, prompt prefixes and technical bullet styling.",
    tags: ["Tech", "Developer", "Modern"],
    accent: "#10b981",
  },
];

export const TEMPLATE_IDS = THEMES.map((theme) => theme.id);

export const DEFAULT_TEMPLATE = "compact";

export function getTheme(id: string | undefined): ThemeDefinition {
  return THEMES.find((theme) => theme.id === id) ?? THEMES.find((theme) => theme.id === DEFAULT_TEMPLATE) ?? THEMES[0];
}

export function isTemplateId(id: string | undefined): id is string {
  return !!id && TEMPLATE_IDS.includes(id);
}
