# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run from the repo root. This is an npm-workspaces + Turborepo monorepo.

| Command             | What it does                                                     |
| ------------------- | ---------------------------------------------------------------- |
| `npm run dev`       | Start all services via Turbo (web + api)                         |
| `npm run dev:web`   | Web only (Next.js, port 3000)                                    |
| `npm run dev:api`   | API only, watch mode (NestJS, port 3001; Swagger at `/api/docs`) |
| `npm run build`     | Build all workspaces (Turbo, respects `^build` dependency order) |
| `npm run lint`      | Lint all workspaces                                              |
| `npm run typecheck` | Type-check all workspaces (`tsc --noEmit`)                       |
| `npm run format`    | Prettier write across the repo                                   |

There is **no root `test` script**. Run tests per workspace:

- **API (Jest):** from `apps/api`: `npm test`, `npm run test:watch`, `npm run test:coverage`, single file `npm test -- auth.service.spec`, e2e `npm run test:e2e`.
- **Web (Vitest + Playwright):** from `apps/web`: `npm test` (Vitest run), `npm run test:watch`, `npm run test:coverage`, single file `npm test -- src/test/__tests__/foo.test.tsx`, e2e `npm run test:e2e`.

### Prisma (from `apps/api`)

`npm run prisma:generate` (required after schema edits — see the custom output path below), `prisma:migrate:dev`, `prisma:migrate:deploy`, `prisma:seed`, `prisma:studio`, `prisma:validate`.

Env vars are centralized in `config/.env` (copy from `config/.env.example`). `DATABASE_URL` points at Postgres.

### npm version

The repo pins npm in `packageManager` (currently `npm@11.21.2`). Use `corepack enable`
so the pinned version is used. npm 10 cannot resolve this dependency tree from
scratch — an upstream arborist bug (npm/cli#9787). When regenerating
`package-lock.json`, delete `node_modules` too: npm rebuilds the tree from
whatever is on disk and drops the platform-specific optional packages
(npm/cli#4828), which breaks the Linux CI install.

## Architecture

Two apps behind a shared monorepo:

- **`apps/web`** — Next.js 15 App Router. Public portfolio + admin dashboard. Heavy 3D/motion stack (Three.js / react-three-fiber, GSAP, Lenis). Includes a WebContainer-powered Sandbox IDE at `/admin/sandbox` requiring strict COOP/COEP isolation headers.
- **`apps/api`** — NestJS 12 REST API. The substantive backend. **This is where most backend work happens.**

Shared packages: `packages/shared` (TypeScript types + Zod schemas, the source of truth for data contracts shared by web and api, imported as `@portfolio/shared`), `packages/ui` (`@portfolio/ui` React components), `packages/config` (shared ESLint/TS base configs).

### API: the three-layer module pattern (most important convention)

Business logic and HTTP delivery are deliberately separated into three places. When adding/changing an entity, you almost always touch all three:

1. **`src/modules/<entity>/`** — the business logic. Each is a NestJS module that provides + **exports** a `<Entity>Service`, plus its `dto/`. Modules contain **no controllers**.
2. **`src/portfolio/controllers/<entity>.controller.ts`** — public, read-only delivery. `@Controller('portfolio/<entity>')`, response-cached (`@CacheTTL`), no auth. Registered in `src/portfolio/portfolio.module.ts`.
3. **`src/admin/controllers/<entity>.controller.ts`** — authenticated CRUD delivery. `@Controller('admin/<entity>')`, guarded with `@UseGuards(JwtAuthGuard, RolesGuard)` + `@ApiBearerAuth()`, per-route `@Roles('admin'|'editor'|'viewer')`, and `@Audit({action, resource})` on mutations. Registered in `src/admin/admin.module.ts`.

Both `PortfolioModule` and `AdminModule` import the same `modules/*` and inject the shared service. So the service is written once; the two controller layers expose different surfaces of it. Routes are prefixed globally with `api`, giving `/api/portfolio/...` and `/api/admin/...`.

Cross-cutting concerns live in `src/common/` (cache, queue/BullMQ, database, filters, interceptors, middleware, decorators like `@Audit`, export, cleanup, notifications). `DatabaseModule` is `@Global()`.

### API: database access

Prisma client is generated to a **custom path** `apps/api/generated/prisma` (configured in `prisma/schema.prisma`), not `node_modules`. Always run `npm run prisma:generate` after editing the schema. Access the DB through `PrismaService` (`src/common/database/prisma.service.ts`), which wraps a `PrismaClient` built on the **pg driver adapter** (`@prisma/adapter-pg` over a `pg.Pool`). Use `prisma.client` or the per-model getters exposed on the service.

### API: bootstrap (`src/main.ts`)

Configures Helmet, compression, CORS (from `CORS_ORIGIN`), a global `ValidationPipe` (`whitelist` + `forbidNonWhitelisted` + `transform`), a global `GlobalExceptionFilter`, Sentry (when `SENTRY_DSN` set), and Pino logging. Content negotiation reads an API version from the `Accept` header (`application/vnd.portfolio.v<n>+json`) into `req.apiVersion`. Throttling is a global `ThrottlerGuard`.

### Web: data flow

- App Router pages in `src/app/` (public sections + `src/app/admin`). Components in `src/components/` (notably `3d/`, `admin/`, `sections/`, `ui/`).
- API access goes through `src/lib/api.ts` - a typed `fetch` wrapper that unwraps the API's `{ data, meta }` envelope, throws `ApiError` on non-2xx, and sends cookies (`credentials: 'include'`). Browser calls use the same-origin `/api` base; Next.js rewrites `/api/:path*` to `API_PROXY_TARGET` (default `http://localhost:3001`). Server-side calls go straight to `API_PROXY_TARGET`. On a 401 the client refreshes once via `/api/admin/auth/refresh` and replays. Higher-level fetchers live in `src/lib/data/`.
- Data fetching/caching uses TanStack React Query (`src/lib/query-provider.tsx`, `src/lib/use-api-query.ts`).
- The public site also renders curated content straight from `src/lib/public-content.ts` — that is the fallback when the API has nothing published.

### Auth model

Admin auth uses JWT access tokens delivered as HttpOnly cookies (`admin_token`, 15 min, `Path=/api`) plus a rotating refresh cookie (`admin_refresh`, 7 days, `Path=/api/admin/auth`). `Authorization: Bearer <token>` is still accepted for Swagger and API clients. Refresh sessions are persisted in the Postgres `sessions` table (only the SHA-256 hash), so auth does not depend on Redis. Role-based access uses `admin` / `editor` / `viewer` via `user_roles`.

There is **no public registration**: administrators create users with `POST /api/admin/users`. OAuth (Google/GitHub) is handled entirely by the NestJS API and only signs in existing active accounts — it never provisions new ones. Login, refresh, logout and profile live in `src/admin/controllers/auth.controller.ts`; guards and decorators live in `src/modules/auth/` (`JwtAuthGuard`, `RolesGuard`, `@Roles`, `@CurrentUser`, `@Public`). Admin controllers are guarded by default; the portfolio layer is public.

## Conventions

- **Shared types are the contract.** Cross-app types and Zod schemas belong in `packages/shared`; import via `@portfolio/shared` rather than redefining. Note the API response envelope is always `{ data, meta? }`.
- **Pre-commit:** husky + lint-staged run Prettier (+ ESLint `--fix` on `.ts/.tsx`) on staged files.
- The `docs/` directory is large and mostly forward-looking design/architecture writing. Treat code as ground truth over docs when they disagree.
