# Security Incident Runbook

> **Document:** `SECURITY-INCIDENT-RUNBOOK.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** Active | **Classification:** L4-Restricted | **Owner:** Security Lead
> **Response SLA:** Critical < 15min, High < 1h, Medium < 4h, Low < 24h
> **Related:** `docs/runbooks/IncidentResponse.md`, `docs/security/SecurityArchitecture.md`

---

## 1. Preparation

### 1.1 Tools and Access Required

| Tool | Account | Access Level | Purpose |
|------|---------|-------------|---------|
| GitHub (portfolio/portfolio) | Admin | `gh` CLI + repo admin | Secret rotation, branch protection, audit logs |
| Vercel Dashboard | Owner | Full access | Env vars, deployment rollback, logs |
| Supabase Dashboard | Owner | Full access | DB connection, RLS policies, audit logs |
| Sentry | Owner | Organization admin | Error monitoring, performance tracing |
| PostHog | Admin | Project admin | Anomaly detection, session replays |
| Better Uptime | Admin | Full access | Incident management, status page |
| Railway Dashboard | Owner | Full access | AI service env vars, deployment logs |
| Cloudflare | Owner | Full access | WAF rules, IP blocking, DNS |
| Telegram Bot | Admin | Message send | Alert notifications |
| Google Cloud Console | Owner | Full access | OAuth credentials audit |
| OpenAI Dashboard | Owner | Full access | API key management, usage logs |
| Anthropic Console | Owner | Full access | API key management, usage logs |

### 1.2 Communication Channels

| Channel | Purpose | Participants |
|---------|---------|-------------|
| `#security-alerts` (Telegram) | Automated alerts | All on-call |
| `#incident-war-room` (Telegram) | Active incident discussion | IC, Lead Investigator, Comms Lead |
| Status Page (Better Uptime) | Public status | External users |
| Email (admin@portfolio.dev) | Formal notifications | Users (if PII breach) |

### 1.3 Pre-Approved Emergency Actions

These actions do not require additional approval during a Severity 1 or 2 incident:

- Revoke/rotate any secret
- Block IP ranges at Cloudflare WAF
- Disable user accounts
- Rollback deployments
- Scale down non-critical services
- Enable maintenance mode

---

## 2. Detection

### 2.1 Alert Sources

| Source | Channel | Severity | Example Alert |
|--------|---------|----------|---------------|
| Sentry | Telegram #security-alerts | Info/Critical | Error rate > 5% threshold, new exception type |
| PostHog | Telegram #security-alerts | Warning | Login spike from single IP, anon page views surge |
| Better Uptime | Telegram + SMS | Critical | Endpoint down, SSL cert expiring |
| GitHub Secret Scanning | Email + GH Notification | Critical | Secret detected in push |
| GitHub Dependabot | Email + GH Notification | High/Medium | CVE in production dependency |
| Vercel Error Rate | Telegram | Warning | 5xx > 1% in 5min window |
| Rate Limiter Alerts | Application logs | Info/Warning | IP blocked > 100 requests/minute |
| Supabase Audit Logs | Dashboard | Info | RLS policy violation, unusual query pattern |
| User Report | Contact form/Email | Any | "I can't log in", "I see another user's data" |

### 2.2 Triage Flow

```text
Alert Received
  │
  ├─ Is this a known false positive?
  │     ├─ Yes → Document and dismiss
  │     └─ No  → Continue
  │
  ├─ Determine severity (see matrix below)
  │
  ├─ Severity 1 or 2?
  │     ├─ Yes → Open incident war room, notify on-call
  │     └─ No  → Create ticket, handle during business hours
  │
  └─ Assign Incident Commander
```

### 2.3 Severity Matrix

| Severity | Label | Definition | Response SLA | Commander |
|----------|-------|------------|--------------|-----------|
| S1 | Critical | Active data breach, admin account compromise, complete service outage | < 15 min | Security Lead |
| S2 | High | Targeted attack, non-critical data exposure, degraded critical service | < 1 h | Security Engineer |
| S3 | Medium | Isolated security event, suspicious scan, rate limit abuse | < 4 h | On-call Engineer |
| S4 | Low | Port scan, failed logins, low-severity vulnerability | < 24 h | Assign to sprint |

---

## 3. Incident Playbooks

### 3.1 Admin Credential Compromise

**Detection:** Failed MFA from unknown location, unexpected admin account changes, audit log shows admin action from unknown IP.

