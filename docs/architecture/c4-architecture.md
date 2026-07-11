# C4 Architecture Documentation

> **Document:** `c4-architecture.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Modeling Standard:** C4 (Context, Container, Component, Code) via Mermaid.js
> **Related:** [SystemArchitecture.md](./SystemArchitecture.md) | [ServiceArchitecture.md](./ServiceArchitecture.md) | [DomainArchitecture.md](./DomainArchitecture.md) | [IntegrationArchitecture.md](./IntegrationArchitecture.md) | [54-INFRASTRUCTURE.md](../operations/54-INFRASTRUCTURE.md)

---

## Level 1: System Context

The System Context diagram shows the Portfolio Platform as a black box and its interactions with external users and systems. This is the highest-level view, establishing boundaries and dependencies.

```mermaid
C4Context
  title System Context diagram for Portfolio Platform

  Person(visitor, "Site Visitor", "A potential client, recruiter, or collaborator browsing the portfolio")
  Person(admin, "Admin User", "Portfolio owner or editor managing content")

  System(portfolio, "Portfolio Platform", "Enterprise portfolio showcasing skills, projects, blog, and AI-powered interaction")

  System_Ext(vercel, "Vercel", "Hosting provider for Next.js frontend and NestJS serverless API; CDN + ISR")
  System_Ext(supabase, "Supabase", "Managed PostgreSQL 15 (pgvector), GoTrue Auth, object storage, Realtime")
  System_Ext(posthog, "PostHog", "Product analytics, session replays, and feature flag management")
  System_Ext(sentry, "Sentry", "Error tracking, performance monitoring, and profiling")
  System_Ext(resend, "Resend", "Transactional email delivery (contact form auto-reply, notifications)")
  System_Ext(openai, "OpenAI", "GPT-4o for chat, text-embedding-3-small for embeddings")
  System_Ext(github, "GitHub", "OAuth identity provider; source control; CI/CD via GitHub Actions")
  System_Ext(google, "Google", "OAuth identity provider for admin login")
  System_Ext(upstash, "Upstash", "Managed Redis for caching, BullMQ queues, and rate limiting")

  Rel(visitor, portfolio, "Browses public pages", "HTTPS")
  Rel(admin, portfolio, "Manages content via Admin SPA", "HTTPS")
  Rel(portfolio, vercel, "Deployed on Vercel Edge + Serverless", "HTTPS")
  Rel(portfolio, supabase, "Reads/Writes data and auth", "TCP/SSL on port 6543")
  Rel(portfolio, posthog, "Sends analytics events", "HTTPS")
  Rel(portfolio, sentry, "Sends error traces and profiles", "HTTPS")
  Rel(portfolio, resend, "Sends transactional emails", "HTTPS")
  Rel(portfolio, openai, "AI chat inference and embeddings", "HTTPS")
  Rel(portfolio, upstash, "Caching and background job queues", "HTTPS")
  Rel(portfolio, github, "OAuth login", "HTTPS")
  Rel(portfolio, google, "OAuth login", "HTTPS")
