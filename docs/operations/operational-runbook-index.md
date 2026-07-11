# Operational Runbook Index — Master Reference

> **Document:** `operational-runbook-index.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** Active | **Owner:** DevOps Lead | **Review Cadence:** Quarterly
> **Related:** [on-call-schedule.md](./on-call-schedule.md) | [incident-response-playbook.md](./incident-response-playbook.md)

---

## 1. Purpose

This index is the single source of truth for all operational runbooks across the Portfolio platform. Every runbook listed here is a tested, documented procedure that any on-call engineer can follow to resolve an operational issue.

Runbooks are owned by specific teams, reviewed quarterly, and updated within 1 week of any process change.

---

## 2. Runbook Index

| ID | Runbook | Purpose | Est. Time | Owner | Location | Last Reviewed |
|----|---------|---------|-----------|-------|----------|---------------|
| RB-001 | **Application Restart** | Restart the API, Web, or AI service | 5 min | SRE | [`runbooks/service-restart.md`](../runbooks/service-restart.md) | 2026-06 |
| RB-002 | **Database Failover** | Promote standby database to primary | 15 min | SRE | [`runbooks/database-failover.md`](../runbooks/database-failover.md) | 2026-06 |
| RB-003 | **SSL Certificate Renewal** | Rotate expiring SSL certificates | 30 min | DevOps | [`runbooks/ssl-renewal.md`](../runbooks/ssl-renewal.md) | 2026-06 |
| RB-004 | **Backup Restore** | Restore database from backup / PITR | 30 min | DevOps | TBD | — |
| RB-005 | **Incident Response** | Full lifecycle for SEV-1/2 incidents | Varies | SRE | [`ops/incident-response-playbook.md`](./incident-response-playbook.md) | 2026-07 |
| RB-006 | **Deployment Rollback** | Roll back a failed deployment | 10 min | DevOps | [`playbooks/rollback-playbook.md`](../playbooks/rollback-playbook.md) | 2026-06 |
| RB-007 | **Secrets Rotation** | Rotate any secret across all providers | 15–30 min | DevOps | [`security/secrets-rotation-schedule.md`](../security/secrets-rotation-schedule.md) | 2026-06 |
| RB-008 | **Capacity Scaling** | Scale up/down resources for traffic changes | 20 min | DevOps | TBD | — |
| RB-009 | **Certificate Pinning Update** | Update pinned certificates for API clients | 15 min | DevOps | TBD | — |
| RB-010 | **Data Cleanup** | Manual trigger of CleanupService | 2 min | SRE | TBD | — |
| RB-011 | **Blue/Green Deploy** | Zero-downtime deployment via blue/green | 37 min | DevOps | [`ops/deployment-strategy-blue-green.md`](./deployment-strategy-blue-green.md) | 2026-07 |
| RB-012 | **AI Service Failover** | Fail over AI service to standby provider | 10 min | SRE | [`runbooks/ai-failover.md`](../runbooks/ai-failover.md) | Not yet created |
| RB-013 | **Cache Invalidation** | Flush and rebuild Redis cache | 5 min | SRE | TBD | — |
| RB-014 | **DNS Change** | Update DNS records in Cloudflare | 10 min | DevOps | TBD | — |
| RB-015 | **Docker Compose Restart** | Full local/infra restart via Docker | 10 min | SRE | [`runbooks/service-restart.md`](../runbooks/service-restart.md) | 2026-06 |
| RB-016 | **Vercel Environment Sync** | Sync environment variables across Vercel projects | 15 min | DevOps | TBD | — |
| RB-017 | **Log Analysis** | Investigate errors using log aggregation | 20 min | SRE | [`runbooks/Logging.md`](../runbooks/Logging.md) | Not yet created |
| RB-018 | **Trace Investigation** | Trace a slow request through the stack | 20 min | SRE | [`runbooks/TracingStrategy.md`](../runbooks/TracingStrategy.md) | Not yet created |
| RB-019 | **Alert Tuning** | Adjust alert thresholds to reduce noise | 30 min | SRE | [`runbooks/AlertingStrategy.md`](../runbooks/AlertingStrategy.md) | Not yet created |
| RB-020 | **DR Activation** | Full disaster recovery activation | 60 min | DevOps | [`ops/55-DISASTER-RECOVERY.md`](./55-DISASTER-RECOVERY.md) | 2026-06 |

---

## 3. Runbook Categories

### 3.1 Recovery (RTO-critical)

| ID | Runbook | RTO Target |
|----|---------|------------|
| RB-001 | Application Restart | 5 min |
| RB-002 | Database Failover | 15 min |
| RB-005 | Incident Response | Varies |
| RB-006 | Deployment Rollback | 10 min |
| RB-011 | Blue/Green Deploy | 37 min |
| RB-020 | DR Activation | 60 min |

### 3.2 Maintenance (Scheduled)

| ID | Runbook | Frequency |
|----|---------|-----------|
| RB-003 | SSL Renewal | Every 90 days |
| RB-007 | Secrets Rotation | Every 90 days |
| RB-008 | Capacity Scaling | As needed |
| RB-009 | Certificate Pinning | Every 180 days |
| RB-016 | Vercel Environment Sync | Per environment change |
| RB-019 | Alert Tuning | Quarterly |

### 3.3 Housekeeping (Ad Hoc)

| ID | Runbook | Trigger |
|----|---------|---------|
| RB-004 | Backup Restore | Data loss incident |
| RB-010 | Data Cleanup | Manual request |
| RB-012 | AI Service Failover | AI provider down |
| RB-013 | Cache Invalidation | Stale data |
| RB-014 | DNS Change | Infrastructure migration |
| RB-015 | Docker Compose Restart | Local environment |
| RB-017 | Log Analysis | Investigation |
| RB-018 | Trace Investigation | Performance issue |

---

## 4. Runbook Ownership

| Owner Team | Runbooks | Coverage |
|------------|----------|----------|
| **SRE** | RB-001, RB-002, RB-005, RB-010, RB-012, RB-013, RB-015, RB-017, RB-018, RB-019 | Service reliability, monitoring, incident response |
| **DevOps** | RB-003, RB-004, RB-006, RB-007, RB-008, RB-009, RB-011, RB-014, RB-016, RB-020 | Infrastructure, deployment, security, DR |

---

## 5. Runbook Health

| Status | Count | Definition |
|--------|-------|------------|
| ✅ Active & Reviewed | 9 | Procedure documented, tested, reviewed within 90 days |
| ⏳ Not Yet Created | 4 | Planned but not yet written |
| 🔄 Needs Review | 4 | Existing document but not yet verified as runbook |
| ❌ Outdated | 0 | Procedure changed, runbook not updated |

---

## 6. Runbook Template

All runbooks should follow this structure:

```markdown
# <Runbook Title>

## Overview
Brief description of when this runbook is used.

## Prerequisites
- Access needed
- Tools required
- Environment variables

## Procedure
1. Step-by-step instructions
2. With commands to run
3. And expected outputs

## Verification
How to confirm the procedure worked.

## Rollback
How to undo if the procedure causes issues.

## Related
Links to related runbooks and docs.
```

---

## 7. Trello/JIRA Labels for Runbook Updates

| Label | Meaning |
|-------|---------|
| `ops:runbook` | Task involves creating or updating a runbook |
| `ops:runbook-review` | Quarterly review of runbook accuracy |
| `ops:runbook-drill` | Verification drill for a runbook |

---

## 8. Version History

| Date | Author | Change |
|------|--------|--------|
| 2026-07-11 | DevOps Lead | Initial index created |
| | | |

---

*Document Version: 1.0 — Operational Runbook Index*
*Last Updated: July 2026*
*Next Review Date: October 2026*
