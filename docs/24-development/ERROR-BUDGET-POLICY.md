# Error Budget Policy

## Overview

Error budgets measure the acceptable level of unreliability over a defined period. They bridge the gap between reliability and feature velocity.

## Error Budget Calculation

### Monthly Budget

```
Error Budget = (1 - SLO) × Total Monthly Time
```

| SLO   | Monthly Budget | Weekly Budget |
| ----- | -------------- | ------------- |
| 99.9% | 43m 12s        | 10m 4s        |
| 99.5% | 3h 35m 48s     | 50m 54s       |
| 99.0% | 7h 11m 36s     | 1h 41m 46s    |

### Current SLO Targets

| Service       | SLO   | Monthly Budget | Current Burn Rate |
| ------------- | ----- | -------------- | ----------------- |
| Web (Next.js) | 99.9% | 43 min         | TBD               |
| API (NestJS)  | 99.5% | 3h 36m         | TBD               |
| AI (FastAPI)  | 99.0% | 7h 12m         | TBD               |
| Database      | 99.9% | 43 min         | TBD               |

## Budget Consumption

### Tracking

- Error budget consumed = (time in degraded/failed state / total time) × 100%
- Monitor via: Sentry, Better Stack, custom dashboard

### Alert Thresholds

| Threshold     | Action                      |
| ------------- | --------------------------- |
| 50% consumed  | Team review                 |
| 80% consumed  | Freeze feature releases     |
| 100% consumed | All-hands incident response |

## Governance

### When Budget is Exhausted

1. Feature releases stop immediately
2. On-call investigates root causes
3. Engineering sprint focuses on reliability
4. SLO review and adjustment

### Budget Refill

- Budget resets at the beginning of each month
- Unused budget does NOT roll over

## Trade-offs

- Higher SLO → more restrictive, slower feature velocity
- Lower SLO → more flexibility, potential reliability issues
- Error budget policy is reviewed quarterly

## Cross-References

- [MASTER-INDEX.md](../MASTER-INDEX.md) — Documentation master index
- [CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) — Cross-reference system
