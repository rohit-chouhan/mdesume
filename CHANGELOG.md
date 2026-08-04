# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `LICENSE` (MIT), `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md`.
- CI workflow (`.github/workflows/ci.yml`) running lint, test, and static build on every PR.
- PR and issue templates, plus Dependabot config.
- Canonical `resume-format.md` schema with a sample resume.

## [0.1.0] - 2026-08-03

### Added
- Initial public release: Markdown-driven resume builder with live preview, template customizer, and browser-native print-to-PDF export.
- Static export via Next.js `output: "export"`; GitHub Pages deploy workflow.
- Local persistence with IndexedDB (`idb-keyval`).
