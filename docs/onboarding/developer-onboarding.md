# Developer Onboarding Guide

**Goal:** Get a new developer from zero to first pull request in under 2 days.

---

## Before You Start

### Prerequisites

| Tool | Version | Check Command |
|------|---------|---------------|
| Node.js | >= 18 | `node --version` |
| npm | >= 10 | `npm --version` |
| Docker | Latest | `docker --version` |
| Docker Compose | v2+ | `docker compose version` |
| Git | Latest | `git --version` |
| IDE | VSCode / WebStorm | — |

**Recommended VSCode extensions:**
- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- Prisma (`Prisma.prisma`)
- Thunder Client (`rangav.vscode-thunder-client`) for API testing
- Docker (`ms-azuretools.vscode-docker`)

### Access Requests

Before Day 1, ensure you have access to:

| Service | Purpose | Request From |
|---------|---------|-------------|
| GitHub | Source code, CI/CD, PRs | Team lead |
| Vercel | Web deployment, preview deployments | Team lead |
| Supabase | PostgreSQL database, storage, auth | Team lead |
| Sentry | Error tracking, APM, profiling | Team lead |
| PostHog | Product analytics, feature flags | Team lead |
| Resend | Transactional email service | Team lead |
| OpenAI | AI chat, embeddings | Team lead |
| Redis Cloud (Upstash/Redis) | Caching, BullMQ queues, sessions | Team lead |

---

## Day 1: Environment Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repo-url>
cd portfolio

# Verify your Node and npm versions
node --version   # Must be >= 18
npm --version    # Must be >= 10

# Install all dependencies (uses npm workspaces)
npm ci

# Verify all workspaces are installed
npx turbo run build   # Build all packages; verify it succeeds
```

**Troubleshooting:** If `npm ci` fails, delete `node_modules` and `package-lock.json`, then run `npm install`.

### 2. Environment Configuration

```bash
# Copy the environment template
cp config/.env.example config/.env
```

Then edit `config/.env`. Below is what each variable group does:

**Database (required for local API to start):**

| Variable | Description | Default (Dev) |
|----------|-------------|----------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:54322/postgres` |
| `SUPABASE_URL` | Supabase project URL | Local Supabase or prod URL |
| `SUPABASE_ANON_KEY` | Public anon key | From Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key (bypasses RLS) | From Supabase dashboard |

**Authentication (required):**

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | JWT signing secret. Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXTAUTH_SECRET` | NextAuth.js secret (same generator) |
| `NEXTAUTH_URL` | Frontend URL for OAuth callbacks (`http://localhost:3000`) |

**AI Service (optional for local dev):**

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Required for AI chat/embedding features |

**Redis (required for caching + BullMQ queues):**

| Variable | Description |
|----------|-------------|
| `REDIS_URL` | Redis connection string. Default: `redis://localhost:6379` |

**Monitoring (optional, safe to leave as-is in dev):**

| Variable | Description |
|----------|-------------|
| `SENTRY_DSN` | Sentry backend error tracking |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry frontend error tracking |

**Analytics (optional in dev):**

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog ingestion host |

**Email (optional in dev):**

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend API key for transactional email |
| `EMAIL_FROM` | Sender address |
| `ADMIN_NOTIFICATION_EMAIL` | Where admin notifications go |

**Security (optional, sensible dev defaults exist):**

| Variable | Description | Default |
|----------|-------------|---------|
| `LOCKOUT_THRESHOLD` | Failed login attempts before lockout | `5` |
| `LOCKOUT_DURATION_MS` | Lockout duration in ms | `900000` (15 min) |

### 3. Database Setup

#### Option A: Local PostgreSQL with Docker (Recommended)

```bash
# Start PostgreSQL + Redis + all infrastructure
docker compose -f infrastructure/docker/docker-compose.yml up -d

# Verify services are running
docker ps
# You should see: postgres (port 5432), redis (port 6379)
```

