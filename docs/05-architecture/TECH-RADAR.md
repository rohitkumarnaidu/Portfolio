# Technology Radar

## Overview
This radar tracks the adoption lifecycle of all technologies used in the Portfolio platform. It follows the ThoughtWorks Tech Radar format with four rings.

## Radar Rings

| Ring | Meaning | Action |
|------|---------|--------|
| **Adopt** | Proven, highly recommended | Use by default |
| **Trial** | Worth pursuing with caution | Use for new features, be ready to migrate |
| **Assess** | Worth exploring | Pilot projects only |
| **Hold** | Proceed with caution | Avoid for new work, plan migration out |

## Current Radar

### ADOPT Ã¢â‚¬â€ Technologies we're confident in

| Technology | Category | Version | Since | Rationale |
|-----------|----------|---------|-------|-----------|
| Next.js | Frontend | 14.x | 2024 | App Router, ISR, RSC, Vercel-native |
| NestJS | Backend | 10.x | 2024 | TypeScript, DI, guards, interceptors |
| TypeScript | Language | 5.5+ | 2024 | Strict mode, type safety |
| Prisma | ORM | 7.x | 2024 | Type safety, migrations, pgvector support |
| PostgreSQL | Database | 16.x | 2024 | pgvector, full-text search, reliability |
| Tailwind CSS | Styling | 3.x | 2024 | Utility-first, RSC-compatible |
| React | UI | 18.x | 2024 | Server components, hooks |
| Turborepo | Build | 2.x | 2024 | Caching, dependency graph, workspaces |
| Zod | Validation | 3.x | 2024 | TypeScript-first, schema inference |
| Docker | Container | Ã¢â‚¬â€ | 2024 | Integration testing, local dev |

### TRIAL Ã¢â‚¬â€ Worth pursuing

| Technology | Category | Version | Since | Status |
|-----------|----------|---------|-------|--------|
| Three.js / R3F | 3D | 0.184 | 2024 | Core scenes implemented |
| Framer Motion | Animation | 12.x | 2024 | Page transitions, microinteractions |
| BullMQ | Queue | 5.x | 2024 | Background job processing |
| Redis | Cache | Ã¢â‚¬â€ | 2024 | Caching, rate limiting, queues |
| TanStack Query | Data | 5.x | 2024 | Server state management |
| PostHog | Analytics | Ã¢â‚¬â€ | 2024 | Events, feature flags |
| Sentry | Monitoring | 10.x | 2024 | Error tracking, performance |

### ASSESS Ã¢â‚¬â€ Worth exploring

| Technology | Category | Version | Potential Use Case |
|-----------|----------|---------|-------------------|
| tRPC | API | Ã¢â‚¬â€ | Type-safe API alternative |
| Drizzle ORM | Database | Ã¢â‚¬â€ | Lighter alternative to Prisma |
| Bi-directional | CSS | Ã¢â‚¬â€ | Tailwind alternative/competitor |
| Hono | API | Ã¢â‚¬â€ | Lightweight API framework |
| LangChain | AI | 0.3.x | LLM orchestration (currently used in AI service) |
| GSAP | Animation | 3.x | Advanced timeline animations |
| Lenis | Scroll | 1.x | Smooth scrolling |
| Theatre.js | Animation | 0.7.x | 3D scene animation |

### HOLD Ã¢â‚¬â€ Proceed with caution

| Technology | Category | Version | Issue | Migration Target |
|-----------|----------|---------|-------|-----------------|
| Fastify | API | Ã¢â‚¬â€ | Not needed with NestJS | NestJS (already using) |
| Puppeteer | Testing | Ã¢â‚¬â€ | Heavy, Playwright is better | Playwright (already using) |
| Emotion | Styling | Ã¢â‚¬â€ | Runtime CSS-in-JS, RSC issues | Tailwind (already using) |
| Moment.js | Dates | Ã¢â‚¬â€ | Large bundle, deprecated | date-fns / native Intl |
| Axios | HTTP | Ã¢â‚¬â€ | Extra dependency vs native fetch | Native fetch (used in Next.js) |

## Review Cadence
- Full radar review: Biannually (January, July)
- Quick scan: Monthly during planning
- Update trigger: When adding/removing a dependency

## How to Propose a Change
1. Create a TDD for the technology change
2. Present at architecture review
3. Update the radar after decision
4. Update `docs/architecture/10-TECHSTACK.md`

## Related Documents
- `docs/architecture/10-TECHSTACK.md` Ã¢â‚¬â€ Full technology inventory with versions
- `docs/operations/DependencyInventory.md` Ã¢â‚¬â€ All dependency tracking

## Cross-References
- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system