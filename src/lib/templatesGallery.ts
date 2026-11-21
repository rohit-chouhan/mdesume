import { createSampleStyles, SAMPLE_MARKDOWN } from "./samples";
import type { ResumeStyles } from "./db";

export interface StarterTemplate {
  id: string;
  title: string;
  role: string;
  category: "Engineering & AI" | "Leadership & Executive" | "Product & Agile" | "Minimal ATS" | "Finance & Analytics";
  description: string;
  theme: string;
  styles: ResumeStyles;
  markdown: string;
  badge: string;
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: "fullstack-ai-engineer",
    title: "Rohit Chouhan — Full-Stack & AI Engineer",
    role: "Full-Stack Software Engineer | AI & LLM",
    category: "Engineering & AI",
    description: "Cloud microservices, SAP Analytics Cloud AI assistants, high-throughput pipelines, and algorithmic excellence.",
    theme: "modern",
    badge: "Popular",
    styles: createSampleStyles({
      template: "modern",
      fontFamily: "Inter",
      h1Color: "#1d4ed8",
      h2Color: "#2563eb",
      textColor: "#1e293b",
    }),
    markdown: SAMPLE_MARKDOWN,
  },
  {
    id: "executive-leader",
    title: "Elena Rostova — VP of Engineering & Tech Leader",
    role: "VP of Engineering | Enterprise Cloud Transformation",
    category: "Leadership & Executive",
    description: "Multi-team engineering leadership, P&L ownership, scaling organizations from 20 to 120+ engineers, and high-reliability systems.",
    theme: "executive",
    badge: "Executive",
    styles: createSampleStyles({
      template: "executive",
      fontFamily: "Lora",
      h1Color: "#0f172a",
      h2Color: "#334155",
      textColor: "#1e293b",
      sectionSpacing: "1rem",
    }),
    markdown: `::align-center::
# Elena Rostova

### _VP of Engineering | Enterprise Cloud & Distributed Systems_

[elena.rostova@example.com](mailto:elena.rostova@example.com) · +1 415 555 0198 · San Francisco, CA

[linkedin.com/in/elena-rostova](https://linkedin.com) · [github.com/elena-rostova](https://github.com)
::end-align::

## Executive Summary

Engineering executive with 14+ years scaling high-performance engineering organizations across SaaS, Fintech, and Enterprise Cloud platforms. Proven track record leading 120+ engineers across 4 continents, managing a \\$22M operational budget, and delivering 99.999% platform availability.

::note::
Specialized in post-Series B scaling, technical debt reduction, and modernizing monoliths to Kubernetes-native architectures.
::end-note::

## Core Competencies

::col-2::
- **Strategic Leadership:** Global Org Scaling, OKR Planning, M&A Diligence
- **Budget & Operations:** \\$22M P&L Oversight, Vendor Contracts, Cloud Spend (-35%)
- **Architecture:** Zero-Trust Security, Multi-Cloud (AWS/GCP), Kafka Streaming
- **Team Culture:** DEI Initiatives, Career Ladders, Engineering Guilds
::end-col::

## Professional Experience

::row::
**CloudScale Technologies** — Vice President of Engineering
2021 – Present
::end-row::

_San Francisco, CA_

- Built and led a 125-person engineering organization across infrastructure, platform, data, and security functions.
- Spearheaded enterprise multi-region re-architecture, improving platform availability from 99.9% to 99.999% during a 4x surge in daily transactions.
- Reduced annual cloud infrastructure expenditure by 34% (\\$4.2M/year) through serverless migrations and automated node auto-scaling.
- Restructured technical hiring processes, decreasing time-to-hire by 40% while raising post-onboarding retention to 94%.

::row::
**FinGrid Inc.** — Director of Platform Engineering
2017 – 2021
::end-row::

_New York, NY_

- Expanded the platform infrastructure team from 8 to 42 distributed engineers across North America and Europe.
- Delivered real-time payment settlement pipelines processing \\$850M+ daily gross transaction volume with sub-25ms latency.
- Instituted enterprise compliance automation for SOC2 Type II, ISO 27001, and PCI-DSS Level 1 certifications.

## Education

::row::
**University of California, Berkeley** — M.S. in Computer Science
2012 – 2014
::end-row::

::row::
**University of Washington** — B.S. in Computer Engineering (Magna Cum Laude)
2008 – 2012
::end-row::

## Languages & Board Service

::badges::
English (Native) · Advisory Board Member (OpenInfra Foundation) · Keynote Speaker
::end-badges::
`,
  },
  {
    id: "product-manager",
    title: "Marcus Vance — Principal Technical Product Manager",
    role: "Principal Product Manager | AI & Developer Platforms",
    category: "Product & Agile",
    description: "Product strategy, user growth KPIs (0 to 3.5M MAU), developer API ecosystems, and discovery sprints.",
    theme: "professional",
    badge: "Product",
    styles: createSampleStyles({
      template: "professional",
      fontFamily: "Inter",
      h1Color: "#1e40af",
      h2Color: "#1e3a8a",
      textColor: "#1f2937",
    }),
    markdown: `::align-center::
# Marcus Vance

### _Principal Technical Product Manager | AI & Developer Platforms_

[marcus.vance@example.com](mailto:marcus.vance@example.com) · +1 206 555 0177 · Seattle, WA

[linkedin.com/in/marcus-vance](https://linkedin.com) · [marcusvance.com](https://example.com)
::end-align::

## Executive Pitch

Technical Product Leader with 10+ years driving product vision from zero-to-one and enterprise scale. Led product strategy for developer APIs used by 3.5M+ developers globally, increasing product-led growth revenue by 140% YoY.

## Core Capabilities

::badges::
Product Strategy · Customer Discovery · LLM Agent Workflows · GTM Execution · API Design · OKR Frameworks · Data Analytics
::end-badges::

## Product Leadership Experience

::row::
**Nexus Developer Cloud** — Principal Product Manager
2022 – Present
::end-row::

_Seattle, WA_

- Defined 3-year product roadmap for AI Gateway & Tool Calling platform, driving growth from 0 to 3.5M monthly active developers in 18 months.
- Collaborated with enterprise customers (Fortune 500) to design RBAC, security audits, and rate-limiting controls, closing \\$14M in annual recurring contracts.
- Increased developer activation rate by 42% through interactive documentation, CLI onboarding, and instant sandbox environments.

::row::
**OmniData Systems** — Senior Product Manager
2018 – 2022
::end-row::

_Austin, TX_

- Owned the streaming ETL product portfolio generating \\$32M ARR with 99.2% customer net retention.
- Reduced time-to-first-event for developer integrations from 4 days to under 15 minutes by launching pre-built connector libraries.
- Championed continuous customer discovery, conducting 120+ customer interviews annually to prioritize high-value engineering sprints.

## Key Feature Impact Metrics

| Product Initiative | Primary Metric | Business Impact |
| :--- | :--- | :--- |
| AI Tool Calling SDK | Developer Onboarding Speed | +65% faster time-to-first-call |
| Real-Time Dashboard | Daily Active Usage (DAU) | +82% engagement increase |
| Enterprise RBAC Suite | Enterprise Conversion | \\$14M new ARR pipeline |

## Education & Certifications

::row::
**University of Texas at Austin** — B.S. in Electrical & Computer Engineering
2013 – 2017
::end-row::

::badges::
Certified Scrum Product Owner (CSPO) · Pragmatic Institute Certified (PMC-III)
::end-badges::
`,
  },
  {
    id: "minimal-ats",
    title: "David Kim — High-Density ATS Software Engineer",
    role: "Senior Software Engineer | High Throughput Systems",
    category: "Minimal ATS",
    description: "Maximum readability single-column format engineered to score 95+ on Taleo, Workday, Greenhouse, and Lever ATS parsers.",
    theme: "compact",
    badge: "ATS 98%",
    styles: createSampleStyles({
      template: "compact",
      fontFamily: "Arial",
      h1Color: "#0f172a",
      h2Color: "#334155",
      textColor: "#0f172a",
      lineHeight: "1.25",
      sectionSpacing: "0.85rem",
      listSpacing: "0.12rem",
    }),
    markdown: `::align-center::
# David Kim

### _Senior Software Engineer | Distributed Systems & Backend Infrastructure_

[david.kim@example.com](mailto:david.kim@example.com) · +1 312 555 0149 · Chicago, IL

[github.com/davidkim](https://github.com) · [linkedin.com/in/david-kim](https://linkedin.com)
::end-align::

## Summary

Senior Software Engineer with 8 years building low-latency, resilient backend architectures in Go, Java, and C++. Track record of scaling message broker throughput to 400k messages/second while reducing memory footprints by 45%.

## Technical Skills

- **Programming Languages:** Go, Java, C++, Python, SQL, Rust
- **Distributed Systems:** Kafka, RabbitMQ, gRPC, Redis, Apache Flink, Elasticsearch
- **Cloud & Orchestration:** AWS (EC2, EKS, RDS, S3), Docker, Kubernetes, Terraform, Linux
- **Databases:** PostgreSQL, MySQL, Cassandra, ScyllaDB, DynamoDB

## Professional Experience

::row::
**Citadel Infrastructure Systems** — Senior Software Engineer
2021 – Present
::end-row::

- Architected a distributed order-matching feed in Go processing 400k messages/sec with median latency under 1.8 milliseconds.
- Re-engineered PostgreSQL read-heavy replica queries using composite indexing and Redis cache invalidation, reducing 99th percentile query time from 480ms to 24ms.
- Designed automated disaster-recovery failover between AWS us-east-1 and us-west-2, achieving recovery point objective (RPO) of <500ms and RTO of <30s.
- Reduced AWS EC2 fleet costs by \\$380,000 annually by profiling memory allocations and implementing Go memory ballast optimizations.

::row::
**Apex Financial Tech** — Software Engineer
2018 – 2021
::end-row::

- Developed asynchronous settlement services in Java (Spring Boot) handling \\$120M in transactions daily across 15 banking networks.
- Built end-to-end integration test automation with Testcontainers and GitHub Actions, cutting staging release regressions by 60%.
- Containerized 24 monolithic backend services into Kubernetes microservices with zero-downtime rolling deployments.

## Education

::row::
**University of Illinois Urbana-Champaign** — B.S. in Computer Science
2014 – 2018
::end-row::

_GPA: 3.85 / 4.00_
`,
  },
  {
    id: "finance-fpa",
    title: "Priya Sharma — Lead FP&A & Financial Analytics",
    role: "Lead FP&A Analyst | Corporate Financial Modeling",
    category: "Finance & Analytics",
    description: "Corporate budgeting, DCF valuation, variance analysis, ERP & SAP SAC reporting, and executive board presentations.",
    theme: "emerald",
    badge: "Finance",
    styles: createSampleStyles({
      template: "emerald",
      fontFamily: "Lora",
      h1Color: "#064e3b",
      h2Color: "#047857",
      textColor: "#1f2937",
    }),
    markdown: `::align-center::
# Priya Sharma

### _Lead FP&A Analyst | Financial Planning & Corporate Strategy_

[priya.sharma@example.com](mailto:priya.sharma@example.com) · +1 212 555 0162 · New York, NY

[linkedin.com/in/priya-sharma](https://linkedin.com) · New York, NY
::end-align::

## Professional Profile

Strategic Finance and Corporate FP&A Lead with 7+ years directing annual operating plans, multi-year strategic forecasts, and executive performance analytics for Fortune 500 enterprises. Experienced partnering with C-suite executives to evaluate capital allocation and profitability drivers across \\$450M+ revenue streams.

## Core Financial Skills

::col-2::
- **Financial Modeling:** 3-Statement Models, DCF Valuations, LBO Sensitivity
- **Forecasting & Planning:** Annual Operating Plans (AOP), Rolling 18-Mo Forecasts
- **Systems & BI:** SAP Analytics Cloud (SAC), NetSuite, Power BI, SQL, Python
- **Analytics:** Unit Economics, Cohort Retention, Gross Margin Optimization
::end-col::

## Work Experience

::row::
**Vanguard Enterprise Logistics** — Lead FP&A Analyst
2022 – Present
::end-row::

_New York, NY_

- Directed corporate annual budgeting process across 14 global divisions representing \\$450M operating expenses, delivering budget finalization 3 weeks ahead of schedule.
- Built dynamic rolling 18-month financial forecasting model in SAP Analytics Cloud, increasing forecast accuracy by 22% and reducing monthly close cycle time by 4 days.
- Identified \\$12M in operational cost redundancies by building SKU-level unit margin dashboards in Power BI.
- Prepared comprehensive quarterly board financial presentation decks for CEO and CFO, providing actionable variance explanations.

::row::
**Morgan Stanley** — Senior Financial Analyst
2019 – 2022
::end-row::

_New York, NY_

- Executed financial due diligence and DCF valuation models for 18 mid-market transaction proposals totaling \\$1.4B in asset values.
- Monitored real-time departmental OPEX variance against target plans, driving monthly accountability reviews with 8 VP department heads.
- Automated daily cash-position reporting using Python and Excel VBA, eliminating 10 hours of manual recurring reporting each week.

## Education & Credentials

::row::
**New York University (NYU Stern)** — B.S. in Finance & Data Science
2015 – 2019
::end-row::

_Summa Cum Laude · Dean's List_

::badges::
CFA Charterholder (Chartered Financial Analyst) · Financial Modeling & Valuation Analyst (FMVA)
::end-badges::
`,
  },
];