> Note: The full docker-compose.yml also includes web/api/ai containers, but for local
> development you'll run those via npm directly. The `up` above starts infra only.
> Run only services you need: `docker compose up -d postgres redis`.

#### Option B: Use Supabase Local CLI (Alternative)

```bash
# Install Supabase CLI: https://supabase.com/docs/guides/local-development
supabase start
```

This starts Supabase's full local stack (PostgreSQL + GoTrue + Realtime + Storage).

#### Initialize the Database

```bash
# From the api workspace
cd apps/api

# Generate Prisma client (custom output path at apps/api/generated/prisma)
npm run prisma:generate

# Run migrations
npm run prisma:migrate:dev

# Seed with sample data
npm run prisma:seed

# Optional: Open Prisma Studio to verify data
npm run prisma:studio
```

**Prisma custom output path:** The Prisma client is generated to `apps/api/generated/prisma` (not `node_modules`). This is configured in `apps/api/prisma/schema.prisma`. Always run `prisma:generate` after schema changes.

### 4. Run Everything

The monorepo uses Turborepo to orchestrate all three services:

```bash
# From the repo root — starts all services in parallel
npm run dev
```

To run services individually (faster for focused work):

```bash
# Web only (Next.js, port 3000)
npm run dev:web

# API only (NestJS, port 3001, watch mode)
npm run dev:api

# AI service only (FastAPI, port 8000)
npm run dev:ai
```

### 5. Verify

Open each of these URLs in your browser:

| Service | URL | Expected Result |
|---------|-----|----------------|
| **Web** | http://localhost:3000 | Portfolio homepage loads |
| **API Health** | http://localhost:3001/api/health/liveness | `{ "status": "ok" }` |
| **API Health (detailed)** | http://localhost:3001/api/health | JSON with DB, Redis, queue status |
| **Swagger Docs** | http://localhost:3001/api/docs | Swagger UI with all endpoints |
| **AI Service** | http://localhost:8000/docs | FastAPI Swagger UI |

**API verification commands:**

```bash
# Quick health check
curl http://localhost:3001/api/health/liveness

# Portfolio endpoints (public, no auth)
curl http://localhost:3001/api/portfolio/sections

# Admin endpoints (returns 401 without token — expected)
curl http://localhost:3001/api/admin/sections
```

---

## Day 1 Afternoon: Codebase Tour

### Monorepo Structure

