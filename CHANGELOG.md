# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-11-13

### Changed

- Upgraded to Next.js 15 and React 19, which moved the 3D stack to
  React Three Fiber 9 and Drei 10.
- Upgraded to Zod 4. String format validators moved to the top level
  (`z.url()`, `z.email()`, `z.uuid()`, `z.iso.datetime()`).
- Pinned npm to 11.21.2. npm 10 cannot resolve this dependency tree from
  scratch (npm/cli#9787), and npm 11.16–11.18 drop platform-specific
  optional packages from the lockfile (npm/cli#10043).

### Removed

- The NestJS API (`apps/api`), the FastAPI AI service (`apps/ai`) and the admin
  dashboard. The site is now static: no backend, no database, no CMS.
- The shared contracts package (`packages/shared`). The public types live with
  the content they describe in `apps/web/src/lib/public-content.ts`.
- The API proxy rewrite, the WebContainer sandbox and its COOP/COEP headers,
  and the on-demand ISR revalidation route.
- 256 documentation files that described the removed subsystems.

### Added

- A local essay collection (`POSTS` in `public-content.ts`) so writing is
  published by editing the repository.
- A contact form that composes a `mailto:` link instead of posting to an API.
- Regression tests for the key-normalisation middleware and the contact form.

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
