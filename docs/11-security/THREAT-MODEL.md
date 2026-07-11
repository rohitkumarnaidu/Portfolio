# Threat Model

> **Document:** `11-security/THREAT-MODEL.md` | **Version:** 2.0 | **Last Updated:** July 2026
> **Status:** Active | **Methodology:** STRIDE + DREAD | **Owner:** Security Lead
> **Review Cadence:** Quarterly | **Scope:** Full system (Web + API + AI + Database)

---

## 1. Methodology

### 1.1 STRIDE per Element

Each system component is analyzed against six threat categories:

| Category | Violation | Definition |
|----------|-----------|------------|
| **S**poofing | Authentication | Impersonating a user, service, or component |
| **T**ampering | Integrity | Unauthorized modification of data or code |
| **R**epudiation | Non-repudiation | Denying an action without traceability |
| **I**nformation Disclosure | Confidentiality | Exposure of data to unauthorized parties |
| **D**enial of Service | Availability | Disrupting legitimate access to services |
| **E**levation of Privilege | Authorization | Gaining unauthorized access or permissions |

### 1.2 DREAD Risk Scoring

Each threat is scored 0–10 across five dimensions, then averaged for a composite score:

| Dimension | 0–3 (Low) | 4–6 (Medium) | 7–10 (High) |
|-----------|-----------|--------------|-------------|
| **D**amage potential | Minor data loss | Data corruption | Full system compromise |
| **R**eproducibility | Extremely hard | Moderate effort | Trivially repeatable |
| **E**xploitability | Requires insider access | Some skill needed | Public exploit available |
| **A**ffected users | < 1% of users | 1–25% of users | > 25% of users |
| **D**iscoverability | Requires source access | Difficult to find | Publicly documented |

**Risk Level Mapping:**

| DREAD Score | Risk Level | Response |
|-------------|------------|----------|
| 7.5 – 10.0 | **Critical** | Immediate fix, within current sprint |
| 5.0 – 7.4 | **High** | Fix within next sprint |
| 3.0 – 4.9 | **Medium** | Add to backlog, fix within 30 days |
| 0 – 2.9 | **Low** | Accept or monitor |

---

## 2. System Entry Points

| # | Entry Point | Protocol | Auth Required | Rate Limited | Description |
|---|-------------|----------|---------------|--------------|-------------|
| EP-01 | Public web pages | HTTPS | No | Edge-level | Portfolio pages served via Vercel CDN |
| EP-02 | Admin login page | HTTPS | No | Yes (5/15min) | `/admin/login` — email + OAuth |
| EP-03 | Portfolio API endpoints | HTTPS | No (read) | Yes (100/min) | `/api/portfolio/*` — public, cached |
| EP-04 | Admin API endpoints | HTTPS | JWT required | Yes (60/min) | `/api/admin/*` — CRUD operations |
| EP-05 | AI chat endpoint | HTTPS | No (session) | Yes (20/session) | `/api/ai/chat` — LLM interaction |
| EP-06 | Contact form | HTTPS | No | Yes (3/hr/IP) | `/api/portfolio/leads` — lead submission |
| EP-07 | File upload (media) | HTTPS | JWT required | Yes (10/hr) | `/api/admin/upload` — images, PDFs |
| EP-08 | OAuth callbacks | HTTPS | No | Yes (10/hr/IP) | `/api/auth/*/callback` — Google/GitHub |
| EP-09 | Webhooks | HTTPS | HMAC signature | Yes | External service notifications |
| EP-10 | WebSocket (realtime) | WSS | JWT required | Yes | Real-time admin dashboard updates |

---

## 3. Trust Boundaries

