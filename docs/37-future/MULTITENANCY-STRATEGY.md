# Multi-Tenancy Strategy — Portfolio-as-a-Platform (PaaP)

> **Document:** `docs/37-future/MULTITENANCY-STRATEGY.md`
> **Status:** Design Spec
> **Version:** 1.0
> **Last Updated:** July 2026
> **Owner:** CTO / Platform Architecture Lead
> **Audience:** Engineering leadership, Infrastructure, Product, Business stakeholders

---

## 1. Executive Summary

This document specifies the architectural strategy for evolving the single-tenant portfolio into a multi-tenant Platform-as-a-Service (PaaS), enabling other developers to create and host their own portfolio sites using the same technology stack. This is the most ambitious and highest-impact initiative in the innovation pipeline (IB-22: "Portfolio-as-a-Platform" in `docs/25-roadmap/INNOVATION-BACKLOG.md:57`).

The current architecture is a single-tenant monorepo: one NestJS API, one PostgreSQL database (via Supabase), one Next.js frontend, and one FastAPI AI service. Multi-tenancy requires rethinking data isolation, authentication, domain routing, billing, and the developer experience for portfolio creators.

This document analyzes three isolation models, recommends a hybrid approach, provides a detailed migration path, and projects infrastructure costs from single-tenant (free tier) to 1,000 tenants.

---

## 2. Purpose

Design and specify a multi-tenancy strategy that:

- Enables independent portfolio sites with isolated data on a shared infrastructure
- Provides tenant-specific custom domains with automatic HTTPS
- Maintains tenant data isolation and security boundaries
- Introduces tiered pricing (free, pro, enterprise) with feature gating
- Preserves the existing single-tenant experience for the original portfolio owner
- Minimizes per-tenant infrastructure cost
- Scales gracefully from 1 to 10,000 tenants

---

## 3. Isolation Model Comparison

### 3.1 Candidate Models

