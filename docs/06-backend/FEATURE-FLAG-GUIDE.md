# Feature Flag Guide

> **Document:** `docs/backend/feature-flag-guide.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** ✅ Active | **Owner:** Platform Engineer | **Related:** [60-FEATURE-FLAGS.md](../operations/60-FEATURE-FLAGS.md)

---

## Overview

How to create, manage, and use feature flags in the Portfolio platform. Flags are stored in PostgreSQL via Prisma and managed through a `FeatureFlagsService` with server-side evaluation, gradual rollout support, and admin CRUD endpoints.

## Feature Flag Architecture

```
DB (feature_flags table)
    │
    ├── FeatureFlagsService  ← evaluation logic (hash-based rollout)
    │       │
    │       ├── PortfolioFeatureFlagsController  (public, read-only)
    │       └── AdminFeatureFlagsController      (authenticated CRUD)
    │
    └── client code (controllers, services, guards)
```

### Database Model

```prisma
// apps/api/prisma/schema.prisma
model FeatureFlag {
  id                String   @id @default(uuid())
  flagKey           String   @unique @map("flag_key")
  description       String?
  isEnabled         Boolean  @default(false) @map("is_enabled")
  targetingRules    Json     @default("{}") @map("targeting_rules")
  rolloutPercentage Int      @default(0) @map("rollout_percentage")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  @@map("feature_flags")
}
```

## Creating a Feature Flag

### Step 1: Define the Flag in the Database

**Via the Admin API:**

```json
POST /api/admin/feature-flags
{
  "flagKey": "new_admin_dashboard",
  "description": "Enable the redesigned admin dashboard",
  "isEnabled": false,
  "rolloutPercentage": 0,
  "targetingRules": { "environments": ["staging"] }
}
```

**Or via Prisma seed** (`apps/api/prisma/seed.ts`):

```typescript
await prisma.featureFlag.create({
  data: {
    flagKey: 'new_admin_dashboard',
    description: 'Enable the redesigned admin dashboard',
    isEnabled: false,
    targetingRules: { environments: ['staging'] },
    rolloutPercentage: 0,
  },
});
```

### Step 2: Use in Server-Side Code

The `FeatureFlagsService` provides evaluation with hash-based gradual rollout:

```typescript
// apps/api/src/modules/feature-flags/feature-flags.service.ts
async isEnabled(key: string): Promise<boolean> {
  const flag = await this.prisma.featureFlag.findUnique({
    where: { flagKey: key },
  });
  if (!flag?.isEnabled) return false;
  if (flag.rolloutPercentage >= 100) return true;
  if (flag.rolloutPercentage <= 0) return false;
  const hash = key.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return hash % 100 < flag.rolloutPercentage;
}
```

Usage in a controller or guard:

```typescript
import { FeatureFlagsService } from '../../modules/feature-flags/feature-flags.service';

@Injectable()
export class NewDashboardGuard implements CanActivate {
  constructor(private readonly flags: FeatureFlagsService) {}

  async canActivate(): Promise<boolean> {
    return this.flags.isEnabled('new_admin_dashboard');
  }
}
```

Or inline in a service:

```typescript
async getDashboardData() {
  if (await this.flags.isEnabled('new_admin_dashboard')) {
    return this.getNewDashboardData();
  }
  return this.getLegacyDashboardData();
}
```

### Step 3: View in the Admin UI

All flags are listed at `/api/admin/feature-flags` (authenticated). The public read-only endpoint is at `/api/portfolio/feature-flags`.

## Flag Lifecycle

| Stage | `isEnabled` | `rolloutPercentage` | Description |
|-------|-------------|---------------------|-------------|
| **Development** | `false` | `0` | Flag created, off by default. Test in dev environment. |
| **Staging** | `true` | `100` | Enabled for staging via targeting rules. QA verification. |
| **Canary** | `true` | `10` | 10% rollout to production. Monitor errors. |
| **Production** | `true` | `100` | Full release. All users get the feature. |
| **Cleanup** | Removed | — | Delete the flag after code is stabilized. |

## Flag Evaluation Patterns

### Simple Boolean Toggle

```typescript
if (await this.flags.isEnabled('feature_key')) {
  // new behavior
} else {
  // old behavior
}
```

### Gradual Rollout (Percentage-Based)

The `isEnabled` method already handles percentage-based rollout via consistent hashing. A user with the same key will always get the same result for a given percentage threshold.

### Environment Targeting

Use `targetingRules` for environment-specific behavior:

```typescript
async isEnabledForEnvironment(key: string): Promise<boolean> {
  const flag = await this.prisma.featureFlag.findUnique({
    where: { flagKey: key },
  });
  if (!flag?.isEnabled) return false;

  const rules = flag.targetingRules as Record<string, any> | null;
  const env = process.env.NODE_ENV || 'development';

  if (rules?.environments && !rules.environments.includes(env)) {
    return false; // not enabled for this environment
  }

  return true;
}
```

## DTO Reference

```typescript
// apps/api/src/modules/feature-flags/dto/create-feature-flag.dto.ts
class CreateFeatureFlagDto {
  flagKey: string;           // e.g., "new_dashboard"
  description?: string;      // e.g., "Enables the new dashboard UI"
  isEnabled?: boolean;       // default: false
  targetingRules?: object;   // JSON targeting configuration
  rolloutPercentage?: number; // 0–100, default: 0
}
```

## Best Practices

- **Name flags descriptively:** `feature-{name}-{description}` (e.g., `dashboard_v2_search_bar`)
- **Default to OFF** for new flags — enable only after testing
- **Clean up flags within 30 days** of full rollout — stale flags are technical debt
- **Document each flag's purpose** in the `description` field
- **Test with flag ON and OFF** — both paths must work
- **Never use feature flags for security gates** — use `RolesGuard` and `@Roles()` instead
- **Monitor rollout percentage** — increase gradually (10% → 25% → 50% → 100%)

## Flag Inventory

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/feature-flags` | `GET` | List all flags (authenticated) |
| `/api/admin/feature-flags` | `POST` | Create a flag (admin only) |
| `/api/admin/feature-flags/:key` | `PATCH` | Update a flag (admin/editor) |
| `/api/admin/feature-flags/:key` | `DELETE` | Delete a flag (admin only) |
| `/api/portfolio/feature-flags` | `GET` | Public read-only flag status |

## Testing with Feature Flags

```typescript
// Unit test
const flags = mock(FeatureFlagsService);
jest.mocked(flags.isEnabled).mockResolvedValue(true);

const result = await controller.getDashboardData();
expect(result).toEqual(newData);
```

Test both states:

```typescript
it('returns new dashboard when flag enabled', async () => {
  jest.mocked(flags.isEnabled).mockResolvedValue(true);
  // ...
});

it('returns legacy dashboard when flag disabled', async () => {
  jest.mocked(flags.isEnabled).mockResolvedValue(false);
  // ...
});
```
