# CI/CD Pipeline Strategy

> **Document:** `ci-cd-pipeline-strategy.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** Draft | **Owner:** DevOps Lead | **Review Cadence:** Quarterly
> **Related:** [Environment Strategy](./environment-matrix.md) | [Container Strategy](./container-strategy.md) | [DORA Metrics](../operations/dora-metrics.md) | [Deployment Guide](../operations/DeploymentGuide.md)

---

## Table of Contents

1. [Pipeline Philosophy](#1-pipeline-philosophy)
2. [Current State Assessment](#2-current-state-assessment)
3. [Target Pipeline Architecture](#3-target-pipeline-architecture)
4. [Stage Definitions](#4-stage-definitions)
5. [Environment Strategy](#5-environment-strategy)
6. [Quality Gates & Promotion](#6-quality-gates--promotion)
7. [Security Integration](#7-security-integration)
8. [Monitoring & Reporting](#8-monitoring--reporting)
9. [Migration Plan](#9-migration-plan)

---

## 1. Pipeline Philosophy

### 1.1 Guiding Principles

The CI/CD pipeline is the backbone of our delivery process. Every code change travels through an automated, deterministic path from commit to production, with quality enforced at every step. Our philosophy rests on five pillars:

**Every Commit Triggers CI, Every PR Triggers Extended Checks.** There is no such thing as a "trivial" commit. Every push to any tracked branch runs lint, typecheck, and build to catch regressions instantly. Pull requests escalate this to the full suite: unit tests, integration tests, coverage checks, bundle analysis, E2E tests, and security scanning. This asymmetry ensures the fast feedback loop for direct pushes while guaranteeing PRs meet the bar for merge.

**Fail Fast.** The pipeline stages are ordered by speed and specificity. Lint errors surface in seconds, type errors in under two minutes, test failures in under five. Each stage is a gate for the next Ã¢â‚¬â€ there is no point running tests on code that has type errors. This ordering minimizes wasted compute and developer wait time.

**Quality Gates at Every Stage.** Every stage has a defined pass/fail criterion with zero tolerance for regression. There are no warnings-as-optional-later gates. If a stage fails, the pipeline stops, the commit is marked red, and the author is notified. Quality is not a separate phase Ã¢â‚¬â€ it is embedded in every stage of delivery.

**Security Scanning Integrated into Pipeline.** Security is not an afterthought scanned quarterly. Dependabot alerts on every dependency change, CodeQL analyzes every push, and `npm audit` fails the build on critical or high vulnerabilities. Container images are scanned with Trivy before registry push. Secrets are checked at commit time via GitHub secret scanning.

**Continuous Improvement via Metrics.** Pipeline performance is tracked and published. Build times, test times, flake rates, and deployment frequency are measured to drive optimization. A pipeline that takes longer than 10 minutes is a pipeline that discourages frequent deployments.

### 1.2 Developer Experience Goals

| Goal | Target | Measurement |
|------|--------|-------------|
| Pipeline duration (CI) | < 8 minutes | Workflow run time |
| Pipeline duration (PR) | < 15 minutes | Workflow run time |
| First feedback (lint) | < 30 seconds | Time to lint job completion |
| Deployment frequency | Multiple times daily | Deploys per day |
| Change failure rate | < 5% | Deployments requiring remediation |
| Mean time to recovery | < 1 hour | Time from incident to fix in production |

---

## 2. Current State Assessment

### 2.1 Existing Workflows

The project currently has three CI/CD workflow definitions:

| Workflow | Location | Trigger | Stages | Issues |
|----------|----------|---------|--------|--------|
| `ci.yml` | `.github/workflows/ci.yml` | Push to main/master/develop + tags `v*` | Lint, typecheck, test (ci.yml line 28-33), build, Prisma validate, Docker build & push (API + Web) | Tests run with `continue-on-error: true` for web; no coverage thresholds; no Postgres service container |
| `pr.yml` | `.github/workflows/pr.yml` | PR to main/master/develop | Lint, typecheck, test (with `continue-on-error: true` for web), build, Prisma validate + migrate (dry-run) | No E2E tests; no bundle analysis; tests allowed to fail for web |
| `ci.yml` | `infrastructure/ci/ci.yml` | Push to main/develop + PR to main | Lint, typecheck, build, deploy to Vercel | **Orphaned** Ã¢â‚¬â€ uses `amondnet/vercel-action@v25`, legacy Node 20, outdated path references (frontend/.next) |

### 2.2 Gap Analysis

| Capability | Current State | Target State | Gap |
|------------|--------------|--------------|-----|
| **Lint** | Ã¢Å“â€¦ Present in all workflows | ESLint with `--max-warnings=0` | No `--max-warnings=0` enforced |
| **Typecheck** | Ã¢Å“â€¦ Present in all workflows | `tsc --noEmit` with strict mode | No strict mode flag |
| **Unit tests** | Ã¢Å¡Â Ã¯Â¸Â Partial Ã¢â‚¬â€ run but allowed to fail for web | Must pass, coverage threshold 40%+ | `continue-on-error: true` for web; no coverage enforcement |
| **Integration tests** | Ã¢ÂÅ’ Not run in CI | Jest/Supertest against test DB | Missing |
| **E2E tests** | Ã¢ÂÅ’ Not run in CI | Playwright against preview deployment | Missing entirely |
| **Coverage reporting** | Ã¢ÂÅ’ Not collected | Published to PR comments | Missing |
| **Build** | Ã¢Å“â€¦ Present in all workflows | Turbo build with cache | Uses per-workspace build (not turbo `--filter`) |
| **Docker build** | Ã¢Å“â€¦ Present in `ci.yml` only | multi-arch with buildx caching | Only on push to main/tags, not on PR |
| **Security scan** | Ã¢ÂÅ’ Not present | CodeQL + npm audit + Trivy | Missing entirely |
| **Bundle analysis** | Ã¢ÂÅ’ Not present | @next/bundle-analyzer on PR | Missing |
| **Deploy to Vercel** | Ã¢Å¡Â Ã¯Â¸Â Legacy workflow only | Vercel CLI with environment promotion | Old `amondnet/vercel-action` in orphaned workflow |
| **Postgres service** | Ã¢ÂÅ’ Not configured | GitHub Actions service container | Missing |
| **Dependabot** | Ã¢ÂÅ’ Not configured | Auto-create PRs for vulnerable deps | Missing |
| **CodeQL** | Ã¢ÂÅ’ Not configured | GitHub CodeQL analysis on push | Missing |

### 2.3 Pipeline Inventory

```
.github/workflows/
  ci.yml          # Active Ã¢â‚¬â€ push-based CI + Docker build/push
  pr.yml          # Active Ã¢â‚¬â€ PR-based lint/typecheck/test/build