| Phase | Action | Owner | Duration |
|-------|--------|-------|----------|
| **Detection** | Confirm via audit log the unauthorized action | Security Lead | 5 min |
| **Triage** | Determine scope: single account or provider-wide | Security Lead | 5 min |
| **Containment** | Disable compromised admin account immediately | IC | 2 min |
| **Containment** | Revoke all active sessions (invalidate JWT token family) | Lead Investigator | 5 min |
| **Containment** | Rotate admin's OAuth tokens (Google/GitHub) | Lead Investigator | 5 min |
| **Containment** | Check if MFA was enrolled; force re-enrollment | Lead Investigator | 5 min |
| **Eradication** | Audit all actions performed by compromised account in last 7d | Lead Investigator | 60 min |
| **Eradication** | Review audit_logs table for unauthorized data access | Lead Investigator | 30 min |
| **Eradication** | Rotate any secrets the admin had access to (JWT, DB URL) | Lead Investigator | 15 min |
| **Recovery** | Enable account with new credentials, new MFA enrollment | IC | 10 min |
| **Recovery** | Monitor account activity for 48h | Security Lead | ongoing |
| **Post-mortem** | Root cause analysis, document in incident report | Security Lead | 1 week |

### 3.2 API Key Leak / Secret Exposure

**Detection:** GitHub secret scanning alert, Sentry captures secret in log, unexpected API usage spike.

| Phase | Action | Owner | Duration |
|-------|--------|-------|----------|
| **Detection** | Identify which secret was exposed and where | Security Lead | 2 min |
| **Triage** | Check if secret is still valid; determine blast radius | Security Lead | 3 min |
| **Containment** | Rotate the exposed secret immediately (no grace period) | Lead Investigator | 5 min |
| **Containment** | Revoke old secret at provider dashboard | Lead Investigator | 5 min |
| **Containment** | If GitHub leak: force push removal, enable push protection | Lead Investigator | 10 min |
| **Eradication** | Check provider usage logs for unauthorized calls | Lead Investigator | 30 min |
| **Eradication** | Determine if data was accessed/exfiltrated | Lead Investigator | 60 min |
| **Recovery** | Verify new secret works end-to-end | Lead Investigator | 10 min |
| **Recovery** | Push any additional hardening (log redaction, WAF rules) | Engineering | 1 day |
| **Post-mortem** | How was the secret leaked? Fix the process gap | Security Lead | 1 week |

### 3.3 Database Breach / SQL Injection

**Detection:** Supabase audit log anomaly, unusual query patterns, data integrity checks fail, unknown rows in tables.

| Phase | Action | Owner | Duration |
|-------|--------|-------|----------|
| **Detection** | Confirm via Supabase Logs Explorer unusual queries | Security Lead | 5 min |
| **Triage** | Isolate scope: single table, schema, or full DB | Security Lead | 5 min |
| **Containment** | **IMMEDIATE:** Disable direct DB access from external IPs in Supabase network restrictions | IC | 2 min |
| **Containment** | Enable PITR if not already active (Supabase > 7d retention) | IC | 2 min |
| **Containment** | Deploy WAF rule to block SQLi patterns at edge | Lead Investigator | 10 min |
| **Eradication** | Identify injection vector (API endpoint, search field, etc.) | Lead Investigator | 30 min |
| **Eradication** | Deploy fix: parameterized query, input sanitization, rate limit | Engineering | 60 min |
| **Eradication** | Restore affected data from PITR backup if tampered | Lead Investigator | 60 min |
| **Recovery** | Re-enable DB access, verify all queries use Supabase SDK | IC | 10 min |
| **Recovery** | Run full test suite with SQLi regression tests | Engineering | 2 h |
| **Post-mortem** | Update ThreatModel.md, add DAST test for SQLi | Security Lead | 1 week |

### 3.4 DDoS / Rate Limit Abuse

**Detection:** Vercel/WAF dashboard shows traffic spike, PostHog anomaly for page views, Better Uptime paging for latency.

