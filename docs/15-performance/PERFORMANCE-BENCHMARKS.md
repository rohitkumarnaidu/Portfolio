# Performance Benchmarks

## Overview
This document tracks performance benchmarks for the Portfolio platform. Benchmarks are measured and recorded each quarter to track performance trends.

> **Note:** Initial benchmarks have not been collected yet. This document serves as the template for benchmark collection.

## Benchmark Methodology

### Tools
- **Web performance:** Lighthouse CI (desktop + mobile)
- **API performance:** k6 load testing
- **Database performance:** `EXPLAIN ANALYZE` + pg_stat_statements
- **Bundle analysis:** `@next/bundle-analyzer`
- **3D performance:** Three.js stats panel

### Collection Process
1. Run benchmarks in staging environment
2. Record results in this document
3. Compare against previous quarter
4. Investigate regressions
5. Update performance budget if needed

## Q3 2026 Baseline

### Web Performance (Lighthouse)

| Metric | Desktop | Mobile | Budget | Status |
|--------|:-------:|:------:|:------:|:------:|
| Performance | TBD | TBD | > 90 | ⏳ |
| Accessibility | TBD | TBD | > 95 | ⏳ |
| Best Practices | TBD | TBD | > 95 | ⏳ |
| SEO | TBD | TBD | > 95 | ⏳ |
| LCP | TBD | TBD | < 2.5s | ⏳ |
| TBT | TBD | TBD | < 200ms | ⏳ |
| CLS | TBD | TBD | < 0.1 | ⏳ |

### API Performance

| Endpoint | P50 | P95 | P99 | Budget (P95) | Status |
|----------|:---:|:---:|:---:|:------------:|:------:|
| GET /api/portfolio/sections | TBD | TBD | TBD | < 200ms | ⏳ |
| GET /api/portfolio/projects | TBD | TBD | TBD | < 200ms | ⏳ |
| GET /api/portfolio/blog | TBD | TBD | TBD | < 200ms | ⏳ |
| POST /api/portfolio/leads | TBD | TBD | TBD | < 500ms | ⏳ |
| POST /api/admin/auth/login | TBD | TBD | TBD | < 500ms | ⏳ |
| CRUD /api/admin/projects | TBD | TBD | TBD | < 300ms | ⏳ |

### Database Performance

| Query | Execution Time | Rows Scanned | Index Used | Status |
|-------|:-------------:|:------------:|:----------:|:------:|
| Section listing | TBD | TBD | TBD | ⏳ |
| Project with images | TBD | TBD | TBD | ⏳ |
| Blog with tags | TBD | TBD | TBD | ⏳ |
| Vector similarity search | TBD | TBD | HNSW | ⏳ |

### Bundle Size

| Asset | Size (gzipped) | Budget | Status |
|-------|:--------------:|:------:|:------:|
| Homepage JS | TBD | < 300KB | ⏳ |
| Admin JS | TBD | < 400KB | ⏳ |
| Blog JS | TBD | < 300KB | ⏳ |
| Three.js bundle | TBD | < 150KB | ⏳ |
| CSS (global) | TBD | < 50KB | ⏳ |

## Historical Trends

| Quarter | LCP | TBT | CLS | API P95 | Bundle Size |
|---------|:---:|:---:|:---:|:-------:|:-----------:|
| Q3 2026 | TBD | TBD | TBD | TBD | TBD |

*Benchmarks will be tracked starting Q3 2026 after initial load testing.*

## Related Documents
- `docs/quality/performance-budget.md` — Performance budgets
- `docs/quality/PerformanceArchitecture.md` — Performance architecture
- `docs/quality/load-test-specification.md` — Load test scenarios
