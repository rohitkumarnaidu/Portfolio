# Engineering Principles

Eight principles that guide day-to-day engineering decisions, code reviews, and technical architecture trade-offs. Each includes concrete references to the codebase.

---

## 1. Type Safety End-to-End

TypeScript flows from database models to UI components with zero gaps.

**Practice:** The `@portfolio/shared` workspace (`packages/shared/`) defines all Zod schemas and TypeScript interfaces. Both `apps/web` and `apps/api` import from this single source of truth. The `request<T>()` wrapper in `apps/web/src/lib/api.ts:39` returns strongly typed data via the `ApiResponse<T>` envelope (line 23-26). Zod schemas power validation on both sides Ã¢â‚¬â€ the global `ValidationPipe` at `apps/api/src/main.ts:49-56` validates incoming DTOs with `whitelist: true, forbidNonWhitelisted: true`.

**No `any`:** All 27 React Query hooks at `apps/web/src/lib/hooks/*.ts` use concrete types from `@portfolio/shared`. The `useProjects.ts` hook at line 11 imports `Project` type explicitly.

**Test:** A breaking API change in `packages/shared/` causes a compile-time error in both apps before a deployment is built.

## 2. Security by Design

Security is layered at every tier, not bolted on after the fact.

**Practice:**

**API Gateway Level:** `apps/api/src/main.ts:27-34` configures Helmet with HSTS (maxAge 31536000, includeSubDomains, preload), referrer-policy `strict-origin-when-cross-origin`, and CORS origin allowlist from `CORS_ORIGIN` env var (line 38-47). The global `ThrottlerGuard` prevents abuse.

**Auth Level:** Admin controllers are guarded by `@UseGuards(JwtAuthGuard, RolesGuard)` Ã¢â‚¬â€ every route explicitly declares required roles (`apps/api/src/admin/controllers/*.ts`). JWT tokens are never stored in cookies (only `localStorage` on the client, attached via `Authorization` header at `apps/web/src/lib/api.ts:53-55`).

**Database Level:** Row-Level Security (RLS) policies on Supabase PostgreSQL provide defense-in-depth even if the service role credentials are compromised. The Prisma client connects as a limited-role user for day-to-day operations.

**Rate Limiting:** Public endpoints have per-tier rate limits (default 100/15min). Auth endpoints are stricter (5/15min). Lead submission is capped at 10/15min per IP.

## 3. Performance as a Feature

Speed is a functional requirement, measured in the CI pipeline.

**Practice:**

**ISR for Public Pages:** Portfolio content revalidates via ISR (60s for projects, 300s for blog) as configured in `apps/web/src/app/` layouts. CDN serves cached HTML in < 50ms.

**API Caching:** Portfolio controllers use `@CacheTTL()` with entity-appropriate TTLs:
- Sections: 60s (`apps/api/src/portfolio/controllers/sections.controller.ts:12`)
- Projects: 60s list, 120s detail (`apps/api/src/portfolio/controllers/projects.controller.ts:12,23`)
- Blog: 30s list, 60s detail (`apps/api/src/portfolio/controllers/blog.controller.ts:12,19`)

**Frontend Optimizations:**
- Images via `next/image` with WebP format
- Heavy 3D components (Three.js, React Three Fiber, Drei) loaded via dynamic import
- Fonts via `next/font` with `display: swap`
- Server Components by default, client components only where interactivity is needed

## 4. Accessibility is Not Optional

The portfolio must be navigable by anyone, regardless of ability.

**Practice:**

**Semantic HTML:** All pages use proper heading hierarchies (`h1` -> `h2` -> `h3`), landmark elements (`<main>`, `<nav>`, `<footer>`), and ARIA labels.

**Keyboard Navigation:** All interactive elements (menus, modals, carousels) are keyboard-accessible. The admin dashboard forms have proper `label` associations and error announcements.

