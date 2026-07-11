# Monitoring Dashboards — Layout & Alert Definitions

> **Document:** `14-observability/MONITORING-DASHBOARDS.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** ✅ Active | **Owner:** DevOps Lead | **Related:** Sentry, PostHog, Better Uptime, Grafana

---

## Dashboard 1: Service Health

**Tools:** Better Uptime + Sentry | **Refresh:** 60s | **Filters:** Environment, Service, Time range

| Panel | Metric | Source | Alert Trigger |
|-------|--------|--------|---------------|
| Uptime status | Current status per service (web/api/ai/db) | Better Uptime | Any service down > 2 min |
| Error rate (5 min) | % of requests returning 5xx | Sentry | > 1% for SEV-2 |
| Response time (p95) | Latest 5-min p95 per service | Sentry | > 500ms API, > 2s AI |
| Health check status | Liveness + readiness per service | API `/health` | Failing check > 3 retries |
| Certificate expiry | Days until TLS cert renewal | Better Uptime | < 30 days warning, < 7 days alert |

## Dashboard 2: API Performance

**Tools:** Sentry Performance | **Refresh:** 30s | **Filters:** Endpoint, Status code, Time range

| Panel | Metric | Source | Alert Trigger |
|-------|--------|--------|---------------|
| Endpoint latency heatmap | p50/p95/p99 per endpoint (last 24h) | Sentry | Any endpoint p95 > 1s |
| Error breakdown | Count by status code (4xx vs 5xx) | Sentry | 5xx spike > 5x baseline |
| Rate limit hits | Count of 429 responses per route | NestJS Throttler | > 100/min on any route |
| Slowest endpoints | Top 10 by p95 sorted descending | Sentry | New endpoint in top 3 |
| Prisma query performance | DB query latency per operation | Sentry spans | Any query > 100ms p95 |

## Dashboard 3: Infrastructure

**Tools:** Railway Metrics + Vercel Analytics | **Refresh:** 30s | **Filters:** Service, Host

| Panel | Metric | Source | Alert Trigger |
|-------|--------|--------|---------------|
| CPU (Docker containers) | % utilization per container | Railway | > 80% sustained for 10 min |
| Memory (Docker containers) | MB used vs limit | Railway | > 85% limit sustained |
| Database connections | Active connections vs max | Supabase Metrics | > 90% pool utilization |
| Redis memory | Used vs max | Upstash | > 80% used |
| Disk usage (DB) | GB used vs available | Supabase Metrics | > 85% disk used |

## Dashboard 4: AI Service

**Tools:** Sentry + Custom FastAPI metrics | **Refresh:** 30s | **Filters:** Model, User, Time range

| Panel | Metric | Source | Alert Trigger |
|-------|--------|--------|---------------|
| Cost tracking | $ spent today/this week/this month | Custom metric | Daily budget > 80% |
| Usage volume | Total requests + tokens (last 24h) | Custom metric | > 3x daily average |
| Latency breakdown | TTFB, generation time, total | Sentry spans | TTFB > 1s p95 |
| Model distribution | % of requests per model (GPT-4o, Claude, etc.) | Custom metric | Any model 0% (failover active) |
| Rate limit status | Current rate limit remaining | FastAPI middleware | < 10% remaining |
| Embedding queue depth | Pending embedding jobs | BullMQ | > 1000 pending |

## Dashboard 5: Business Metrics

**Tools:** PostHog | **Refresh:** 5 min | **Filters:** Date range, Source, Page

| Panel | Metric | Source | Alert Trigger |
|-------|--------|--------|---------------|
| Page views | Daily unique + total page views | PostHog | Drop > 50% day-over-day |
| Visitor sources | Traffic by referrer/UTM | PostHog | — |
| Contact form conversions | Submission rate by page | PostHog funnel | Conversion rate < 40% |
| Lead conversion rate | Form submissions → leads created | PostHog + API | Rate < 60% |
| AI chat usage | Chat sessions initiated per day | PostHog | — |
| Project click-through | Clicks from grid to detail page | PostHog | CTR < 20% |

---

## Alert Routing

| Severity | Channel | Escalation |
|----------|---------|------------|
| Critical | Telegram + SMS + Email | On-call → Engineering Lead → CTO (15 min) |
| Warning | Telegram | On-call → Team Lead (1 hour) |
| Info | Slack #ops-monitoring | Self-service |

## Dashboard Access

- **Grafana:** `https://grafana.portfolio.dev` (admin/editor roles)
- **Sentry:** `https://sentry.io/organizations/portfolio` (dev team)
- **PostHog:** `https://app.posthog.com/projects/portfolio` (product team)
- **Better Uptime:** `https://betteruptime.com/teams/portfolio` (ops team)

---

*Document Version: 1.0 | Last Updated: July 2026*