infrastructure/
  ci/
    ci.yml        # Legacy Ã¢â‚¬â€ orphaned, should be archived
  docker/
    docker-compose.yml  # Local dev orchestration (web + api + ai)
```

### 2.4 Test Configuration Summary

| App | Framework | Has Tests? | Coverage Tool | E2E Framework |
|-----|-----------|------------|--------------|---------------|
| `apps/api` | Jest 30 + Supertest | Yes (incl. e2e tests) | Jest `--coverage` | Jest e2e config |
| `apps/web` | Vitest 4 | Yes (unit + component) | Vitest `--coverage` | Playwright |

---

## 3. Target Pipeline Architecture

### 3.1 End-to-End Pipeline Flow

```
                                    Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
                                    Ã¢â€â€š   git push/PR    Ã¢â€â€š
                                    Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ
                                             Ã¢â€â€š
                                    Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Â¼Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
                                    Ã¢â€â€š  npm ci (cached) Ã¢â€â€š
                                    Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ
                                             Ã¢â€â€š
                                    Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Â¼Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
                                    Ã¢â€â€š  1. Lint (eslint)Ã¢â€â€š  Ã¢â€”â€žÃ¢â€â‚¬Ã¢â€â‚¬ Fail fast: ~1 min
                                    Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ
                                             Ã¢â€â€š
                                    Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Â¼Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
                                    Ã¢â€â€š2. Typecheck (tsc)Ã¢â€â€š  Ã¢â€”â€žÃ¢â€â‚¬Ã¢â€â‚¬ ~2 min
                                    Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ
                                             Ã¢â€â€š
                                    Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Â¼Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
                                    Ã¢â€â€š3. Unit Test      Ã¢â€â€š  Ã¢â€”â€žÃ¢â€â‚¬Ã¢â€â‚¬ ~3 min, coverage > 40%
                                    Ã¢â€â€š   (Jest/Vitest)  Ã¢â€â€š
                                    Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ
                                             Ã¢â€â€š
                                    Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Â¼Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
                                    Ã¢â€â€š4. Integration    Ã¢â€â€š  Ã¢â€”â€žÃ¢â€â‚¬Ã¢â€â‚¬ ~5 min, Postgres service
                                    Ã¢â€â€š   Test           Ã¢â€â€š
                                    Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ
                                             Ã¢â€â€š
                                    Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Â¼Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
                                    Ã¢â€â€š5. Build (Turbo)  Ã¢â€â€š  Ã¢â€”â€žÃ¢â€â‚¬Ã¢â€â‚¬ ~5 min
                                    Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ
                                             Ã¢â€â€š
                      Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¼Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
                      Ã¢â€â€š                      Ã¢â€â€š                      Ã¢â€â€š
              Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Â¼Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â    Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Â¼Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â   Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Â¼Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
              Ã¢â€â€š6. E2E (PR only)Ã¢â€â€š    Ã¢â€â€š7. Docker Build    Ã¢â€â€š   Ã¢â€â€š8. Security    Ã¢â€â€š
              Ã¢â€â€š  Playwright    Ã¢â€â€š    Ã¢â€â€š   (buildx)        Ã¢â€â€š   Ã¢â€â€š   Scan        Ã¢â€â€š
              Ã¢â€â€š  ~8 min        Ã¢â€â€š    Ã¢â€â€š   ~3 min          Ã¢â€â€š   Ã¢â€â€š   ~2 min      Ã¢â€â€š
              Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ    Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ
                      Ã¢â€â€š                      Ã¢â€â€š                      Ã¢â€â€š
              Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Â¼Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â             Ã¢â€â€š                      Ã¢â€â€š
              Ã¢â€â€š9. Bundle      Ã¢â€â€š             Ã¢â€â€š                      Ã¢â€â€š
              Ã¢â€â€š   Analysis    Ã¢â€â€š             Ã¢â€â€š                      Ã¢â€â€š
              Ã¢â€â€š   (PR only)   Ã¢â€â€š             Ã¢â€â€š                      Ã¢â€â€š
              Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ             Ã¢â€â€š                      Ã¢â€â€š
                      Ã¢â€â€š                     Ã¢â€â€š                      Ã¢â€â€š
                      Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€ËœÃ¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ
                                 Ã¢â€â€š
                        Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Â¼Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
                        Ã¢â€â€š  All Passed?    Ã¢â€â€š
                        Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ
                                 Ã¢â€â€š
                    Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â´Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
                    Ã¢â€â€š YES                      Ã¢â€â€š NO
                    Ã¢â€“Â¼                          Ã¢â€“Â¼
            Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â        Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
            Ã¢â€â€š10. Deploy     Ã¢â€â€š        Ã¢â€â€š Block + Notify   Ã¢â€â€š
            Ã¢â€â€š   (Vercel)    Ã¢â€â€š        Ã¢â€â€š Author           Ã¢â€â€š
            Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ        Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ
                    Ã¢â€â€š
            Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Â¼Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
            Ã¢â€â€š Post-Deploy   Ã¢â€â€š
            Ã¢â€â€š Smoke Tests   Ã¢â€â€š
            Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ
