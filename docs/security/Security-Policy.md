# 🔒 Security Policies — Incident Response, Access Control & Vulnerability Disclosure

> **Document:** `Security-Policy.md` | **Version:** 1.0 | **Last Updated:** July 2026  
> **Status:** ✅ Active | **Owner:** Chief Security Architect | **Review Cadence:** Quarterly  
> **Related:** [SecurityArchitecture.md](./SecurityArchitecture.md) | [15-AUTHORIZATION.md](./15-AUTHORIZATION.md) | [16-COMPLIANCE.md](./16-COMPLIANCE.md)

---

## Executive Summary

This document establishes platform-wide security policies for incident response, vulnerability disclosure, access control, encryption standards, and breach notification. It aligns with NIST SP 800-61, ISO 27001, and OWASP Top 10:2025. All engineers, operators, and administrators are expected to adhere to these policies.

---

## Table of Contents

1. [Security Incident Response Procedure](#1-security-incident-response-procedure)
2. [Vulnerability Disclosure Program](#2-vulnerability-disclosure-program)
3. [Access Control Policy](#3-access-control-policy)
4. [Encryption Standards](#4-encryption-standards)
5. [Security Review Checklist](#5-security-review-checklist)
6. [Breach Notification Process](#6-breach-notification-process)
7. [Related Documentation](#7-related-documentation)
8. [Change Log](#8-change-log)

---

## 1. Security Incident Response Procedure

The incident response process follows a three-tier classification system defined in [SecurityArchitecture.md](./SecurityArchitecture.md) Section 19:

### 1.1 Incident Tiers

| Tier             | Criteria                            | Example                                  | SLA                           |
| ---------------- | ----------------------------------- | ---------------------------------------- | ----------------------------- |
| **1 (Critical)** | Active breach, service compromise   | Exposed PII, compromised DB key          | 15min notify, 1hr containment |
| **2 (High)**     | Suspected breach, exploit available | SQL injection vector, leaked signing key | 1hr notify, 4hr containment   |
| **3 (Low)**      | Scan findings, misconfigurations    | Missing CSP header, non-critical CVE     | 72hr notify, 2wk remediation  |

### 1.2 Response Phases

1. **Detection & Analysis:** Alerts ingested from Sentry, audit logs, WAF, and vulnerability scans. On-call triages within SLA; escalates if Tier 1 or 2.
2. **Containment, Eradication & Recovery:** Isolate affected systems (revoke keys, rotate secrets, block IPs via WAF, revert deployments). Runbooks in [SecurityArchitecture.md](./SecurityArchitecture.md) Section 20.
3. **Post-Incident:** RCA completed within 5 business days. Findings logged in risk register; preventive controls added to security backlog.

### 1.3 Communication

Incident commander designates a communications lead. External communications approved by legal. Internal updates posted to #security-incidents.

## 2. Vulnerability Disclosure Program

The platform operates a responsible vulnerability disclosure program:

- **Reporting:** `security@portfolio.dev` (PGP-encrypted, key at `/security/pgp-key.asc`).
- **Scope:** All platform services (web, API, AI) and infrastructure. Excluded: third-party services, self-XSS, social engineering.
- **Response:** Acknowledgment within 48 hours, triage within 5 business days, fix for critical/high within 30 days.
- **Safe Harbor:** Good-faith researchers following this policy will not face legal action. No monetary bounty — public acknowledgment (hall of fame) and swag pack.
- **Disclosure:** 90-day embargo requested. Coordinated disclosure preferred.

## 3. Access Control Policy

Access follows least privilege and is governed by [15-AUTHORIZATION.md](./15-AUTHORIZATION.md).

### 3.1 User Access

- **Authentication:** MFA required (TOTP + password or hardware key). SSO via Google/GitHub OAuth with SCIM provisioning.
- **Authorization:** Three roles — `admin`, `editor`, `viewer` — approved by security lead, reviewed quarterly. Inactive accounts (90+ days) auto-deactivated. Terminated employees lose access within 24 hours via SCIM.

### 3.2 Service & Machine Access

- **API Keys:** Scoped to services, rotated every 90 days, stored in Vault. See [SecretsManagement.md](./SecretsManagement.md).
- **Database:** Direct access via bastion host with MFA only. Queries logged via `pg_audit`. No production credentials in dev environments.
- **CI/CD:** Short-lived tokens from Vault only. No long-lived secrets in CI env vars.

## 4. Encryption Standards

All data in transit and at rest is encrypted using FIPS 140-2 compliant algorithms:

| Layer                        | Standard             | Implementation                                            |
| ---------------------------- | -------------------- | --------------------------------------------------------- |
| **In Transit (External)**    | TLS 1.3              | Vercel Edge, Supabase (enforced), API Gateway (HSTS)      |
| **In Transit (Internal)**    | mTLS                 | Service-to-service (web, API, AI, queue workers)          |
| **At Rest (Database)**       | AES-256-GCM          | Supabase TCE for PII; tablespace encryption for all data  |
| **At Rest (Object Storage)** | AES-256 (S3 SSE)     | Vercel Blob / Supabase Storage with customer-managed keys |
| **At Rest (Backups)**        | AES-256              | Encrypted archives, key in Vault with auto-rotation       |
| **Secrets**                  | Vault Transit Engine | Envelope encryption (data key + KEK) for all secrets      |

Key management follows the rotation schedule in [secrets-rotation-schedule.md](./secrets-rotation-schedule.md).

## 5. Security Review Checklist

Every feature, deployment, and dependency update must pass: **Pre-Merge** — SAST (Semgrep), dependency scan (Snyk/Dependabot), secrets leak prevention (truffleHog), ESLint security rules; **Pre-Deploy** — DAST (OWASP ZAP) on staging, container scan (Trivy), IaC scan (Checkov), quarterly pen test; **Post-Deploy** — WAF validation, CSP report-uri monitoring, canary anomaly detection, audit log monitoring; **Quarterly** — external pen test, access review, key rotation, policy update. Enforced via CI/CD gates. Exceptions require written approval from the Chief Security Architect.

## 6. Breach Notification Process

Aligned with GDPR (Art. 33–34), CCPA (Section 1798.29), and ISO 27001 (A.16):

1. **Detection & Confirmation:** Security team confirms within 1 hour. Severity assessed (data type, records, users, systems).
2. **Containment:** Rotate credentials, isolate systems, revoke access. Critical breaches trigger maintenance mode.
3. **Regulatory Notification:** DPC (EU) or CA AG (California) notified within 72 hours with breach description, data categories, record count, and remediation plan.
4. **Data Subject Notification:** Without undue delay via email and platform banner — what happened, data affected, remediation steps, user recommendations.
5. **Post-Breach:** RCA within 5 business days. Controls updated; incident logged in security knowledge base.

Full details, including templates and SLAs, are documented in [16-COMPLIANCE.md](./16-COMPLIANCE.md) Section 11.

## 7. Related Documentation

- [SecurityArchitecture.md](./SecurityArchitecture.md) — Security controls, threat model, runbooks, defense layers
- [15-AUTHORIZATION.md](./15-AUTHORIZATION.md) — RBAC model, JWT validation, OAuth flow, RLS policies
- [16-COMPLIANCE.md](./16-COMPLIANCE.md) — Regulatory compliance, DSAR process, breach notification templates
- [vulnerability-management-policy.md](./vulnerability-management-policy.md) — CVE tracking, patch management, vulnerability scanning
- [SecretsManagement.md](./SecretsManagement.md) — Vault integration, secret rotation, key management
- [secrets-rotation-schedule.md](./secrets-rotation-schedule.md) — Rotation cadence for cryptographic keys
- [AuditLogging.md](./AuditLogging.md) — Immutable audit trail for security events

## 8. Change Log

| Version | Date      | Author                   | Changes         |
| ------- | --------- | ------------------------ | --------------- |
| 1.0     | July 2026 | Chief Security Architect | Initial release |
