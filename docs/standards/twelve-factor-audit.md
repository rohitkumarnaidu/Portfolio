# 12 Factor App Compliance Audit

## Overview
This document audits the Portfolio platform against the [12 Factor App](https://12factor.net/) methodology for building software-as-a-service applications.

## Audit Results

| Factor | Status | Score | Details |
|--------|:------:|:-----:|---------|
| I. Codebase | ✅ | 95% | Single monorepo with Git version control |
| II. Dependencies | ✅ | 90% | npm workspaces, explicit package.json declarations |
| III. Config | ⚠️ | 75% | Env files, but some defaults in code |
| IV. Backing Services | ✅ | 90% | Services as attached resources via URLs |
| V. Build, Release, Run | ⚠️ | 70% | CI/CD exists but no strict release artifact tracking |
| VI. Processes | ✅ | 90% | Stateless processes, session in DB |
| VII. Port Binding | ✅ | 95% | Self-contained HTTP servers via NestJS/Next.js |
| VIII. Concurrency | ✅ | 85% | Process model via Docker, serverless scaling |
| IX. Disposability | ⚠️ | 70% | Graceful shutdown configured, startup not verified |
| X. Dev/Prod Parity | ⚠️ | 65% | Docker parity, but some service differences |
| XI. Logs | ✅ | 90% | Structured JSON logging via Pino |
| XII. Admin Processes | ✅ | 85% | One-off scripts via NestJS CLI, Prisma |

**Overall Score: 82/100**

---

## I. Codebase (Score: 95%)

### Criteria
One codebase tracked in revision control, many deploys.

### Status: ✅ Compliant
- Single Git repository for all code
- Monorepo with 3 apps + 3 packages via Turborepo
- One codebase → many deploys (dev, staging, production)

### Issues
- `apps/ai/requirements.txt` for Python deps alongside npm — acceptable polyglot approach

---

## II. Dependencies (Score: 90%)

### Criteria
Explicitly declare and isolate dependencies.

### Status: ✅ Compliant
- All npm dependencies in root + workspace `package.json` files
- `npm ci` for reproducible installs
- `requirements.txt` for Python (apps/ai/)
- Docker containers for isolation

### Issues
- No lockfile pinning visible (assumes `package-lock.json` exists)
- Python dependencies not pinned at patch level

---

## III. Config (Score: 75%)

### Criteria
Store config in the environment.

### Status: ⚠️ Partially Compliant
- Environment variables via `config/.env.example`
- Centralized Zod-validated env config (apps/api/src/config/env.config.ts)
- Different configs per environment

### Issues
- **OAuth placeholders in code:** `'placeholder-id'` fallbacks in GitHub/Google strategies (`apps/api/src/modules/auth/`)
- No runtime config validation beyond startup
- Some config hardcoded in docker-compose.yml

---

## IV. Backing Services (Score: 90%)

### Criteria
Treat backing services as attached resources.

### Status: ✅ Compliant
- All services accessed via URL/environment variables
- PostgreSQL, Redis, Supabase as attached resources
- Swappable via config change

### Issues
- Direct coupling to Supabase (not abstracted behind repository pattern)
- Vendor lock-in risk with Vercel serverless functions

---

## V. Build, Release, Run (Score: 70%)

### Criteria
Strictly separate build and run stages.

### Status: ⚠️ Partially Compliant
- Build: `npm run build` via Turbo
- Release: Vercel deployment + Docker images to ghcr.io
- Run: Production containers/serverless

### Issues
- No build artifact versioning (Docker tags are mutable)
- Vercel handles release/run implicitly — not explicitly separated
- No rollback policy beyond Vercel redeploy

---

## VI. Processes (Score: 90%)

### Criteria
Execute the app as one or more stateless processes.

### Status: ✅ Compliant
- No local disk storage (media in Supabase Storage)
- Session state in PostgreSQL, not in-memory
- Cache in Redis (disposable)
- Horizontal scaling supported (serverless + containers)

### Issues
- BullMQ queues require Redis — queue state is externalized ✅

---

## VII. Port Binding (Score: 95%)

### Criteria
Export services via port binding.

### Status: ✅ Compliant
- Web: Next.js on port 3000
- API: NestJS on port 3001
- AI: FastAPI on port 8000
- All self-contained HTTP servers

### Issues
- None

---

## VIII. Concurrency (Score: 85%)

### Criteria
Scale out via the process model.

### Status: ✅ Compliant
- Stateless design allows horizontal scaling
- Vercel auto-scales serverless functions
- Docker Compose for local orchestration

### Issues
- No load testing data to validate scaling behavior
- Database is single point of scaling bottleneck

---

## IX. Disposability (Score: 70%)

### Criteria
Maximize robustness with fast startup and graceful shutdown.

### Status: ⚠️ Partially Compliant
- Graceful shutdown via NestJS lifecycle hooks (`onApplicationShutdown`)
- Docker health checks configured

### Issues
- No startup readiness verification beyond HTTP check
- Crash recovery not tested
- No circuit breaker for external dependencies

---

## X. Dev/Prod Parity (Score: 65%)

### Criteria
Keep development, staging, and production as similar as possible.

### Status: ⚠️ Partially Compliant
- Docker provides environment parity
- Same codebase across environments

### Issues
- **Local dev uses Docker PostgreSQL; production uses Supabase.** Different PostgreSQL providers with different features/behaviors
- Vercel preview deployments help but are not identical to production
- AI service uses local Python vs Railway in production
- No staging environment documented as fully production-like

---

## XI. Logs (Score: 90%)

### Criteria
Treat logs as event streams.

### Status: ✅ Compliant
- Structured JSON logging via Pino (apps/api)
- Log levels (debug, info, warn, error, fatal)
- Centralized log management (Better Stack)
- Logs not stored locally

### Issues
- AI service logs not yet integrated with centralized logging
- No log-based alerting configured

---

## XII. Admin Processes (Score: 85%)

### Criteria
Run admin/management tasks as one-off processes.

### Status: ✅ Compliant
- Prisma migrations (`npm run prisma:migrate:*`)
- Database seed scripts
- Data retention cleanup (scheduled job)
- NestJS CLI for code generation

### Issues
- No documented procedure for one-off data fixes
- Admin scripts should run in same environment as production

---

## Improvement Roadmap

| Priority | Factor | Issue | Fix | Effort |
|:--------:|:------:|-------|-----|:------:|
| P1 | III | Placeholder secrets in code | Remove fallbacks, fail hard if not configured | 1h |
| P1 | V | Release artifact tracking | Add Docker tag versioning, release manifest | 2h |
| P1 | IX | Graceful shutdown verification | Test shutdown behavior, document | 2h |
| P2 | X | Dev/Prod parity | Document environment differences, reduce gaps | 4h |
| P2 | XII | One-off script documentation | Add runbook for admin scripts | 2h |
| P3 | VIII | Concurrency validation | Load test and document scaling behavior | 8h |

## Related Documents
- `docs/devops/environment-matrix.md` — Environment configuration
- `docs/devops/container-strategy.md` — Container architecture
- `docs/operations/DeploymentGuide.md` — Deployment workflow
- `docs/operations/22-OBSERVABILITY.md` — Logging and observability
