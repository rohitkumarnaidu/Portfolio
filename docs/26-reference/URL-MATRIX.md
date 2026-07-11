# URL Matrix

> **Last updated:** July 2026 | **Version:** 1.0

---

## Environment URLs

| Environment | Web | API | AI |
|-------------|-----|-----|----|
| **Local Development** | `http://localhost:3000` | `http://localhost:3001` | `http://localhost:8000` |
| **Preview (Vercel)** | `https://portfolio-git-*-username.vercel.app` | — (API served by web) | — |
| **Staging** | `https://staging.portfolio.dev` | — (API served by web) | `https://staging-ai.portfolio.dev` |
| **Production** | `https://portfolio.dev` | — (API served by web) | `https://ai.portfolio.dev` |

> **Note:** The API is served through the Next.js application via API routes or proxied through the same domain. The AI service runs independently on Railway or similar.

---

## Route Tables

### Public Routes (Portfolio)

| Route | Rendering | Cache TTL | Auth |
|-------|-----------|-----------|------|
| `/` | SSG + ISR (revalidate: 60s) | 60s | None |
| `/about` | SSG + ISR | 60s | None |
| `/projects` | SSG + ISR | 60s | None |
| `/projects/[slug]` | ISR (generateStaticParams) | 60s | None |
| `/blog` | SSG + ISR | 60s | None |
| `/blog/[slug]` | ISR (generateStaticParams) | 60s | None |
| `/case-studies` | SSG + ISR | 60s | None |
| `/case-studies/[slug]` | ISR (generateStaticParams) | 60s | None |
| `/contact` | Static | — | None |
| `/ai-assistant` | SSR | None | None |
| `/press` | SSG + ISR | 60s | None |
| `/guest-appearances` | SSG + ISR | 60s | None |
| `/reading-list` | SSG + ISR | 60s | None |
| `/achievements` | SSG + ISR | 60s | None |

### Admin Routes (Dashboard)

| Route | Rendering | Cache TTL | Auth |
|-------|-----------|-----------|------|
| `/admin` | SSR | None | JWT (admin/editor/viewer) |
| `/admin/login` | Static | — | None |
| `/admin/sections` | SSR | None | JWT (admin/editor) |
| `/admin/projects` | SSR | None | JWT (admin/editor) |
| `/admin/blog` | SSR | None | JWT (admin/editor) |
| `/admin/skills` | SSR | None | JWT (admin/editor) |
| `/admin/experiences` | SSR | None | JWT (admin/editor) |
| `/admin/testimonials` | SSR | None | JWT (admin/editor) |
| `/admin/services` | SSR | None | JWT (admin/editor) |
| `/admin/faqs` | SSR | None | JWT (admin/editor) |
| `/admin/leads` | SSR | None | JWT (admin/editor) |
| `/admin/media` | SSR | None | JWT (admin/editor) |
| `/admin/settings` | SSR | None | JWT (admin) |
| `/admin/users` | SSR | None | JWT (admin) |
| `/admin/analytics` | SSR | None | JWT (admin/editor/viewer) |
| `/admin/activities` | SSR | None | JWT (admin/editor/viewer) |
| `/admin/chat` | SSR | None | JWT (admin/editor/viewer) |
| `/admin/feature-flags` | SSR | None | JWT (admin) |
| `/admin/api-keys` | SSR | None | JWT (admin) |
| `/admin/availability` | SSR | None | JWT (admin/editor) |
| `/admin/case-studies` | SSR | None | JWT (admin/editor) |
| `/admin/press-features` | SSR | None | JWT (admin/editor) |
| `/admin/guest-appearances` | SSR | None | JWT (admin/editor) |
| `/admin/reading-list` | SSR | None | JWT (admin/editor) |
| `/admin/achievements` | SSR | None | JWT (admin/editor) |
| `/admin/sandbox` | SSR | None | JWT (admin) |
| `/admin/notifications` | SSR | None | JWT (admin/editor/viewer) |

### API Routes

