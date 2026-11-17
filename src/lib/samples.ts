import { DEFAULT_METADATA, normalizeStyles, type ResumeData, type ResumeStyles } from "./db";

/** Starting document used by "Create resume". */
export const SAMPLE_MARKDOWN = `::align-center::
# Alex Morgan

### _Senior Software Engineer | Web & Cloud_

[alex.morgan@example.com](mailto:alex.morgan@example.com) · +1 555 0142 · Berlin, Germany

[alexmorgan.dev](https://alexmorgan.dev) · [linkedin.com/in/alexmorgan](https://linkedin.com/in/alexmorgan) · [github.com/alexmorgan](https://github.com/alexmorgan)
::end-align::

## Summary

Senior Software Engineer with 8+ years building reliable web platforms and cloud services using TypeScript, Node.js and React. Shipped products serving millions of requests per day with a focus on performance, observability and developer experience. Comfortable leading cross-functional delivery from architecture through production support.

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
- Mentor two engineers and run the frontend architecture guild.

::row::
**Bright Labs** — Software Engineer
Jun 2019 – Dec 2021
::end-row::

_Remote_

**Tech Stack:** _Python, FastAPI, React, PostgreSQL, Docker_

- Developed REST APIs powering a B2B analytics dashboard used by 200+ customers.
- Containerized the stack with Docker and authored CI pipelines reducing release time by 50%.
- Automated regression checks, catching 30% of defects before release.

## Projects

### Open Metrics Dashboard
An open-source observability dashboard built with Next.js and a WebSocket ingestion service.

[View repository](https://github.com/alexmorgan/open-metrics)

### CLI Time Tracker
A cross-platform terminal time-tracking tool with offline sync and CSV export.

[View repository](https://github.com/alexmorgan/tt)

## Education

::row::
**Technische Universität Berlin** — B.Sc. Computer Science
2015 – 2019
::end-row::

_Grade: 1.7 · Berlin, Germany_

## Certifications

- **AWS Certified Solutions Architect — Associate** | Amazon Web Services (2023)
- **Professional Scrum Master I** | Scrum.org (2021)

## Languages

::badges::
English · German · Spanish
::end-badges::
`;

export const BLANK_MARKDOWN = `::align-center::
# Your Name

### _Your role | Your specialty_

[you@example.com](mailto:you@example.com) · City, Country
::end-align::

## Summary

Write a two or three sentence pitch here.

## Work Experience

::row::
**Company** — Role
2024 – Present
::end-row::

- Describe an accomplishment with a measurable result.
`;

export function createSampleStyles(overrides: Partial<ResumeStyles> = {}): ResumeStyles {
  return normalizeStyles({ ...overrides });
}

export function createStarterResume(
  id: string,
  title: string,
  markdown: string,
  overrides: Partial<ResumeStyles> = {},
): ResumeData {
  const now = Date.now();
  return {
    id,
    title,
    markdown,
    createdAt: now,
    updatedAt: now,
    styles: createSampleStyles(overrides),
    metadata: { ...DEFAULT_METADATA, title },
  };
}
