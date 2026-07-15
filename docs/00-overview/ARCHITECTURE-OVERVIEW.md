# Architecture Overview Ã¢â‚¬â€ Portfolio Platform

> **Document:** `00-overview/ARCHITECTURE-OVERVIEW.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** Ã¢Å“â€¦ Active | **Audience:** Engineers, Architects, Technical Evaluators
> **Related:** [Executive Summary](./EXECUTIVE-SUMMARY.md) | [System Architecture](../05-architecture/SystemArchitecture.md)

---

## System Topology

```mermaid
flowchart LR
    Browser["Browser"] --> VercelCDN["Vercel Edge CDN"]

    subgraph "Vercel (Edge + Serverless)"
        VercelCDN --> ISR["ISR Cache"]
        ISR --> NextJS["Next.js 14<br/>App Router"]
        NextJS --> Static["Static Pages (ISR)"]
        NextJS --> SSR["Server-Side Pages (Admin)"]
    end

    subgraph "Docker / VPS"
        NestJS["NestJS 10 API<br/>Port 3001"]
        FastAPI["FastAPI AI<br/>Port 8000"]
    end

    subgraph "Supabase Managed"
        PG[("PostgreSQL 15<br/>+ pgvector")]
        Storage["Object Storage"]
        Realtime["Realtime Subscriptions"]
    end

    subgraph "Redis"
        Queue["BullMQ<br/>Email / Notifications"]
        Cache["Data Cache"]
    end

    NextJS -->|"/api/* proxy"| NestJS
    NestJS -->|"Prisma ORM"| PG
    NestJS -->|"ioredis"| Redis
    NestJS -->|"Resend"| Email["Transactional Email"]
    NestJS -->|"Sentry"| Errors["Error Tracking"]
    NestJS -->|"PostHog"| Analytics["Product Analytics"]
    FastAPI -->|"pgvector"| PG
    FastAPI -->|"SSE"| Browser
    FastAPI -->|"OpenAI SDK"| LLM["LLM Provider"]
```

---

## Applications & Packages

| Layer             | App / Package     | Technology                                            | Responsibility                                                                                                   |
| ----------------- | ----------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Frontend**      | `apps/web`        | Next.js 14 App Router, Three.js, GSAP, TanStack Query | Public portfolio (ISR) + admin dashboard (SSR). 3D scenes, AI chat, WebContainer sandbox.                        |
| **API**           | `apps/api`        | NestJS 10, Prisma, Passport.js, BullMQ, Pino          | REST API Ã¢â‚¬â€ business logic in `modules/`, public read-only in `portfolio/`, authenticated CRUD in `admin/`. |
| **AI**            | `apps/ai`         | FastAPI, LangChain, pgvector, SSE                     | Multi-LLM RAG pipeline, embedding search, streaming chat. (Currently a placeholder stub.)                        |
| **Shared Types**  | `packages/shared` | TypeScript, Zod                                       | Source-of-truth data contracts shared by web and API.                                                            |
| **UI Components** | `packages/ui`     | React, shadcn/ui, Tailwind CSS                        | Shared component library (Button, Card, Input, Modal, DataTable, etc.).                                          |
| **Config**        | `packages/config` | ESLint, TypeScript                                    | Shared linting rules and base TS config across workspaces.                                                       |

---

## Key Architectural Decisions

| Decision         | Choice                                                                          | Rationale                                                                                              |
| ---------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Monorepo**     | Turborepo v2 + npm workspaces                                                   | Shared types/components/configs; parallel task execution; remote caching.                              |
| **Rendering**    | ISR for public pages, SSR for admin                                             | Portfolio content changes infrequently (60s revalidation); admin needs fresh data per request.         |
| **API Pattern**  | 3-layer NestJS (module Ã¢â€ â€™ portfolio controller Ã¢â€ â€™ admin controller) | Single business logic layer, two delivery surfaces. See [AGENTS.md](../../AGENTS.md) for details.      |
| **Auth**         | JWT + Passport.js OAuth (Google/GitHub)                                         | Role-based access (admin/editor/viewer); OAuth handled by NestJS API, not Supabase.                    |
| **Database**     | Supabase PostgreSQL + pgvector                                                  | Managed Postgres with vector embeddings for AI RAG; bundled auth, storage, and realtime subscriptions. |
| **Cache/Queue**  | Redis via ioredis + BullMQ                                                      | Reliable email queue, session store, and data cache in a single service.                               |
| **API Envelope** | `{ data, meta? }`                                                               | Consistent response structure across all endpoints (page, count, total).                               |

---

## Data Flow: Page Request Lifecycle

1. **User navigates** to `https://portfolio.com` Ã¢â€ â€™ DNS resolves to Vercel edge.
2. **Vercel CDN** serves cached ISR page if available and TTL (60s) not expired.
3. **Cache miss** Ã¢â€ â€™ Next.js server renders the page, fetching data from the NestJS API (`/api/portfolio/sections`, `/api/portfolio/projects`, etc.).
4. **NestJS** queries PostgreSQL via Prisma, applies caching layer (Redis or in-memory), and returns `{ data, meta }`.
5. **Next.js** renders the React tree, sends the fully rendered HTML to the client.
6. **Client hydrates** Ã¢â€ â€™ TanStack Query triggers background refetches for interactive data (leads, analytics for admin users).
7. **Admin mutations** (create/edit/delete) Ã¢â€ â€™ POST/PUT/DELETE to `/api/admin/*` Ã¢â€ â€™ JWT-verified Ã¢â€ â€™ NestJS service Ã¢â€ â€™ database write Ã¢â€ â€™ audit log entry.

