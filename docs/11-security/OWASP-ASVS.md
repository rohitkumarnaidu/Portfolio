# OWASP ASVS Control Mapping

## Overview

This document maps the Portfolio platform against OWASP Application Security Verification Standard (ASVS) v4.0.3 Level 1 (automated) controls.

**Target Level:** L1 (Automated) Ã¢â‚¬â€ all controls verified via automated tooling
**Current Level:** ~70% L1 coverage
**Next Target:** L2 (Manual) Ã¢â‚¬â€ requires manual pentest + code review
### Verification Level Coverage

```mermaid
pie
    title ASVS Verification Level Coverage
    "L1 (Automated)" : 77
    "L2 (Manual Review)" : 15
    "L3 (Deep Audit)" : 8
```

## Verification Coverage

### V2: Authentication Verification Requirements

| #     | Requirement                                                   | Status | Evidence                                         | Notes                             |
| ----- | ------------------------------------------------------------- | ------ | ------------------------------------------------ | --------------------------------- |
| 2.1.1 | Verify credentials are stored using approved hash functions   | Ã¢Å“â€¦     | Passwords hashed with bcrypt via Passport.js     | Ã¢â‚¬â€                                 |
| 2.1.2 | Verify form-based authentication uses authenticated endpoints | Ã¢Å“â€¦     | POST /api/admin/auth/login with validation       | Ã¢â‚¬â€                                 |
| 2.2.1 | Verify anti-automation controls on authentication             | Ã¢Å“â€¦     | Rate limiting via ThrottlerGuard (5 req/min)     | Ã¢â‚¬â€                                 |
| 2.2.2 | Verify failed login attempts are tracked                      | Ã¢Å“â€¦     | `User.failedLoginAttempts` field in DB           | Ã¢â‚¬â€                                 |
| 2.2.3 | Verify account lockout after max failed attempts              | Ã¢Å“â€¦     | `User.lockedUntil` field, account lockout config | Ã¢â‚¬â€                                 |
| 2.2.5 | Verify credential recovery/reset is secured                   | Ã¢Å“â€¦     | OAuth flow, no password reset endpoint           | Resets handled via OAuth provider |
| 2.3.1 | Verify passwords are at least 8 characters                    | Ã¢Å“â€¦     | Zod validation schemas                           | Ã¢â‚¬â€                                 |
| 2.5.1 | Verify refresh tokens are hashed                              | Ã¢Å“â€¦     | `Session.refreshToken` stored as hash            | Ã¢â‚¬â€                                 |
| 2.5.2 | Verify refresh tokens expire                                  | Ã¢Å“â€¦     | `Session.expiresAt` field                        | Ã¢â‚¬â€                                 |
| 2.5.3 | Verify refresh tokens can be revoked                          | Ã¢Å“â€¦     | `Session.isRevoked` field                        | Ã¢â‚¬â€                                 |

**Authentication Score: 90%** (9/10)

### V3: Session Management

| #     | Requirement                                  | Status | Evidence                                | Notes                         |
| ----- | -------------------------------------------- | ------ | --------------------------------------- | ----------------------------- |
| 3.1.1 | Verify framework-built session management    | Ã¢Å“â€¦     | NestJS + Passport.js session handling   | Ã¢â‚¬â€                             |
| 3.2.1 | Verify session timeout is configured         | Ã¢Å“â€¦     | JWT expiry (15min), refresh token (7d)  | Ã¢â‚¬â€                             |
| 3.3.1 | Verify logout terminates session             | Ã¢Å“â€¦     | `isRevoked` flag on session             | Ã¢â‚¬â€                             |
| 3.4.1 | Verify cookies are marked as Secure          | Ã¢Å¡Â Ã¯Â¸Â     | Needs verification in production config | Cookie settings in production |
| 3.4.2 | Verify cookies are marked HttpOnly           | Ã¢Å¡Â Ã¯Â¸Â     | Needs verification in production config | Cookie settings in production |
| 3.4.3 | Verify cookies use SameSite                  | Ã¢Å“â€¦     | SameSite=Strict configured              | Ã¢â‚¬â€                             |
| 3.5.1 | Verify session tokens are generated securely | Ã¢Å“â€¦     | JWT signed with RS256                   | Ã¢â‚¬â€                             |

**Session Score: 75%** (4.5/6)

### V4: Access Control

