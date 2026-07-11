# Coding Standards — FAANG Enterprise Development Guidelines

> **Document:** `CodingStandards.md` | **Version:** 5.0 (Enterprise Upgrade) | **Last Updated:** July 2026
> **Status:** ✅ Active | **Owner:** Principal Staff Engineer | **Review Cadence:** Quarterly

## 1. Executive Summary

This document enforces strict FAANG-grade coding standards across the monorepo. It details architecture boundaries, required type-safety (Zod), three-layer NestJS patterns, and LLM-assisted code generation rules. All PRs must adhere strictly to these guidelines.

## 2. TypeScript Standards

### 2.1 Strict Mode

- **Always enabled:** `strict: true` in all `tsconfig.json` files. No exceptions.
- **Additional flags:** `noUncheckedIndexedAccess`, `noImplicitOverride`, `exactOptionalPropertyTypes`.
- **`any` is forbidden.** Use `unknown` and narrow with type guards or Zod parsing.
- **`as` casts are forbidden** unless the type is first validated (Zod `.parse()` then the result is typed). Prefer `z.infer<>` for derived types.

### 2.2 Naming Conventions

| Artifact                 | Convention                   | Example                               |
| ------------------------ | ---------------------------- | ------------------------------------- |
| Types / Interfaces       | PascalCase                   | `ProjectResponse`, `CreateProjectDto` |
| Enums                    | PascalCase                   | `UserRole`, `ProjectStatus`           |
| Functions / Methods      | camelCase                    | `getProjectBySlug`, `formatDate`      |
| Variables                | camelCase                    | `projectCount`, `activeFilters`       |
| Constants (module-level) | UPPER_SNAKE_CASE             | `MAX_RETRY_COUNT`, `API_BASE_URL`     |
| Files                    | kebab-case                   | `project.service.ts`, `auth.guard.ts` |
| Classes                  | PascalCase                   | `ProjectService`, `JwtAuthGuard`      |
| React Components         | PascalCase                   | `ProjectCard`, `AdminDashboard`       |
| React Hooks              | camelCase, `use` prefix      | `useProjects`, `useAuthSession`       |
| Zod Schemas              | PascalCase + `Schema` suffix | `ProjectSchema`, `CreateUserSchema`   |
| Directories              | kebab-case                   | `project/`, `auth/`, `3d/`            |

### 2.3 File Organization

- **One class/component per file.** Exceptions: small utility types or helper constants co-located with the main export.
- **Barrel exports:** `index.ts` in each module directory re-exports public API. Avoid deep import paths.
- **Max lines per file:** 300 lines. Larger files should be split into multiple modules.
- **Max function lines:** 50 lines. Extract helper functions for readability.

## 3. Monorepo Organization

- **Apps:** Live in `apps/` (`web`, `api`, `ai`).
- **Packages:** Shared code lives in `packages/` (`shared`, `ui`, `config`).
- **Dependency direction:** `apps/` may depend on `packages/`. `packages/` may NOT depend on `apps/`.
- No circular dependencies between packages. Enforced by Dependency Cruiser in CI.
- All shared interfaces and Zod schemas MUST be placed in `packages/shared` to act as the single source of truth for API contracts.

## 4. API Design (NestJS)

### 4.1 Three-Layer Module Pattern (Mandatory)

1. **`src/modules/<entity>/`** — Business logic (`Service`), data access (Prisma via `PrismaService`), DTOs (Zod + class-validator). **NO CONTROLLERS.** The module must export its service.
2. **`src/portfolio/controllers/<entity>.controller.ts`** — Public, read-only endpoints (`/api/portfolio/...`). Unauthenticated, `@CacheTTL` applied. Registered in `PortfolioModule`.
3. **`src/admin/controllers/<entity>.controller.ts`** — Authenticated CRUD endpoints (`/api/admin/...`). Guarded by `@UseGuards(JwtAuthGuard, RolesGuard)` + `@ApiBearerAuth()`. Per-route `@Roles('admin'|'editor'|'viewer')`. `@Audit()` decorator on mutations. Registered in `AdminModule`.

### 4.2 DTO Validation

