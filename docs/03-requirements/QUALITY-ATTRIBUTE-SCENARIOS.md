# Quality Attribute Scenarios — Portfolio Platform

> **Document:** `03-requirements/QUALITY-ATTRIBUTE-SCENARIOS.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Owner:** CTO | **Status:** ✅ Active | **Review Cadence:** Quarterly

---

## Scenario Format

Each scenario follows the standard quality attribute scenario structure:

> **Source** (who/what initiates) → **Stimulus** (what happens) → **Artifact** (which system component) → **Environment** (under what conditions) → **Response** (how the system reacts) → **Response Measure** (how we verify)

---

## Scenario 1: Performance — Concurrent API Requests

| Field | Value |
|-------|-------|
| **ID** | QAS-PRF-01 |
| **Quality Attribute** | Performance |
| **Scenario** | A recruiter loads the portfolio homepage while 9 other visitors simultaneously browse projects and skills pages. |
| **Source** | 10 concurrent anonymous visitors via browser |
| **Stimulus** | Simultaneous HTTP GET requests to `/` (homepage), `/projects`, `/skills`, `/api/portfolio/sections` |
| **Artifact** | Vercel CDN → Next.js ISR cache → NestJS API (on cache miss) |
| **Environment** | Normal operation. 60s after last ISR revalidation. 50ms network latency (median). Desktop browsers with 100Mbps connections. |
| **Response** | The CDN serves cached pages within 50ms. On cache miss, the API responds within 100ms and the page is served within 200ms. No requests queue longer than 500ms. |
| **Response Measure** | 95th percentile TTFB < 50ms for CDN hits; p95 API response < 100ms; zero 5xx errors; all pages fully rendered within 2s LCP |
| **Verification Method** | k6 load test: 10 VUs, 60s duration, ramp-up over 10s. Monitor TTFB, LCP, error rate via Vercel Analytics + Sentry. |
| **Current Status** | 🔴 Not tested — system not deployed |

---

## Scenario 2: Availability — Database Failover

| Field | Value |
|-------|-------|
| **ID** | QAS-AVL-01 |
| **Quality Attribute** | Availability |
| **Scenario** | Supabase PostgreSQL primary instance becomes unavailable during a regional outage. |
| **Source** | Supabase infrastructure failure (AWS us-east-1 region) |
| **Stimulus** | Database connection timeout. All API queries to Supabase fail with connection refused. |
| **Artifact** | NestJS API → PrismaService → Supabase PostgreSQL connection pool |
| **Environment** | Peak traffic (estimated 50 concurrent users). 30 minutes into a 2-hour regional AWS outage. |
| **Response** | The API returns a 503 Service Unavailable for any request requiring database access. Public pages served from ISR cache continue to function normally. The health check endpoint (`/api/health`) returns `{"status":"degraded","message":"database unavailable"}` with a 200 status. The admin dashboard shows a "Database Offline" banner. Sentry alert fires within 1 minute. |
| **Response Measure** | Public pages 100% available (served from CDN/ISR). API returns 503 (not 5xx error or hang). Health endpoint responds < 1s. Alert notification received within 5 minutes. Zero data loss upon recovery. |
| **Verification Method** | Chaos engineering: block outbound traffic to Supabase host via iptables/Docker network policy. Verify ISR cache continues serving, API returns 503, alert fires. |
| **Current Status** | 🔴 Not tested — architecture supports ISR cache resilience but failover behavior not verified |

---

## Scenario 3: Security — Unauthorized Access Attempt

| Field | Value |
|-------|-------|
| **ID** | QAS-SEC-01 |
| **Quality Attribute** | Security |
| **Scenario** | An attacker attempts to access the admin CRUD endpoint `POST /api/admin/projects` without a valid JWT token. |
| **Source** | External attacker (unauthenticated HTTP client) |
| **Stimulus** | HTTP POST request to `POST /api/admin/projects` with `Authorization` header missing. Payload: `{"title":"malicious project"}` |
| **Artifact** | NestJS API Gateway → JwtAuthGuard on `AdminModule` → RoutesGuard → controller |
| **Environment** | Normal operation. System is live and accessible from the public internet. Attacker is on the same network (coffee shop or public WiFi). |
| **Response** | The `JwtAuthGuard` rejects the request before any controller logic executes. Returns HTTP 401 Unauthorized with JSON body `{"statusCode":401,"message":"Unauthorized","error":"Missing or invalid JWT token"}`. The request is logged by the logging interceptor with `level: 'warn'` including source IP, timestamp, and attempted resource. The rate limiter counter is incremented. |
| **Response Measure** | Response time < 10ms (guard check only, no DB call). 401 status returned. No controller code executes. Audit log entry created with IP, timestamp, user agent. Rate limiter tracks the attempt. |
| **Verification Method** | Integration test: `request(app.getHttpServer()).post('/api/admin/projects').send({...}).expect(401)`. Penetration test: automated scan for unprotected admin endpoints. |
| **Current Status** | 🟢 Designed and guard-implemented — `JwtAuthGuard` applied globally to `AdminModule`. Verification pending via integration tests. |

---

## Scenario 4: Modifiability — Adding a New Entity Type

| Field | Value |
|-------|-------|
| **ID** | QAS-MDF-01 |
| **Quality Attribute** | Modifiability |
| **Scenario** | The product owner requests a new "Certifications" entity to be added to the portfolio, including public display and admin CRUD. |
| **Source** | Product owner via feature request |
| **Stimulus** | Developer creates a new Certifications entity with fields: `id`, `name`, `issuer`, `issueDate`, `expiryDate`, `credentialUrl`, `description`, `displayOrder`, `isVisible` |
| **Artifact** | All three layers of the API: `src/modules/certifications/`, `src/portfolio/controllers/certifications.controller.ts`, `src/admin/controllers/certifications.controller.ts`, plus Prisma schema, `packages/shared` types, and frontend components |
| **Environment** | Normal development workflow. The developer has local environment, access to the codebase, and 2 hours to implement. |
| **Response** | The developer follows the established three-layer pattern: (1) Add `certifications` model to Prisma schema and run migration, (2) Create `CertificationsService` in `src/modules/certifications/` with `dto/`, (3) Create public controller in `src/portfolio/controllers/` with `@CacheTTL(60)` GET endpoints, (4) Create admin controller in `src/admin/controllers/` with `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Audit` for all CRUD, (5) Register both controllers in their respective modules, (6) Add `Certification` type + Zod schema to `packages/shared`. Total new files: 6. Lines changed in existing files: < 20. |
| **Response Measure** | Complete implementation in < 2 hours. Zero existing code modified beyond registration imports. TypeScript compilation passes on first attempt. All three layers functional: public GET, admin CRUD, audit logging. |
| **Verification Method** | Pair programming or code review measures time. Compare `git diff --stat` to expected < 20 lines changed in existing files. |
| **Current Status** | 🟢 Pattern established — three scaffolded entity examples exist (Sections, Projects, Skills) confirming the pattern works |

---

## Scenario 5: Usability — First-Time Admin Navigation

| Field | Value |
|-------|-------|
| **ID** | QAS-USB-01 |
| **Quality Attribute** | Usability |
| **Scenario** | A first-time administrator logs into the admin dashboard and needs to update a project's description and add a new skill category. |
| **Source** | First-time admin user (portfolio owner) |
| **Stimulus** | User navigates to `/admin/login`, authenticates via Google OAuth, lands on `/admin` dashboard, clicks "Projects" in sidebar, edits a project, navigates to "Skills", adds a new skill |
| **Artifact** | Admin SPA (Next.js client-side render) → TanStack React Query → NestJS API |
| **Environment** | Desktop browser (1920x1080). Normal network conditions. User has never used the admin panel before. |
| **Response** | Login completes within 3 seconds (OAuth redirect + JWT issuance). Dashboard loads within 2 seconds with skeleton loaders. Sidebar navigation is keyboard-accessible with clear labels. The projects DataTable is sortable by column headers, searchable via a visible search input. Edits save with optimistic UI updates and a success toast. New skill creation uses a modal dialog with validation, auto-refreshes the skill list on success. |
| **Response Measure** | Task completion time < 5 minutes for both actions (edit project + add skill). Zero errors or confusing states. No more than 2 clicks to reach any admin section. All interactive elements have visible focus indicators. |
| **Verification Method** | Task-based usability test with 3 participants who have never seen the admin panel. Track time-on-task, error rate, and System Usability Scale (SUS) score. Target SUS ≥ 80. |
| **Current Status** | 🔴 Not testable — admin dashboard not yet implemented |

---

## Scenario 6: Scalability — Traffic Spike

| Field | Value |
|-------|-------|
| **ID** | QAS-SCL-01 |
| **Quality Attribute** | Scalability |
| **Scenario** | The portfolio is featured on Hacker News front page, driving 5,000 simultaneous visitors within 10 minutes. |
| **Source** | Hacker News audience (5,000 concurrent visitors, 50% mobile, global distribution) |
| **Stimulus** | 5,000 HTTP GET requests per minute to `/`, `/projects`, `/blog`, and `/ai-assistant`. Spike duration: 2 hours. |
| **Artifact** | Vercel CDN → Next.js ISR → NestJS API → Supabase PostgreSQL. AI service (FastAPI) receives 100 concurrent chat requests. |
| **Environment** | Sudden traffic spike (10x normal). 70% of visitors are from US/EU, 30% from Asia-Pacific. Mix of desktop and mobile devices. |
| **Response** | Public ISR pages serve from CDN edge with < 50ms TTFB for 95% of requests. The API handles increased load with no degradation (p95 < 100ms). Supabase connection pool (15 connections on free tier) does not saturate. AI chat gracefully rate-limits to 20 req/min per IP; returns 429 with `Retry-After` for excess. CDN offloads > 95% of public page requests. Vercel auto-scales serverless functions. PostHog captures all analytics without data loss. |
| **Response Measure** | Zero 5xx errors on public pages. API p95 response time < 200ms. CDN cache hit ratio > 95%. AI chat 429 rate < 5% of total AI requests (rate limit is per-IP, not total). Supabase connection pool < 90% utilization. All analytics events recorded. |
| **Verification Method** | Load test using k6: 5,000 RPS ramp-up over 10 minutes, sustained for 1 hour. Simulate global traffic from 3 regions (US, EU, APAC). Monitor all service metrics. |
| **Current Status** | 🔴 Not tested — load testing infrastructure not configured |

---

## Scenario 7: Testability — Running the Test Suite

| Field | Value |
|-------|-------|
| **ID** | QAS-TST-01 |
| **Quality Attribute** | Testability |
| **Scenario** | A developer runs the full test suite after modifying the `LeadsModule` to add a CSV export feature. |
| **Source** | Developer after code change |
| **Stimulus** | Developer runs `cd apps/api && npm test` and `cd apps/web && npm test` |
| **Artifact** | Jest (API) + Vitest (Web) + Playwright (E2E). Test DB via GitHub Actions Postgres service container. |
| **Environment** | Local development environment or CI. Tests run against a clean test database with seed data. No external services required (Supabase, OpenAI, Redis mocked). |
| **Response** | API unit tests complete within 30 seconds verifying `LeadsService.create()`, `LeadsService.findAll()`, `LeadsService.exportCSV()`. Integration tests complete within 2 minutes verifying the full request/response cycle through controller → guard → service → Prisma mock. E2E tests complete within 5 minutes via Playwright against a local Next.js dev server. Coverage report shows ≥ 80% line coverage for `LeadsModule`. |
| **Response Measure** | Full test suite < 10 minutes. Unit tests < 30s. Integration tests < 2 min. E2E tests < 5 min. Coverage ≥ 80% for modified module. Zero flaky tests (pass rate 100% over 5 consecutive runs). |
| **Verification Method** | `npm run test:coverage` generates coverage report. `npm run test:e2e` verifies full flow. Flakiness detection via Jest `--repeatEach=5` flag. |
| **Current Status** | 🔴 Not testable — test frameworks configured (Jest, Vitest, Playwright) but zero tests written. CI Postgres service container ready. |

---

## Scenario 8: Reliability — API Service Restart

| Field | Value |
|-------|-------|
| **ID** | QAS-RLB-01 |
| **Quality Attribute** | Reliability |
| **Scenario** | The NestJS API service crashes due to an unhandled promise rejection and Docker's restart policy automatically restarts it. |
| **Source** | Unhandled error in API process (e.g., Redis connection timeout hitting an unhandled rejection path) |
| **Stimulus** | Process exits with non-zero code. Docker restart policy `unless-stopped` triggers auto-restart. |
| **Artifact** | NestJS API Docker container → Docker daemon → PrismaService → BullMQ queue |
| **Environment** | Production. The API has been running for 3 days. Redis connection pool has 5 active connections. BullMQ has 12 pending email jobs. |
| **Response** | Docker restarts the container within 2 seconds of the crash. BullMQ jobs in "active" state are picked up by the next available worker after lock expiry (default: 30s). PrismaService reconnects to Supabase on first query. Sentry captures the unhandled rejection with full stack trace and logs the event as a critical error. Pino structured logging records the restart event with timestamp and error details. The health check endpoint stabilizes within 5 seconds of restart. Public pages are unaffected (served from ISR cache). |
| **Response Measure** | Container restart completes < 5s. All BullMQ jobs complete within 60s of restart (no job loss). Sentry alert fires < 1 minute. Zero data loss. Zero impact on public page availability. |
| **Verification Method** | Chaos engineering: `docker kill $(docker ps -q --filter name=api)` while a background job is running. Verify auto-restart, job recovery, and alert delivery. |
| **Current Status** | 🟡 Partially testable — Docker restart policy configured in `infrastructure/docker/docker-compose.yml`. BullMQ job recovery depends on Redis lock mechanism. |

---

## Scenario 9: Security — SQL Injection Attempt

| Field | Value |
|-------|-------|
| **ID** | QAS-SEC-02 |
| **Quality Attribute** | Security |
| **Scenario** | An attacker sends a malicious request with SQL injection payload in the project slug parameter. |
| **Source** | External attacker via HTTP GET to `/api/portfolio/projects/1;DROP TABLE projects;--` |
| **Stimulus** | Request with slug containing `1;DROP TABLE projects;--` sent to the public projects endpoint |
| **Artifact** | Vercel Edge → NestJS API → PrismaService → Prisma ORM → Supabase PostgreSQL |
| **Environment** | Production. Attacker is external, unauthenticated. |
| **Response** | Prisma ORM parameterizes all queries — the slug value is treated as a string literal, never interpolated into SQL. The query resolves to `SELECT * FROM projects WHERE slug = $1` with the malicious string as the parameter value. The query returns zero rows (no matching slug). The API returns a 200 with `{"data":[],"meta":{"total":0}}`. No SQL injection occurs. The logging interceptor records the request. |
| **Response Measure** | Query executes safely with zero SQL injection. Response time < 100ms. No database tables affected. Audit log captures the request path and source IP. |
| **Verification Method** | Integration test: `request(app.getHttpServer()).get('/api/portfolio/projects/1;DROP TABLE projects;--').expect(200)` — verification query counts rows before and after (should be identical). |
| **Current Status** | 🟢 Secured by design — Prisma ORM uses parameterized queries exclusively; raw SQL is never executed |

---

## Scenario 10: Performance — AI Response Streaming

| Field | Value |
|-------|-------|
| **ID** | QAS-PRF-02 |
| **Quality Attribute** | Performance |
| **Scenario** | A visitor asks the AI assistant: "What technologies does the developer use for frontend development?" |
| **Source** | Visitor via the `/ai-assistant` page |
| **Stimulus** | POST request to `/api/ai/chat` with `{"message":"What technologies does the developer use for frontend development?","sessionId":"abc123"}` |
| **Artifact** | FastAPI → LangChain → RAG service (pgvector) → OpenAI GPT-4o → SSE stream to browser |
| **Environment** | Normal operation. pgvector index is warm. OpenAI API latency is typical (200-500ms). 5 other concurrent chat sessions active. |
| **Response** | The RAG service retrieves 3 relevant document chunks from pgvector within 100ms. LangChain assembles the context and sends to OpenAI within 200ms. OpenAI begins streaming tokens within 500ms TTFB. The response streams to the browser via SSE at ~50 tokens/second. Total response completes within 4 seconds. |
| **Response Measure** | RAG retrieval < 100ms p95. OpenAI TTFB < 500ms. Streaming rate > 30 tokens/second. Total response < 5s for simple queries. No response caching miss > 10% rate. |
| **Verification Method** | Sentry tracing on FastAPI `/chat` endpoint. Automated test with known query hitting RAG pipeline, measuring each stage. |
| **Current Status** | 🔴 Not testable — AI service not implemented |

---

## Scenario 11: Maintainability — Documentation Update

| Field | Value |
|-------|-------|
| **ID** | QAS-MNT-01 |
| **Quality Attribute** | Maintainability |
| **Scenario** | The architecture owner needs to update the System Architecture document to reflect a new module added to the API. |
| **Source** | Architecture owner |
| **Stimulus** | Edit `docs/architecture/SystemArchitecture.md` to add a "Testimonials" module with Mermaid diagram update and endpoint table row |
| **Artifact** | Documentation repository (`docs/` directory) |
| **Environment** | Normal development workflow. The document is 1,498 lines long. The owner has access to Visual Studio Code with markdown preview. |
| **Response** | The owner finds the correct section in the modular document structure within 30 seconds. The Mermaid diagram is updated in 2 locations (ERD + module dependency diagram). The endpoint table gets one new row. The PR is reviewed and merged within 1 hour. CI validates markdown formatting. The MASTER-INDEX.md entry is updated to reflect the new module. |
| **Response Measure** | Edit location found < 30s (clear TOC + section headers). Mermaid diagrams render correctly after edit. Total changed lines < 20. PR review cycle < 1 hour. |
| **Verification Method** | Measure time-to-locate via TOC. Automate Mermaid rendering check in CI (via `mmdc` CLI). |
| **Current Status** | 🟢 Document structure is modular with clear TOC, consistent sectioning, and Mermaid diagrams |

---

## Scenario 12: Availability — CDN Cache Serving During API Outage

| Field | Value |
|-------|-------|
| **ID** | QAS-AVL-02 |
| **Quality Attribute** | Availability |
| **Scenario** | The NestJS API is down for maintenance (5-minute deploy). A visitor navigates to the portfolio homepage and projects page. |
| **Source** | Visitor browsing the portfolio during API maintenance window |
| **Stimulus** | HTTP GET requests to `/` and `/projects` |
| **Artifact** | Vercel CDN → Next.js ISR cache (stale) |
| **Environment** | API is unreachable (HTTP 503). The ISR cache has a 60s revalidation interval but the revalidation fetch fails. 5 minutes into the 10-minute maintenance window. |
| **Response** | Vercel CDN serves the cached (stale) version of the homepage and projects page. The pages render fully with previously cached content. Background revalidation attempts fail silently — no error is shown to the visitor. Sentry captures the revalidation failure as a warning. The pages continue serving stale content until the API recovers and the next revalidation succeeds. |
| **Response Measure** | TTFB < 50ms (CDN cache hit, despite stale content). LCP < 1.5s. Zero error UI shown to visitor. Revalidation resumes within 60s of API recovery. |
| **Verification Method** | Chaos engineering: stop the API Docker container. Use browser to navigate public pages. Verify content serves correctly. Restart API after 5 minutes and verify revalidation resumes. |
| **Current Status** | 🟡 Designed (ISR with stale-while-revalidate) — not verified via chaos testing |

---

## Change Log

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| July 2026 | 1.0 | CTO | Initial scenarios — 12 scenarios covering 8 quality attributes |
