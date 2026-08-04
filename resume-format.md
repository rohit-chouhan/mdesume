# mdesume Resume Format

This document is the **canonical schema** for writing a resume in **mdesume**.
It explains the supported Markdown, the custom layout symbols, and ends with a
**sample resume** you can copy and edit.

> Everything is plain Markdown plus a few `::symbol::` directives. No HTML is
> required. The sample at the bottom is fictional and meant to be replaced.

---

## 1. Top of the document (the header)

The first lines become the resume header. Use this order:

```markdown
# Your Name

### _Professional Title | Specialty_

[email@example.com](mailto:email@example.com) · +1 555 0100 · City, Country

[website.com](https://website.com) · [linkedin.com/in/you](https://linkedin.com/in/you) · [github.com/you](https://github.com/you)
```

- `# Name` — the main heading (your name).
- `### _Title_` — an italic subtitle for your role/specialty.
- A line of `·` separated contact links (email, phone, location).
- A line of `·` separated profile/social links (website, LinkedIn, GitHub…).

Links use standard Markdown `[label](url)`; the app turns them into clean
text/icon links in the preview.

## 2. Standard Markdown

mdesume supports standard [GitHub-Flavored Markdown](https://github.github.com/gfm/):

- `## Section` — top-level sections (Experience, Skills, Education…).
- `### Sub-heading` — job title, project name, degree, etc.
- `**bold**`, `_italic_`, `` `code` ``.
- `- bullet` lists (supports a **global column count** set in the Customizer).
- `1. ordered` lists.
- `[text](url)` links and `[text](url "title")`.
- `> blockquotes` for quotes/callouts.
- Horizontal rules `---` to separate blocks.

## 3. Custom layout symbols

These are mdesume-specific directives. Each opening symbol has a matching
closing symbol. **Headings (`#`/`##`) automatically close any open layout
block**, so you rarely need the closing tag.

### Columns — `::col-N::` … `::end-col::`

Split a block into **N** side-by-side columns (N = `2`, `3`, or `4`). Great for
skills, languages, or compact lists.

```markdown
::col-2::
- **Languages**: TypeScript, Python
- **Backend**: Node.js, REST APIs
- **Frontend**: React, Next.js
- **DevOps**: Docker, CI/CD
::end-col::
```

### Alignment — `::align-left|center|right|justify::` … `::end-align::`

Align the text inside a block.

```markdown
::align-center::
### _Available for remote work worldwide_
::end-align::
```

### Badges / skill pills — `::badges::` … `::end-badges::`

Render a list of comma- or newline-separated items as styled "pills".

```markdown
::badges::
TypeScript, React, Node.js, GraphQL, Docker, CI/CD
::end-badges::
```

### Spacing

Use blank lines for paragraph spacing as normal. Avoid raw `<br>`; the renderer
handles line breaks within paragraphs.

## 4. Suggested section order

1. Header (name, title, contacts)
2. `## Summary` — 2–4 sentence pitch
3. `## Work Experience` — most recent first
4. `## Skills` — use `::col-2::` or `::badges::`
5. `## Projects`
6. `## Education`
7. `## Certifications`
8. `## Languages`

---

## 5. Sample resume

Copy everything below into the editor and replace the placeholders with your
own details.

```markdown
# Alex Morgan

### _Senior Software Engineer | Web & Cloud_

[alex.morgan@example.com](mailto:alex.morgan@example.com) · +1 555 0142 · Berlin, Germany

[alexmorgan.dev](https://alexmorgan.dev) · [linkedin.com/in/alexmorgan](https://linkedin.com/in/alexmorgan) · [github.com/alexmorgan](https://github.com/alexmorgan)

## Summary

Senior Software Engineer with 8+ years building reliable web platforms and
cloud services using TypeScript, Node.js, and React. Shipped products serving
millions of requests per day with a focus on performance, observability, and
developer experience.

## Work Experience

### Northwind Systems — Senior Software Engineer (01/2022 - Present)

_Berlin, Germany_

**Tech Stack:** _TypeScript, Node.js, React, AWS, GraphQL, CI/CD_

- Led migration of a monolith to event-driven microservices, cutting p99 latency by 45%.
- Built a shared component library adopted by 6 teams, reducing duplicate UI code by 60%.
- Introduced end-to-end testing, lowering production incidents by 35%.

### Bright Labs — Software Engineer (06/2019 - 12/2021)

_Remote_

**Tech Stack:** _Python, FastAPI, React, PostgreSQL, Docker_

- Developed REST APIs powering a B2B analytics dashboard used by 200+ customers.
- Containerized the stack with Docker and authored CI pipelines reducing release time by 50%.

## Skills

::col-2::
- **Languages**: TypeScript, Python, Go, SQL
- **Backend**: Node.js, FastAPI, GraphQL, REST APIs, Microservices
- **Frontend**: React, Next.js, Tailwind CSS, TypeScript
- **Cloud & DevOps**: AWS, Docker, Kubernetes, CI/CD, Terraform
- **Databases**: PostgreSQL, Redis, DynamoDB
- **Practices**: TDD, Code Review, System Design, Observability
::end-col::

## Projects

### Open Metrics Dashboard

An open-source observability dashboard built with Next.js and a WebSocket
ingestion service.

[View Repo](https://github.com/alexmorgan/open-metrics)

### CLI Time Tracker

A cross-platform terminal time-tracking tool with offline sync.

[View Repo](https://github.com/alexmorgan/tt)

## Education

### Technische Universität Berlin — B.Sc. Computer Science (2015 - 2019)

_Grade: 1.7_

## Certifications

### AWS Certified Solutions Architect — Associate (2023)

### Professional Scrum Master I — Scrum.org (2021)

## Languages

::col-2::
- **English** — Fluent
- **German** — Professional
- **Spanish** — Conversational
::end-col::
```

---

## Tips

- Keep the **first heading as your name** and the **second as your title** for
  the best header rendering.
- Use `::col-N::` for dense lists (skills, languages) to save vertical space.
- The **Customizer** controls the global list-column count and template; layout
  symbols combine with it.
- Preview updates live — tweak and watch.