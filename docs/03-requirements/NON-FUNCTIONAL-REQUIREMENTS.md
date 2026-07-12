# Non-Functional Requirements Ã¢â‚¬â€ Portfolio Platform

> **Document:** `03-requirements/NON-FUNCTIONAL-REQUIREMENTS.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Owner:** CTO | **Status:** Ã¢Å“â€¦ Active | **Review Cadence:** Quarterly
> **Total NFRs:** 18 | **P0:** 6 | **P1:** 7 | **P2:** 4 | **P3:** 1

---

## NFR Summary Table

| ID | Category | NFR | Priority | Current Status | Target |
|----|----------|-----|----------|----------------|--------|
| NFR-PRF-01 | Performance | Public page load time | P0 | Not measured | < 50ms (CDN hit) |
| NFR-PRF-02 | Performance | API response time | P0 | Not measured | < 100ms p95 |
| NFR-PRF-03 | Performance | AI chat response time | P1 | Not implemented | < 500ms TTFB |
| NFR-PRF-04 | Performance | Lighthouse score | P0 | Not measured | > 95 all categories |
| NFR-SCL-01 | Scalability | Concurrent visitors | P1 | Not tested | 10K monthly visitors |
| NFR-SCL-02 | Scalability | AI chat concurrency | P2 | Not implemented | 50 concurrent sessions |
| NFR-SCL-03 | Scalability | Build performance | P2 | Measurable | < 3 min full build |
| NFR-AVL-01 | Availability | Public page uptime | P0 | 100% (not deployed) | 99.9% |
| NFR-AVL-02 | Availability | API uptime | P1 | 100% (not deployed) | 99.5% |
| NFR-SEC-01 | Security | OWASP Top 10:2025 | P0 | Designed, not verified | 100% pass |
| NFR-SEC-02 | Security | Authentication | P0 | Designed | JWT 15-min TTL |
| NFR-SEC-03 | Security | Row-Level Security | P0 | Designed | All 37 tables |
| NFR-SEC-04 | Security | Rate limiting | P1 | Designed | Per-route tiers |
| NFR-MNT-01 | Maintainability | Three-layer pattern | P0 | Implemented | 100% of entities |
| NFR-MNT-02 | Maintainability | Shared types | P0 | Implemented | Single source of truth |
| NFR-RLB-01 | Reliability | ISR cache resilience | P1 | Not tested | 60s revalidation |
| NFR-RLB-02 | Reliability | Background job persistence | P2 | Not implemented | Redis + BullMQ |
| NFR-RLB-03 | Reliability | Graceful degradation | P1 | Not implemented | 3D fallback |
| NFR-CMP-01 | Compliance | GDPR right to erasure | P1 | Implemented | API endpoint exists |
| NFR-CMP-02 | Compliance | CCPA opt-out | P2 | Implemented | Cookie consent |
| NFR-CMP-03 | Compliance | WCAG 2.2 AA | P1 | Not audited | Full compliance |
| NFR-CMP-04 | Compliance | SOC 2 readiness | P3 | Not started | Roadmap defined |
| NFR-PRT-01 | Portability | Docker containers | P1 | Implemented | API + AI |
| NFR-PRT-02 | Portability | Vercel deployable | P0 | Implemented | Frontend |

---

## 1. Performance NFRs

### NFR-PRF-01: Public Page Load Time

| Field | Value |
|-------|-------|
| **Category** | Performance |
| **Priority** | P0 Ã¢â‚¬â€ Critical |
| **Description** | Public-facing portfolio pages must load within 50ms for CDN-cached requests. This ensures recruiters and hiring managers experience near-instant page transitions, reinforcing the perception of engineering quality. |
| **Metric / Target** | < 50ms Time to First Byte (TTFB) for CDN hits; < 1.5s Largest Contentful Paint (LCP) |
| **Measurement Method** | Vercel Analytics RUM data + synthetic monitoring via Lighthouse CI on every PR. Track TTFB, LCP, FID, CLS per route. |
| **Current Status** | Ã°Å¸â€Â´ Not measured Ã¢â‚¬â€ app not deployed. Architecture supports via ISR + CDN. |
| **Dependencies** | Vercel deployment, ISR configuration, CDN propagation |
| **Acceptance Criteria** | 95th percentile TTFB < 50ms for 90% of global test locations; LCP < 1.5s on mobile 3G throttled |

### NFR-PRF-02: API Response Time

| Field | Value |
|-------|-------|
| **Category** | Performance |
| **Priority** | P0 Ã¢â‚¬â€ Critical |
| **Description** | All portfolio API GET endpoints must respond within 100ms at the 95th percentile. This ensures admin dashboard interactions feel instant and public page ISR revalidation does not block rendering. |
| **Metric / Target** | < 100ms p95 for GET endpoints; < 500ms p95 for POST mutations |
| **Measurement Method** | Sentry Performance Tracing with `p95` dashboard. Each endpoint tagged by module (sections, projects, skills, leads). |
| **Current Status** | Ã°Å¸â€Â´ Not measured Ã¢â‚¬â€ API not deployed. Architecture supports via Redis caching layer, Prisma query optimization, compound indices. |
| **Dependencies** | Redis cache warming, Prisma query optimization, database index strategy |
| **Acceptance Criteria** | All read endpoints < 100ms p95 under 50 concurrent requests; no endpoint exceeds 200ms at p99 |

### NFR-PRF-03: AI Chat Response Time

| Field | Value |
|-------|-------|
| **Category** | Performance |
| **Priority** | P1 Ã¢â‚¬â€ High |
| **Description** | AI chat responses must begin streaming within 500ms TTFB. The user should see the first token within half a second of pressing Enter, with the full response arriving via SSE. |
| **Metric / Target** | < 500ms TTFB for first token; < 5s total for simple queries (>80% of responses) |
| **Measurement Method** | Sentry tracing on FastAPI `/chat` endpoint. Track `ttfb`, `total_time`, `token_speed`. |
| **Current Status** | Ã°Å¸â€Â´ Not implemented Ã¢â‚¬â€ `apps/ai/app/main.py` is an empty stub |
| **Dependencies** | FastAPI service implementation, OpenAI API integration, RAG pipeline, response caching |
| **Acceptance Criteria** | TTFB < 500ms for >95% of requests; streaming completes < 5s for queries requiring < 4K context |

### NFR-PRF-04: Lighthouse Score

| Field | Value |
|-------|-------|
| **Category** | Performance |
| **Priority** | P0 Ã¢â‚¬â€ Critical |
| **Description** | All public pages must score Ã¢â€°Â¥ 95 on Lighthouse Performance, Accessibility, Best Practices, and SEO. The portfolio itself is the primary technical demonstration Ã¢â‚¬â€ poor scores undermine the message. |
| **Metric / Target** | Ã¢â€°Â¥ 95 in all categories (Performance, Accessibility, Best Practices, SEO) |
| **Measurement Method** | Lighthouse CI run on every PR. Fail CI if any category drops below 90. Monthly full audit. |
| **Current Status** | Ã°Å¸â€Â´ Not measured Ã¢â‚¬â€ no pages to test. Dependencies (next/font, next/image, ISR) selected for high scores. |
| **Dependencies** | Implementation of performance optimizations (image optimization, dynamic imports, font loading) |
| **Acceptance Criteria** | All four categories Ã¢â€°Â¥ 95 on desktop and mobile emulation. Zero `opportunity` warnings in Performance. |

---

## 2. Scalability NFRs

### NFR-SCL-01: Concurrent Visitors

| Field | Value |
|-------|-------|
| **Category** | Scalability |
| **Priority** | P1 Ã¢â‚¬â€ High |
| **Description** | The platform must support 10,000 monthly visitors and 100,000 monthly page views without degradation. This is the estimated upper bound for a personal portfolio with active job search + open-source audience. |
| **Metric / Target** | 10K monthly unique visitors; 100K page views; < 2 second page load at 100 concurrent users |
| **Measurement Method** | Load test via k6 or Artillery simulating 100 concurrent users browsing public pages. Monitor p95 response times on Vercel Analytics and Sentry. |
| **Current Status** | Ã°Å¸Å¸Â¡ Design target Ã¢â‚¬â€ not load-tested. Architecture (ISR + CDN) expected to handle 10x this volume. |
| **Dependencies** | Vercel Pro plan automatic scaling; Supabase free tier connection pool limits (15 connections) |
| **Acceptance Criteria** | Zero 5xx errors under 100 concurrent users; page load times remain < 2x baseline; Supabase connection pool does not saturate |

### NFR-SCL-02: AI Chat Concurrency

| Field | Value |
|-------|-------|
| **Category** | Scalability |
| **Priority** | P2 Ã¢â‚¬â€ Medium |
| **Description** | The AI chat service must support up to 50 concurrent streaming sessions without degrading response quality or timing out. |
| **Metric / Target** | 50 concurrent SSE sessions; TTFB remains < 1s at peak; no session drops |
| **Measurement Method** | Load test simulating 50 simultaneous chat requests. Monitor FastAPI process memory, OpenAI rate limits, SSE connection stability. |
| **Current Status** | Ã°Å¸â€Â´ Not implemented Ã¢â‚¬â€ AI service is a stub |
| **Dependencies** | FastAPI async implementation, OpenAI API rate limit management, response caching, session pooling |
| **Acceptance Criteria** | 50 concurrent sessions complete without error; memory stays < 512MB; no OpenAI 429 errors |

### NFR-SCL-03: Build Performance

| Field | Value |
|-------|-------|
| **Category** | Scalability |
| **Priority** | P2 Ã¢â‚¬â€ Medium |
| **Description** | The full monorepo build must complete within 3 minutes on CI to maintain fast feedback loops and enable multiple deployments per day. |
| **Metric / Target** | < 3 minutes full `npm run build`; < 1 minute for single-package builds with Turborepo cache |
| **Measurement Method** | GitHub Actions workflow duration tracking. Turborepo remote cache hit rate monitoring. |
| **Current Status** | Ã°Å¸Å¸Â¡ Configurable Ã¢â‚¬â€ Turborepo configured with task dependencies and outputs. Remote caching not yet configured. |
| **Dependencies** | Turborepo remote caching (Vercel Remote Caching or custom), CI runner performance |
| **Acceptance Criteria** | Full cold build < 3 min; cached build < 30s; cache hit rate > 80% on non-root PRs |

---

## 3. Availability NFRs

### NFR-AVL-01: Public Page Uptime

| Field | Value |
|-------|-------|
| **Category** | Availability |
| **Priority** | P0 Ã¢â‚¬â€ Critical |
| **Description** | Public portfolio pages must achieve 99.9% uptime. The portfolio is the owner's digital storefront Ã¢â‚¬â€ downtime directly impacts career and business opportunities. |
| **Metric / Target** | 99.9% uptime (< 8.77 hours/year); 99.99% uptime for static/CDN-served content |
| **Measurement Method** | Vercel status page + external monitoring (Better Uptime or Checkly) pinging homepage every 60s from 3 global regions. |
| **Current Status** | Ã°Å¸Å¸Â¢ Not yet deployed, but Vercel's SLA and CDN architecture make this achievable. Supabase SLA: 99.95%. |
| **Dependencies** | Vercel Enterprise SLA, Supabase Pro SLA, DNS (Cloudflare or Vercel) |
| **Acceptance Criteria** | Rolling 12-month uptime Ã¢â€°Â¥ 99.9%; no single outage exceeding 30 minutes during business hours (8am-8pm ET) |

### NFR-AVL-02: API Uptime

| Field | Value |
|-------|-------|
| **Category** | Availability |
| **Priority** | P1 Ã¢â‚¬â€ High |
| **Description** | The NestJS API must achieve 99.5% uptime. API downtime blocks admin dashboard access and ISR revalidation but does not affect cached public pages. |
| **Metric / Target** | 99.5% uptime (< 43.8 hours/year); admin login always available |
| **Measurement Method** | Sentry Cron Monitoring + external endpoint check on `/api/health` every 5 minutes. |
| **Current Status** | Ã°Å¸Å¸Â¡ Not deployed Ã¢â‚¬â€ architecture supports health checks, graceful shutdown, and Docker restart policies |
| **Dependencies** | Docker host uptime, Supabase availability, Redis availability |
| **Acceptance Criteria** | Rolling 12-month uptime Ã¢â€°Â¥ 99.5%; health check endpoint responds < 500ms; auto-recovery on process crash |

---

## 4. Security NFRs

### NFR-SEC-01: OWASP Top 10:2025 Compliance

| Field | Value |
|-------|-------|
| **Category** | Security |
| **Priority** | P0 Ã¢â‚¬â€ Critical |
| **Description** | The entire platform must comply with OWASP Top 10:2025. This is non-negotiable for a portfolio that handles personal data (leads, admin access) and represents engineering capability. |
| **Metric / Target** | 100% pass on OWASP Top 10:2025 automated scan; zero critical or high findings in manual pen test |
| **Measurement Method** | Annual penetration test by security professional; automated scanning (OWASP ZAP or Burp Suite) on every release. Track via Sentry Security. |
| **Current Status** | Ã°Å¸Å¸Â¡ Designed Ã¢â‚¬â€ architecture addresses all categories (Helmet, parameterized queries, CSP, input validation, rate limiting, JWT). Not verified. |
| **Dependencies** | Security audit schedule, penetration testing budget, automated scanning integration |
| **Acceptance Criteria** | Zero critical/high findings; automated scan pass rate > 95%; all medium findings resolved within 90 days |

### NFR-SEC-02: Authentication Integrity

| Field | Value |
|-------|-------|
| **Category** | Security |
| **Priority** | P0 Ã¢â‚¬â€ Critical |
| **Description** | JWT access tokens must have 15-minute TTL with Redis-backed refresh tokens (7-day TTL). OAuth (Google/GitHub) handles social login. Account lockout after 5 failed attempts (15-min cooldown). |
| **Metric / Target** | 15-min access token TTL; 7-day refresh token; < 100ms token verification; account lockout at 5 failures |
| **Measurement Method** | Automated auth integration tests verify token expiry, refresh flow, lockout behavior. Monitor auth failure rate in Sentry. |
| **Current Status** | Ã°Å¸Å¸Â¡ Designed Ã¢â‚¬â€ NestJS Passport.js strategies defined, guards implemented at module level. Notification service for lockout alerts is placeholder. |
| **Dependencies** | Auth module implementation, Redis configuration, email notification service |
| **Acceptance Criteria** | Token refresh succeeds within 15-30 min window; lockout activates on 5th failure; lockout notification sent to admin email |

### NFR-SEC-03: Row-Level Security

| Field | Value |
|-------|-------|
| **Category** | Security |
| **Priority** | P0 Ã¢â‚¬â€ Critical |
| **Description** | All 37 Prisma models must have Supabase RLS policies enforcing that users can only access their own data. This prevents horizontal privilege escalation even if an API token is compromised. |
| **Metric / Target** | 100% of tables (37/37) have RLS policies; admin role bypass via `service_role` key in `apps/api` only |
| **Measurement Method** | Automated RLS audit script enumerates all tables and checks for active RLS policies. Run on schema migration. |
| **Current Status** | Ã°Å¸Å¸Â¡ Designed Ã¢â‚¬â€ Prisma schema defines 37 models. RLS policies not yet applied. |v
| **Dependencies** | Prisma schema finalization, Supabase RLS policy creation, API service role configuration |
| **Acceptance Criteria** | All 37 tables have RLS enabled; direct table access returns empty set without proper auth; API endpoints function correctly via service role |

### NFR-SEC-04: Rate Limiting

| Field | Value |
|-------|-------|
| **Category** | Security |
| **Priority** | P1 Ã¢â‚¬â€ High |
| **Description** | All API endpoints must have rate limiting with per-route tiers. This prevents abuse of public endpoints (contact form, AI chat) and brute-force attacks on auth endpoints. |
| **Metric / Target** | Auth: 5 req/15min; Lead POST: 10 req/15min; AI: 20 req/min; Default: 100 req/15min; Admin: 1000 req/15min |
| **Measurement Method** | `@nestjs/throttler` global guard with per-route `@Throttle()` overrides. Monitor throttled responses via Sentry. |
| **Current Status** | Ã¢Å“â€¦ Designed Ã¢â‚¬â€ `ThrottlerModule` configured in `main.ts`; per-endpoint tiers defined in architecture. Rate limit headers (`X-RateLimit-*`) returned on every response. |
| **Dependencies** | None Ã¢â‚¬â€ `@nestjs/throttler` is configured |
| **Acceptance Criteria** | Rate limit headers present on all responses; limits enforced correctly per tier; throttled requests return 429 with `Retry-After` header |

---

## 5. Maintainability NFRs

### NFR-MNT-01: Three-Layer Module Pattern

| Field | Value |
|-------|-------|
| **Category** | Maintainability |
| **Priority** | P0 Ã¢â‚¬â€ Critical |
| **Description** | Every API entity must follow the three-layer NestJS pattern: business logic in `src/modules/<entity>/`, public controllers in `src/portfolio/controllers/`, admin CRUD controllers in `src/admin/controllers/`. This separates concerns and enables the Portfolio module and Admin module to independently expose the same service. |
| **Metric / Target** | 100% of entities (16+ CRUD) follow three-layer pattern; zero controllers in `modules/`; zero business logic in controllers |
| **Measurement Method** | Automated lint rule enforces import paths; code review checklist verifies pattern compliance for every new entity PR |
| **Current Status** | Ã¢Å“â€¦ Implemented Ã¢â‚¬â€ pattern defined in `AGENTS.md` and enforced by convention. Scaffolding for Sections, Projects, Skills, Leads, Analytics modules follows this pattern. |
| **Dependencies** | None Ã¢â‚¬â€ this is a convention enforced during development |
| **Acceptance Criteria** | New entity PRs automatically fail review if they violate the pattern; 100% of existing entities conform |

### NFR-MNT-02: Shared Types as Single Source of Truth

| Field | Value |
|-------|-------|
| **Category** | Maintainability |
| **Priority** | P0 Ã¢â‚¬â€ Critical |
| **Description** | All TypeScript types and Zod schemas shared between `apps/web` and `apps/api` must live in `packages/shared` and be imported as `@portfolio/shared`. No type duplication across packages. |
| **Metric / Target** | 0 duplicated type definitions across `apps/web` and `apps/api`; `packages/shared` is the single import source |
| **Measurement Method** | Automated lint rule (`import/no-restricted-paths` or custom ESLint plugin) bans local type definitions where a shared equivalent exists. |
| **Current Status** | Ã¢Å“â€¦ Implemented Ã¢â‚¬â€ `packages/shared` contains Section, Project, Skill, Lead interfaces with Zod schemas |
| **Dependencies** | None Ã¢â‚¬â€ convention established |
| **Acceptance Criteria** | CI fails if local type duplicates shared type; `packages/shared` is the default import path for cross-app types |

---

## 6. Reliability NFRs

### NFR-RLB-01: ISR Cache Resilience

| Field | Value |
|-------|-------|
| **Category** | Reliability |
| **Priority** | P1 Ã¢â‚¬â€ High |
| **Description** | Incremental Static Regeneration with 60s revalidation for public pages. If the API is down during revalidation, the stale cache must continue serving. This ensures the portfolio remains visible even during backend maintenance. |
| **Metric / Target** | 60s revalidation for project/section pages; 300s for blog pages; stale-while-revalidate behavior must never show 5xx to end users |
| **Measurement Method** | Simulate API downtime during revalidation window; verify stale cache serves correctly. Monitor `stale-while-revalidate` hit rate in Vercel Analytics. |
| **Current Status** | Ã°Å¸Å¸Â¡ Designed but untested Ã¢â‚¬â€ Next.js ISR supports `stale-while-revalidate` via `fetch` options |
| **Dependencies** | Next.js ISR implementation, API health check integration, revalidation endpoint configuration |
| **Acceptance Criteria** | Zero end-user-facing errors during 5-minute API outage; stale cache serves within < 50ms; revalidation completes within 60s of API recovery |

### NFR-RLB-02: Background Job Persistence

| Field | Value |
|-------|-------|
| **Category** | Reliability |
| **Priority** | P2 Ã¢â‚¬â€ Medium |
| **Description** | Background jobs (email sending, analytics aggregation, content export) must persist through service restarts via BullMQ backed by Redis. Failed jobs must retry with exponential backoff (3 attempts: 30s, 2min, 10min). |
| **Metric / Target** | 100% job persistence across restarts; 3 retry attempts; max 10min delay before dead-letter; email delivery within 60s of submission |
| **Measurement Method** | BullMQ dashboard (Bull Board) monitoring queue depth, job completion rate, failure rate. Integration tests verify retry behavior. |
| **Current Status** | Ã°Å¸â€Â´ Not implemented Ã¢â‚¬â€ BullMQ dependencies listed, queue structure designed |
| **Dependencies** | Redis instance, BullMQ module implementation, worker process configuration |
| **Acceptance Criteria** | Jobs survive service restart; retries occur at specified intervals; dead-letter queue captures jobs exceeding retry limit; alert fires on dead-letter queue growth |

### NFR-RLB-03: Graceful Degradation

| Field | Value |
|-------|-------|
| **Category** | Reliability |
| **Priority** | P1 Ã¢â‚¬â€ High |
| **Description** | The frontend must gracefully degrade when downstream services are unavailable. Specifically: 3D scenes fall back to static images when WebGL fails; AI assistant shows "unavailable" message when FastAPI is down; API failures show cached data or friendly error states. |
| **Metric / Target** | Zero blank pages or unhandled errors in any failure scenario; graceful fallback for 3D, AI, and API |
| **Measurement Method** | Simulate each failure scenario (WebGL disabled, API 500, FastAPI offline) and verify fallback behavior in Playwright E2E tests. |
| **Current Status** | Ã°Å¸â€Â´ Not implemented Ã¢â‚¬â€ architecture designed for progressive enhancement |
| **Dependencies** | Component implementation, error boundary configuration, loading state management |
| **Acceptance Criteria** | Disabling WebGL shows static 2D content; `/ai-assistant` shows "currently unavailable" with contact form fallback; API 500 shows cached or skeleton UI, never a white screen |

---

## 7. Compliance NFRs

### NFR-CMP-01: GDPR Right to Erasure

| Field | Value |
|-------|-------|
| **Category** | Compliance |
| **Priority** | P1 Ã¢â‚¬â€ High |
| **Description** | Users must be able to request deletion of their personal data (leads, contact form submissions). The admin dashboard includes a "GDPR Erase" action that anonymizes all personal identifiers while retaining non-personal analytics data. |
| **Metric / Target** | Erasure request completed within 30 days (GDPR statutory limit); personally identifiable data anonymized within 24 hours of admin action |
| **Measurement Method** | Integration test verifies erasure endpoint zeroes out name, email, phone, IP, and user agent fields while preserving record ID and timestamp. |
| **Current Status** | Ã¢Å“â€¦ Implemented Ã¢â‚¬â€ `LeadsService` includes `anonymizeLead()` method that nullifies PII fields |
| **Dependencies** | Leads module implementation complete |
| **Acceptance Criteria** | After erasure, lead record shows `[anonymized]` for all PII fields; original data unrecoverable; audit log records erasure action |

### NFR-CMP-02: CCPA Opt-Out

| Field | Value |
|-------|-------|
| **Category** | Compliance |
| **Priority** | P2 Ã¢â‚¬â€ Medium |
| **Description** | The site must provide a "Do Not Sell My Personal Information" opt-out mechanism, implemented as a cookie-based preference stored in the user's browser. No analytics data collected when opt-out is active. |
| **Metric / Target** | Opt-out stored for 12 months; PostHog tracking disabled on opt-out; cookie consent banner displayed on first visit |
| **Measurement Method** | Playwright test verifies consent banner appears, opt-out disables PostHog, preference persists across sessions |
| **Current Status** | Ã¢Å“â€¦ Implemented Ã¢â‚¬â€ cookie consent banner with CCPA option exists in design |
| **Dependencies** | PostHog configuration, cookie storage implementation |
| **Acceptance Criteria** | Consent banner appears on first visit; opt-out sets `ccpa_opt_out=true` cookie; PostHog `identify()` not called when opt-out active |

### NFR-CMP-03: WCAG 2.2 AA Compliance

| Field | Value |
|-------|-------|
| **Category** | Compliance |
| **Priority** | P1 Ã¢â‚¬â€ High |
| **Description** | All public pages and admin dashboard must comply with WCAG 2.2 AA standards. This includes proper heading hierarchy, ARIA labels, keyboard navigation, focus management, color contrast (4.5:1 minimum), reduced motion support, and screen reader compatibility. |
| **Metric / Target** | 100% of pages pass automated WCAG 2.2 AA audit; manual audit quarterly by accessibility specialist |
| **Measurement Method** | Lighthouse Accessibility score Ã¢â€°Â¥ 95; axe-core automated testing in CI; manual keyboard navigation audit on every major release |
| **Current Status** | Ã°Å¸Å¸Â¡ Designed Ã¢â‚¬â€ color palette chosen for contrast compliance; `prefers-reduced-motion` planned; skip-to-content link in root layout. Not audited. |
| **Dependencies** | Component implementation with ARIA attributes; focus management for modals and dropdowns; motion system respecting reduced-motion preference |
| **Acceptance Criteria** | Lighthouse Accessibility Ã¢â€°Â¥ 95; axe-core finds zero critical/serious issues; full keyboard navigation through all interactive elements; screen reader (VoiceOver/NVDA) can access all content |

### NFR-CMP-04: SOC 2 Readiness

| Field | Value |
|-------|-------|
| **Category** | Compliance |
| **Priority** | P3 Ã¢â‚¬â€ Low |
| **Description** | The platform should be architected for future SOC 2 Type II certification readiness. This means maintaining audit logs, access controls, change management, and security monitoring aligned with Trust Service Criteria. |
| **Metric / Target** | SOC 2 readiness roadmap documented; gap analysis complete; controls mapped to Trust Service Criteria |
| **Measurement Method** | Annual SOC 2 readiness assessment against Trust Service Criteria (Security, Availability, Processing Integrity, Confidentiality, Privacy) |
| **Current Status** | Ã°Å¸Å¸Â¡ In progress Ã¢â‚¬â€ SOC 2 readiness document (`docs/standards/soc2-readiness.md`) completed with gap analysis and 6-month roadmap |
| **Dependencies** | Formal SOC 2 audit budget; compliance officer or external assessor; additional controls for change management and vendor management |
| **Acceptance Criteria** | All gap items in readiness document resolved; controls operational for 6 months; external readiness assessment confirms audit readiness |

---

## 8. Portability NFRs

### NFR-PRT-01: Docker Containerization

| Field | Value |
|-------|-------|
| **Category** | Portability |
| **Priority** | P1 Ã¢â‚¬â€ High |
| **Description** | The API (NestJS) and AI (FastAPI) services must be fully containerized with multi-stage Dockerfiles. The frontend (Next.js) is Vercel-deployed but must also build via Docker for local development and alternative hosting. |
| **Metric / Target** | Docker images < 500MB (production); build time < 5 minutes per image; zero host-specific dependencies |
| **Measurement Method** | `docker build` passes with `--no-cache` on clean checkout; image size checked via `docker images`; multi-stage verification |
| **Current Status** | Ã¢Å“â€¦ Implemented Ã¢â‚¬â€ `infrastructure/docker/` contains multi-stage Dockerfiles for web, api, and ai. Docker Compose orchestrates all three. |
| **Dependencies** | Docker Engine Ã¢â€°Â¥ 24; Docker Compose v2 |
| **Acceptance Criteria** | `docker compose up --build` starts all three services; images build without errors; production images < 300MB (api), < 500MB (ai) |

### NFR-PRT-02: Vercel Deployability

| Field | Value |
|-------|-------|
| **Category** | Portability |
| **Priority** | P0 Ã¢â‚¬â€ Critical |
| **Description** | The Next.js frontend must be deployable to Vercel with zero configuration changes. This is the primary deployment target for the public-facing site. |
| **Metric / Target** | Deploy via `vercel --prod` or Git push succeeds without errors; preview deployments for every PR branch |
| **Measurement Method** | Automated Vercel deployment via GitHub Actions on merge to `main`; preview deployments on PR creation |
| **Current Status** | Ã¢Å“â€¦ Implemented Ã¢â‚¬â€ Next.js 14 App Router is Vercel-native; `vercel.json` not yet configured but defaults are sufficient |
| **Dependencies** | Vercel account, GitHub integration, environment variables configured in Vercel dashboard |
| **Acceptance Criteria** | `git push main` triggers automatic production deploy; PRs create preview deployments with unique URLs; environment variables sync correctly |

---

## 9. NFR Priorities Definitions

| Priority | Label | Description | Required Action |
|----------|-------|-------------|----------------|
| **P0** | Critical | Must be satisfied for MVP launch. Failure blocks release. | Implement before v1.0 |
| **P1** | High | Must be satisfied within first 3 months post-launch. | Prioritized for v1.1 |
| **P2** | Medium | Important but can wait up to 6 months post-launch. | Planned for v1.2+ |
| **P3** | Low | Nice-to-have. No committed timeline. | Roadmap item |

---

## 10. Change Log

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| July 2026 | 1.0 | CTO | Initial NFR document Ã¢â‚¬â€ 18 requirements across 8 categories |

## Cross-References
- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system