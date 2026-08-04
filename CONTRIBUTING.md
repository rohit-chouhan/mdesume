# Contributing to mdesume

Thanks for your interest in improving **mdesume**! This guide covers how to set up the project, run the checks, and open a pull request that passes CI.

## 🧰 Prerequisites

- [Bun](https://bun.sh) (the project's package manager and runtime for scripts)
- Node.js 18+ (for editor tooling)
- Git

## 🛠️ Local Setup

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/<your-username>/mdesume.git
cd mdesume

# Add the upstream remote
git remote add upstream https://github.com/<upstream-owner>/mdesume.git

# Install dependencies
bun install

# Run the dev server (http://localhost:3333)
bun run dev
```

## 🌿 Branching

- Base all PRs against `main`.
- Use a descriptive branch name prefixed by intent:
  - `feat/short-description` — new feature
  - `fix/short-description` — bug fix
  - `docs/short-description` — documentation only
  - `chore/short-description` — tooling/cleanup
  - `test/short-description` — tests only

Keep PRs focused — one logical change per PR.

## ✅ Before You Open a PR

Run **all** of the following locally. CI runs the same commands and will fail the PR if any of them fail.

```bash
# 1. Lint (ESLint, must pass with no errors)
bun run lint

# 2. Tests (Vitest — Preview and analyzer suites)
bun run test

# 3. Production static build (must emit out/ with no TS errors)
bun run build
```

> The CI workflow `.github/workflows/ci.yml` runs `lint`, `test`, and `build` on every pull request to `main`.

## 🧪 Running Tests

- Run the whole suite once: `bun run test` (runs `vitest run`).
- Run with a watch loop during development: `bunx vitest`.
- Run a single file: `bunx vitest run src/components/Preview.test.tsx`.

Tests use Vitest + Testing Library in a `jsdom` environment. Place new component tests next to their components (`*.test.tsx`) and pure-logic tests under `tests/`.

## 📐 Coding Standards

- **TypeScript is strict.** No `any` escapes without a clear, documented reason.
- **Styling** is Tailwind CSS v4 utility classes — mobile-first (`sm:`, `md:`, `lg:`). Avoid inline styles where a utility works.
- **Static-first.** This is a statically exported Next.js app (`output: "export"`). Do **not** add:
  - server-only API routes or server rendering / SSR data fetching
  - middleware that needs a runtime
  - backend databases or auth requiring a server
  - a `start`/`next start` script
- **Accessibility** — semantic HTML, sensible heading order, keyboard focus, and `aria-label` on every icon-only control.
- **Dependencies** — prefer the existing single PDF/print path (`react-to-print`). Don't add `html2pdf.js`/`jspdf`/`html2canvas-pro` unless canvas rasterization is genuinely needed.

## 📝 Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add template thumbnail previews
fix: correct column layout on mobile
docs: document resume schema
```

## 🔀 Opening the Pull Request

1. Push your branch and open a PR against `main`.
2. Fill in the PR template: describe the change, link the issue, and confirm the checklist (tests pass, lint passes, docs updated, no server-only code).
3. Wait for CI checks (lint / test / build) to go green.
4. A maintainer will review and merge.

## 🐞 Reporting Bugs / Requesting Features

Use the GitHub issue templates (`bug_report`, `feature_request`). For security issues, follow [`SECURITY.md`](./SECURITY.md) instead of opening a public issue.

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
