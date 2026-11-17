# Changelog

## 1.0.0 — Astro migration

### Changed

- **Migrated the whole app from Next.js 16 to Astro 7** with React 19 islands. The site is still a fully static
  export, now built into `dist/` and deployable to GitHub Pages with the included workflow.
- Redesigned the landing page, dashboard, builder and guide with a responsive three-pane workspace (tabbed on
  mobile) and a complete light/dark theme.
- Replaced `react-select` with native, accessible selects; removed the Next.js-only service worker.
- **Save as PDF** uses the browser's native print dialog with a clean, full-size copy from a hidden iframe — real
  vector text, working links and SVG icons. The local PDF generator, image export and crash-prone pop-up print
  window were removed.
- Rebuilt the Markdown directive engine: block symbols are resolved structurally, auto-close at section headings,
  support aliases, and inline symbols work inside paragraphs and list items.

### Fixed

- Custom symbols that silently rendered as literal text — including `::no-icons::`, inline ratings, and directives
  glued to surrounding content.
- Row dates using month names (`May 2024 – Present`) were not right-aligned and leaked into the title.
- A column could swallow the following section when a closing tag was missing.
- The gap between the resume name (`#`) and its subtitle was too large.
- QR codes rendered with an empty `src` because the Markdown URL sanitiser removed `data:` URLs.
- Themes with negative-margin header bands broke when the header was wrapped in `::align-center::`.
- Several themes had hover transforms or layout rules that broke print/PDF output.

### Added

- Three new themes: **Executive**, **Tech** and **Aurora** (13 total), all covered by tests.
- New symbols: `::page-break::`, `::divider::`, `::badge[text]::` (aliases `::pill::`, `::tag::`), `::icon[name]::`,
  `::br::`, plus column aliases (`::columns-2::`, `::end-columns::`).
- Real QR codes for `::qr[url]::`.
- PDF export layouts: default **Single page (large)** continuous PDF export without page breaks, alongside multi-page auto print.
- Accessible export menu with quick single-page and multi-page actions, customizer layout controls, and document metadata editing.
- Duplicate-resume action, keyboard-friendly modals, and per-page SEO/OG metadata.
- Comprehensive test suite: directive parsing, rendered DOM, theme/CSS coverage, print and export planning, storage migrations
  and the analyzer (95 tests).