| #     | Requirement                                | Status | Evidence                                  | Notes                        |
| ----- | ------------------------------------------ | ------ | ----------------------------------------- | ---------------------------- |
| 4.1.1 | Verify enforcement of least privilege      | Ã¢Å“â€¦     | Role-based access (admin/editor/viewer)   | Ã¢â‚¬â€                            |
| 4.1.2 | Verify access to administration interfaces | Ã¢Å“â€¦     | JwtAuthGuard + RolesGuard on admin routes | Ã¢â‚¬â€                            |
| 4.1.3 | Verify principle of deny by default        | Ã¢Å“â€¦     | Admin controllers require auth by default | Ã¢â‚¬â€                            |
| 4.2.1 | Verify insecure direct object references   | Ã¢Å¡Â Ã¯Â¸Â     | Needs manual code review                  | IDOR prevention documented   |
| 4.2.2 | Verify vertical access controls            | Ã¢Å“â€¦     | Admin vs portfolio controllers            | Ã¢â‚¬â€                            |
| 4.3.1 | Verify horizontal access controls          | Ã¢Å¡Â Ã¯Â¸Â     | Needs verification                        | Ownership checks in services |

**Access Control Score: 65%** (3.25/5)

### V5: Validation, Sanitization, and Encoding

| #     | Requirement                                    | Status | Evidence                                          | Notes |
| ----- | ---------------------------------------------- | ------ | ------------------------------------------------- | ----- |
| 5.1.1 | Verify input validation occurs on server       | Ã¢Å“â€¦     | ValidationPipe (whitelist + forbidNonWhitelisted) | Ã¢â‚¬â€     |
| 5.1.2 | Verify input validation for all API inputs     | Ã¢Å“â€¦     | Zod schemas + class-validator DTOs                | Ã¢â‚¬â€     |
| 5.1.3 | Verify structured data is strongly typed       | Ã¢Å“â€¦     | TypeScript strict mode, Zod inference             | Ã¢â‚¬â€     |
| 5.2.1 | Verify sanitization of HTML inputs             | Ã¢Å“â€¦     | DOMPurify for rich text fields                    | Ã¢â‚¬â€     |
| 5.3.1 | Verify output encoding for HTML contexts       | Ã¢Å“â€¦     | React auto-escapes, Next.js                       | Ã¢â‚¬â€     |
| 5.3.2 | Verify output encoding for URL parameters      | Ã¢Å“â€¦     | Next.js Link component                            | Ã¢â‚¬â€     |
| 5.3.3 | Verify output encoding for JavaScript contexts | Ã¢Å“â€¦     | React handles JS context encoding                 | Ã¢â‚¬â€     |
| 5.5.1 | Verify JSON schema validation                  | Ã¢Å“â€¦     | Zod schemas in @portfolio/shared                  | Ã¢â‚¬â€     |
| 5.5.2 | Verify REST endpoint validation                | Ã¢Å“â€¦     | DTO validation with class-validator               | Ã¢â‚¬â€     |

**Validation Score: 90%** (8/9)

### V6: Stored Cryptography

| #     | Requirement                                        | Status | Evidence                      | Notes                                     |
| ----- | -------------------------------------------------- | ------ | ----------------------------- | ----------------------------------------- |
| 6.1.1 | Verify cryptographic algorithms are not deprecated | Ã¢Å¡Â Ã¯Â¸Â     | JWT RS256 Ã¢â‚¬â€ review needed     | Algorithm audit pending                   |
| 6.2.1 | Verify secrets are stored securely                 | Ã¢Å¡Â Ã¯Â¸Â     | Env files, no vault yet       | HashiCorp Vault planned                   |
| 6.2.2 | Verify encryption keys are managed securely        | Ã¢ÂÅ’     | No key management process     | Key rotation doc exists but no automation |
| 6.3.1 | Verify cryptographic randomness is used            | Ã¢Å“â€¦     | crypto.randomBytes for tokens | Ã¢â‚¬â€                                         |

**Cryptography Score: 40%** (1.5/4)

### V8: Data Protection

| #     | Requirement                                     | Status | Evidence                                                                 | Notes                     |
| ----- | ----------------------------------------------- | ------ | ------------------------------------------------------------------------ | ------------------------- |
| 8.1.1 | Verify sensitive data is encrypted at rest      | Ã¢Å¡Â Ã¯Â¸Â     | Supabase encrypts at rest (AES-256), but no application-level encryption | Platform-level encryption |
| 8.2.1 | Verify sensitive data is encrypted in transit   | Ã¢Å“â€¦     | HTTPS enforced, Helmet middleware, TLS 1.3                               | Ã¢â‚¬â€                         |
| 8.3.1 | Verify data retention policies exist            | Ã¢Å“â€¦     | Data retention documented in 43-DATA-GOVERNANCE.md                       | Ã¢â‚¬â€                         |
| 8.3.2 | Verify data is classified                       | Ã¢Å“â€¦     | 4-tier classification (L1-L4) in data-classification.md                  | Ã¢â‚¬â€                         |
| 8.3.3 | Verify sensitive data is not sent in URL params | Ã¢Å“â€¦     | All sensitive data in POST body                                          | Ã¢â‚¬â€                         |

