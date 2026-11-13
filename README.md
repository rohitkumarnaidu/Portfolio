# Portfolio

<p align="center">
  <a href="https://github.com/rohitkumarnaidu/Portfolio/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/rohitkumarnaidu/Portfolio/ci.yml?branch=main&label=CI&logo=github&style=flat-square" alt="CI Status" />
  </a>
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/node-%3E%3D22.12-brightgreen?style=flat-square&logo=node.js&logoColor=white" alt="Node Version" />
  </a>
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" />
  </a>
  <a href="https://nestjs.com/">
    <img src="https://img.shields.io/badge/NestJS-12-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS" />
  </a>
</p>

A portfolio platform: a public Next.js site backed by a NestJS API and an
admin dashboard for managing the content.

## Stack

| Layer       | Technology                                                                  |
| ----------- | --------------------------------------------------------------------------- |
| Frontend    | Next.js 15 (App Router), React 19, Tailwind CSS, Three.js, GSAP             |
| Backend API | NestJS 12 (REST), Prisma ORM, Passport JWT, BullMQ, cache-manager           |
| Database    | PostgreSQL (Supabase) via the `pg` driver adapter                           |
| Cache/Queue | Redis via ioredis (optional)                                                |
| Validation  | Zod 4 schemas in `packages/shared`, class-validator DTOs in the API         |
| Monitoring  | Sentry (APM + profiling), Pino structured logging                           |
| Auth        | HttpOnly JWT cookies, rotating refresh sessions, RBAC (admin/editor/viewer) |
| DevOps      | Docker, GitHub Actions, Vercel (web), Railway (API)                         |

## Architecture

```
apps/
├── web/            Next.js — public portfolio + admin dashboard
├── api/            NestJS — REST API (public portfolio + admin CRUD)
packages/
├── shared/         TypeScript types and Zod schemas (the data contract)
├── ui/             Shared React component library
├── config/         Shared ESLint and TypeScript configs
config/             Environment variable templates
docs/               Architecture, design, testing, and process docs
```

### The three-layer API pattern

Business logic and HTTP delivery are deliberately separated:

1. `apps/api/src/modules/<entity>/` — the business logic. Each is a NestJS
   module that provides and exports an `<Entity>Service`. No controllers.
2. `apps/api/src/portfolio/controllers/` — public, read-only, cached.
3. `apps/api/src/admin/controllers/` — authenticated CRUD, role-guarded and
   audited.

Both controller layers inject the same service, so a rule is written once.

### Content

The public site renders curated content from
`apps/web/src/lib/public-content.ts` and anything published through the admin
dashboard. The API is the source of truth for dashboard-managed content.

## Quick Start

```bash
git clone https://github.com/rohitkumarnaidu/Portfolio.git
cd Portfolio
npm install
cp config/.env.example config/.env
# Edit config/.env: DATABASE_URL, JWT_SECRET, ADMIN_PASSWORD, ...
npm run prisma:migrate:deploy --workspace=apps/api
npm run prisma:seed --workspace=apps/api   # creates the first admin
npm run dev
```

There is no public sign-up: the seed creates the first administrator, and
further users come from the admin dashboard (`POST /api/admin/users`).

| Service      | URL                            | Port |
| ------------ | ------------------------------ | ---- |
| Frontend     | http://localhost:3000          | 3000 |
| REST API     | http://localhost:3001/api      | 3001 |
| Swagger Docs | http://localhost:3001/api/docs | 3001 |
| Admin        | http://localhost:3000/admin    | 3000 |

### Toolchain

The repository pins npm in `packageManager`:

```bash
corepack enable   # honours the pinned npm version
```

npm 10 cannot resolve this dependency tree from scratch — an upstream arborist
bug ([npm/cli#9787](https://github.com/npm/cli/issues/9787)). The pin is npm
11.21.2, which has the fix and writes lockfiles that install correctly on
Linux. If you regenerate `package-lock.json`, delete `node_modules` as well:
npm rebuilds the tree from whatever is on disk and drops the
platform-specific optional packages ([npm/cli#4828](https://github.com/npm/cli/issues/4828)),
which breaks the Linux CI install.

## Scripts

| Command             | Description                   |
| ------------------- | ----------------------------- |
| `npm run dev`       | Start every service via Turbo |
| `npm run dev:api`   | API only (watch mode)         |
| `npm run dev:web`   | Frontend only                 |
| `npm run build`     | Build all workspaces          |
| `npm run lint`      | Lint all workspaces           |
| `npm run typecheck` | Type-check all workspaces     |
| Testing             | Per workspace (see AGENTS.md) |

## Documentation

| Document                                  | Description                            |
| ----------------------------------------- | -------------------------------------- |
| `docs/MASTER-INDEX.md`                    | Index of every document                |
| `docs/05-architecture/TECHSTACK.md`       | The stack and the trade-offs behind it |
| `docs/10-api/API-OVERVIEW.md`             | The API surface and conventions        |
| `docs/19-admin/ADMIN-DASHBOARD.md`        | The admin dashboard                    |
| `docs/04-design/DESIGN-SYSTEM.md`         | Design tokens, typography, components  |
| `docs/13-testing/TESTING-ARCHITECTURE.md` | Test strategy and what is covered      |

## License

MIT