```

### 3.2 Mermaid Pipeline Diagram

```mermaid
flowchart TB
    Trigger["git push / PR"] --> Install["npm ci (cached)"]

    subgraph "Quality Gates (Sequential, Fail-Fast)"
        Lint["1. Lint (ESLint)<br/>~1 min"]
        TC["2. Typecheck (tsc --noEmit)<br/>~2 min"]
        UT["3. Unit Tests (Jest/Vitest)<br/>~3 min<br/>Coverage >= 40%"]
        IT["4. Integration Tests<br/>~5 min<br/>Postgres service container"]
        Build["5. Build (Turborepo)<br/>~5 min"]
    end

    subgraph "Extended Checks (Parallel, PR Only)"
        E2E["6. E2E Tests (Playwright)<br/>~8 min"]
        BA["7. Bundle Analysis<br/>~1 min"]
    end

    subgraph "Security (Parallel)"
        CodeQL["CodeQL Analysis"]
        Audit["npm audit (critical/high)"]
        Trivy["Trivy scan (Docker)"]
    end

    subgraph "Deployment"
        Deploy["10. Deploy to Vercel<br/>~3 min"]
        Smoke["Post-Deploy Smoke Tests<br/>~2 min"]
    end

    Trigger --> Install --> Lint --> TC --> UT --> IT --> Build

    Build --> E2E & BA & CodeQL & Audit
    Build --> Docker["8. Docker Build & Push<br/>~3 min"]
    Docker --> Trivy

    E2E & BA & CodeQL & Audit & Trivy -->|All Pass| Deploy
    E2E & BA & CodeQL & Audit & Trivy -->|Any Fail| Block["Ã¢ÂÅ’ Blocked"]

    Deploy --> Smoke
    Smoke -->|Pass| Success["Ã¢Å“â€¦ Deployed"]
    Smoke -->|Fail| Rollback["Ã°Å¸â€â€ž Rollback"]
```

### 3.3 Workflow Design

The target architecture uses three GitHub Actions workflow files:

| Workflow | File | Trigger | Scope |
|----------|------|---------|-------|
| **CI** | `.github/workflows/ci.yml` | Push to `main`, `develop` + tags `v*` | Quality gates Ã¢â€ â€™ Docker build/push Ã¢â€ â€™ Security scan |
| **PR** | `.github/workflows/pr.yml` | Pull requests to `main`, `develop` | Full suite + E2E + Bundle analysis + Coverage comment |
| **Deploy** | `.github/workflows/deploy.yml` | Push to `main` (after CI passes) + manual workflow_dispatch | Vercel deploy + Post-deploy smoke tests |

### 3.4 Dependency Graph

```
PR Workflow:
  lint Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Âº typecheck Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Âº test Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Âº build Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Âº e2e Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Âº bundle-analyzer
                                        Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Âº codeql Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Âº npm-audit

CI Workflow (push):
  lint Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Âº typecheck Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Âº test Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Âº build Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Âº docker Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Âº trivy
                                        Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Âº codeql Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Âº npm-audit

Deploy Workflow:
  [triggered after CI passes on main]
  vercel-deploy Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Âº smoke-test