```

### External System Details

| System | Purpose | Integration Point | Free Tier Limit |
|--------|---------|------------------|-----------------|
| **Vercel** | Edge CDN, ISR caching, serverless compute for web + API | DNS, Deployment via `vercel deploy` | 100 GB bandwidth, 10s timeout |
| **Supabase** | PostgreSQL 15 + pgvector, Auth (GoTrue), Storage (S3-compatible), Realtime | `DATABASE_URL` connection via PgBouncer, REST API | 500 MB DB, 1 GB storage |
| **Upstash** | Redis caching (`CacheService`), BullMQ queues (email, background jobs) | Redis REST + SDK | 10K requests/day |
| **OpenAI** | GPT-4o for AI chat, `text-embedding-3-small` for pgvector embeddings | `apps/ai` FastAPI service via SDK | Pay-as-you-go (~$2–5/mo) |
| **PostHog** | Web analytics, feature flags, session replays | PostHog JS SDK on frontend | 1M events/month |
| **Sentry** | Error tracking, performance traces, profiling | `@sentry/node` in NestJS, `@sentry/nextjs` on web | 5K events/month |
| **Resend** | Contact form emails, admin notifications | NestJS `MailModule` via REST API | 3K emails/month |

---

## Level 2: Container Diagram

The Container diagram zooms into the Portfolio Platform, revealing the three main applications (Web, API, AI) and their data stores. Each container is a separately deployable unit.

```mermaid
C4Container
  title Container diagram for Portfolio Platform

  Person(visitor, "Site Visitor", "Browses portfolio content")
  Person(admin, "Admin User", "Manages portfolio content")

  System_Boundary(platform, "Portfolio Platform") {
    Container(web, "Next.js App", "React 18, TypeScript, Turbopack", "Frontend with App Router, ISR for public pages, client-rendered admin SPA")
    Container(api, "NestJS API", "TypeScript, Express, Prisma", "REST API with 27 service modules; three-layer architecture (module / portfolio / admin)")
    Container(ai, "FastAPI AI Service", "Python 3.12, LangChain, Uvicorn", "AI microservice for chat, content analysis, suggestions, and RAG")

    ContainerDb(db, "PostgreSQL", "Supabase + pgvector", "Primary data store with 7+ core tables, vector embeddings, and RLS policies")
    ContainerDb(cache, "Redis", "Upstash", "API response cache (5 min TTL), BullMQ job queues, rate limiter buckets")
    ContainerDb(storage, "Object Storage", "Supabase Storage (S3 API)", "Image assets, 3D models (GLTF/GLB), file uploads, CDN-backed")
  }

  Rel(visitor, web, "Browses public pages via", "HTTPS")
  Rel(admin, web, "Manages content via Admin SPA", "HTTPS")
  Rel(web, api, "Fetches data via typed fetch wrapper", "HTTPS/JSON, port 3001")
  Rel(web, ai, "Streams AI chat responses", "HTTPS/SSE, port 8000")
  Rel(api, db, "Reads/Writes via Prisma (pg adapter)", "SQL over TCP/SSL")
  Rel(api, cache, "Response caching + job queue", "Redis protocol")
  Rel(ai, db, "Queries embeddings (pgvector)", "SQL over TCP/SSL")
  Rel(ai, cache, "Caches LLM responses and embeddings", "Redis protocol")
  Rel(api, storage, "Uploads and serves media assets", "HTTPS, S3 API")
  Rel(ai, web, "Server-Sent Events for chat", "HTTPS/SSE")
  Rel(api, web, "REST JSON responses", "HTTPS/JSON")

  UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

### Container Communication Summary

| From | To | Protocol | Port | Purpose |
|------|----|----------|------|---------|
| Browser | Next.js | HTTPS | 443/3000 | Page requests, static assets |
| Next.js | NestJS | HTTPS/JSON | 3001 | Data fetching (typed `ApiClient`) |
| Next.js | FastAPI | HTTPS/SSE | 8000 | AI chat streaming |
| NestJS | PostgreSQL | SQL/SSL | 5432/6543 | Prisma ORM operations |
| NestJS | Redis | RESP/HTTPS | — | Cache + queues (Upstash) |
| NestJS | Supabase Storage | HTTPS | — | Image uploads, asset management |
| FastAPI | PostgreSQL | SQL/SSL | 5432/6543 | pgvector embedding queries |
| FastAPI | OpenAI | HTTPS | — | LLM inference, embeddings |

---

## Level 3: Component Diagrams

### Web Container Components

The Next.js application follows the App Router convention with React Server Components for public pages (ISR-cached) and client components for interactive/admin areas. Data fetching is centralized through a typed API client backed by TanStack React Query.

