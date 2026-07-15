# Incident Response — Compiled Runbook (Single Source of Truth)

> **Document:** `31-playbooks/INCIDENT-RESPONSE-COMPILED.md` | **Version:** 2.0 | **Last Updated:** July 2026
> **Status:** ✅ Active | **Owner:** DevOps Lead | **Review Cadence:** Quarterly
>
> **⚠️ THIS DOCUMENT IS THE SINGLE SOURCE OF TRUTH for all incident response procedures.**
> It supersedes: `incident-response-playbook.md`, `incident-severity-criteria.md`,
> `IncidentManagement.md`, `IncidentResponse.md`, `Runbooks.md`, and all individual playbooks.
> Those files are preserved for reference but should not be modified — update here instead.

---

## 1. Unified Severity Matrix

| Criteria           | SEV-1 (Critical)                  | SEV-2 (High)                | SEV-3 (Medium)            | SEV-4 (Low)       |
| ------------------ | --------------------------------- | --------------------------- | ------------------------- | ----------------- |
| **User Impact**    | All users unable to use site      | Significant subset affected | Minor feature degraded    | Cosmetic issue    |
| **Revenue Impact** | Revenue loss > $1K/hr             | Revenue loss < $1K/hr       | No revenue impact         | No revenue impact |
| **Data Integrity** | Data loss or corruption confirmed | Data at risk, not yet lost  | No data risk              | No data risk      |
| **Security**       | Active breach, PII exposed        | Vulnerability with evidence | Theoretical vulnerability | Best practice gap |
| **Response SLA**   | 5 minutes                         | 15 minutes                  | 1 hour                    | 4 hours           |
| **Fix SLA**        | 4 hours                           | 8 hours                     | 48 hours                  | Next sprint       |
| **Communication**  | Email + Slack to all team         | Slack to engineering        | Slack to team lead        | PR description    |
| **Postmortem**     | Required within 5 days            | Required within 10 days     | Not required              | Not required      |
| **Escalation**     | All-hands, CTO notified           | Engineering lead            | Team lead                 | Self-service      |

### Severity Decision Flow

```
Is the entire site down or unusable?
  ├── Yes ──► SEV-1
  └── No
       └── Is a significant subset of users affected?
            ├── Yes ──► Go to "Is revenue or data affected?"
            └── No
                 └── Is a non-critical feature degraded?
                      ├── Yes ──► SEV-3
                      └── No ──► SEV-4
Is revenue or data affected?
  ├── Yes (revenue loss > $1K/hr OR data loss/corruption) ──► SEV-1
  └── No
       └── Is there a security concern?
            ├── Yes (active breach / PII exposed) ──► SEV-1
            ├── Yes (vulnerability with PoC) ──► SEV-2
            └── No ──► SEV-2
```

### Severity Change Management

Severity can change during an incident. Upgrades are required when impact expands, revenue impact is discovered, or security implications are found. Downgrades may occur when a workaround is deployed or impact was overestimated. All changes must be announced in the incident channel and recorded in the timeline.

---

## 2. Unified Incident Lifecycle

### Phase 1: Detection

Sources ranked by reliability: (1) Automated alerts — Sentry error spike, Better Uptime health check failure, Telegram bot notification. (2) Monitoring dashboard anomalies — Vercel Analytics, Railway Metrics, Cloudflare WAF. (3) User reports — Contact form submissions, social media mentions.

### Phase 2: Triage (within 5 min of alert)

```bash
# 1. Confirm the alert
curl -s http://localhost:3001/api/health/liveness | jq .
curl -s http://localhost:3001/api/health/readiness | jq .
# 2. Identify what changed
git log --oneline -10 --all
# 3. Check error tracking — Sentry for error spike
# 4. Check logs: vercel logs --limit 50 / railway logs --service ai
# 5. Check upstream provider status pages
```

### Phase 3: Contain

| Action                    | When                                | How                                                     |
| ------------------------- | ----------------------------------- | ------------------------------------------------------- |
| **Rollback deployment**   | Recent deploy triggered regression  | `git revert HEAD` + push, or Vercel/Railway rollback UI |
| **Feature flag disabled** | Non-critical feature causing errors | Toggle flag in admin dashboard or PostHog               |
| **Scale resources**       | Traffic spike, CPU saturation       | Railway scale up, Vercel Pro auto-scales                |
| **Redirect traffic**      | Regional outage                     | Cloudflare load balancing rules                         |
| **Fail over**             | Database region failure             | Supabase read replica promotion                         |
| **Degrade gracefully**    | AI service unavailable              | Disable AI chat, show fallback UI                       |

### Phase 4: Eradicate

1. Identify root cause (logs, metrics, code inspection)
2. Remove the vulnerability or defect (deploy patch, update config)
3. Rotate compromised secrets if a security incident
4. Verify no traces of the threat remain

### Phase 5: Recover

1. Apply fix in development, verify in staging
2. Deploy to production via CI/CD pipeline
3. Monitor for 30 minutes — check error rates, latency, health endpoints
4. Confirm alert resolved — acknowledge and close in monitoring tools

### Phase 6: Post-Mortem

| Step                     | Owner             | Timeline               | Artifact                                     |
| ------------------------ | ----------------- | ---------------------- | -------------------------------------------- |
| Draft postmortem         | On-call engineer  | Within 48 hours        | `docs/postmortems/YYYY-MM-DD-description.md` |
| Root cause analysis      | Engineering lead  | Within 48 hours        | Documented in postmortem                     |
| Action items with owners | Engineering team  | Within 5 business days | Added to sprint backlog                      |
| Update runbooks          | DevOps Lead       | Within 1 week          | PR to this playbook                          |
| Review SLO impact        | Architecture Lead | Next monthly review    | Update error budget                          |