```
portfolio/                          # Root — Turborepo v2 + npm workspaces
├── apps/
│   ├── web/                        # Next.js 14 App Router
│   │   ├── src/
│   │   │   ├── app/                # Pages: public/ + admin/ routes
│   │   │   ├── components/         # 3d/, admin/, sections/, ui/
│   │   │   ├── lib/                # api.ts, use-api-query.ts, query-provider.tsx
│   │   │   └── hooks/              # Custom React hooks
│   │   ├── vitest.config.ts        # Vitest config
│   │   └── playwright.config.ts    # E2E tests
│   │
│   ├── api/                        # NestJS 10 REST API
│   │   ├── src/
│   │   │   ├── main.ts             # Bootstrap: Helmet, CORS, Swagger, Pino, Sentry
│   │   │   ├── app.module.ts       # Root module
│   │   │   ├── config/             # Zod-validated env schema
│   │   │   ├── modules/            # Business logic (20+ entities)
│   │   │   ├── common/             # Cross-cutting: database, cache, queue, filters
│   │   │   ├── portfolio/          # Public controllers (read-only, cached)
│   │   │   └── admin/              # Admin controllers (JWT-guarded, RBAC, audited)
│   │   ├── generated/prisma/       # Prisma client (custom output path)
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # 34-model database schema
│   │   │   ├── migrations/         # SQL migration files
│   │   │   └── seed.ts             # Seed script
│   │   └── test/                   # E2E tests
│   │
│   └── ai/                         # FastAPI (Python)
│       ├── app/
│       │   ├── main.py             # App bootstrap with lifespan, CORS, middleware
│       │   ├── config.py           # Settings via pydantic-settings
│       │   ├── routes/             # chat, analyze, suggest, health, agent
│       │   ├── middleware/         # rate_limit, input_sanitizer, pii_filter
│       │   └── services/          # rag, embedding, cache, analytics, cost_controller
│       └── requirements.txt        # Python dependencies
│
├── packages/
│   ├── shared/                     # @portfolio/shared — TypeScript types + Zod schemas
│   │   └── src/                    # Data contracts shared by web + api
│   ├── ui/                         # @portfolio/ui — Shared React components
│   │   └── src/                    # Component library (15+ components)
│   └── config/                     # Shared ESLint, TypeScript config presets
│
├── config/
│   └── .env.example                # Environment variable template
│
├── infrastructure/
│   └── docker/
│       └── docker-compose.yml      # Multi-service Docker Compose (web, api, ai)
│
├── docs/                           # 196+ documents across 18 categories
│   ├── MASTER-INDEX.md             # Start here for any doc
│   ├── architecture/               # SystemArchitecture, TechStack, Integrations
│   ├── api/                        # API spec, standards, error handling
│   ├── database/                   # Schema, ERD, data dictionary
│   ├── security/                   # Auth, compliance, hardening
│   ├── ai/                         # AI instructions, agents, RAG
│   ├── operations/                 # DevOps, deploy, CI/CD, monitoring
│   ├── quality/                    # Performance, SEO, a11y, testing
│   ├── governance/                 # Constitution (32-SKILL.md), standards
│   ├── design/                     # Design system, 3D, motion
│   ├── product/                    # PRD, features, user stories
│   ├── runbooks/                   # Incident response, backup, recovery
│   └── adr/                        # Architecture Decision Records
│
├── .husky/                         # Git hooks: pre-commit runs lint-staged
├── turbo.json                      # Turborepo task configuration
├── package.json                    # Root workspace config
└── AGENTS.md                       # AI assistant guide (Claude Code instructions)
```

### Key Architecture Patterns

#### 1. Three-Layer Module Pattern (API)

This is the most important convention in the backend. Business logic and HTTP delivery are deliberately separated:

```
src/modules/<entity>/                # Layer 1: Business logic
  ├── <entity>.module.ts             #   NestJS module (provides + exports service)
  ├── <entity>.service.ts            #   All business logic lives here
  └── dto/                           #   Data Transfer Objects (class-validator)

src/portfolio/controllers/           # Layer 2: Public read-only delivery
  └── <entity>.controller.ts         #   @Controller('portfolio/<entity>')
                                     #   Response-cached (@CacheTTL), no auth

src/admin/controllers/               # Layer 3: Authenticated CRUD delivery
  └── <entity>.controller.ts         #   @Controller('admin/<entity>')
                                     #   @UseGuards(JwtAuthGuard, RolesGuard)
                                     #   @ApiBearerAuth(), @Roles(), @Audit()
```

**Rule:** When adding or modifying an entity, you almost always touch all three layers. The service is written once; the two controller layers expose different surfaces of it.

Both `PortfolioModule` and `AdminModule` import the same `modules/*` and inject the shared service. Routes are globally prefixed with `api`, yielding:
- `GET /api/portfolio/<entity>` (public, cached)
- `GET|POST|PATCH|DELETE /api/admin/<entity>` (authenticated, RBAC, audited)

#### 2. API Response Envelope

Every API response follows this shape:

```typescript
// Success (single item)
{ "data": { ... } }

// Success (paginated list)
{ "data": [...], "meta": { "page": 1, "perPage": 20, "total": 100, "totalPages": 5 } }

// Error
{ "statusCode": 404, "message": "Entity not found", "error": "Not Found" }
```