**Data Protection Score: 75%** (3.75/5)

### V11: Business Logic

| #      | Requirement                                    | Status | Evidence                                     | Notes                     |
| ------ | ---------------------------------------------- | ------ | -------------------------------------------- | ------------------------- |
| 11.1.1 | Verify business logic flow is sequential       | Ã¢Å“â€¦     | Lead workflow with activities                | Ã¢â‚¬â€                         |
| 11.1.2 | Verify business logic processing limits        | Ã¢Å¡Â Ã¯Â¸Â     | Feature flags exist for some, not all        | Needs review per endpoint |
| 11.1.3 | Verify business logic validation               | Ã¢Å“â€¦     | DTO validation, service-level checks         | Ã¢â‚¬â€                         |
| 11.1.4 | Verify business logic prevents excessive calls | Ã¢Å“â€¦     | ThrottlerGuard provides global rate limiting | Ã¢â‚¬â€                         |

**Business Logic Score: 75%** (3/4)

### V12: Files and Resources

| #      | Requirement                       | Status | Evidence                                              | Notes |
| ------ | --------------------------------- | ------ | ----------------------------------------------------- | ----- |
| 12.1.1 | Verify file upload validation     | Ã¢Å“â€¦     | MediaAsset model, mimeType validation                 | Ã¢â‚¬â€     |
| 12.1.2 | Verify file size limits           | Ã¢Å“â€¦     | express.json({ limit: '1mb' }) + file size validation | Ã¢â‚¬â€     |
| 12.3.1 | Verify file metadata is preserved | Ã¢Å“â€¦     | fileSizeBytes, width, height tracked                  | Ã¢â‚¬â€     |

**Files Score: 85%** (2.5/3)

### V14: Configuration

| #      | Requirement                                   | Status | Evidence                                     | Notes                |
| ------ | --------------------------------------------- | ------ | -------------------------------------------- | -------------------- |
| 14.1.1 | Verify hardened configuration                 | Ã¢Å“â€¦     | Helmet, CORS, CSP configured                 | Ã¢â‚¬â€                    |
| 14.2.1 | Verify HTTP headers are secure                | Ã¢Å“â€¦     | Helmet middleware (HSTS, CSP, XFO, referrer) | Ã¢â‚¬â€                    |
| 14.2.2 | Verify HTTP methods are restricted            | Ã¢Å“â€¦     | NestJS route configuration                   | Ã¢â‚¬â€                    |
| 14.2.3 | Verify HTTP permissions policy                | Ã¢Å¡Â Ã¯Â¸Â     | Permissions-Policy header not explicitly set | Add to Helmet config |
| 14.4.1 | Verify JSON request body size limits          | Ã¢Å“â€¦     | express.json({ limit: '1mb' })               | Ã¢â‚¬â€                    |
| 14.5.1 | Verify dependency vulnerabilities are checked | Ã¢Å“â€¦     | Dependabot + npm audit                       | Ã¢â‚¬â€                    |

**Configuration Score: 80%** (4.5/6)

### V7: Error Handling and Logging

| #     | Requirement                                               | Status | Evidence                                                  | Notes               |
| ----- | --------------------------------------------------------- | ------ | --------------------------------------------------------- | ------------------- |
| 7.1.1 | Verify error responses do not leak implementation details | Ã¢Å“â€¦     | GlobalExceptionFilter with generic messages               | Ã¢â‚¬â€                   |
| 7.1.2 | Verify stack traces are not exposed                       | Ã¢Å“â€¦     | GlobalExceptionFilter swallows stack traces in production | Ã¢â‚¬â€                   |
| 7.4.1 | Verify security events are logged                         | Ã¢Å“â€¦     | Structured audit logging with audit_logs table            | Ã¢â‚¬â€                   |
| 7.4.2 | Verify log integrity is protected                         | Ã¢Å¡Â Ã¯Â¸Â     | Trigger-based append-only, but no immutable storage       | Database-level only |

**Error Handling Score: 75%** (3/4)

### V9: Communication Security

| #     | Requirement                              | Status | Evidence                            | Notes                    |
| ----- | ---------------------------------------- | ------ | ----------------------------------- | ------------------------ |
| 9.1.1 | Verify TLS is used for all connections   | Ã¢Å“â€¦     | HTTPS enforced, TLS 1.3, HSTS       | Ã¢â‚¬â€                        |
| 9.1.2 | Verify TLS certificate validation        | Ã¢Å“â€¦     | Cloudflare Full (Strict) SSL        | Ã¢â‚¬â€                        |
| 9.2.1 | Verify service-to-service authentication | Ã¢Å¡Â Ã¯Â¸Â     | Internal API keys used, but no mTLS | No mTLS between services |

