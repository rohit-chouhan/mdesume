# Agent notes

This repository is an **Astro 7** static site with **React 19 islands**. It was migrated from Next.js.

## Rules

- The installed Astro version may be newer than your training data. Check `node_modules/astro` and the official
  docs before changing `astro.config.mjs`, routing or rendering APIs.
- Pages live in `src/pages/*.astro`. Interactive app surfaces are React islands imported into those pages.
- Do **not** add `"use client"` directives — that is a Next.js convention and has no effect in Astro.
- Import Bootstrap CSS? No. Styling is Tailwind CSS v4 via the Vite plugin and `src/styles/global.css`.
- Use Bun for everything (`bun install`, `bun run …`). Keep `bun.lock` in sync.
- The app is local-first: never add a backend, telemetry, or a network request that carries resume content.

## Verification

```bash
bun run check    # astro check (requires TypeScript 6 — pinned)
bun run lint     # eslint (Astro + TS + React hooks)
bun run test     # vitest
bun run build    # static output in dist/
```

Run all four before claiming a change is complete. A new theme requires matching CSS and registry entries; a new
symbol requires engine support, a catalogue entry and guide coverage.
