# Release Process

> **Document:** `RELEASE-PROCESS.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** ✅ Active | **Owner:** Engineering Lead | **Review Cadence:** Quarterly
> **Related:** [HotfixProcess.md](./HOTFIX-PROCESS.md) | [VersioningStrategy.md](./VERSIONING-STRATEGY.md) | `docs/21-operations/RELEASE-CHECKLIST.md`

---

## 1. Release Types and Cadence

| Type | Frequency | Trigger | Risk | Deploy Target |
|------|-----------|---------|------|---------------|
| **Standard** | Multiple times daily | PR merge to `main` | Low | Vercel (auto) |
| **Scheduled** | Weekly (Tue 14:00 UTC) | Tagged release | Medium | ghcr.io + Vercel |
| **Emergency (hotfix)** | As needed | `hotfix/*` branch | High | Vercel (expedited) |

See [HotfixProcess.md](./HOTFIX-PROCESS.md) for the emergency branch.

---

## 2. Standard Release Process (Continuous Deployment)

Every PR merged to `main` triggers an automated deploy to Vercel with zero manual intervention.

```
┌─────────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐    ┌──────────────┐    ┌───────────┐
│  PR     │───>│  CI      │───>│  Code     │───>│  Merge   │───>│  Auto-Deploy │───>│  Smoke    │
│  Opened │    │  Quality │    │  Review   │    │  to main │    │  (Vercel)    │    │  Tests    │
└─────────┘    └──────────┘    └───────────┘    └──────────┘    └──────────────┘    └───────────┘
                                                                                           │
                     ┌──────────┐    ┌──────────┐                                          │
                     │ Monitor  │<───│  Pass?   │<─────────────────────────────────────────┘
                     │ (30 min) │    └──────────┘
                     └──────────┘
```

### Step-by-step

1. Developer opens a PR from a feature branch to `main`
2. **CI quality gates** run automatically:
   - Lint (ESLint across all workspaces)
   - Typecheck (`tsc --noEmit`)
   - Unit and integration tests (Jest / Vitest)
   - Build validation (`npm run build`)
   - Prisma schema validation
   - Dependency vulnerability scan
3. **Code review**: at least one approving review, no self-merge
4. **Merge**: squash-merge to `main`; PR title becomes the commit message
5. **Auto-deploy**: Vercel detects push to `main`, builds, and deploys to production
6. **Smoke tests**: automated health checks hit all endpoints
7. **Monitor**: 30-minute watch window on error rates, latency, and uptime (Sentry + Vercel Analytics)

This process repeats multiple times per day. No manual approval is required for standard releases.

---

## 3. Scheduled Release Process (Docker / ghcr.io)

Scheduled releases produce Docker images and require manual approval.

### Release Candidate

1. Engineering Lead selects a cut point on `main`
2. CI builds release candidate artifacts
3. All tests must pass: unit, integration, e2e, and load tests
4. Changelog generated from Conventional Commits since last tag
5. `RELEASE-CHECKLIST.md` is verified

### Release Candidate Criteria

| Criterion | Requirement |
|-----------|-------------|
| All tests pass | Unit, integration, e2e, load — 100% green |
| No P0/P1 bugs | Zero open blocker or critical issues |
| Code review complete | All included PRs approved |
| Documentation updated | CHANGELOG.md, API docs, migration guides |
| Rollback plan documented | Steps verified on staging |

### Approval

Only the **Engineering Manager** or **Tech Lead** can approve a scheduled release. Approval is recorded in the release PR via a GitHub approval.

### Deployment Steps

1. Tag the release: `git tag vX.Y.Z && git push origin vX.Y.Z`
2. CI builds Docker images for API (`apps/api`) and AI service (`apps/ai`)
3. Images are pushed to `ghcr.io/portfolio/api:vX.Y.Z` and `ghcr.io/portfolio/ai:vX.Y.Z`
4. Images deploy to **staging** environment automatically
5. Full E2E test suite runs against staging
6. If E2E passes, promote to production:
   - Vercel production deploy (from the tagged commit)
   - Railway deploy (from tagged Docker image)
   - Supabase migrations run via `prisma:migrate:deploy`
7. Production smoke test verifies all services

---

## 4. Release Communication

Every release is announced in the `#releases` Slack channel with the following format:

```
🚀 Release v1.2.0 — 2026-07-11 14:00 UTC
  Changelog: Added project analytics, fixed null serializer bug
  Artifacts: ghcr.io/portfolio/api:v1.2.0, ghcr.io/portfolio/ai:v1.2.0
  Deploy time: ~4 minutes
  Rollback plan: Vercel redeploy of v1.1.0, Railway rollback to previous
  Monitoring window: 14:00–14:30 UTC
  Approved by: @tech-lead
```

---

## 5. Post-Release Verification

For the 30 minutes following any production deployment:

| Check | Tool | Frequency |
|-------|------|-----------|
| Smoke test all critical user flows | Custom smoke test suite | Immediate |
| Monitor API error rates | Sentry | Real-time |
| Monitor p95 latency | Vercel Analytics | Real-time |
| Monitor Core Web Vitals | Vercel Analytics | Real-time |
| Check for new Sentry issues | Sentry | Continuous |
| Verify AI service responses | Health check + sample query | Every 5 min |
| Verify database connectivity | Prisma health probe | Every 5 min |

If any threshold in the [rollback criteria](../21-operations/RELEASE-MANAGEMENT.md#6-rollback-criteria) is breached, trigger the rollback process immediately.

---

## 6. Release Day Checklist

For scheduled releases, reference the PRODUCTION-GO-LIVE-CHECKLIST.md in addition to this process:

[PRODUCTION-GO-LIVE-CHECKLIST.md](../21-operations/RELEASE-CHECKLIST.md)

The checklist covers code freeze, database migrations, security review, performance audit, smoke tests, and post-release monitoring — all of which must be completed before the production promotion step.