| Dimension                  | Database-per-Tenant                                | Schema-per-Tenant                                       | Row-Level (Discriminator Column)                                 |
| -------------------------- | -------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------- |
| **Description**            | Each tenant gets a separate PostgreSQL database    | Each tenant gets a separate schema within shared DB     | All tenants share tables; `tenant_id` column differentiates rows |
| **Isolation**              | Strongest — full database boundary                 | Strong — schema boundary within same DB                 | Weakest — row-level filtering via RLS                            |
| **Complexity**             | High — connection pooling, migrations across N DBs | Medium — dynamic schema creation, migrations per schema | Low — single schema, `WHERE tenant_id = ?`                       |
| **Backup/Restore**         | Per-database — simple                              | Per-schema — tool-dependent                             | Per-row complex; full-DB restore affects all tenants             |
| **Connection Pooling**     | N pools × pool size connections                    | 1 pool (schema switching via `SET search_path`)         | 1 pool, simple                                                   |
| **Migration Strategy**     | Run migrations N times (one per DB)                | Run migrations per schema                               | Single migration; all tenants migrate together                   |
| **Cross-tenant reporting** | Difficult (union across DBs)                       | Difficult (union across schemas)                        | Easy (`WHERE tenant_id IN (...)`                                 |
| **Hardware utilization**   | Lower (reserved connections per DB)                | Higher (shared connection pool)                         | Highest (single pool utilization)                                |
| **Cost at scale**          | Highest (N DBs × compute)                          | Medium (shared compute, N schemas)                      | Lowest (single DB, single compute)                               |
| **Supabase compatibility** | ✅ Supported (multiple projects)                   | ⚠️ Partial (custom schema config)                       | ✅ Native (RLS policies)                                         |
| **Tenant data export**     | Easy (pg_dump per DB)                              | Medium (pg_dump per schema)                             | Complex (filtered export)                                        |
| **Regulatory compliance**  | Best (physical separation)                         | Good (logical separation)                               | Requires RLS audit                                               |

### 3.2 Scoring

| Criterion              | Weight   | DB-per-Tenant | Schema-per-Tenant | Row-Level |
| ---------------------- | -------- | ------------- | ----------------- | --------- |
| Data isolation         | 20%      | 10            | 8                 | 4         |
| Operational complexity | 15%      | 3             | 5                 | 9         |
| Infrastructure cost    | 15%      | 3             | 6                 | 9         |
| Migration difficulty   | 15%      | 4             | 5                 | 9         |
| Regulatory compliance  | 10%      | 10            | 7                 | 4         |
| Scalability            | 10%      | 6             | 7                 | 8         |
| Developer experience   | 10%      | 4             | 5                 | 9         |
| Supabase alignment     | 5%       | 8             | 5                 | 9         |
| **Total**              | **100%** | **5.80**      | **5.95**          | **7.50**  |

### 3.3 Recommendation: Hybrid Model

**Phase 1 — Row-Level Isolation (immediate):** Use `tenant_id` discriminator column with PostgreSQL Row-Level Security (RLS). This is the fastest path to multi-tenancy with the lowest operational overhead, and Supabase provides native RLS policy management.

**Phase 2 — Schema-per-Tenant (growth):** For enterprise tenants with stricter compliance requirements or larger data volumes, offer schema-level isolation as an upgrade tier.

**Phase 3 — Database-per-Tenant (scale):** For the largest enterprise tenants or those requiring geographic data residency, deploy dedicated Supabase projects with cross-tenant federation.

---

## 4. Data Model Changes

### 4.1 New Models

```prisma
// —── Tenant —──────────────────────────────────────────
model Tenant {
  id            String   @id @default(uuid())
  slug          String   @unique
  name          String
  description   String?
  logoUrl       String?  @map("logo_url")
  faviconUrl    String?  @map("favicon_url")

  // Domain
  subdomain     String   @unique     // e.g., "alice" → alice.portfolio.app
  customDomain  String?  @unique     // e.g., "alice.dev"
  domainVerified Boolean @default(false) @map("domain_verified")
  domainConfig   Json     @default("{}") @map("domain_config")

  // Plan & Billing
  plan          String   @default("free")    // "free" | "pro" | "enterprise"
  billingStatus String   @default("active")  // "active" | "past_due" | "canceled" | "suspended"
  billingProvider String? @map("billing_provider")  // "stripe" | "lemon_squeezy"
  billingId     String?  @map("billing_id")  // customer ID in billing provider
  billingEmail  String?  @map("billing_email")
  trialEndsAt   DateTime? @map("trial_ends_at")
  subscriptionEndsAt DateTime? @map("subscription_ends_at")

  // Configuration
  featureOverrides Json  @default("{}") @map("feature_overrides")
  isolationModel  String  @default("row")  // "row" | "schema" | "database"
  schemaName     String?  @map("schema_name")  // for schema-level isolation
  databaseId     String?  @map("database_id")  // for database-level isolation

  // Limits
  maxProjects    Int      @default(10) @map("max_projects")
  maxBlogPosts   Int      @default(20) @map("max_blog_posts")
  maxStorageMB   Int      @default(500) @map("max_storage_mb")
  maxMonthlyVisitors Int @default(10000) @map("max_monthly_visitors")
  allowedFeatures String[] @map("allowed_features")

  // Metadata
  isActive       Boolean  @default(true) @map("is_active")
  activatedAt    DateTime? @map("activated_at")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  // Relations
  tenantUsers    TenantUser[]
  sections       TenantSection[]
  themeConfigs   TenantThemeConfig[]
  subscriptionLogs SubscriptionLog[]

  @@index([slug])
  @@index([subdomain])
  @@index([customDomain])
  @@index([plan, isActive])
  @@map("tenants")
}

// —── Tenant User —─────────────────────────────────────
model TenantUser {
  id        String   @id @default(uuid())
  tenantId  String   @map("tenant_id")
  userId    String   @map("user_id")
  role      String   @default("owner")  // "owner" | "admin" | "editor" | "viewer"

  invitedAt   DateTime? @map("invited_at")
  joinedAt    DateTime? @map("joined_at")
  invitedBy   String?   @map("invited_by")
  permissions String[]  @default([])

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, userId])
  @@index([tenantId])
  @@index([userId])
  @@map("tenant_users")
}

// —── Tenant Section (tenant-specific section overrides) ─
model TenantSection {
  id            String   @id @default(uuid())
  tenantId      String   @map("tenant_id")
  sectionKey    String   @map("section_key")
  isEnabled     Boolean  @default(true) @map("is_enabled")
  displayOrder  Int      @default(0) @map("display_order")
  styleOverride Json     @default("{}") @map("style_override")
  contentOverride Json   @default("{}") @map("content_override")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, sectionKey])
  @@index([tenantId])
  @@map("tenant_sections")
}

// —── Tenant Theme Configuration —──────────────────────
model TenantThemeConfig {
  id            String   @id @default(uuid())
  tenantId      String   @unique @map("tenant_id")
  preset        String   @default("default")  // which style preset
  primaryColor  String   @default("#3B82F6") @map("primary_color")
  fontFamily    String   @default("Inter") @map("font_family")
  borderRadius  String   @default("medium") @map("border_radius")
  animationLevel String  @default("moderate") @map("animation_level")
  // Full Circadian theme override
  themeConfig   Json     @default("{}") @map("theme_config")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@map("tenant_theme_configs")
}

// —── Subscription & Billing Log —─────────────────────
model SubscriptionLog {
  id        String   @id @default(uuid())
  tenantId  String   @map("tenant_id")
  event     String   // "plan_changed" | "payment_succeeded" | "payment_failed" | "subscription_canceled"
  details   Json     @default("{}")
  createdAt DateTime @default(now()) @map("created_at")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, createdAt(sort: Desc)])
  @@map("subscription_logs")
}
```

### 4.2 Existing Model Modifications

Every content model gets a `tenant_id` column. The original portfolio owner's data uses a special `__default__` tenant ID.

```prisma
// Add tenant_id to all content models:
model Project {
  // ... existing fields ...
  tenantId String @default("__default__") @map("tenant_id")
  @@index([tenantId])
  @@index([tenantId, slug])
}

model BlogPost {
  // ... existing fields ...
  tenantId String @default("__default__") @map("tenant_id")
  @@index([tenantId])
  @@index([tenantId, slug])
}

model Skill {
  // ... existing fields ...
  tenantId String @default("__default__") @map("tenant_id")
  @@index([tenantId])
}

model Experience {
  // ... existing fields ...
  tenantId String @default("__default__") @map("tenant_id")
  @@index([tenantId])
}

model Testimonial {
  // ... existing fields ...
  tenantId String @default("__default__") @map("tenant_id")
  @@index([tenantId])
}

model Service {
  // ... existing fields ...
  tenantId String @default("__default__") @map("tenant_id")
  @@index([tenantId])
}

model FAQ {
  // ... existing fields ...
  tenantId String @default("__default__") @map("tenant_id")
  @@index([tenantId])
}

model Section {
  // ... existing fields ...
  tenantId String @default("__default__") @map("tenant_id")
  @@index([tenantId])
}

model MediaAsset {
  // ... existing fields ...
  tenantId String @default("__default__") @map("tenant_id")
  @@index([tenantId])
}

model AnalyticsEvent {
  // ... existing fields ...
  tenantId String @default("__default__") @map("tenant_id")
  @@index([tenantId])
}

model AnalyticsSession {
  // ... existing fields ...
  tenantId String @default("__default__") @map("tenant_id")
  @@index([tenantId])
}

model ChatConversation {
  // ... existing fields ...
  tenantId String @default("__default__") @map("tenant_id")
  @@index([tenantId])
}
```

### 4.3 Row-Level Security Policies

Using Supabase's native RLS (which the project already uses via `supabase-js`):

```sql
-- Enable RLS on all content tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- Portfolio read access: visitors can read public content for their tenant
CREATE POLICY tenant_portfolio_read ON projects
  FOR SELECT
  USING (
    tenant_id = current_setting('app.current_tenant_id')::TEXT
    AND NOT is_private
  );

-- Admin read/write: tenant admins can manage their tenant's content
CREATE POLICY tenant_admin_all ON projects
  FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant_id')::TEXT
    AND EXISTS (
      SELECT 1 FROM tenant_users
      WHERE tenant_id = current_setting('app.current_tenant_id')::TEXT
        AND user_id = current_setting('app.current_user_id')::TEXT
        AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    tenant_id = current_setting('app.current_tenant_id')::TEXT
  );

-- Default tenant is visible to all (the original portfolio owner's content)
CREATE POLICY default_tenant_read ON projects
  FOR SELECT
  USING (tenant_id = '__default__' AND NOT is_private);
```

---

## 5. Authentication Changes

### 5.1 Current Auth Flow (Single-Tenant)

```
User → Login → JWT issued (user.id, user.role)
     → API: JWT decoded → userId extracted → data filtered by ownership
```

### 5.2 Multi-Tenant Auth Flow

```
User → Login → JWT issued (user.id, user.role, tenantId)
     → API: JWT decoded → tenantId extracted → RLS set → data filtered by tenant
```

### 5.3 JWT Claims Update

```typescript
// Current
interface JwtPayload {
  sub: string; // user.id
  email: string;
  role: string; // 'admin' | 'editor' | 'viewer'
}

// Multi-tenant
interface JwtPayload {
  sub: string; // user.id
  email: string;
  role: string; // global role
  tid: string; // tenant.id  (current active tenant)
  trole: string; // tenant role ('owner' | 'admin' | 'editor' | 'viewer')
  permissions: string[];
}
```

### 5.4 Tenant Context Middleware

A new NestJS middleware extracts the tenant context from JWT or subdomain:

```typescript
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    // Strategy 1: JWT token (admin API calls)
    if (req.headers.authorization) {
      const token = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
      req.tenantId = token.tid;
    }
    // Strategy 2: Subdomain (portfolio access)
    else {
      const host = req.headers.host;
      const subdomain = host.split('.')[0];
      const tenant = await this.prisma.tenant.findUnique({
        where: { subdomain },
      });
      req.tenantId = tenant?.id || '__default__';
    }

    // Set PostgreSQL session variable for RLS
    await this.prisma.$executeRawUnsafe(
      `SELECT set_config('app.current_tenant_id', $1, true)`,
      req.tenantId,
    );

    next();
  }
}
```

---

## 6. Domain Routing Architecture

```
                          Visitor Browser
                          portfolio.app
                          alice.portfolio.app
                          customdomain.com
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  DNS / CDN Layer                                                        │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Vercel Edge Network                                             │  │
│  │                                                                  │  │
│  │  Route Patterns:                                                 │  │
│  │  • portfolio.app/*          → @portfolio/web (default tenant)    │  │
│  │  • *.portfolio.app/*        → @portfolio/web (tenant by subdomain)│  │
│  │  • customdomain.com/*       → @portfolio/web (tenant by domain)  │  │
│  │                                                                  │  │
│  │  Edge Middleware:                                                │  │
│  │  • Extract subdomain from host header                            │  │
│  │  • Look up tenant ID from KV store (cached)                     │  │
│  │  • Set x-tenant-id header to upstream request                    │  │
│  │  • Rewrite custom domains to *.portfolio.app internal routes     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Next.js Frontend (apps/web)                                           │
│                                                                         │
│  On request:                                                            │
│  1. Read x-tenant-id from request header                                │
│  2. Fetch tenant config (theme, sections, content) from API             │
│  3. Render personalized portfolio layout                                │
│  4. Cache via ISR with tenant-aware cache keys                          │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  NestJS API Middleware                                                  │
│  1. Read x-tenant-id header                                             │
│  2. Set Postgres session variable for RLS                               │
│  3. Check tenant's plan limits (rate limiting, feature gating)          │
│  4. Route to appropriate controller                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.1 Custom Domain Provisioning

```
Tenant adds custom domain
       │
       ▼
1. Validate domain ownership via TXT record
   • Generate random verification token
   • Tenant adds TXT record: portfolio-verify=<token>
   • System checks DNS propagation (wait up to 72h)
       │
       ▼
2. Provision SSL certificate (automatic via Vercel)
   • Vercel handles Let's Encrypt automatically
   • Certificate issued < 5 minutes after DNS validation
       │
       ▼
3. Configure routing
   • Add domain to Vercel project configuration
   • Set CNAME record from custom domain → cname.vercel-dns.com
   • Update edge middleware routing table
       │
       ▼
4. Mark domain as verified in Tenant model
   • domainVerified = true
   • Send confirmation email to tenant owner
```

---

## 7. Billing Integration

### 7.1 Plan Structure

| Feature          | Free      | Pro ($12/mo)    | Enterprise ($49/mo) |
| ---------------- | --------- | --------------- | ------------------- |
| Projects         | 3         | 20              | Unlimited           |
| Blog posts       | 5         | 50              | Unlimited           |
| Storage          | 100 MB    | 1 GB            | 10 GB               |
| Monthly visitors | 1,000     | 10,000          | 100,000             |
| Custom domain    | ❌        | ✅ (1)          | ✅ (unlimited)      |
| AI chat          | ❌        | ✅ (500 msg/mo) | ✅ (unlimited)      |
| Analytics        | Basic     | Advanced        | Full + export       |
| 3D scene         | Template  | Customizable    | Full control        |
| Team members     | 1 (owner) | 3               | 10                  |
| Support          | Community | Email (48h)     | Priority (4h)       |
| Isolation        | Row-level | Row-level       | Schema-level        |
| API access       | ❌        | Read-only       | Full                |

### 7.2 Billing Provider Integration

Using Stripe (or Lemon Squeezy for non-US tax compliance):

```typescript
// Stripe webhook handler in NestJS
@Post('webhooks/stripe')
async handleStripeWebhook(@Req() req: Request) {
  const sig = req.headers['stripe-signature'];
  const event = this.stripe.webhooks.constructEvent(
    req.body, sig, process.env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      const tenantId = subscription.metadata.tenantId;
      const plan = subscription.items.data[0].price.lookup_key;
      await this.tenantService.updatePlan(tenantId, plan);
      break;

    case 'customer.subscription.deleted':
      await this.tenantService.suspendTenant(
        subscription.metadata.tenantId
      );
      break;

    case 'invoice.payment_succeeded':
      await this.tenantService.recordPayment(
        subscription.metadata.tenantId,
        event.data.object
      );
      break;

    case 'invoice.payment_failed':
      await this.tenantService.markPastDue(
        subscription.metadata.tenantId
      );
      // Send reminder email
      break;
  }
}
```

### 7.3 Trial Flow

```
1. Visitor signs up → Free trial created (30 days)
2. Tenant setup wizard guides through:
   a. Choose subdomain (alice.portfolio.app)
   b. Select template/theme
   c. Import existing content or start fresh
3. During trial: all Pro features enabled with watermark
4. Day 25: Send "trial ending" email
5. Day 30: Downgrade to Free tier (watermark + feature restriction)
6. Conversion: prompt to subscribe at any point
```

---

## 8. Admin Console Changes

### 8.1 New Tenant Management UI

The admin dashboard gets a new "Tenants" section accessible to super-admins:

```
Admin Console
├── Dashboard (existing)
├── Content (existing)           ← per-tenant content management
├── Media (existing)
├── Analytics (existing)
├── Tenants (NEW)
│   ├── Tenant List
│   │   ├── Search / Filter
│   │   ├── Status breakdown
│   │   └── Quick actions
│   ├── Tenant Detail
│   │   ├── Profile
│   │   ├── Plan & Billing
│   │   ├── Team
│   │   ├── Content overview
│   │   ├── Usage metrics
│   │   └── Domain management
│   ├── Plan Management
│   │   ├── Create/edit plans
│   │   ├── Feature matrix
│   │   └── Pricing configuration
│   └── Impersonation (super-admin only)
└── Settings (existing)
```

### 8.2 Tenant-Specific Admin View

Tenant admins see a filtered admin interface showing only their tenant's data:

- Content section shows only projects, blog posts, etc. belonging to their tenant
- Theme customization applied in real-time
- Usage dashboard shows their plan's metrics and limits
- Team management for inviting/removing users
- Billing section for managing subscription

### 8.3 Super Admin Tools

| Tool                    | Purpose                            | Route                            |
| ----------------------- | ---------------------------------- | -------------------------------- |
| Tenant list             | Browse, search, filter all tenants | `/admin/tenants`                 |
| Tenant detail           | Full view of tenant config         | `/admin/tenants/:id`             |
| Tenant impersonation    | Log in as any tenant for support   | `/admin/tenants/:id/impersonate` |
| Plan management         | CRUD subscription plans            | `/admin/plans`                   |
| Feature flag management | Global flag overrides per tenant   | `/admin/features`                |
| System usage dashboard  | Aggregate metrics across tenants   | `/admin/system`                  |
| Billing overview        | Revenue, churn, MRR                | `/admin/billing`                 |

---

## 9. Schema Migration Path

### Phase 0: Preparation (Before Multi-Tenancy)

```
1. Add tenant_id columns to all content tables (nullable; default '__default__')
2. Backfill existing data: UPDATE projects SET tenant_id = '__default__'
3. Set tenant_id to NOT NULL after backfill
4. Create Tenant, TenantUser tables
5. Insert default tenant record for the original portfolio owner
6. Create indexes on tenant_id columns
7. Create RLS policies for all content tables
8. Add TenantContextMiddleware
```

### Phase 1: Row-Level Isolation (Live)

```
1. Enable RLS on all content tables
2. Deploy TenantContextMiddleware (reads tenant from JWT or subdomain)
3. Update all API routes to pass tenant context
4. Update JWT signing to include tenant_id claim
5. Update admin controllers to filter by tenant_id
6. Add seed wizard for new tenant creation
7. Deploy to staging → test with 2 test tenants
```

### Phase 2: Self-Service Onboarding (Growth)

```
1. Build signup flow: form → create tenant → free trial
2. Build tenant setup wizard (subdomain, theme, initial content)
3. Build domain management UI (add, verify, remove custom domains)
4. Integrate Stripe billing → plan management
5. Build usage tracking and limit enforcement
6. Build watermark/feature-gate mechanism for free tier
7. Build team invitation flow
```

### Phase 3: Enterprise Isolation (Scale)

```
1. Schema-per-tenant for enterprise tier
2. Database-per-tenant for largest tenants
3. Cross-tenant admin analytics
4. Tenant migration tool (row → schema → database)
5. Geographic data residency (EU, US, APAC database regions)
6. Tenant export (full data export for tenant)
```

---

## 10. Infrastructure Cost Analysis

### 10.1 Current Single-Tenant Costs

| Resource                 | Provider      | Monthly Cost |
| ------------------------ | ------------- | ------------ |
| Frontend hosting         | Vercel Pro    | $20          |
| Database (Supabase Pro)  | Supabase      | $25          |
| AI Service (placeholder) | Render/Hetzer | ~$7          |
| Domain                   | Namecheap     | ~$1          |
| Sentry                   | Sentry        | Free tier    |
| **Total**                |               | **~$53/mo**  |

### 10.2 Multi-Tenant Projected Costs

| Tenants | DB Strategy            | DB Cost                   | Vercel Cost | AI Cost | Total  | Revenue (est.)                    | Margin  |
| ------- | ---------------------- | ------------------------- | ----------- | ------- | ------ | --------------------------------- | ------- |
| 10      | Shared (row-level)     | $25 (Supabase Pro)        | $20         | $7      | $52    | $0 (all free)                     | $0      |
| 50      | Shared (row-level)     | $50 (Supabase Team)       | $20         | $20     | $90    | $300 (5 Pro × $12)                | $210    |
| 100     | Shared (row-level)     | $100 (Supabase Large)     | $50         | $50     | $200   | $1,200 (20 Pro × $12)             | $1,000  |
| 500     | Shared + Schema        | $300 (managed PG)         | $200        | $200    | $700   | $7,800 (50 Pro + 5 Enterprise)    | $7,100  |
| 1,000   | Schema + DB-per-tenant | $800 (managed PG cluster) | $500        | $500    | $1,800 | $18,000 (100 Pro + 10 Enterprise) | $16,200 |

### 10.3 Marginal Cost Per Tenant

| Tier       | Marginal Cost/Tenant | Revenue/Tenant | Margin/Tenant |
| ---------- | -------------------- | -------------- | ------------- |
| Free       | ~$0.10               | $0             | -$0.10        |
| Pro        | ~$0.50               | $12            | $11.50        |
| Enterprise | ~$3.00               | $49            | $46.00        |

**Key insight:** The free tier must be tightly resource-constrained to prevent cost bleed. Pro and Enterprise tiers are highly profitable at scale. At 1,000 tenants with a 10% Pro conversion rate and 1% Enterprise conversion rate, projected MRR is ~$18,000.

---

## 11. Performance & Scaling

### 11.1 Database Connection Management

```
Single connection pool → RLS isolation:
  • Pool size: 20 connections (PG Bouncer transaction mode)
  • Connection utilization at 1000 tenants: ~15%
  • Query latency impact: < 2ms per query (tenant_id index + RLS)

Schema isolation:
  • Pool per schema via connection routing
  • search_path switching for schema affinity
  • Connection pooling via PgBouncer session mode

Database isolation:
  • Separate connection pool per database
  • Connection multiplexing via Supabase
  • Auto-scaling based on tenant tier
```

### 11.2 Cache Strategy

| Cache Layer    | Key                                | TTL                             | Invalidation              |
| -------------- | ---------------------------------- | ------------------------------- | ------------------------- |
| Vercel Edge    | tenant:${tenantId}:config          | 5 min                           | On tenant update          |
| Next.js ISR    | tenant:${tenantId}:page:${path}    | 10 min (stale-while-revalidate) | On content publish        |
| API response   | tenant:${tenantId}:api:${route}    | 1 min                           | Cache tag invalidation    |
| Database query | tenant:${tenantId}:db:${queryHash} | 30s                             | On write to tenant's rows |

### 11.3 Rate Limiting Per Tenant

```typescript
// Tenant-aware throttler guard
@Injectable()
export class TenantThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    const tenantId = req.tenantId || '__default__';
    return `${tenantId}:${req.ip}`;
  }
}

