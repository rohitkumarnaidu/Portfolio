# Quality Gates — Release Lifecycle Enforcement

> **Document:** `QUALITY-GATES.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** ✅ Active | **Owner:** QA Lead | **Review Cadence:** Quarterly

## 1. Purpose

This document defines the quality gates that every change must pass before progressing to the next stage of the development lifecycle. Each gate has automated or manual enforcement, defined pass/fail criteria, and a documented bypass procedure for emergencies.

---

## 2. Gate Overview

| # | Gate | Stage | Enforcement | Gatekeeper |
|---|------|-------|-------------|------------|
| G1 | PRE-COMMIT | Local development | Automated (hooks) | Developer |
| G2 | PULL REQUEST | CI pipeline | Automated (CI) | CI Pipeline |
| G3 | PRE-DEPLOY | Staging validation | Automated + Manual | QA Engineer |
| G4 | POST-DEPLOY | Production monitoring | Automated | On-Call Engineer |
| G5 | QUARTERLY | Periodic review | Manual | Engineering Lead |

---

## 3. Gate Definitions

### G1: PRE-COMMIT Gate (Local)

| Aspect | Details |
|--------|---------|
| **Stage** | Local development, before `git commit` |
| **Enforcement** | Automated via pre-commit hooks (husky + lint-staged) |
| **Gatekeeper** | Developer (self-enforced) |

| Check | Command | Criterion | Pass/Fail |
|-------|---------|-----------|-----------|
| Code compiles | `tsc --noEmit` | Zero type errors | Fail on any error |
| Linter passes | `npm run lint` | Zero lint errors | Fail on any error |
| Formatter passes | `npm run format -- --check` | All files formatted | Fail on diff |
| No secrets committed | `secretlint` / detect-secrets | No credentials, tokens, or keys | Fail on match |
| Unit tests (affected scope) | `npm test -- --changedSince=main` | All pass | Fail on failure |

**Bypass Procedure:** `git commit --no-verify` is permitted only for experimental/scratch branches. Bypasses are logged in the commit message with `[SKIP_HOOK: <reason>]`. Production branches (`main`, `release/*`) never bypass.

---

### G2: PULL REQUEST Gate (CI)

| Aspect | Details |
|--------|---------|
| **Stage** | On PR open, synchronize, and merge to `main` |
| **Enforcement** | Fully automated via CI pipeline (GitHub Actions) |
| **Gatekeeper** | CI Pipeline (merge blocked until green) |

| Check | Tool / Command | Threshold | Pass/Fail |
|-------|----------------|-----------|-----------|
| TypeScript strict mode | `tsc --noEmit --strict` | Zero errors | Fail on any error |
| Lint | `npm run lint` | Zero warnings | Fail on any warning |
| Unit tests | `npm test` (Jest/Vitest) | 100% pass rate | Fail on any failure |
| Integration tests | `npm run test:integration` | 100% pass rate | Fail on any failure |
| Code coverage (services) | `jest --coverage` | >= 70% | Fail below minimum |
| Code coverage (controllers) | `jest --coverage` | >= 50% | Fail below minimum |
| Dependency scan | `npm audit` / `pnpm audit` | Zero critical vulnerabilities | Fail on critical |
| PR size | git diff stats | <= 400 lines changed, <= 20 files | Fail on exceed |
| Build | `npm run build` | Successful build | Fail on any error |

**Bypass Procedure:** Emergency bypass requires approval from QA Lead + Engineering Lead. Bypassed checks must be validated within 24 hours post-merge. Documented in PR description with `[GATE_BYPASS]` tag.

---

### G3: PRE-DEPLOY Gate (Staging)

| Aspect | Details |
|--------|---------|
| **Stage** | Before promotion from staging to production |
| **Enforcement** | Automated (CI) + Manual sign-off (QA Engineer) |
| **Gatekeeper** | QA Engineer |

| Check | Tool / Method | Threshold | Pass/Fail |
|-------|---------------|-----------|-----------|
| E2E tests | Playwright (all browsers) | 100% pass rate | Fail on any failure |
| Lighthouse scores | Lighthouse CI | >= 90 in all categories | Fail on any category |
| Bundle size regression | `@next/bundle-analyzer` comparison | <= 5% increase from baseline | Fail on exceed |
| API performance baseline | k6 / autocannon | p95 latency <= 100ms | Fail on exceed |
| Database migration validation | Prisma migrate diff | No destructive changes (DROP, RENAME) | Fail on destructive |
| Smoke tests | Playwright smoke suite | 100% pass | Fail on any failure |

**Bypass Procedure:** Requires approval from QA Lead + Architecture Lead + Engineering Manager (minimum 2 of 3). Post-deployment validation must complete within 24 hours. Full regression must run within 48 hours. Documented in release notes.

---

### G4: POST-DEPLOY Gate (Production)

| Aspect | Details |
|--------|---------|
| **Stage** | First 30 minutes after production deployment |
| **Enforcement** | Automated monitoring + alerts |
| **Gatekeeper** | On-Call Engineer |

| Check | Tool / Source | Threshold | Pass/Fail |
|-------|---------------|-----------|-----------|
| Error rate | Sentry | < 0.1% of requests | Fail on exceed |
| API latency | Datadog / Grafana | p95 < 150ms | Fail on exceed |
| Critical issues | Sentry issues list | Zero P0/P1 issues | Fail on any P0/P1 |
| Health checks | `/api/health` endpoint | All services healthy | Fail on unhealthy |
| Uptime | Better Uptime / Pingdom | 100% availability | Fail on downtime |

**Bypass Procedure:** P0/P1 issues in production never bypass — they trigger immediate rollback or hotfix. For non-critical thresholds, the On-Call Engineer may keep the release live if a fix is in progress with an ETA under 2 hours. Engineering Lead must be notified.

---

### G5: QUARTERLY Gate (Periodic)

| Aspect | Details |
|--------|---------|
| **Stage** | Every quarter (end of Q1, Q2, Q3, Q4) |
| **Enforcement** | Manual review, documented report |
| **Gatekeeper** | Engineering Lead |

| Check | Scope | Method | Pass/Fail |
|-------|-------|--------|-----------|
| Full security audit | All services + infrastructure | Penetration test + DAST + SAST | Fail on critical findings |
| Dependency freshness | All `package.json` files | Outdated check via `npm outdated` / `renovate` | Warnings recorded |
| Performance benchmark | Lighthouse, API latency, load test | Compare against baseline quarter | Fail on >= 10% regression |
| Documentation review | All `docs/` | Stale content audit, cross-reference validation | Fail on >= 20% stale |
| Technical debt assessment | Codebase + backlog | Debt quantification via CodeClimate / sonar | Debt cap review |

**Bypass Procedure:** Quarterly gate cannot be fully bypassed. In extraordinary circumstances, individual items may be deferred with documented justification and a remediation deadline. Requires Engineering Lead + CTO approval.

---

## 4. Gate Summary Matrix

| Gate | Stage | Automated | Manual Check | Blocking | Emergency Bypass |
|------|-------|-----------|--------------|----------|------------------|
| G1 | Local | All checks | Developer judgment | Commit blocked | `--no-verify` flag |
| G2 | CI | All checks | — | Merge blocked | QA Lead + Eng Lead |
| G3 | Staging | E2E, Perf, Bundle | QA sign-off | Promotion blocked | QA Lead + Arch Lead + EM |
| G4 | Production | Monitoring | On-call review | Rollback trigger | None for P0/P1 |
| G5 | Quarterly | — | Full review | Quarterly release blocked | Deferred with date |

---

## 5. Gate Failure Runbook

| Gate | Failure Escalation | Notification | Remediation SLA |
|------|-------------------|--------------|-----------------|
| G1 | Developer fixes locally | Pre-commit output | Before next commit |
| G2 | CI fails → PR author + team notified | GitHub status + Slack | < 4 hours |
| G3 | QA Engineer → QA Lead → Engineering Manager | Slack @channel | < 8 hours |
| G4 | On-Call → Engineering Lead → Incident Response | PagerDuty + Slack | < 1 hour (P0), < 4 hours (P1) |
| G5 | Engineering Lead → backlog | Quarterly report | Next sprint |