```

---

## 4. Stage Definitions

### 4.1 Stage Matrix

| Stage | Tool | Est. Time | Fail Criteria | Caching Strategy |
|-------|------|-----------|--------------|-------------------|
| Lint | ESLint (with `--max-warnings=0`) | 1 min | Any lint error or warning | ESLint cache file |
| Typecheck | `tsc --noEmit` (strict mode) | 2 min | Any type error | `tsBuildInfoFile` incremental |
| Unit Test | Jest (api) / Vitest (web) | 3 min | Any test failure; coverage < 40% global | Jest/Vitest cache |
| Integration Test | Jest + Supertest | 5 min | Any test failure | Postgres service container |
| Build | Turborepo | 5 min | Any build failure | Turborepo remote caching |
| E2E (PR only) | Playwright | 8 min | Any test failure | Playwright browser cache |
| Docker Build | Docker buildx | 3 min | Build failure | GitHub Actions cache (type=gha) |
| Security Scan | npm audit + CodeQL | 2 min | Critical or high vulnerabilities | CodeQL database cache |
| Bundle Analysis | `@next/bundle-analyzer` | 1 min | Bundle size budget exceeded | Next.js build cache |
| Deploy | Vercel CLI | 3 min | Deploy failure | N/A |

### 4.2 Detailed Stage Specifications

#### 4.2.1 Lint (Stage 1)

```
Trigger: Always (every push and PR)
Tool: ESLint with TypeScript plugin
Command: npm run lint
Config: .eslintrc.js (project root + per-workspace overrides)
Cache: ~/.eslintcache
Max warnings: 0
```

The lint stage enforces code style, catches unused imports, and prevents common anti-patterns. Because `turbo.json` defines `lint` with `dependsOn: ["^build"]`, lint requires upstream builds to complete first. To avoid the build dependency for lint, the lint task should remove its `dependsOn: ["^build"]` constraint, or be run per-workspace without Turbo (as the current workflows do with `--workspace=${{ matrix.workspace }}`).

**Recommendation:** Remove `"dependsOn": ["^build"]` from the `lint` task in `turbo.json` so lint can run independently and fail fast.

#### 4.2.2 Typecheck (Stage 2)

```
Trigger: Always (every push and PR)
Tool: TypeScript compiler
Command: npm run typecheck (or npx tsc --noEmit)
Config: apps/*/tsconfig.json with strict: true
Incremental: tsBuildInfoFile for faster re-runs
```

Typecheck ensures type safety across the entire codebase. Like lint, it depends on `^build` in `turbo.json`, which should be removed for fast failure.

#### 4.2.3 Unit Test (Stage 3)

```
Trigger: Always (every push and PR)

API (Jest):
  Command: npm test --workspace=apps/api
  Config: jest.config.ts
  Coverage: --coverage --coverageThreshold='{"global":{"branches":40,"functions":40,"lines":40,"statements":40}}'
  Fail on: any test failure OR coverage below threshold

Web (Vitest):
  Command: npm test --workspace=apps/web
  Config: vitest.config.ts
  Coverage: --coverage --coverage.thresholds.lines=40
  Fail on: any test failure OR coverage below threshold
```

Unit tests validate individual functions, services, and components in isolation. Coverage thresholds start at 40% and increase over time as the codebase matures.

#### 4.2.4 Integration Test (Stage 4)

```
Trigger: Every push and PR
Tool: Jest + Supertest (api) / Vitest + MSW (web)
Env: Postgres service container (GitHub Actions)
Command: npm run test -- --testPathPattern="integration" or dedicated npm run test:integration

Requires:
  - Postgres 16 service container in GitHub Actions
  - DATABASE_URL pointing at the service container
  - Prisma migration run before tests
  - Seed data loaded

Fail on: any test failure (no continue-on-error)
```

Integration tests validate API endpoints, database queries, and cross-service interactions. These require a real Postgres database provided via GitHub Actions service containers.

#### 4.2.5 Build (Stage 5)

```
Trigger: Always (every push and PR)
Tool: Turborepo
Command: npm run build
Config: turbo.json
Cache: Turborepo remote caching (when TURBO_TOKEN and TURBO_TEAM configured)

Output verification:
  - apps/api/dist/ exists
  - apps/web/.next/ exists and contains build manifest
```

The build stage compiles all workspaces. Turborepo's dependency graph ensures correct build order (`^build`). Remote caching dramatically speeds up subsequent runs.

#### 4.2.6 E2E Tests (Stage 6 Ã¢â‚¬â€ PR Only)

```
Trigger: Pull requests only
Tool: Playwright
Command: npm run test:e2e --workspace=apps/web
Browsers: chromium (default), firefox (sampled)
Service: Postgres + API must be running (via docker-compose or direct)

Requires:
  - Vercel preview deployment URL or local server
  - Test database with seed data
  - Playwright browsers cached via @playwright/test

Fail on: any test failure
```

E2E tests validate critical user journeys through the full stack. These only run on PRs because they are expensive (~8 min) and slow relative to the rest of the pipeline.

#### 4.2.7 Docker Build (Stage 7)

```
Trigger: Push to main/master + tags v*
Tool: Docker buildx
Command: docker buildx build --cache-from=type=gha --cache-to=type=gha,mode=max
Contexts: apps/api/Dockerfile, apps/web/Dockerfile
Registry: ghcr.io/${{ github.repository }}/api, /web
Tags: :latest, :${{ github.sha }}, :${{ github.ref_name }} (for tags)

Fail on: build failure
```

Docker images are built and pushed only for main branch and version tags. PRs trigger a build-only (no push) to validate the Dockerfile.

#### 4.2.8 Security Scan (Stage 8)

```
Trigger: Every push and PR (runs in parallel with build)

npm audit:
  Command: npm audit --audit-level=high
  Fail on: any critical or high vulnerability
  Note: Runs after npm ci (node_modules already present)

CodeQL:
  Tool: github/codeql-action/analyze@v3
  Languages: javascript-typescript
  Queries: +security-and-quality
  Fail on: any error or alert with severity error/warning

Trivy (Docker only):
  Command: trivy image --severity=CRITICAL,HIGH --exit-code=1 ghcr.io/.../api:latest
  Fail on: any critical vulnerability in Docker image
  Note: Only runs after Docker build
```

#### 4.2.9 Bundle Analysis (Stage 9 Ã¢â‚¬â€ PR Only)

```
Trigger: Pull requests only
Tool: @next/bundle-analyzer
Command: ANALYZE=true npm run build --workspace=apps/web
Output: .next/analyze/ Ã¢â‚¬â€ uploaded as CI artifact

Budget thresholds:
  - Initial JS (first load): < 150 KB gzipped
  - Total JS: < 500 KB gzipped
  - CSS: < 50 KB gzipped

Fail on: any budget threshold exceeded
Reporting: Comment on PR with size diff vs base branch
```

Bundle analysis prevents JavaScript bloat from creeping into production. Only runs on PRs where bundle changes are most relevant.

#### 4.2.10 Deploy (Stage 10)

```
Trigger: Push to main (after all prior stages pass) + manual workflow_dispatch
Tool: Vercel CLI
Command: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
Env: Vercel project + org configured in secrets

Post-deploy:
  - Health check: curl -sI https://$SITE_URL
  - Smoke test: curl -s https://api.$SITE_URL/api/health
  - Status check: Verify HTTP 200 and response body

Rollback: vercel rollback $DEPLOY_URL (manual trigger)
```

---

## 5. Environment Strategy

### 5.1 Environment Matrix

| Environment | Provisioning | Database | Deploy Trigger | URL |
|-------------|-------------|----------|---------------|-----|
| **Development** | Local machine | Local Postgres (Docker) | Manual | `localhost:3000` |
| **CI** | Ephemeral GHA runner | Postgres service container | git push | N/A (runner) |
| **Preview** | Vercel preview | Ephemeral (CI Postgres) | PR opened/synchronized | `pr-<number>.vercel.app` |
| **Staging** | Vercel staging | Supabase staging DB | Merge to `main` | `staging.portfolio.dev` |
| **Production** | Vercel production | Supabase production DB | Release tag | `portfolio.dev` |

### 5.2 Development Environment

```
Stack: Local machine + Docker Desktop
Services:
  - Node 22 (via nvm or fnm)
  - Postgres 16 (Docker container or local install)
  - Redis (optional, for BullMQ)

Config: config/.env (copied from config/.env.example)
Commands:
  npm run dev         # Starts all services via Turbo
  npm run dev:api     # API only (port 3001)
  npm run dev:web     # Web only (port 3000)
  docker compose up   # Full stack with containers
```

### 5.3 CI Environment

```
Stack: GitHub Actions ubuntu-latest
Services:
  - Node 22 (setup-node action)
  - Postgres 16 (service container, ephemeral)

Postgres service container config:
  services:
    postgres:
      image: postgres:16-alpine
      env:
        POSTGRES_USER: postgres
        POSTGRES_PASSWORD: dummy_password
        POSTGRES_DB: portfolio_test
      ports:
        - 5432:5432
      options: >-
        --health-cmd pg_isready
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5

  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/portfolio_test?schema=public

Cache directories:
  - ~/.npm (npm cache)
  - .eslintcache (ESLint)
  - node_modules/.cache/turbo (Turborepo)
  - ~/.cache/ms-playwright (Playwright browsers)
```

### 5.4 Preview Environment

```
Stack: Vercel Preview Deployment
Trigger: Automatic on every PR (via Vercel GitHub integration)
URL: https://<project>.vercel.app (or custom domain per PR)

Environment variables:
  - Inherited from Vercel project (development overrides)
  - NEXT_PUBLIC_API_URL Ã¢â€ â€™ staging API

Database: 
  - Ephemeral database for E2E tests (spun up in CI)
  - Staging database for preview (shared, read-only for preview)

Lifespan: Auto-destroyed when PR is closed/merged
```

### 5.5 Staging Environment

```
Stack: Vercel Production deployment (non-prod alias)
Deploy trigger: Merge to main branch
URL: staging.portfolio.dev

Environment variables:
  - Staging Supabase credentials
  - Staging JWT secrets
  - Staging API keys (rate-limited)

Database: Supabase staging project
  - Runs migrations automatically on deploy
  - Seeded with anonymized production data (weekly)
  - Daily backup

Monitoring: Full observability stack (logs, metrics, traces)
```

### 5.6 Production Environment

```
Stack: Vercel Production deployment
Deploy trigger: Release tag (v*) + manual approval
URL: portfolio.dev

Environment variables:
  - Production Supabase credentials
  - Production JWT secrets
  - Production API keys
  - Sentry DSN (production project)

Database: Supabase production project
  - Migrations require manual approval
  - Zero-downtime migration strategy
  - Point-in-time recovery enabled

Monitoring: 
  - Sentry for error tracking
  - OpenTelemetry for traces
  - Custom dashboards for business metrics

Compliance:
  - Deployments logged to audit trail
  - Change management record required
```

---

## 6. Quality Gates & Promotion

### 6.1 Promotion Model

```
                    Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
                    Ã¢â€â€š              Commit Flow                    Ã¢â€â€š
                    Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ

  Developer Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Âº Feature Branch Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Âº PR Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Âº Main Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Âº Staging Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€“Âº Production
                    Ã¢â€â€š               Ã¢â€â€š        Ã¢â€â€š           Ã¢â€â€š            Ã¢â€â€š
                    Ã¢â€â€š               Ã¢â€â€š        Ã¢â€â€š           Ã¢â€â€š            Ã¢â€â€š
                    Ã¢â€“Â¼               Ã¢â€“Â¼        Ã¢â€“Â¼           Ã¢â€“Â¼            Ã¢â€“Â¼
              Pre-commit      PR CI     CI + Auto    Auto       Manual
              hooks           (full)    Deploy       Deploy     Approval
                                                            + Smoke Test
```

### 6.2 Quality Gate: Feature Branch Ã¢â€ â€™ PR

| Gate | Requirement | Enforcement |
|------|-------------|-------------|
| Pre-commit | Husky + lint-staged pass | Local git hook |
| Branch name | `feature/*`, `fix/*`, `chore/*` | GitHub branch rules |
| Commit messages | Conventional Commits | Commitlint (optional) |

### 6.3 Quality Gate: PR Ã¢â€ â€™ Main

| Gate | Requirement | Blocking |
|------|-------------|----------|
| CI passing | All stages green (lint, typecheck, test, build) | Ã¢Å“â€¦ Yes |
| Coverage | >= 40% global, no decrease from base | Ã¢Å“â€¦ Yes |
| E2E tests | All Playwright tests pass | Ã¢Å“â€¦ Yes |
| Bundle analysis | No budget exceeded | Ã¢Å¡Â Ã¯Â¸Â Warning (configurable to block) |
| Security scan | No critical/high vulns | Ã¢Å“â€¦ Yes |
| Code review | At least 1 approval | Ã¢Å“â€¦ Yes |
| Branch up to date | Must be rebased on latest main | Ã¢Å“â€¦ Yes |
| Commit signing | All commits signed | Ã¢Å¡Â Ã¯Â¸Â Recommended |

### 6.4 Quality Gate: Main Ã¢â€ â€™ Staging

| Step | Action | Automation |
|------|--------|------------|
| 1 | CI passes on main | Automatic (GitHub Actions) |
| 2 | Auto-deploy to Vercel staging | Automatic (deploy workflow) |
| 3 | Health check passes | Automatic (curl endpoint) |
| 4 | Smoke tests pass | Automatic (2-min suite) |
| 5 | Database migration applied | Automatic (Supabase CLI) |
| 6 | Cache warmed | Automatic (ISR revalidation) |

### 6.5 Quality Gate: Staging Ã¢â€ â€™ Production

| Step | Action | Who |
|------|--------|-----|
| 1 | Staging verification complete | CI (auto) |
| 2 | Release candidate tagged (`v*`) | Developer (manual) |
| 3 | Release notes generated | CI (auto from commits) |
| 4 | Manual approval | DevOps Lead or Tech Lead |
| 5 | Production deploy | Vercel (auto after approval) |
| 6 | Post-deploy smoke tests | CI (auto) |
| 7 | Rollback if smoke tests fail | CI (auto) |

### 6.6 Rollback Strategy

| Scenario | Action | Time |
|----------|--------|------|
| Smoke test failure | Auto-rollback via Vercel CLI | < 2 min |
| Elevated error rate (5 min) | Auto-rollback via Sentry + GitHub API | < 5 min |
| Manual incident | `vercel rollback` or GitHub workflow | < 1 min |
| Bad database migration | Manual restore from backup | < 15 min |

**Rollback procedure:**

```bash
# Rollback Vercel deployment
npx vercel rollback --token=$VERCEL_TOKEN

# Or via GitHub workflow
gh workflow run rollback.yml --ref main
```

---

## 7. Security Integration

### 7.1 Security Controls Overview

| Control | Stage | Tool | Automation | Blocking |
|---------|-------|------|------------|----------|
| Dependency scanning | Post-install | `npm audit --audit-level=high` | CI on every push | Blocks on critical/high |
| Static analysis | Post-build | CodeQL (`javascript-typescript`) | CI on every push | Blocks on error-level alerts |
| Container scanning | Post-Docker-build | Trivy (GitHub container scan) | CI on main push | Blocks on critical CVEs |
| Secret detection | Pre-commit | GitHub secret scanning | On every push | Blocks on credential patterns |
| Dependabot | Scheduled | Dependabot alerts + auto-PR | Daily | Auto-creates PR for vulnerable deps |
| SBOM generation | Post-build | `npm sbom` / CycloneDX | CI on release tag | Non-blocking |
| Supply chain attestation | Post-build | Sigstore/cosign (future) | CI on release tag | Future |

### 7.2 npm Audit Configuration

```yaml
- name: Dependency audit
  run: npm audit --audit-level=high
  # Fails if any critical or high severity vulnerabilities exist
  # Use --audit-level=high to only block on high+ (ignore moderate/low)
  # Registry: uses .npmrc or NPM_CONFIG_REGISTRY
```

**Exception process:** If a high/critical vulnerability cannot be immediately resolved:
1. Create a GitHub issue documenting the vulnerability
2. Add `npm audit --audit-level=high --json | jq '.vulnerabilities | length'` as a non-blocking warning
3. Document the exception in the SecurityExceptions register
4. Set a remediation SLA (typically 7 days for high, 48 hours for critical)

### 7.3 CodeQL Configuration

```yaml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v3
  with:
    languages: javascript-typescript
    queries: +security-and-quality

- name: Perform CodeQL Analysis
  uses: github/codeql-action/analyze@v3
```

**Scope:** All JavaScript and TypeScript code in the repository, excluding:
- `node_modules/`
- Generated code (Prisma client in `generated/`)
- Build output (`dist/`, `.next/`)

### 7.4 Trivy (Container Scanning)

```yaml
- name: Scan Docker image
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ env.REGISTRY }}/${{ github.repository }}/api:${{ github.sha }}
    format: sarif
    output: trivy-results.sarif
    severity: CRITICAL,HIGH
    exit-code: 1
```

Trivy runs against the built Docker image before pushing to the registry. This catches vulnerabilities in both the application dependencies and the base image (node:22-alpine).

### 7.5 Dependabot Configuration

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: daily
    open-pull-requests-limit: 10
    labels:
      - dependencies
      - automated
    reviewers:
      - team-devops

  - package-ecosystem: docker
    directory: /apps/api
    schedule:
      interval: weekly

  - package-ecosystem: docker
    directory: /apps/web
    schedule:
      interval: weekly

  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
```

### 7.6 Secrets Management

| Secret | Storage | Rotation | Access Scope |
|--------|---------|----------|-------------|
| `VERCEL_TOKEN` | GitHub Actions secret | 90 days | Deploy workflow |
| `VERCEL_ORG_ID` | GitHub Actions secret | Static | Deploy workflow |
| `VERCEL_PROJECT_ID` | GitHub Actions secret | Static | Deploy workflow |
| `DOCKER_USERNAME` | GitHub Actions secret | Static | Docker build |
| `DOCKER_PASSWORD` | GitHub Actions secret | 90 days | Docker build |
| `SENTRY_AUTH_TOKEN` | GitHub Actions secret | 90 days | Build workflow |
| `TURBO_TOKEN` | GitHub Actions secret | 90 days | All workflows (cache) |
| `TURBO_TEAM` | GitHub Actions secret | Static | All workflows (cache) |

**Principle:** Tokens are scoped to the minimum permissions required. No production secrets are exposed to CI Ã¢â‚¬â€ the Vercel deploy step uses a project-scoped deploy token, not a user token.

---

## 8. Monitoring & Reporting

### 8.1 Pipeline Observability

| Metric | Source | Collection | Dashboard |
|--------|--------|------------|-----------|
| Pipeline duration | GitHub Actions API | Per-workflow run | Grafana / GitHub Insights |
| Stage duration | GitHub Actions API | Per-job run | Grafana / GitHub Insights |
| Pass/fail rate | GitHub Actions API | Per-workflow | GitHub Actions Insights |
| Flaky test rate | CI artifact (JUnit XML) | Per-test run | Custom dashboard |
| Coverage percentage | Jest/Vitest output | Per-push | PR comment + artifact |
| Deployment frequency | Vercel API / GitHub deployments | Per-deploy | DORA metrics dashboard |
| Change failure rate | Sentry / PagerDuty | Post-deploy | DORA metrics dashboard |
| Lead time for change | GitHub API (commit Ã¢â€ â€™ deploy) | Per-deploy | DORA metrics dashboard |
| MTTR | Incident management tool | Per-incident | DORA metrics dashboard |

### 8.2 CI Artifacts

Every workflow run produces the following artifacts:

```
ci-artifacts/
  test-results/
    api/junit.xml          # JUnit test results (API)
    web/junit.xml          # JUnit test results (web)
  coverage/
    api/lcov.info          # LCOV coverage report (API)
    web/coverage/          # HTML coverage report (web)
  bundle/
    web/analyze/           # Bundle analysis output (web)
  docker/
    api-sbom.json          # SBOM for API image
    web-sbom.json          # SBOM for web image
  security/
    codeql-results.sarif   # CodeQL SARIF output
    npm-audit.json         # npm audit JSON output
    trivy-results.sarif    # Trivy SARIF output (when Docker built)
```

### 8.3 PR Comments

The pipeline posts automated comments to PRs with:

```
## Ã¢Å“â€¦ CI Pipeline Ã¢â‚¬â€ All Stages Passed

| Stage | Status | Duration |
|-------|--------|----------|
| Lint | Ã¢Å“â€¦ Passed | 45s |
| Typecheck | Ã¢Å“â€¦ Passed | 1m 20s |
| Unit Tests | Ã¢Å“â€¦ Passed | 2m 45s |
| Integration Tests | Ã¢Å“â€¦ Passed | 4m 10s |
| Build | Ã¢Å“â€¦ Passed | 3m 30s |
| E2E Tests | Ã¢Å“â€¦ Passed | 7m 55s |
| Bundle Analysis | Ã¢Å“â€¦ Passed | 55s |
| Security Scan | Ã¢Å“â€¦ Passed | 1m 30s |

### Coverage Report

| Workspace | Lines | Branches | Functions |
|-----------|-------|----------|-----------|
| `apps/api` | 72.3% | 65.1% | 78.4% |
| `apps/web` | 58.7% | 51.2% | 62.0% |

### Bundle Size Impact

| Asset | Main | PR | Diff |
|-------|------|----|------|
| Initial JS | 142 KB | 148 KB | +6 KB |
| Total JS | 412 KB | 425 KB | +13 KB |
| CSS | 32 KB | 32 KB | 0 KB |
```

### 8.4 DORA Metrics Tracking

| Metric | Definition | Target | Measurement |
|--------|-----------|--------|-------------|
| **Deployment Frequency** | Number of deployments to production per day | Multiple per day | Count of successful Vercel production deploys / day |
| **Lead Time for Change** | Time from commit to production | < 1 hour | GitHub: time from merge commit to deploy completion |
| **Mean Time to Recovery (MTTR)** | Time to restore service after incident | < 1 hour | PagerDuty / incident response: time from alert to fix |
| **Change Failure Rate** | % of deploys causing degraded service | < 5% | Deployments with Sentry alert / total deploys * 100 |

**Implementation:** DORA metrics are computed weekly via a scheduled workflow that queries the GitHub API and Vercel API, posting results to a Slack channel and a Grafana dashboard.

### 8.5 Build Time Regression Detection

A scheduled workflow runs weekly to compare build times against a 14-day rolling average:

```yaml
name: Pipeline Performance Review
on:
  schedule:
    - cron: '0 9 * * 1'  # Monday 9 AM

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/github-script@v7
        with:
          script: |
            # Query workflow run durations
            # Compare to 14-day rolling average
            # Post to Slack if > 20% regression
```

---

## 9. Migration Plan

### 9.1 Migration Phases

| Phase | Tasks | Duration | Risk |
|-------|-------|----------|------|
| **Phase 1: Foundation** | Move CI workflow, fix lint/typecheck deps, add test enforcement | 2 days | Low |
| **Phase 2: Testing** | Add Postgres service, integration tests, coverage thresholds | 3 days | Medium |
| **Phase 3: Security** | Add CodeQL, npm audit, Dependabot config, secret scanning | 2 days | Low |
| **Phase 4: Advanced** | Add E2E tests, bundle analysis, PR comments, performance tracking | 3 days | Medium |
| **Phase 5: Polish** | Archive legacy workflows, DORA metrics, documentation finalization | 1 day | Low |

### 9.2 Phase 1 Ã¢â‚¬â€ Foundation (Days 1-2)

**Tasks:**

| # | Task | Details | Verification |
|---|------|---------|-------------|
| 1.1 | Remove `dependsOn: ["^build"]` from `lint` and `typecheck` in `turbo.json` | Allows lint and typecheck to run independently, enabling fail-fast | `npm run lint` completes without triggering build |
| 1.2 | Consolidate CI workflow into `.github/workflows/ci.yml` | Move logic from `infrastructure/ci/ci.yml` into the active workflows | All existing functionality preserved |
| 1.3 | Remove `continue-on-error: true` from test steps | Tests must now fail the pipeline instead of being informational | A deliberately broken test fails the workflow |
| 1.4 | Add `--max-warnings=0` to lint commands | No warnings allowed | ESLint warning causes workflow failure |
| 1.5 | Standardize Node version to 22 across all workflows | Ensures consistency between local and CI environments | All workflows use `node-version: 22` |

**Workflow changes:**

- `.github/workflows/ci.yml`: Remove `continue-on-error: true` for web tests; add `--max-warnings=0` to lint
- `.github/workflows/pr.yml`: Same as above
- `turbo.json`: Remove `dependsOn: ["^build"]` from `lint` and `typecheck` tasks
- `infrastructure/ci/ci.yml`: **Mark as deprecated** (archive in Phase 5)

**Rollback safety:** These changes only affect CI behavior, not application code. Rollback is a simple revert of the workflow files.

### 9.3 Phase 2 Ã¢â‚¬â€ Testing & Coverage (Days 3-5)

**Tasks:**

| # | Task | Details | Verification |
|---|------|---------|-------------|
| 2.1 | Add Postgres service container to CI workflows | 16-alpine image with health check, exposed on port 5432 | Integration test connects to service container |
| 2.2 | Add Prisma migration step to CI (before tests) | `npx prisma migrate deploy` against service container DB | Migrations run without error |
| 2.3 | Add integration test target to `apps/api` | `npm run test:integration` script using Supertest | Integration tests pass against real Postgres |
| 2.4 | Add coverage thresholds (40% global minimum) | Jest/Vitest config with `coverageThreshold` | Code with < 40% coverage fails CI |
| 2.5 | Add `test` task to `turbo.json` | Enables `turbo run test` for directed graph | `turbo run test` executes all test suites |
| 2.6 | Add coverage artifact upload | Upload `coverage/` and `lcov.info` to CI artifacts | Coverage reports available in workflow run |

**Workflow additions (`.github/workflows/ci.yml`):**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: dummy_password
      POSTGRES_DB: portfolio_test
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5

steps:
  # ... existing steps ...
  - name: Run Prisma migrations
    run: npx prisma migrate deploy
    working-directory: apps/api
    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/portfolio_test?schema=public

  - name: Run tests with coverage
    run: npm run test:coverage --workspace=${{ matrix.workspace }}
    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/portfolio_test?schema=public
```

### 9.4 Phase 3 Ã¢â‚¬â€ Security (Days 6-7)

**Tasks:**

| # | Task | Details | Verification |
|---|------|---------|-------------|
| 3.1 | Add CodeQL workflow | `.github/workflows/codeql.yml` scanning on push + schedule | CodeQL results appear in Security tab |
| 3.2 | Add `npm audit` step to CI workflows | Runs after `npm ci`, blocks on high/critical | Deliberately vulnerable dependency fails CI |
| 3.3 | Create Dependabot config | `.github/dependabot.yml` for npm, Docker, GitHub Actions | Dependabot PRs created for outdated deps |
| 3.4 | Add Trivy scan to Docker build jobs | Scan image before pushing to registry | Trivy results in CI artifacts |
| 3.5 | Verify GitHub secret scanning | Enabled in repo settings | Test commit with fake secret shows alert |

**New file: `.github/workflows/codeql.yml`**

```yaml
name: CodeQL

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 3'  # Weekly on Wednesday

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: [javascript-typescript]

    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
          queries: +security-and-quality
      - uses: github/codeql-action/analyze@v3
```

### 9.5 Phase 4 Ã¢â‚¬â€ Advanced CI (Days 8-10)

**Tasks:**

| # | Task | Details | Verification |
|---|------|---------|-------------|
| 4.1 | Add Playwright E2E tests to PR workflow | Runs against preview deployment or local server | E2E tests pass in CI |
| 4.2 | Add bundle analysis step to PR workflow | `ANALYZE=true next build` with budget thresholds | Bundle report uploaded as artifact |
| 4.3 | Add automated PR comment with coverage summary | Using `github-script` to post coverage data | Coverage summary appears on PR |
| 4.4 | Add bundle size diff comment to PR | Compare against base branch | Bundle diff appears on PR |
| 4.5 | Create Deploy workflow | `.github/workflows/deploy.yml` for Vercel deployment | Deploy succeeds on merge to main |

**New file: `.github/workflows/deploy.yml`**

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    name: Deploy to Vercel
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      
      - name: Deploy to Vercel
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Post-Deploy Health Check
        run: |
          sleep 10
          curl -sI https://portfolio.dev | head -3
```

### 9.6 Phase 5 Ã¢â‚¬â€ Polish (Day 11)

**Tasks:**

| # | Task | Details | Verification |
|---|------|---------|-------------|
| 5.1 | Archive `infrastructure/ci/ci.yml` | Move to `infrastructure/ci/archived/` with README note | Legacy workflow not triggered |
| 5.2 | Add DORA metrics tracking workflow | Weekly aggregation of deploy frequency, lead time, etc. | Metrics dashboard populated |
| 5.3 | Add Turborepo remote caching configuration | Set `TURBO_TOKEN` and `TURBO_TEAM` in all workflows | Cache hit on second workflow run |
| 5.4 | Update pipeline documentation | Reflect changes in `docs/operations/25-CICD.md` and this document | Docs match workflow YAML |
| 5.5 | Add pipeline health dashboard | Grafana or GitHub Pages dashboard showing pipeline metrics | Dashboard renders with live data |

### 9.7 Rollback Plan

If a migration phase introduces issues:

| Phase | Rollback Action | Impact |
|-------|----------------|--------|
| Phase 1 | Revert turbo.json changes; restore continue-on-error | Build order reverts; tests non-blocking again |
| Phase 2 | Remove Postgres service from workflows; lower coverage threshold | Integration tests skip; coverage unenforced |
| Phase 3 | Remove CodeQL workflow; remove npm audit step | Security scanning stops; no automated vulnerability detection |
| Phase 4 | Remove E2E and bundle analysis steps from PR workflow | PR checks faster but less comprehensive |
| Phase 5 | Restore infrastructure/ci/ci.yml; remove DORA tracking | Returns to original state |

Each phase is designed to be independently rollback-able. No phase depends on a previous phase to maintain existing functionality.

---

## Appendix A: Workflow File Inventory

| File | Status | Purpose |
|------|--------|---------|
| `.github/workflows/ci.yml` | Ã¢Å“â€¦ Active | Push-based CI (lint Ã¢â€ â€™ typecheck Ã¢â€ â€™ test Ã¢â€ â€™ build Ã¢â€ â€™ Docker) |
| `.github/workflows/pr.yml` | Ã¢Å“â€¦ Active | PR validation (lint Ã¢â€ â€™ typecheck Ã¢â€ â€™ test Ã¢â€ â€™ build) |
| `.github/workflows/deploy.yml` | Ã°Å¸â€â€ž Planned | Deploy to Vercel on merge to main |
| `.github/workflows/codeql.yml` | Ã°Å¸â€â€ž Planned | CodeQL security analysis |
| `.github/dependabot.yml` | Ã°Å¸â€â€ž Planned | Automated dependency updates |
| `infrastructure/ci/ci.yml` | Ã°Å¸â€”â€žÃ¯Â¸Â Legacy (to archive) | Orphaned workflow from previous iteration |

## Appendix B: Turbo.json Task Configuration

Current `turbo.json` with recommended changes:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": []
      // Changed from ["^build"] to [] for fail-fast behavior
    },
    "typecheck": {
      "dependsOn": []
      // Changed from ["^build"] to [] for fail-fast behavior
    },
    "test": {
      // New task Ã¢â‚¬â€ enables turbo run test
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

## Appendix C: Key Decisions

| ID | Decision | Rationale |
|----|----------|-----------|
| D-001 | Sequential quality gates with dependency chain | Fail-fast principle: no point testing code with type errors |
| D-002 | E2E tests on PR only, not push | E2E tests take 8 min Ã¢â‚¬â€ too expensive for every push but essential for PR validation |
| D-003 | Postgres service container instead of external test DB | Ephemeral containers are faster, cheaper, and more isolated than shared databases |
| D-004 | 40% coverage threshold (starting) | Low enough to not block current work, high enough to prevent total neglect; ratchet up quarterly |
| D-005 | Vercel for deployment (not self-hosted) | Existing infrastructure, preview deployments for every PR, no server management |
| D-006 | Archive legacy workflow, not migrate | `infrastructure/ci/ci.yml` uses outdated patterns (Node 20, amondnet/vercel-action, frontend/.next path) Ã¢â‚¬â€ cleaner to replace |

---

*Document Version: 1.0 Ã¢â‚¬â€ CI/CD Pipeline Strategy*  
*Next Review Date: October 2026*  
*Author: DevOps Lead*

## Cross-References
- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system