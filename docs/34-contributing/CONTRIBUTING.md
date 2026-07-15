# Contributing to Portfolio

<p align="center">
  <a href="CODE_OF_CONDUCT.md">
    <img src="https://img.shields.io/badge/Code%20of%20Conduct-2.1-4baaaa?style=flat-square" alt="Code of Conduct" />
  </a>
  <a href="https://github.com/yourusername/portfolio/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/yourusername/portfolio/ci.yml?branch=main&label=CI&logo=github&style=flat-square" alt="CI Status" />
  </a>
  <a href="LICENSE.md">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License" />
  </a>
  <a href="docs/MASTER-INDEX.md">
    <img src="https://img.shields.io/badge/docs-MASTER--INDEX-blueviolet?style=flat-square" alt="Docs" />
  </a>
</p>

## Quick Links

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Documentation Index](docs/MASTER-INDEX.md)
- [Project Board](TODO)
- [Discussions](TODO)

## Table of Contents

1. [Development Setup](#development-setup)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Documentation](#documentation)
7. [Pull Request Process](#pull-request-process)
8. [Review Process](#review-process)
9. [Commit Guidelines](#commit-guidelines)

## Development Setup

### Prerequisites

- Node.js >= 18 (see `.nvmrc` or `package.json` engine field)
- npm >= 10
- Docker and Docker Compose (for local database)
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/portfolio.git
cd portfolio

# Install dependencies
npm ci

# Set up environment variables
cp config/.env.example config/.env

# Start databases
docker compose -f infrastructure/docker/docker-compose.yml up -d

# Initialize database (from apps/api)
cd apps/api
npx prisma migrate dev
npx prisma db seed
cd ../..

# Start development servers
npm run dev
```

### Available Workspaces

```
apps/
  web/       - Next.js 14 frontend (port 3000)
  api/       - NestJS REST API (port 3001)
  ai/        - FastAPI AI service (port 8000)
packages/
  shared/    - Shared Zod schemas + TypeScript types (@portfolio/shared)
  ui/        - Shared React components (@portfolio/ui)
  config/    - Shared ESLint + TypeScript configs (@portfolio/config)
```

## Project Structure

```
portfolio/
├── apps/
│   ├── web/           Next.js 14 App Router — public portfolio + admin dashboard
│   ├── api/           NestJS — REST API with three-layer pattern (module → portfolio controller → admin controller)
│   └── ai/            FastAPI — AI chat, embeddings, RAG (placeholder)
├── packages/
│   ├── shared/        Shared Zod schemas + TypeScript types (@portfolio/shared)
│   ├── ui/            Shared React components (@portfolio/ui)
│   └── config/        Shared ESLint + TypeScript configs (@portfolio/config)
├── infrastructure/
│   ├── docker/        Docker Compose + Dockerfiles (web, api, ai)
│   └── ci/            CI/CD reference
├── config/            Environment variable templates
├── docs/              Architecture, deployment, security, compliance, and design docs
├── scripts/           Build and utility scripts
└── .github/           GitHub templates and workflows
```

## Development Workflow

1. Create a feature branch from `main`
2. Make changes following [Coding Standards](#coding-standards)
3. Add or update tests
4. Run lint and type checks
5. Submit a pull request

## Coding Standards

This project follows the [AI Engineering Constitution](docs/23-governance/32-SKILL.md) for all coding standards. Key highlights:

- **TypeScript:** Strict mode, no `any`, prefer interfaces over types for objects
- **React:** Server components by default, client components only when needed
- **NestJS:** Three-layer pattern (module portfolio controller admin controller)
- **Database:** Prisma ORM, migrations via `prisma migrate`, custom output path at `apps/api/generated/prisma`
- **API:** `{ data, meta }` envelope format, API versioning via `Accept` header
- **Auth:** JWT access tokens + Redis-backed refresh tokens, role-based access (`admin` / `editor` / `viewer`)

## Testing

- **API (Jest):** `cd apps/api && npm test`
- **Web (Vitest):** `cd apps/web && npm test`
- **E2E (Playwright):** `cd apps/web && npm run test:e2e`

Run all checks from root: `npm run lint && npm run typecheck`

## Documentation

- Update docs in `docs/` when changing behavior
- Architecture decisions `docs/27-decisions/`
- API changes update `docs/10-api/`
- All docs follow the [MASTER-INDEX.md](docs/MASTER-INDEX.md) taxonomy

## Pull Request Process

1. Ensure all CI checks pass (lint, typecheck, test, build)
2. Update documentation for any changed behavior
3. Include a clear description of the change
4. Reference related issues using GitHub keywords
5. Request review from maintainers

### PR Title Format

```
type(scope): brief description
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
Scopes: `web`, `api`, `ai`, `shared`, `ui`, `infra`, `docs`

## Review Process

- All PRs require at least one approval
- Address all review comments
- Maintainers may request changes for standards compliance
- Squash merge is preferred

## Commit Guidelines

Use conventional commits:

```
feat(web): add project filtering
fix(api): correct rate limit header
docs(adr): add database migration ADR
```

---

Thank you for contributing!

## Cross-References

- [MASTER-INDEX.md](../MASTER-INDEX.md) — Documentation master index
- [CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) — Cross-reference system
