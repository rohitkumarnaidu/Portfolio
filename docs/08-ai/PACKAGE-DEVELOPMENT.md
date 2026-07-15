> **Status:** ?? Design Spec � forward-looking design, not yet implemented

# Ã°Å¸â€œÂ¦ Package Development Ã¢â‚¬â€ Agent Package Authoring and Publishing

> **Document:** `PACKAGE-DEVELOPMENT.md` | **Version:** 1.0 | **Last Updated:** July 2026  
> **Status:** Ã¢Å“â€¦ Active | **Owner:** Principal AI Architect | **Review Cadence:** Quarterly  
> **Related:** [AGENT-MARKETPLACE.md](./AGENT-MARKETPLACE.md) | [SKILLS.md](./SKILLS.md) | [AGENT-NETWORKING.md](./AGENT-NETWORKING.md) | [AGENT-SECURITY.md](../11-security/AGENT-SECURITY.md)

---

## Executive Summary

This guide covers the end-to-end workflow for developing, testing, signing, and publishing agent packages to the Marketplace. Every package follows the Agent Packaging Standard (APS): a signed `.agent` archive containing a validated `manifest.json`, source code, dependency declarations, and SLSA provenance. The development workflow enforces semantic versioning, mandatory code signing, and a multi-stage review gate before publication.

---

## 1. Package Structure and Manifest

### 1.1 Directory Layout

```
agent-package/
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ manifest.json          # Required: Agent metadata, dependencies, permissions
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ agent/
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ main.py            # Entry point (or main.js, main.ts)
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ modules/           # Agent source code
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ utils/             # Utility libraries
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ dependencies/
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ vendor/            # Bundled third-party dependencies
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ tests/
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ test_main.py       # Unit tests
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ integration/       # Integration tests
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ fixtures/          # Test fixtures
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ assets/
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ icon.png           # 256x256 (required)
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ screenshot-1.png   # Screenshots (max 5)
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ docs/
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ README.md          # Agent documentation
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ CHANGELOG.md       # Version changelog
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ API.md             # API documentation (if applicable)
Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ signatures/
    Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ sha256sums.txt     # File checksums
    Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ signature.p7s      # PKCS#7 detached signature
    Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ provenance.json    # SLSA provenance statement
```

### 1.2 Manifest Fields

| Field             | Type   | Required | Description                                       |
| ----------------- | ------ | -------- | ------------------------------------------------- |
| `package.name`    | string | Yes      | Reverse-domain name (e.g. `com.enterprise.agent`) |
| `package.version` | string | Yes      | Semantic version (e.g. `1.2.0`)                   |
| `entrypoint`      | object | Yes      | Runtime, module, function, and args               |
| `capabilities`    | object | Yes      | Required, optional, and provided capabilities     |
| `dependencies`    | object | Yes      | Agent, runtime, and system dependencies           |
| `permissions`     | object | Yes      | Network, filesystem, process, security scopes     |
| `signing`         | object | Yes      | Algorithm, cert fingerprint, timestamp            |

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

| Test Type           | Requirement                      | Coverage Target |
| ------------------- | -------------------------------- | --------------- |
| Unit tests          | All skill functions              | > 80%           |
| Integration tests   | Dependency resolution, data flow | > 60%           |
| Security scan       | SAST + dependency audit          | 100% of files   |
| Manifest validation | JSON Schema conformance          | Required        |
| Permission audit    | Declared vs. actual code usage   | Required        |

---

## 3. Versioning and Publishing

### 3.1 Semantic Versioning

| Bump  | When                             | Example                  | Consumer Impact         |
| ----- | -------------------------------- | ------------------------ | ----------------------- |
| MAJOR | Breaking API or behavior changes | `1.x.x` Ã¢â€ â€™ `2.0.0` | Manual upgrade required |
| MINOR | Backward-compatible features     | `1.1.x` Ã¢â€ â€™ `1.2.0` | Auto-upgrade safe       |
| PATCH | Backward-compatible fixes        | `1.1.0` Ã¢â€ â€™ `1.1.1` | Auto-upgrade safe       |

### 3.2 Publishing Pipeline

```
1. marketplace-cli build           Ã¢â€ â€™ Creates .agent archive
2. marketplace-cli sign            Ã¢â€ â€™ Signs with enterprise certificate
3. marketplace-cli publish         Ã¢â€ â€™ Submits to Marketplace API
4. Marketplace validates           Ã¢â€ â€™ Schema, signature, security scan
5. Approval workflow begins        Ã¢â€ â€™ Review gates, code review, publication
```

---

## 4. Dependency Management

Agent packages declare three categories of dependencies:

| Category   | Source                        | Example                                    |
| ---------- | ----------------------------- | ------------------------------------------ |
| `agents`   | Other marketplace agents      | `"com.enterprise.log-collector": "^3.0.0"` |
| `runtimes` | Platform runtime environments | `"python": ">=3.11, <3.13"`                |
| `system`   | OS-level capabilities         | `"os": ["linux"], "minMemoryMB": 512`      |

Use constraint operators (`^`, `~`, `>=`, `||`) to specify compatible ranges rather than pinned versions. The Marketplace Resolver computes the dependency graph at install time.

---

## 5. Related Documentation

| Document                                              | Description                                   |
| ----------------------------------------------------- | --------------------------------------------- |
| [AGENT-MARKETPLACE.md](./AGENT-MARKETPLACE.md)        | Marketplace architecture and lifecycle        |
| [SKILLS.md](./SKILLS.md)                              | Skill system architecture and manifest format |
| [AGENT-NETWORKING.md](./AGENT-NETWORKING.md)          | Inter-agent communication mesh                |
| [AGENT-SECURITY.md](../11-security/AGENT-SECURITY.md) | Code signing, sandboxing, permission auditing |
| [MARKETPLACE-API-SPEC.md](./MARKETPLACE-API-SPEC.md)  | REST API endpoints for submission             |

---

## Change Log

| Version | Date     | Changes                           | Author                 |
| ------- | -------- | --------------------------------- | ---------------------- |
| 1.0     | Jul 2026 | Initial package development guide | Principal AI Architect |

## Cross-References

- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system