---

## 3. Communication Cadence

| Severity | First Status Update | Cadence          | Channels                                      |
| -------- | ------------------- | ---------------- | --------------------------------------------- |
| SEV-1    | 15 minutes          | Every 30 minutes | #ops-alerts, #ops-incident, email to all team |
| SEV-2    | 30 minutes          | Every 60 minutes | #ops-incident                                 |
| SEV-3    | 2 hours             | Per update       | Team lead                                     |
| SEV-4    | Next business day   | PR comment       | Issue/PR                                      |

---

## 4. Playbooks

### 4.1 API High Latency / Error Rate (NestJS)

**Trigger:** `[SEV-2] NestJS API High Error Rate` or `[SEV-2] NestJS API High Latency`
**Symptoms:** Users cannot load portfolio data, submit contact forms, or access admin.

**Investigation:** (1) Check Datadog APM — identify failing/slow endpoints. (2) Filter logs by `service:portfolio-api` and `level:ERROR`. (3) Check dependencies — is Supabase or AI service down? (4) Check recent deployments in the last 60 minutes.

**Mitigation:** Bad deployment → rollback. Traffic spike → rate limits via WAF. Memory leak → rolling restart of NestJS pods.

### 4.2 LLM Rate Limit / Provider Failure

**Trigger:** `[SEV-2] FastAPI - LLM Provider High Error Rate`
**Symptoms:** AI Chat unresponsive or returning fallback errors.

**Investigation:** (1) Check FastAPI logs for HTTP 429/502/503/504. (2) Check provider status page (status.openai.com). (3) Check token spend metrics for anomalous usage.

**Mitigation:** Provider outage → toggle `USE_FALLBACK_LLM` flag to switch to Anthropic/Claude or fallback model. Rate limit reached → request quota increase, show graceful degradation message.

### 4.3 Supabase Connection Pool Exhaustion

**Trigger:** `[SEV-2] Database Connection Pool > 90%`
**Symptoms:** `PrismaClientInitializationError` or DB connection timeouts.

**Investigation:** (1) Check Supabase Dashboard → Database → Metrics. (2) Check for long-running transactions or deadlocks. (3) Identify N+1 queries via APM.

**Mitigation:** Kill blocking queries (`SELECT pg_terminate_backend(pid)...`). Ensure Prisma connects to pooler port (6543). Temporarily upgrade Supabase compute instance.

### 4.4 WebGL / R3F Crash (Next.js)

**Trigger:** `[SEV-3] Sentry - High Rate of WebGL Context Lost`
**Symptoms:** White screens or frozen 3D scenes on frontend.

**Investigation:** (1) Check Sentry — group by browser and device type. (2) Check PostHog session replays for triggering interactions.

**Mitigation:** Disable heavy 3D assets via PostHog feature flag. Toggle `ENABLE_3D_SCENE` flag to `false` to serve 2D fallback.

---

## 5. Escalation Paths

| Role              | Contact                  | Channel          |
| ----------------- | ------------------------ | ---------------- |
| Primary on-call   | [on-call@portfolio.dev]  | Telegram + SMS   |
| Engineering Lead  | [lead@portfolio.dev]     | Telegram         |
| DevOps Lead       | [devops@portfolio.dev]   | Telegram + Phone |
| Security Lead     | [security@portfolio.dev] | Telegram         |
| Architecture Lead | [arch@portfolio.dev]     | Telegram         |
| CTO               | [cto@portfolio.dev]      | Phone            |

---

## 6. Communication Templates

**Incident Announcement:** `[SEV-1] [Service] — [Brief Description]` — Status, Impact, Started, Team, ETA.
**Status Update:** What we've found, next step, updated timeline.
**Resolution Notice:** Root cause, fix applied, verified stable, postmortem link.

---

## 7. Postmortem Template

```markdown
# Postmortem: [Date] — [Title]

## Incident Summary

- **Date:** YYYY-MM-DD | **Duration:** HH:MM — HH:MM UTC | **Severity:** SEV-1/SEV-2
- **Services affected:** [list] | **Users affected:** [count]

## Timeline

| Time (UTC) | Event           |
| ---------- | --------------- | --- |
| 12:00      | Alert triggered | ... |

## Root Cause

[Description of what caused the incident]

## Impact

- Downtime: X minutes | Errors: X 5xx | Users: X affected | Revenue: $X

## Action Items

| Action | Owner | Ticket | Status |

## Lessons Learned

- What went well: | What went wrong: | What to improve:

## Blameless Statement

This incident was caused by systemic issues, not individual failure.
```

---

## 8. On-Call Rotation

| Week   | Primary | Secondary |
| ------ | ------- | --------- |
| Week 1 | TBD     | TBD       |
| Week 2 | TBD     | TBD       |
| Week 3 | TBD     | TBD       |
| Week 4 | TBD     | TBD       |

Shifts run Mon–Mon, 09:00 UTC handover. Schedule maintained in Team Calendar.

---

## 9. Related Documents

- `docs/31-playbooks/rollback-playbook.md` — Deployment rollback procedures
- `docs/30-runbooks/database-failover.md` — Database failover procedures
- `docs/30-runbooks/service-restart.md` — Service restart procedures
- `docs/21-operations/56-SLA-SLO.md` — SLO definitions and error budgets
- `docs/21-operations/postmortem-tracker.md` — Action item tracking

---

_Document Version: 2.0 — Compiled Incident Response Runbook_
_Last Updated: July 2026 | Next Review: October 2026_

## Cross-References

- [MASTER-INDEX.md](../MASTER-INDEX.md) — Documentation master index
- [CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) — Cross-reference system
