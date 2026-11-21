/**
 * The documented symbol catalogue.
 *
 * The guide page and the regression tests both read this list, so a symbol is
 * never "documented but not wired" (or the reverse).
 */
export type SymbolGroup = "Layout" | "Inline" | "Media" | "Spacing";

export interface SymbolDoc {
  id: string;
  group: SymbolGroup;
  name: string;
  syntax: string;
  description: string;
  example: string;
  note?: string;
}

export const SYMBOLS: SymbolDoc[] = [
  {
    id: "col",
    group: "Layout",
    name: "Columns",
    syntax: "::col-2:: … ::end-col::",
    description:
      "Flow a block into two to four balanced columns. Ideal for skills, languages and compact lists. Headings inside a column stay attached to their details.",
    example: `::col-3::
- **Languages:** TypeScript, Python, Go
- **Backend:** Node.js, FastAPI
- **Frontend:** React, Next.js
- **Cloud:** AWS, Docker, Kubernetes
- **Data:** PostgreSQL, Redis
- **Testing:** Vitest, Playwright
::end-col::`,
    note: "Aliases: ::cols-2::, ::columns-2::, ::end-columns::.",
  },
  {
    id: "row",
    group: "Layout",
    name: "Title / date row",
    syntax: "::row:: … ::end-row::",
    description:
      "A two-edge row for a company and its date range. A trailing date (May 2024 – Present, 07/2021 - 05/2024, 2020) is detected automatically and pushed to the right edge.",
    example: `::row::
**Northwind Systems** — Senior Software Engineer
May 2022 – Present
::end-row::`,
    note: "Dates are detected in headings, bold text and plain paragraphs.",
  },
  {
    id: "align",
    group: "Layout",
    name: "Alignment",
    syntax: "::align-center:: … ::end-align::",
    description:
      "Align a block to the left, centre, right or justify. Perfect for a centred name and contact header.",
    example: `::align-center::
# Rohit Chouhan
_Senior Software Engineer_
::end-align::`,
    note: "Variants: ::align-left::, ::align-right::, ::align-justify::.",
  },
  {
    id: "badges",
    group: "Layout",
    name: "Skill pills",
    syntax: "::badges:: … ::end-badges::",
    description:
      "Render a comma- or newline-separated list as rounded pills. Great for a compact skills strip.",
    example: `::badges::
TypeScript, React, Node.js, GraphQL, Docker, CI/CD
::end-badges::`,
  },
  {
    id: "note",
    group: "Layout",
    name: "Callout note",
    syntax: "::note:: … ::end-note::",
    description: "An italic, lightly tinted callout for a quote, availability note or reference line.",
    example: `::note::
Available for remote roles worldwide · Open to contract work
::end-note::`,
  },
  {
    id: "no-bullets",
    group: "Layout",
    name: "List without markers",
    syntax: "::no-bullets:: … ::end-no-bullets::",
    description: "Remove bullet markers while keeping the list structure and spacing.",
    example: `::no-bullets::
- **Email:** rohit@example.com
- **Phone:** +91 98765 43210
- **Location:** India
::end-no-bullets::`,
  },
  {
    id: "compact",
    group: "Spacing",
    name: "Compact block",
    syntax: "::compact:: … ::end-compact::",
    description: "Tighten the vertical spacing between everything inside the block.",
    example: `::compact::
**Certifications:** AWS Solutions Architect, CKA, PSM I
**Languages:** English, German, Spanish
::end-compact::`,
  },
  {
    id: "height",
    group: "Spacing",
    name: "Exact spacer",
    syntax: "::height-24::",
    description: "Insert an exact vertical gap in pixels. No closing tag needed.",
    example: `## Skills
::height-8::
**TypeScript · Node.js · React**`,
  },
  {
    id: "page-break",
    group: "Spacing",
    name: "Page break",
    syntax: "::page-break::",
    description:
      "Start a new page in paginated PDF exports. Ignored by single-page exports, where it becomes a divider.",
    example: `## Certifications
AWSSA · CKA
::page-break::
## References
Available on request`,
  },
  {
    id: "divider",
    group: "Layout",
    name: "Divider",
    syntax: "::divider::",
    description: "A subtle horizontal rule that follows the theme's accent colour.",
    example: `## Summary
A short pitch.
::divider::
**Open to remote roles**`,
  },
  {
    id: "rating",
    group: "Inline",
    name: "Rating bars",
    syntax: "::rating-4::",
    description: "Five proficiency bars, with N filled (0–5). Works inline and on its own line.",
    example: `**TypeScript** ::rating-5::
**German** ::rating-3::`,
  },
  {
    id: "badge-inline",
    group: "Inline",
    name: "Inline pill",
    syntax: "::badge[Remote]::",
    description: "A single pill inside a sentence, heading or list item.",
    example: `**Senior Engineer** ::badge[Remote]:: ::badge[Open to contract]::`,
    note: "Aliases: ::pill[text]:: and ::tag[text]::.",
  },
  {
    id: "icon",
    group: "Inline",
    name: "Inline icon",
    syntax: "::icon[mail]::",
    description:
      "A small decorative glyph that stays inline. Useful for contact lines where automatic link icons are disabled.",
    example: `::icon[mail]:: rohit@example.com · ::icon[phone]:: +91 98765 43210 · ::icon[location]:: India`,
    note: "Available: mail, phone, globe, link, location, github, linkedin, code, star, check, calendar, clock, download, arrow, dot, diamond, spark.",
  },
  {
    id: "br",
    group: "Inline",
    name: "Line break",
    syntax: "::br::",
    description: "A hard line break inside a paragraph, without raw HTML.",
    example: `**Northwind Systems**::br::Berlin, Germany`,
  },
  {
    id: "no-icon",
    group: "Inline",
    name: "No link icon",
    syntax: "::no-icon::[Title](url)",
    description:
      "Suppress the automatic platform icon for one link. Put the marker before the link or inside its brackets.",
    example: `### ::no-icon::[WhatsApp SDK: Business API Integration](https://pub.dev/packages/whatsapp)`,
    note: "Disable icons globally in the customiser, or per link with this symbol.",
  },
  {
    id: "avatar",
    group: "Media",
    name: "Profile photo",
    syntax: "::avatar[https://…/photo.jpg]::",
    description: "A circular profile photo floated beside the header. Use a square image for best results.",
    example: `::avatar[https://i.pravatar.cc/160?img=12]::
# Rohit Chouhan`,
  },
  {
    id: "qr",
    group: "Media",
    name: "QR code",
    syntax: "::qr[https://example.com]::",
    description:
      "A real QR code generated in the browser and embedded in the PDF. Links to your portfolio or profile.",
    example: `::qr[https://rohitchouhan.com]::
# Rohit Chouhan`,
  },
];

export const SYMBOL_ALIASES: { alias: string; canonical: string }[] = [
  { alias: "::cols-2::", canonical: "::col-2::" },
  { alias: "::columns-3::", canonical: "::col-3::" },
  { alias: "::end-columns::", canonical: "::end-col::" },
  { alias: "::pill[text]::", canonical: "::badge[text]::" },
  { alias: "::tag[text]::", canonical: "::badge[text]::" },
];

export const SYMBOL_GROUPS: SymbolGroup[] = ["Layout", "Inline", "Media", "Spacing"];
