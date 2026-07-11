# 🛡️ Privacy & Data Protection — GDPR/CCPA Compliance Framework

> **Document:** `PRIVACY.md` | **Version:** 1.0 | **Last Updated:** July 2026  
> **Status:** ✅ Active | **Owner:** Chief Security Architect | **Review Cadence:** Quarterly  
> **Related:** [AnalyticsArchitecture.md](../operations/AnalyticsArchitecture.md) | [SecurityArchitecture.md](./SecurityArchitecture.md) | [16-COMPLIANCE.md](./16-COMPLIANCE.md)

---

## Executive Summary

This document defines the privacy and data protection framework for the Portfolio platform, ensuring compliance with GDPR (EU), CCPA (California), and other applicable privacy regulations. It covers data collection principles, consent management, PII handling, data subject rights, retention policies, and enforcement mechanisms across the analytics, AI, and core platform services. The framework follows a privacy-by-design approach, embedding data protection controls at every layer of the architecture. All analytics events (90+ across 12 domains), AI telemetry, and contact-form submissions are governed by the policies defined herein.

---

## Table of Contents

1. [Data Collection Principles](#1-data-collection-principles)
2. [Regulatory Compliance (GDPR / CCPA)](#2-regulatory-compliance-gdpr--ccpa)
3. [PII Classification & Handling](#3-pii-classification--handling)
4. [Cookie Consent & Tracking Governance](#4-cookie-consent--tracking-governance)
5. [Data Retention & Deletion](#5-data-retention--deletion)
6. [Data Subject Rights](#6-data-subject-rights)
7. [Analytics Privacy](#7-analytics-privacy)
8. [Breach Notification](#8-breach-notification)
9. [Related Documentation](#9-related-documentation)
10. [Change Log](#10-change-log)

---

## 1. Data Collection Principles

All data collection on the platform follows four core principles:

- **Lawfulness, Fairness & Transparency:** Users are informed of what data is collected and why via a clear privacy notice and cookie consent banner. Consent is obtained before any non-essential tracking.
- **Purpose Limitation:** Data is collected only for specified, explicit, and legitimate purposes (analytics, portfolio engagement, contact, AI interaction). No secondary processing without separate consent.
- **Data Minimization:** Only the minimum data necessary for each purpose is collected. Analytics events avoid PII by design; PostHog and Umami are configured to mask IP addresses and disable cookie-based tracking.
- **Accountability:** The platform maintains a record of processing activities (ROPA) per GDPR Art. 30. All data flows are documented in [AnalyticsArchitecture.md](../operations/AnalyticsArchitecture.md) and validated against the event schema registry.

## 2. Regulatory Compliance (GDPR / CCPA)

The platform maintains compliance with GDPR (EU) and CCPA (California). Key measures include: lawful basis documented per processing activity (Art. 6), DPIA completed for AI chat and analytics, DPAs in place with Vercel, Supabase, PostHog, and Umami (Art. 28), DSAR portal with automated erasure pipeline (Art. 17), JSON data portability endpoint (Art. 20), and a "Do Not Sell My Info" toggle for CCPA opt-out. Detailed compliance controls are documented in [16-COMPLIANCE.md](./16-COMPLIANCE.md).

## 3. PII Classification & Handling

PII is classified into three tiers per [data-classification.md](./data-classification.md): **Tier 1 (Public)** — unrestricted portfolio content; **Tier 2 (Internal)** — pseudonymised analytics events encrypted at rest; **Tier 3 (Restricted)** — contact form submissions, OAuth profiles, and AI chat logs, encrypted at rest (AES-256-GCM) and in transit (TLS 1.3), access logged via [AuditLogging.md](./AuditLogging.md), and retained per strict schedules below. Access is restricted to authorized personnel via the RBAC model in [15-AUTHORIZATION.md](./15-AUTHORIZATION.md).

## 4. Cookie Consent & Tracking Governance

The platform uses a three-tier cookie consent system: **Essential** (session cookies, CSRF, JWTs — no consent required), **Analytics** (PostHog, Umami — opt-in), and **Functional** (AI chat personalisation — opt-in). Consent records are stored in Supabase with timestamp, hashed IP, scope, and expiry. Users can withdraw consent at any time via the admin dashboard privacy settings.

## 5. Data Retention & Deletion

Retention is tiered by data category, enforced via automated cron jobs in the API: analytics events (raw) are hard-deleted after 7 days (anonymised aggregates retained 24 months), contact form submissions after 12 months, AI chat logs after 90 days (anonymised) with hard delete at 180 days, and audit logs archived to cold storage at 36 months. Deletion is verified by an automated reconciliation job that runs weekly.

## 6. Data Subject Rights

Data subjects may exercise rights through the DSAR portal at `/api/privacy/dsar` or by contacting the DPO. Supported rights: access (JSON export within 30 days, GDPR Art. 15), rectification (admin dashboard), erasure (automated cascade deletion with audit trail), restriction of processing (flag-based analytics suppression), and data portability (JSON/CSV export). The DSAR process is detailed in [16-COMPLIANCE.md](./16-COMPLIANCE.md) Section 10.

## 7. Analytics Privacy

Privacy controls are embedded per analytics provider: **Umami** — IP masking, no cookies, EU-hosted; **PostHog** — IP geolocation disabled, cookie-less tracking, server-side PII stripping via plugin, US-hosted with DPA; **Vercel Analytics** — edge-computed, aggregate only, no persistent individual events; **Custom DB (Supabase)** — PII columns encrypted, analytics schema isolated via RLS, no PII in event payloads by design. All events are validated against the schema registry in [AnalyticsArchitecture.md](../operations/AnalyticsArchitecture.md) to prevent PII leakage.

## 8. Breach Notification

In the event of a personal data breach, the following notification timeline is enforced:

- **Internal Discovery → Containment:** Within 1 hour. Security team is paged via PagerDuty. System access is revoked for compromised credentials.
- **Supervisory Authority Notification (GDPR Art. 33):** Within 72 hours of discovery. Notification includes nature of breach, categories of data affected, approximate number of records, contact details of DPO, and remediation steps.
- **Data Subject Notification (GDPR Art. 34):** Without undue delay when high risk to rights and freedoms. Notification is sent via email and platform banner.

The incident response procedure is detailed in [SecurityArchitecture.md](./SecurityArchitecture.md) Incident Response sections and [vulnerability-management-policy.md](./vulnerability-management-policy.md).

## 9. Related Documentation

| Document                                                           | Purpose                                                      |
| ------------------------------------------------------------------ | ------------------------------------------------------------ |
| [SecurityArchitecture.md](./SecurityArchitecture.md)               | Overall security posture, encryption, access control         |
| [16-COMPLIANCE.md](./16-COMPLIANCE.md)                             | Full compliance framework, DSAR process, breach notification |
| [AnalyticsArchitecture.md](../operations/AnalyticsArchitecture.md) | Analytics event taxonomy, data flows, event schema           |
| [data-classification.md](./data-classification.md)                 | Data classification tiers and handling requirements          |
| [15-AUTHORIZATION.md](./15-AUTHORIZATION.md)                       | RBAC model governing PII access                              |
| [AuditLogging.md](./AuditLogging.md)                               | Audit trail for PII access events                            |

## 10. Change Log

| Version | Date      | Author                   | Changes                                               |
| ------- | --------- | ------------------------ | ----------------------------------------------------- |
| 1.0     | July 2026 | Chief Security Architect | Initial release — privacy & data protection framework |