```
                     TRUST BOUNDARY 1
    Browser ────────────────────────────── Vercel CDN
       │                                        │
       │           TRUST BOUNDARY 2              │
       │    Vercel CDN ─────────────────── Next.js Server
       │                                        │
       │              TRUST BOUNDARY 3           │
       │         Next.js Server ────────── NestJS API
       │                                        │
       │   ┌─────────────────┬──────────────────┴──────┐
       │   │                 │                         │
       │   │  TRUST BOUNDARY 4│    TRUST BOUNDARY 5     │
       │   │ NestJS API ── Supabase│ NestJS API ── FastAPI │
       │   │                 │                         │
       │   │                 │    TRUST BOUNDARY 6      │
       │   │                 │   FastAPI ── OpenAI/Anthropic
```

| Boundary | From | To | Data Sensitivity | Security Controls |
|----------|------|----|------------------|-------------------|
| TB-01 | Browser | Vercel CDN | Low (public pages) | TLS 1.3, HSTS, CSP, CORS |
| TB-02 | Vercel CDN | Next.js Server | Low–Medium | WAF, IP filtering, edge rate limiting |
| TB-03 | Next.js Server | NestJS API | Medium (JWT tokens) | Server-to-server API key, TLS 1.3 |
| TB-04 | NestJS API | Supabase | High (PII, credentials) | RLS, parameterized queries, TLS 1.3 |
| TB-05 | NestJS API | FastAPI AI | Medium (chat history) | Internal network, API key auth |
| TB-06 | FastAPI AI | OpenAI/Anthropic | Medium (prompts) | Server-side keys, no PII in prompts |

---

## 4. STRIDE Threat Analysis

### 4.1 Spoofing

| ID | Element | Description | Attack Vector | D | R | E | A | D | Total | Risk | Mitigation |
|----|---------|-------------|---------------|---|---|---|---|---|-------|------|------------|
| T-001 | Auth Service | JWT token forgery to impersonate admin | Weak JWT secret, algorithm confusion (alg:none) | 9 | 7 | 8 | 9 | 8 | **8.2** | **Critical** | Strong JWT secret (>256-bit), RS256 algorithm whitelist, short TTL (15min access, 7d refresh) |
| T-002 | OAuth Flow | OAuth token interception via redirect | Man-in-the-middle on OAuth callback | 8 | 6 | 7 | 8 | 6 | **7.0** | **High** | PKCE flow enforcement, state parameter validation, allowlisted redirect URIs |
| T-003 | All Pages | Session hijacking via XSS | Stored XSS in blog/project content steals httpOnly session | 8 | 7 | 7 | 9 | 5 | **7.2** | **High** | CSP with strict-dynamic, DOMPurify on all user content, httpOnly+Secure+SameSite cookies |

### 4.2 Tampering

| ID | Element | Description | Attack Vector | D | R | E | A | D | Total | Risk | Mitigation |
|----|---------|-------------|---------------|---|---|---|---|---|-------|------|------------|
| T-004 | Contact Form | Lead form data manipulation mid-transit | Intercept and modify form submission (name, email, message) | 3 | 3 | 4 | 3 | 5 | **3.6** | **Medium** | TLS 1.3, CSRF tokens, server-side re-validation of all fields |
| T-005 | API Calls | MITM tampering of API request/response | ARP spoofing, rogue CA, SSL stripping | 6 | 4 | 4 | 7 | 4 | **5.0** | **High** | HSTS preload, certificate pinning, TLS 1.3 only (no TLS 1.2 fallback) |
| T-006 | ISR Cache | Cache poisoning via ISR revalidation abuse | Crafted revalidation request serves malicious cached page to visitors | 5 | 5 | 5 | 7 | 6 | **5.6** | **High** | Signed ISR tokens, revalidate path whitelist, short cache TTL (60s) |
| T-004b | File Upload | Malicious file upload overwrites existing asset | Upload with same filename as existing asset; path traversal in filename | 6 | 6 | 5 | 5 | 5 | **5.4** | **High** | Sanitized filenames, UUID-based storage keys, MIME validation, virus scanning |

### 4.3 Repudiation

