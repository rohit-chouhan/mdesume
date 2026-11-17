# mdesume

> A free, open-source, Markdown-driven resume builder. Static, local-first, and it exports **real PDF files**.

Write your resume in plain Markdown, watch it render live, choose one of eighteen themes, and download a finished
PDF with document metadata. No account, no backend, no tracking — your data stays in your browser.

## ✨ Features

- **Markdown-first** — author in clean Markdown using the documented schema in [`resume-format.md`](./resume-format.md).
- **Live preview** — edit on the left, see the rendered page on the right.
- **Real PDF downloads** — one click produces a PDF file with title, author, subject, keywords and creator written
  through the browser's print dialog. The text stays selectable and searchable.
- **18 themes** — Classic, Modern, Minimalist, Elegant, Creative, Neo-Brutal, Aesthetic, Professional, Bold Impact,
  Academic, Executive, Tech, Aurora, Nordic, Emerald, Compact ATS, Monochrome and Terminal. All covered by the test suite.
- **Layout symbols** — columns, title/date rows, alignment, skill pills, ratings, inline badges and icons, avatars,
  QR codes, notes, spacers, dividers and page breaks.
- **Responsive builder** — a three-pane desktop workspace that becomes a tabbed editor/preview/design layout on phones.
- **Light & dark UI** — follows the system preference by default, with a no-flash toggle.
- **Local-first** — resumes persist in IndexedDB (`idb-keyval`). Backup and import are plain JSON files.
- **Fully static** — Astro builds a drop-in `dist/` directory that deploys anywhere, including GitHub Pages.
- **Accessible** — semantic landmarks, labelled controls, keyboard-friendly menus and focus states.

## 🚀 Tech stack

| Concern       | Choice                                             |
| ------------- | -------------------------------------------------- |
| Framework     | Astro 7 (static output)                            |
| UI islands    | React 19 (`@astrojs/react`)                        |
| Language      | TypeScript (strict)                                |
| Styling       | Tailwind CSS v4 (`@tailwindcss/vite`)              |
| Markdown      | `react-markdown` + `remark-gfm` + custom directives|
| Editor        | `@monaco-editor/react`                             |
| PDF           | `html-to-image` + `jsPDF`                          |
| Persistence   | `idb-keyval` (IndexedDB)                           |
| Package mgr   | Bun                                                |
| Tests         | Vitest + Testing Library                           |

## 🏁 Quick start

Prerequisites: [Bun](https://bun.sh) and Node.js 20.19+.

```bash
bun install
bun run dev
```

Open [http://localhost:4321](http://localhost:4321).

## 🧪 Scripts

| Command             | What it does                                             |
| ------------------- | -------------------------------------------------------- |
| `bun run dev`       | Start the Astro dev server                               |
| `bun run build`     | Build the static site into `dist/`                       |
| `bun run preview`   | Preview the production build locally                     |
| `bun run check`     | Type-check Astro and TypeScript files (`astro check`)    |
| `bun run lint`      | Lint Astro, TS and TSX with ESLint                       |
| `bun run test`      | Run the Vitest suite                                     |
| `bun run verify`    | Typecheck + lint + tests + build (what CI runs)          |

## 📦 Build & deploy

```bash
bun run build
```

`dist/` is a complete static site — upload it as-is.

### GitHub Pages

Deployment is automated in [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml):

1. If `public/CNAME` exists, the site is treated as a custom domain and built with an empty base path.
2. Otherwise it is treated as a project page and built with `PUBLIC_BASE_PATH=/<repo>`.
3. `dist/` is uploaded with `actions/upload-pages-artifact` and published by `actions/deploy-pages`.

Enable **Settings → Pages → Source: GitHub Actions** once, and every push to `main` deploys.

### Any static host

Upload `dist/` to Netlify, Cloudflare Pages, Vercel (static), S3, or any web server. No base path is needed for a
root-domain deploy.

## 📁 Project structure

```
src/
  components/            React islands + shared UI
    builder/             BuilderApp, Editor, Customizer, modals, export menu
    site/                Astro header/footer/icons/theme toggle
    Preview.tsx          Markdown → resume renderer
    ResumeSheet.tsx      Theme class + CSS variables + page dimensions
  layouts/BaseLayout.astro
  lib/
    markdown.ts          Directive engine (blocks + inline symbols)
    themes.ts            Theme registry (single source of truth)
    symbols.ts           Documented symbol catalogue (used by the guide + tests)
    db.ts                IndexedDB storage, migrations, backups
    pdf.ts               Text PDF generation, metadata and download
    analyzer.ts          Heuristic resume review
  pages/                 /, /guide, /dashboard, /builder, 404, sitemap, robots
  styles/global.css      App UI + resume CSS + all themes
tests/                   Markdown, rendering, themes, PDF, storage, analyzer
resume-format.md         Canonical Markdown resume schema + sample
```

## 📝 Resume format

The canonical schema is in [`resume-format.md`](./resume-format.md). The in-app [guide](src/pages/guide.astro)
documents every symbol with a live example.

```markdown
::align-center::
# Alex Morgan

### _Senior Software Engineer_

[alex@example.com](mailto:alex@example.com) · Berlin, Germany
::end-align::

## Experience

::row::
**Northwind Systems** — Senior Engineer
May 2022 – Present
::end-row::

- Cut p99 latency by 45%.

## Skills

::col-2::
- **Languages:** TypeScript, Python
- **Cloud:** AWS, Docker
::end-col::
```

## 🎨 PDF export

The **Save as PDF** action opens your browser's print dialog. Choose **Save as PDF** (or a PDF printer) as the
destination; mdesume prints a clean, full-size copy of the resume — no app UI, no zoom, no clipping — so the
result is a real vector PDF with selectable text, working links and the theme's exact styling.

- **Paper size:** A4 or US Letter; the print page is set to match.
- **Layout:** the browser paginates the document; `::page-break::` starts a new page.
- **Title:** the document title from the customiser becomes the PDF title.
- **Fonts and icons:** the printed preview keeps the theme's fonts and SVG icons.

No pop-up window is opened; the print copy lives in a hidden iframe and is removed after printing.

## 🔒 Privacy & security

This is a static, client-side application. It does not collect, transmit, or store personal data on a server.
Resumes live in IndexedDB in your browser. See [`SECURITY.md`](./SECURITY.md).

## 🤝 Contributing

Contributions are welcome. Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) for setup, test and PR instructions,
and [`SECURITY.md`](./SECURITY.md) for reporting vulnerabilities. By participating you agree to the
[`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

## 📄 License

[MIT](./LICENSE) © 2026 Rohit Chouhan.