**Portfolio Controllers (18 — public, read-only):**
| Route | Description |
|-------|-------------|
| `GET /api/portfolio/sections` | Section configuration |
| `GET /api/portfolio/projects` | Project listing + detail by slug |
| `GET /api/portfolio/blog` | Blog listing + detail by slug |
| `GET /api/portfolio/skills` | Skills listing |
| `GET /api/portfolio/experiences` | Work experiences |
| `GET /api/portfolio/testimonials` | Testimonials |
| `GET /api/portfolio/services` | Services listing |
| `GET /api/portfolio/faqs` | FAQ listing |
| `POST /api/portfolio/leads` | Contact form submission |
| `GET /api/portfolio/case-studies` | Case studies |
| `GET /api/portfolio/achievements` | Achievements |
| `GET /api/portfolio/press-features` | Press features |
| `GET /api/portfolio/guest-appearances` | Guest appearances |
| `GET /api/portfolio/reading-list` | Reading list |
| `GET /api/portfolio/availability-status` | Availability status |
| `GET /api/portfolio/analytics/*` | Public analytics |
| `GET /api/portfolio/chat` | Chat session |
| `POST /api/portfolio/feature-flags` | Feature flag evaluation |

**Admin Controllers (26 — authenticated CRUD):**
| Route | Description |
|-------|-------------|
| `GET/POST/PATCH/DELETE /api/admin/sections` | Section CRUD |
| `GET/POST/PATCH/DELETE /api/admin/projects` | Project CRUD |
| `GET/POST/PATCH/DELETE /api/admin/blog` | Blog CRUD |
| `GET/POST/PATCH/DELETE /api/admin/skills` | Skills CRUD |
| `GET/POST/PATCH/DELETE /api/admin/experiences` | Experience CRUD |
| `GET/POST/PATCH/DELETE /api/admin/testimonials` | Testimonial CRUD |
| `GET/POST/PATCH/DELETE /api/admin/services` | Service CRUD |
| `GET/POST/PATCH/DELETE /api/admin/faqs` | FAQ CRUD |
| `GET/POST/PATCH/DELETE /api/admin/leads` | Lead CRUD (admin only) |
| `GET/POST/PATCH/DELETE /api/admin/media` | Media CRUD |
| `GET/POST/PATCH/DELETE /api/admin/case-studies` | Case study CRUD |
| `GET/POST/PATCH/DELETE /api/admin/press-features` | Press feature CRUD |
| `GET/POST/PATCH/DELETE /api/admin/guest-appearances` | Guest appearance CRUD |
| `GET/POST/PATCH/DELETE /api/admin/reading-list` | Reading list CRUD |
| `GET/POST/PATCH/DELETE /api/admin/achievements` | Achievement CRUD |
| `GET/POST/PATCH/DELETE /api/admin/settings` | Settings CRUD (admin only) |
| `GET/POST/PATCH/DELETE /api/admin/users` | User CRUD (admin only) |
| `GET /api/admin/analytics/*` | Analytics queries |
| `GET /api/admin/activities` | Activity log |
| `GET/POST /api/admin/chat` | Chat management |
| `GET/POST/PATCH/DELETE /api/admin/feature-flags` | Feature flags (admin only) |
| `GET/POST/PATCH/DELETE /api/admin/api-keys` | API keys (admin only) |
| `GET/PATCH /api/admin/availability` | Availability status |
| `GET/POST/PATCH/DELETE /api/admin/notifications` | Notifications |
| `GET /api/admin/auth/me` | Current user profile |
| `POST /api/admin/auth/login` | Login / token refresh |

**AI Controllers (5):**
| Route | Description |
|-------|-------------|
| `POST /api/ai/chat` | Chat completion |
| `GET /api/ai/session` | Session management |
| `POST /api/ai/analyze` | Content analysis |
| `GET /api/ai/insights` | AI-driven insights |
| `GET /api/ai/recommendations` | Content recommendations |

**Health Routes:**
| Route | Description |
|-------|-------------|
| `GET /api/health/liveness` | Liveness probe |
| `GET /api/health/readiness` | Readiness probe (DB + Redis + AI check) |

## Caching & Rendering Strategy

| Strategy | Description | Used On |
|----------|-------------|---------|
| **SSG** | Static generation at build time | Landing page, static content |
| **ISR** | Incremental Static Regeneration (60s revalidate) | Portfolio content pages |
| **SSR** | Server-side render on every request | Admin dashboard, AI assistant |
| **Static** | Fully static HTML | Login, contact |

API responses are cached with `@CacheTTL` decorator on portfolio controllers (default: 60s). Admin controllers bypass cache.

## Auth Requirements

| Role | Access |
|------|--------|
| **None (public)** | Portfolio routes, health routes, AI assistant, admin login |
| **viewer** | Admin analytics, activities, chat, notifications |
| **editor** | All viewer + content CRUD (projects, blog, skills, etc.) |
| **admin** | All editor + user management, settings, feature flags, api-keys, sandbox |