| ID | Element | Description | Attack Vector | D | R | E | A | D | Total | Risk | Mitigation |
|----|---------|-------------|---------------|---|---|---|---|---|-------|------|------------|
| T-007 | Admin Dashboard | Admin denies performing destructive action (delete project) | No audit trail for delete operations; logs not tamper-proof | 5 | 4 | 3 | 3 | 8 | **4.6** | **Medium** | Immutable audit log with trigger-based capture, before/after snapshots, signed log entries |
| T-008 | Lead Management | Lead status changes without attribution | Admin toggles lead status; no record of who made the change | 4 | 5 | 4 | 3 | 5 | **4.2** | **Medium** | Every mutation includes `updated_by` and `updated_at`; audit trigger on all lead tables |

### 4.4 Information Disclosure

| ID | Element | Description | Attack Vector | D | R | E | A | D | Total | Risk | Mitigation |
|----|---------|-------------|---------------|---|---|---|---|---|-------|------|------------|
| T-009 | API Error Handler | Stack trace exposure in production error responses | Trigger an unhandled exception; server returns full traceback | 4 | 9 | 8 | 8 | 2 | **6.2** | **High** | Global exception filter returns generic message, logs full trace to Sentry only |
| T-010 | API Schema | Internal API schema / DTO structure exposure | Introspect error messages; enumerate endpoints via 401 vs 403 differences | 2 | 7 | 5 | 3 | 2 | **3.8** | **Medium** | Consistent error responses, no field-level hints, `forbidNonWhitelisted` on ValidationPipe |
| T-011 | Logging System | PII leakage in application logs | User submits contact form with PII; logger writes full payload to stdout | 6 | 5 | 3 | 9 | 8 | **6.2** | **High** | PII scrubbing middleware, structured logging with redacted fields, audit log separate from app log |
| T-012 | AI Service | AI chat history leakage between sessions | Session ID collision or cache bug exposes previous user's conversation | 9 | 6 | 5 | 8 | 7 | **7.0** | **High** | Session-scoped chat isolation, prompt metadata validation, no shared caches |

### 4.5 Denial of Service

| ID | Element | Description | Attack Vector | D | R | E | A | D | Total | Risk | Mitigation |
|----|---------|-------------|---------------|---|---|---|---|---|-------|------|------------|
| T-013 | API Gateway | API endpoint flooding exhausts server resources | Botnet sends 10K req/s to `/api/portfolio/*` | 6 | 8 | 9 | 7 | 7 | **7.4** | **High** | Vercel WAF + Cloudflare DDoS, rate limiting (8 tiers), auto-scaling, circuit breaker |
| T-014 | AI Endpoint | AI cost exhaustion via prompt abuse | Attacker sends 10K long-context prompts; $500+ in API costs | 7 | 8 | 9 | 4 | 9 | **7.4** | **High** | Per-session token cap (4K), global daily spend limit, cost anomaly alerts |
| T-015 | Database | Database connection pool exhaustion | Open connections without close; slow queries hold connections | 6 | 7 | 6 | 7 | 5 | **6.2** | **High** | Connection pool limits (20), query timeout (10s), PgBouncer, RDS proxy |

### 4.6 Elevation of Privilege