| Phase | Action | Owner | Duration |
|-------|--------|-------|----------|
| **Detection** | Verify it is not legitimate traffic surge (check referrals) | Security Lead | 2 min |
| **Triage** | Determine attack vector: L3/L4 or L7 (application layer) | IC | 3 min |
| **Containment** | Enable Vercel WAF rate limiting: `vercel rate-limit --enable` | Lead Investigator | 2 min |
| **Containment** | Block source ASNs/IP ranges at Cloudflare (if using) | Lead Investigator | 5 min |
| **Containment** | Scale up API instances if auto-scaling insufficient | IC | 5 min |
| **Eradication** | Analyze traffic patterns; refine rate limiting tiers | Lead Investigator | 30 min |
| **Recovery** | Gradually lift rate limits once attack subsides | IC | 10 min |
| **Recovery** | Verify legitimate traffic passes normally | Lead Investigator | 15 min |
| **Post-mortem** | Document attack profile, update rate limit config | Security Lead | 1 week |

### 3.5 XSS / CSRF Attack

**Detection:** Sentry alert for CSP violation, user reports unexpected behavior, post content contains script tags.

| Phase | Action | Owner | Duration |
|-------|--------|-------|----------|
| **Detection** | Verify CSP report in Sentry, identify injection point | Security Lead | 5 min |
| **Triage** | Determine if stored XSS (persistent) or reflected XSS | Security Lead | 5 min |
| **Containment** | Remove malicious content from database (if stored XSS) | Lead Investigator | 5 min |
| **Containment** | Invalidate sessions of affected users | Lead Investigator | 10 min |
| **Eradication** | Patch injection point: add DOMPurify sanitization, escape output | Engineering | 30 min |
| **Eradication** | Deploy CSP update if current policy is insufficient | Engineering | 15 min |
| **Recovery** | Run automated XSS scan against affected endpoints | Security Lead | 30 min |
| **Recovery** | Verify CSRF tokens rotate correctly after session invalidation | Lead Investigator | 15 min |
| **Post-mortem** | Update OWASP ASVS mapping, add XSS regression tests | Security Lead | 1 week |

### 3.6 AI Prompt Injection / Abuse

**Detection:** Unusually high token usage, AI responses bypassing system prompt, user asking about system prompts, spam content.

| Phase | Action | Owner | Duration |
|-------|--------|-------|----------|
| **Detection** | Check AI service logs for prompt structure anomalies | Security Lead | 5 min |
| **Triage** | Determine if attack is prompt leak, jailbreak, or resource abuse | Security Lead | 5 min |
| **Containment** | Block attacker IP at application layer | Lead Investigator | 2 min |
| **Containment** | Rotate AI API keys if they were leaked in prompt | Lead Investigator | 5 min |
| **Containment** | Enable stricter output filtering or PII redaction | Engineering | 15 min |
| **Eradication** | Patch system prompt to resist identified injection technique | Engineering | 60 min |
| **Eradication** | Implement rate limiting on AI chat endpoint | Engineering | 30 min |
| **Recovery** | Restore AI service, monitor for recurrence | IC | 10 min |
| **Recovery** | Add prompt injection detection test to CI | Engineering | 1 h |
| **Post-mortem** | Update AI security section in SecurityArchitecture.md | Security Lead | 1 week |

### 3.7 Supply Chain Compromise (Malicious Dependency)

**Detection:** Dependabot alert for known CVE, `npm audit` finds malicious package, unexpected network calls from dependency.

| Phase | Action | Owner | Duration |
|-------|--------|-------|----------|
| **Detection** | Identify affected dependency and severity | Security Lead | 5 min |
| **Triage** | Determine if dependency is direct or transitive | Security Lead | 5 min |
| **Containment** | Pin dependency to last known-safe version | Lead Investigator | 10 min |
| **Containment** | If critical: remove dependency entirely, implement alternative | IC | 1 h |
| **Eradication** | Audit dependency usage across all workspaces | Lead Investigator | 60 min |
| **Eradication** | Run full SAST/DAST scan on patched codebase | Engineering | 30 min |
| **Recovery** | Deploy patched version, verify no regressions | Engineering | 30 min |
| **Recovery** | Check for signs of exploitation (unusual network egress, data access) | Security Lead | 2 h |
| **Post-mortem** | Update supply-chain-security-policy.md, add to dependency audit checklist | Security Lead | 1 week |

---

## 4. Communication Templates

### 4.1 Severity 1 (Critical) — Initial Alert

```text
🚨 SECURITY INCIDENT — SEVERITY 1
Type: [Admin Compromise / Data Breach / Service Outage]
Time: [UTC timestamp]
Impact: [Brief scope — e.g., "Admin account 'jdoe' used from unknown IP"]
Status: [Investigating / Containing / Resolved]
IC: [Name]
-------------------------------------------------------
Current actions:
1. [Action in progress]
2. [Action completed]
Next update: [time +30min]
```

