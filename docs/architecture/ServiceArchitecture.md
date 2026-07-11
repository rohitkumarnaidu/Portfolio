# Service Architecture

Backend service architecture for the Ultimate Portfolio: the three-layer module pattern, cross-cutting concerns, dependency graph, transaction management, idempotency, and pagination.

---

## 1. The Three-Layer Module Pattern

Every entity in the system is serviced by exactly one NestJS module that is then consumed by two independent controller layers. This enforces strict separation of concerns between business logic, public delivery, and authenticated admin delivery.

```
                         Module <Entity> Service
                         (business logic)
                              |
              +---------------+---------------+
              |                               |
    PortfolioController              AdminController
    (public, read-only)             (authenticated CRUD)
    @Controller('portfolio/<e>')   @Controller('admin/<e>')
    @CacheTTL(...)                 @UseGuards(JwtAuthGuard, RolesGuard)
    No auth                        @Audit({ action, resource })
```

### 1.1 Business Logic Layer (apps/api/src/modules/<entity>/)

**Responsibility:** All business rules, data access, and validation logic for a single entity.

**Contents:**
- `<Entity>Service` — CRUD methods, business validations, event emission
- `dto/` — Create and Update DTOs with class-validator decorators
- `<Entity>Module` — NestJS module that imports PrismaService and exports the service

**Rules:**
- No HTTP concerns (no controllers, no guards, no cache decorators)
- Services are `@Injectable()` classes injected into controllers
- Every service is exported by its module so both PortfolioModule and AdminModule can import it

**Example from the codebase:**
- `apps/api/src/modules/projects/projects.service.ts` — handles create, update, delete, soft-delete, restore, bulk operations
- `apps/api/src/modules/projects/dto/create-project.dto.ts` — validation schema for project creation
- `apps/api/src/modules/projects/projects.module.ts` — imports PrismaService, exports ProjectsService

### 1.2 Portfolio Delivery Layer (apps/api/src/portfolio/controllers/)

**Responsibility:** Expose read-only endpoints for the public-facing website. Optimized for high throughput.

**Characteristics:**
- Route prefix: `@Controller('portfolio/<entity>')`
- Caching: `@CacheTTL()` with entity-appropriate TTLs (30s for blog list, 60s for projects, 120s for skills)
- No authentication guards
- Wrapped in `{ data, meta }` response envelope
- GET-only (except leads POST for contact form and analytics POST for event tracking)

**Currently registered:** 18 portfolio controllers in `apps/api/src/portfolio/portfolio.module.ts`

**Example TTLs from the codebase:**
| Controller | List TTL | Detail TTL |
|-----------|----------|------------|
| Sections | 60s | 60s |
| Projects | 60s | 120s |
| Blog | 30s | 60s |
| Skills | 120s | N/A |
| Experiences | 120s | N/A |
| Testimonials | 120s | N/A |
| FAQ | 120s | N/A |
| Case Studies | 120s | 120s |

### 1.3 Admin Delivery Layer (apps/api/src/admin/controllers/)

**Responsibility:** Expose full CRUD endpoints for the admin dashboard. Authenticated, audited, and role-gated.

**Characteristics:**
- Route prefix: `@Controller('admin/<entity>')`
- Auth: `@UseGuards(JwtAuthGuard, RolesGuard)` on every controller
- Docs: `@ApiBearerAuth()` for Swagger
- Role enforcement: `@Roles('admin', 'editor', 'viewer')` per route
- Audit: `@Audit({ action, resource })` on all mutation endpoints (create, update, delete, restore, bulk)
- Response code: `@HttpCode(HttpStatus.NO_CONTENT)` on deletes

**Currently registered:** 28 admin controllers in `apps/api/src/admin/admin.module.ts`

**Audit decorator example:**
```typescript
@Audit({ action: 'create', resource: 'project' })
```
This logs to the Activity table with the authenticated user's ID, the action taken, and the target resource. Implementation in `apps/api/src/common/decorators/audit.decorator.ts` with the `AuditInterceptor` at `apps/api/src/common/interceptors/audit.interceptor.ts`.

**Admin-specific controllers (not mirrored in portfolio):**
- AdminAuthController — login, refresh, logout
- AdminDashboardController — aggregated analytics dashboard
- AdminUsersController — user management (admin only)
- AdminMediaController — file upload management
- AdminSystemSettingsController — site configuration
- AdminApiKeysController — API key management
- AdminNotificationsController — admin-facing notifications
- AdminSandboxController — WebContainer IDE session management
- AdminExportController — CSV export
- AdminCleanupController — cache/data cleanup

---

## 2. Cross-Cutting Concerns (apps/api/src/common/)

All shared infrastructure lives in `apps/api/src/common/`. It is organized by concern:

| Directory | Contents | Used By |
|-----------|----------|---------|
| `cache/` | Cache module setup, Redis config | Portfolio controllers |
| `cleanup/` | Data cleanup service | Admin CleanupController |
| `database/` | PrismaService (PrismaClient wrapper) | All modules |
| `decorators/` | @Audit, @Roles, @CurrentUser, @Public decorators | Admin controllers |
| `export/` | CSV export service (CsvService) | Admin ExportController |
| `filters/` | GlobalExceptionFilter | Global (main.ts) |
| `interceptors/` | AuditInterceptor, LoggingInterceptor, CacheInterceptor | Admin/Portfolio |
| `middleware/` | API versioning, request logging | Global |
| `notifications/` | Notification creation service | Admin NotificationsModule |
| `pipes/` | Custom validation pipes | Various controllers |
| `queue/` | BullMQ queue definitions, workers | Background jobs |
| `utils/` | Shared utility functions | Various |

### 2.1 Database Access (PrismaService)

`apps/api/src/common/database/prisma.service.ts` wraps PrismaClient with:
- Lazy connection via `@prisma/adapter-pg` over `pg.Pool`
- OnModuleInit / OnModuleDestroy lifecycle hooks for connection management
- Typed access to all models via `prisma.client.<model>`
- Same instance shared across all modules (global singleton via `@Global()` decorator on DatabaseModule)

### 2.2 Caching Strategy

- Portfolio controllers use NestJS CacheModule with `@CacheTTL()` decorators
- Cache key is derived from the request URL
- Cache backend: In-memory by default, Redis when REDIS_URL is configured
- No caching on admin controllers (always fresh data)

### 2.3 Error Handling

`apps/api/src/common/filters/global-exception.filter.ts`:
- Catches all exceptions (not just HttpException)
- Extracts structured error info: status_code, code, message, details
- Generates UUID correlation_id for every error
- Sends 5xx errors to Sentry when SENTRY_DSN is configured
- Returns consistent `{ error: { code, message, status_code, details, correlation_id, timestamp, path } }` envelope

---

## 3. Service Dependency Graph

```
PrismaService (common/database)
       |
       v
   Modules (projects, blog, skills, experiences, ...)
       |
       v
Portfolio Controllers     Admin Controllers
       |                        |
       v                        v
   Response                  Auth Guards (JwtAuthGuard, RolesGuard)
   (JSON)                   Audit Interceptor
                            Cache bust (on mutation)

Background Queue (BullMQ)
       |
       v
  Workers: email worker, AI embedding worker, cleanup worker
```

---

## 4. Transaction Management

Transactions are handled at the service level using Prisma's interactive transactions:

```typescript
// Pattern used in mutations that affect multiple tables
async create(dto: CreateProjectDto) {
  return this.prisma.client.$transaction(async (tx) => {
    const project = await tx.project.create({ data: dto });
    if (dto.skills?.length) {
      await tx.projectSkill.createMany({
        data: dto.skills.map(skillId => ({
          project_id: project.id,
          skill_id: skillId,
        })),
      });
    }
    return project;
  });
}
```

Transactions are used when:
- Creating a project with related skills/tags
- Creating a lead and triggering notification creation
- Updating blog publish status and clearing related caches
- Bulk operations (bulk-delete, bulk-update)

---

## 5. Idempotency Patterns

| Operation | Idempotency Strategy |
|-----------|---------------------|
| GET by ID | Naturally idempotent (same result for same ID) |
| GET with filters | Same query params = same results |
| POST create | Not idempotent (each POST creates a new record). Client-side deduplication via React Query mutation keys |
| PATCH update | Idempotent (same PATCH body applied twice = same final state) |
| DELETE (soft) | Idempotent (deleting already-deleted record throws 404 or no-op) |
| Bulk operations | Idempotent by design (applying same bulk-update twice = same state) |

---

## 6. Pagination Strategy

### 6.1 API Pagination

All list endpoints accept the same pagination parameters via `PaginationQueryDto`:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number (1-indexed) |
| per_page | number | 10 | Items per page (max 100) |
| sort | string | 'created_at' | Sort field |
| order | 'asc' | 'desc' | 'desc' | Sort direction |

Response includes `meta`:
```json
{
  "data": [...],
  "meta": {
    "total": 42,
    "page": 1,
    "per_page": 10,
    "total_pages": 5
  }
}
```

### 6.2 Frontend Pagination

React Query hooks accept pagination params and pass them to the API. Example from `apps/web/src/lib/hooks/useProjects.ts:13-26`:
```typescript
useProjects({ page: 1, per_page: 12, category: 'web-app' })
```

TanStack Query caches each page separately under the query key `['projects', { page, per_page, category, ... }]`. Navigation between pages triggers a new query with a different cache key — no page data is lost on navigation.

### 6.3 Admin Table Pagination

Admin data tables use:
- Server-side pagination (Prisma skip/take)
- Client-side UI controls (page buttons, per-page selector)
- URL query parameter sync (`?page=1&per_page=25`) for shareable/admin bookmarkable states
- React Query refetch on parameter change

---

## 7. Bulk Operations

Admin controllers support bulk operations for efficiency:

| Operation | Endpoint | Description |
|-----------|----------|-------------|
| Bulk delete | POST /admin/<entity>/bulk-delete | Soft-delete multiple records by IDs |
| Bulk update | POST /admin/<entity>/bulk-update | Update multiple records (e.g., publish/unpublish) |

Both are wrapped in individual transactions so a failure in one record doesn't roll back the entire operation (partial success is reported).