```mermaid
C4Component
  title Web Container — Component diagram

  Container_Boundary(web, "Next.js App") {
    Component(root_layout, "Root Layout", "layout.tsx", "Providers (Theme, Query, PostHog), fonts, global metadata, shared shell")
    Component(public_pages, "Public Pages (ISR)", "app/page.tsx, app/projects/**, etc.", "Server Components rendered at build time + ISR revalidation (60–300s)")
    Component(admin_pages, "Admin Pages (SPA)", "app/admin/**", "Client-rendered authenticated dashboard pages with JWT session")

    Component(api_layer, "API Client Layer", "src/lib/api.ts", "Typed fetch wrapper with envelope unwrapping, error handling, JWT attachment")
    Component(query_layer, "TanStack Query Layer", "src/lib/use-api-query.ts", "Caching, deduplication, optimistic updates, stale-while-revalidate")
    Component(r3f_pipeline, "3D Rendering Pipeline", "src/components/3d/*", "React Three Fiber scenes (Hero, Particles, FloatingShapes), fallbacks, lighting")
    Component(ui_library, "UI Component Library", "src/components/ui/*", "Button, Card, Input, Modal, Tooltip, BottomSheet, FileDropZone")
    Component(section_components, "Section Components", "src/components/sections/*", "Hero, About, Projects, Blog, Contact, Skills, Experience, Testimonials")
    Component(effects_layer, "Motion & Effects", "src/components/effects/*", "Parallax, MeshGradient, DotGrid, DepthScene, GSAP animations")
    Component(chat_ui, "AI Chat UI", "src/components/ai/*, src/components/chat/*", "ChatPanel, MessageBubble, PromptInput, AIBreathingRing, TypingIndicator")
    Component(admin_forms, "Admin Form Components", "src/components/admin/*", "ProjectForm, BlogForm, DataTable, AnalyticsCharts, ImageUpload, SandboxEditor")
  }

  Rel(public_pages, api_layer, "Server-side fetch on ISR revalidation", "HTTP")
  Rel(admin_pages, api_layer, "Client-side data fetching", "HTTP")
  Rel(api_layer, query_layer, "Wraps responses into React Query hooks", "in-process")
  Rel(admin_pages, admin_forms, "Renders CRUD forms", "React")
  Rel(public_pages, section_components, "Composes page from sections", "React")
  Rel(public_pages, effects_layer, "Applies scroll/parallax effects", "React")
  Rel(public_pages, r3f_pipeline, "Renders 3D scenes (Hero, particles)", "React/WebGL")
  Rel(public_pages, chat_ui, "AI assistant interface", "React")
  Rel(admin_pages, chat_ui, "Admin AI analysis panel", "React")
  Rel(public_pages, ui_library, "Uses shared UI primitives", "React")
  Rel(admin_pages, ui_library, "Uses shared UI primitives", "React")
```

### API Container Components

The NestJS API follows a strict three-layer pattern. Business logic lives in `src/modules/` (27 services), public read-only delivery in `src/portfolio/controllers/` (18 controllers), and authenticated CRUD in `src/admin/controllers/` (29 controllers). Cross-cutting concerns are centralized in `src/common/`.