### 4.2 Severity 2 (High) — Notification

```text
⚠️ SECURITY INCIDENT — SEVERITY 2
Type: [API Key Leak / DDoS / XSS]
Time: [UTC timestamp]
Affected: [Service / Endpoint]
Status: [Containing / Resolved]
Owner: [Name]
-------------------------------------------------------
Action taken:
1. [Action completed]
2. [Action completed]
SLA: Resolution within [remaining time]
```

### 4.3 Severity 3/4 — Ticket Template

```text
📋 SECURITY TASK — SEVERITY [3/4]
Source: [PostHog anomaly / Dependabot / Scan result]
Description: [Brief finding]
Assigned to: [Name]
Sprint: [Current/Next]
Fix SLA: [4h / 24h / 30d]
```

### 4.4 Post-Incident User Notification

Subject: Security Incident Notification — Portfolio Platform

```text
Dear User,

We detected unusual activity on the Portfolio platform on [DATE].
After investigation, we have determined that [brief impact statement].

Actions taken:
- [Action 1]
- [Action 2]
- [Action 3]

If you were affected:
- Your password has been reset — you will need to set a new one
- Please enable MFA if not already active
- Review your recent account activity

We sincerely apologize for any inconvenience. Our investigation is ongoing,
and we will share additional findings as they become available.

For questions, contact security@portfolio.dev
```

---

## 5. Evidence Collection and Chain of Custody

### 5.1 What to Collect

| Evidence Type | Source | Retention |
|---------------|--------|-----------|
| Application logs | Pino logs (Vercel/API) | 30 days |
| Audit logs | `audit_logs` database table | 1 year |
| Network logs | Vercel Edge logs | 7 days |
| Error events | Sentry issues | 90 days |
| Analytics events | PostHog | 30 days |
| CI/CD logs | GitHub Actions | 90 days |
| WAF logs | Vercel/Cloudflare | 30 days |
| AI conversation logs | FastAPI logs | 7 days |
| Email delivery logs | Resend dashboard | 30 days |
| Database connection logs | Supabase Logs Explorer | 7 days |

### 5.2 Evidence Preservation Steps

```text
1. Take screenshots of relevant dashboards (Sentry, PostHog, WAF)
2. Export applicable logs as JSON/CSV before they expire
3. Lock affected user accounts to prevent data loss
4. Record timestamps in UTC for all events
5. Document every action taken with timestamp and operator
6. Store evidence in a secure, access-controlled location
7. Maintain chain of custody log:

   | Timestamp (UTC) | Evidence | Collected By | Storage Location |
   |-----------------|----------|--------------|------------------|
   | [time] | [type] | [name] | [path or URL] |
```

### 5.3 Post-Mortem Template

```text
# Incident Post-Mortem: [INC-YYYY-NNN]

Date: [Date]
Author: [Name]
Severity: [S1/S2/S3/S4]
Duration: [Start time → End time, UTC]

## Timeline
- [Time] Detection
- [Time] Triage
- [Time] Containment
- [Time] Eradication
- [Time] Recovery
- [Time] Monitoring period ended

## Root Cause
[Description of root cause]

## Impact
- Services affected: [List]
- Data affected: [List tables or data sets]
- Users affected: [Count or "none"]
- Downtime: [Duration]

## What Went Well
1. [Observation]
2. [Observation]

## What Went Wrong
1. [Observation] → [Action item]
2. [Observation] → [Action item]

## Action Items
| # | Action | Owner | Due Date | Ticket |
|---|--------|-------|----------|--------|
| 1 | [Action] | [Name] | [Date] | [Link] |
| 2 | [Action] | [Name] | [Date] | [Link] |

## Verification
- [ ] All action items completed
- [ ] Security controls updated
- [ ] Runbook updated with lessons learned
- [ ] Stakeholders notified
```

---

## 6. Incident Response Testing

| Test Type | Frequency | Scope | Success Criteria |
|-----------|-----------|-------|-----------------|
| Tabletop exercise | Quarterly | All S1 scenarios | All phases complete within SLA |
| Secret leak drill | Quarterly | Rotate one secret in under 15min | Time to rotate < 10min |
| DB restore drill | Quarterly | Restore PITR backup to test DB | Data integrity verified |
| WAF rule test | Monthly | Deploy rate limit / IP block rule | Rule activates correctly |
| Full DR drill | Annually | Complete failover to backup | RTO < 4h, RPO < 1h |
