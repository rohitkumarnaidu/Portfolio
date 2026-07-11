# 🚀 Deployment Guide — Agent Marketplace Operations

> **Document:** `DEPLOYMENT-GUIDE.md` | **Version:** 1.0 | **Last Updated:** July 2026  
> **Status:** ✅ Active | **Owner:** Staff Backend Architect | **Review Cadence:** Quarterly  
> **Related:** [DeploymentGuide.md](../operations/DeploymentGuide.md) | [AgentMarketplace.md](../ai/AgentMarketplace.md) | [25-CICD.md](../operations/25-CICD.md)

---

## Executive Summary

This guide covers deployment and operations for the Agent Marketplace — a future system for publishing, distributing, and managing AI agents across the portfolio platform. It defines the agent deployment pipeline, marketplace publishing workflow, environment configuration, health checks, monitoring, scaling considerations, and rollback procedures. This document operationalizes the design specifications in [AgentMarketplace.md](../ai/AgentMarketplace.md) and aligns with the platform's existing CI/CD architecture defined in [25-CICD.md](../operations/25-CICD.md). All deployments follow the enterprise **build-once, deploy-everywhere** strategy established in [DeploymentGuide.md](../operations/DeploymentGuide.md).

---

## 1. Agent Deployment Pipeline

### 1.1 Pipeline Stages

```
Package Build → Integrity Check → Registry Publish → Environment Promote → Health Verify
```

| Stage | Tooling | Duration | Failure Action |
|-------|---------|----------|----------------|
| Package Build | `turbo build` + agent packager | ~2 min | Fail pipeline, notify developer |
| Integrity Check | Signature verification + schema validation | ~30s | Reject package, quarantine |
| Registry Publish | Agent Registry API → Catalog DB | ~10s | Rollback registry transaction |
| Environment Promote | Graduated rollout (dev → staging → prod) | ~5 min | Halt promotion, roll back |
| Health Verify | Automated smoke tests + latency checks | ~2 min | Trigger rollback procedure |

### 1.2 Package Artifact

Each agent is published as a signed archive containing:

```
agent-package/
├── manifest.json          # Metadata, version, capabilities, dependencies
├── entrypoint.sh          # Agent execution entrypoint
├── capabilities/          # Declared capability implementations
├── requirements.txt       # Python dependencies (for FastAPI-hosted agents)
└── checksums.sha256       # Integrity manifest
```

