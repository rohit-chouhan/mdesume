# mdesume

> A free, open-source, Markdown-driven resume builder that builds to plain static files and deploys anywhere — GitHub Pages, Netlify, or any static web host.

**mdesume** lets you write your resume in Markdown, preview it live, customize the look, and export it as a print-ready PDF (browser-native). The entire site is statically exported, so there is no backend, no database, and no account required. Your data stays in your browser.

## ✨ Features

- **Markdown-first** — author your resume in clean Markdown using a documented schema (`resume-format.md`).
- **Live preview** — edit on the left, see the rendered resume on the right.
- **Customizable** — pick templates and tweak styling with the built-in customizer.
- **Print-to-PDF** — export to PDF using your browser's native print pipeline (`react-to-print`), no canvas hacks.
- **Local-first** — resumes persist in your browser via IndexedDB (`idb-keyval`). Nothing leaves your machine.
- **Static export** — Next.js `output: "export"` produces a drop-in `out/` folder.
- **SEO & responsive** — mobile-first Tailwind CSS v4, semantic HTML, per-page metadata.

## 🚀 Tech Stack

| Concern        | Choice                                            |
| -------------- | ------------------------------------------------- |
| Framework      | Next.js 16 (App Router)                           |
| Language       | TypeScript (strict)                               |
| Styling        | Tailwind CSS v4 (`@tailwindcss/postcss`)          |
| Markdown       | `react-markdown` + `remark-gfm`                   |
| Editor         | `@monaco-editor/react`                            |
| PDF / Print    | `react-to-print`                                  |
| Persistence    | `idb-keyval` (IndexedDB)                          |
| Package mgr    | Bun                                               |
| Tests          | Vitest + Testing Library                          |

## 🏁 Quick Start

Prerequisites: [Bun](https://bun.sh) installed.

```bash
# Clone
git clone https://github.com/<your-username>/mdesume.git
cd mdesume

# Install dependencies
bun install

# Start the dev server (http://localhost:3333)
bun run dev
```

Open [http://localhost:3333](http://localhost:3333) with your browser.

## 📦 Build & Export

```bash
bun run build
```

This produces a fully static `out/` directory. Preview it locally with:

```bash
npx serve out
```

### Deploy

- **GitHub Pages** — already automated via `.github/workflows/deploy.yml`. It builds with the repo name as the `basePath` and publishes `out/` to Pages. For a user/org page (`*.github.io`) leave `NEXT_PUBLIC_BASE_PATH` unset.
- **Netlify / any static host** — upload the contents of `out/` as-is (no `basePath` needed).
- **Manual / ZIP** — build, then zip `out/` and upload to any web host.

> There is intentionally **no** `start`/`next start` script: with `output: "export"` there is no server runtime.

## 📁 Project Structure

```
src/
  app/            # Routes: / (landing), /dashboard, /builder, /guide; sitemap/robots
  components/     # Editor, Preview, Customizer, modals, tests
  lib/            # analyzer.ts, db.ts
  types/          # type declarations (e.g. html2pdf.d.ts)
resume-format.md  # Canonical Markdown resume schema + sample
public/           # static assets (incl. .nojekyll)
.github/          # CI workflows, templates, dependabot
```

## 📝 Resume Format

See [`resume-format.md`](./resume-format.md) for the canonical schema and a sample resume you can copy as a starting point.

## 🤝 Contributing

Contributions are welcome! Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) for setup, test, and PR instructions, and [`SECURITY.md`](./SECURITY.md) for how to report vulnerabilities. By participating you agree to the [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

## 🔒 Security

This is a static, client-side application. It does not collect, transmit, or store any personal data on a server. See [`SECURITY.md`](./SECURITY.md).

## 📄 License

[MIT](./LICENSE) © 2026 Rohit Chouhan.
