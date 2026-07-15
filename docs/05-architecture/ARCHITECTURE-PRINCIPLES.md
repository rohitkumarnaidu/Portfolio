# Architecture Principles

10 core principles driving every architectural decision in the Ultimate Portfolio. Each includes how it applies to this NestJS/Next.js/Turborepo monorepo, with concrete codebase references.

---

## 1. Separation of Concerns (SoC)

Every layer has a single, well-defined responsibility.

**Frontend (Next.js 14 App Router):** Handles UI rendering, user interaction, and client-side state. Never queries the database directly. Data arrives exclusively through the typed API client at `apps/web/src/lib/api.ts`.

**Backend (NestJS 10):** Houses all business logic inside `apps/api/src/modules/<entity>/` services. Controllers are thin Ã¢â‚¬â€ they only route HTTP verbs to service methods. No views are rendered.

**AI Service (FastAPI):** Isolated Python microservice at `apps/ai/` for compute-heavy AI workloads (RAG, embeddings, LLM streaming). Never touches the database directly Ã¢â‚¬â€ communicates with NestJS via REST.

**Example:** A Projects module has three homes:

- `apps/api/src/modules/projects/projects.service.ts` Ã¢â‚¬â€ business logic
- `apps/api/src/portfolio/controllers/projects.controller.ts` Ã¢â‚¬â€ public read-only delivery
- `apps/api/src/admin/controllers/projects.controller.ts` Ã¢â‚¬â€ authenticated CRUD

## 2. Dependency Inversion (DIP)

High-level modules depend on abstractions, not concrete implementations.

**NestJS Modules:** Each module imports `PrismaService` (defined in `apps/api/src/common/database/prisma.service.ts`) through its interface, not through direct database calls. Swappable Ã¢â‚¬â€ the same service interface could back a different ORM.

**Caching Layer:** Controllers decorate with `@CacheTTL()` (e.g., `apps/api/src/portfolio/controllers/projects.controller.ts:12`). The cache implementation (in-memory vs Redis) is abstracted behind NestJS's `CacheModule`.

**Repository Pattern via PrismaService:** `apps/api/src/common/database/prisma.service.ts` wraps `PrismaClient`. Services depend on this wrapper, making unit tests possible by injecting a mock.

## 3. Single Responsibility (SRP)

A class or module should have one reason to change.

**Three-Layer API Pattern:**

- `modules/<entity>/` Ã¢â‚¬â€ business logic. Changes when business rules change.
- `portfolio/controllers/<entity>.controller.ts` Ã¢â‚¬â€ public delivery. Changes when API contract changes.
- `admin/controllers/<entity>.controller.ts` Ã¢â‚¬â€ admin delivery. Changes when auth/audit requirements change.

**Common Utilities:** Each cross-cutting concern lives in its own `apps/api/src/common/<concern>/` subdirectory Ã¢â‚¬â€ `cache/`, `filters/`, `interceptors/`, `decorators/`, `queue/`, `notifications/`. No file mixes two concerns.

## 4. Open/Closed (OCP)

Software entities are open for extension, closed for modification.

**Module Imports:** `PortfolioModule` (`apps/api/src/portfolio/portfolio.module.ts`) and `AdminModule` (`apps/api/src/admin/admin.module.ts`) import the same module classes. Adding a new entity means adding the module once and registering controllers in both modules Ã¢â‚¬â€ no existing code changes.

**DTO Validation:** Zod schemas in `packages/shared/src/` define the API contract. Adding a new field means extending the schema, not modifying validation logic. The global `ValidationPipe` (`apps/api/src/main.ts:49-56`) picks up changes automatically via `whitelist` + `forbidNonWhitelisted`.

## 5. Liskov Substitution (LSP)

Derived types must be substitutable for their base types.

**Shared Types:** `@portfolio/shared` provides interfaces that both `apps/web` and `apps/api` consume. A `Project` type in the frontend is identical to a `Project` type in the backend. Any API endpoint returning `Project[]` can be swapped because the contracts are structurally identical.

