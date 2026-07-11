# Performance Budget

## Overview
Performance budgets define the maximum allowable limits for key performance metrics. These budgets are enforced via CI (Lighthouse CI), runtime monitoring (Sentry), and manual review.

## Core Web Vitals Budgets

| Metric | Target | Good | Needs Improvement | Poor |
|--------|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | < 2.5s | < 2.5s | 2.5s - 4.0s | > 4.0s |
| FID (First Input Delay) | < 100ms | < 100ms | 100ms - 300ms | > 300ms |
| CLS (Cumulative Layout Shift) | < 0.1 | < 0.1 | 0.1 - 0.25 | > 0.25 |
| INP (Interaction to Next Paint) | < 200ms | < 200ms | 200ms - 500ms | > 500ms |
| TTFB (Time to First Byte) | < 800ms | < 800ms | 800ms - 1.8s | > 1.8s |
| FCP (First Contentful Paint) | < 1.8s | < 1.8s | 1.8s - 3.0s | > 3.0s |

## API Performance Budgets

| Endpoint Type | P50 | P95 | P99 | Error Rate |
|--------------|-----|-----|-----|------------|
| Portfolio (public) | < 50ms | < 200ms | < 500ms | < 0.1% |
| Admin (authenticated) | < 100ms | < 300ms | < 1000ms | < 0.5% |
| AI Chat (streaming) | < 500ms TTFT | < 1000ms TTFT | < 2000ms TTFT | < 1.0% |
| Cache hit ratio | > 90% | — | — | — |

## Asset Size Budgets

| Asset Type | Budget | Notes |
|-----------|--------|-------|
| Total page JS | < 300KB (gzipped) | Code-split per route |
| Total page CSS | < 50KB (gzipped) | Tailwind purged |
| Fonts | < 30KB total | Self-hosted, subset |
| Images (hero) | < 200KB | WebP format |
| Images (thumbnail) | < 50KB | WebP format |
| 3D assets (GLTF) | < 1MB per model | DRACO compressed |
| First load (total) | < 500KB | Critical path only |

## Motion Budgets

| Metric | Budget |
|--------|--------|
| Animation library size | < 40KB gzipped |
| Frame rate | 60fps (target), 30fps (minimum) |
| Long tasks | < 50ms |
| Total blocking time | < 200ms |
| Layout thrashing | 0 occurrences |

## Enforcement

### CI/CD Enforcement (Lighthouse CI)
```bash
# Run Lighthouse CI in CI pipeline
npx lhci autorun --config=./lighthouserc.js
```

Failing budgets block PR merges:
- LCP > 3.0s → ❌ Block
- TBT > 300ms → ⚠️ Warning
- CLS > 0.15 → ❌ Block
- Any audit score < 90 → ⚠️ Review

### Runtime Enforcement (Sentry)
- Performance degradation alerts at P95 > budget × 2
- Error budget alerts at 80% consumption

### Override Process
If a PR intentionally exceeds a budget:
1. Document the reason in the PR description
2. Get engineering lead approval
3. Create a follow-up issue to optimize
4. Set a deadline for resolution

## Monitoring
Budgets are reviewed monthly during performance review. Historical trends tracked in Grafana dashboard.

## Related Documents
- `PerformanceArchitecture.md` — Full performance architecture
- `load-test-specification.md` — Load testing scenarios
- `error-budget-policy.md` — Error budget management
