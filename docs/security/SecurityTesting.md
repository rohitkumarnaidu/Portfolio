# Security Testing Strategy

> **Document:** `SecurityTesting.md` | **Version:** 2.0 | **Last Updated:** July 2026
> **Status:** ✅ Active | **Owner:** Security Lead

## 1. Overview

As an enterprise application managing a portfolio, AI interactions, and an admin backend, security is a primary concern. Our architecture spans Next.js, NestJS, FastAPI, and Supabase Postgres. This document defines the security testing approach across static analysis, dynamic scanning, dependency auditing, and penetration testing.

## 2. Security Boundaries & Architecture

- **Web Layer (Next.js):** CSRF protection, Content Security Policy (CSP), secure cookie handling.
- **API Layer (NestJS):** Rate limiting, input validation, JWT verification, role-based access control (RBAC).
- **AI Layer (FastAPI):** Prompt injection defense, output sanitization.
- **Database (Supabase):** Row-Level Security (RLS) policies, network isolation.

## 3. Static Application Security Testing (SAST)

### 3.1 CodeQL

- **Tool:** GitHub CodeQL (integrated into GitHub Actions).
- **Trigger:** Runs on every PR and on every push to `main`.
- **Languages analyzed:** TypeScript (web, api), Python (ai).
- **Query suites:** `security-extended`, `security-and-quality`.
- **Gate:** PRs with CodeQL alerts classified as `error` or `warning` are blocked from merge.
- **Triage:** Alerts reviewed within 1 week. False positives marked with `// codeql[alert-id]` inline suppression.

### 3.2 ESLint Security Plugins

- `eslint-plugin-security` detects unsafe patterns (e.g., `eval()`, `innerHTML`).
- `eslint-plugin-no-secrets` blocks accidental secret commits.
- Both run as part of `npm run lint`.

## 4. Dynamic Application Security Testing (DAST)

### 4.1 OWASP ZAP

- **Tool:** OWASP ZAP (Zed Attack Proxy).
- **Schedule:** Monthly automated scan against staging environment.
- **Scope:** All API endpoints (portfolio + admin), all public web pages.
- **Scans:**
  - Passive scan: Spider all pages, analyze responses for security headers, info disclosure.
  - Active scan: XSS, SQL injection, path traversal, CSRF, command injection.
- **Reporting:** JSON report uploaded to GitHub Security tab.
- **Gate:** Critical findings trigger a SEV-2 security incident.

### 4.2 Custom DAST Scripts

- **Auth fuzzing:** Automated attempts to call admin endpoints without JWT, with expired JWT, with viewer JWT.
- **Rate limit testing:** Verify `ThrottlerGuard` blocks after N requests (configurable threshold).
- **CORS testing:** Verify only `CORS_ORIGIN` origins are allowed via `Origin` header manipulation.

## 5. Dependency Scanning

### 5.1 Dependabot

- **Tool:** GitHub Dependabot.
- **Configuration:** `.github/dependabot.yml` monitors `package.json` and `requirements.txt`.
- **Schedule:** Weekly scan on Monday.
- **Action:** Automated PRs created for patch and minor updates with vulnerability fixes.
- **Gate:** PRs introducing vulnerable dependencies (CVSS >= 7.0) are blocked from merge.

### 5.2 npm audit

- **Tool:** `npm audit` run in CI.
- **Gate:** CI fails if any vulnerability with severity `high` or `critical` is found.
- **Override:** Suppression requires security lead approval and documented risk acceptance.

### 5.3 Snyk (Optional)

- Additional layer of dependency scanning with deeper reachability analysis.
- Integrated in CI pipeline when enabled.

## 6. Container Scanning

### 6.1 Trivy

- **Tool:** Trivy (Aqua Security).
- **Scope:** Docker images for AI service (`apps/ai`) and any containerized components.
- **Trigger:** Runs on every PR that modifies Dockerfiles or `requirements.txt`.
- **Severity gate:** Fails build on `CRITICAL` or `HIGH` vulnerabilities.
- **Frequency:** Full scan weekly on `main` images.

### 6.2 Dockerfile Best Practices

- Use distroless or slim base images.
- No `root` user in container.
- Pin base image versions (no `latest` tag).
- Scan enforced via pre-commit hook.

## 7. Secret Scanning

### 7.1 GitHub Secret Scanning

- **Tool:** GitHub's built-in secret scanning (GitHub Advanced Security).
- **Scope:** All branches. Detects AWS keys, GitHub tokens, npm tokens, OpenAI API keys, JWT secrets.
- **Action:** Alerts sent to security lead. Pushes containing secrets are blocked.

### 7.2 Pre-Commit Hooks

- **Tool:** `git-secrets` or `trufflehog` run as a pre-commit hook.
- **Patterns:** API keys, tokens, connection strings, private keys, `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`.
- **Action:** Commit is rejected if a potential secret is detected.
- **Override:** `--no-verify` is discouraged and audited.

### 7.3 Secrets Management

- All secrets stored in Vercel Environment Variables or Doppler vault.
- Secrets are never committed to the repository.
- `.env` files are in `.gitignore`. `.env.example` contains placeholder values.

## 8. Penetration Testing

### 8.1 Annual Third-Party Pentest

- **Frequency:** Once per year (or after major architecture changes).
- **Scope:** Full application (web, API, AI service, infrastructure).
- **Provider:** External security firm.
- **Deliverables:** Pentest report with findings, severity ratings, and remediation recommendations.

### 8.2 Internal Security Review

- **Frequency:** Quarterly.
- **Scope:** Focused on new features, auth changes, and data handling.
- **Method:** Manual code review + automated tooling.

## 9. Bug Bounty & Disclosure

### 9.1 Coordinated Disclosure

- **Policy:** Defined in `SECURITY.md` at repo root.
- **Contact:** security@portfolio.dev
- **Response SLA:** 48 hours to acknowledge, 30 days to fix critical/high.
- **Recognition:** Contributors listed in `SECURITY.md` acknowledgments.

### 9.2 Bug Bounty Program

- **Status:** Planned (Q4 2026).
- **Scope:** Public portfolio pages, API endpoints, auth flows.
- **Out of scope:** AI prompt injection, social engineering, DoS.

## 10. Specific Security Testing Focus Areas

### 10.1 Authentication & Authorization

- Verify JWT signing algorithms (HS256/RS256) and expiration logic.
- Test NestJS `@Roles('admin')` guards. Ensure non-admin users receive 403 Forbidden.
- Test Supabase RLS policies by attempting unauthorized record access.
- Test OAuth flows for CSRF in state parameter, redirect URI validation.

### 10.2 API Security (NestJS & FastAPI)

- **Input Validation:** Ensure `ValidationPipe` strictly forbids non-whitelisted properties.
- **Rate Limiting:** Verify `ThrottlerGuard` blocks brute-force and DoS attempts.
- **CORS:** Verify `CORS_ORIGIN` prevents unauthorized domain access.
- **API Fuzzing:** Automated fuzzing of all endpoints with malformed payloads.

### 10.3 AI Security (LLM Vulnerabilities)

- **Prompt Injection:** Test with malicious prompts designed to leak system instructions.
- **Data Exfiltration:** Ensure RAG pipeline restricts vector searches based on user authorization.
- **Output Sanitization:** Verify AI responses do not contain sensitive data.

### 10.4 Web Security (XSS, CSRF, CSP)

- **XSS Testing:** Automated injection of script payloads in all form fields and URL parameters.
- **CSP Testing:** Verify Content-Security-Policy headers block inline scripts and unknown origins.
- **CSRF Testing:** Verify state-changing requests without proper tokens are rejected.
