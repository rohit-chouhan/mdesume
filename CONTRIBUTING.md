# Contributing to mdesume

Thanks for helping improve mdesume. This project is a static Astro site with React islands, written in TypeScript.

## Setup

```bash
bun install
bun run dev      # http://localhost:4321
```

Node.js 20.19+ is required. Use **bun** for installs and scripts — do not commit a `package-lock.json`.

## Before opening a PR

Run the same checks as CI:

```bash
bun run verify   # check + lint + test + build
```

Or individually:

```bash
bun run check
bun run lint
bun run test
bun run build
```

All four must pass. New behaviour needs a test; bug fixes should include a regression test.

## Guidelines

- Keep the resume CSS in `src/styles/global.css` theme-scoped: `.resume-doc.template-<id>`.
- Add new themes to `src/lib/themes.ts` **and** add matching CSS. `tests/themes.test.ts` fails if either side is missing.
- Add new symbols to the engine (`src/lib/markdown.ts`), the catalogue (`src/lib/symbols.ts`) and the guide page. The
  guide renders the catalogue directly, and `tests/markdown.test.ts` asserts every documented example parses cleanly.
- Do not add a backend or send resume data anywhere. The app is local-first by design.
- Keep the generated `dist/` and `node_modules/` out of commits.
- Follow the existing code style: TypeScript strict, functional React components, Tailwind utilities, no `any`.

## Commit messages

Use the imperative mood and explain the why, not only the what. Example:

```
Fix row dates not aligning for month-name ranges

The date parser only understood numeric dates, so "May 2024 – Present"
leaked into the title. Add a month-name pattern and cover it with tests.
```

## Reporting bugs

Please include:

- The Markdown that reproduces the issue (redact personal details).
- The theme and a screenshot if it is visual.
- Browser and OS.

Open an issue with the bug template, or send a PR with a failing test.