```mermaid
C4Component
  title API Container — Component diagram

  Container_Boundary(api, "NestJS API") {
    Component(bootstrap, "Bootstrap / AppModule", "src/main.ts", "Global pipes (ValidationPipe with whitelist+transform), filters (GlobalExceptionFilter), middleware (Helmet, CORS, compression, API versioning), Swagger docs")

    System_Boundary(modules, "Business Logic Layer — src/modules/") {
      Component(module_projects, "ProjectsModule", "projects.service.ts", "CRUD for portfolio projects, 3D asset references, Markdown content")
      Component(module_blog, "BlogModule", "blog.service.ts", "Blog post management, tags, pagination")
      Component(module_experiences, "ExperiencesModule", "experiences.service.ts", "Work history and timeline entries")
      Component(module_skills, "SkillsModule", "skills.service.ts", "Technical/soft skill taxonomy, link to projects")
      Component(module_auth, "AuthModule", "auth.service.ts", "JWT issue/verify, Passport OAuth strategies (Google, GitHub), role management")
      Component(module_leads, "LeadsModule", "leads.service.ts", "Contact form submissions, auto-reply, CSV export")
      Component(module_chat, "ChatModule", "chat.service.ts", "AI chat session management, message history, cost tracking")
      Component(module_analytics, "AnalyticsModule", "analytics.service.ts", "Page views, event tracking, dashboard aggregation")
      Component(other_modules, "Other Modules (15 more)", "services, sections, faqs, testimonials, case-studies, ...", "Remaining domain services following the same pattern")
    }

    System_Boundary(portfolio_ctrl, "Portfolio Layer — src/portfolio/controllers/") {
      Component(port_projects, "ProjectsController", "portfolio/controllers/projects.controller.ts", "Public GET /api/portfolio/projects, cached with @CacheTTL")
      Component(port_blog, "BlogController", "portfolio/controllers/blog.controller.ts", "Public GET /api/portfolio/blog, cached")
      Component(port_skills, "SkillsController", "portfolio/controllers/skills.controller.ts", "Public GET /api/portfolio/skills, cached")
      Component(port_other, "Other Controllers (15 more)", "portfolio/controllers/*.controller.ts", "Public read-only endpoints, no auth, response-cached")
    }

    System_Boundary(admin_ctrl, "Admin Layer — src/admin/controllers/") {
      Component(admin_projects, "ProjectsController", "admin/controllers/projects.controller.ts", "CRUD @Controller('admin/projects'), @UseGuards(JwtAuthGuard, RolesGuard), @Audit()")
      Component(admin_users, "UsersController", "admin/controllers/users.controller.ts", "User management, role assignment")
      Component(admin_auth, "AuthController", "admin/controllers/auth.controller.ts", "Login, OAuth callback, token refresh")
      Component(admin_export, "ExportController", "admin/controllers/export.controller.ts", "CSV export for leads, analytics data")
      Component(admin_sandbox, "SandboxController", "admin/controllers/sandbox.controller.ts", "WebContainer sandbox management, GitHub commit/deploy")
      Component(admin_other, "Other Controllers (24 more)", "admin/controllers/*.controller.ts", "Admin CRUD for all entities, guarded + audited")
    }

    System_Boundary(common, "Cross-Cutting — src/common/") {
      Component(prisma, "PrismaService", "src/common/database/prisma.service.ts", "Global DatabaseModule, PrismaClient over pg.Pool with pg adapter")
      Component(cache_service, "CacheService", "src/common/cache/cache.service.ts", "Redis-backed response cache, decorator-based TTL")
      Component(queue, "QueueModule", "src/common/queue/*", "BullMQ job processing (email dispatch, background tasks)")
      Component(audit, "AuditDecorator", "src/common/decorators/audit.decorator.ts", "@Audit({action, resource}) for admin mutation tracking")
      Component(filters, "GlobalExceptionFilter", "src/common/filters/global-exception.filter.ts", "Standardized error envelope, Sentry integration")
      Component(export_csv, "CsvService", "src/common/export/csv.service.ts", "Streaming CSV generation for data export")
      Component(notifications, "NotificationModule", "src/common/notifications/*", "Email adapter (Resend), in-app notification templates")
      Component(cleanup, "CleanupService", "src/common/cleanup/cleanup.service.ts", "Scheduled data cleanup, old session purging, storage optimization")
    }
  }

  Rel(port_projects, module_projects, "Delegates to", "method call")
  Rel(port_blog, module_blog, "Delegates to", "method call")
  Rel(port_skills, module_skills, "Delegates to", "method call")
  Rel(admin_projects, module_projects, "Delegates to", "method call")
  Rel(admin_users, module_auth, "Delegates to", "method call")
  Rel(admin_auth, module_auth, "Delegates to", "method call")
  Rel(module_projects, prisma, "Reads/Writes via", "Prisma Client")
  Rel(module_blog, prisma, "Reads/Writes via", "Prisma Client")
  Rel(module_projects, cache_service, "Caches via", "decorator")
  Rel(module_leads, queue, "Enqueues email jobs", "BullMQ")
  Rel(admin_users, audit, "Annotated with", "decorator")
  Rel(admin_projects, audit, "Annotated with", "decorator")

  UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="2")
```

### API Module Inventory

All 27 modules in `apps/api/src/modules/`:

| Module | Service File | Domain |
|--------|-------------|--------|
| `auth` | `auth.service.ts` | JWT, Passport OAuth, role management |
| `users` | `users.service.ts` | Admin user CRUD |
| `projects` | `projects.service.ts` | Portfolio projects |
| `blog` | `blog.service.ts` | Blog posts |
| `experiences` | `experiences.service.ts` | Work history |
| `skills` | `skills.service.ts` | Skill taxonomy |
| `services` | `services.service.ts` | Offerings |
| `sections` | `sections.service.ts` | Page sections |
| `leads` | `leads.service.ts` | Contact form leads |
| `testimonials` | `testimonials.service.ts` | Client testimonials |
| `faqs` | `faqs.service.ts` | FAQ entries |
| `case-studies` | `case-studies.service.ts` | Case studies |
| `achievements` | `achievements.service.ts` | Awards and achievements |
| `press-features` | `press-features.service.ts` | Press mentions |
| `guest-appearances` | `guest-appearances.service.ts` | Podcasts, talks |
| `reading-list-items` | `reading-list-items.service.ts` | Book/article recommendations |
| `chat` | `chat.service.ts` | AI chat sessions |
| `analytics` | `analytics.service.ts` | Event tracking, dashboards |
| `availability-status` | `availability-status.service.ts` | Work availability |
| `feature-flags` | `feature-flags.service.ts` | Feature toggles |
| `media` | `media.service.ts` | Asset management |
| `notifications` | `notifications.service.ts` | Notification dispatch |
| `system-settings` | `system-settings.service.ts` | Global config |
| `api-keys` | `api-keys.service.ts` | API key management |
| `activities` | `activities.service.ts` | Audit log |
| `sandbox` | `github.service.ts` | WebContainer sandbox GitHub integration |
| `cleanup` | `cleanup.service.ts` | Data retention, storage cleanup |

