# Architecture Decision Records

> **Document:** `README.md` | **Version:** 1.0 | **Last Updated:** June 2026  
> **Status:** ✅ Active | **Owner:** Chief Architect | **Review Cadence:** Per ADR

## Purpose

Architecture Decision Records (ADRs) document significant architectural decisions made during the project's lifecycle. Each ADR captures the context, options considered, decision, and consequences of a specific architectural choice.

## ADR Format

```markdown
# ADR-{NNN}: {Title}

> **Status:** [Proposed | Accepted | Deprecated | Superseded]  
> **Date:** {YYYY-MM-DD}  
> **Author:** {Author Name}

## Context

{What is the issue motivating this decision? What constraints exist?}

## Decision

{What is the change being proposed?}

## Options Considered

| Option   | Pros | Cons |
| -------- | ---- | ---- |
| Option A | ...  | ...  |
| Option B | ...  | ...  |

## Consequences

{What becomes easier or harder? What trade-offs are accepted?}

## Compliance

{Which Constitution § does this align with?}
```

## ADR Index

| ID                                            | Title                      | Status   | Date       |
| --------------------------------------------- | -------------------------- | -------- | ---------- |
| [ADR-001](ADR-001-monorepo-turborepo.md)      | Monorepo with Turborepo    | Accepted | 2026-06-17 |
| [ADR-002](ADR-002-nextjs-app-router.md)       | Next.js App Router         | Accepted | 2026-06-17 |
| [ADR-003](ADR-003-nestjs-api.md)              | NestJS API Framework       | Accepted | 2026-06-17 |
| [ADR-004](ADR-004-supabase.md)                | Supabase PostgreSQL        | Accepted | 2026-06-17 |
| [ADR-005](ADR-005-isr-rendering.md)           | ISR Rendering Strategy     | Accepted | 2026-06-17 |
| [ADR-006](ADR-006-fastapi-ai.md)              | FastAPI AI Service         | Accepted | 2026-06-17 |
| [ADR-007](ADR-007-pgvector.md)                | pgvector for Embeddings    | Accepted | 2026-06-17 |
| [ADR-008](ADR-008-tiptap-editor.md)           | TipTap Rich Text Editor    | Accepted | 2026-06-17 |
| [ADR-009](ADR-009-posthog-analytics.md)       | PostHog Analytics          | Accepted | 2026-06-17 |
| [ADR-010](ADR-010-tailwind-css.md)            | Tailwind CSS               | Accepted | 2026-06-17 |
| [ADR-011](ADR-011-jwt-auth.md)                | JWT Authentication         | Accepted | 2026-06-17 |
| [ADR-012](ADR-012-vercel-deployment.md)       | Vercel Deployment          | Accepted | 2026-06-17 |
| [ADR-013](ADR-013-framer-motion.md)           | Framer Motion              | Accepted | 2026-06-17 |
| [ADR-014](ADR-014-zod-validation.md)          | Zod Validation             | Accepted | 2026-06-17 |
| [ADR-015](ADR-015-docker-multistage-build.md) | Multi-stage Docker Build   | Accepted | 2026-07-11 |
| [ADR-016](ADR-016-sentry-error-tracking.md)   | Sentry Error Tracking      | Accepted | 2026-07-11 |
| [ADR-017](ADR-017-bullmq-queue.md)            | BullMQ Background Queue    | Accepted | 2026-07-11 |
| [ADR-018](ADR-018-nestjs-passport-auth.md)    | Passport.js Authentication | Accepted | 2026-07-11 |

## References

- `docs/architecture/SystemArchitecture.md §14` — Architecture Decision Records (14 ADRs documented)
- `docs/governance/32-SKILL.md §17` — Documentation standards

---

_Document Version: 1.0 — Enterprise Edition_

## Cross-References
- [MASTER-INDEX.md](../MASTER-INDEX.md) — Documentation master index
- [CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) — Cross-reference system