The frontend's `src/lib/api.ts` unwraps this envelope automatically and throws `ApiError` on non-2xx responses.

#### 3. Shared Types as the Contract

The `packages/shared` workspace is the **single source of truth** for data contracts between frontend and backend:

```typescript
// packages/shared/src/ — Zod schemas + inferred TypeScript types
import { ProjectSchema, type Project } from '@portfolio/shared';
```

**Never redefine types across workspaces.** If a type crosses the web/api boundary, it belongs in `@portfolio/shared`.

#### 4. Database Access

```typescript
// Inject PrismaService (src/common/database/prisma.service.ts)
// Built on @prisma/adapter-pg over a pg.Pool
@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}
  
  async findAll() {
    return this.prisma.client.project.findMany();
    // Or use per-model getter: this.prisma.project.findMany()
  }
}
```

The Prisma client is generated to `apps/api/generated/prisma` — a custom path configured in `prisma/schema.prisma`. After editing the schema, always run `npm run prisma:generate` from `apps/api`.

#### 5. Auth Model

| Aspect | Detail |
|--------|--------|
| Token type | JWT access tokens (15min) + Redis-backed refresh tokens (7d TTL) |
| OAuth providers | Google, GitHub — handled entirely by NestJS (not Supabase Auth) |
| Role-based access | `admin` / `editor` / `viewer` — enforced via `@Roles()` decorator |
| Public endpoints | Portfolio controllers — no auth required |
| Key files | `src/modules/auth/` (guards, strategies, decorators) |

#### 6. Frontend Data Flow

```
Page Component
  → useApiQuery() or useSuspenseQuery() [src/lib/use-api-query.ts]
    → api.get() [src/lib/api.ts — typed fetch wrapper]
      → GET /api/portfolio/<entity> or /api/admin/<entity>
        → Returns { data, meta } envelope
    → Cached via TanStack React Query [src/lib/query-provider.tsx]
```

- Server-side fetches hit `NEXT_PUBLIC_API_URL`
- Client-side fetches use `/api` relative base (proxied by Next.js)
- Admin requests automatically attach `Bearer` token from `localStorage('admin_access_token')`

### Testing Setup

#### API Tests (Jest)

```bash
cd apps/api

# All unit tests (no DB required — 52 tests)
npm test

# Single test file
npm test -- auth.service.spec

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests (requires DB connection — 30+ tests)
npm run test:e2e
```

#### Web Tests (Vitest + Playwright)

```bash
cd apps/web

# Unit/component tests (Vitest)
npm test

# Watch mode
npm run test:watch

# Single test file
npm test -- src/test/__tests__/foo.test.ts

# E2E tests (Playwright)
npm run test:e2e

# E2E with browser visible
npm run test:e2e:ui
```

#### Lint and TypeCheck (from root)

```bash
# ESLint across all workspaces
npm run lint

# TypeScript strict check (tsc --noEmit)
npm run typecheck

# Prettier format
npm run format
```

> **Important:** There is no root `npm test` command. Tests must be run per-workspace.

---

## Day 2: First Contribution

### Git Workflow

#### Branch Naming

```
feat/description        # New features          → feat/add-blog-sorting
fix/description         # Bug fixes             → fix/login-redirect-loop
docs/description        # Documentation         → docs/api-rate-limit-guide
refactor/description    # Code restructuring    → refactor/extract-cache-service
chore/description       # Tooling, deps, CI     → chore/upgrade-next-14-2
test/description        # Adding tests          → test/project-service-coverage
```

#### Commit Messages (Conventional Commits)

```
feat(api): add sorting to blog list endpoint
fix(web): prevent redirect loop on auth refresh
docs: add caching strategy to developer-onboarding
refactor(api): extract cache service from sections module
chore: upgrade Next.js to 14.2.5
test(api): add unit tests for lead service
```

Format: `<type>(<scope>): <short description>`