| ID | Element | Description | Attack Vector | D | R | E | A | D | Total | Risk | Mitigation |
|----|---------|-------------|---------------|---|---|---|---|---|-------|------|------------|
| T-016 | Auth Service | Role escalation via JWT manipulation | Modify `role` claim from `viewer` to `admin` in JWT payload | 10 | 7 | 8 | 10 | 8 | **8.6** | **Critical** | JWT signed server-side, role claim verified on every request, RLS double-check at DB layer |
| T-017 | Admin API | IDOR on admin endpoints (access other user's data) | Change resource ID in URL: `/api/admin/leads/123` -> `/api/admin/leads/456` | 9 | 8 | 7 | 8 | 7 | **7.8** | **Critical** | Ownership validation in service layer, RLS policies, UUID (non-sequential) resource IDs |
| T-018 | Database | RLS bypass via direct DB connection | Attacker obtains Supabase connection string; queries directly bypassing RLS | 9 | 6 | 5 | 8 | 7 | **7.0** | **High** | Connection string in server-only env vars, Supabase IP restrictions, no public DB access |

### 4.7 AI-Specific Threats

| ID | Element | Description | Attack Vector | D | R | E | A | D | Total | Risk | Mitigation |
|----|---------|-------------|---------------|---|---|---|---|---|-------|------|------------|
| T-019 | AI Chat | Prompt injection / jailbreaking | User crafts prompt to bypass system instructions or extract system prompt | 8 | 9 | 8 | 3 | 9 | **7.4** | **High** | System prompt boundary enforcement, input length limit (2K), output moderation, adversarial prompt detection |
| T-020 | RAG Pipeline | Data poisoning in RAG context | Attacker injects malicious content into DB that gets vectorized and served to other users | 6 | 5 | 5 | 5 | 6 | **5.4** | **High** | Only authenticated admin content gets vectorized, RAG context sanitization, periodic embedding integrity checks |
| T-021 | Vector DB | Embedding inversion attack reconstructs source data | Attacker obtains embeddings and reverses them to approximate source text | 4 | 3 | 4 | 3 | 4 | **3.6** | **Medium** | Store only embeddings, not source text in vector DB; differential privacy on embeddings; no raw document retrieval |

---

## 5. Attack Tree: Admin Account Compromise

```
Goal: Attacker gains admin access
│
├── OR 1.0 Credential Theft
│   ├── 1.1 Phishing attack
│   │   ├── 1.1.1 Fake login page (credential harvesting)
│   │   └── 1.1.2 Spear-phishing email with malicious link
│   │   └── Mitigations: Email SPF/DKIM/DMARC, admin awareness training, MFA requirement
│   │
│   ├── 1.2 Credential stuffing
│   │   ├── 1.2.1 Previously breached password reuse
│   │   └── 1.2.2 Automated login attempts with breached creds
│   │   └── Mitigations: Rate limiting (5 attempts/15min), account lockout (30min), breached password check
│   │
│   └── 1.3 Keylogger / malware
│       └── 1.3.1 Admin machine compromised
│       └── Mitigations: MFA (hardware key if possible), session binding to IP/user-agent
│
├── OR 2.0 Session Hijacking
│   ├── 2.1 XSS-based token theft
│   │   ├── 2.1.1 Stored XSS in blog comments or project content
│   │   └── 2.1.2 Reflected XSS via crafted URL parameter
│   │   └── Mitigations: CSP with strict-dynamic, DOMPurify, httpOnly cookies
│   │
│   ├── 2.2 Network token interception
│   │   └── 2.2.1 MITM on unsecured network
│   │   └── Mitigations: TLS 1.3 everywhere, HSTS preload, no token in URL
│   │
│   ├── 2.3 CSRF-based state change
│   │   └── 2.3.1 Forge request to change email or reset MFA
│   │   └── Mitigations: CSRF tokens, SameSite=Strict cookies, origin header check
│   │
│   └── 2.4 Session fixation
│       └── 2.4.1 Attacker sets session ID before admin logs in
│       └── Mitigations: Regenerate session ID on login, session binding to IP
│
├── OR 3.0 OAuth Provider Compromise
│   ├── 3.1 Google/GitHub account takeover
│   │   └── 3.1.1 Admin's Google/GitHub account hacked
│   │   └── Mitigations: Require MFA on OAuth provider, separate admin-only email
│   │
│   └── 3.2 Malicious OAuth app grant
│       └── 3.2.1 Admin grants access to malicious third-party app
│       └── Mitigations: Google/GitHub OAuth consent screen review, app allowlist
│
└── OR 4.0 JWT Secret Compromise
    ├── 4.1 Secret leaked in code/CI logs
    │   └── 4.1.1 Accidental commit of `.env` or CI pipeline log exposure
    │   └── Mitigations: `.env` in `.gitignore`, secret scanning (pre-commit hooks), CI log redaction
    │
    └── 4.2 Secret brute-forced
        └── 4.2.1 Weak JWT secret allows offline brute force
        └── Mitigations: 256-bit random secret, periodic rotation (90 days)
```

---

## 6. Risk Heat Map

Likelihood × Impact matrix for the top 10 threats (rated 1–5 in each dimension):

| Threat ID | Description | Likelihood (1–5) | Impact (1–5) | Risk Score | Risk Level | Treatment |
|-----------|-------------|------------------|--------------|------------|------------|-----------|
| T-016 | Role escalation via JWT manipulation | 2 | 5 | 10 | **Critical** | Mitigate — signed JWT, RLS double-check |
| T-001 | JWT token forgery | 2 | 5 | 10 | **Critical** | Mitigate — strong secret, RS256, short TTL |
| T-017 | IDOR on admin endpoints | 3 | 5 | 15 | **Critical** | Mitigate — ownership validation, UUID, RLS |
| T-013 | API endpoint flooding | 4 | 4 | 16 | **High** | Mitigate — WAF, rate limit, auto-scale |
| T-014 | AI cost exhaustion | 4 | 4 | 16 | **High** | Mitigate — token caps, spend limits |
| T-018 | RLS bypass via direct DB | 2 | 5 | 10 | **Critical** | Mitigate — server-only secrets, IP restriction |
| T-003 | Session hijacking via XSS | 3 | 4 | 12 | **High** | Mitigate — CSP, DOMPurify, httpOnly cookies |
| T-019 | Prompt injection / jailbreak | 5 | 3 | 15 | **High** | Mitigate — prompt boundary, adversarial detection |
| T-015 | DB connection pool exhaustion | 3 | 4 | 12 | **High** | Mitigate — pool limits, PgBouncer |
| T-012 | AI chat history leakage | 2 | 4 | 8 | **Medium** | Mitigate — session isolation, no shared caches |

**Risk Heat Map Matrix:**

| Likelihood ↓ \ Impact → | 1 (Minor) | 2 (Moderate) | 3 (Significant) | 4 (Major) | 5 (Critical) |
|--------------------------|-----------|---------------|-----------------|------------|--------------|
| **5 (Very Likely)** | | | T-019 (15) | | |
| **4 (Likely)** | | | | T-013 (16), T-014 (16) | |
| **3 (Possible)** | | | | T-003 (12), T-015 (12) | T-017 (15) |
| **2 (Unlikely)** | | | T-020 (10) | T-002 (8), T-012 (8) | T-001 (10), T-016 (10), T-018 (10) |
| **1 (Rare)** | T-010 (3) | T-004 (4) | T-006 (6) | | |

**Color Key:** 🟢 Low (1–5) | 🟡 Medium (6–10) | 🟠 High (11–15) | 🔴 Critical (16–20)

---

## 7. Threat Mitigation Summary

| Control Layer | Threats Mitigated | Controls |
|---------------|-------------------|----------|
| **Edge** | T-013 (DDoS), T-005 (MITM) | Cloudflare WAF, Vercel Edge, TLS 1.3, HSTS |
| **Gateway** | T-001 (Forgery), T-016 (Escalation), T-017 (IDOR) | JWT auth, RBAC guards, rate limiting, input validation |
| **Application** | T-003 (XSS), T-004 (Tamper), T-019 (Prompt injection) | DOMPurify, CSRF tokens, adversarial prompt detection |
| **Data** | T-007/008 (Repudiation), T-018 (RLS bypass), T-011 (PII) | Audit triggers, RLS policies, PII scrubbing, parameterized queries |
| **External** | T-014 (Cost), T-002 (OAuth), T-021 (Embeddings) | Token caps, PKCE, restricted API keys |

---

## 8. Review Schedule

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Threat model review | Quarterly | Security Lead |
| DREAD score reassessment | Quarterly | Security Lead |
| Attack tree update | Half-yearly | Security Lead |
| Penetration test | Yearly | External pentester |
| Dependency vulnerability scan | Weekly (automated) | Dependabot |

---

## 9. Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| July 2026 | 2.0 | Full rewrite with STRIDE + DREAD scoring, attack tree, risk heat map, 21 threats | Security Lead |
