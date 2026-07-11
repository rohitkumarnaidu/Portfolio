# SOC 2 Readiness Assessment

> **Document:** `SOC2-READINESS.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** Draft — Pre-Audit | **Standard:** AICPA SOC 2 (Trust Services Criteria)
> **Target:** Type I Report Q1 2027 | **Owner:** Security Lead

---

## 1. Overview

### 1.1 What Is SOC 2?

SOC 2 (Service Organization Control 2) is an auditing framework developed by the AICPA that evaluates service organizations against five Trust Service Criteria (TSC): Security, Availability, Processing Integrity, Confidentiality, and Privacy. A Type I report assesses design of controls at a point in time; Type II assesses operating effectiveness over a period (typically 6–12 months).

### 1.2 Why SOC 2 Matters

Enterprise clients and partners increasingly require SOC 2 attestation before engaging. Achieving SOC 2 Type I demonstrates that the Portfolio platform has formally designed controls aligned with industry best practices. It also serves as a foundational step toward ISO 27001 certification (targeted for 2027 per `docs/11-security/COMPLIANCE.md`).

### 1.3 Current Readiness Level

| Domain | Readiness |
|--------|-----------|
| **Security** | ~75% — OWASP ASVS L1 implemented, JWT auth, RBAC, encryption at rest/transit |
| **Availability** | ~50% — Uptime monitoring via Better Uptime, no formal SLA or BCP/DR plan |
| **Confidentiality** | ~60% — Data classification policy exists, no formal confidentiality agreements |
| **Processing Integrity** | ~40% — Input validation via Zod, limited formal integrity monitoring |
| **Privacy** | ~70% — GDPR/CCPA compliance docs, DSAR process, consent management |

**Overall: ~60% readiness.** Formal control documentation, access review automation, and availability commitments are the top remediation priorities.

---

## 2. Scope

### 2.1 System Description

The Portfolio platform is a full-stack monorepo (Next.js 14 frontend, NestJS REST API, FastAPI AI service, Supabase PostgreSQL) deployed on Vercel (web/api) and Docker (AI service). It serves as:

- **Public portfolio** — content delivery, SEO-optimized pages, contact/lead forms
- **Admin dashboard** — authenticated CRUD operations, analytics, sandbox IDE
- **AI chat service** — conversational assistant (OpenAI/Anthropic APIs)
- **API gateway** — REST endpoints consumed by the frontend and third parties

### 2.2 System Boundaries

| Component | Hosting | Security Controls |
|-----------|---------|-------------------|
| Next.js frontend | Vercel Edge + Serverless | WAF, CSP, HSTS, CORS, rate limiting |
| NestJS API | Vercel Serverless | JWT auth, RBAC, ThrottlerGuard, Helmet |
| FastAPI AI service | Docker (VPS) | API key auth, prompt injection filters |
| PostgreSQL | Supabase (managed) | RLS, TLS 1.3, AES-256 at rest |
| Redis | Upstash (managed) | TLS, auth token, TTL-based expiry |
| Queue | BullMQ (Redis-backed) | Job validation, retry policies |
| Email | Resend API | TLS transport, queue-based delivery |

### 2.3 Excluded from Scope

- Third-party sub-processors (Vercel, Supabase, Sentry, PostHog, OpenAI, Anthropic, Resend) — each maintains its own SOC 2/compliance posture
- Client-side analytics data stored in PostHog (covered by PostHog's SOC 2)
- Developer workstations and local development environments

---

## 3. Trust Service Criteria Mapping

### 3.1 Security — Common Criteria (CC)

#### CC1: Control Environment

| Attribute | Detail |
|-----------|--------|
| **Status** | 🟡 **Partially Implemented** |
| **Current State** | Security policies documented in `docs/11-security/` (20+ documents covering auth, encryption, audit logging, data classification, vulnerability management). Organizational structure defined with RBAC roles (admin/editor/viewer/super_admin). No formal org chart or board oversight — single-operator project. |
| **Evidence** | `docs/11-security/SECURITY-POLICY.md`, `docs/11-security/SECURITY-ARCHITECTURE.md`, `apps/api/src/modules/auth/roles.guard.ts` |
| **Gap Analysis** | No independent board or management oversight. Security lead is owner — no separation of duties. No formal code of ethics documented. |
| **Remediation** | Document acceptance of single-operator risk. Create formal security charter. Implement peer review for critical changes. Target: Q3 2026. |

#### CC2: Communication and Information

| Attribute | Detail |
|-----------|--------|
| **Status** | 🟡 **Partially Implemented** |
| **Current State** | Incident response runbook documented (`docs/11-security/SECURITY-INCIDENT-RUNBOOK.md`). Audit logging implemented with structured JSON schema (`docs/11-security/AUDIT-LOGGING.md`). Pino logger with correlation IDs. No formal security awareness training or communication templates. |
| **Evidence** | `docs/11-security/SECURITY-INCIDENT-RUNBOOK.md`, `docs/11-security/AUDIT-LOGGING.md`, `apps/api/src/common/interceptors/logging.interceptor.ts` |
| **Gap Analysis** | No security awareness program. No internal communication templates for security incidents. No formal external communication plan. |
| **Remediation** | Develop incident communication templates. Document escalation matrix. Add security awareness checklist. Target: Q3 2026. |

#### CC3: Risk Assessment

| Attribute | Detail |
|-----------|--------|
| **Status** | 🟡 **Partially Implemented** |
| **Current State** | Risk register exists in `docs/11-security/COMPLIANCE.md` §8. Threat model uses STRIDE (`docs/11-security/THREAT-MODEL.md`). Dependabot for vulnerability scanning. No formal enterprise risk assessment process. Vendor risk assessments are ad-hoc. |
| **Evidence** | `docs/11-security/COMPLIANCE.md` (§8), `docs/11-security/THREAT-MODEL.md`, `docs/11-security/VULNERABILITY-MANAGEMENT.md` |
| **Gap Analysis** | No quantitative risk scoring methodology (e.g., FAIR). Vendor risk assessment not formalized. No recurring risk assessment cadence. |
| **Remediation** | Implement risk scoring matrix (likelihood × impact). Formalize quarterly risk assessment cycle. Create vendor risk questionnaire. Target: Q3 2026. |

#### CC4: Monitoring Activities

| Attribute | Detail |
|-----------|--------|
| **Status** | 🟡 **Partially Implemented** |
| **Current State** | Sentry error monitoring, Better Uptime availability monitoring, Dependabot alerting, Pino structured logging. No SIEM or centralized monitoring platform. Anomaly detection is manual. |
| **Evidence** | `docs/11-security/SECURITY-ARCHITECTURE.md` (§29), `docs/11-security/SECURITY-INCIDENT-RUNBOOK.md` |
| **Gap Analysis** | No SIEM/SOAR. No automated anomaly detection. No centralized dashboard for security events. Alert fatigue risk from multiple unaggregated tools. |
| **Remediation** | Evaluate lightweight SIEM (e.g., Wazuh or Grafana Loki). Implement centralized logging aggregation. Define alert threshold SLAs. Target: Q4 2026. |

#### CC5: Control Activities

| Attribute | Detail |
|-----------|--------|
| **Status** | 🟡 **Partially Implemented** |
| **Current State** | Access controls via JWT + RBAC. Change management via GitHub PR process with CI gates. Code review required for all PRs. No formal control activities matrix. No segregation of duties enforcement given single-operator context. |
| **Evidence** | `docs/34-contributing/CONTRIBUTING.md`, `apps/api/src/common/guards/` |
| **Gap Analysis** | No documented control activities matrix mapping risks to controls. No automated policy enforcement (e.g., Open Policy Agent). |
| **Remediation** | Create control activities matrix. Implement branch protection rules. Document compensating controls for single-operator model. Target: Q3 2026. |

#### CC6: Logical and Physical Access

| Attribute | Detail |
|-----------|--------|
| **Status** | ✅ **Partially Implemented** (Strong technical controls, gaps in formal documentation) |
| **Current State** | JWT access tokens (15-min TTL) + Redis-backed refresh tokens (7-day TTL). bcrypt password hashing (cost 12). RBAC with admin/editor/viewer/super_admin roles. Supabase RLS on all tables. TLS 1.3 in transit, AES-256 at rest. OAuth (Google/GitHub) for authentication. No MFA enforcement (planned). No physical access controls (cloud-hosted). |
| **Evidence** | `docs/11-security/SECURITY-ARCHITECTURE.md` (§5–7, §9, §23, §26), `docs/11-security/DATA-CLASSIFICATION.md`, `docs/11-security/SECRETS-MANAGEMENT.md`, `apps/api/src/modules/auth/` |
| **Gap Analysis** | MFA not yet enforced for admin accounts (`docs/11-security/MFA-ROLLOUT.md` in progress). No quarterly access review process. No formal offboarding/termination procedure. PGP key missing for security contacts. |
| **Remediation** | Complete MFA rollout for all admin accounts. Implement quarterly access review (automated via cron + notification). Document termination/offboarding procedure. Targets: Q3 2026 (MFA), Q4 2026 (access review). |

#### CC7: System Operations

| Attribute | Detail |
|-----------|--------|
| **Status** | 🟡 **Partially Implemented** |
| **Current State** | Better Uptime monitors HTTP endpoints with 1-min intervals. Sentry captures application errors. Incident response runbook documents Tiers 1–3. No formal BCP/DR plan. No documented RTO/RPO targets. |
| **Evidence** | `docs/11-security/SECURITY-INCIDENT-RUNBOOK.md`, `docs/11-security/SECURITY-ARCHITECTURE.md` (§29) |
| **Gap Analysis** | No BCP/DR plan. RTO and RPO not defined. No disaster recovery testing. No capacity/performance monitoring automation. |
| **Remediation** | Define RTO (4 hours) and RPO (1 hour) targets. Create BCP/DR plan with Supabase Point-in-Time Recovery. Schedule bi-annual DR testing. Target: Q3 2026 (BCP/DR plan), Q4 2026 (first DR test). |

#### CC8: Change Management

| Attribute | Detail |
|-----------|--------|
| **Status** | ✅ **Largely Implemented** |
| **Current State** | GitHub Flow with feature branches and PRs. CI pipeline runs lint, typecheck, test, build. Code review required. Squash merge preferred. Conventional commits enforced. No formal change advisory board (CAB) — single maintainer. |
| **Evidence** | `docs/34-contributing/CONTRIBUTING.md`, `.github/workflows/ci.yml`, `.husky/pre-commit` |
| **Gap Analysis** | No formal CAB — acceptable for single-operator project but must be documented as a risk acceptance. No emergency change process. No change window scheduling. |
| **Remediation** | Document emergency change bypass procedure. Add PR template with security checklist. Document risk acceptance for no CAB. Target: Q3 2026. |

#### CC9: Risk Mitigation

| Attribute | Detail |
|-----------|--------|
| **Status** | 🟡 **Partially Implemented** |
| **Current State** | Dependabot configured for dependency vulnerability scanning. Supply chain security policy documented (`docs/11-security/SUPPLY-CHAIN-SECURITY.md`). npm audit gate in CI. No formal business continuity plan. No vendor SLA monitoring. |
| **Evidence** | `docs/11-security/SUPPLY-CHAIN-SECURITY.md`, `docs/11-security/VULNERABILITY-MANAGEMENT.md`, `docs/11-security/COMPLIANCE.md` (§8) |
| **Gap Analysis** | No formal business continuity plan. Vendor SLA monitoring not implemented. No third-party penetration testing. |
| **Remediation** | Document business continuity strategy. Implement vendor SLA tracking. Schedule annual third-party penetration test. Target: Q4 2026. |

---

### 3.2 Availability (A1)

#### A1: Availability Commitments

| Attribute | Detail |
|-----------|--------|
| **Status** | 🟡 **Partially Implemented** |
| **Current State** | 99.5% uptime target defined. Better Uptime monitors with 1-min intervals. Vercel provides 99.99% platform SLA. Supabase provides 99.95% database SLA. No formal availability SLA document published. |
| **Evidence** | `docs/11-security/COMPLIANCE.md` (§7) |
| **Gap Analysis** | No formal SLA document with definitions, exclusions, and credits. No availability reporting/dashboard. No capacity planning automation. |
| **Remediation** | Create formal availability SLA document (99.5% monthly uptime target). Implement automated availability reporting via Better Uptime API. Define maintenance windows and exclusions. Target: Q3 2026. |

#### A1: Monitoring and Response Plan

| Attribute | Detail |
|-----------|--------|
| **Status** | 🟡 **Partially Implemented** |
| **Current State** | Better Uptime checks all public endpoints. Pager notifications configured. Sentry alerts on error spikes. No automated escalation. No post-mortem template formally documented. |
| **Evidence** | `docs/11-security/SECURITY-INCIDENT-RUNBOOK.md` |
| **Gap Analysis** | No automated escalation beyond email. No formal incident severity matrix. No scheduled load testing. |
| **Remediation** | Implement automated escalation (PagerDuty/Opsgenie). Define severity matrix (P1–P4). Schedule quarterly load tests. Target: Q4 2026. |

---

### 3.3 Confidentiality (C1)

#### C1: Confidential Information Identification and Protection

| Attribute | Detail |
|-----------|--------|
| **Status** | ✅ **Largely Implemented** |
| **Current State** | Data classification policy with four tiers (L1–L4) per NIST 800-60. PII inventory documented. Encryption at rest (AES-256) and in transit (TLS 1.3). RBAC restricts access by classification level. Audit logging on all L3/L4 data access. |
| **Evidence** | `docs/11-security/DATA-CLASSIFICATION.md`, `docs/11-security/DATA-GOVERNANCE.md`, `docs/11-security/SECURITY-ARCHITECTURE.md` (§26) |
| **Gap Analysis** | No automated data loss prevention (DLP). No confidentiality agreements for contractors. No periodic data classification audit. |
| **Remediation** | Implement automated PII scanning in CI. Create contractor confidentiality agreement template. Schedule annual data classification audit. Target: Q4 2026. |

#### C1: Data Classification and Handling

| Attribute | Detail |
|-----------|--------|
| **Status** | ✅ **Largely Implemented** |
| **Current State** | Master data register in `DATA-GOVERNANCE.md` with per-table classification. Handling requirements defined per level. Retention policies enforced via automated TTL. |
| **Evidence** | `docs/11-security/DATA-GOVERNANCE.md` (§1–4), `docs/11-security/PRIVACY.md` |
| **Gap Analysis** | No automated data tagging in the database. Data classification is documented but not enforced at the application layer. |
| **Remediation** | Add classification metadata to Prisma models. Implement application-layer enforcement of classification-based access. Target: Q1 2027. |

---

### 3.4 Processing Integrity (PI1)

#### PI1: Complete, Accurate, Timely Processing

| Attribute | Detail |
|-----------|--------|
| **Status** | 🟡 **Partially Implemented** |
| **Current State** | Zod schemas validate all API inputs. Class-validator on NestJS DTOs. Transactional database operations with Prisma. BullMQ queues with retry logic. No formal processing integrity monitoring. |
| **Evidence** | `packages/shared/src/schemas/`, `apps/api/src/common/pipes/validation.pipe.ts` |
| **Gap Analysis** | No automated reconciliation controls. No data quality dashboards. No formal processing integrity SLAs. |
| **Remediation** | Implement data quality monitoring (record counts, processing latency dashboards). Define processing integrity SLAs. Target: Q1 2027. |

#### PI1: Input Validation and Error Handling

| Attribute | Detail |
|-----------|--------|
| **Status** | ✅ **Largely Implemented** |
| **Current State** | Global ValidationPipe with whitelist + forbidNonWhitelisted. Zod schemas in `packages/shared` validated on both client and server. Global exception filter returns consistent error envelopes. Supabase RLS prevents unauthorized data access. |
| **Evidence** | `apps/api/src/main.ts` (ValidationPipe config), `packages/shared/src/schemas/`, `apps/api/src/common/filters/` |
| **Gap Analysis** | No formal fuzz testing pipeline. Error messages could leak implementation details in some endpoints (manual review needed). |
| **Remediation** | Add fuzz testing to CI pipeline. Audit error messages for information leakage. Target: Q4 2026. |

---

### 3.5 Privacy (P1)

#### P1: Personal Information Collection, Use, Retention, Disclosure, Disposal

| Attribute | Detail |
|-----------|--------|
| **Status** | ✅ **Largely Implemented** |
| **Current State** | GDPR compliance documentation (`docs/11-security/GDPR.md`) covers all Article 5 principles. Data collection map with legal bases (Art. 6). Retention schedules enforced (90 days leads, 30 days chat, 7-day refresh tokens). DSAR process implemented (`POST /api/privacy/export`, `POST /api/privacy/delete`). Cookie consent banner with opt-out. |
| **Evidence** | `docs/11-security/GDPR.md` (§2–6), `docs/11-security/COMPLIANCE.md` (§5–6), `docs/11-security/PRIVACY.md`, `docs/11-security/PRIVACY-POLICY.md`, `docs/11-security/COOKIE-POLICY.md` |
| **Gap Analysis** | No automated data mapping tool. Privacy notice not translated into EU languages. Data Protection Impact Assessment (DPIA) not documented. |
| **Remediation** | Create DPIA document. Add multilingual privacy notices. Implement automated PII data mapping. Target: Q4 2026. |

#### P1: GDPR/CCPA Compliance

| Attribute | Detail |
|-----------|--------|
| **Status** | ✅ **Largely Implemented** |
| **Current State** | Full GDPR rights implementation (access, rectification, erasure, restriction, portability, objection). CCPA rights mapped to GDPR equivalents. Consent management with localStorage preference storage. Data Processing Register with 6 activities. 72-hour breach notification procedure documented. |
| **Evidence** | `docs/11-security/GDPR.md`, `docs/11-security/COMPLIANCE.md` (§5–6) |
| **Gap Analysis** | No EU representative appointed (Art. 27). No formal Data Protection Agreement (DPA) with sub-processors. Consent records not cryptographically signed. |
| **Remediation** | Evaluate need for EU representative. Obtain signed DPAs from all sub-processors (Vercel, Supabase, Sentry, PostHog, Resend, OpenAI, Anthropic). Target: Q4 2026. |

---

## 4. Remediation Roadmap

### Phase 1: Foundation (Q3 2026 — July–September)

| Item | TSC | Effort | Owner |
|------|-----|--------|-------|
| SOC 2 control matrix and policy documentation | All | 2 weeks | Security Lead |
| Document security charter and risk acceptance | CC1 | 1 week | Security Lead |
| Implement risk scoring matrix | CC3 | 1 week | Security Lead |
| Create BCP/DR plan with RTO/RPO | CC7, A1 | 2 weeks | DevOps Lead |
| Document emergency change process | CC8 | 3 days | Security Lead |
| Create incident communication templates | CC2 | 3 days | Security Lead |
| Document availability SLA (99.5%) | A1 | 1 week | DevOps Lead |
| Control activities matrix | CC5 | 1 week | Security Lead |

### Phase 2: Technical Controls (Q4 2026 — October–December)

| Item | TSC | Effort | Owner |
|------|-----|--------|-------|
| MFA enforcement for all admin accounts | CC6 | 2 weeks | Backend Lead |
| Quarterly access review automation | CC6 | 1 week | Backend Lead |
| SIEM evaluation and deployment | CC4 | 3 weeks | DevOps Lead |
| Centralized security event dashboard | CC4 | 2 weeks | DevOps Lead |
| Automated escalation for incidents | CC7 | 1 week | DevOps Lead |
| PGP key generation for security contacts | CC6 | 1 day | Security Lead |
| Third-party pen test | CC9 | 2 weeks | External |
| DPA collection from sub-processors | P1 | 2 weeks | Security Lead |
| Create DPIA document | P1 | 1 week | Security Lead |
| Add fuzz testing to CI | PI1 | 1 week | Backend Lead |
| Privacy notice translations | P1 | 1 week | Frontend Lead |

### Phase 3: Audit Readiness (Q1 2027 — January–March)

| Item | TSC | Effort | Owner |
|------|-----|--------|-------|
| SOC 2 Type I readiness review | All | 2 weeks | Security Lead |
| Remediate auditor findings | All | 4 weeks | All |
| Engage SOC 2 auditor | All | 1 week | Security Lead |
| SOC 2 Type I audit | All | 2 weeks | External |
| Begin Type II evidence collection | All | Ongoing | All |

---

## 5. Key Assumptions and Exceptions

1. **Single-operator model**: As a sole developer project, certain SOC 2 controls (segregation of duties, board oversight, formal CAB) cannot be implemented as specified. These will be documented as compensating controls with risk acceptance.
2. **Cloud infrastructure**: Physical access controls (CC6) are inherited from Vercel, Supabase, and Upstash — each provider's SOC 2 reports will be relied upon.
3. **Sub-processor reliance**: Vercel, Supabase, Sentry, PostHog, Resend, OpenAI, and Anthropic each operate independently. Their SOC 2/compliance reports will be collected as evidence.
4. **Exclusion of local dev**: Development environments are excluded from SOC 2 scope. Production-only controls are assessed.
5. **Timeline**: Type I readiness targets Q1 2027. Type II requires 6+ months of operating evidence and targets Q3 2027.
