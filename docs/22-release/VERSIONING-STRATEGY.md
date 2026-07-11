# Versioning Strategy

> **Document:** `VERSIONING-STRATEGY.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** ✅ Active | **Owner:** Engineering Lead | **Review Cadence:** Quarterly
> **Related:** [ReleaseProcess.md](./RELEASE-PROCESS.md) | `docs/21-operations/RELEASE-MANAGEMENT.md`

---

## 1. Semantic Versioning

All artifacts follow **SemVer 2.0** (`MAJOR.MINOR.PATCH`). The current version is **1.0.0**.

| Component | Scheme | Current Version | Location |
|-----------|--------|-----------------|----------|
| API (NestJS) | SemVer | 1.0.0 | `apps/api/package.json` |
| Web (Next.js) | SemVer | 1.0.0 | `apps/web/package.json` |
| AI (FastAPI) | SemVer | 1.0.0 | `apps/ai/pyproject.toml` |
| `@portfolio/shared` | SemVer | 1.0.0 | `packages/shared/package.json` |
| `@portfolio/ui` | SemVer | 1.0.0 | `packages/ui/package.json` |

All monorepo `package.json` files track versions independently via `npm version <type>` per workspace. The root `package.json` version reflects the overall platform release.

---

## 2. What Constitutes Each Bump

### MAJOR (x.0.0)

Breaking changes that require coordinated updates across consumers:

| Change | Example |
|--------|---------|
| Breaking API contract change | Removing or renaming an endpoint |
| Request/response schema incompatibility | Changing field types or required fields |
| Database schema changes requiring migration rollback incompatibility | Destructive column drops, table removals |
| Removing a feature or capability | Deprecating the admin dashboard |
| Dropping framework/runtime support | Node.js 18 -> 22 minimum |
| Data migration with no reverse path | Encrypting previously plaintext fields |

### MINOR (0.x.0)

Backward-compatible additions:

| Change | Example |
|--------|---------|
| New API endpoint | `GET /api/portfolio/projects/:id/analytics` |
| Non-breaking optional field addition | Adding `metadata?: object` to response |
| New feature behind feature flag | AI project summarization |
| New Prisma model or optional column | Adding a `tags` table |
| Dependency major bumps (no API change) | Upgrading NestJS from 10.x to 11.x |

### PATCH (0.0.x)

Backward-compatible fixes with no contract change:

| Change | Example |
|--------|---------|
| Bug fix | Fixing null reference in project serializer |
| Performance improvement | Optimizing database query, adding index |
| Security patch | Updating `lodash` to patched version |
| Documentation update | Correcting JSDoc, Swagger descriptions |
| Refactoring (no behavior change) | Extracting a helper function |
| Dependency minor/patch bumps | `@types/node` from 22.3.0 to 22.3.1 |

---

## 3. Pre-release Identifiers

Pre-release versions follow SemVer dot-separated identifiers:

| Suffix | Meaning | Example |
|--------|---------|---------|
| `-alpha.N` | Early development, unstable APIs likely to change | `1.2.0-alpha.1` |
| `-beta.N` | Feature-complete, accepting bug reports before RC | `1.2.0-beta.2` |
| `-rc.N` | Release candidate, final validation before GA | `1.2.0-rc.1` |

Pre-release versions are **lower precedence** than the release version per SemVer spec. They are built from `develop` or `release/*` branches and never deployed to production.

---

## 4. API Versioning

The API uses **content negotiation** via the `Accept` header:

```
Accept: application/vnd.portfolio.v2+json
```

Version `1` is assumed when no version header is present (default route). Versioned routes are registered as separate controllers under `src/portfolio/controllers/v1/` and `src/admin/controllers/v1/`.

When a MAJOR version is released:
- Existing `v1` controllers remain deployed for the deprecation window (90 days)
- New `v2` controllers handle the updated schema
- Clients receive a `Sunset` header on deprecated versions: `Sunset: Sat, 11 Oct 2026 00:00:00 GMT`

---

## 5. Database Versioning

Prisma migration names encode the date and purpose:

```
YYYYMMDD_description
```

| Example Migration Name | Description |
|------------------------|-------------|
| `20260711_init` | Initial schema |
| `20260715_add_projects_table` | New feature migration |
| `20260720_add_metadata_column` | Non-breaking schema addition |
| `20260725_drop_legacy_fields` | Breaking change (requires MAJOR) |

Migrations are backward-compatible for the current MAJOR version. Breaking migrations coincide with a MAJOR API version bump and are deployed during scheduled releases only.

---

## 6. Changelog Maintenance

`CHANGELOG.md` at the repository root is maintained according to [Keep a Changelog](https://keepachangelog.com/):

| Section | Contents |
|---------|----------|
| `[Unreleased]` | Changes merged to `main` not yet in a tagged release |
| `[1.1.0] - YYYY-MM-DD` | Tagged release entry |
| `Added` | New features |
| `Changed` | Changes to existing functionality |
| `Deprecated` | Soon-to-be-removed features |
| `Removed` | Removed features |
| `Fixed` | Bug fixes |
| `Security` | Vulnerability fixes |

Changelog entries are written as part of the PR description. The `#skip-changelog` label suppresses the entry. At release time, entries are collated from Conventional Commit messages since the last tag.

---

## 7. Git Tagging

Every production release is tagged:

```bash
git tag v1.0.0
git push origin v1.0.0
```

| Tag | Artifact |
|-----|----------|
| `v1.0.0` | Platform release (all packages) |
| `v1.1.0` | Minor release |
| `v1.1.1` | Patch release |
| `v2.0.0-rc.1` | Pre-release candidate |

Tags are signed (`git tag -s`) and pushed only from CI after all checks pass.

---

## 8. Version Compatibility Matrix

The following matrix defines which component versions are compatible with each other.

| API Version | Web Version | AI Service | @portfolio/shared | Current? |
|-------------|-------------|------------|-------------------|----------|
| v1 (1.0.x) | v1 (1.0.x) | v1 (1.0.x) | v1 (1.0.x) | Yes |
| v2 (2.x) | v2 (2.x) | v2 (2.x) | v2 (2.x) | Future |

**Rules:**
- MAJOR versions must match across all components in production
- MINOR and PATCH mismatches are tolerated (e.g., API v1.2.0 with Web v1.1.0)
- The AI service is independently deployable as long as its API contract matches the backend
- `@portfolio/shared` versions must be on the same MAJOR as the API for type safety

Cross-version compatibility is verified in CI via integration tests that test each API version against the corresponding web version.