### AI Container Components

The FastAPI AI service handles LLM operations — chat streaming, content analysis, suggestions, and RAG. It routes requests to OpenAI models, manages conversation state, and controls costs.

```mermaid
C4Component
  title AI Container — Component diagram

  Container_Boundary(ai, "FastAPI AI Service") {
    Component(ai_routes, "API Routes", "app/routes/*.py", "chat (SSE), analyze, suggest, agent, health endpoints")
    Component(ai_db, "Database Module", "app/database.py", " asyncpg connection pool, embedding queries via pgvector")
    Component(ai_config, "Config Module", "app/config.py", "Environment-based settings, model selection, cost thresholds")

    System_Boundary(ai_services, "Services Layer") {
      Component(ai_service, "AIService", "services/ai_service.py", "Core LLM orchestration, prompt templating, response streaming")
      Component(rag_service, "RAGService", "services/rag_service.py", "LangChain retriever, pgvector similarity search, context assembly")
      Component(embedding_service, "EmbeddingService", "services/embedding_service.py", "Document chunking, embedding generation via OpenAI, pgvector upsert")
      Component(model_router, "ModelRouter", "services/model_router.py", "Model selection (GPT-4o vs GPT-4o-mini) based on task and cost")
      Component(cost_controller, "CostController", "services/cost_controller.py", "Token accounting, daily/monthly budget enforcement, spend alerts")
      Component(conversation_manager, "ConversationManager", "services/conversation_manager.py", "Multi-turn conversation state, context window management, summarization")
      Component(cache_service, "CacheService", "services/cache_service.py", "Response cache for identical queries, embedding cache, TTL management")
      Component(analytics_service, "AnalyticsService", "services/analytics_service.py", "Token usage tracking, latency metrics, model performance stats")
      Component(agent_service, "AgentService", "services/agent_service.py", "Multi-step agent orchestration, tool execution, sub-task planning")
      Component(ingestion_service, "IngestionService", "services/ingestion_service.py", "Document ingestion pipeline, chunking strategies, batch embedding")
    }

    System_Boundary(ai_middleware, "Middleware Layer") {
      Component(rate_limit, "RateLimitMiddleware", "middleware/rate_limit.py", "Per-IP and per-user rate limiting via Redis sliding window")
      Component(sanitizer, "InputSanitizerMiddleware", "middleware/input_sanitizer.py", "Prompt injection detection, input validation, content filtering")
      Component(pii_filter, "PIIFilterMiddleware", "middleware/pii_filter.py", "Personally identifiable information redaction before LLM calls")
    }
  }

  Rel(ai_routes, ai_service, "Routes requests to", "method call")
  Rel(ai_routes, rag_service, "Routes RAG queries", "method call")
  Rel(ai_routes, agent_service, "Routes agent tasks", "method call")
  Rel(ai_service, model_router, "Selects model via", "method call")
  Rel(ai_service, cost_controller, "Tracks cost via", "method call")
  Rel(ai_service, conversation_manager, "Manages state via", "method call")
  Rel(ai_service, cache_service, "Checks cache via", "method call")
  Rel(rag_service, embedding_service, "Generates embeddings via", "method call")
  Rel(rag_service, ai_db, "Queries pgvector via", "asyncpg")
  Rel(ai_service, ai_db, "Stores interactions via", "asyncpg")
  Rel(ingestion_service, embedding_service, "Orchestrates batch embedding", "method call")
  Rel(cost_controller, analytics_service, "Logs metrics via", "method call")
  Rel(ai_routes, rate_limit, "Enforced by", "middleware")
  Rel(ai_routes, sanitizer, "Sanitized by", "middleware")
  Rel(ai_routes, pii_filter, "Filtered by", "middleware")

  UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="2")
```

### AI Routes

