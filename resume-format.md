# mdesume resume format

This is the canonical schema for a resume in **mdesume**. Everything is plain
GitHub-flavoured Markdown plus a few `::symbol::` directives. No HTML is required.

A complete sample resume is at the bottom.

---

## 1. The header

The first heading is your name. Every theme styles it specially, and the usual
heading gap is removed so the name and subtitle read as one block.

```markdown
::align-center::
# Alex Morgan

### _Senior Software Engineer | Web & Cloud_

[alex@example.com](mailto:alex@example.com) · +1 555 0142 · Berlin, Germany

[alexmorgan.dev](https://alexmorgan.dev) · [linkedin.com/in/alexmorgan](https://linkedin.com/in/alexmorgan)
::end-align::
```

- `# Name` — the document title.
- `### _Title_` — an italic subtitle; a bold paragraph also works.
- Contact and profile links can be separated with `·`, `|` or spaces.
- Platform icons are added automatically for GitHub, LinkedIn, LeetCode, `mailto:` and web links.

## 2. Standard Markdown

- `## Section` — top-level sections.
- `### Sub-heading` — a role, project or degree.
- `**bold**`, `_italic_`, `` `code` ``.
- `- bullet` and `1. ordered` lists (a global column count can be set in the customiser).
- `[text](url)` links.
- `> blockquotes`, `---` horizontal rules and GFM tables.

## 3. Layout symbols

Symbols must be on their own line unless marked **inline**. Opening symbols close
automatically at the next top-level `##` heading or at the end of the document.

| Symbol | Purpose |
| ------ | ------- |
| `::col-2:: … ::end-col::` | Two to four balanced columns (`::col-3::`, `::col-4::`). Aliases: `::cols-2::`, `::columns-2::`, `::end-columns::`. |
| `::row:: … ::end-row::` | Title on the left, date on the right. A trailing date is detected automatically. |
| `::align-center:: … ::end-align::` | Align left, centre, right or justify. Variants: `::align-left::`, `::align-right::`, `::align-justify::`. |
| `::badges:: … ::end-badges::` | Comma, middot or newline-separated items as pills. |
| `::note:: … ::end-note::` | Italic callout with a tinted background. |
| `::no-bullets:: … ::end-no-bullets::` | Lists without markers. |
| `::compact:: … ::end-compact::` | Tighten vertical spacing inside the block. |
| `::height-24::` | Exact spacer in pixels (0–400). |
| `::page-break::` | New page in paginated PDFs; ignored by single-page exports. |
| `::divider::` | Subtle theme-coloured horizontal rule. |

### Inline symbols

| Symbol | Purpose |
| ------ | ------- |
| `::rating-4::` | Five proficiency bars with N filled (0–5). |
| `::badge[Remote]::` | A single pill. Aliases: `::pill[…]::`, `::tag[…]::`. |
| `::icon[mail]::` | Inline glyph: mail, phone, globe, link, location, github, linkedin, code, star, check, calendar, clock, download, arrow, dot, diamond, spark. |
| `::br::` | Hard line break inside a paragraph. |
| `::no-icon::[Title](url)` | Suppress the automatic icon for one link. Also works inside the brackets and on the line above. |

### Media

| Symbol | Purpose |
| ------ | ------- |
| `::avatar[https://…/photo.jpg]::` | Circular profile photo floated beside the header. |
| `::qr[https://example.com]::` | Real QR code generated locally and embedded in the PDF. |

## 4. Suggested section order

1. Header
2. `## Summary`
3. `## Technical Skills` — use `::col-2::` or `::badges::`
4. `## Work Experience`
5. `## Projects`
6. `## Education`
7. `## Certifications`
8. `## Languages`

## 5. Sample resume

Copy everything below into the editor and replace the details.

```markdown
::align-center::
# Alex Morgan

### _Senior Software Engineer | Web & Cloud_

[alex.morgan@example.com](mailto:alex.morgan@example.com) · +1 555 0142 · Berlin, Germany

[alexmorgan.dev](https://alexmorgan.dev) · [linkedin.com/in/alexmorgan](https://linkedin.com/in/alexmorgan) · [github.com/alexmorgan](https://github.com/alexmorgan)
::end-align::

## Summary

Senior Software Engineer with 8+ years building reliable web platforms and cloud services using TypeScript, Node.js and React. Shipped products serving millions of requests per day with a focus on performance, observability and developer experience.

## Technical Skills

::col-2::
- **Languages:** TypeScript, Python, Go, SQL
- **Backend:** Node.js, FastAPI, GraphQL, REST APIs, Microservices
- **Frontend:** React, Next.js, Tailwind CSS, TypeScript
- **Cloud & DevOps:** AWS, Docker, Kubernetes, CI/CD, Terraform
- **Databases:** PostgreSQL, Redis, DynamoDB
- **Practices:** TDD, Code Review, System Design, Observability
::end-col::

## Work Experience

::row::
**Northwind Systems** — Senior Software Engineer
May 2022 – Present
::end-row::

_Berlin, Germany_

**Tech Stack:** _TypeScript, Node.js, React, AWS, GraphQL, CI/CD_

- Led migration of a monolith to event-driven microservices, cutting p99 latency by 45%.
- Built a shared component library adopted by 6 teams, reducing duplicate UI code by 60%.
- Introduced end-to-end testing, lowering production incidents by 35%.

::row::
**Bright Labs** — Software Engineer
Jun 2019 – Dec 2021
::end-row::

_Remote_

- Developed REST APIs powering a B2B analytics dashboard used by 200+ customers.
- Containerized the stack with Docker and authored CI pipelines reducing release time by 50%.

## Projects

### Open Metrics Dashboard

An open-source observability dashboard built with Next.js and a WebSocket ingestion service.

[View repository](https://github.com/alexmorgan/open-metrics)

## Education

::row::
**Technische Universität Berlin** — B.Sc. Computer Science
2015 – 2019
::end-row::

_Grade: 1.7_

## Certifications

- **AWS Certified Solutions Architect — Associate** | Amazon Web Services (2023)
- **Professional Scrum Master I** | Scrum.org (2021)

## Languages

::badges::
English · German · Spanish
::end-badges::
```

## Tips

- Keep the first heading as your name and the next line as your title.
- Put a trailing date inside `::row::` to right-align it. Month names, numeric dates and years all work.
- Use `::col-2::` for dense skill lists to save vertical space.
- Thematic breaks in the customiser (font, colours, spacing) are independent of the content.
- Export a backup (JSON) before switching devices — resumes are stored per browser.