---

## Security Layers

| Layer           | Mechanism                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| **Edge**        | Vercel WAF, DDoS protection, rate limiting (Vercel Firewall)                                                 |
| **API Gateway** | Helmet, CORS whitelist, global ThrottlerGuard, global ValidationPipe (whitelist + forbidNonWhitelisted)      |
| **Application** | JwtAuthGuard, RolesGuard (@Roles decorator), @Audit decorator on all mutations                               |
| **Database**    | Prepared statements (Prisma), Supabase RLS policies, no raw SQL                                              |
| **External**    | Secrets in environment variables (never committed), API keys revocable, spending limits on LLM provider keys |

---

## Deployment Summary

| Component   | Platform                                  | Method                                                    | URL Pattern                    |
| ----------- | ----------------------------------------- | --------------------------------------------------------- | ------------------------------ |
| Frontend    | Vercel                                    | Git push Ã¢â€ â€™ auto-deploy from `main`                 | `https://portfolio.vercel.app` |
| API         | Docker Ã¢â€ â€™ GitHub Container Registry | Multi-stage `Dockerfile` Ã¢â€ â€™ `ghcr.io/portfolio/api` | Port 3001                      |
| AI          | Docker Ã¢â€ â€™ GitHub Container Registry | Multi-stage `Dockerfile` Ã¢â€ â€™ `ghcr.io/portfolio/ai`  | Port 8000                      |
| Database    | Supabase (managed)                        | SaaS Ã¢â‚¬â€ no self-hosting                              | Supabase project URL           |
| Cache/Queue | Redis (Upstash or Docker)                 | Managed or containerized                                  | Configurable via `REDIS_URL`   |
| CI/CD       | GitHub Actions                            | PR checks + auto-deploy on merge to `main`                | `.github/workflows/pr.yml`     |

---

> **For detailed architecture documentation**, see:
>
> - [System Architecture](../05-architecture/SystemArchitecture.md)
> - [Admin Architecture](../04-design/AdminArchitecture.md)
> - [API Design](../10-api/APIDesign.md)
> - [Database Schema](../09-database/DatabaseSchema.md)
> - [Security Architecture](../11-security/SecurityArchitecture.md)

## Cross-References

- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system
