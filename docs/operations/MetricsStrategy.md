# Metrics Strategy

> **Document:** `MetricsStrategy.md` | **Version:** 1.0 | **Last Updated:** July 2026  
> **Status:** ✅ Active | **Owner:** Engineering Lead | **Review Cadence:** Quarterly  
> **Related:** [KPIs.md](./KPIs.md) | [SuccessMetrics.md](./SuccessMetrics.md) | `56-SLA-SLO.md`

---

## 1. Overview

The Metrics Strategy defines what we measure, how we collect it, how we name it, and where we display it. Every metric serves a specific purpose — drive decisions, detect anomalies, or track progress toward goals. We follow the **measure-what-matters** philosophy: avoid vanity metrics, favour actionable signals.

## 2. Metric Categories

### 2.1 Business Metrics

These measure the health of the portfolio as a product and business tool.

| Metric | Definition | Tool | Frequency |
|--------|-----------|------|-----------|
| `biz.unique_visitors` | Distinct visitors per day/week/month | Vercel Analytics | Daily |
| `biz.page_views` | Total page views | Vercel Analytics | Daily |
| `biz.visitor_to_lead_rate` | Contact form submissions ÷ unique visitors | PostHog | Weekly |
| `biz.bounce_rate` | Single-page sessions ÷ total sessions | Vercel Analytics | Daily |
| `biz.avg_session_duration` | Mean time spent on site | PostHog | Daily |
| `biz.sessions_per_visitor` | Repeat visit ratio | PostHog | Weekly |
| `biz.traffic_source_breakdown` | Referral / organic / direct / social split | Vercel Analytics | Weekly |

### 2.2 Product Metrics

These track how users interact with portfolio features.

| Metric | Definition | Tool | Frequency |
|--------|-----------|------|-----------|
| `product.feature_adoption_rate` | % of visitors who interact with each section | PostHog | Weekly |
| `product.ai_chat_usage` | Active AI chat sessions per day | PostHog | Daily |
| `product.ai_chat_turns_per_session` | Avg conversation depth | Custom (AI service) | Daily |
| `product.project_detail_views` | Clicks on individual project cards | PostHog | Daily |
| `product.resume_downloads` | Resume PDF download count | PostHog | Weekly |
| `product.contact_form_completion_rate` | Form starts → submissions funnel | PostHog | Weekly |
| `product.three_d_interactions` | Users who orbit/zoom 3D scenes | PostHog | Weekly |
| `product.admin_content_velocity` | Time to publish a new project via admin | Custom (API) | Monthly |

### 2.3 Engineering (DORA) Metrics

We track the four DORA metrics to measure delivery performance.

| Metric | Definition | Tool | Target |
|--------|-----------|------|--------|
| `eng.deploy_frequency` | Number of deployments to production per week | Vercel / GitHub | Daily (multiple) |
| `eng.lead_time_for_change` | Time from first commit to production deploy | GitHub API | < 24 hours |
| `eng.mean_time_to_recover` | Time to resolve a production incident | Sentry / PagerDuty | < 1 hour |
| `eng.change_failure_rate` | % of deployments causing a failure | GitHub + Sentry | < 5% |

### 2.4 Performance Metrics

These measure frontend and backend responsiveness.

| Metric | Definition | Tool | Target |
|--------|-----------|------|--------|
| `perf.lcp` | Largest Contentful Paint | Sentry / Vercel Analytics | < 2.5s |
| `perf.fid` | First Input Delay (or INP in 2026) | Sentry | < 100ms |
| `perf.cls` | Cumulative Layout Shift | Sentry | < 0.1 |
| `perf.ttfb` | Time to First Byte | Vercel Analytics | < 200ms |
| `perf.api_p95_latency` | 95th percentile API response time | Sentry / APM | < 200ms |
| `perf.ai_ttft` | Time to First Token for AI responses | Custom (AI service) | < 1.0s |
| `perf.vector_search_p95` | 95th percentile pgvector search time | Custom (AI service) | < 150ms |
| `perf.three_d_fps` | React Three Fiber frame rate | Custom (Web) | > 30 FPS |

### 2.5 Security Metrics

| Metric | Definition | Tool | Target |
|--------|-----------|------|--------|
| `sec.vulnerability_count` | Open dependabot alerts by severity | GitHub Dependabot | 0 critical |
| `sec.time_to_remediate` | Days to fix a reported vuln | GitHub Advisory | < 7 days |
| `sec.failed_auth_attempts` | Rate of failed admin login attempts | API logs / Sentry | < 5/min |
| `sec.api_throttle_events` | Requests blocked by rate limiter | NestJS Throttler | N/A (tracking) |

