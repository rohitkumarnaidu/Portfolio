# Alerting Strategy

## 1. Overview
The Alerting Strategy ensures that the engineering team is notified of critical issues proactively, before they significantly impact users. Our primary goal is to maintain high actionability and minimize "alert fatigue." If an alert fires, it must require human intervention.

## 2. Alerting Philosophy
* **Symptom-based Alerting**: We alert on symptoms that impact the user (e.g., High Error Rate, High Latency) rather than underlying causes (e.g., High CPU), unless the underlying cause guarantees imminent failure.
* **No Noise**: Alerts should not fire for known, transient issues that auto-resolve. Use sustained thresholds (e.g., "Error rate > 5% for 5 minutes").
* **Actionable**: Every alert must be linked to a Runbook detailing how to mitigate the issue.

## 3. Severity Levels & Routing
Alerts are categorized by severity, dictating the routing and response expectations. We use **PagerDuty** for incident routing.

| Severity | Definition | Routing | Response SLA |
| :--- | :--- | :--- | :--- |
| **SEV-1 (Critical)** | System is down, core user journeys are broken, or massive data loss is occurring. | PagerDuty (Phone Call / SMS) to On-Call Engineer. Cross-posted to `#incident-critical` Slack channel. | < 15 minutes (24/7) |
| **SEV-2 (High)** | Severe degradation. Core features are very slow or intermittently failing. | PagerDuty (Push/SMS) to On-Call. Cross-posted to `#incident-high`. | < 30 minutes (Business Hours) |
| **SEV-3 (Medium)** | Non-critical feature is broken, or early warning of saturation. | Slack `#alerts-warning` channel. | Next business day |
| **SEV-4 (Low)** | Informational. Minor bugs, localized issues. | Slack `#alerts-info`, Jira ticket generation. | Triaged weekly |

## 4. Core Alert Definitions

### 4.1 Web & API Layer (Next.js & NestJS)
* **High HTTP 5xx Rate (SEV-1)**: > 5% of API requests return 500-599 over 5 minutes.
* **High Latency (SEV-2)**: p90 API response time > 2000ms for 5 minutes.
* **SSL Certificate Expiry (SEV-2)**: SSL certificate expires in < 14 days.
* **Sentry Spike (SEV-3)**: Spike in unhandled exceptions exceeding baseline by 200%.

### 4.2 Database (Supabase / PostgreSQL)
* **Database Down (SEV-1)**: Cannot connect to Supabase for 2 minutes.
* **Connection Pool Exhaustion (SEV-2)**: Active connections > 90% of max capacity for 5 minutes.
* **Disk Space Low (SEV-2)**: Database disk usage > 85%.
* **High CPU Utilization (SEV-3)**: Database CPU > 80% for 15 minutes.

### 4.3 AI Service (FastAPI)
* **AI Service Down (SEV-1)**: Health check endpoint fails for 3 minutes.
* **LLM Provider API Failure (SEV-2)**: OpenAI/Anthropic API returns 5xx or rate limit (429) errors for > 10% of requests over 5 minutes.
* **High Token Cost Anomaly (SEV-3)**: Token consumption spikes 300% above historical average (potential abuse).

## 5. Alert Configuration (Datadog Monitors)
All alerts are defined as code using Terraform (Infrastructure as Code) to ensure consistency and version control.

Example Datadog Monitor definition logic:
```text
Type: Metric Alert
Query: avg(last_5m):sum:http.requests.errors{env:production} / sum:http.requests.total{env:production} > 0.05
Message: 
  @pagerduty-portfolio-api
  **Incident**: API Error Rate has exceeded 5% for the last 5 minutes.
  **Impact**: Users may be unable to load data or submit forms.
  **Runbook**: [Link to Runbooks.md#api-high-error-rate]
```

## 6. Continuous Improvement
* **Alert Tuning**: On-call handoffs must include a review of noisy alerts from the past week. Noisy alerts must be tuned or muted.
* **Post-Mortem Action Items**: Every incident post-mortem must result in at least one action item to improve alerting (e.g., catching the issue sooner).