| Type | When to Use |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `refactor` | Code change that neither fixes nor adds |
| `chore` | Build, deps, CI, tooling |
| `test` | Adding or fixing tests |

#### Pre-commit Hooks

The repository uses **husky** + **lint-staged**. Before each commit:

1. Staged `.ts` / `.tsx` files are formatted with Prettier
2. Then linted with ESLint (`--fix`)
3. Staged `.js`, `.json`, `.md`, `.css` files are formatted with Prettier

If any hook fails, the commit is aborted. Fix the issues and try again.

### Coding Standards

This project follows the **[AI Engineering Constitution](docs/governance/32-SKILL.md)** — the supreme governing document with 24 sections covering all aspects of development. Key highlights:

| Standard | Requirement |
|----------|-------------|
| TypeScript | Strict mode enabled — no implicit `any` |
| `any` types | **Forbidden** — use `unknown` and narrow with type guards |
| React components | **React Server Components by default** — add `'use client'` only when needed |
| Imports | Use path aliases (`@/` for web, no barrel exports) |
| Naming | `PascalCase` for components/types, `camelCase` for functions/variables, `kebab-case` for files |
| API endpoints | Follow RESTful conventions, use `{ data, meta? }` envelope |
| Database | Prisma via `PrismaService`, always run `prisma:generate` after schema edits |
| Testing | Unit tests for services, E2E for critical flows |
| Security | Validate all input, sanitize HTML, never trust user data |
| Documentation | Update docs when behavior changes |

### PR Process

#### Step 1: Create a Branch

```bash
git checkout -b feat/your-feature-description
```

#### Step 2: Make Changes and Commit

```bash
git add <files>
git commit -m "feat(scope): description of change"
```

Follow conventional commits. The pre-commit hook will format and lint staged files.

#### Step 3: Push and Open a PR

```bash
git push -u origin feat/your-feature-description
```

Then open a Pull Request on GitHub. Use the PR template (if available) and include:

- **Description:** What does this change do? Why?
- **Related issues:** Closes/Fixes/Refs #issue-number
- **Testing:** What tests were added? How was this verified?
- **Screenshots:** For UI changes

#### Step 4: CI Checks

The GitHub Actions pipeline will run:

1. **Lint** — ESLint across all workspaces
2. **TypeCheck** — `tsc --noEmit` across all workspaces
3. **Test (API)** — Jest unit tests
4. **Test (Web)** — Vitest unit tests
5. **Build** — Turborepo production build

All checks must pass before merging.

#### Step 5: Code Review

- At least one approval required
- Address all reviewer comments
- Use the review checklist from the Constitution (`docs/governance/32-SKILL.md`)
- After addressing feedback, re-request review

#### Step 6: Merge

- **Squash and merge** for feature branches (single commit into `main`)
- Delete the branch after merge

---

## Troubleshooting

### 1. `npm ci` Fails with Dependency Conflicts

```bash
# Clear all node_modules and lock file
rm -rf node_modules package-lock.json apps/*/node_modules packages/*/node_modules
npm install
```

### 2. Docker Containers Won't Start / Port Conflicts

```bash
# Check if ports are already in use
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5432
netstat -ano | findstr :6379

# Stop all containers and restart
docker compose -f infrastructure/docker/docker-compose.yml down
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

### 3. Prisma Client Not Found

```bash
# The Prisma client is at a custom path: apps/api/generated/prisma
cd apps/api
npm run prisma:generate
```

If migration files don't exist yet:

```bash
npm run prisma:migrate:dev -- --name init
```

### 4. Database Connection Refused

```bash
# Verify PostgreSQL is running
docker ps | findstr postgres

# Check DATABASE_URL in config/.env matches your running instance
# Default local: postgresql://postgres:postgres@localhost:54322/postgres

# If using Supabase CLI, verify it's running
supabase status
```

### 5. Redis Connection Error

```bash
# Verify Redis is running
docker ps | findstr redis

