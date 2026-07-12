# Routing Architecture

Defines the routing strategy for both the Next.js frontend (App Router) and the NestJS backend (controllers with global prefix). Covers route groups, layouts, loading states, error boundaries, API routing, admin vs portfolio separation, dynamic routes, middleware, and route protection.

---

## 1. Frontend Routing (Next.js 14 App Router)

### 1.1 Route Structure

The frontend uses Next.js 14 App Router with file-system based routing. All public pages sit at the root of `apps/web/src/app/`.

```
apps/web/src/app/
  page.tsx                      / (Homepage - ISR 60s)
  layout.tsx                    Root layout (ThemeProvider, fonts, metadata)
  loading.tsx                   Root loading state
  error.tsx                     Root error boundary
  not-found.tsx                 404 page
  about/
    page.tsx                    /about
  projects/
    page.tsx                    /projects (ISR 60s)
    [slug]/
      page.tsx                  /projects/[slug] (ISR 60s, generateStaticParams)
  blog/
    page.tsx                    /blog (ISR 300s)
    [slug]/
      page.tsx                  /blog/[slug] (ISR 300s, generateStaticParams)
  achievements/
    page.tsx                    /achievements
  case-studies/
    page.tsx                    /case-studies
    [slug]/
      page.tsx                  /case-studies/[slug]
  guest-appearances/
    page.tsx                    /guest-appearances
  press/
    page.tsx                    /press (press features)
  reading-list/
    page.tsx                    /reading-list
  contact/
    page.tsx                    /contact (dynamic, client-rendered)
  ai-assistant/
    page.tsx                    /ai-assistant (dynamic, SSE chat)
  admin/
    login/
      page.tsx                  /admin/login (no auth)
    page.tsx                    /admin (dashboard, auth required)
    sections/
      page.tsx                  /admin/sections
    projects/
      page.tsx                  /admin/projects
    blog/
      page.tsx                  /admin/blog
    skills/
      page.tsx                  /admin/skills
    experiences/
      page.tsx                  /admin/experiences
    services/
      page.tsx                  /admin/services
    testimonials/
      page.tsx                  /admin/testimonials
    faqs/
      page.tsx                  /admin/faqs
    case-studies/
      page.tsx                  /admin/case-studies
    achievements/
      page.tsx                  /admin/achievements
    press-features/
      page.tsx                  /admin/press-features
    guest-appearances/
      page.tsx                  /admin/guest-appearances
    reading-list/
      page.tsx                  /admin/reading-list
    leads/
      page.tsx                  /admin/leads
    chat/
      page.tsx                  /admin/chat
    notifications/
      page.tsx                  /admin/notifications
    media/
      page.tsx                  /admin/media
    settings/
      page.tsx                  /admin/settings
    api-keys/
      page.tsx                  /admin/api-keys
    activities/
      page.tsx                  /admin/activities
    feature-flags/
      page.tsx                  /admin/feature-flags
    availability/
      page.tsx                  /admin/availability
    users/
      page.tsx                  /admin/users
    sandbox/
      page.tsx                  /admin/sandbox
```

### 1.2 Rendering Strategy by Route

| Route Type | Strategy | Rationale |
|-----------|----------|-----------|
| Public listing pages (projects, blog) | ISR | Content changes infrequently; CDN serve. TTL: 60s projects, 300s blog |
| Public detail pages ([slug]) | ISR + generateStaticParams | Pre-render all known slugs at build, revalidate per-TTL |
| Homepage | ISR 60s | Section data revalidates every 60 seconds |
| Contact form | Dynamic (CSR) | Client-side validation + form interaction |
| AI Assistant | Dynamic (CSR) | Real-time SSE streaming responses |
| Admin pages | SSR + Client data fetch | Session check on every request; dashboard data via React Query |
| 404 / error pages | Static | Pre-built fallback pages |

### 1.3 Layout Hierarchy

```
RootLayout (apps/web/src/app/layout.tsx)
  - ThemeProvider (dark/light/system)
  - HTML <html> with font optimization
  - Global CSS (Tailwind)
  - Metadata (title, description, OG tags)
  |
  +-- Public pages (all routes except /admin/*)
  |     - Navigation (sticky header)
  |     - Footer
  |     - Page content
  |
  +-- Admin pages (/admin/*)
        - Auth check (redirect to /admin/login if unauthenticated)
        - Admin sidebar navigation
        - Page content
```

### 1.4 Loading States

Each route segment can have its own `loading.tsx`:

- Root: `loading.tsx` Ã¢â‚¬â€ Full page skeleton
- Projects, Blog: Skeleton grid (project cards / blog post cards) during ISR revalidation
- Admin tables: `DataTableSkeleton` component during React Query refetch

### 1.5 Error Boundaries

- Root: `error.tsx` Ã¢â‚¬â€ Catches unhandled rendering errors. Shows retry button and error message
- Admin: Per-page error boundaries wrapping data tables. On fetch failure, shows retry button that calls `refetch()` on the React Query hook
- Not found: `not-found.tsx` Ã¢â‚¬â€ Custom 404 with navigation links

---

## 2. API Routing (NestJS)

### 2.1 Global Prefix and Versioning

All API routes are prefixed with `/api` (set at `apps/api/src/main.ts:67`).

**API Versioning:** Content negotiation via Accept header. Pattern: `application/vnd.portfolio.v<version>+json`. Parsed at `apps/api/src/main.ts:58-64` into `req.apiVersion`. Default is version 1.

**Swagger Docs:** Available at `/api/docs` in non-production environments (`apps/api/src/main.ts:71-81`).

### 2.2 Two Controller Layers

