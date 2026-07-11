# Postmortem Tracker — Action Item Registry

> **Document:** `postmortem-tracker.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** Active | **Owner:** DevOps Lead | **Review Cadence:** Weekly
> **Related:** [incident-response-playbook.md](./incident-response-playbook.md) | [incident-severity-criteria.md](./incident-severity-criteria.md)

---

## 1. Purpose

This tracker ensures every post-incident action item is captured, assigned, tracked to completion, and reviewed weekly. No incident is truly resolved until systemic improvements are implemented.

**North star:** Zero repeat incidents from the same root cause.

---

## 2. Action Item Lifecycle

```
Identified ──► Assigned ──► In Progress ──► Done ──► Verified
                    │                           │
                    ▼                           ▼
              Overdue ◄────── Not started ── Closed (no action needed)
```

| Status | Definition | Max Time in Status |
|--------|------------|-------------------|
| **Identified** | Captured in postmortem, not yet assigned | 2 business days |
| **Assigned** | Owner assigned, not yet started | 5 business days |
| **In Progress** | Work underway | Per due date |
| **Done** | Implementation complete, awaiting verification | 2 business days |
| **Verified** | Confirmed effective in production | Terminal |
| **Overdue** | Past due date, not yet done | Escalated weekly |
| **Closed (N/A)** | Action no longer relevant | Terminal |

---

## 3. Postmortem Index

| ID | Date | Incident | Severity | Duration | Postmortem Link | Status |
|----|------|----------|----------|----------|-----------------|--------|
| PM-001 | — | — | — | — | — | No incidents to date |

---

## 4. Action Item Registry

| ID | Incident | Action Item | Owner | Due | Status | Notes |
|----|----------|-------------|-------|-----|--------|-------|
| — | — | — | — | — | — | — |

---

## 5. Recurring Issues Tracker

Any root cause identified 3+ times triggers a systemic improvement initiative.

| Issue | Count | First Seen | Last Seen | Root Cause | Long-term Fix | Owner | Ticket |
|-------|-------|------------|-----------|------------|--------------|-------|--------|
| — | — | — | — | — | — | — | — |

---

## 6. Weekly Postmortem Review Template

Copy this template each week for the team review meeting.

```markdown
# Postmortem Review — Week of [DATE]

## Action Items Status

| ID | Incident | Action Item | Owner | Due | Status | Notes |
|----|----------|-------------|-------|-----|--------|-------|
| PM-001 | DB failover delay | Add READ replica monitoring | DevOps | 2026-07-15 | ✅ Done | Monitoring added to Grafana dashboard |
| PM-002 | SSL expiry | Create cert inventory | DevOps | 2026-07-20 | 🔄 In Progress | Inventory script written, testing |
| PM-003 | API 500 spike | Add circuit breaker to AI client | Backend | 2026-07-25 | 🔄 In Progress | PR #342 under review |
| PM-004 | Slow project pages | Add DB index on project_images.project_id | Backend | 2026-07-30 | 📋 Backlog | Migration ready, waiting for deploy window |
| PM-005 | Contact form failure | Add alert for form submission failures | SRE | 2026-08-01 | ❌ Overdue | Need Sentry metric alert configured |

## Recurring Issues (3+ same root cause)

| Issue | Count | Root Cause | Long-term Fix | Owner |
|-------|-------|------------|--------------|-------|
| API timeout on project pages | 3 | Missing DB index on project_images.project_id | Add migration | Staff BE |
| Redis connection pool exhaustion | 2 | Connection not released in error paths | Audit and fix connection handling | Backend |

## Metrics

| Metric | This Week | Previous Week | Trend |
|--------|-----------|---------------|-------|
| Total incidents | 2 | 3 | ↓ |
| SEV-1 | 0 | 0 | → |
| SEV-2 | 1 (resolved in 23 min) | 1 (resolved in 45 min) | ↓ resolution time |
| SEV-3 | 1 | 2 | ↓ |
| Open action items | 3 | 5 | ↓ |
| Overdue action items | 1 | 2 | ↓ |
| New action items this week | 2 | — | — |
| Action items closed this week | 4 | — | — |

## Systemic Improvements

Priority-ordered based on recurring issue count and impact:

### 1. [Issue] — [Priority: High/Medium/Low]
- **Root cause:** 
- **Action:** 
- **Owner:** 
- **Target due:** 
- **Dependencies:** 

