# Security Policy

## 📦 Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| `main`  | :white_check_mark: |
| `< 0.1` | :x:                |

We recommend always running the latest build from `main`.

## 🔍 Scope

**mdesume** is a **static, client-side web application**. It:

- runs entirely in the browser,
- has **no backend server**, **no API**, **no database**, and **no authentication**,
- stores your resume data locally in your browser via IndexedDB (`idb-keyval`),
- does **not** transmit, collect, or store any personal data on a remote server.

Because there is no server, there is no server-side attack surface (e.g., no RCE, SQLi, or SSRF via this project). Security concerns are limited to the client side: dependency vulnerabilities, XSS via untrusted Markdown input, and build/deploy pipeline integrity.

## 🚨 Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, report them privately using one of these methods:

1. **GitHub Private Vulnerability Reporting** — go to the repository's **Security** tab → **Report a vulnerability**. This creates a private advisory visible only to maintainers.
2. If that is unavailable, email the maintainer directly (see the maintainer's GitHub profile) and use the subject line `mdesume security report`.

Please include:

- a description of the vulnerability and its impact,
- steps to reproduce (or a proof-of-concept),
- the affected version/commit,
- any suggested mitigation.

## ⏱️ Response Timeline

- We aim to **acknowledge** reports within **72 hours**.
- A preliminary assessment and planned fix window will follow.
- Once fixed, we will coordinate a public disclosure timeline with you.

## 🛡️ Hardening Notes for Contributors

- Treat all user-supplied Markdown as untrusted. `react-markdown` + `remark-gfm` render it; avoid enabling raw HTML unless sanitized.
- Keep dependencies current via Dependabot (see `.github/dependabot.yml`). Run `bun run lint`, `bun run test`, and `bun run build` before any release.
- The build is fully static (`output: "export"`); never introduce server-only code that would change the threat model.

## 📄 Attribution

We will credit reporters who wish to be acknowledged in the release notes / `CHANGELOG.md`, unless you prefer to remain anonymous.
