> **Status:** 🎯 DESIGN SPEC — Not Implemented
> This document describes an aspirational future design. The features described here are NOT yet implemented in the codebase.
> For current AI implementation documentation, see:
> - [AI Strategy](../docs/ai/strategy.md)
> - [Model Decision Matrix](../docs/ai/model-decision-matrix.md)

# 📦 Package Development — Agent Package Authoring and Publishing

> **Document:** `PACKAGE-DEVELOPMENT.md` | **Version:** 1.0 | **Last Updated:** July 2026  
> **Status:** ✅ Active | **Owner:** Principal AI Architect | **Review Cadence:** Quarterly  
> **Related:** [AgentMarketplace.md](./AgentMarketplace.md) | [Skills.md](./Skills.md) | [AGENT-NETWORKING.md](./AGENT-NETWORKING.md) | [AGENT-SECURITY.md](../security/AGENT-SECURITY.md)

---

## Executive Summary

This guide covers the end-to-end workflow for developing, testing, signing, and publishing agent packages to the Marketplace. Every package follows the Agent Packaging Standard (APS): a signed `.agent` archive containing a validated `manifest.json`, source code, dependency declarations, and SLSA provenance. The development workflow enforces semantic versioning, mandatory code signing, and a multi-stage review gate before publication.

---

## 1. Package Structure and Manifest

### 1.1 Directory Layout

```
agent-package/
├── manifest.json          # Required: Agent metadata, dependencies, permissions
├── agent/
│   ├── main.py            # Entry point (or main.js, main.ts)
│   ├── modules/           # Agent source code
│   └── utils/             # Utility libraries
├── dependencies/
│   └── vendor/            # Bundled third-party dependencies
├── tests/
│   ├── test_main.py       # Unit tests
│   ├── integration/       # Integration tests
│   └── fixtures/          # Test fixtures
├── assets/
│   ├── icon.png           # 256x256 (required)
│   └── screenshot-1.png   # Screenshots (max 5)
├── docs/
│   ├── README.md          # Agent documentation
│   ├── CHANGELOG.md       # Version changelog
│   └── API.md             # API documentation (if applicable)
└── signatures/
    ├── sha256sums.txt     # File checksums
    ├── signature.p7s      # PKCS#7 detached signature
    └── provenance.json    # SLSA provenance statement
```

### 1.2 Manifest Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `package.name` | string | Yes | Reverse-domain name (e.g. `com.enterprise.agent`) |
| `package.version` | string | Yes | Semantic version (e.g. `1.2.0`) |
| `entrypoint` | object | Yes | Runtime, module, function, and args |
| `capabilities` | object | Yes | Required, optional, and provided capabilities |
| `dependencies` | object | Yes | Agent, runtime, and system dependencies |
| `permissions` | object | Yes | Network, filesystem, process, security scopes |
| `signing` | object | Yes | Algorithm, cert fingerprint, timestamp |

---

## 2. Development Workflow

### 2.1 Local Development

```
marketplace-cli init --name com.enterprise.my-agent
marketplace-cli dev          # Watches for changes, hot-reloads
marketplace-cli test         # Runs test suite
marketplace-cli lint         # Validates manifest and structure
```

### 2.2 Testing Requirements

| Test Type | Requirement | Coverage Target |
|-----------|-------------|-----------------|
| Unit tests | All skill functions | > 80% |
| Integration tests | Dependency resolution, data flow | > 60% |
| Security scan | SAST + dependency audit | 100% of files |
| Manifest validation | JSON Schema conformance | Required |
| Permission audit | Declared vs. actual code usage | Required |

---

## 3. Versioning and Publishing

### 3.1 Semantic Versioning

| Bump | When | Example | Consumer Impact |
|------|------|---------|-----------------|
| MAJOR | Breaking API or behavior changes | `1.x.x` → `2.0.0` | Manual upgrade required |
| MINOR | Backward-compatible features | `1.1.x` → `1.2.0` | Auto-upgrade safe |
| PATCH | Backward-compatible fixes | `1.1.0` → `1.1.1` | Auto-upgrade safe |

### 3.2 Publishing Pipeline

```
1. marketplace-cli build           → Creates .agent archive
2. marketplace-cli sign            → Signs with enterprise certificate
3. marketplace-cli publish         → Submits to Marketplace API
4. Marketplace validates           → Schema, signature, security scan
5. Approval workflow begins        → Review gates, code review, publication
```

---

## 4. Dependency Management

Agent packages declare three categories of dependencies:

| Category | Source | Example |
|----------|--------|---------|
| `agents` | Other marketplace agents | `"com.enterprise.log-collector": "^3.0.0"` |
| `runtimes` | Platform runtime environments | `"python": ">=3.11, <3.13"` |
| `system` | OS-level capabilities | `"os": ["linux"], "minMemoryMB": 512` |

Use constraint operators (`^`, `~`, `>=`, `||`) to specify compatible ranges rather than pinned versions. The Marketplace Resolver computes the dependency graph at install time.

---

## 5. Related Documentation

| Document | Description |
|----------|-------------|
| [AgentMarketplace.md](./AgentMarketplace.md) | Marketplace architecture and lifecycle |
| [Skills.md](./Skills.md) | Skill system architecture and manifest format |
| [AGENT-NETWORKING.md](./AGENT-NETWORKING.md) | Inter-agent communication mesh |
| [AGENT-SECURITY.md](../security/AGENT-SECURITY.md) | Code signing, sandboxing, permission auditing |
| [MARKETPLACE-API-SPEC.md](./MARKETPLACE-API-SPEC.md) | REST API endpoints for submission |

---

## Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Jul 2026 | Initial package development guide | Principal AI Architect |
