# NIST Cybersecurity Framework (CSF 2.0) Control Mapping

> **Document:** `nist-csf-mapping.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** Ã¢Å“â€¦ Active | **Standard:** NIST CSF 2.0 | **Owner:** Security Lead
> **Review Cadence:** Quarterly | **Classification:** L3-Confidential

---

## 1. Executive Summary

This document maps the Portfolio platform's implemented security controls to the **NIST Cybersecurity Framework (CSF) 2.0**. The mapping covers all 6 NIST functions (GOVERN, IDENTIFY, PROTECT, DETECT, RESPOND, RECOVER) and their associated categories and subcategories.

**Overall Compliance Posture:** ~75% implemented across all NIST CSF categories. Key gaps exist in supply chain risk management (GV.SC), communications templates (RS.CO), and improvement tracking (RC.IM).

### 1.1 Scoring Methodology

| Score               | Meaning                                    | Count |
| ------------------- | ------------------------------------------ | ----- |
| Ã¢Å“â€¦ Implemented | Control fully implemented with evidence    | 14    |
| Ã¢Å¡Â Ã¯Â¸Â Partial | Control partially implemented, gaps remain | 6     |
| Ã¢ÂÅ’ Missing       | Control not implemented                    | 0     |

---

## 2. NIST CSF Control Mapping

### 2.1 GOVERN (GV) Ã¢â‚¬â€ Establish and Monitor the Organization's Cybersecurity Risk Management Strategy

| NIST Category                           | NIST Subcategory                                          | Portfolio Control                                 | Implemented         | Evidence                                                           | Gap                                  |
| --------------------------------------- | --------------------------------------------------------- | ------------------------------------------------- | ------------------- | ------------------------------------------------------------------ | ------------------------------------ |
| **GV.OC: Organizational Context**       | GV.OC-01: Mission and stakeholder expectations            | Security policy documentation                     | Ã¢Å“â€¦             | `SECURITY.md`, `SecurityArchitecture.md`, `data-classification.md` | Ã¢â‚¬â€                              |
| **GV.OC: Organizational Context**       | GV.OC-02: Legal, regulatory, and contractual requirements | GDPR compliance docs, CCPA compliance             | Ã¢Å“â€¦             | `gdpr.md`, `16-COMPLIANCE.md`                                      | Ã¢â‚¬â€                              |
| **GV.OC: Organizational Context**       | GV.OC-03: Critical services and dependencies              | Dependency inventory, supply chain policy         | Ã¢Å“â€¦             | `supply-chain-security-policy.md`                                  | Ã¢â‚¬â€                              |
| **GV.RM: Risk Management Strategy**     | GV.RM-01: Risk management process                         | Threat model, risk register                       | Ã¢Å“â€¦             | `ThreatModel.md`, `SecurityArchitecture.md` Ã‚Â§3                  | Ã¢â‚¬â€                              |
| **GV.RM: Risk Management Strategy**     | GV.RM-02: Risk appetite                                   | Security hardening plan, risk acceptance criteria | Ã¢Å“â€¦             | `SecurityHardeningPlan.md`                                         | Ã¢â‚¬â€                              |
| **GV.SC: Supply Chain Risk Management** | GV.SC-01: Supply chain risk identification                | Dependabot, npm audit, SBOM                       | Ã¢Å¡Â Ã¯Â¸Â Partial | `supply-chain-security-policy.md`                                  | No formal SC risk assessment process |
| **GV.SC: Supply Chain Risk Management** | GV.SC-02: Supplier risk assessment                        | Dependency vetting checklist                      | Ã¢Å¡Â Ã¯Â¸Â Partial | No formal supplier risk scoring                                    |
| **GV.RR: Roles & Responsibilities**     | GV.RR-01: Cybersecurity roles defined                     | RBAC (admin/editor/viewer/super_admin)            | Ã¢Å“â€¦             | `auth.service.ts`, `roles.guard.ts`, `15-AUTHORIZATION.md`         |
| **GV.RR: Roles & Responsibilities**     | GV.RR-02: Accountability assigned                         | Security Lead, Staff DevOps, DPO roles            | Ã¢Å“â€¦             | `SecurityArchitecture.md` Ã‚Â§1                                    |

---

## 2. IDENTIFY (ID)

| NIST Category               | NIST Subcategory                               | Portfolio Control                           | Implemented         | Evidence                                                   | Gap                                    |
| --------------------------- | ---------------------------------------------- | ------------------------------------------- | ------------------- | ---------------------------------------------------------- | -------------------------------------- |
| **ID.AM: Asset Management** | ID.AM-01: Hardware assets inventoried          | Cloudflare, Vercel, Supabase inventory      | Ã¢Å¡Â Ã¯Â¸Â Partial | `SecurityArchitecture.md` Ã‚Â§10                           | No formal hardware asset register      |
| **ID.AM: Asset Management** | ID.AM-02: Software/platform assets inventoried | Docker images, GHCR, npm packages           | Ã¢Å¡Â Ã¯Â¸Â Partial | `supply-chain-security-policy.md` Ã‚Â§2                    | No centralized software asset register |
| **ID.AM: Asset Management** | ID.AM-03: Data assets inventoried              | Data classification, PII inventory          | Ã¢Å“â€¦             | `data-classification.md`, `43-DATA-GOVERNANCE.md`          | Ã¢â‚¬â€                                |
| **ID.AM: Asset Management** | ID.AM-04: External systems inventoried         | Third-party service inventory               | Ã¢Å¡Â Ã¯Â¸Â Partial | `SecurityArchitecture.md` Ã‚Â§10.3                         | No formal vendor register              |
| **ID.AM: Asset Management** | ID.AM-05: Configurations inventoried           | Environment variables, feature flags        | Ã¢Å¡Â Ã¯Â¸Â Partial | `config/.env.example`                                      | No centralized config inventory        |
| **ID.RA: Risk Assessment**  | ID.RA-01: Vulnerabilities identified           | SAST (CodeQL), DAST (ZAP), dependency scan  | Ã¢Å“â€¦             | `SecurityTesting.md`, `vulnerability-management-policy.md` | Ã¢â‚¬â€                                |
| **ID.RA: Risk Assessment**  | ID.RA-02: Threat intelligence used             | STRIDE threat model, OWASP Top 10:2025      | Ã¢Å“â€¦             | `ThreatModel.md`, `SecurityArchitecture.md` Ã‚Â§3          | Ã¢â‚¬â€                                |
| **ID.RA: Risk Assessment**  | ID.RA-03: Risk registered and tracked          | Risk register in compliance doc             | Ã¢Å“â€¦             | `16-COMPLIANCE.md` Ã‚Â§8                                   | Ã¢â‚¬â€                                |
| **ID.RA: Risk Assessment**  | ID.RA-04: Risk response identified             | Security hardening plan, incident response  | Ã¢Å“â€¦             | `SecurityHardeningPlan.md`, incident response playbook     | Ã¢â‚¬â€                                |
| **ID.IM: Improvement**      | ID.IM-01: Improvements from lessons learned    | Post-incident review template               | Ã¢Å“â€¦             | PIR template                                               | Ã¢â‚¬â€                                |
| **ID.IM: Improvement**      | ID.IM-02: Improvements from security testing   | Security testing strategy, pentest findings | Ã¢Å“â€¦             | `SecurityTesting.md`                                       | Ã¢â‚¬â€                                |

---

## 3. PROTECT (PR)

| NIST Category                                   | NIST Subcategory                                | Portfolio Control                               | Implemented         | Evidence                                               | Gap                  |
| ----------------------------------------------- | ----------------------------------------------- | ----------------------------------------------- | ------------------- | ------------------------------------------------------ | -------------------- |
| **PR.AA: Identity Management & Access Control** | PR.AA-01: Identities and credentials managed    | JWT + RBAC + OAuth (Google/GitHub)              | Ã¢Å“â€¦             | `auth.service.ts`, `15-AUTHORIZATION.md`               | Ã¢â‚¬â€              |
| **PR.AA: Identity Management & Access Control** | PR.AA-02: Physical access managed               | Cloud provider responsibility                   | Ã¢Å“â€¦             | Cloudflare, Vercel, Supabase SOC 2                     | Ã¢â‚¬â€              |
| **PR.AA: Identity Management & Access Control** | PR.AA-03: Remote access managed                 | JWT + refresh token rotation                    | Ã¢Å“â€¦             | `auth.service.ts` Ã‚Â§refresh                          | Ã¢â‚¬â€              |
| **PR.AA: Authentication**                       | PR.AA-04: Identity proofing                     | Email verification, OAuth provider verification | Ã¢Å“â€¦             | `auth.service.ts` Ã‚Â§register, Ã‚Â§validateOAuthLogin | Ã¢â‚¬â€              |
| **PR.AA: Authentication**                       | PR.AA-05: MFA implemented                       | TOTP MFA (planned)                              | Ã¢Å¡Â Ã¯Â¸Â Partial | `mfa-rollout-plan.md`                                  | MFA not yet deployed |
| **PR.AA: Authentication**                       | PR.AA-06: Password policy enforced              | bcrypt (cost 12), 8-128 chars, lockout          | Ã¢Å“â€¦             | `auth.service.ts`, `SecurityArchitecture.md` Ã‚Â§5.2   | Ã¢â‚¬â€              |
| **PR.AA: Authentication**                       | PR.AA-07: Session management                    | JWT (15min), refresh token (7d), rotation       | Ã¢Å“â€¦             | `auth.service.ts` Ã‚Â§refresh                          | Ã¢â‚¬â€              |
| **PR.DS: Data Security**                        | PR.DS-01: Data at rest protected                | AES-256 (Supabase managed)                      | Ã¢Å“â€¦             | `SecurityArchitecture.md` Ã‚Â§9.4                      | Ã¢â‚¬â€              |
| **PR.DS: Data Security**                        | PR.DS-02: Data in transit protected             | TLS 1.3, HSTS preload                           | Ã¢Å“â€¦             | `SecurityArchitecture.md` Ã‚Â§10.1                     | Ã¢â‚¬â€              |
| **PR.DS: Data Security**                        | PR.DS-03: Data classification                   | 4-tier classification (L1-L4)                   | Ã¢Å“â€¦             | `data-classification.md`                               | Ã¢â‚¬â€              |
| **PR.DS: Data Security**                        | PR.DS-04: Data retention enforced               | Retention policies per data type                | Ã¢Å“â€¦             | `43-DATA-GOVERNANCE.md` Ã‚Â§4                          | Ã¢â‚¬â€              |
| **PR.DS: Data Security**                        | PR.DS-05: Data disposal                         | Account deletion, lead purging                  | Ã¢Å“â€¦             | `43-DATA-GOVERNANCE.md` Ã‚Â§6                          | Ã¢â‚¬â€              |
| **PR.PS: Platform Security**                    | PR.PS-01: Configuration management              | Helmet headers, CSP, CORS                       | Ã¢Å“â€¦             | `SecurityArchitecture.md` Ã‚Â§8.3                      | Ã¢â‚¬â€              |
| **PR.PS: Platform Security**                    | PR.PS-02: Least functionality                   | Minimal dependencies, no unused features        | Ã¢Å“â€¦             | `supply-chain-security-policy.md` Ã‚Â§6                | Ã¢â‚¬â€              |
| **PR.PS: Platform Security**                    | PR.PS-03: System hardening                      | Security hardening plan                         | Ã¢Å“â€¦             | `SecurityHardeningPlan.md`                             | Ã¢â‚¬â€              |
| **PR.AT: Awareness & Training**                 | PR.AT-01: Personnel trained                     | Developer onboarding guide                      | Ã¢Å“â€¦             | `developer-onboarding.md`                              | Ã¢â‚¬â€              |
| **PR.AT: Awareness & Training**                 | PR.AT-02: Roles and responsibilities documented | Security roles defined                          | Ã¢Å“â€¦             | `SecurityArchitecture.md` Ã‚Â§1                        | Ã¢â‚¬â€              |

---

## 4. DETECT (DE)

| NIST Category                     | NIST Subcategory                             | Portfolio Control                            | Implemented | Evidence                                                   | Gap     |
| --------------------------------- | -------------------------------------------- | -------------------------------------------- | ----------- | ---------------------------------------------------------- | ------- |
| **DE.CM: Continuous Monitoring**  | DE.CM-01: Network monitoring                 | Cloudflare WAF logs, Vercel analytics        | Ã¢Å“â€¦     | `SecurityArchitecture.md` Ã‚Â§10.1                         | Ã¢â‚¬â€ |
| **DE.CM: Continuous Monitoring**  | DE.CM-02: Physical monitoring                | Cloud provider responsibility                | Ã¢Å“â€¦     | Cloudflare, Vercel, Supabase                               | Ã¢â‚¬â€ |
| **DE.CM: Continuous Monitoring**  | DE.CM-03: Personnel activity monitoring      | Audit logging, admin activity interceptor    | Ã¢Å“â€¦     | `AuditLogging.md`, `SecurityArchitecture.md` Ã‚Â§11.3      | Ã¢â‚¬â€ |
| **DE.CM: Continuous Monitoring**  | DE.CM-04: Malicious code detection           | CodeQL, Dependabot, secret scanning          | Ã¢Å“â€¦     | `SecurityTesting.md`, `vulnerability-management-policy.md` | Ã¢â‚¬â€ |
| **DE.CM: Continuous Monitoring**  | DE.CM-05: Monitoring for unauthorized access | Sentry, Pino logging, rate limit alerts      | Ã¢Å“â€¦     | `AuditLogging.md`, `SecurityArchitecture.md` Ã‚Â§29        | Ã¢â‚¬â€ |
| **DE.CM: Continuous Monitoring**  | DE.CM-06: Vulnerability monitoring           | Dependabot, npm audit, Trivy                 | Ã¢Å“â€¦     | `vulnerability-management-policy.md` Ã‚Â§7                 | Ã¢â‚¬â€ |
| **DE.AE: Adverse Event Analysis** | DE.AE-01: Event data collected               | Structured logging, correlation IDs          | Ã¢Å“â€¦     | `AuditLogging.md` Ã‚Â§3                                    | Ã¢â‚¬â€ |
| **DE.AE: Adverse Event Analysis** | DE.AE-02: Event analysis performed           | GlobalExceptionFilter, Sentry error grouping | Ã¢Å“â€¦     | `SecurityArchitecture.md` Ã‚Â§8.4                          | Ã¢â‚¬â€ |
| **DE.AE: Adverse Event Analysis** | DE.AE-03: Event data correlated              | Correlation IDs across services              | Ã¢Å“â€¦     | `AuditLogging.md` Ã‚Â§3                                    | Ã¢â‚¬â€ |

---

## 5. RESPOND (RS)

| NIST Category                  | NIST Subcategory                           | Portfolio Control                 | Implemented         | Evidence                        | Gap                                 |
| ------------------------------ | ------------------------------------------ | --------------------------------- | ------------------- | ------------------------------- | ----------------------------------- |
| **RS.MA: Incident Management** | RS.MA-01: Incident response plan prepared  | Incident response playbook        | Ã¢Å“â€¦             | Incident response playbook      | Ã¢â‚¬â€                             |
| **RS.MA: Incident Management** | RS.MA-02: Incident response plan exercised | Tabletop exercises (planned)      | Ã¢Å¡Â Ã¯Â¸Â Partial | No exercise schedule documented | No formal tabletop exercise program |
| **RS.MA: Incident Management** | RS.MA-03: Incident response plan improved  | Post-incident review process      | Ã¢Å“â€¦             | PIR template                    | Ã¢â‚¬â€                             |
| **RS.CO: Communications**      | RS.CO-01: Internal communications          | Slack notifications, PagerDuty    | Ã¢Å¡Â Ã¯Â¸Â Partial | No formal comms templates       | No incident communication templates |
| **RS.CO: Communications**      | RS.CO-02: External communications          | Breach notification procedure     | Ã¢Å¡Â Ã¯Â¸Â Partial | `16-COMPLIANCE.md` Ã‚Â§11       | No customer notification templates  |
| **RS.CO: Communications**      | RS.CO-03: Stakeholder communications       | Status page, email notifications  | Ã¢Å¡Â Ã¯Â¸Â Partial | Better Uptime status page       | No formal stakeholder comms plan    |
| **RS.AN: Analysis**            | RS.AN-01: Incident investigation           | Post-incident review template     | Ã¢Å“â€¦             | PIR template                    | Ã¢â‚¬â€                             |
| **RS.AN: Analysis**            | RS.AN-02: Incident impact analysis         | Sentry error grouping, audit logs | Ã¢Å“â€¦             | `AuditLogging.md`, Sentry       | Ã¢â‚¬â€                             |
| **RS.AN: Analysis**            | RS.AN-03: Forensic analysis                | Audit logs, Sentry traces         | Ã¢Å¡Â Ã¯Â¸Â Partial | No dedicated forensic tools     | No formal forensic process          |

---

## 6. RECOVER (RC)

| NIST Category                           | NIST Subcategory                                  | Portfolio Control                | Implemented         | Evidence                           | Gap                                   |
| --------------------------------------- | ------------------------------------------------- | -------------------------------- | ------------------- | ---------------------------------- | ------------------------------------- |
| **RC.RP: Recovery Plan Implementation** | RC.RP-01: Recovery plan executed                  | Disaster recovery doc, runbooks  | Ã¢Å“â€¦             | `55-DISASTER-RECOVERY.md`          | Ã¢â‚¬â€                               |
| **RC.RP: Recovery Plan Implementation** | RC.RP-02: Recovery plan communicated              | Runbooks accessible to on-call   | Ã¢Å“â€¦             | Runbooks in docs/                  | Ã¢â‚¬â€                               |
| **RC.RP: Recovery Plan Implementation** | RC.RP-03: Backup and restoration                  | Database backups, Supabase PITR  | Ã¢Å“â€¦             | Supabase automated backups         | Ã¢â‚¬â€                               |
| **RC.IM: Improvements**                 | RC.IM-01: Lessons learned incorporated            | Post-incident review template    | Ã¢Å“â€¦             | PIR template                       | Ã¢â‚¬â€                               |
| **RC.IM: Improvements**                 | RC.IM-02: Action items tracked                    | Action items from PIR            | Ã¢Å¡Â Ã¯Â¸Â Partial | No centralized action item tracker | No formal improvement tracking system |
| **RC.IM: Improvements**                 | RC.IM-03: Recovery plan updated                   | Runbooks updated after incidents | Ã¢Å¡Â Ã¯Â¸Â Partial | Runbooks exist                     | No automated runbook update process   |
| **RC.CO: Communications**               | RC.CO-01: Internal communications during recovery | Incident communication channels  | Ã¢Å¡Â Ã¯Â¸Â Partial | Slack, PagerDuty                   | No formal communication templates     |
| **RC.CO: Communications**               | RC.CO-02: External communications during recovery | Breach notification procedure    | Ã¢Å¡Â Ã¯Â¸Â Partial | `16-COMPLIANCE.md` Ã‚Â§11          | No customer notification templates    |
| **RC.CO: Communications**               | RC.CO-03: Recovery activities communicated        | Status page updates              | Ã¢Å¡Â Ã¯Â¸Â Partial | Better Uptime status page          | No formal recovery communication plan |

---

## 6. Gap Analysis

### 6.1 Gap Summary

| Function      | Categories | Implemented | Partial | Missing | Coverage |
| ------------- | ---------- | ----------- | ------- | ------- | -------- |
| GOVERN (GV)   | 4          | 3           | 1       | 0       | 75%      |
| IDENTIFY (ID) | 3          | 2           | 1       | 0       | 67%      |
| PROTECT (PR)  | 4          | 3           | 1       | 0       | 75%      |
| DETECT (DE)   | 2          | 2           | 0       | 0       | 100%     |
| RESPOND (RS)  | 3          | 1           | 2       | 0       | 33%      |
| RECOVER (RC)  | 3          | 1           | 2       | 0       | 33%      |
| **Total**     | **18**     | **12**      | **6**   | **0**   | **67%**  |

### 6.1 Key Gaps

| Gap ID | NIST Reference | Gap Description                                 | Risk            | Remediation                      |
| ------ | -------------- | ----------------------------------------------- | --------------- | -------------------------------- |
| GAP-01 | GV.SC          | No formal supply chain risk assessment process  | Ã°Å¸Å¸Â¡ Medium | Implement supplier risk scoring  |
| GAP-02 | ID.AM          | No centralized hardware/software asset register | Ã°Å¸Å¸Â¡ Medium | Create asset management database |
| GAP-03 | PR.AA (MFA)    | MFA not yet deployed for admin accounts         | Ã°Å¸â€Â´ High   | Execute MFA rollout plan         |
| GAP-04 | RS.CO          | No incident communication templates             | Ã°Å¸Å¸Â¡ Medium | Create notification templates    |
| GAP-05 | RC.IM          | No centralized improvement tracking system      | Ã°Å¸Å¸Â¡ Medium | Implement action item tracker    |
| GAP-06 | RC.CO          | No formal recovery communication plan           | Ã°Å¸Å¸Â¡ Medium | Create recovery comms plan       |

---

## 7. Remediation Roadmap

### 7.1 Priority Order

| Priority | Gap                                            | NIST Reference  | Effort  | Impact                              | Target Quarter |
| -------- | ---------------------------------------------- | --------------- | ------- | ----------------------------------- | -------------- |
| **P1**   | MFA not deployed (PR.AA-05)                    | Ã°Å¸â€Â´ High   | 2 weeks | Eliminates credential stuffing risk | Q3 2026        |
| **P2**   | No incident communication templates (RS.CO)    | Ã°Å¸Å¸Â¡ Medium | 1 week  | Faster incident response            | Q3 2026        |
| **P3**   | No centralized asset register (ID.AM)          | Ã°Å¸Å¸Â¡ Medium | 2 weeks | Complete asset visibility           | Q3 2026        |
| **P4**   | No formal supply chain risk assessment (GV.SC) | Ã°Å¸Å¸Â¡ Medium | 1 week  | Supplier risk scoring               | Q3 2026        |
| **P5**   | No improvement tracking system (RC.IM)         | Ã°Å¸Å¸Â¡ Medium | 1 week  | Action item tracker                 | Q4 2026        |
| **P6**   | No recovery communication plan (RC.CO)         | Ã°Å¸Å¸Â¡ Medium | 1 week  | Comms templates                     | Q4 2026        |

### 6.1 Remediation Roadmap

```mermaid
gantt
    title NIST CSF Gap Remediation Roadmap
    dateFormat  YYYY-MM-DD
    axisFormat  %b %Y

    section GOVERN (GV)
    Supply Chain Risk Assessment    :g1, 2026-08-01, 30d

    section IDENTIFY (ID)
    Asset Register Implementation    :g2, 2026-08-15, 45d

    section PROTECT (PR)
    MFA Rollout Phase 1-3           :g3, 2026-08-01, 60d

    section RESPOND (RS)
    Incident Comms Templates         :g4, 2026-09-01, 14d
    Tabletop Exercise Program        :g5, 2026-10-01, 30d

    section RECOVER (RC)
    Action Item Tracker              :g6, 2026-09-15, 14d
    Recovery Comms Plan              :g7, 2026-10-01, 14d
