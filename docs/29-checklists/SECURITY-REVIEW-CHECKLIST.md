# Security Review Checklist

> **Document:** `29-checklists/SECURITY-REVIEW-CHECKLIST.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** ✅ Active | **Owner:** Security Lead | **Related:** OWASP ASVS L2, WCAG 2.2 AA

---

## Pre-Merge Checklist

Run on every PR targeting `main`. All items must pass before merging.

- [ ] **SAST passed** — CodeQL analysis reports zero high/critical findings
- [ ] **Dependency scan clean** — `npm audit` reports zero high/critical vulnerabilities
- [ ] **No secrets in code** — `trufflehog` scan passes; no API keys, tokens, or passwords in diff
- [ ] **No hardcoded credentials** — Connection strings, secrets use env vars only
- [ ] **Input validation** — All new API routes have DTOs with class-validator decorators
- [ ] **OWASP Top 10 check** — New code reviewed for: SQLi, XSS, broken auth, IDOR, CSRF, misconfiguration
- [ ] **RBAC enforcement** — New admin routes guarded with `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles()`
- [ ] **Audit logging** — New mutations use `@Audit()` decorator for traceability
- [ ] **Rate limiting** — New public endpoints have appropriate throttle limits
- [ ] **No console.log in production code** — Use structured logger (Pino) instead

## Pre-Deploy Checklist

Run before deploying to production.

- [ ] **CORS configured** — `CORS_ORIGIN` set to production domain, not `*`
- [ ] **Rate limits active** — Global throttler enabled; auth routes have stricter limits
- [ ] **CSP headers set** — Helmet configured with Content-Security-Policy restricting script-src, style-src
- [ ] **TLS enabled** — All traffic over HTTPS; HSTS header set (max-age=31536000)
- [ ] **Helmet security headers** — X-Frame-Options, X-Content-Type-Options, X-XSS-Protection enabled
- [ ] **Database RLS enabled** — Row-Level Security policies active on Supabase tables
- [ ] **Supabase bucket private** — Storage buckets are not public; access via signed URLs
- [ ] **Database migrations reviewed** — No destructive changes without data preservation plan
- [ ] **Secrets rotated if compromised** — Any secret exposed during development regenerated before deploy
- [ ] **Deployment rollback plan documented** — Known-good deployment identified, can rollback in < 5 min

## Post-Deploy Checklist

Run within 1 hour of production deployment.

- [ ] **Sentry reporting** — New errors appearing in Sentry with expected volume
- [ ] **Security headers verified** — `curl -I https://portfolio.dev` shows all expected headers
- [ ] **Auth flows working** — Login, registration, and OAuth flows functional
- [ ] **RBAC enforced** — Admin routes properly gated; viewer role cannot access mutations
- [ ] **Rate limiting working** — After 5 rapid requests, throttle response received (429)
- [ ] **Contact form working** — Submission succeeds; notification email received
- [ ] **AI chat working** — Chat responds with no errors logged
- [ ] **No CORS errors** — Browser console shows no CORS-related warnings
- [ ] **All environment variables set** — Verify no missing secrets causing 500 errors

## Monthly Checklist

- [ ] **Dependency updates** — `npm audit` reviewed; outdated packages scheduled for update
- [ ] **Secret rotation check** — Verify all secrets within rotation schedule (see `ENV-VARIABLE-REFERENCE.md`)
- [ ] **Access review** — Review admin users, verify roles are correct, remove inactive accounts
- [ ] **Log review** — Audit logs reviewed for suspicious activity (unusual login times, repeated failures)
- [ ] **Supabase RLS audit** — Verify RLS policies haven't been accidentally removed or weakened
- [ ] **Sentry health check** — Verify all expected alerts are active and not muted
- [ ] **CSP report review** — If `report-uri` configured, review CSP violation reports
- [ ] **Firewall rules review** — Cloudflare WAF rules up to date, no overly permissive rules

## Incident-Related Checklist

- [ ] **Post-mortem action items completed** — All security-related action items from last incident verified
- [ ] **Security patch deployed** — Any CVE-related patches applied within 48 hours of disclosure
- [ ] **Secrets rotated after incident** — All secrets potentially exposed during incident regenerated
- [ ] **Runbook updated** — Incident documented; response improvements merged
- [ ] **Monitoring gap closed** — Any alert that should have fired but didn't is now configured

---

*Document Version: 1.0 | Last Updated: July 2026*