### 2. [Issue] — [Priority: High/Medium/Low]
- **Root cause:** 
- **Action:** 
- **Owner:** 
- **Target due:** 
- **Dependencies:**

## Incident Timeline (This Week)

| ID | Date | Time (UTC) | Incident | Sev | Duration | Summary |
|----|------|------------|----------|-----|----------|---------|
| — | — | — | — | — | — | — |

## Notes / Blockers

- [Any dependencies, blocked items, or team capacity concerns]
- [Decisions made during the review]

## Attendees

- [Name/Role]
```

---

## 7. Postmortem Process Timeline

```
Incident Resolved
    │
    ▼
[Hour 0] On-call drafts incident timeline in #ops-incident
    │
    ▼
[Hour 48] Postmortem document created in docs/postmortems/
    ├── SEV-1: Required
    └── SEV-2: Required
    │
    ▼
[Day 5] SEV-1 postmortem published with all sections complete
[Day 10] SEV-2 postmortem published with all sections complete
    │
    ▼
[Day 10] Action items added to this tracker
    │
    ▼
[Weekly] Postmortem review meeting — track closure
    │
    ▼
[Monthly] Recurring issues analysis
    │
    ▼
[Quarterly] Systemic improvement initiatives chartered
```

---

## 8. Postmortem Document Template

Each postmortem is saved as `docs/postmortems/YYYY-MM-DD-brief-description.md`.

```markdown
# Postmortem: [Date] — [Brief Title]

## Incident Summary
- **Date:** YYYY-MM-DD
- **Duration:** HH:MM — HH:MM UTC
- **Severity:** SEV-1 / SEV-2
- **Services affected:** [web / api / ai / db / all]
- **Users affected:** [count or %]
- **Tracked in:** PM-[ID]

## Timeline
| Time (UTC) | Event |
|------------|-------|
| 12:00 | Alert triggered |
| 12:03 | On-call acknowledged |
| 12:05 | Triage started |
| 12:10 | Root cause identified |
| 12:15 | Mitigation deployed |
| 12:45 | Service restored |
| 13:15 | Monitoring confirmed stable |

## Root Cause
[Description of what caused the incident]

## Impact
- Downtime: X minutes
- Errors: X 5xx responses
- Users affected: X
- Revenue impact: $X (if any)

## Detection
How was the incident detected? (alert / user report / monitoring dashboard)
Could it have been detected faster?

## Response
- Time to acknowledge:
- Time to triage:
- Time to mitigate:
- What went well in the response:
- What could be improved:

## Action Items
| ID | Action | Owner | Due | Status |
|----|--------|-------|-----|--------|
| PM-NNN | Fix root cause | @name | YYYY-MM-DD | 🔄 In Progress |
| PM-NNN | Add monitoring | @name | YYYY-MM-DD | 📋 Backlog |
| PM-NNN | Update runbook | @name | YYYY-MM-DD | ✅ Done |

## Lessons Learned
- **What went well:**
- **What went wrong:**
- **What to improve:**

## Blameless Statement
This incident was caused by systemic issues, not individual failure.

## Appendices
- Links to relevant dashboards, logs, and commits
```

---

## 9. Action Item Closure Criteria

An action item is only **Done** when:

1. The fix is deployed to production
2. Monitoring confirms the fix is effective
3. The related runbook is updated (if applicable)
4. The postmortem is updated with the closure note

An action item is **Verified** when:

1. The fix has been in production for 2 weeks without recurrence
2. A drill or test confirms the systemic improvement works

---

## 10. Metrics Dashboard

| Metric | Target | Current | Measurement |
|--------|--------|---------|-------------|
| Action items closed within due date | >80% | — | PM tracker |
| Recurring incidents (same root cause) | 0 | — | Recurring issues log |
| Time from incident to postmortem (SEV-1) | <5 days | — | Postmortem header |
| Time from postmortem to action items assigned | <2 days | — | PM tracker |
| Action items per incident (avg) | 3–5 | — | PM tracker |

---

## 11. Related Documents

- Postmortem files: `docs/postmortems/`
- Incident response: `docs/operations/incident-response-playbook.md`
- Severity criteria: `docs/operations/incident-severity-criteria.md`
- Communication templates: `docs/playbooks/incident-communication-templates.md`

---

*Document Version: 1.0 — Postmortem Tracker*
*Last Updated: July 2026*
*Next Review Date: October 2026*
