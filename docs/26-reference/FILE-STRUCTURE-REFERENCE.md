# File Structure Reference

> **Last updated:** July 2026 | **Version:** 1.0

---

## Monorepo Tree (Top 3 Levels)

```
portfolio/
├── apps/
│   ├── ai/                          # FastAPI AI service (port 8000)
│   │   ├── app/
│   │   │   └── main.py              # AI entry point
│   │   └── requirements.txt
│   ├── api/                         # NestJS REST API (port 3001)
│   │   ├── prisma/
│   │   │   ├── schema.prisma        # Prisma database schema
│   │   │   └── migrations/          # Auto-generated migrations
│   │   ├── generated/prisma/        # Generated Prisma client (custom path)
│   │   └── src/
│   │       ├── main.ts              # API entry point (bootstrap)
│   │       ├── modules/             # Business logic modules
│   │       ├── portfolio/           # Public, read-only controllers
│   │       ├── admin/               # Authenticated CRUD controllers
│   │       └── common/              # Cross-cutting concerns
│   └── web/                         # Next.js 14 frontend (port 3000)
│       ├── src/
│       │   ├── app/                 # App Router pages
│       │   │   ├── page.tsx         # Web entry point (home)
│       │   │   ├── admin/           # Admin dashboard routes
│       │   │   ├── projects/        # Public pages
│       │   │   ├── blog/
│       │   │   └── ...
│       │   ├── components/          # React components
│       │   ├── lib/                 # Utilities, API client, hooks
│       │   └── styles/              # Global styles
│       ├── next.config.js           # Next.js configuration
│       └── tailwind.config.ts       # Tailwind CSS configuration
├── packages/
│   ├── shared/                      # Shared TypeScript types + Zod schemas
│   │   └── src/index.ts             # Shared types entry point
│   ├── ui/                          # Shared React component library
│   │   └── src/                     # UI components
│   └── config/                      # Shared ESLint/TS configs
├── config/
│   └── .env.example                 # Environment variable template
├── infrastructure/
│   └── docker/
│       └── docker-compose.yml       # Docker Compose configuration
├── .github/
│   └── workflows/
│       ├── ci.yml                   # CI pipeline (lint, test, build, deploy)
│       └── pr.yml                   # PR checks
├── turbo.json                       # Turborepo configuration
├── package.json                     # Root workspace config
├── .husky/                          # Git hooks
└── docs/                            # Project documentation
```

## Key File Locations

| Purpose          | Path                                       |
| ---------------- | ------------------------------------------ |
| Prisma schema    | `apps/api/prisma/schema.prisma`            |
| API bootstrap    | `apps/api/src/main.ts`                     |
| Web entry (home) | `apps/web/src/app/page.tsx`                |
| AI entry         | `apps/ai/app/main.py`                      |
| Shared types     | `packages/shared/src/index.ts`             |
| UI components    | `packages/ui/src/`                         |
| Tailwind config  | `apps/web/tailwind.config.ts`              |
| Next config      | `apps/web/next.config.js`                  |
| Turborepo config | `turbo.json`                               |
| Docker Compose   | `infrastructure/docker/docker-compose.yml` |
| CI workflows     | `.github/workflows/`                       |
| Env template     | `config/.env.example`                      |

## Path Aliases

| Alias               | Resolves To            |
| ------------------- | ---------------------- |
| `@/`                | `apps/web/src/`        |
| `@portfolio/shared` | `packages/shared/src/` |
| `@portfolio/ui`     | `packages/ui/src/`     |
| `@portfolio/config` | `packages/config/`     |

These are configured in `apps/web/tsconfig.json` and `apps/web/next.config.js`.

## Import Conventions

```typescript
// Web app — use @/ alias for project-internal imports
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useApiQuery } from '@/lib/use-api-query';

// Shared types — always import from @portfolio/shared, never duplicate
import { type Project, type ApiResponse } from '@portfolio/shared';

// UI components — from @portfolio/ui
import { Card } from '@portfolio/ui';

// API (NestJS) — use relative imports within apps/api
import { PrismaService } from '../../common/database/prisma.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
```

### NestJS Module Import Pattern

```typescript
// Services are imported from modules, controllers from separate delivery layers
import { ProjectsService } from '../../modules/projects/projects.service';
```

### Web Page Segment Conventions

- Each route directory mirrors the URL path
- `page.tsx` — the page component (server component by default)
- `layout.tsx` — layout wrapper for the route segment
- `loading.tsx` — loading state (Suspense boundary)
- `error.tsx` — error boundary

## Cross-References

- [MASTER-INDEX.md](../MASTER-INDEX.md) — Documentation master index
- [CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) — Cross-reference system
