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

| ID                                            | Title                    | Status   | Date       |
| --------------------------------------------- | ------------------------ | -------- | ---------- |
| [ADR-001](ADR-001-monorepo-turborepo.md)      | Monorepo with Turborepo  | Accepted | 2026-06-17 |
| [ADR-002](ADR-002-nextjs-app-router.md)       | Next.js App Router       | Accepted | 2026-06-17 |
| [ADR-005](ADR-005-isr-rendering.md)           | ISR Rendering Strategy   | Accepted | 2026-06-17 |
| [ADR-010](ADR-010-tailwind-css.md)            | Tailwind CSS             | Accepted | 2026-06-17 |
| [ADR-012](ADR-012-vercel-deployment.md)       | Vercel Deployment        | Accepted | 2026-06-17 |
| [ADR-015](ADR-015-docker-multistage-build.md) | Multi-stage Docker Build | Accepted | 2026-07-11 |
| [ADR-016](ADR-016-sentry-error-tracking.md)   | Sentry Error Tracking    | Accepted | 2026-07-11 |

**Missing records:** the index previously listed 18 ADRs, but only the seven above exist on disk. References to ADR-003 (NestJS), ADR-004 (Supabase), ADR-006 (FastAPI), ADR-007 (pgvector), ADR-008 (TipTap), ADR-009 (PostHog), ADR-011 (JWT), ADR-013 (Framer Motion), ADR-014 (Zod), ADR-017 (BullMQ) and ADR-018 (Passport) are historical; do not link them until the records are written. Several describe components that were removed or replaced (Supabase, FastAPI) and need a current decision record rather than a backfill.

## References

- `docs/05-architecture/SystemArchitecture.md §14` — Architecture Decision Records (14 ADRs documented)
- `docs/23-governance/32-SKILL.md §17` — Documentation standards

---

_Document Version: 1.0 — Enterprise Edition_

## Cross-References

- [MASTER-INDEX.md](../MASTER-INDEX.md) — Documentation master index
- [CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) — Cross-reference system
