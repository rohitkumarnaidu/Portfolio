# Benchmark Framework

> **Purpose:** Define the benchmarks to collect, the methodology for collecting them, and the budgets that signal regressions — forming a single source of truth for performance measurement.
> **Audience:** Developers, QA engineers, DevOps, and the Principal Architect.
> **Owner:** Principal Architect / DevOps Lead.
> **Version:** 1.0 | **Last Updated:** July 2026

## Overview

This document defines the benchmark framework for the Portfolio platform. Benchmarks are to be collected quarterly in the staging environment before each release. Actual data points are recorded only after running the measurement tools described below.

## Benchmark Methodology

### Tools

- **Web performance:** Lighthouse CI (desktop + mobile)
- **API performance:** k6 load testing (`apps/api/test/load/`)
- **Database performance:** `EXPLAIN ANALYZE` + `pg_stat_statements`
- **Bundle analysis:** `@next/bundle-analyzer` (via `ANALYZE=true npm run build`)
- **3D performance:** Three.js stats panel / `stats.js`

### Collection Process

1. Run benchmarks in staging environment (or against a production mirror)
2. Record results in the tables below
3. Compare against previous quarter (see Historical Trends)
4. Investigate any regressions exceeding 10%
5. Update performance budgets in `PERFORMANCE-BUDGET.md` if sustained shifts are observed
6. Tag the commit with the quarter label (e.g., `benchmarks-q3-2026`)

## What to Measure

### 1. Web Performance (Lighthouse)

Run `lighthouse-ci` against the production build deployed to staging. Collect both mobile and desktop scores.

| Metric         | Desktop | Mobile | Budget  | Status |
| -------------- | :-----: | :----: | :-----: | :----: |
| Performance    |   TBD   |  TBD   |  > 90   |   ⏳   |
| Accessibility  |   TBD   |  TBD   |  > 95   |   ⏳   |
| Best Practices |   TBD   |  TBD   |  > 95   |   ⏳   |
| SEO            |   TBD   |  TBD   |  > 95   |   ⏳   |
| LCP            |   TBD   |  TBD   | < 2.5s  |   ⏳   |
| TBT            |   TBD   |  TBD   | < 200ms |   ⏳   |
| CLS            |   TBD   |  TBD   |  < 0.1  |   ⏳   |

> **How to collect:** `npx lhci autorun` with the config at `lighthouserc.js`. Record the median of 3 runs.

### 2. API Performance (k6 Load Tests)

Run `k6 run` against the target environment using the scenarios in `apps/api/test/load/`.

| Endpoint                    | P50 | P95 | P99 | Budget (P95) | Status |
| --------------------------- | :-: | :-: | :-: | :----------: | :----: |
| GET /api/portfolio/sections | TBD | TBD | TBD |   < 200ms    |   ⏳   |
| GET /api/portfolio/projects | TBD | TBD | TBD |   < 200ms    |   ⏳   |
| GET /api/portfolio/blog     | TBD | TBD | TBD |   < 200ms    |   ⏳   |
| POST /api/portfolio/leads   | TBD | TBD | TBD |   < 500ms    |   ⏳   |
| POST /api/admin/auth/login  | TBD | TBD | TBD |   < 500ms    |   ⏳   |
| CRUD /api/admin/projects    | TBD | TBD | TBD |   < 300ms    |   ⏳   |

> **How to collect:** `k6 run --vus 20 --duration 30s test/load/portfolio-scenarios.js`. Run 3 times and take the median.

### 3. Database Performance

Capture from staging database using `EXPLAIN (ANALYZE, BUFFERS)` and `pg_stat_statements` for the top queries.

| Query                    | Execution Time | Rows Scanned | Index Used | Status |
| ------------------------ | :------------: | :----------: | :--------: | :----: |
| Section listing          |      TBD       |     TBD      |    TBD     |   ⏳   |
| Project with images      |      TBD       |     TBD      |    TBD     |   ⏳   |
| Blog with tags           |      TBD       |     TBD      |    TBD     |   ⏳   |
| Vector similarity search |      TBD       |     TBD      |    HNSW    |   ⏳   |

> **How to collect:** Connect to staging DB, run `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` on each query pattern. Record the worst-case execution time from 5 runs.

### 4. Bundle Size

Measure using `@next/bundle-analyzer` or by checking reported sizes in CI build output.

| Asset           | Size (gzipped) | Budget  | Status |
| --------------- | :------------: | :-----: | :----: |
| Homepage JS     |      TBD       | < 300KB |   ⏳   |
| Admin JS        |      TBD       | < 400KB |   ⏳   |
| Blog JS         |      TBD       | < 300KB |   ⏳   |
| Three.js bundle |      TBD       | < 150KB |   ⏳   |
| CSS (global)    |      TBD       | < 50KB  |   ⏳   |

> **How to collect:** Build with `ANALYZE=true npm run build` and inspect the generated `next-analyze` HTML report.

## Historical Trends

| Quarter | LCP | TBT | CLS | API P95 | Bundle Size |
| ------- | :-: | :-: | :-: | :-----: | :---------: |
| Q3 2026 | TBD | TBD | TBD |   TBD   |     TBD     |

_Record the quarter's headline numbers here for trend analysis._

## Cross-References

- `docs/35-quality/performance-budget.md` — Performance budgets and thresholds
- `docs/35-quality/PerformanceArchitecture.md` — Performance architecture overview
- `docs/35-quality/load-test-specification.md` — Load test specification and scenarios
- [../MASTER-INDEX.md](../MASTER-INDEX.md) — Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) — Cross-reference system