| Route | Method | Endpoint | Purpose |
|-------|--------|----------|---------|
| `chat.py` | `POST` | `/api/ai/chat` | SSE-streamed chat with RAG context |
| `analyze.py` | `POST` | `/api/ai/analyze` | Content analysis and scoring |
| `suggest.py` | `POST` | `/api/ai/suggest` | Content generation suggestions |
| `agent.py` | `POST` | `/api/ai/agent` | Multi-step agent execution |
| `health.py` | `GET` | `/health` | Liveness check |

---

## Level 4: Code Diagrams

### Three-Layer Module Pattern

This is the most important architectural pattern in the API. A single domain entity (e.g., Projects) flows through three layers: the module (business logic), portfolio controller (public read-only), and admin controller (authenticated CRUD). The service is written once; two controller layers expose different surfaces of it.

```mermaid
C4Dynamic
  title Dynamic diagram — Three-Layer Module Pattern for Projects

  Person(visitor, "Site Visitor", "Public user")
  Person(admin_user, "Admin User", "Authenticated admin")

  Container_Boundary(api, "NestJS API") {
    Component(port_ctrl, "PortfolioProjectsController", "portfolio/controllers/projects.controller.ts", "@Controller('portfolio/projects')\n@CacheTTL(60)\nNo auth guards")
    Component(admin_ctrl, "AdminProjectsController", "admin/controllers/projects.controller.ts", "@Controller('admin/projects')\n@UseGuards(JwtAuthGuard, RolesGuard)\n@Audit()")
    Component(module_svc, "ProjectsService", "modules/projects/projects.service.ts", "CRUD + query logic\n@Injectable() and exported")
    Component(prisma, "PrismaService", "common/database/prisma.service.ts", "ORM access to PostgreSQL")
  }

  Rel(visitor, port_ctrl, "1: GET /api/portfolio/projects", "Returns cached response")
  Rel(port_ctrl, port_ctrl, "Cache check", "@CacheTTL — returns cached if fresh")
  Rel(port_ctrl, module_svc, "2: projectsService.findAll()", "method call")
  Rel(module_svc, prisma, "3: prisma.project.findMany()", "SQL query")
  Rel(port_ctrl, visitor, "4: { data: Project[], meta: { total, page, limit } }", "JSON envelope")

  Rel(admin_user, admin_ctrl, "1: POST /api/admin/projects", "JWT-authenticated create")
  Rel(admin_ctrl, admin_ctrl, "Guard check", "JwtAuthGuard validates token, RolesGuard checks role")
  Rel(admin_ctrl, admin_ctrl, "Audit log", "@Audit({ action: 'create', resource: 'project' })")
  Rel(admin_ctrl, module_svc, "2: projectsService.create(dto)", "method call")
  Rel(module_svc, prisma, "3: prisma.project.create()", "SQL insert")
  Rel(admin_ctrl, admin_user, "4: { data: Project }", "JSON envelope")

  UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

#### File Structure per Entity

```
src/
├── modules/
│   └── projects/
│       ├── projects.module.ts        # NestJS module, exports ProjectsService
│       ├── projects.service.ts       # Business logic (CRUD, queries)
│       └── dto/
│           ├── create-project.dto.ts # Validation schema (class-validator)
│           └── update-project.dto.ts
├── portfolio/
│   └── controllers/
│       └── projects.controller.ts    # Public GET endpoints, @CacheTTL, no auth
├── admin/
│   └── controllers/
│       └── projects.controller.ts    # Auth-guarded CRUD, @Audit decorators
```

This pattern is repeated for all 27 domain modules. The `PortfolioModule` and `AdminModule` both import the same `ProjectsModule`, so the service is shared while the controllers are separated.

### API Response Envelope

Every API response follows a standardized `{ data, meta }` envelope, enforced by interceptors and the typed frontend client.

```mermaid
C4Dynamic
  title Dynamic diagram — API Response Envelope Contract

  Container_Boundary(web, "Next.js Web") {
    Component(api_client, "ApiClient", "src/lib/api.ts", "Typed fetch wrapper\nUnwraps { data, meta }\nThrows ApiError on non-2xx")
    Component(react_query, "useApiQuery", "src/lib/use-api-query.ts", "TanStack React Query wrapper\nCaches, deduplicates\nProvides loading/error states")
  }

  Container_Boundary(api, "NestJS API") {
    Component(controller, "Any Controller", "portfolio/* or admin/*", "Returns domain DTO")
    Component(filter, "GlobalExceptionFilter", "common/filters/global-exception.filter.ts", "Catches all exceptions\nReturns standardized error")
    Component(interceptor, "Response Interceptor", "built-in NestJS", "Wraps in { data, meta }")
  }

  Rel(controller, interceptor, "Success: wraps return value", "{ data: T, meta?: { total, page, limit } }")
  Rel(filter, filter, "Error: catches all exceptions", "{ statusCode, message, error, timestamp, path }")
  Rel(api_client, controller, "GET /api/portfolio/projects", "HTTP request")
  Rel(api_client, filter, "Non-2xx response", "HTTP error")
  Rel(react_query, api_client, "Use via", "hook call")
