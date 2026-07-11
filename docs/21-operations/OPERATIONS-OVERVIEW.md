# 🎛️ Operations — Runbook Index, On-Call, and Incident Management

> **Document:** `OPERATIONS.md` | **Version:** 1.0 | **Last Updated:** July 2026  
> **Status:** ✅ Active | **Owner:** Principal DevOps Lead | **Review Cadence:** Quarterly  
> **Related:** [21-MONITORING.md](./21-MONITORING.md) | [22-OBSERVABILITY.md](./22-OBSERVABILITY.md) | [55-DISASTER-RECOVERY.md](./55-DISASTER-RECOVERY.md) | [Logging.md](../runbooks/Logging.md)

---

## Executive Summary

This document is the central operations reference for the Portfolio platform. It indexes all operational runbooks, defines on-call procedures and escalation paths, documents maintenance window policies, and establishes the cadence for operational reviews. Every alert defined in the monitoring system must have an associated runbook, an assigned on-call rotation, and a documented escalation path.

---

## 1. Runbook Index

### 1.1 Incident Response

| Runbook | Location | Trigger | SLO |
|---------|----------|---------|-----|
| Incident Response | `docs/runbooks/IncidentResponse.md` | Any P0/P1 alert | Acknowledge < 5min |
| Incident Management | `docs/runbooks/IncidentManagement.md` | Incident declared | Update < 15min |
| Post-Incident Review | `docs/operations/post-incident-review-template.md` | Incident resolved | 48h to complete |

### 1.2 Service Recovery

| Runbook | Location | Description |
|---------|----------|-------------|
| Service Restart | `docs/runbooks/service-restart.md` | Restart API, AI, or worker services |
| Database Failover | `docs/runbooks/database-failover.md` | Promote replica, verify consistency |
| SSL Renewal | `docs/runbooks/ssl-renewal.md` | Certificate rotation and validation |
| Rollback Playbook | `docs/playbooks/rollback-playbook.md` | Safe deployment rollback procedure |

### 1.3 Maintenance and Backup

| Runbook | Location | Cadence |
|---------|----------|---------|
| Maintenance Guide | `docs/runbooks/MaintenanceGuide.md` | Per change window |
| Backup Recovery | `docs/runbooks/BackupRecovery.md` | Weekly verification |
| Migration Strategy | `docs/runbooks/MigrationStrategy.md` | Per schema change |

---

## 2. On-Call Procedures

### 2.1 Rotation Schedule

| Rotation | Coverage | Hours | Channel |
|----------|----------|-------|---------|
| Primary | Mon–Fri 09:00–17:00 UTC | Business hours | Telegram @oncalls-primary |
| Secondary | Mon–Fri 17:00–09:00 UTC + Weekends | After-hours | Telegram @oncalls-secondary |
| Escalation | 24/7 | Leadership override | Phone tree + PagerDuty |

### 2.2 Response SLAs

| Severity | Acknowledge | Triage | Mitigate | Resolve |
|----------|-------------|--------|----------|---------|
| P0 — Critical | 5 min | 15 min | 30 min | 4 hours |
| P1 — High | 15 min | 30 min | 2 hours | 8 hours |
| P2 — Medium | 1 hour | 4 hours | 24 hours | 72 hours |
| P3 — Low | Next business day | 1 week | Next sprint | Next sprint |

---

## 3. Escalation Matrix

| Level | Role | Contact | When |
|-------|------|---------|------|
| L1 | On-Call Engineer | Telegram | Alert fires |
| L2 | Senior Engineer | Phone + Telegram | No response in 10min (P0) |
| L3 | DevOps Lead | Phone | Escalation threshold exceeded |
| L4 | CTO / Incident Commander | Phone | Platform-wide outage |

---

## 4. Maintenance Windows

| Window | Day | Time (UTC) | Approval | Notification |
|--------|-----|------------|----------|-------------|
| Standard | Tuesday | 02:00–04:00 | Team lead | 48h notice |
| Emergency | Any | Any | DevOps Lead | As soon as safe |
| Database | Thursday | 03:00–05:00 | Backend Architect | 72h notice |

All maintenance must be logged in the `#maintenance` Slack/Discord channel with: start time, expected duration, change description, rollback plan, and engineer responsible.

---

## 5. Operational Review Cadence

| Review | Frequency | Participants | Artifacts |
|--------|-----------|-------------|-----------|
| Incident Review | Post-incident | On-call + Stakeholders | Postmortem |
| Weekly Ops Sync | Weekly | DevOps + Backend | Dashboard review, alert trends |
| Monthly SLO Review | Monthly | All engineering | SLO attainment, error budget |
| Quarterly Ops Audit | Quarterly | Architecture board | Runbook freshness, DR test |

---

## 6. Related Documentation

| Document | Description |
|----------|-------------|
| [21-MONITORING.md](./21-MONITORING.md) | Monitoring stack, dashboards, alert rules |
| [22-OBSERVABILITY.md](./22-OBSERVABILITY.md) | Logs, metrics, and traces pipeline |
| [55-DISASTER-RECOVERY.md](./55-DISASTER-RECOVERY.md) | DR plan, RTO/RPO targets, failover testing |
| [Logging.md](../runbooks/Logging.md) | Structured logging standards and configuration |
| [incident-response-playbook.md](./incident-response-playbook.md) | Incident response procedures |
| [on-call-schedule.md](./on-call-schedule.md) | On-call rotation calendar |

---

## Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Jul 2026 | Initial operations reference — runbook index, on-call, escalation, maintenance, reviews | Principal DevOps Lead |
