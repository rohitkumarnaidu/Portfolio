# Key Performance Indicators (KPIs)

> **Document:** `KPIs.md` | **Version:** 2.0 | **Last Updated:** July 2026  
> **Status:** ✅ Active | **Owner:** Product Lead | **Review Cadence:** Monthly  
> **Related:** [MetricsStrategy.md](./MetricsStrategy.md) | [SuccessMetrics.md](./SuccessMetrics.md) | `56-SLA-SLO.md`

---

## 1. North Star Metric

**Portfolio Engagement Score** = `Pages per Session × Visitor-to-Lead Conversion Rate`

This single number captures both depth of engagement (are users exploring?) and outcome (are they taking action?). A rising score means the portfolio is both sticky and effective.

- **Current Baseline:** 3.2 pages/session × 1.8% conversion = **5.76**
- **Q3 Target:** 3.5 pages/session × 2.2% conversion = **7.70**
- **Year-End Target:** 4.0 pages/session × 2.5% conversion = **10.00**

## 2. Top 10 KPI Dashboard

| # | KPI | Definition | Current | Target | Data Source | Frequency | Owner |
|---|-----|-----------|---------|--------|-------------|-----------|-------|
| 1 | **Visitor-to-Lead Conversion** | Contact form submissions ÷ unique visitors × 100 | 1.8% | 2.5% | PostHog | Weekly | Product Lead |
| 2 | **AI Chat Engagement** | Avg conversation turns per active AI session | 3.2 | 4.0+ | AI Service analytics | Daily | AI Lead |
| 3 | **System Uptime** | % time all three services (web, api, ai) are operational | 99.95% | 99.99% | Vercel + Sentry | Daily | Engineering Lead |
| 4 | **Deploy Frequency** | Production deployments per week | 8 | 10+ | GitHub Insights | Weekly | Engineering Lead |
| 5 | **Lead Time for Change** | Time from first commit to production | 6h | < 24h | GitHub API | Weekly | Engineering Lead |
| 6 | **Core Web Vitals Pass Rate** | % of pages passing LCP + CLS + INP thresholds | 82% | 95% | Sentry | Weekly | Engineering Lead |
| 7 | **Bounce Rate** | Single-page sessions ÷ total sessions | 34% | < 30% | Vercel Analytics | Weekly | Product Lead |
| 8 | **AI User Satisfaction** | % of AI responses rated helpful/accurate | 76% | 85% | AI Service (feedback) | Monthly | AI Lead |
| 9 | **Resume Downloads / 1K Visitors** | Resume downloads per 1,000 unique visitors | 12 | 20 | PostHog | Monthly | Product Lead |
| 10 | **Content Velocity** | Time to publish a project via admin dashboard | 4min | < 3min | API audit log | Monthly | Engineering Lead |

## 3. KPI Ownership

Every KPI has a named owner responsible for tracking, reporting, and driving improvement:

| Owner | KPIs |
|-------|------|
| **Product Lead** | Visitor-to-Lead Conversion, Bounce Rate, Resume Downloads, Pages/Session, Contact Completion Rate |
| **Engineering Lead** | System Uptime, Deploy Frequency, Lead Time, Core Web Vitals, MTTR, Change Failure Rate |
| **AI Lead** | AI Chat Engagement, AI User Satisfaction, AI Cost per Conversation, Vector Search Latency |
| **Design Lead** | 3D Interaction Rate, Average Session Duration, Feature Adoption Rate |

## 4. Leading vs. Lagging Indicators

### Leading Indicators (predict future outcomes)

These are actionable metrics the team can move day-to-day:

| Leading Indicator | Predicts |
|------------------|----------|
| Deploy frequency | Lead time for change, team velocity |
| Core Web Vitals pass rate | Bounce rate, user satisfaction |
| AI chat turns per session | AI satisfaction score, conversion |
| Feature adoption rate (new features) | Visitor-to-lead conversion |
| Error rate (API) | Uptime, user churn |

### Lagging Indicators (measure past outcomes)

| Lagging Indicator | Reflects |
|------------------|----------|
| Visitor-to-Lead Conversion | Overall product-market fit |
| System Uptime (99.99%) | Infrastructure reliability |
| Monthly Active Visitors | Marketing + SEO effectiveness |
| AI User Satisfaction | AI response quality + model choice |
| Inbound project inquiries | Portfolio effectiveness as a tool |

## 5. KPI Review Schedule

| Frequency | Meeting | Agenda |
|-----------|---------|--------|
| **Daily (standup)** | Engineering standup | Deploy frequency, error rates, incidents |
| **Weekly (Mon)** | Engineering metrics review | DORA metrics, performance, alerts from prior week |
| **Monthly (1st Wed)** | Product & business review | Full KPI dashboard, leading indicators, goal check |
| **Quarterly** | OKR review | North Star progress, KPI target reset, strategic pivots |

## 6. KPI Dashboard Location

| Dashboard | Tool | URL | Updates |
|-----------|------|-----|---------|
| **Executive KPI Dashboard** | PostHog | PostHog dashboard (pinned) | Real-time |
| **Engineering DORA Dashboard** | GitHub Insights | `Insights > Pulse` | Weekly |
| **Performance Dashboard** | Sentry | Sentry Performance | Real-time |
| **AI Cost Dashboard** | Custom (planned Grafana) | TBD | Daily |
| **Traffic & SEO Dashboard** | Vercel Analytics | Vercel dashboard | Real-time |

## 7. KPI Target Setting Process

1. **Baseline**: Collect 4 weeks of data after a stable release
2. **Aspirational target**: Set a stretch goal (2× improvement or industry benchmark)
3. **Quarterly incremental targets**: Break into achievable 3-month milestones
4. **Review**: Monthly check on progress; adjust if data shows targets were unrealistic
5. **Reset**: Every quarter, re-evaluate and set new targets based on actual performance

## 8. KPI Health Scoring

Each KPI is scored monthly:

| Status | Color | Meaning |
|--------|-------|---------|
| On Track | 🟢 Green | Within 10% of target |
| At Risk | 🟡 Yellow | 10–25% below target |
| Critical | 🔴 Red | > 25% below target |

A dashboard with > 2 red KPIs triggers a **KPI Recovery Plan** — a focused sprint to address the underlying issues.

### KPI Recovery Plan Template

When triggered, the recovery plan follows a three-step process: (1) root cause analysis within 48 hours, (2) targeted sprint with defined success criteria and daily check-ins, and (3) 30-day monitoring period with enhanced reporting to ensure sustained improvement.