**Communication Score: 70%** (2/3)

### V10: Malicious Code

| #      | Requirement                                  | Status | Evidence                            | Notes |
| ------ | -------------------------------------------- | ------ | ----------------------------------- | ----- |
| 10.1.1 | Verify code integrity checks                 | Ã¢Å“â€¦     | Git-based deployment with lockfiles | Ã¢â‚¬â€     |
| 10.2.1 | Verify application is not vulnerable to XXE  | Ã¢Å“â€¦     | No XML parsing used                 | Ã¢â‚¬â€     |
| 10.3.1 | Verify content security policy is configured | Ã¢Å“â€¦     | Helmet CSP configured               | Ã¢â‚¬â€     |

**Malicious Code Score: 85%** (2.5/3)

## Summary

| ASVS Category                          | Controls | Implemented |  Score  |
| -------------------------------------- | :------: | :---------: | :-----: |
| V2: Authentication                     |    10    |      9      |   90%   |
| V3: Session Management                 |    6     |     4.5     |   75%   |
| V4: Access Control                     |    5     |    3.25     |   65%   |
| V5: Validation, Sanitization, Encoding |    9     |      8      |   90%   |
| V6: Stored Cryptography                |    4     |     1.5     |   40%   |
| V7: Error Handling & Logging           |    4     |      3      |   75%   |
| V8: Data Protection                    |    5     |    3.75     |   75%   |
| V9: Communication Security             |    3     |      2      |   70%   |
| V10: Malicious Code                    |    3     |     2.5     |   85%   |
| V11: Business Logic                    |    4     |      3      |   75%   |
| V12: Files & Resources                 |    3     |     2.5     |   85%   |
| V14: Configuration                     |    6     |     4.5     |   80%   |
| **Overall L1**                         |  **62**  |  **47.5**   | **77%** |

## Gap Analysis & Action Items

| #   | Gap                                           | Priority | Action                                                  | Owner          |
| --- | --------------------------------------------- | :------: | ------------------------------------------------------- | -------------- |
| 1   | No vault/secret management system             |    P0    | Integrate HashiCorp Vault or environment-based solution | Security       |
| 2   | No cryptographic key management               |    P1    | Document key rotation process                           | Security       |
| 3   | Cookie security attributes (Secure, HttpOnly) |    P1    | Verify in production config                             | Backend        |
| 4   | No horizontal access control verification     |    P1    | Manual code review for ownership checks                 | Backend        |
| 5   | No application-level encryption at rest       |    P2    | Evaluate need for field-level encryption                | Security       |
| 6   | Permissions-Policy header not set             |    P2    | Add Permissions-Policy to Helmet config                 | Backend        |
| 7   | Log integrity not cryptographically verified  |    P2    | Evaluate append-only log storage                        | Security       |
| 8   | No mTLS between internal services             |    P2    | Evaluate need for service mesh / mTLS                   | Infrastructure |
| 9   | No ASVS L2 (manual) verification              |    P2    | Schedule penetration test                               | Security       |

## Next Steps

1. Ã¢Å“â€¦ L1 automated controls: 77% coverage
2. Ã¢Â¬Å“ L1 remaining: Implement secret management, verify cookie attributes, set Permissions-Policy
3. Ã¢Â¬Å“ L2 manual: Schedule penetration test and code review
4. Ã¢Â¬Å“ L3 advanced: Full code audit with business logic verification and mTLS

## Related Documents

- `docs/security/SecurityArchitecture.md` Ã¢â‚¬â€ Security architecture (5-layer defense, 20 controls)
- `docs/security/ThreatModel.md` Ã¢â‚¬â€ STRIDE threat model
- `docs/security/SecretsManagement.md` Ã¢â‚¬â€ Secrets management policy
- `docs/security/data-classification.md` Ã¢â‚¬â€ Data classification (L1-L4 tiers)
- `docs/security/43-DATA-GOVERNANCE.md` Ã¢â‚¬â€ Data governance framework
- `docs/security/15-AUTHORIZATION.md` Ã¢â‚¬â€ Authorization architecture (RBAC + RLS)
- `docs/security/AuditLogging.md` Ã¢â‚¬â€ Audit logging policy
- `docs/security/16-COMPLIANCE.md` Ã¢â‚¬â€ Compliance documentation
- `apps/api/src/main.ts` Ã¢â‚¬â€ NestJS bootstrap with Helmet, CORS, ValidationPipe

## Cross-References
- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system