```

#### Success Response Shape

```typescript
// Single resource
{
  "data": { "id": "abc", "title": "My Project", ... }
}

// Collection with pagination
{
  "data": [{ "id": "abc", ... }, { "id": "def", ... }],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}

// Void/success mutation
{
  "data": { "success": true, "message": "Project deleted" }
}
```

#### Error Response Shape

```typescript
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2026-07-10T12:00:00.000Z",
  "path": "/api/admin/projects"
}
```

---

## Deployment View

The following diagram shows how the containers map to infrastructure at each environment tier.

```mermaid
C4Container
  title Deployment diagram — Production Topology

  System_Boundary(vercel, "Vercel (AWS us-east-1)") {
    Container(web_deploy, "Next.js SSR/ISR", "Vercel Serverless + Edge", "Public pages via ISR, Admin SPA via client render; Edge-cached static assets")
    Container(api_deploy, "NestJS Serverless", "Vercel Serverless Functions", "API functions auto-scale to 1000 concurrent; 10s timeout (Hobby)")
  }

  ContainerDb(ai_deploy, "FastAPI Container", "Render/Fly.io (Docker)", "Long-running container for SSE streaming; 512MB RAM, shared CPU")

  System_Boundary(supabase, "Supabase (AWS us-east-1)") {
    ContainerDb(pg, "PostgreSQL 15 + pgvector", "Micro (2 vCPU, 1GB RAM)", "Core data + embeddings; PgBouncer connection pool; RLS enabled")
    ContainerDb(auth, "GoTrue Auth", "Supabase Auth Service", "User management, OAuth, JWT generation (1h expiry)")
    ContainerDb(storage_deploy, "Object Storage", "S3-compatible", "Images, 3D models, file uploads; CDN-backed delivery")
  }

  Rel(web_deploy, api_deploy, "Internal API calls", "HTTPS")
  Rel(web_deploy, ai_deploy, "AI chat requests", "HTTPS/SSE")
  Rel(api_deploy, pg, "Prisma ORM", "TCP/SSL via PgBouncer")
  Rel(api_deploy, auth, "JWT verification", "Supabase REST API")
  Rel(api_deploy, storage_deploy, "Asset CRUD", "S3 API")
  Rel(ai_deploy, pg, "pgvector queries", "TCP/SSL")
```

### Local Development Topology

```mermaid
C4Container
  title Deployment diagram — Local Development

  Container(web_dev, "Next.js Dev Server", "npm run dev", "http://localhost:3000, Turbopack HMR")
  Container(api_dev, "NestJS Dev Server", "npm run start:dev", "http://localhost:3001, watch mode, Swagger at /api/docs")
  Container(ai_dev, "FastAPI Dev Server", "uvicorn", "http://localhost:8000, auto-reload")

  ContainerDb(pg_local, "PostgreSQL", "Docker container", "localhost:5432, pgvector enabled")
  ContainerDb(redis_local, "Redis", "Docker container (Upstash dev)", "localhost:6379")

  Rel(web_dev, api_dev, "API calls", "http://localhost:3001")
  Rel(web_dev, ai_dev, "AI chat", "http://localhost:8000")
  Rel(api_dev, pg_local, "Prisma", "TCP:5432")
  Rel(ai_dev, pg_local, "asyncpg", "TCP:5432")
```

Start all services from repo root with:

```bash
# All three apps + dependencies via Turborepo
npm run dev

