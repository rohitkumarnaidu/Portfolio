# Frequently Asked Questions

## General

### What is this project?
A next-generation enterprise portfolio platform built with NestJS, Next.js, and FastAPI. It showcases skills, projects, and experience with AI-powered interaction.

### What tech stack does it use?
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Three.js
- **Backend:** NestJS 10, Prisma ORM, PostgreSQL, Redis
- **AI:** FastAPI, LangChain, OpenAI, Anthropic
- **Infrastructure:** Docker, Vercel, Supabase

### Is this open source?
Yes, the project is licensed under MIT — see the `LICENSE` file in the repository root.

## Development

### How do I set up the project locally?
See `docs/onboarding/developer-onboarding.md` for a complete setup guide.

### How do I run tests?
```bash
# API tests
cd apps/api && npm test

# Web tests
cd apps/web && npm test

# E2E tests
cd apps/web && npm run test:e2e

# All linting
npm run lint
```

### How do I create a new API endpoint?
1. Add service in `apps/api/src/modules/<entity>/`
2. Add portfolio controller in `apps/api/src/portfolio/controllers/`
3. Add admin controller in `apps/api/src/admin/controllers/`
4. Register modules in `portfolio.module.ts` and `admin.module.ts`

### How do I add a new database model?
1. Define model in `apps/api/prisma/schema.prisma`
2. Run `npm run prisma:migrate:dev`
3. Run `npm run prisma:generate`
4. Create service + controller modules

### How do I add a new page?
Create a new directory under `apps/web/src/app/` following Next.js App Router conventions.

## Deployment

### How is the project deployed?
- Frontend + API: Vercel
- AI Service: Railway
- Database: Supabase
- CI/CD: GitHub Actions

### How do I deploy a change?
Push to `main` branch. GitHub Actions CI runs lint, test, build, then deploys.

## Troubleshooting

### I get "Module not found" errors
Run `npm ci` from the root to install all workspace dependencies.

### I get Prisma client errors
Run `npm run prisma:generate` from `apps/api/`.

### I get database connection errors
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in environment
- Run Docker Compose: `docker compose -f infrastructure/docker/docker-compose.yml up -d`

### Hot reloading isn't working
- Ensure you're using `npm run dev:api` or `npm run dev:web`
- Check for compilation errors in the terminal

## More Help
- [CONTRIBUTING.md](/CONTRIBUTING.md) - Contribution guide
- [Developer Onboarding](docs/onboarding/developer-onboarding.md)
- [Documentation Index](docs/MASTER-INDEX.md)