# Default local: redis://localhost:6379
# Verify REDIS_URL in config/.env
```

### 6. Authentication / 401 Errors on Admin Endpoints

Admin endpoints require a JWT token. Options:

```bash
# 1. Login via the API
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@portfolio.com","password":"password"}'
# Returns: { "accessToken": "..." }

# 2. Use the seed admin credentials (see prisma/seed.ts)
# 3. The Swagger UI has an "Authorize" button — paste your token there
```

### 7. `tsc --noEmit` Fails with Type Errors

```bash
# Run typecheck on a specific workspace
cd apps/api && npm run typecheck
cd apps/web && npm run typecheck

# Common causes:
# - Missing Prisma client generation (run prisma:generate)
# - Circular dependencies between modules
# - Importing types that don't exist in @portfolio/shared
```

### 8. ESLint Errors on Commit (Pre-commit Hook Fails)

```bash
# Fix auto-fixable issues
npx eslint --fix <file>

# Check what lint-staged would run
npx lint-staged --dry-run

# Skip hooks temporarily (only for WIP commits)
git commit --no-verify -m "chore: WIP"
```

### 9. WebContainer Sandbox Not Working (apps/web)

The Sandbox IDE at `/admin/sandbox` requires specific COOP/COEP headers:

```bash
# Verify your browser has SharedArrayBuffer support
# Check that the dev server sends these headers:
#   Cross-Origin-Opener-Policy: same-origin
#   Cross-Origin-Embedder-Policy: require-corp
```

See `apps/web/src/app/admin/sandbox/` for configuration.

### 10. AI Service /docs Returns 404

The FastAPI docs are only enabled in debug mode:

```bash
# Check apps/ai/app/config.py
# Ensure DEBUG=true in your environment or .env file for the AI service
```

---

## Where to Get Help

| Resource | Location |
|----------|----------|
| **Documentation Index** | [`docs/MASTER-INDEX.md`](../MASTER-INDEX.md) — All 196+ docs organized by category |
| **AI Engineering Constitution** | [`docs/governance/32-SKILL.md`](../governance/32-SKILL.md) — Supreme governing document |
| **System Architecture** | [`docs/architecture/SystemArchitecture.md`](../architecture/SystemArchitecture.md) |
| **API Standards** | [`docs/api/44-API-STANDARDS.md`](../api/44-API-STANDARDS.md) |
| **Testing Architecture** | [`docs/quality/TestingArchitecture.md`](../quality/TestingArchitecture.md) |
| **Deployment Guide** | [`docs/operations/DeploymentGuide.md`](../operations/DeploymentGuide.md) |
| **Security Architecture** | [`docs/security/SecurityArchitecture.md`](../security/SecurityArchitecture.md) |
| **Coding Standards** | [`docs/governance/CodingStandards.md`](../governance/CodingStandards.md) |
| **Architecture Decision Records** | [`docs/adr/`](../adr/) — 14 ADRs covering technology choices |
| **CI/CD Pipeline** | [`docs/operations/53-CI-CD-PIPELINE.md`](../operations/53-CI-CD-PIPELINE.md) |
| **Runbooks** | [`docs/runbooks/`](../runbooks/) — Incident response, backup, recovery |

### Team Communication

- **GitHub Issues** for bug reports and feature requests
- **GitHub Discussions** for questions and discussions
- **Pull Requests** for code reviews

### Recommended Reading Order for New Developers

```
docs/MASTER-INDEX.md
  → docs/architecture/SystemArchitecture.md
  → docs/api/44-API-STANDARDS.md
  → docs/database/DatabaseArchitecture.md
  → docs/operations/DevOpsArchitecture.md
  → docs/quality/TestingArchitecture.md
  → docs/governance/32-SKILL.md (Constitution)
```

---

*Last updated: July 2026 — See `docs/MASTER-INDEX.md` for the latest document inventory.*
