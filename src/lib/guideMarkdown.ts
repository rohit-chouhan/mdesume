/**
 * Canonical Markdown specification of mdesume and its resume schema.
 * Formatted specifically so it can be fed directly to any LLM (ChatGPT, Claude, Gemini, etc.)
 * as context or a system prompt to auto-generate perfect mdesume resumes.
 */
export function generateGuideMarkdown(siteUrl = "https://mdesume.rohitchouhan.com"): string {
  return `# mdesume Resume Format & AI Generation Guide

> mdesume is a free, open-source, local-first Markdown resume builder.
> Website: ${siteUrl}
> Live Guide: ${siteUrl}/guide
> Raw Spec: ${siteUrl}/guide.md
> LLMs Index: ${siteUrl}/llms.txt

---

## 🤖 Instructions for AI Assistants

When asked to write, improve, or format a resume for mdesume:
1. Output **only valid mdesume Markdown**.
2. Do **not** emit raw HTML tags (such as \`<div>\`, \`<span>\`, \`<table>\`, \`<br>\`). Use the native \`::symbol::\` directives instead.
3. Start with the name as a top-level \`# Name\` heading inside \`::align-center::\` (or \`::align-left::\`).
4. Follow with \`### _Job Title / Role_\` in italics, followed by contact info separated by \`·\` or \`|\`.
5. Group experience and education roles using \`::row::\` ... \`::end-row::\` with title/company on line 1 and dates on line 2.
6. Use \`::col-2::\` or \`::badges::\` for technical skills and languages.
7. Use \`::page-break::\` between sections if authoring a multi-page resume.
8. Default styling recommendations: H1 23pt, H2 14pt, H3 12pt, Body 10pt, Line Height 1.2, Font: Cambria, Theme: Compact ATS.

---

## 1. Header Structure

The first heading is your name. Every theme formats it with dedicated typography:

\`\`\`markdown
::align-center::
# Alex Morgan

### _Senior Software Engineer | Cloud & Distributed Systems_

[alex.morgan@example.com](mailto:alex.morgan@example.com) · +1 555 0142 · Berlin, Germany

[alexmorgan.dev](https://alexmorgan.dev) · [linkedin.com/in/alexmorgan](https://linkedin.com/in/alexmorgan) · [github.com/alexmorgan](https://github.com/alexmorgan)
::end-align::
\`\`\`

- \`# Name\` — the document title (H1).
- \`### _Role_\` — italicized title (H3).
- Links with recognized domains automatically receive icons (GitHub, LinkedIn, LeetCode, mailto, etc.).
- Use \`::no-icon::[Text](url)\` to suppress the icon for a specific link.

---

## 2. Sections & Content

- \`## Section Title\` — Main sections (e.g. \`## Work Experience\`, \`## Technical Skills\`, \`## Education\`).
- \`### Sub-heading\` — Projects, certifications or sub-sections.
- Standard Markdown: \`**bold**\`, \`_italic_\`, \`\` \`code\` \`\`, bullet lists (\`- item\`), numbered lists (\`1. item\`).
- Tables: Standard GitHub Flavored Markdown tables are supported.

---

## 3. Layout Symbols Directive Reference

All block symbols must be placed on their own line. Closing directives (\`::end-...\`) are optional if immediately followed by another \`##\` heading.

### Block Directives

| Directive | Description | Example |
| --------- | ----------- | ------- |
| \`::row:: ... ::end-row::\` | Title on left, date/location on right | \`::row::\\n**Acme Corp** — Lead Eng\\n2021 – Present\\n::end-row::\` |
| \`::col-2:: ... ::end-col::\` | Two balanced columns (also \`::col-3::\`, \`::col-4::\`) | \`::col-2::\\n- Skill 1\\n- Skill 2\\n::end-col::\` |
| \`::align-center:: ... ::end-align::\` | Center alignment (also \`::align-left::\`, \`::align-right::\`, \`::align-justify::\`) | Used for headers and summaries |
| \`::badges:: ... ::end-badges::\` | Renders items separated by dots, commas or lines as styled pills | \`::badges::\\nTypeScript · Python · Docker\\n::end-badges::\` |
| \`::note:: ... ::end-note::\` | Tinted callout block | \`::note::\\nRelocating to London in Q3 2026.\\n::end-note::\` |
| \`::no-bullets:: ... ::end-no-bullets::\` | Renders lists without bullet markers | Useful for compact skill lists |
| \`::compact:: ... ::end-compact::\` | Tightens vertical line spacing | Great for dense single-page resumes |
| \`::page-break::\` | Hard page break in multi-page PDF exports | Divider in single-page mode |
| \`::divider::\` | Subtle theme-colored horizontal rule | \`::divider::\` |
| \`::height-20::\` | Vertical spacing in pixels (e.g. 8, 16, 24, 32) | \`::height-16::\` |

### Inline Directives

| Inline Directive | Description |
| ---------------- | ----------- |
| \`::badge[Text]::\` | Single pill badge (aliases: \`::pill[Text]::\`, \`::tag[Text]::\`) |
| \`::rating-4::\` | 5-bar skill proficiency meter with N filled (0 to 5) |
| \`::icon[mail]::\` | Inline icon: mail, phone, globe, link, location, github, linkedin, code, star, check, calendar, clock, download, arrow, dot, diamond, spark |
| \`::br::\` | Line break inside a paragraph |
| \`::avatar[https://url/photo.jpg]::\` | Floated circular profile picture |
| \`::qr[https://example.com]::\` | Embedded local vector QR code |

---

## 4. Visual Themes

mdesume includes 18 built-in themes:

1. **Classic** (Default) — Dependable single-column layout with a ruled name and clear sections. (Accent: #1f2937)
2. **Modern** — Accent rails on name and headings for a crisp tech look. (Accent: #2563eb)
3. **Minimalist** — Hairline rules, quiet typography, generous whitespace. (Accent: #475569)
4. **Elegant** — Centered, letter-spaced headings framed by fine rules. (Accent: #7c3aed)
5. **Creative** — Pill-shaped section labels and star bullets. (Accent: #db2777)
6. **Neo-Brutal** — High-contrast heavy borders, offset shadows and bold uppercase. (Accent: #111827)
7. **Aesthetic** — Right-aligned name with soft accent rules and airy sections. (Accent: #0f766e)
8. **Professional** — Corporate-ready uppercase headings with disciplined spacing. (Accent: #1e40af)
9. **Bold Impact** — Solid name block and tinted section bands. (Accent: #b91c1c)
10. **Academic** — Serif small-caps headings for research and academia. (Accent: #78350f)
11. **Executive** — Serif name, double rules, senior executive polish. (Accent: #0f172a)
12. **Tech** — Monospaced accents and terminal-style bullets for engineers. (Accent: #059669)
13. **Aurora** — Gradient accent bar with softly tinted section badges. (Accent: #7c3aed)
14. **Nordic** — Scandinavian minimalism with icy-blue accents. (Accent: #0284c7)
15. **Emerald** — Forest green accents with serif headings and double rules. (Accent: #047857)
16. **Compact ATS** — High-density layout engineered for parser efficiency. (Accent: #334155)
17. **Monochrome** — Stark black and white geometry with high-contrast weights. (Accent: #000000)
18. **Terminal** — Command-line inspired theme with prompt prefixes and monospace accents. (Accent: #10b981)

---

## 5. Complete Ready-to-Use Template

\`\`\`markdown
::align-center::
# Alex Morgan

### _Staff Software Engineer | Distributed Systems & Cloud_

[alex.morgan@example.com](mailto:alex.morgan@example.com) · +1 555 0142 · Berlin, Germany

[alexmorgan.dev](https://alexmorgan.dev) · [linkedin.com/in/alexmorgan](https://linkedin.com/in/alexmorgan) · [github.com/alexmorgan](https://github.com/alexmorgan)
::end-align::

## Summary

Staff Software Engineer with 9+ years designing high-throughput distributed systems and developer infrastructure. Architected systems processing 50k+ req/sec, cut infrastructure spend by 40%, and mentored 15+ engineers.

## Technical Skills

::col-2::
- **Languages:** TypeScript, Go, Python, SQL, Rust
- **Cloud & Infra:** AWS, GCP, Kubernetes, Docker, Terraform
- **Databases:** PostgreSQL, Redis, DynamoDB, Kafka
- **Architecture:** Microservices, Event-Driven, Distributed Systems
::end-col::

## Work Experience

::row::
**Northwind Infrastructure** — Staff Software Engineer
May 2022 – Present
::end-row::

_Berlin, Germany (Hybrid)_

- Designed and shipped a multi-region Kafka event pipeline handling 2.5B events/day with 99.99% uptime.
- Reduced p99 API latency from 320ms to 42ms through connection pooling and caching refactor.
- Led the migration of 40+ legacy services to Kubernetes, saving \\$320k annually in cloud spend.
- Founded the internal Architecture Guild; authored company-wide API design standards.

::row::
**Bright Labs** — Senior Software Engineer
Jun 2019 – Apr 2022
::end-row::

_Remote_

- Built the core authentication and RBAC service utilized across 8 client applications.
- Automated deployment pipelines with GitHub Actions, slashing release cycle from 3 days to 25 minutes.
- Mentored 4 junior and mid-level engineers through code reviews and bi-weekly 1:1 pairing sessions.

## Projects

### Open Metrics Dashboard
Open-source observability engine built with Go and React. 1.2k+ GitHub stars.
[github.com/alexmorgan/open-metrics](https://github.com/alexmorgan/open-metrics)

## Education

::row::
**Technical University of Munich** — B.Sc. Computer Science
2015 – 2019
::end-row::

_Munich, Germany_

## Languages

::badges::
English (Native) · German (Fluent) · Spanish (Conversational)
::end-badges::
\`\`\`
`;
}
