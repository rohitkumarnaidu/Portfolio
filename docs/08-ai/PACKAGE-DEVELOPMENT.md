> **Status:** 📐 Design Spec — forward-looking design, not yet implemented
# ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â¦ Package Development ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Agent Package Authoring and Publishing

> **Document:** `PACKAGE-DEVELOPMENT.md` | **Version:** 1.0 | **Last Updated:** July 2026  
> **Status:** ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Active | **Owner:** Principal AI Architect | **Review Cadence:** Quarterly  
> **Related:** [AgentMarketplace.md](./AgentMarketplace.md) | [Skills.md](./Skills.md) | [AGENT-NETWORKING.md](./AGENT-NETWORKING.md) | [AGENT-SECURITY.md](../security/AGENT-SECURITY.md)

---

## Executive Summary

This guide covers the end-to-end workflow for developing, testing, signing, and publishing agent packages to the Marketplace. Every package follows the Agent Packaging Standard (APS): a signed `.agent` archive containing a validated `manifest.json`, source code, dependency declarations, and SLSA provenance. The development workflow enforces semantic versioning, mandatory code signing, and a multi-stage review gate before publication.

---

## 1. Package Structure and Manifest

### 1.1 Directory Layout

```
agent-package/
ÃƒÂ¢Ã¢â‚¬ÂÃ…â€œÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ manifest.json          # Required: Agent metadata, dependencies, permissions
ÃƒÂ¢Ã¢â‚¬ÂÃ…â€œÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ agent/
ÃƒÂ¢Ã¢â‚¬ÂÃ¢â‚¬Å¡   ÃƒÂ¢Ã¢â‚¬ÂÃ…â€œÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ main.py            # Entry point (or main.js, main.ts)
ÃƒÂ¢Ã¢â‚¬ÂÃ¢â‚¬Å¡   ÃƒÂ¢Ã¢â‚¬ÂÃ…â€œÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ modules/           # Agent source code
ÃƒÂ¢Ã¢â‚¬ÂÃ¢â‚¬Å¡   ÃƒÂ¢Ã¢â‚¬ÂÃ¢â‚¬ÂÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ utils/             # Utility libraries
ÃƒÂ¢Ã¢â‚¬ÂÃ…â€œÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ dependencies/
ÃƒÂ¢Ã¢â‚¬ÂÃ¢â‚¬Å¡   ÃƒÂ¢Ã¢â‚¬ÂÃ¢â‚¬ÂÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ vendor/            # Bundled third-party dependencies
ÃƒÂ¢Ã¢â‚¬ÂÃ…â€œÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ tests/
ÃƒÂ¢Ã¢â‚¬ÂÃ¢â‚¬Å¡   ÃƒÂ¢Ã¢â‚¬ÂÃ…â€œÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ test_main.py       # Unit tests
ÃƒÂ¢Ã¢â‚¬ÂÃ¢â‚¬Å¡   ÃƒÂ¢Ã¢â‚¬ÂÃ…â€œÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ integration/       # Integration tests
ÃƒÂ¢Ã¢â‚¬ÂÃ¢â‚¬Å¡   ÃƒÂ¢Ã¢â‚¬ÂÃ¢â‚¬ÂÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ fixtures/          # Test fixtures
ÃƒÂ¢Ã¢â‚¬ÂÃ…â€œÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ assets/
ÃƒÂ¢Ã¢â‚¬ÂÃ¢â‚¬Å¡   ÃƒÂ¢Ã¢â‚¬ÂÃ…â€œÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ icon.png           # 256x256 (required)
ÃƒÂ¢Ã¢â‚¬ÂÃ¢â‚¬Å¡   ÃƒÂ¢Ã¢â‚¬ÂÃ¢â‚¬ÂÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ screenshot-1.png   # Screenshots (max 5)
ÃƒÂ¢Ã¢â‚¬ÂÃ…â€œÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ docs/
ÃƒÂ¢Ã¢â‚¬ÂÃ¢â‚¬Å¡   ÃƒÂ¢Ã¢â‚¬ÂÃ…â€œÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ README.md          # Agent documentation
ÃƒÂ¢Ã¢â‚¬ÂÃ¢â‚¬Å¡   ÃƒÂ¢Ã¢â‚¬ÂÃ…â€œÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ CHANGELOG.md       # Version changelog
ÃƒÂ¢Ã¢â‚¬ÂÃ¢â‚¬Å¡   ÃƒÂ¢Ã¢â‚¬ÂÃ¢â‚¬ÂÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ API.md             # API documentation (if applicable)
ÃƒÂ¢Ã¢â‚¬ÂÃ¢â‚¬ÂÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ signatures/
    ÃƒÂ¢Ã¢â‚¬ÂÃ…â€œÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ sha256sums.txt     # File checksums
    ÃƒÂ¢Ã¢â‚¬ÂÃ…â€œÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ signature.p7s      # PKCS#7 detached signature
    ÃƒÂ¢Ã¢â‚¬ÂÃ¢â‚¬ÂÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ provenance.json    # SLSA provenance statement
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
| MAJOR | Breaking API or behavior changes | `1.x.x` ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ `2.0.0` | Manual upgrade required |
| MINOR | Backward-compatible features | `1.1.x` ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ `1.2.0` | Auto-upgrade safe |
| PATCH | Backward-compatible fixes | `1.1.0` ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ `1.1.1` | Auto-upgrade safe |

### 3.2 Publishing Pipeline

```
1. marketplace-cli build           ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Creates .agent archive
2. marketplace-cli sign            ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Signs with enterprise certificate
3. marketplace-cli publish         ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Submits to Marketplace API
4. Marketplace validates           ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Schema, signature, security scan
5. Approval workflow begins        ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Review gates, code review, publication
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

## Cross-References
- [../MASTER-INDEX.md](../MASTER-INDEX.md) Ã¢â‚¬â€ Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) Ã¢â‚¬â€ Cross-reference system
