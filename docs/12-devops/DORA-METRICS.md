# DORA Metrics

## Overview

Tracking the four key DevOps Research and Assessment (DORA) metrics to measure engineering performance. These metrics are defined in the book "Accelerate" by Nicole Forsgren, Jez Humble, and Gene Kim.

## The Four Key Metrics

### Baseline Targets

| Metric                       |   Elite   |      High      |      Medium      |        Low        | Current Target |
| ---------------------------- | :-------: | :------------: | :--------------: | :---------------: | :------------: |
| Deployment Frequency         | On-demand | Daily - Weekly | Weekly - Monthly | Less than monthly |     Daily      |
| Lead Time for Changes        | < 1 hour  | 1 day - 1 week | 1 week - 1 month |     > 1 month     |    < 1 week    |
| Mean Time to Recovery (MTTR) | < 1 hour  |    < 1 day     |     < 1 day      |     < 1 week      |   < 2 hours    |
| Change Failure Rate          |   0-5%    |     5-10%      |      10-20%      |       > 20%       |     < 10%      |

### Current State

| Metric                |       Current Value       |  Target   | Elite Benchmark |  Status  |
| --------------------- | :-----------------------: | :-------: | :-------------: | :------: |
| Deployment Frequency  | Per-merge (on CI success) |   Daily   |    On-demand    | Ã°Å¸Å¸Â¢ |
| Lead Time for Changes |  < 1 hour (CI pipeline)   | < 1 week  |    < 1 hour     | Ã°Å¸Å¸Â¢ |
| MTTR                  |  TBD (no incidents yet)   | < 2 hours |    < 1 hour     | Ã°Å¸Å¸Â¡ |
| Change Failure Rate   |   TBD (no failures yet)   |   < 10%   |      0-5%       | Ã°Å¸Å¸Â¡ |

### How to Measure

**Deployment Frequency:**

- Count deployments to production per time period
- Tool: Vercel deployment log, GitHub deployments API

**Lead Time for Changes:**

- Time from commit Ã¢â€ â€™ production deployment
- Tool: GitHub + Vercel integrations

**MTTR:**

- Time from incident detection Ã¢â€ â€™ full recovery
- Tool: Incident management system, post-incident reviews

**Change Failure Rate:**

- Percentage of deployments causing a failure
- Tool: Deployment tracking, Sentry error rate monitoring

## Measurement Setup

### GitHub Deployments API

Enable deployment tracking in GitHub repository settings.

### Automated Collection

```bash
# Deployment frequency (last 30 days)
gh run list --workflow ci.yml --branch main --limit 50 --json conclusion,createdAt

# Lead time
# Track commit -> deploy time via GitHub API
```

## Review Cadence

- **Weekly:** Quick check during standup
- **Monthly:** Full metric review with team
- **Quarterly:** Trend analysis and improvement planning

## Improvement Targets

| Quarter | Deployment Frequency | Lead Time |   MTTR    | Change Failure Rate |
| ------- | :------------------: | :-------: | :-------: | :-----------------: |
| Q3 2026 |        Daily         |  < 1 day  | < 4 hours |        < 15%        |
| Q4 2026 |    Multiple daily    | < 4 hours | < 2 hours |        < 10%        |
| Q1 2027 |      On-demand       | < 1 hour  | < 1 hour  |        < 5%         |

## Cross-References

- `docs/21-operations/56-SLA-SLO.md` Ã¢â‚¬â€ Service level objectives
- `docs/21-operations/25-CICD.md` Ã¢â‚¬â€ CI/CD pipeline
- `docs/21-operations/DevOpsArchitecture.md` Ã¢â‚¬â€ DevOps architecture

---

## Diagrams

### DORA Metrics Dashboard

```mermaid
graph
    subgraph DORA["DORA Metrics Dashboard"]
        DF["Deploy Frequency<br/>Current: Per-merge<br/>Target: On-demand"]
        LT["Lead Time for Change<br/>Current: < 1 hour<br/>Target: < 1 hour"]
        MTTR["MTTR<br/>Current: TBD<br/>Target: < 2 hours"]
        CFR["Change Failure Rate<br/>Current: TBD<br/>Target: < 10%"]
    end

    DF --> Status1["Status: Ã°Å¸Å¸Â¢ Elite"]
    LT --> Status2["Status: Ã°Å¸Å¸Â¢ Elite"]
    MTTR --> Status3["Status: Ã°Å¸Å¸Â¡ Unknown"]
    CFR --> Status4["Status: Ã°Å¸Å¸Â¡ Unknown"]

    subgraph Targets["Quarterly Targets"]
        Q3["Q3 2026<br/>Daily deploys<br/>MTTR < 4h"]
        Q4["Q4 2026<br/>Multi-daily<br/>MTTR < 2h"]
        Q1["Q1 2027<br/>On-demand<br/>MTTR < 1h"]
    end
```

### DORA Four Quadrants

```mermaid
quadrantChart
    title DORA Performance Classification
    x-axis "Low Performance" --> "High Performance"
    y-axis "High Failure Rate" --> "Low Failure Rate"
    quadrant-1 "Elite"
    quadrant-2 "High"
    quadrant-3 "Medium"
    quadrant-4 "Low"
    Deploy Frequency: [0.85, 0.7]
    Lead Time: [0.8, 0.65]
    MTTR: [0.45, 0.5]
    Change Failure Rate: [0.4, 0.45]
```

## Cross-References

- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system
