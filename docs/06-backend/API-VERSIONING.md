# API Versioning Strategy

> **Document:** `docs/06-backend/api-versioning.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** Ã¢Å“â€¦ Active | **Owner:** API Architect | **Related:** [44-API-STANDARDS.md](../10-api/44-API-STANDARDS.md), [12-API.md](../10-api/12-API.md)

---

## Overview

This document defines the API versioning approach for the Portfolio platform. The platform uses **Accept header-based content negotiation** with the format `application/vnd.portfolio.v{n}+json`, implemented via NestJS middleware. This approach keeps URLs clean while allowing fine-grained version control.

## Versioning Scheme

| Property                   | Value                                       |
| -------------------------- | ------------------------------------------- |
| **Mechanism**              | `Accept` header content negotiation         |
| **Format**                 | `application/vnd.portfolio.v{n}+json`       |
| **Current version**        | `v1`                                        |
| **Default (no header)**    | `v1`                                        |
| **Backward compatibility** | Within major version, additive changes only |
| **Deprecation window**     | 6 months                                    |

## Content Negotiation Implementation

Version parsing happens at the middleware layer. Requests without an `Accept` header default to the latest version.

```typescript
// apps/api/src/common/middleware/api-version.middleware.ts
const VERSION_RE = /application\/vnd\.portfolio\.v(\d+)\+json/;

@Injectable()
export class ApiVersionMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const accept = req.headers.accept || '';
    const match = accept.match(VERSION_RE);
    const version = match ? parseInt(match[1], 10) : 1;
    (req as any).apiVersion = version;
    next();
  }
}
```

The middleware is registered globally in `main.ts`:

```typescript
// apps/api/src/main.ts
const VERSION_RE = /application\/vnd\.portfolio\.v(\d+)\+json/;
app.use((req: any, _res: any, next: any) => {
  const accept = req.headers.accept || '';
  const match = accept.match(VERSION_RE);
  req.apiVersion = match ? parseInt(match[1], 10) : 1;
  next();
});
```

The parsed version is available on every request via `req.apiVersion` for use in controllers and services.

## Version Lifecycle

| Phase          | Status              | Duration          | What It Means                                   |
| -------------- | ------------------- | ----------------- | ----------------------------------------------- |
| **Active**     | Ã¢Å“â€¦ Current     | Indefinite        | Additive changes only. No breaking changes.     |
| **Deprecated** | Ã¢Å¡Â Ã¯Â¸Â Warning | 6 months          | Bug fixes only. `Deprecation: true` header set. |
| **Sunset**     | Ã°Å¸Å¡Â« Removed    | After deprecation | Endpoint returns `410 Gone`. No support.        |

### Deprecation Headers

Deprecated versions include response headers to inform clients:

```http
HTTP/1.1 200 OK
Deprecation: true
Sunset: Sat, 01 Jan 2027 00:00:00 GMT
Link: <https://api.portfolio.dev/api/portfolio/sections>; rel="successor-version"
```

## Breaking Changes Policy

### Constitutes a Breaking Change

| Change                                        | Action            |
| --------------------------------------------- | ----------------- |
| Removing or renaming fields in responses      | New major version |
| Changing endpoint URLs                        | New major version |
| Changing error response format                | New major version |
| Removing endpoints                            | New major version |
| Changing auth requirements                    | New major version |
| Changing field types (string Ã¢â€ â€™ number) | New major version |
| Adding required request fields                | New major version |

### Does NOT Constitute a Breaking Change

| Change                                  | Action       |
| --------------------------------------- | ------------ |
| Adding new fields to responses          | Same version |
| Adding new endpoints                    | Same version |
| Adding new optional query parameters    | Same version |
| Changing internal implementation        | Same version |
| Adding new optional request body fields | Same version |

## Controller Usage Pattern

Controllers access the version to conditionally adjust responses:

```typescript
@Get()
async findAll(@Req() req: Request) {
  const version = (req as any).apiVersion;

  const data = await this.service.findAll();

  if (version >= 2) {
    // Return v2-shaped response
    return { data: data.map(formatV2) };
  }

  // Default v1 response
  return { data };
}
```

## Migration Guide

To migrate from v1 to v2:

1. **Update the Accept header** in your client:
   ```http
   Accept: application/vnd.portfolio.v2+json
   ```
2. **Review the changelog** for removed or renamed fields
3. **Test against the staging environment** before production
4. **Deploy the client update** and monitor error rates
5. **Remove the old version header** after the sunset period

## Route Architecture

The global prefix `api` is set in `main.ts`, followed by the domain segment:

```
Accept: application/vnd.portfolio.v1+json

GET /api/portfolio/sections    Ã¢â€ â€™ PortfolioSectionController
GET /api/admin/sections        Ã¢â€ â€™ AdminSectionController (authenticated)
```

Versioning is orthogonal to routing Ã¢â‚¬â€ the same controller can serve multiple versions via the `req.apiVersion` check.

## Cross-References

- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system