```

---

## 7. Remediation Roadmap

### 7.1 Priority Order

| Priority | Gap                                            | NIST Reference  | Risk    | Effort  | Target |
| -------- | ---------------------------------------------- | --------------- | ------- | ------- | ------ |
| **P1**   | MFA not deployed (PR.AA-05)                    | Ã°Å¸â€Â´ High   | 2 weeks | Q3 2026 |
| **P2**   | No incident comms templates (RS.CO)            | Ã°Å¸Å¸Â¡ Medium | 1 week  | Q3 2026 |
| **P3**   | No centralized asset register (ID.AM)          | Ã°Å¸Å¸Â¡ Medium | 2 weeks | Q3 2026 |
| **P4**   | No formal supply chain risk assessment (GV.SC) | Ã°Å¸Å¸Â¡ Medium | 2 weeks | Q3 2026 |
| **P5**   | No improvement tracking system (RC.IM)         | Ã°Å¸Å¸Â¡ Medium | 1 week  | Q4 2026 |
| **P6**   | No recovery communication plan (RC.CO)         | Ã°Å¸Å¸Â¡ Medium | 1 week  | Q4 2026 |

### 6.1 Remediation Timeline

```mermaid
gantt
    title NIST CSF Gap Remediation Roadmap
    dateFormat  YYYY-MM-DD
    axisFormat  %b %Y

    section GOVERN
    Supply Chain Risk Assessment     :g1, 2026-08-01, 30d

    section IDENTIFY
    Asset Register Implementation    :g2, 2026-08-15, 45d

    section PROTECT
    MFA Rollout Phase 1-3            :g3, 2026-08-01, 60d

    section RESPOND
    Incident Comms Templates         :g4, 2026-09-01, 14d
    Tabletop Exercise Program        :g5, 2026-10-01, 30d

    section RECOVER
    Action Item Tracker              :g6, 2026-09-15, 14d
    Recovery Comms Plan              :g7, 2026-10-01, 14d
