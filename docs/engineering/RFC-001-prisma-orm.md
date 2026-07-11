# RFC-001: Prisma ORM for Database Access

**Status:** Accepted (implemented)
**Date:** 2025-01-15
**Authors:** Portfolio Team

---

## Table of Contents

1. Context
2. Decision
3. Alternatives Considered
4. Consequences
5. Implementation Notes
6. References

---

## 1. Context

The Portfolio project required a database access layer for a PostgreSQL-backed NestJS API. Key requirements:

- **Type-safe queries** — runtime and compile-time safety between schema and application code.
- **Schema management** — declarative, version-controlled schema definitions with automated migrations.
- **Developer experience** — autocomplete, IntelliSense, and a visual data browser.
- **Connection pooling** — efficient management of database connections in a server environment.
- **Monorepo integration** — a custom output path compatible with Turborepo workspaces.

The schema spans 25+ models including `User`, `Session`, `BlogPost`, `Project`, `Skill`, `Section`, `Testimonial`, `Lead`, `AnalyticsEvent`, and more — all defined in `apps/api/prisma/schema.prisma` (626 lines).

---

## 2. Decision

**Adopt Prisma ORM** with PostgreSQL via `@prisma/adapter-pg`.

| Component | Choice |
|-----------|--------|
| ORM | Prisma (`prisma-client`) |
| Database | PostgreSQL (via `datasource db`) |
| Adapter | `@prisma/adapter-pg` over `pg.Pool` |
| Client output | `apps/api/generated/prisma` (custom path) |
| Schema location | `apps/api/prisma/schema.prisma` |

The `PrismaService` wrapper (`apps/api/src/common/database/prisma.service.ts`) instantiates a `PrismaClient` with the pg adapter, exposes per-model getters (e.g., `this.prisma.blogPost`), and provides raw query escape hatches via `$queryRaw` and `$executeRaw`.

---

## 3. Alternatives Considered

| Alternative | Why Not Chosen |
|-------------|----------------|
| **TypeORM** | Heavier decorator-based API; slower migration generation; less ergonomic for complex queries; historical issues with NestJS integration stability. |
| **Sequelize** | Imperative model definitions (no schema file); weaker TypeScript inference; verbose association setup for 25+ models. |
| **Drizzle ORM** | Excellent type-safety but newer ecosystem; fewer NestJS examples; no built-in migration tooling comparable to Prisma Migrate at time of evaluation. |
| **Knex.js** | Query builder only — no schema introspection, no type-safe models, no migration lifecycle management; requires manual type generation. |
| **Raw SQL (pg)** | Maximum control but zero type safety; no migrations; no schema introspection; unacceptable productivity loss across 25+ models. |

---

## 4. Consequences

### Pros

- **Type-safe queries.** Every `findMany`, `create`, `update` call is fully typed from the schema. The generated client in `apps/api/generated/prisma` reflects the exact schema shape.
- **Auto-generated client.** Single command (`prisma:generate`) produces full TypeScript types and a query API. No manual model files to maintain.
- **Declarative migrations.** `prisma:migrate:dev` produces timestamped SQL migration files. `prisma:migrate:deploy` applies them in CI/CD.
- **Prisma Studio.** Visual data browser for ad-hoc inspection and debugging.
- **Custom output path.** Generated client lives at `apps/api/generated/prisma` (not `node_modules`), avoiding Turborepo cache issues and keeping generated code under version control.
- **Per-model getters.** `PrismaService` exposes convenience getters (`blogPost`, `project`, `user`, etc.) that reduce boilerplate in service files.

### Cons

- **Generated client size.** The `generated/prisma` directory adds ~3 MB to the repository. Diff noise on schema changes.
- **Raw SQL escape hatch for pgvector.** Vector similarity searches require `$queryRaw` or `$executeRaw` — Prisma's type-safe API does not extend to custom PostgreSQL extensions like `pgvector`.
- **Additional build step.** `prisma:generate` must run after every schema edit, integrated into the CI pipeline. The `ci.yml` includes a dedicated `prisma-validate` job that runs `prisma:validate` and `prisma:generate`.
- **Migration lock-in.** Switching ORMs requires abandoning the Prisma migration history in `prisma/migrations/`.

---

## 5. Implementation Notes

### File structure

```
apps/api/
├── prisma/
│   ├── schema.prisma          # Declarative schema (25+ models)
│   └── migrations/            # Migration history (auto-generated)
├── generated/
│   └── prisma/                # Generated client (custom output path)
└── src/
    └── common/
        └── database/
            ├── prisma.service.ts      # PrismaClient wrapper (69 lines)
            └── pagination.helper.ts   # Shared pagination utility
```

### PrismaService schema

The service wraps `PrismaClient` with the `@prisma/adapter-pg` driver adapter:

```typescript
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
this.client = new PrismaClient({ adapter });
```

### Migration workflow

| Step | Command | When |
|------|---------|------|
| Edit schema | Edit `prisma/schema.prisma` | During development |
| Generate client | `npm run prisma:generate` | After every schema edit |
| Create migration | `npm run prisma:migrate:dev` | Before committing schema changes |
| Validate | `npm run prisma:validate` | CI (`prisma-validate` job) |
| Deploy | `npm run prisma:migrate:deploy` | Production deployment |

### Per-model access pattern

Services inject `PrismaService` and access models via getters:

```typescript
@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.blogPost.findMany({ ... });
  }
}
```

### Raw query escape hatch

```typescript
const results = await this.prisma.$queryRaw`SELECT * FROM ...`;
```

### CI integration

The `.github/workflows/ci.yml` validates Prisma schema on every push to `main`/`develop` and every version tag:

```yaml
prisma-validate:
  steps:
    - run: npm run prisma:validate --workspace=apps/api
    - run: npm run prisma:generate --workspace=apps/api
```

---

## 6. References

- [Database Architecture](../database/DatabaseArchitecture.md) — overall database design and connection strategy
- [Database Schema](../database/DatabaseSchema.md) — detailed model relationships and indexes
- `apps/api/prisma/schema.prisma` — the schema file (source of truth, 626 lines)
- `apps/api/src/common/database/prisma.service.ts` — PrismaService implementation
- `.github/workflows/ci.yml` — CI pipeline with prisma-validate job
- `turbo.json` — Turborepo task dependency graph (build depends on ^build)
