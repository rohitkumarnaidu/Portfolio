# Alerting Strategy

> **Document:** `AlertingStrategy.md` | **Version:** 2.0 | **Last Updated:** July 2026
> **Status:** ✅ Active | **Owner:** DevOps Lead

## 1. Overview

The Alerting Strategy ensures that the engineering team is notified of critical issues proactively, before they significantly impact users. Our primary goal is to maintain high actionability and minimize "alert fatigue." If an alert fires, it must require human intervention.

## 2. Alerting Philosophy

- **Symptom-based Alerting:** We alert on symptoms that impact the user (e.g., High Error Rate, High Latency) rather than underlying causes (e.g., High CPU), unless the underlying cause guarantees imminent failure.
- **No Noise:** Alerts should not fire for known, transient issues that auto-resolve. Use sustained thresholds (e.g., "Error rate > 5% for 5 minutes").
- **Actionable:** Every alert must be linked to a Runbook detailing how to mitigate the issue.

## 3. Alert Sources

### 3.1 Application Monitoring

- **Sentry:** Error tracking and performance monitoring for both Next.js (web) and NestJS (api).
- **Sentry Spike Detection:** Automated detection of error rate spikes exceeding baseline by 200%.
- **Sentry Performance:** Traces for slow transactions, slow API endpoints, and high query times.

### 3.2 Infrastructure Monitoring

- **Vercel Uptime:** Monitors deployment status and application availability via Vercel's built-in monitoring.
- **Custom Health Checks:** Each service exposes a `/health` endpoint. External uptime monitor pings every 60 seconds.
  - Web: `https://portfolio.dev/health`
  - API: `https://api.portfolio.dev/health`
  - AI: `https://ai.portfolio.dev/health`

### 3.3 Database Monitoring

- **Supabase Dashboard:** Built-in monitoring for connection pool usage, CPU, disk, and memory.
- **Custom Metrics:** Slow query log, connection pool saturation, replication lag.

### 3.4 Log-Based Alerts

- Structured logs shipped to a centralized logging service (Papertrail/Datadog).
- Alerts configured on log patterns: "OutOfMemoryError", "Connection refused", "Rate limit exceeded".

## 4. Alert Severity Levels

| Severity             | Definition                                 | Examples                                             | Response SLA            |
| -------------------- | ------------------------------------------ | ---------------------------------------------------- | ----------------------- |
| **SEV-1 (Critical)** | System down, data loss, security breach    | Site unreachable, database down, data corruption     | 15 min (24/7)           |
| **SEV-2 (High)**     | Severe degradation, core feature broken    | p95 latency > 2s, error rate > 5%, auth broken       | 30 min (business hours) |
| **SEV-3 (Medium)**   | Non-critical feature broken, early warning | Error rate > 1%, high CPU, single endpoint degraded  | Next business day       |
| **SEV-4 (Info)**     | Informational, minor issues                | Deployment notification, config change, cert renewal | Weekly triage           |

## 5. Notification Channels & Routing

| Severity  | Primary Channel       | Secondary Channel   | Escalation             |
| --------- | --------------------- | ------------------- | ---------------------- |
| **SEV-1** | PagerDuty (phone/SMS) | Slack #ops-critical | Manager after 15 min   |
| **SEV-2** | Slack #ops-alerts     | Email (on-call)     | Tech lead after 1 hour |
| **SEV-3** | Slack #ops-warnings   | Email digest        | Weekly review          |
| **SEV-4** | Email digest          | Slack #ops-info     | N/A                    |

### 5.1 Slack Channel Descriptions

- **#ops-critical:** SEV-1 incidents only. High urgency. Mentions `@on-call`. All team members should have notifications enabled.
- **#ops-alerts:** SEV-2 and SEV-3 alerts. Automated monitoring results. Team members review daily.
- **#ops-warnings:** SEV-3 warnings and early indicators. Non-urgent.
- **#ops-info:** SEV-4 deployment notifications, configuration changes, certificate expiry warnings.

### 5.2 Email Routing

- SEV-2+ alerts sent to on-call engineer's email.
- SEV-3+ alerts sent to engineering team mailing list.
- Weekly digest of all alerts sent every Monday.

