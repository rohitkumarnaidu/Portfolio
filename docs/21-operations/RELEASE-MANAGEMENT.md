# Release Management

> **Document:** `ReleaseManagement.md` | **Version:** 1.1 | **Last Updated:** July 2026  
> **Status:** ✅ Active | **Owner:** Engineering Lead | **Review Cadence:** Quarterly  
> **Related:** [EnvironmentStrategy.md](./EnvironmentStrategy.md) | [MetricsStrategy.md](./MetricsStrategy.md) | `docs/devops/environment-matrix.md`

---

## 1. Overview

Release management governs how code moves from development to production. Our philosophy favours **continuous deployment, trunk-based development, and feature flags** to decouple deployment from release. Every merge to `main` triggers an automated pipeline that builds, tests, and deploys — with safety gates at each step.

## 2. Release Cadence

| Type | Frequency | Trigger | Risk |
|------|-----------|---------|------|
| **Standard** | Multiple times daily | Any PR merge to `main` | Low |
| **Scheduled** | Weekly (Tue 14:00 UTC) | Tagged release for major features | Medium |
| **Emergency (hotfix)** | As needed | `hotfix/*` branch from `main` | High |

### 2.1 Standard Releases

The default path. Every PR that passes CI is merged and deployed automatically.

**Process:** PR opened → CI passes → Code review approved → Squash-merge to `main` → Vercel deploy → Smoke test → Monitor (30 min)

### 2.2 Scheduled Releases

Used for coordinated feature launches, database migrations, or dependency upgrades.

**Process:** Feature complete → QA on staging → Release branch cut → Changelog finalized → Tag (`vYYYY.MM.DD-1`) → Deploy to staging → Final smoke test → Promote to production

### 2.3 Emergency Releases (Hotfixes)

For urgent production issues (SEV-1 / SEV-2). Bypasses normal queue but still requires CI.

**Process:** Issue identified → `hotfix/<description>` branch from `main` → Fix + CI → PR with expedited review → Merge → Deploy → Post-mortem within 24h

## 3. Version Numbering

| Artifact | Scheme | Example |
|----------|--------|---------|
| API (NestJS) | SemVer (`MAJOR.MINOR.PATCH`) | `2.1.0` |
| Deployment tag | Date-based (`vYYYY.MM.DD-N`) | `v2026.07.11-1` |
| Docker images | Git commit SHA | `ghcr.io/portfolio/api:a1b2c3d` |
| Frontend | No version; commit hash as identifier | `a1b2c3d` |

API SemVer rules:
- **MAJOR**: Breaking API contract change (new endpoint version)
- **MINOR**: Non-breaking new feature or endpoint addition
- **PATCH**: Bug fix, performance improvement, refactor (no contract change)

## 4. Release Process (Detailed)

```
┌─────────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐    ┌───────────┐
│  PR      │───>│  CI      │───>│  Code     │───>│  Merge   │───>│  Deploy   │
│  Opened  │    │  Passes  │    │  Review   │    │  to main │    │  (Vercel) │
└─────────┘    └──────────┘    └───────────┘    └──────────┘    └───────────┘
                                                                    │
                    ┌──────────┐    ┌──────────┐                   │
                    │ Monitor  │<───│  Smoke   │<───────────────────┘
                    │ (30 min) │    │  Test    │
                    └──────────┘    └──────────┘
```

### Step-by-step:

1. **Development**: Feature branch from `main`. Commit with Conventional Commits.
2. **CI checks** (automated per commit):
   - Lint (ESLint)
   - Typecheck (tsc)
   - Unit tests (Jest / Vitest)
   - Build validation
   - Prisma validation (schema check)
3. **Code review**: At least one approving review required. No self-merge.
4. **Merge**: Squash-commit to `main`. PR description becomes commit message.
5. **Deploy**: Vercel detects `main` branch push, builds, deploys to production.
6. **Smoke test**: Automated health checks run against production endpoints.
7. **Monitor**: 30-minute watch window on error rates, latency, and uptime.

## 5. Release Checklist

Every release (standard or scheduled) must satisfy:

- [ ] All CI checks pass (lint, typecheck, test, build)
- [ ] At least one code review approval
- [ ] PR description includes changelog entry or `#skip-changelog` label
- [ ] Database migrations are backward-compatible (if applicable)
- [ ] Feature flags are configured for any new functionality
- [ ] No known critical or high-severity vulnerabilities in changed deps
- [ ] API backward compatibility verified (no breaking changes without MAJOR bump)

### Scheduled release additional items:

- [ ] Changelog generated from Conventional Commits since last tag
- [ ] Load test results reviewed (if significant traffic change)
- [ ] Rollback plan documented
- [ ] Stakeholders notified of release window

## 6. Rollback Criteria

A release is rolled back immediately if any of these conditions are met within the 30-minute monitoring window:

| Condition | Threshold | Action |
|-----------|-----------|--------|
| API error rate | > 1% of requests returning 5xx | Revert to previous deploy |
| p95 API latency | > 2 seconds | Revert to previous deploy |
| SEV-1 or SEV-2 incident | Any incident caused by the release | Revert + post-mortem |
| Core Web Vitals regression | LCP > 4.0s or CLS > 0.25 | Revert to previous deploy |
| AI service errors | > 5% failure rate | Roll back AI deployment |

**Rollback procedure:**
1. `git revert HEAD` (or `git revert <merge-commit>`)
2. Push reverted branch to `main`
3. Vercel auto-deploys the revert
4. Announce in #deploys: `:rotating_light: Rollback of <deploy-id> — <reason>`
5. Create a ticket for root cause analysis

**Post-rollback always requires** a post-mortem within 24 hours documenting root cause, detection time, resolution time, and preventive measures.

## 7. Feature Flags

We use feature flags to decouple deployment from release:

| Tool | Scope | Use Case |
|------|-------|----------|
| Vercel Edge Config | Frontend flags | UI gating, A/B tests |
| Environment variables | Backend flags | API feature toggles |

**Flag lifecycle:**
1. Create flag (default `false`)
2. Merge + deploy (feature hidden)
3. Enable for testing (by user ID or IP)
4. Progressive rollout (10% → 50% → 100%)
5. Monitor for 48 hours at 100%
6. Remove flag logic + delete flag (tech debt ticket)

## 8. Communication

| Channel | Purpose | Notifications |
|---------|---------|---------------|
| `#deploys` (Slack) | All production deployments | CI/CD pipeline webhook |
| `#alerts` (Slack) | Anomalies, rollbacks, incidents | Monitoring tools |
| GitHub Releases | Tagged release notes | Automated from changelog |
| Email (stakeholders) | Scheduled release windows | Manual (weekly) |

**Deploy notification format (in #deploys):**
```
🚀 Deploy <service>@<tag> to production
  Author: @user
  PR: #123 — Brief description
  Commits: a1b2c3d..e4f5g6h (3 commits)
  Dashboard: <link>
  Monitoring until: 14:30 UTC
```

## 9. Deployment Freeze Periods

Deployments are frozen during:
- **Major holiday weeks** (Dec 24–Jan 2): Only security patches
- **Conference presentations** (24h before talk): No changes
- **During active SEV-1 incident**: No deploys until resolved

Exceptions require Engineering Lead approval + documented justification.