### 2.6 AI / Cost Metrics

| Metric | Definition | Tool | Target |
|--------|-----------|------|--------|
| `ai.cost_per_conversation` | Average LLM cost per complete chat session | Custom (cost_controller) | < $0.01 |
| `ai.token_usage_per_request` | Tokens consumed per API call | LangChain callbacks | N/A (tracking) |
| `ai.user_satisfaction_score` | % of AI responses rated helpful | Custom (feedback) | > 80% |
| `ai.cost_per_token` | Effective $/1K tokens per model | Custom (cost_controller) | N/A (tracking) |
| `ai.model_usage_split` | % of requests routed to each model | Custom (model_router) | Monthly |

## 3. Naming Convention

All metrics follow a strict naming convention:

**Format:** `domain.metric_name` (snake_case, prefixed by domain)

**Domains:** `biz`, `product`, `eng`, `perf`, `sec`, `ai`

**Examples:**
- `biz.unique_visitors_daily`
- `product.feature_adoption_rate`
- `eng.deploy_frequency`
- `perf.lcp`
- `sec.vulnerability_count`
- `ai.cost_per_conversation`

Tags are appended as dimensions (not part of the metric name):
- `env`: `production`, `staging`
- `service`: `web`, `api`, `ai`
- `version`: Git commit hash
- `region`: Deployment region

## 4. Collection Methods

| Data Type | Collection Tool | Integration |
|-----------|----------------|-------------|
| Web analytics | Vercel Analytics | Built-in, no code |
| Product analytics | PostHog | `posthog-js` on frontend |
| Error tracking | Sentry | `@sentry/nextjs`, `@sentry/node` |
| Performance (Web Vitals) | Sentry + Vercel | Automatic instrumentation |
| API performance | NestJS interceptor + Sentry APM | Custom `MetricsInterceptor` |
| AI cost tracking | Custom `cost_controller.py` | Per-request callback |
| DORA metrics | GitHub API + manual aggregation | `gh` CLI + script |
| Business metrics | PostHog funnels | Dashboard aggregation |
| 3D performance | Custom React hook | `useFrame` FPS counter |
| Admin efficiency | Custom API audit log | Timestamps on content operations |

## 5. Dashboard Locations

| Dashboard | Tool | Purpose | Audience |
|-----------|------|---------|----------|
| **Executive Overview** | Vercel Analytics | Traffic, uptime, top-level KPIs | All team |
| **Engineering DORA** | GitHub Insights | Deploy frequency, lead time, MTTR | Engineering |
| **Product Analytics** | PostHog | Funnels, feature adoption, session replays | Product |
| **Performance** | Sentry Performance | Core Web Vitals, API latency | Engineering |
| **AI Cost & Quality** | Custom (Grafana) | Token usage, cost, user satisfaction | AI / FinOps |
| **Security** | GitHub Security | Dependabot alerts, advisory status | Engineering Lead |

## 6. Review Cadence

| Cadence | Focus | Attendees | Output |
|---------|-------|-----------|--------|
| **Weekly (Mon)** | Engineering metrics: DORA, performance, errors | Engineering team | Action items for bottlenecks |
| **Monthly (1st Wed)** | Product metrics: adoption, funnels, engagement | Product + Engineering | Feature roadmap adjustments |
| **Quarterly** | Business metrics: visitors, leads, conversion | All team | OKR progress report, goal reset |

## 7. Alerting Thresholds

Metrics that trigger automated alerts when breached:

| Metric | Warning | Critical | Channel |
|--------|---------|----------|---------|
| Error rate (API) | > 0.5% | > 1% | Slack #alerts |
| p95 API latency | > 500ms | > 1s | Slack #alerts |
| Uptime (any service) | < 99.9% | < 99.5% | PagerDuty |
| Vulnerability (critical) | 1 open | > 1 open | GitHub notification |
| AI cost per conversation | > $0.02 | > $0.05 | Slack #alerts |
| deploy failure rate | > 5% | > 10% | Slack #deploys |

## 8. Tooling Ownership

| Tool | Owner | Admin Access | Budget |
|------|-------|-------------|--------|
| Vercel Analytics | Engineering Lead | All engineers | Included in Vercel |
| PostHog | Product Lead | Engineering + Product | Free tier + $0–$20/mo |
| Sentry | Engineering Lead | All engineers | Free tier |
| GitHub Insights | Engineering Lead | All engineers | Included in GitHub |
| Custom dashboards | Engineering Lead | Engineering | Grafana (self-hosted) |