**Portfolio Layer** (public, read-only):
```
@Controller('portfolio/<entity>')
/api/portfolio/sections         GET
/api/portfolio/projects         GET
/api/portfolio/projects/:slug   GET
/api/portfolio/blog             GET
/api/portfolio/blog/:slug       GET
/api/portfolio/skills           GET
/api/portfolio/experiences      GET
/api/portfolio/testimonials     GET
/api/portfolio/services         GET
/api/portfolio/faqs             GET
/api/portfolio/leads            POST (write-only for contact form)
/api/portfolio/analytics/events POST (anonymous tracking)
```

**Admin Layer** (authenticated CRUD):
```
@Controller('admin/<entity>')
/api/admin/auth/login           POST
/api/admin/auth/refresh         POST
/api/admin/auth/logout          POST
/api/admin/dashboard            GET
/api/admin/<entity>             GET (list with pagination)
/api/admin/<entity>/:id         GET (single)
/api/admin/<entity>             POST (create)
/api/admin/<entity>/:id         PATCH (update)
/api/admin/<entity>/:id         DELETE (soft-delete)
/api/admin/<entity>/:id/restore POST
/api/admin/<entity>/:id/hard    DELETE (permanent)
/api/admin/<entity>/bulk-delete POST
/api/admin/<entity>/bulk-update POST
/api/admin/export/*             GET (CSV export)
/api/admin/cleanup/*            POST (cache/DB cleanup)
```

### 2.3 Admin Route Decorator Pattern

Every admin controller follows a consistent decorator pattern (example from `apps/api/src/admin/controllers/projects.controller.ts`):

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get() @Roles('admin', 'editor', 'viewer')
  findAll(@Query() query: PaginationQueryDto) { ... }

  @Get(':id') @Roles('admin', 'editor', 'viewer')
  findOne(@Param('id') id: string) { ... }

  @Post() @Roles('admin', 'editor') @Audit({ action: 'create', resource: 'project' })
  create(@Body() dto: CreateProjectDto) { ... }

  @Patch(':id') @Roles('admin', 'editor') @Audit({ action: 'update', resource: 'project' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) { ... }

  @Delete(':id') @Roles('admin') @Audit({ action: 'delete', resource: 'project' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) { ... }
}
```

### 2.4 Role-Based Access

| Role | Admin GET | Admin POST/PATCH | Admin DELETE | Portfolio |
|------|-----------|-------------------|--------------|-----------|
| admin | All | All | All | N/A |
| editor | All | All | None | N/A |
| viewer | All | None | None | N/A |
| public | N/A | N/A | N/A | All |

Roles enforced via `@Roles('admin', 'editor', 'viewer')` decorator on each route. Implemented in `RolesGuard` at `apps/api/src/modules/auth/`.

### 2.5 Middleware Execution Order

```
Request
  -> CORS (helmet + compression at main.ts:27-35)
  -> API Version middleware (main.ts:58-64)
  -> Rate Limiting (ThrottlerGuard, global at app module)
  -> Auth Guard (JwtAuthGuard, on admin controllers only)
  -> Roles Guard (RolesGuard, on admin controllers only)
  -> Global ValidationPipe (main.ts:49-56, whitelist + forbidNonWhitelisted + transform)
  -> Cache Interceptor (on portfolio controllers with @CacheTTL)
  -> Route Handler
  -> Audit Interceptor (on admin mutations, logs to Activity table)
  -> Response
  <- GlobalExceptionFilter (if error, standardized { error } envelope)
```

---

## 3. Dynamic Route Patterns

### 3.1 [slug] Pattern

Detail pages use `[slug]` dynamic segments:
- `/projects/[slug]` Ã¢â‚¬â€ Project slug from database
- `/blog/[slug]` Ã¢â‚¬â€ Blog post slug
- `/case-studies/[slug]` Ã¢â‚¬â€ Case study slug

All use `generateStaticParams()` to pre-render known slugs at build time. ISR revalidates on first request after TTL expires.

### 3.2 Query Parameters for Filtering

List pages accept query parameters passed through to the API:
```
/projects?category=web-app&tech=react&featured=true&page=1&per_page=12
/blog?category=backend&search=nestjs&sort=published_at&order=desc
/admin/leads?search=jane&status=new&page=1&per_page=25
```

Parameters are forwarded to the NestJS API via the typed client in `apps/web/src/lib/api.ts`. Each hook defines its own parameter interface (e.g., `useProjects` at `apps/web/src/lib/hooks/useProjects.ts:13-26`).

---

## 4. Internal API Routes (Next.js)

Next.js API routes exist at `apps/web/src/app/api/`:

| Route | Purpose | Method |
|-------|---------|--------|
| `/api/revalidate` | On-demand ISR cache purge | POST (secret key auth) |

These route handlers call the NestJS API and revalidate ISR caches after content mutations.

---

## 5. Route Protection

### 5.1 Server-Side (Next.js Middleware)

A future `middleware.ts` at `apps/web/src/middleware.ts` will:
- Check JWT token presence for `/admin/*` routes (except `/admin/login`)
- Redirect unauthenticated users to `/admin/login`
- Set security headers (CSP, COOP, COEP for Sandbox isolation)

### 5.2 Client-Side (React Context)

On the client, `AuthContext` wraps admin pages. The `useAuth` hook (`apps/web/src/lib/hooks/useAuth.ts`) checks for `admin_access_token` in localStorage on mount. If missing, redirects to `/admin/login`.

### 5.3 API-Level (NestJS Guards)

The NestJS API enforces its own auth via `JwtAuthGuard` and `RolesGuard`. Even if a client-side check is bypassed, the API will reject unauthorized requests with 401 or 403.

## Cross-References
- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system