- **class-validator** decorators on DTO classes for runtime validation (NestJS `ValidationPipe`).
- **Zod schemas** in `packages/shared` define the canonical API contract shape.
- `ValidationPipe` configured with `whitelist: true` and `forbidNonWhitelisted: true` globally.
- Request body, query params, and route params must all be validated.

### 4.3 Error Handling

- All errors propagate to the global `GlobalExceptionFilter` (configured in `main.ts`).
- Controllers never catch exceptions unless they need to add context before re-throwing.
- Use NestJS `HttpException` subclasses (`BadRequestException`, `NotFoundException`, `ForbiddenException`).
- Never `catch` without logging. Use the injected logger (`PinoLogger`) at minimum.

## 5. Web Frontend (Next.js)

### 5.1 Rendering Strategy

- **React Server Components (RSC) by default.** All components are server components unless they need interactivity.
- **`'use client'` only when necessary:** Event handlers, hooks, browser APIs, state, effects, context providers.
- Separate data fetching (server component) from interactive UI (client component). Fetch in parent, pass props down.

### 5.2 Component Organization

```
src/components/
  3d/          # Three.js / React Three Fiber components
  admin/       # Admin dashboard components (data tables, forms, charts)
  sections/    # Page sections (hero, about, projects grid, contact)
  ui/          # Shared UI primitives (Button, Card, Dialog — wraps Radix)
```

### 5.3 Data Fetching

- **Server components:** Fetch directly from API using `fetch()` with `cache: 'force-cache'` or `next: { revalidate: 60 }`.
- **Client components:** Use `src/lib/api.ts` typed fetch wrapper. Wrap with TanStack Query (`useQuery`, `useMutation`).
- Server-side calls hit `NEXT_PUBLIC_API_URL`. Client-side calls use `/api` relative proxy.

## 6. Import Conventions

### 6.1 Import Order

Imports must be grouped and ordered as follows (enforced by ESLint `import/order`):

1. Node built-ins (`fs`, `path`)
2. External packages (`react`, `next`, `@tanstack/react-query`, `zod`)
3. Internal absolute imports (`@/components/...`, `@/lib/...`)
4. Relative imports (`./ProjectCard`, `../types`)
5. CSS/styles (`*.module.css`, `*.css`)

### 6.2 Absolute Imports

- Use `@/` alias for `apps/web/src/*`.
- Use `@portfolio/shared`, `@portfolio/ui`, `@portfolio/config` for shared packages.
- No deeply nested relative imports (`../../../utils/helpers`). Use absolute paths.

## 7. Database (Prisma + Supabase)

- **Schema:** Changes must be made in `prisma/schema.prisma`.
- **Generation:** Always run `npm run prisma:generate` after schema changes.
- **Migrations:** `prisma migrate dev` for local, `prisma migrate deploy` for production.
- **Access:** Through `PrismaService` (`src/common/database/prisma.service.ts`).
- **No raw SQL** unless absolutely necessary. If unavoidable, use parameterized queries.

## 8. Code Quality

### 8.1 Automated Enforcement

- **Formatting:** Prettier via `npm run format`. Trailing commas, single quotes, 80 char width.
- **Linting:** ESLint via `npm run lint`. TypeScript rules, React hooks rules, import order.
- **Pre-commit:** Husky runs lint-staged (Prettier + ESLint --fix) on all staged files.

### 8.2 Error Handling Rules

- Never catch an error without logging it.
- Every async operation must have error handling (try/catch or `.catch()`).
- Never swallow errors (`catch { /* empty */ }`).
- User-facing errors must be user-friendly, not raw stack traces.

### 8.3 React Hooks Rules

- All hooks called at top level (no conditional hooks).
- Dependencies array must be exhaustive (enforced by `react-hooks/exhaustive-deps`).
- `useCallback` and `useMemo` only when profiling shows a performance issue.

## 9. Git and Version Control

- **Branching:** Use `feat/<name>`, `fix/<name>`, `chore/<name>`, `docs/<name>`, `refactor/<name>`, `test/<name>`.
- **Commits:** Follow Conventional Commits (`type(scope): description`).
- **PRs:** Must pass CI, be reviewed, and be up to date with `main` before merge.