The full packaging standard is defined in [AgentMarketplace.md](../ai/AgentMarketplace.md#11-agent-packaging-standard).

---

## 2. Marketplace Publishing Workflow

### 2.1 Publishing Gates

| Gate | Check | Enforced By | Bypass |
|------|-------|-------------|--------|
| Q1 — Schema Validation | Manifest conforms to JSON Schema | Registry API | ❌ Never bypassed |
| Q2 — Capability Audit | Declared capabilities match implementation | Static analysis | ❌ Never bypassed |
| Q3 — Security Scan | No known CVEs in dependencies | `npm audit` / `pip audit` | ❌ Never bypassed |
| Q4 — Integration Test | Agent passes marketplace e2e suite | CI pipeline | Editor override with reason |
| Q5 — Approval | Human review of agent metadata | Marketplace Dashboard | Admin must approve |

### 2.2 Channel Promotion

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│   Alpha   │────▶│   Beta   │────▶│  Stable  │
│ (dev)     │     │ (staging)│     │ (prod)   │
└──────────┘     └──────────┘     └──────────┘
     │                │                │
  Auto-push       Manual promote    Approval gate
  on commit       via dashboard     + health check
```

---

## 3. Environment Configuration

| Variable | Scope | Example | Purpose |
|----------|-------|---------|---------|
| `AGENT_REGISTRY_URL` | Marketplace | `https://api.portfolioowner.com/v1/agents` | Registry endpoint |
| `AGENT_STORAGE_BACKEND` | Marketplace | `supabase` | Agent package storage |
| `AGENT_EXECUTION_TIMEOUT` | Agent Runtime | `30000` | Max execution ms |
| `AGENT_SANDBOX_LEVEL` | Agent Runtime | `isolated` | Isolation policy |
| `MARKETPLACE_CATALOG_TTL` | Catalog | `300` | Cache TTL seconds |
| `AGENT_MAX_MEMORY_MB` | Agent Runtime | `256` | Memory limit per agent |

Environment-specific overrides follow the pattern in [DeploymentGuide.md](../operations/DeploymentGuide.md#3-environment-configuration).

---

## 4. Health Checks & Monitoring

### 4.1 Agent Health Endpoints

| Endpoint | Purpose | Expected Response | Frequency |
|----------|---------|-------------------|-----------|
| `GET /health` | Agent process liveness | `200 OK` | 10s |
| `GET /health/ready` | Readiness (dependencies ready) | `200 OK` | 15s |
| `GET /metrics` | Prometheus metrics | `text/plain` | 30s |
| `GET /health/deps` | Dependency connectivity | `{ "db": "ok", "cache": "ok" }` | 60s |

### 4.2 Key Metrics

| Metric | Alert Threshold | Severity | Action |
|--------|----------------|----------|--------|
| Agent response p95 | > 5s | High | Scale or optimize agent |
| Error rate | > 1% | Critical | Roll back agent version |
| Package download failures | > 0.1% | Medium | Check storage backend |
| Registration failures | > 0 | Critical | Investigate registry |
| Active agent count drift | > 10% expected | Low | Reconcile catalog |

### 4.3 Agent Dashboard

The agent operations dashboard (available at `/admin/agents`) surfaces:

- Deployed agent versions per environment
- Health status per agent (green/yellow/red)
- Execution latency trends over 1h/24h/7d
- Recent rollback history
- Resource utilization (memory, CPU, execution slots)

---

## 5. Scaling Considerations

| Dimension | Strategy | Trigger | Limit |
|-----------|----------|---------|-------|
| Agent instances | Horizontal scaling via container replicas | CPU > 70% for 5 min | 10 replicas max |
| Registry reads | CDN caching + read replicas | Cache hit rate < 80% | Unlimited (CDN-backed) |
| Package storage | Supabase Storage with CDN | Storage > 80% capacity | 500MB free tier |
| Catalog queries | Database connection pooling via PgBouncer | Connections > 12 | 15 free tier connections |

Agents run as isolated processes within the FastAPI service. Each agent gets a dedicated execution sandbox with configurable resource limits. Long-running agents are migrated to background job queues (BullMQ) to avoid blocking the API.

---

## 6. Rollback Procedures

### 6.1 Automated Rollback Triggers

| Condition | Action | RTO |
|-----------|--------|-----|
| Health check fails 3 consecutive times | Auto-rollback to previous version | < 30s |
| Error rate exceeds 2% in 5-min window | Auto-rollback to previous version | < 60s |
| Response p95 exceeds 10s for 5 min | Auto-scale then rollback if persists | < 2 min |
| Manual rollback via admin dashboard | Instant version switch | < 10s |

### 6.2 Rollback Steps

```bash
# 1. Verify the target rollback version exists in registry
agent registry verify --version <previous-version>

# 2. Promote previous version to current
agent registry promote --version <previous-version> --channel stable

# 3. Invalidate catalog cache
curl -X POST https://api.portfolioowner.com/v1/catalog/invalidate

# 4. Run smoke tests against promoted version
agent test run --suite smoke --version <previous-version>

# 5. Alert on completion
agent notify --channel slack --message "Rollback to v<previous-version> complete"
```

### 6.3 Rollback History

All rollbacks are logged to `audit_logs` with actor identity, version diff, trigger reason, and duration. Historical rollback data is surfaced in the Agent Dashboard for post-mortem analysis.

---

## Related Documentation

| Reference | Description |
|-----------|-------------|
| [DeploymentGuide.md](../operations/DeploymentGuide.md) | Platform-wide deployment strategy, environments, and runbooks |
| [AgentMarketplace.md](../ai/AgentMarketplace.md) | Marketplace architecture, agent packaging, and publishing design |
| [25-CICD.md](../operations/25-CICD.md) | CI/CD pipeline stages, quality gates, and deploy verification |
| [22-OBSERVABILITY.md](../operations/22-OBSERVABILITY.md) | Monitoring, logging, and alerting infrastructure |
| [55-DISASTER-RECOVERY.md](../operations/55-DISASTER-RECOVERY.md) | DR procedures and backup restoration |

---

## Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Jul 2026 | Initial marketplace deployment guide — agent pipeline, publishing workflow, health checks, scaling, rollback procedures | Staff Backend Architect |

---

*Document Version: 1.0 — Enterprise Edition*