// Per-plan rate limits
const PLAN_LIMITS = {
  free: { ttl: 60_000, limit: 30 }, // 30 req/min
  pro: { ttl: 60_000, limit: 120 }, // 120 req/min
  enterprise: { ttl: 60_000, limit: 600 }, // 600 req/min
};
```

---

## 12. Security Considerations

| Concern                          | Mitigation                                                                                         |
| -------------------------------- | -------------------------------------------------------------------------------------------------- |
| Cross-tenant data access         | RLS policies prevent tenants from reading other tenants' data; tested via automated security suite |
| Tenant enumeration               | Subdomain `/api/tenants/slug` returns 404 for non-existent slugs; no user enumeration              |
| Domain verification bypass       | Strict TXT record verification; random 32-char tokens; daily re-verification                       |
| Plan abuse (free → pro features) | Feature gating enforced server-side, not client-side; plan check on every mutation                 |
| Tenant suspension                | Suspended tenants get 403 on all API routes; frontend shows suspended page                         |
| Data deletion on cancel          | 30-day grace period (soft-delete); permanent deletion after 30 days                                |
| Impersonation audit              | Super-admin impersonation is logged with full audit trail; auto-expires after 1 hour               |
| SCIM / SSO                       | Enterprise tier supports SAML/OIDC SSO                                                             |

---

## 13. Phased Rollout Plan

### Phase 0: Foundation (Weeks 1-4)

| Task                                      | Est. Effort | Owner   | Deliverable          |
| ----------------------------------------- | ----------- | ------- | -------------------- |
| Design+implement Tenant table + migration | 2 days      | Backend | Migration            |
| Add tenant_id to all content models       | 3 days      | Backend | Migration + backfill |
| Create TenantUser model and service       | 2 days      | Backend | Tenant management    |
| Implement TenantContextMiddleware         | 2 days      | Backend | Middleware           |
| Create RLS policies for all tables        | 2 days      | Backend | SQL policies         |
| Create default tenant record              | 1 day       | Backend | Seed script          |
| Update JWT payload to include tenant      | 1 day       | Backend | JWT update           |
| Write tenant-aware API tests              | 3 days      | QA      | Test suite           |

**Phase 0 Gate:** Multi-tenant infrastructure deployed. Two test tenants with isolated data. All tests passing.

### Phase 1: Tenant Onboarding (Weeks 5-8)

| Task                                       | Est. Effort | Owner          | Deliverable     |
| ------------------------------------------ | ----------- | -------------- | --------------- |
| Build tenant signup flow                   | 3 days      | Frontend       | Signup wizard   |
| Build tenant setup wizard                  | 4 days      | Frontend       | Setup flow      |
| Build custom domain management             | 3 days      | Both           | Domain UI + API |
| Implement subdomain routing on Vercel Edge | 2 days      | Infrastructure | Edge middleware |
| Build theme customization UI               | 3 days      | Frontend       | Theme editor    |
| Build first project/blog import tool       | 3 days      | Both           | Import flow     |
| Build tenant admin dashboard               | 4 days      | Frontend       | Tenant admin    |
| Add tenant onboarding emails               | 2 days      | Backend        | Email templates |

**Phase 1 Gate:** Self-service tenant onboarding works end-to-end. 5 beta tenants onboarded successfully.

### Phase 2: Billing (Weeks 9-12)

| Task                               | Est. Effort | Owner    | Deliverable        |
| ---------------------------------- | ----------- | -------- | ------------------ |
| Integrate Stripe checkout          | 3 days      | Backend  | Stripe integration |
| Build plan management API          | 2 days      | Backend  | Plan CRUD          |
| Implement usage tracking           | 3 days      | Backend  | Usage counters     |
| Build billing portal UI            | 3 days      | Frontend | Subscription mgmt  |
| Implement plan-based feature gates | 2 days      | Both     | Feature gating     |
| Build trial flow (30-day)          | 2 days      | Both     | Trial management   |
| Create billing webhook handler     | 2 days      | Backend  | Webhook endpoint   |
| Add payment failure handling       | 2 days      | Backend  | Grace period logic |

**Phase 2 Gate:** Billing operational. 3 paying tenants (friends/family). Trial → Pro conversion working.

### Phase 3: Scale (Weeks 13-20)

| Task                                    | Est. Effort | Owner          | Deliverable      |
| --------------------------------------- | ----------- | -------------- | ---------------- |
| Performance test at 100 tenants         | 3 days      | Infrastructure | Test report      |
| Implement caching for tenant configs    | 2 days      | Backend        | Cache layer      |
| Build super-admin console               | 4 days      | Frontend       | Admin tools      |
| Build tenant analytics dashboard        | 3 days      | Frontend       | Analytics        |
| Implement schema-per-tenant isolation   | 5 days      | Backend        | Schema isolation |
| Build tenant data export tool           | 3 days      | Backend        | Export           |
| Implement team management (invite flow) | 3 days      | Both           | Teams            |
| Load test at 500 tenants                | 3 days      | Infrastructure | Load test        |

**Phase 3 Gate:** Platform stable at 100+ tenants. Performance within budget. Schema isolation working for Enterprise tier.

---

## 14. Risk Assessment

| Risk                                       | Probability | Impact   | Mitigation                                                                          |
| ------------------------------------------ | ----------- | -------- | ----------------------------------------------------------------------------------- |
| RLS performance degradation at scale       | Medium      | High     | Index on tenant_id; query analysis at 100 tenants; schema upgrade path              |
| Tenant data accidentally exposed           | Low         | Critical | Automated cross-tenant data access tests in CI; quarterly security audit            |
| Free tier cost bleed (too many free users) | Medium      | Medium   | Tight resource limits; email verification; automated suspension of inactive tenants |
| Vercel edge function cold starts           | Medium      | Medium   | Pre-warm endpoints;KV caching for tenant lookups                                    |
| Custom domain SSL provisioning delays      | Medium      | Low      | Set expectations (72h max); automated status checking                               |
| Migration complexity for existing content  | Low         | Medium   | Default tenant preserves all existing data; zero-downtime backfill                  |
| Stripe webhook failures                    | Low         | Medium   | Retry queue; manual reconciliation dashboard                                        |

---

## 15. Cross-References

### Internal Documents

| Document                  | Path                                          | Relevance                                             |
| ------------------------- | --------------------------------------------- | ----------------------------------------------------- |
| Innovation Backlog        | `docs/25-roadmap/INNOVATION-BACKLOG.md`       | IB-22 (Portfolio-as-a-Platform), IB-17 (Headless CMS) |
| Mobile Native Strategy    | `docs/37-future/MOBILE-NATIVE-STRATEGY.md`    | Phase 3 consumer app is multi-tenant                  |
| AI Personalization Engine | `docs/37-future/AI-PERSONALIZATION-ENGINE.md` | Per-tenant AI personalization                         |
| Database Architecture     | `docs/09-database/DatabaseArchitecture.md`    | Current single-tenant DB design                       |
| Security Architecture     | `docs/11-security/SecurityArchitecture.md`    | RLS and auth model                                    |
| Auth Architecture         | `docs/11-security/15-AUTHORIZATION.md`        | Role-based access patterns                            |
| Data Classification       | `docs/11-security/data-classification.md`     | Tenant data classification                            |
| Scalability Strategy      | `docs/15-performance/SCALABILITY-STRATEGY.md` | Database scaling patterns                             |
| Admin Architecture        | `docs/04-design/AdminArchitecture.md`         | Admin panel extension                                 |
| API Contracts             | `docs/10-api/APIContracts.md`                 | API envelope for tenant-aware endpoints               |
| Feature Flag Guide        | `docs/06-backend/feature-flag-guide.md`       | Plan-based feature gating                             |
| SOC 2 Readiness           | `docs/36-enterprise/SOC2-READINESS.md`        | SOC 2 controls for tenant isolation                   |
| Compliance Matrix         | `docs/36-enterprise/COMPLIANCE-MATRIX.md`     | Regulatory compliance per tenant                      |
| DevOps Architecture       | `docs/21-operations/DevOpsArchitecture.md`    | Infrastructure scaling                                |
| Product Roadmap           | `docs/25-roadmap/PRODUCT-ROADMAP.md`          | PL-02 Public API vision                               |
| Component Library         | `docs/04-design/ComponentLibrary.md`          | Tenant-themeable components                           |
| Brand Guidelines          | `docs/04-design/BrandGuidelines.md`           | Per-tenant branding                                   |

### ADR References

| ADR     | Title              | Relevance                             |
| ------- | ------------------ | ------------------------------------- |
| ADR-001 | Turborepo Monorepo | Multi-tenant package structure        |
| ADR-003 | NestJS API         | Middleware pattern for tenant context |
| ADR-004 | Supabase Database  | RLS policies and tenant isolation     |
| ADR-011 | JWT Auth           | Tenant claims in JWT                  |
| ADR-012 | Vercel Deployment  | Subdomain routing and edge functions  |
| ADR-014 | Zod Validation     | Tenant schema validation              |

### External References

- **PostgreSQL RLS:** https://www.postgresql.org/docs/current/ddl-rowsecurity.html — Row-level security
- **Supabase RLS:** https://supabase.com/docs/guides/auth/row-level-security — Supabase RLS guide
- **Stripe:** https://stripe.com/docs/api — Billing integration
- **Vercel Domains:** https://vercel.com/docs/projects/domains — Custom domain management
- **Lemon Squeezy:** https://www.lemonsqueezy.com/ — Alternative billing (EU-friendly)

---

## 16. Decision Log

| ID      | Decision                                      | Rationale                                                                             |
| ------- | --------------------------------------------- | ------------------------------------------------------------------------------------- |
| MT-D001 | Hybrid isolation model (row → schema → DB)    | Start simple with RLS; upgrade path for compliance/scale                              |
| MT-D002 | `__default__` tenant for existing data        | Zero-migration path for original portfolio; no breaking changes                       |
| MT-D003 | Vercel Edge + KV for tenant routing           | Sub-10ms routing; no additional infrastructure; integrates with existing Vercel setup |
| MT-D004 | Stripe for billing (primary)                  | Best DX; webhooks-first design; supports complex pricing                              |
| MT-D005 | Supabase RLS for Phase 1 isolation            | Already using Supabase; RLS is battle-tested; no additional DB infrastructure         |
| MT-D006 | Tenant context in JWT (not session/DB lookup) | Zero-latency tenant resolution; stateless; compatible with existing auth flow         |

---

## 17. Open Questions

| Question                                                                | Status | Owner          | Target Resolution |
| ----------------------------------------------------------------------- | ------ | -------------- | ----------------- |
| What is the Supabase connection pool limit for 100+ concurrent tenants? | TBD    | Infrastructure | Phase 1           |
| Should tenants share the Vercel deployment or get separate ones?        | TBD    | Architecture   | Phase 1           |
| What is the cost of per-tenant storage (Supabase Storage)?              | TBD    | Infrastructure | Phase 1           |
| How do we handle GDPR data residency for EU tenants?                    | TBD    | Legal          | Phase 2           |
| Should we support tenant-specific model deployments (AI)?               | TBD    | Product        | Phase 3           |

---

## Change Log

| Version | Date     | Changes                                               | Author                           |
| ------- | -------- | ----------------------------------------------------- | -------------------------------- |
| 1.0     | Jul 2026 | Initial design specification — Multi-Tenancy Strategy | CTO / Platform Architecture Lead |

---

_End of Document — Multi-Tenancy Strategy v1.0_
