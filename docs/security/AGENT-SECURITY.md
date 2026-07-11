# 🤖 Agent Security Model — Sandboxing, Auditing & Supply Chain Security

> **Document:** `AGENT-SECURITY.md` | **Version:** 1.0 | **Last Updated:** July 2026  
> **Status:** ✅ Active | **Owner:** Chief Security Architect | **Review Cadence:** Quarterly  
> **Related:** [SecurityArchitecture.md](./SecurityArchitecture.md) | [17-AI_INSTRUCTIONS.md](../ai/17-AI_INSTRUCTIONS.md) | [18-AGENTS.md](../ai/18-AGENTS.md) | [Agent.md](../ai/Agent.md)

---

## Executive Summary

This document defines the security model for AI agents within the Portfolio platform's Agent Marketplace. It covers the agent sandboxing architecture, code execution isolation boundaries, permission and scope model, audit logging requirements for agent actions, supply chain security for third-party agent packages, and secrets management for agent credentials. The model follows a least-privilege, defense-in-depth approach, ensuring that even compromised agents cannot escalate privileges or access data outside their authorised scope.

---

## Table of Contents

1. [Agent Sandboxing Model](#1-agent-sandboxing-model)
2. [Code Execution Isolation](#2-code-execution-isolation)
3. [Permission & Scope Model](#3-permission--scope-model)
4. [Audit Logging for Agent Actions](#4-audit-logging-for-agent-actions)
5. [Supply Chain Security](#5-supply-chain-security)
6. [Secrets Management](#6-secrets-management)
7. [Related Documentation](#7-related-documentation)
8. [Change Log](#8-change-log)

---

## 1. Agent Sandboxing Model

All agents run inside isolated sandboxes with the following characteristics:

- **Process Isolation:** Each agent instance runs in a dedicated container (gVisor / Firecracker micro-VM) with no shared kernel state. Containers are ephemeral — destroyed after each execution or idle timeout of 15 minutes.
- **Network Restriction:** Outbound network access is blocked by default. Agents may only communicate with the API Gateway via a restricted internal endpoint. A per-agent allowlist defines any external API access (e.g., a weather agent calling OpenWeatherMap).
- **Filesystem Isolation:** Each sandbox has a read-only base filesystem overlay. Writes are allowed only to a temporary scratch space (`/tmp`) that is wiped on container teardown. No persistent local storage.
- **Resource Limits:** CPU (0.5 vCPU default), memory (256 MB default), execution timeout (30s default per action), and request rate (10 req/min) are enforced via cgroups and the sandbox runtime.

The sandbox architecture is integrated with the agent runtime described in [18-AGENTS.md](../ai/18-AGENTS.md) and inherits the base security controls from [SecurityArchitecture.md](./SecurityArchitecture.md).

## 2. Code Execution Isolation

For agents that execute user-provided or dynamically generated code (e.g., a code-execution agent, data-analysis plugin):

- **WebAssembly Sandbox:** Code is compiled to WASM and executed in a WebAssembly runtime (Wasmer/Wasmitime) with no host access — no filesystem, no network, no system calls except memory allocation.
- **Polyglot Restriction:** Supported languages (Python, JavaScript, Rust) are restricted to a safe subset. Built-in functions like `eval()`, `exec()`, `os.system()`, and `subprocess` are either disabled or replaced with safe polyfills.
- **Instruction Budget:** Each code execution is limited to 10M WASM instructions. Exceeding this terminates the sandbox and returns an error to the caller.
- **Fallback — gVisor Container:** For agents requiring native system access (e.g., database migration agents), a gVisor sandbox with a tightly scoped seccomp profile is used. This is gated behind an explicit admin grant.

## 3. Permission & Scope Model

Agents follow a capability-based security model derived from the platform's RBAC system [15-AUTHORIZATION.md](./15-AUTHORIZATION.md):

- **Agent Scopes:** Each agent is assigned one or more scopes at installation time (e.g., `analytics:read`, `content:write`, `contacts:read`). These scopes are enforced by the API Gateway via OAuth 2.0 token exchange.
- **User Consent:** Before an agent acts on behalf of a user, explicit consent is obtained via the Agent Marketplace UI. Users can view, grant, or revoke individual scopes at any time.
- **Chain-of-Trust:** Agents cannot delegate scopes to other agents. Each action carries the originating user's identity and the agent's identity in the audit log, preventing confused-deputy attacks.
- **Scope Escalation Prevention:** The scope enforcement layer is implemented as a NestJS guard (`AgentScopeGuard`) that runs before any controller logic. It validates the JWT scopes claim against the route's required permissions. This is the same mechanism used by admin RBAC, extended for agent scopes.

## 4. Audit Logging for Agent Actions

Every agent action is logged to the immutable audit trail defined in [AuditLogging.md](./AuditLogging.md):

| Audit Event            | Data Captured                                             | Retention |
| ---------------------- | --------------------------------------------------------- | --------- |
| Agent invoked          | Agent ID, user ID, action type, input hash, timestamp     | 36 months |
| Scope check            | Scope requested vs. granted, decision (allow/deny)        | 12 months |
| Data access            | Resource type, resource ID, query hash, rows affected     | 36 months |
| Code execution         | Sandbox ID, instruction count, exit code, output hash     | 12 months |
| Secrets accessed       | Secret key name (value masked), action (read/write)       | 36 months |
| Error / security alert | Error type, sandbox ID, severity, stack trace (sanitized) | 12 months |

Audit events are forwarded to the central SIEM (if configured) via the event bus and indexed for forensic analysis. Alerts are generated for anomalous patterns: scope denial spikes, unexpected outbound network attempts, or repeated sandbox crashes.

## 5. Supply Chain Security

Agent packages (published by first-party and third-party developers) are subject to the supply chain controls defined in [supply-chain-security-policy.md](./supply-chain-security-policy.md):

- **Package Signing:** All agent packages must be signed with a developer key (Sigstore / cosign). The package registry verifies signatures upon upload and upon installation.
- **Dependency Scanning:** Agent manifests (Dockerfile, requirements.txt, package.json) are scanned for known CVEs at install time and on a daily cadence. Packages with critical or high-severity vulnerabilities are blocked from installation.
- **SLSA Provenance:** Published agent builds include SLSA provenance attestations (SLSA Level 2+). The registry verifies the build chain before accepting the package.
- **Manual Review Gate:** Third-party agent packages undergo a manual security review (checklist in [SecurityArchitecture.md](./SecurityArchitecture.md) Section 18 — Third-Party Risk) before publication. Review includes code audit, dependency audit, and penetration test results.
- **Runtime Verification:** Agents are periodically rescanned at runtime. If a new CVE is disclosed for a dependency, the agent is quarantined and the owner is notified.

## 6. Secrets Management

Agent credentials (API keys, database URLs, OAuth tokens) are managed via the platform's vault-backed secrets system, integrated with the [SecretsManagement.md](./SecretsManagement.md) framework:

- **Vault Integration:** Secrets are stored in HashiCorp Vault (or equivalent) with automatic rotation. Agents never receive raw secrets — instead, they are injected as environment variables at container start time, scoped to the agent's execution environment.
- **Short-Lived Tokens:** Agent API tokens are issued with a TTL of 1 hour. The agent must refresh via the token exchange endpoint, which re-validates the agent's scope and consent status.
- **Just-In-Time Access:** Database credentials are fetched from Vault at container start and revoked on teardown. No persistent credential storage exists on the sandbox filesystem.
- **Secret Audit:** Every secrets access is logged with the agent ID, requesting user, and purpose. Anomalous access patterns (e.g., an agent requesting a secret outside its normal execution window) trigger an alert.
- **No Shared Secrets:** Each agent instance gets unique credentials. Secrets are never shared between agents or between agent instances.

## 7. Related Documentation

| Document                                                             | Purpose                                                                |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [SecurityArchitecture.md](./SecurityArchitecture.md)                 | Base security controls, incident response, third-party risk assessment |
| [15-AUTHORIZATION.md](./15-AUTHORIZATION.md)                         | RBAC / scope model used for agent permission enforcement               |
| [AuditLogging.md](./AuditLogging.md)                                 | Immutable audit trail for all agent actions                            |
| [SecretsManagement.md](./SecretsManagement.md)                       | Vault-backed secrets lifecycle, rotation, and access policies          |
| [supply-chain-security-policy.md](./supply-chain-security-policy.md) | Package signing, CVE scanning, SLSA provenance for agent packages      |
| [17-AI_INSTRUCTIONS.md](../ai/17-AI_INSTRUCTIONS.md)                 | AI instruction framework and system prompt architecture                |
| [18-AGENTS.md](../ai/18-AGENTS.md)                                   | Agent lifecycle, registration, and execution runtime                   |
| [Agent.md](../ai/Agent.md)                                           | Agent specification, API reference, and developer guide                |

## 8. Change Log

| Version | Date      | Author                   | Changes                                                                 |
| ------- | --------- | ------------------------ | ----------------------------------------------------------------------- |
| 1.0     | July 2026 | Chief Security Architect | Initial release — agent security model, sandboxing, and audit framework |