## 6. On-Call Rotation

### 6.1 Schedule

- **Primary on-call:** 1 engineer, 1-week rotation (Mon to Mon).
- **Secondary on-call:** 1 engineer (backup if primary does not respond).
- **Coverage:** 24/7 for SEV-1. Business hours (9am-6pm ET) for SEV-2.
- **Rotation:** Managed via PagerDuty schedule. Rotates every Monday at 9am ET.

### 6.2 Responsibilities

- Acknowledge SEV-1/SEV-2 alerts within SLA.
- Triage and declare incidents in Slack.
- Execute runbook steps or escalate.
- Record incident timeline for post-mortem.
- Review and tune noisy alerts during handoff.

### 6.3 Handoff Process

- Weekly handoff meeting (Monday, 15 min).
- Review alert history from past week.
- Document ongoing incidents and open action items.
- Transfer PagerDuty rotation.

## 7. Core Alert Definitions

### 7.1 Web & API Layer (Next.js & NestJS)

- **High HTTP 5xx Rate (SEV-1):** > 5% of API requests return 500-599 over 5 minutes.
- **High Latency (SEV-2):** p90 API response time > 2000ms for 5 minutes.
- **SSL Certificate Expiry (SEV-2):** SSL expires in < 14 days.
- **Sentry Spike (SEV-3):** Spike in unhandled exceptions exceeding baseline by 200%.

### 7.2 Database (Supabase / PostgreSQL)

- **Database Down (SEV-1):** Cannot connect to Supabase for 2 minutes.
- **Connection Pool Exhaustion (SEV-2):** Active connections > 90% of max capacity for 5 minutes.
- **Disk Space Low (SEV-2):** Database disk usage > 85%.
- **High CPU Utilization (SEV-3):** Database CPU > 80% for 15 minutes.

### 7.3 AI Service (FastAPI)

- **AI Service Down (SEV-1):** Health check endpoint fails for 3 minutes.
- **LLM Provider API Failure (SEV-2):** OpenAI/Anthropic API returns 5xx or rate limit (429) errors for > 10% of requests over 5 minutes.
- **High Token Cost Anomaly (SEV-3):** Token consumption spikes 300% above historical average (potential abuse).

## 8. Alert Fatigue Prevention

### 8.1 Grouping & Throttling

- Alerts are grouped by source and type. Identical alerts are suppressed for 30 minutes after firing.
- Maintenance windows suppress alerts during planned deployments.

### 8.2 Thresholds & Tuning

- All thresholds start conservative and are tuned weekly during on-call handoff.
- Alerts that fire but require no action are flagged for threshold adjustment.
- Noisy alerts are muted within 1 week of identification.

### 8.3 Maintenance Mode

- During scheduled deployments, set maintenance window in PagerDuty to suppress expected alerts.
- Maximum maintenance window: 4 hours. Auto-expires.

## 9. Runbook Integration

Every alert MUST have a corresponding runbook in `docs/runbooks/`. Each runbook includes:

- **Summary:** What the alert means and why it fires.
- **Initial Diagnosis:** Commands and dashboards to check first.
- **Mitigation Steps:** Step-by-step instructions to resolve.
- **Escalation Path:** Who to contact if mitigation fails.
- **Post-Mortem Template:** Link to create a post-incident review.

### 9.1 Required Runbooks

- `api-high-error-rate.md` — Steps to diagnose and mitigate API 5xx spikes.
- `database-connection-pool.md` — How to identify and clear stuck connections.
- `ai-service-down.md` — LLM provider failover and health check recovery.
- `deployment-rollback.md` — How to rollback a failed deployment on Vercel.
- `ssl-certificate-expiry.md` — Certificate renewal process.

## 10. Continuous Improvement

- **Alert Tuning:** On-call handoffs must include a review of noisy alerts from the past week. Noisy alerts must be tuned or muted.
- **Post-Mortem Action Items:** Every incident post-mortem must result in at least one action item to improve alerting.
- **Quarterly Review:** Full review of all alert definitions, thresholds, and routing rules.