**Auth Guards:** `JwtAuthGuard` and `RolesGuard` (from `apps/api/src/modules/auth/`) are composable decorators. Any admin controller decorated with `@UseGuards(JwtAuthGuard, RolesGuard)` is interchangeable Ã¢â‚¬â€ they all enforce the same auth contract.

## 6. Interface Segregation (ISP)

Clients should not depend on interfaces they don't use.

**API Hooks:** The 27 React Query hooks in `apps/web/src/lib/hooks/` each consume only the slice of the API they need. `useProjects.ts` imports `getProjects`, `getProject`, `createProject`, `updateProject`, `deleteProject` Ã¢â‚¬â€ never imports section, blog, or lead functions.

**Modular DTOs:** Each entity has its own `dto/` folder with create/update DTOs. A `CreateProjectDto` doesn't carry fields from `UpdateProjectDto` that aren't relevant to creation.

## 7. Don't Repeat Yourself (DRY)

Every piece of knowledge has one authoritative representation.

**Shared Package:** `packages/shared/` is the single source of truth for TypeScript types, Zod schemas, and response envelopes (`{ data, meta }`). Both `apps/web` and `apps/api` import from `@portfolio/shared` Ã¢â‚¬â€ never redefine.

**API Client:** `apps/web/src/lib/api.ts` is the single typed fetch wrapper. All data-fetching functions (getSections, getProjects, getSkills, etc.) go through the same `request<T>()` helper, which handles auth token attachment, error parsing, and the `{ data, meta }` envelope unwrap.

**Prisma Schema:** The database schema lives once in `apps/api/prisma/schema.prisma`. Prisma Client is generated to `apps/api/generated/prisma/`. DTOs are derived from (not duplicated from) the schema.

## 8. Keep It Simple (KISS)

Prefer the simplest solution that meets requirements.

**TanStack Query over Redux:** The admin dashboard uses TanStack Query for server state and `useState`/`useReducer` for local state Ã¢â‚¬â€ no Redux boilerplate. State is kept as close to usage as possible (`apps/web/src/lib/hooks/*.ts`).

**No Over-Abstracting:** Controllers are thin wrappers. Services use Prisma directly rather than a repository layer Ã¢â‚¬â€ the abstraction cost isn't justified for this application's complexity.

**Direct NestJS Module Import:** Modules import `PrismaService` directly rather than through a repository abstraction layer. The simplicity gain outweighs theoretical future ORM swapping.

## 9. YAGNI (You Aren't Gonna Need It)

Build only what's needed now, not what might be needed later.

**No GraphQL:** REST satisfies all current requirements. GraphQL would add schema stitching, resolvers, and client complexity without proportional benefit.

**No Microservices (within API):** NestJS runs as a single process with modular separation. Only the AI service is separated (FastAPI), and only because the Python ecosystem is strictly necessary for LangChain/LLM dependencies.

**No Full Test Coverage:** Tests focus on core business logic (NestJS services) and critical E2E flows. UI tests target complex interactive components only, per `EngineeringPrinciples.md`.

## 10. Convention over Configuration (CoC)

Sensible defaults reduce decision fatigue.

**Naming Conventions:**

- Portfolio controllers: `apps/api/src/portfolio/controllers/<entity>.controller.ts`
- Admin controllers: `apps/api/src/admin/controllers/<entity>.controller.ts`
- React Query hooks: `apps/web/src/lib/hooks/use<Entity>.ts`
- API functions: `apps/web/src/lib/api.ts` Ã¢â‚¬â€ `get<Entity>`, `create<Entity>`, `update<Entity>`, `delete<Entity>`

**Admin CRUD Pattern:** Every admin controller follows the same decorator pattern:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles('admin', 'editor', 'viewer') // on GET
@Roles('admin', 'editor')            // on POST/PATCH
@Roles('admin')                       // on DELETE
@Audit({ action, resource })         // on mutations
```

**Response Envelope:** Every endpoint returns `{ data, meta? }`. Consistency means the frontend's `request<T>()` function unwraps identically for every call at `apps/web/src/lib/api.ts:84`.

## Cross-References

- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system
