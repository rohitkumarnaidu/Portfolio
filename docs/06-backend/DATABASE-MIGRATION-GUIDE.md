# Database Migration Guide

> **Document:** `docs/backend/database-migration-guide.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** Ã¢Å“â€¦ Active | **Owner:** Database Architect | **Related:** [DatabaseArchitecture.md](../database/DatabaseArchitecture.md), [DatabaseSchema.md](../database/DatabaseSchema.md)

---

## Overview

This guide covers how to create, manage, and apply database migrations using Prisma ORM across the Portfolio platform. The database is Supabase PostgreSQL 15 with pgvector, and Prisma is configured with a **custom output path** (`generated/prisma`) Ã¢â‚¬â€ not the default `node_modules/@prisma/client`.

## Prerequisites

- Running PostgreSQL instance (local Docker or Supabase)
- `DATABASE_URL` configured in `config/.env`
- Prisma CLI (available via `npx` Ã¢â‚¬â€ no global install needed)
- After any schema edit: `npm run prisma:generate` is **required**

## Migration Flow

### Creating a Migration

After editing `apps/api/prisma/schema.prisma`:

```bash
cd apps/api
npm run prisma:migrate:dev -- --name describe_your_change
```

This:
1. Compares the schema against the current database
2. Generates a migration SQL file in `prisma/migrations/`
3. Applies the migration to the local database
4. Prompts to regenerate the Prisma client

**Always review the generated SQL** before committing.

### Applying Migrations

| Environment | Command | Notes |
|-------------|---------|-------|
| Development | `npm run prisma:migrate:dev` | Creates + applies |
| Production | `npm run prisma:migrate:deploy` | Applies only (safe) |
| CI | `npm run prisma:migrate:deploy` | Applies only (safe) |

### Regenerating the Client

The Prisma client outputs to a **custom path** configured in `schema.prisma`:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}
```

```bash
npm run prisma:generate
```

This is required after every schema change and is typically run automatically during migrations. If you see import errors from `../../generated/prisma`, the client needs regeneration.

## Schema Changes Workflow

| Operation | Migration Step | Generate | Data Migration Needed? |
|-----------|---------------|----------|----------------------|
| Add model | `prisma:migrate:dev` | Ã¢Å“â€¦ Auto | No |
| Add optional field | `prisma:migrate:dev` | Ã¢Å“â€¦ Auto | No |
| Add required field | `prisma:migrate:dev` (with default) | Ã¢Å“â€¦ Auto | Set defaults for existing rows |
| Rename field | Manual (see below) | Ã¢Å“â€¦ After | Yes |
| Remove field | `prisma:migrate:dev` | Ã¢Å“â€¦ Auto | Export data first |
| Remove model | `prisma:migrate:dev` | Ã¢Å“â€¦ Auto | Archive first |
| Add enum value | `prisma:migrate:dev` | Ã¢Å“â€¦ Auto | No |
| Add index | Edit schema + migrate | Ã¢Å“â€¦ Auto | No |

## Common Migration Scenarios

### Adding a New Model

To add a model like `Tag`, following the three-layer module pattern:

1. **Define the model** in `schema.prisma`:
   ```prisma
   model Tag {
     id        String   @id @default(uuid())
     name      String   @unique
     createdAt DateTime @default(now()) @map("created_at")
     updatedAt DateTime @updatedAt @map("updated_at")

     @@map("tags")
   }
   ```
2. **Create migration**: `npm run prisma:migrate:dev -- --name add_tags`
3. **Regenerate client**: `npm run prisma:generate`
4. **Create service module** in `apps/api/src/modules/tags/`
5. **Add portfolio controller** in `apps/api/src/portfolio/controllers/`
6. **Add admin controller** in `apps/api/src/admin/controllers/`
7. **Register** in both `portfolio.module.ts` and `admin.module.ts`

### Adding a New Field

Use optional fields or defaults for existing rows:

```prisma
model Project {
  // Before migration
  id       String @id @default(uuid())

  // After Ã¢â‚¬â€ safe for existing rows
  id       String  @id @default(uuid())
  repoUrl  String? @map("repo_url")    // nullable Ã¢â€ â€™ existing rows get null
  priority Int     @default(0)         // existing rows get 0
}
```

### Renaming a Field

Prisma does not natively detect renames Ã¢â‚¬â€ it creates a drop + add, which destroys data. Follow this three-step process:

1. **Add the new field** alongside the old one:
   ```prisma
   model Section {
     sectionLabel String @map("section_label")
     // New field, same data
     label String @map("label")
   }
   ```
2. **Create a data migration script** to copy values:
   ```bash
   npm run prisma:seed
   ```
   Or a one-off script in `apps/api/scripts/`:
   ```typescript
   // apps/api/scripts/migrate-section-label.ts
   import { PrismaClient } from '../generated/prisma';
   const prisma = new PrismaClient();
   async function main() {
     const sections = await prisma.section.findMany();
     for (const s of sections) {
       await prisma.section.update({
         where: { id: s.id },
         data: { label: s.sectionLabel },
       });
     }
   }
   ```
3. **Remove the old field** in a follow-up migration.

### Removing a Model or Field

Cannot be undone. Before removing:

- Ã¢Å“â€¦ Confirm no dependent code (search `grep -r "ModelName" apps/`)
- Ã¢Å“â€¦ Export data if needed (> `npm run prisma:seed` or SQL dump)
- Ã¢Å“â€¦ Ensure no active queries reference the model
- Ã¢Å“â€¦ Archive data to a backup table if retention is required
- Ã¢ÂÅ’ Never remove a field still referenced in production code

## Migration Safety Checklist

Before deploying a migration to production:

- [ ] Tested on local or staging database first
- [ ] No destructive changes without data preservation
- [ ] Client regenerated (`npm run prisma:generate`)
- [ ] TypeScript compilation passes (`npm run typecheck`)
- [ ] Tests pass (`npm test`)
- [ ] Schema validates (`npm run prisma:validate`)
- [ ] Rollback plan documented (see below)

## Custom Migration Scripts

For data transformations that don't fit Prisma's declarative model:

- **Seed scripts** in `apps/api/prisma/seed.ts` Ã¢â‚¬â€ commit to repo, run with `npm run prisma:seed`
- **One-off scripts** in `apps/api/scripts/` Ã¢â‚¬â€ document in the migration commit message
- **Raw SQL** via `prisma.$queryRawUnsafe()` Ã¢â‚¬â€ use when Prisma cannot express the operation (e.g., pgvector index creation)

## Schema Validation

```bash
npm run prisma:validate
```

Checks the schema for validity without connecting to the database.

## Rollback Strategy

Prisma does not natively support "down" migrations. Alternatives:

| Strategy | When to Use | How |
|----------|-------------|-----|
| **Reverse migration** | Non-destructive changes | Create a new migration that reverses the change |
| **Point-in-time restore** | Destructive change with data loss | Restore from Supabase backup |
| **Migration revert** | Migration not yet deployed | Delete the migration file and recreate |

### Emergency Rollback

```bash
# 1. Restore database from backup
# 2. Reset Prisma migration state
npx prisma migrate reset

# 3. Reapply the last known good migration
npx prisma migrate deploy
```

## Schema Reference

| Resource | Path |
|----------|------|
| **Prisma schema** | `apps/api/prisma/schema.prisma` (34 models) |
| **Generated client** | `apps/api/generated/prisma/` |
| **Migration history** | `apps/api/prisma/migrations/` |
| **ERD** | `docs/database/DatabaseSchema.md` |
| **Architecture** | `docs/database/DatabaseArchitecture.md` |

## Cross-References
- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system