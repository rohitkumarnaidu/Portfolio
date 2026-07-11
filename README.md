# Portfolio

<p align="center">
  <a href="https://github.com/yourusername/portfolio/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/yourusername/portfolio/ci.yml?branch=main&label=CI&logo=github&style=flat-square" alt="CI Status" />
  </a>
  <a href="LICENSE.md">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square&label=License" alt="MIT License" />
  </a>
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square&logo=node.js&logoColor=white" alt="Node Version" />
  </a>
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" />
  </a>
  <a href="https://nestjs.com/">
    <img src="https://img.shields.io/badge/NestJS-10-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS" />
  </a>
  <a href="CODE_OF_CONDUCT.md">
    <img src="https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa?style=flat-square" alt="Code of Conduct" />
  </a>
  <a href="https://github.com/yourusername/portfolio">
    <img src="https://img.shields.io/github/last-commit/yourusername/portfolio?style=flat-square&label=Updated" alt="Last Commit" />
  </a>
  <a href="docs/MASTER-INDEX.md">
    <img src="https://img.shields.io/badge/docs-280%20files-blueviolet?style=flat-square" alt="Documentation" />
  </a>
</p>

Enterprise-grade monorepo portfolio platform built with NestJS, Next.js, and PostgreSQL.

## Tech Stack

| Layer       | Technology                                                                 |
| ----------- | -------------------------------------------------------------------------- |
| Frontend    | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Three.js |
| Backend API | NestJS, REST, Swagger, BullMQ, Prisma ORM, Passport JWT                    |
| AI Service  | FastAPI (Python), OpenAI                                                   |
| Database    | Supabase (PostgreSQL) with Prisma ORM + Driver Adapters                    |
| Cache       | Redis via ioredis (BullMQ queues + session store + data cache)             |
| Email       | Resend API, BullMQ queue, Handlebars templates                             |
| Monitoring  | Sentry (APM + profiling), Pino structured logging, PostHog analytics       |
| Auth        | JWT access tokens + Redis-backed refresh tokens, role-based access         |
| Queue       | BullMQ (email, notifications, background jobs)                             |
| DevOps      | Docker Compose, Dockerfile, GitHub Actions, lint-staged + husky            |

## Architecture

```
apps/
├── web/           Next.js 14 — public portfolio + admin dashboard
├── api/           NestJS — REST API (portfolio + admin split)
├── ai/            FastAPI — AI chat, embeddings, RAG
packages/
├── ui/            Shared React component library
├── shared/        Shared TypeScript types, Zod schemas
├── config/        Shared ESLint, TypeScript configs
infrastructure/
├── docker/        Docker Compose + Dockerfiles (web, api, ai)
├── ci/            CI/CD reference
config/            Environment variable templates
docs/              Architecture, deployment, security, and design docs
```

## Quick Start

```bash
git clone <repo>
cd portfolio
npm install
cp config/.env.example config/.env
# Edit config/.env with your values
npm run dev
```

| Service      | URL                            | Port |
| ------------ | ------------------------------ | ---- |
| Frontend     | http://localhost:3000          | 3000 |
| REST API     | http://localhost:3001/api      | 3001 |
| Swagger Docs | http://localhost:3001/api/docs | 3001 |
| AI Service   | http://localhost:8000          | 8000 |

## Scripts

| Command             | Description                                         |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Start all services (web + api + ai)                 |
| `npm run dev:api`   | API only (watch mode)                               |
| `npm run dev:web`   | Frontend only                                       |
| `npm run dev:ai`    | AI service only                                     |
| `npm run build`     | Build all packages                                  |
| Testing             | Run tests per workspace (see AGENTS.md for details) |
| `npm run lint`      | Lint all workspaces                                 |
| `npm run typecheck` | Type-check all workspaces                           |

## API Docs

- Swagger UI: `http://localhost:3001/api/docs`
- API README: `apps/api/README.md`
- API Standards: `docs/api/44-API-STANDARDS.md`

## Key Features

- **16+ CRUD entities**: sections, projects, blog, skills, experiences, testimonials, services, FAQs, leads, achievements, press features, guest appearances, reading list, media, users, system settings
- **Admin dashboard**: 3D scene backgrounds (Three.js), real-time health indicators, sortable DataTable with bulk ops, keyboard shortcuts
- **Enterprise tooling**: Sentry APM + profiling, Pino structured logging, Resend transactional email, BullMQ job queue
- **Performance**: Redis caching layer, Prisma query logging (dev), compound indices, React Query SWR, route prefetch
- **Security**: Rate limiting (per-route), Helmet headers, JWT auth, role guards (admin/editor/viewer), account lockout, password policy, GDPR export + anonymize
- **AI**: AI chat assistant, OpenAI integration, RAG context, quote generation

## Documentation

| Document                                  | Description                                         |
| ----------------------------------------- | --------------------------------------------------- |
| `docs/architecture/SystemArchitecture.md` | System architecture, module dependencies, data flow |
| `docs/operations/DeploymentGuide.md`      | Docker setup, env vars, production checklist        |
| `docs/api/44-API-STANDARDS.md`            | API design conventions, versioning, error format    |
| `docs/security/SecurityArchitecture.md`   | Security model, auth flow, data privacy             |
| `docs/quality/TestingArchitecture.md`     | Test strategy, unit/e2e/integration                 |

## License

MIT
