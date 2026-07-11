# Post-Incident Review Template

> **Blameless postmortem.** The goal is to learn, not to blame.

## Incident Summary

| Field | Value |
|-------|-------|
| Incident ID | INC-XXX |
| Severity | SEV-1 / SEV-2 / SEV-3 / SEV-4 |
| Date | YYYY-MM-DD |
| Duration | X hours X minutes |
| Reported by | |
| Responders | |

## Timeline

| Time (UTC) | Event |
|------------|-------|
| HH:MM | Incident detected via [alert/user report] |
| HH:MM | Triage started |
| HH:MM | Root cause identified |
| HH:MM | Mitigation applied |
| HH:MM | Service restored |
| HH:MM | Monitoring confirmed stable |

## Impact

| Metric | Expected | Actual During Incident |
|--------|----------|----------------------|
| Uptime | 99.9% | X% |
| Error Rate | < 0.1% | X% |
| Response Time (P95) | < 200ms | Xms |
| Affected Users | - | X |

## Root Cause Analysis

**What happened:**
[Detailed description]

**Why it happened:**
[Contributing factors]

**Trigger:**
[What event started the incident]

## Detection

- How was it detected? (Alert / User report / Manual check)
- Time from occurrence to detection: X minutes
- Would earlier detection have reduced impact?

## Response

- Time to acknowledge: X minutes (target: 15 min for SEV-1)
- Time to mitigate: X minutes
- What went well:
- What went poorly:
- What was confusing:

## Action Items

| # | Action | Owner | Priority | Due Date |
|---|--------|-------|----------|----------|
| 1 | | | P0 | |
| 2 | | | P1 | |
| 3 | | | P2 | |

## Prevention

- What systemic changes prevent recurrence?
- What monitoring would detect earlier?
- What runbooks need updating?
- What tests would have caught this?

## Lessons Learned

- What surprised us?
- What would we do differently?
- What did we learn about the system?

## Follow-Up

| Review Date | Status | Notes |
|-------------|--------|-------|
| +1 week | Open/Closed | |
| +1 month | Open/Closed | |