```

---

## 7. Gap Analysis Summary

| Function      | Categories | Implemented | Partial | Missing | Coverage |
| ------------- | ---------- | ----------- | ------- | ------- | -------- |
| GOVERN (GV)   | 4          | 3           | 1       | 0       | 75%      |
| IDENTIFY (ID) | 3          | 2           | 1       | 0       | 67%      |
| PROTECT (PR)  | 4          | 3           | 1       | 0       | 75%      |
| DETECT (DE)   | 2          | 2           | 0       | 0       | 100%     |
| RESPOND (RS)  | 3          | 1           | 2       | 0       | 33%      |
| RECOVER (RC)  | 3          | 1           | 2       | 0       | 33%      |
| **Total**     | **19**     | **12**      | **7**   | **0**   | **63%**  |

### 6.1 Key Gaps

| Gap ID | NIST Reference | Gap Description                                 | Risk            | Remediation                      | Target  |
| ------ | -------------- | ----------------------------------------------- | --------------- | -------------------------------- | ------- |
| G-01   | GV.SC          | No formal supply chain risk assessment process  | Ã°Å¸Å¸Â¡ Medium | Implement supplier risk scoring  | Q3 2026 |
| G-02   | ID.AM          | No centralized hardware/software asset register | Ã°Å¸Å¸Â¡ Medium | Create asset management database | Q3 2026 |
| G-03   | PR.AA          | MFA not yet deployed for admin accounts         | Ã°Å¸â€Â´ High   | Execute MFA rollout plan         | Q3 2026 |
| G-04   | RS.MA          | No tabletop exercise program                    | Ã°Å¸Å¸Â¡ Medium | Schedule quarterly exercises     | Q4 2026 |
| G-05   | RS.CO          | No incident communication templates             | Ã°Å¸Å¸Â¡ Medium | Create notification templates    | Q3 2026 |
| G-06   | RC.IM          | No centralized improvement tracking system      | Ã°Å¸Å¸Â¡ Medium | Implement action item tracker    | Q4 2026 |
| G-07   | RC.CO          | No formal recovery communication plan           | Ã°Å¸Å¸Â¡ Medium | Create recovery comms plan       | Q4 2026 |

---

## 7. Remediation Roadmap

### 7.1 Priority Order

| Priority | Gap                                            | NIST Reference  | Risk    | Effort  | Target |
| -------- | ---------------------------------------------- | --------------- | ------- | ------- | ------ |
| **P1**   | MFA not deployed (PR.AA-05)                    | Ã°Å¸â€Â´ High   | 2 weeks | Q3 2026 |
| **P2**   | No incident comms templates (RS.CO)            | Ã°Å¸Å¸Â¡ Medium | 1 week  | Q3 2026 |
| **P3**   | No centralized asset register (ID.AM)          | Ã°Å¸Å¸Â¡ Medium | 2 weeks | Q3 2026 |
| **P4**   | No formal supply chain risk assessment (GV.SC) | Ã°Å¸Å¸Â¡ Medium | 2 weeks | Q3 2026 |
| **P5**   | No improvement tracking system (RC.IM)         | Ã°Å¸Å¸Â¡ Medium | 1 week  | Q4 2026 |
| **P6**   | No recovery communication plan (RC.CO)         | Ã°Å¸Å¸Â¡ Medium | 1 week  | Q4 2026 |
| **P7**   | No tabletop exercise program (RS.MA)           | Ã°Å¸Å¸Â¡ Medium | 2 weeks | Q4 2026 |

### 6.1 Remediation Timeline

| Quarter     | Milestone                                                         | Deliverables                                     |
| ----------- | ----------------------------------------------------------------- | ------------------------------------------------ |
| **Q3 2026** | MFA deployed, comms templates created, asset register started     | MFA rollout, incident templates, asset inventory |
| **Q4 2026** | Supply chain risk assessment, improvement tracker, recovery comms | Risk scoring, action item tracker, comms plan    |
| **Q1 2027** | Tabletop exercise program, full asset register                    | Exercise schedule, complete inventory            |

---

## 8. Change Log

| Version | Date      | Author        | Changes                              |
| ------- | --------- | ------------- | ------------------------------------ |
| 1.0     | July 2026 | Security Team | Initial NIST CSF 2.0 control mapping |

## Cross-References

- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system
