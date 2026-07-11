> **Status:** 🎯 DESIGN SPEC — Not Implemented
> This document describes an aspirational future design. The features described here are NOT yet implemented in the codebase.
> For current AI implementation documentation, see:
> - [AI Strategy](../docs/ai/strategy.md)
> - [Model Decision Matrix](../docs/ai/model-decision-matrix.md)

# 📡 Marketplace API Specification — Agent Marketplace REST Interface

> **Document:** `MARKETPLACE-API-SPEC.md` | **Version:** 1.0 | **Last Updated:** July 2026  
> **Status:** ✅ Active | **Owner:** Staff Backend Architect | **Review Cadence:** Quarterly  
> **Related:** [AgentMarketplace.md](./AgentMarketplace.md) | [44-API-STANDARDS.md](../api/44-API-STANDARDS.md) | [12-API.md](../api/12-API.md)

---

## Executive Summary

The Marketplace API is a RESTful HTTP interface for discovering, installing, updating, and removing AI agents across the enterprise. All endpoints are versioned under `/api/v1/marketplace`, authenticated via JWT bearer tokens, rate-limited per consumer, and return standardized envelope responses (`{ data, meta }`). The API powers the Agent Marketplace CLI, the admin dashboard, and programmatic agent lifecycle automation.

---

## 1. Authentication and Rate Limiting

### 1.1 Authentication

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer <jwt-token>` | Yes |
| `X-API-Version` | `1` | Optional |

Scopes: `marketplace:read`, `marketplace:install`, `marketplace:admin`

### 1.2 Rate Limits

| Tier | Requests/min | Burst | Applied To |
|------|-------------|-------|------------|
| Anonymous | 10 | 5 | Search, list |
| Authenticated | 100 | 20 | All read endpoints |
| Admin | 500 | 100 | All endpoints |
| Install | 10 | 5 | Install, update, remove |

Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## 2. List and Search Agents

```
GET /api/v1/marketplace/agents
GET /api/v1/marketplace/agents/search
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | — | Full-text search query |
| `category` | string | — | Filter by category ID |
| `tags` | string (CSV) | — | Tag filter (AND logic) |
| `runtime` | string | — | Compatible runtime |
| `publisher` | string | — | Publisher organization ID |
| `minRating` | float | — | Minimum rating threshold |
| `status` | enum | `published` | Listing status |
| `sort` | enum | `relevance` | Field: relevance, downloads, rating, updated, name |
| `order` | enum | `desc` | Direction: asc, desc |
| `page` | integer | 1 | Page number |
| `perPage` | integer | 20 | Results per page (max 100) |

**Response:**
```json
{
  "data": [
    {
      "id": "agent-uuid",
      "name": "com.enterprise.security-threat-analyzer",
      "displayName": "Threat Analyzer",
      "version": "2.1.0",
      "summary": "Real-time security threat analysis",
      "categories": ["security", "monitoring"],
      "rating": 4.5,
      "downloadCount": 12842,
      "publisher": { "id": "org-sec", "name": "Security Engineering", "verified": true },
      "publishedAt": "2026-06-18T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "perPage": 20, "total": 142, "totalPages": 8 }
}
```

---

## 3. Agent Detail and Versions

```
GET /api/v1/marketplace/agents/:id
GET /api/v1/marketplace/agents/:id/versions
GET /api/v1/marketplace/agents/:id/versions/:version
```

**Agent Detail Response** adds: full description, icon URL, screenshots, changelog, compatibility matrix, all available versions, dependency tree, sandbox level requirements, permission declarations, SLSA level, and provenance summary.

---

## 4. Install, Update, and Remove

### 4.1 Install

```
POST /api/v1/marketplace/agents/:id/install
```

| Body Parameter | Type | Default | Description |
|---------------|------|---------|-------------|
| `version` | string | `latest` | Version or constraint |
| `channel` | string | `stable` | Update channel |
| `targetRuntime` | string | auto | Target runtime environment |
| `sandboxLevel` | integer | 2 | Sandbox isolation level |
| `configuration` | object | `{}` | Agent configuration overrides |

Returns an installation ID and pipeline status with per-step progress tracking.

### 4.2 Update

```
PUT /api/v1/marketplace/agents/:id/update
```

| Body Parameter | Type | Default | Description |
|---------------|------|---------|-------------|
| `targetVersion` | string | `latest` | Target version |
| `channel` | string | `stable` | Update channel |
| `allowMajorUpgrade` | boolean | false | Permit breaking version bumps |

### 4.3 Remove

```
DELETE /api/v1/marketplace/agents/:id/install
```

| Body Parameter | Type | Default | Description |
|---------------|------|---------|-------------|
| `force` | boolean | false | Force removal while active |
| `preserveData` | boolean | true | Keep agent data directory |

---

## 5. Submission Pipeline

```
POST /api/v1/marketplace/agents
```

| Body Field | Type | Format | Description |
|-----------|------|--------|-------------|
| `package` | binary | `.agent` archive | Signed agent package |
| `signature` | binary | PKCS#7 detached | Digital signature |
| `provenance` | binary | SLSA JSON | Build provenance statement |
| `changelog` | string | Markdown | Release notes |

Returns a submission ID and review status URL. The submission enters the approval workflow (Submitted → UnderReview → Approved → Published).

---

## 6. Related Documentation

| Document | Description |
|----------|-------------|
| [AgentMarketplace.md](./AgentMarketplace.md) | Marketplace architecture and pipeline |
| [44-API-STANDARDS.md](../api/44-API-STANDARDS.md) | API conventions, versioning, envelope format |
| [12-API.md](../api/12-API.md) | Overall API architecture |
| [AGENT-SECURITY.md](../security/AGENT-SECURITY.md) | Authentication, signing, sandboxing |
| [PACKAGE-DEVELOPMENT.md](./PACKAGE-DEVELOPMENT.md) | Package manifest and submission requirements |

---

## Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Jul 2026 | Initial marketplace API specification | Staff Backend Architect |