**Focus Management:** Route changes preserve focus. Custom focus rings via Tailwind's `focus-visible:ring-2` ensure visible indicators.

**Motion Respect:** `prefers-reduced-motion` disables non-essential animations (GSAP timeline auto-transitions, parallax effects). GSAP ScrollTrigger respects this via `matchMedia()`.

## 5. Documentation as Code

Architectural decisions live next to the code, versioned together.

**Practice:**
- `docs/architecture/` holds 10 architecture documents, each describing a specific concern
- `docs/architecture/SystemArchitecture.md` (1498 lines) is the authoritative system reference with Mermaid diagrams
- Documentation is reviewed alongside code in PRs Ã¢â‚¬â€ changes to the architecture must update the relevant docs
- The `AGENTS.md` file at the repo root captures conventions, commands, and patterns for AI-assisted development

**Key files referenced in docs:**
- `apps/api/src/main.ts` Ã¢â‚¬â€ bootstrap (Helmet, CORS, Pipes, Swagger)
- `apps/api/src/common/filters/global-exception.filter.ts` Ã¢â‚¬â€ error envelope
- `apps/api/src/portfolio/portfolio.module.ts` Ã¢â‚¬â€ module registrations
- `apps/api/src/admin/admin.module.ts` Ã¢â‚¬â€ admin module registrations

## 6. Observability from Day One

Every component produces structured telemetry: logs, metrics, and traces.

**Practice:**

**Structured Logging:** Pino provides JSON-formatted logs with correlation IDs. Each request flows through `apps/api/src/common/filters/global-exception.filter.ts` which attaches `correlationId` (line 21) to every error response.

**Error Tracking:** Sentry is initialized at `apps/api/src/main.ts:16-25` when `SENTRY_DSN` is set. The `GlobalExceptionFilter` (line 55-63) captures 5xx errors to Sentry with request context and user info. Traces sampled at 0.1 in production, 1.0 in development.

**API Monitoring:** Dashboard analytics aggregate page views, lead submissions, and AI chat interactions via `AnalyticsModule` at `apps/api/src/modules/analytics/`.

**Health Endpoints:** The AI service exposes `GET /api/ai/health` (readiness probe) and the NestJS API has `GET /api/portfolio/analytics/summary` for service health indicators.

## 7. Progressive Enhancement

The experience degrades gracefully when JavaScript, 3D, or network features are unavailable.

**Practice:**

**Core Content First:** All public portfolio pages render full content server-side via ISR or SSR. The 3D hero scene (Three.js) is loaded only after the initial HTML is visible. If WebGL fails, a static fallback image displays.

**Form Submission:** Contact forms use progressive enhancement Ã¢â‚¬â€ they work as standard POST forms without JavaScript. When JS loads, they upgrade to AJAX with React Hook Form validation.

**Admin Dashboard:** The admin SPAs are fully functional with JS enabled. Without JS, the server renders a static message directing users to enable JavaScript.

## 8. Fail Fast and Gracefully

Errors should be detected early, reported clearly, and surfaced with actionable information.

**Practice:**

**Validation at Boundaries:** The global `ValidationPipe` in `apps/api/src/main.ts:49-56` rejects invalid requests at the controller boundary with a standardized error envelope. The frontend's `request<T>()` at `apps/web/src/lib/api.ts:65-79` parses this into an `ApiError` with `status_code`, `code`, `message`, and optional `details`.

**Client-Side Error Boundaries:** Next.js error boundaries at `apps/web/src/app/error.tsx` catch rendering errors. Each data-fetching hook handles `isLoading`, `error`, and `data` states explicitly.

**Global Exception Filter:** `apps/api/src/common/filters/global-exception.filter.ts` wraps all unhandled exceptions into the consistent `{ error: { code, message, status_code, details, correlation_id, timestamp, path } }` structure. The `correlation_id` is a UUID that appears in both the API response and the Pino log entry.

## Cross-References
- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system