# Or individually
npm run dev:web    # Next.js on :3000
npm run dev:api    # NestJS on :3001
npm run dev:ai     # FastAPI on :8000
```

---

## Technology Stack Reference

### Web (`apps/web`)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14 (App Router) | SSR, ISR, file-based routing |
| Language | TypeScript 5 | Type safety across the stack |
| Styling | Tailwind CSS + shadcn/ui | Utility-first CSS, Radix primitives |
| 3D/Motion | Three.js, R3F, GSAP, Theatre.js, Lenis | 3D scenes, animations, parallax |
| Data Fetching | TanStack React Query v5 | Caching, deduplication, stale management |
| API Client | Custom `src/lib/api.ts` | Typed fetch with envelope unwrapping |
| Bundling | Turbopack (dev), webpack (build) | Fast refresh, optimized production builds |

### API (`apps/api`)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | NestJS 10 (Express) | Modular backend, decorator-driven |
| Language | TypeScript 5 | Shared types with frontend |
| ORM | Prisma 6 + `@prisma/adapter-pg` | Type-safe database access |
| Database | PostgreSQL 15 + pgvector | Primary store + vector search |
| Cache | Upstash Redis | Response cache, BullMQ queues |
| Auth | Passport.js (JWT, OAuth) | Google/GitHub OAuth, role-based guards |
| API Docs | Swagger (`@nestjs/swagger`) | Auto-generated OpenAPI at `/api/docs` |
| Validation | `class-validator` + `class-transformer` | DTO validation with whitelist/transform |
| Logging | Pino | Structured JSON logging |
| Error Tracking | Sentry (`@sentry/node`) | Error capture, performance tracing |

### AI (`apps/ai`)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | FastAPI (Python 3.12) | Async Python, auto-generated OpenAPI |
| LLM SDK | OpenAI Python SDK | GPT-4o chat, text-embedding-3-small |
| Orchestration | LangChain | RAG pipeline, prompt templates |
| Database | asyncpg | Direct pgvector queries |
| Streaming | Server-Sent Events (SSE) | Real-time chat responses |

### Infrastructure

| Component | Provider | Tier | Cost |
|-----------|----------|------|------|
| Frontend + API Compute | Vercel | Hobby | $0 |
| Database + Auth + Storage | Supabase | Free | $0 |
| AI Container | Render / Fly.io | Free | $0 |
| Redis | Upstash | Free | $0 |
| Email | Resend | Free | $0 |
| Analytics | PostHog | Free | $0 |
| Error Tracking | Sentry | Free | $0 |
| AI Inference | OpenAI | Pay-as-you-go | ~$2–5/mo |

---

## Key Architectural Principles

1. **Three-layer separation** — Business logic (`src/modules/`) is independent of HTTP delivery. Portfolio controllers (public, cached) and Admin controllers (authenticated, audited) are separate surfaces over the same services.

2. **Shared types as contract** — `packages/shared` is the single source of truth for Zod schemas and TypeScript interfaces. Both web and api import from `@portfolio/shared`, ensuring compile-time contract enforcement.

3. **Edge-first delivery** — Public pages use ISR (60s–300s revalidation) for sub-100ms global load times. Admin pages are client-rendered SPA for interactive CRUD.

4. **Multi-LLM AI tier** — A dedicated FastAPI service (not serverless functions) handles long-lived LLM connections, RAG via pgvector, cost control, and PII filtering, keeping the NestJS API focused on business logic.

5. **Cost-optimized by design** — Every service runs on a free tier with documented upgrade paths. Monthly operating cost target is $0–$5 (primarily OpenAI token usage).

---

## File References

| Diagram | Relevant Source Files |
|---------|----------------------|
| System Context | `docs/architecture/IntegrationArchitecture.md`, `docs/operations/54-INFRASTRUCTURE.md`, `apps/api/src/main.ts` |
| Container | `infrastructure/docker/docker-compose.yml`, `turbo.json`, `apps/web/next.config.js` |
| Web Components | `apps/web/src/app/**/page.tsx`, `apps/web/src/components/**/*.tsx`, `apps/web/src/lib/api.ts` |
| API Components | `apps/api/src/modules/*/*.service.ts`, `apps/api/src/portfolio/controllers/*.ts`, `apps/api/src/admin/controllers/*.ts`, `apps/api/src/common/**/*.ts` |
| AI Components | `apps/ai/app/routes/*.py`, `apps/ai/app/services/*.py`, `apps/ai/app/middleware/*.py` |
| Three-Layer Pattern | `docs/architecture/ServiceArchitecture.md`, `docs/architecture/DomainArchitecture.md` |
| Deployment | `docs/operations/54-INFRASTRUCTURE.md`, `infrastructure/docker/docker-compose.yml` |
