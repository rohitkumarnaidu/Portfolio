# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-11-13

### Changed

- Upgraded to Next.js 15 and React 19, which moved the 3D stack to React Three Fiber 9 and Drei 10.
- Upgraded to NestJS 12. The v12 packages are ESM only, so the API is consumed through `require(esm)` and the Jest suite runs with `--experimental-vm-modules`.
- Upgraded to Zod 4. String format validators moved to the top level (`z.url()`, `z.email()`, `z.uuid()`, `z.iso.datetime()`).
- Pinned npm to 11.21.2. npm 10 cannot resolve this dependency tree from scratch (npm/cli#9787) and npm 11.16 to 11.18 drop platform-specific optional packages from the lockfile (npm/cli#10043).

### Removed

- The FastAPI AI service (`apps/ai`). The AI assistant was a placeholder stub with no implementation behind it.
- The on-demand ISR revalidation route and the draft-mode preview route, which only existed to serve the AI-generated content.
- The parallel `supabase/` schema copy. The Prisma migrations in `apps/api/prisma` are the authoritative ones.
- 256 documentation files describing the removed AI service and the superseded platform plans.

### Added

- Regression tests for the key-normalisation middleware, the response interceptor, the exception filter, the in-memory store, the cache service, and the portfolio and admin controllers.
- The API coverage gate: 12 new specs took the API from 30.9% of lines to 42.4%, so the CI coverage step is blocking again.
- A generated `docs/MASTER-INDEX.md`, built from the directories that exist.

### Fixed

- The web build no longer fails when Google Fonts rate-limits the runner: the build is retried three times in CI.
- The key-normalisation middleware now replaces `req.query` instead of mutating a copy that Express 5 discards.
- The middleware routes use named wildcards, which path-to-regexp v8 requires.

## [1.0.0] - 2026-06-22

### Added

- Monorepo setup with Turborepo v2 + npm workspaces
- Next.js 14 App Router frontend with ISR rendering
- NestJS 10 REST API with three-layer module architecture
- FastAPI AI microservice with chat, analyze, and health routes
- 34-database-model Prisma schema with PostgreSQL
- JWT authentication with OAuth (Google, GitHub) strategies
- Role-based access control (admin, editor, viewer)
- Redis caching layer with cache-aside pattern
- BullMQ background job queue
- Sentry APM and error tracking
- Pino structured logging
- PostHog analytics and feature flags
- 52+ API endpoints with Swagger documentation
- 3 API unit test suites and E2E test suite
- Admin dashboard with 20+ CRUD interfaces
- Comprehensive UI component library (15 components)
- Shared TypeScript types via @portfolio/shared package
- Docker Compose for 3-service local development
- GitHub Actions CI/CD pipelines
- Documentation: 196 active documents across 18 categories
- Accessibility: WCAG 2.2 AA compliance across component library
- Security: Helmet, rate limiting, input validation, CORS

[1.0.0]: https://github.com/rohitkumarnaidu/Portfolio/releases/tag/v1.0.0
[2.0.0]: https://github.com/rohitkumarnaidu/Portfolio/releases/tag/v2.0.0
