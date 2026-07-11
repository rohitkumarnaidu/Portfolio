# Portfolio API

NestJS REST API backend — fully separated Portfolio (public) and Admin (authenticated) routes.

## Tech

- **Framework**: NestJS 10, TypeScript, strict mode
- **Database**: PostgreSQL via Prisma ORM with `@prisma/adapter-pg` driver adapter
- **Auth**: JWT access tokens (15min) + refresh tokens in Redis (7d TTL)
- **Queue**: BullMQ (Redis-backed) for email, notifications, background jobs
- **Caching**: ioredis — portfolio endpoints (5min TTL), automatic invalidation on writes
- **Email**: Resend API via BullMQ queue + Handlebars templates
- **Monitoring**: Sentry APM + profiling, Pino structured logging
- **Validation**: class-validator DTOs + ValidationPipe (whitelist, forbidNonWhitelisted)
- **Docs**: Swagger/OpenAPI at `GET /api/docs`

## Environment Variables

See `config/.env.example` at repo root. Key variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `REDIS_URL` | Redis connection (cache + queue + sessions) |
| `SENTRY_DSN` | Sentry error tracking + profiling |
| `RESEND_API_KEY` | Transactional email |
| `OPENAI_API_KEY` | AI assistant |
| `CORS_ORIGIN` | Allowed origins (comma-separated) |
| `RATE_LIMIT_TTL` | Global rate limit window (seconds) |
| `RATE_LIMIT_MAX` | Global rate limit max requests |
| `NODE_ENV` | `development` / `production` |

## Scripts

| Command | Description |
|---------|------------|
| `npm run start:dev` | Watch mode (auto-reload) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript strict check |
| `npm test` | Jest unit tests (52 tests) |
| `npm run test:e2e` | End-to-end tests (30+ tests, requires DB) |
| `npm run test:coverage` | Coverage report |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate:dev` | Dev migration (creates SQL file) |
| `npm run prisma:migrate:deploy` | Production migration |
| `npm run prisma:studio` | Prisma Studio GUI |
| `npm run prisma:seed` | Seed database |

## Project Structure

```
src/
├── main.ts                  App bootstrap, Helmet, CORS, Swagger
├── app.module.ts            Root module
├── config/env.config.ts     Zod-validated env schema
├── modules/
│   ├── auth/                JWT auth, guards, decorators
│   ├── users/               User CRUD, GDPR export/anonymize
│   ├── blog/                Blog CRUD + publish workflow
│   ├── projects/            Project CRUD + images + case studies
│   ├── sections/            Portfolio section config
│   ├── skills/              Skill CRUD + categories
│   ├── experiences/         Experience/timeline CRUD
│   ├── testimonials/        Testimonial CRUD
│   ├── services/            Service offering CRUD
│   ├── leads/               Lead capture + notes + email notifications
│   ├── faqs/                FAQ CRUD
│   ├── media/               Media asset upload + management
│   ├── achievements/        Achievement/badge CRUD
│   ├── press-features/      Press mention CRUD
│   ├── guest-appearances/   Guest appearance CRUD
│   ├── reading-list-items/  Reading list CRUD
│   ├── activities/          Admin activity audit log
│   ├── analytics/           Analytics events + sessions + page views
│   ├── notifications/       In-app notification CRUD
│   ├── chat/                AI chat conversation CRUD
│   ├── api-keys/            API key management
│   ├── feature-flags/       Feature flag toggles
│   ├── system-settings/     Key-value settings
│   └── availability-status/ Freelance availability toggle
├── common/
│   ├── cache/               Redis caching service (ioredis)
│   ├── cleanup/             Data retention cleanup service
│   ├── database/            PrismaService + pagination helper
│   ├── decorators/          Audit, Sentry trace decorators
│   ├── export/              CSV generation service
│   ├── filters/             Global exception filter (Sentry-aware)
│   ├── interceptors/        Audit interceptor
│   ├── queue/               BullMQ queue module + email processor
│   └── utils/               Sanitize, validators
├── admin/                   Admin controllers (separated from portfolio)
└── portfolio/               Public portfolio controllers
```

## API Routes

### Portfolio (Public)
All under `GET /api/portfolio/*` — no auth required. Cached via Redis with 5min TTL (for sections, skills, experiences). Paginated with `page` + `perPage` query params.

### Admin (Authenticated)
All under `/api/admin/*` — JWT auth required. RBAC enforced via `@Roles('admin', 'editor', 'viewer')`. Audit-trailed via `@Audit()` decorator.

### Special Endpoints
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check (DB, Redis, queue, email) |
| `POST` | `/api/admin/cleanup` | Data retention cleanup (admin only) |
| `GET` | `/api/admin/export/:entity/csv` | CSV export (15 entity types) |
| `GET` | `/api/admin/users/:id/export` | GDPR data export |
| `POST` | `/api/admin/users/:id/anonymize` | GDPR account anonymization |

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `POST /api/admin/auth/login` | 5/min |
| `POST /api/admin/auth/register` | 3/min |
| `POST /api/admin/auth/refresh` | 20/min |
| Global default | 100/60s |

## Testing

```bash
# Unit tests (no DB required)
npm test

# E2E tests (requires DB connection)
npm run test:e2e

# Coverage
npm run test:coverage
```

## Deployment

See `docs/operations/DeploymentGuide.md` and `infrastructure/docker/docker-compose.yml`.
