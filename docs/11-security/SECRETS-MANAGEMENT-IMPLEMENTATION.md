# Secrets Management Implementation Guide

> **Document:** `SECRETS-MANAGEMENT-IMPLEMENTATION.md` | **Version:** 2.0 | **Last Updated:** July 2026
> **Status:** Active | **Standard:** NIST SP 800-57, OWASP Top 10:2025 A05 | **Owner:** Staff DevOps
> **Supersedes:** `docs/security/SecretsManagement.md` (v1.0)

---

## 1. Architecture Overview

Secrets flow through three zones: **source of truth** (provider dashboards), **storage** (env vars at each layer), and **runtime consumption** (app process environment).

```mermaid
graph TB
    subgraph "Source of Truth"
        GH["GitHub Secrets<br/>CI/CD tokens"]
        VERCEL["Vercel Environment<br/>Web + API env vars"]
        RAIL["Railway Secrets<br/>AI service env vars"]
        SUPABASE["Supabase Dashboard<br/>DB creds, API keys"]
    end

    subgraph "Storage Layer"
        CI["GitHub Actions<br/>encrypted secrets"]
        PROD_ENV["Production Env<br/>Vercel + Railway"]
        LOCAL[".env.local<br/>(gitignored)"]
        DOCKER["Docker secrets<br/>build args"]
    end

    subgraph "Runtime"
        NEXT["Next.js (web)<br/>process.env"]
        NEST["NestJS (api)<br/>ConfigService"]
        FASTAPI["FastAPI (ai)<br/>pydantic-settings"]
    end

    GH --> CI
    VERCEL --> PROD_ENV
    RAIL --> PROD_ENV
    SUPABASE --> PROD_ENV
    CI --> DOCKER
    PROD_ENV --> NEXT & NEST & FASTAPI
    LOCAL --> NEXT & NEST & FASTAPI
```

### 1.1 Principle: Never in Source Code

Secrets MUST never appear in committed files. The `.gitignore` enforces this for:
- `.env` / `.env.local` / `.env.*.local`
- Any file matching `*secret*` or `*credential*` patterns
- `config/*.env` (sibling of `.env.example`, never committed)

---

## 2. Secret Types and Storage Locations

| # | Secret | Storage (Dev) | Storage (CI) | Storage (Prod) | Access Scope | Rotation |
|---|--------|--------------|--------------|----------------|-------------|----------|
| 1 | `DATABASE_URL` | `.env.local` | GitHub Secret | Vercel + Railway env | API, AI services | 180d |
| 2 | `JWT_SECRET` | `.env.local` | GitHub Secret | Vercel env (API) | NestJS auth module | 90d |
| 3 | `JWT_REFRESH_SECRET` | `.env.local` | GitHub Secret | Vercel env (API) | NestJS auth module | 90d |
| 4 | `JWT_SECRET` | `.env.local` | GitHub Secret | Vercel env (web) | NestJS Passport | 90d |
| 5 | `OPENAI_API_KEY` | `.env.local` | GitHub Secret | Railway env | FastAPI AI service | 90d |
| 6 | `ANTHROPIC_API_KEY` | `.env.local` | GitHub Secret | Railway env | FastAPI AI service | 90d |
| 7 | `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` | GitHub Secret | Vercel + Railway env | NestJS, FastAPI | 365d |
| 8 | `SUPABASE_ANON_KEY` | `.env.local` | GitHub Secret | Vercel env (web) | Next.js client | 365d |
| 9 | `RESEND_API_KEY` | `.env.local` | GitHub Secret | Vercel env (API) | NestJS email service | 180d |
| 10 | `SENTRY_DSN` | `.env.local` | GitHub Secret | Vercel + Railway env | All services | 365d |
| 11 | `GITHUB_OAUTH_CLIENT_SECRET` | `.env.local` | GitHub Secret | Vercel env (API) | NestJS Passport OAuth | 365d |
| 12 | `GOOGLE_OAUTH_CLIENT_SECRET` | `.env.local` | GitHub Secret | Vercel env (API) | NestJS Passport OAuth | 365d |
| 13 | `HCAPTCHA_SECRET_KEY` | `.env.local` | GitHub Secret | Vercel env (API) | NestJS captcha guard | 365d |

### 2.1 Public (Non-Secret) Config Vars

These are safe to commit in `.env.example` and do not require protection:

| Variable | Purpose | Example Value |
|----------|---------|---------------|
| `NEXT_PUBLIC_POSTHOG_KEY` | Analytics public key | `phc_xxxxxxxx` |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog endpoint | `https://app.posthog.com` |
| `NEXT_PUBLIC_SENTRY_DSN` | Error reporting DSN | `https://xxx@sentry.io/xxx` |
| `LOCKOUT_THRESHOLD` | Account lockout config | `5` |
| `LOCKOUT_DURATION_MS` | Lockout duration | `900000` |

These are prefixed with `NEXT_PUBLIC_` because Next.js inlines them at build time. They are not sensitive but should still follow least-privilege principles.

---

## 3. Local Development Setup

### 3.1 Bootstrap Process

```powershell
# Step 1: Copy example file (committed to repo)
copy config\.env.example config\.env

# Step 2: Fill in real values
notepad config\.env
# DATABASE_URL=postgresql://postgres:xxxxx@localhost:54322/postgres
# OPENAI_API_KEY=sk-xxxxx
# (continue for all 13 secrets)

# Step 3: Verify .env is gitignored
git check-ignore config\.env
# Should print: config/.env
```

### 3.2 .env Loading Chain

The project uses dotenv/turborepo to load from `config/.env` (root). The resolution order is:

1. `config/.env.local` Ã¢â‚¬â€ overrides everything, NEVER committed
2. `config/.env` Ã¢â‚¬â€ per-environment defaults, NEVER committed
3. `config/.env.example` Ã¢â‚¬â€ template with placeholder values, committed

Turborepo globalDependencies in `turbo.json` includes `**/.env.*local` to invalidate cache when local env changes.

### 3.3 Pre-commit Secret Scanning

A pre-commit hook via Husky + lint-staged runs:

```bash
# Scan staged changes for potential secrets
npx --yes secretlint "**/*"
# OR use git-secrets
git secrets --scan
```

For manual scans:
```bash
# Scan entire repo for high-entropy strings
trufflehog filesystem --directory=. --json | ConvertFrom-Json | Where-Object { $_.severity -ge 3 }
```

---

## 4. Production Injection

### 4.1 Vercel (Web + API)

Vercel projects use **Environment Variables** configured per environment (Production/Preview/Development):

```bash
# Vercel CLI Ã¢â‚¬â€ set production env vars
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Bulk set from .env
vercel env pull
```

For Next.js public vars (available client-side):
```bash
vercel env add NEXT_PUBLIC_POSTHOG_KEY production
```

Vercel encrypts all env var values at rest and exposes them only to the serverless function runtime.

### 4.2 Railway (AI Service)

```bash
# Railway CLI Ã¢â‚¬â€ set secrets
railway variables set DATABASE_URL=<value>
railway variables set OPENAI_API_KEY=<value>
railway variables set ANTHROPIC_API_KEY=<value>

# Or via dashboard: Project Ã¢â€ â€™ Variables Ã¢â€ â€™ New Variable
```

Railway supports `${{ secrets.VAR_NAME }}` interpolation in `railway.json` for referencing project variables.

### 4.3 Docker Build Args

For Docker image builds in CI (`.github/workflows/ci.yml`):

```yaml
# Build args are NEVER hardcoded in Dockerfile
# Passed via GitHub Actions secrets:
- uses: docker/build-push-action@v6
  with:
    context: apps/api
    build-args: |
      SENTRY_DSN=${{ secrets.SENTRY_DSN }}
```

Each Dockerfile accepts `ARG` at build time:

```dockerfile
# apps/api/Dockerfile
ARG SENTRY_DSN
ENV SENTRY_DSN=$SENTRY_DSN
```

Runtime secrets (DB passwords, API keys) are NEVER baked into images. They are injected via environment at deployment time.

### 4.4 Supabase Secrets

Database credentials are rotated in the Supabase dashboard and updated across all environments:

1. Supabase Dashboard Ã¢â€ â€™ Project Settings Ã¢â€ â€™ Database Ã¢â€ â€™ Rotate Database Password
2. Update `DATABASE_URL` in Vercel and Railway
3. Redeploy API and AI services

---

## 5. Rotation Procedures

See `docs/security/secrets-rotation-schedule.md` for the full schedule. This section summarizes per-secret procedure.

### 5.1 Grace Period Rotation (JWT, NEXTAUTH, OpenAI, Anthropic, Resend)

Secrets with 24h grace period support zero-downtime rotation:

```text
1. Generate new secret: openssl rand -base64 48
2. Add _NEW variant to env (e.g., JWT_SECRET_NEW, OPENAI_API_KEY_NEW)
3. Deploy app with fallback chain (new || old)
4. Verify new tokens/workflows succeed
5. After 24h: remove old secret, rename _NEW to primary, remove fallback code
6. Redeploy
```

### 5.2 Immediate Rotation (DATABASE_URL, SUPABASE keys, SENTRY, OAuth, hCaptcha)

Secrets with no grace period require careful sequencing:

```text
1. Prepare maintenance window notification (#devops channel)
2. Rotate at source (Supabase/Sentry/OAuth dashboard)
3. Copy new value
4. Update all environments simultaneously
5. Redeploy all affected services
6. Verify health checks pass
7. If failure: revert env vars and redeploy (old value still valid at source for ~5min)
```

### 5.3 Step-by-Step for All 13 Secrets

| Secret | Procedure Detailed In | Steps | Duration |
|--------|----------------------|-------|----------|
| JWT_SECRET | `secrets-rotation-schedule.md` Ã‚Â§3.1 | 6 steps (grace period) | 15min |
| JWT_REFRESH_SECRET | `secrets-rotation-schedule.md` Ã‚Â§3.1 | 6 steps (grace period) | 15min |
| JWT_SECRET | Same as JWT pattern | 6 steps (grace period) | 15min |
| DATABASE_URL | `secrets-rotation-schedule.md` Ã‚Â§3.2 | 6 steps (immediate) | 30min |
| RESEND_API_KEY | `secrets-rotation-schedule.md` Ã‚Â§3.3 | 5 steps (grace period) | 10min |
| OPENAI_API_KEY | `secrets-rotation-schedule.md` Ã‚Â§3.5 | 5 steps (grace period) | 10min |
| ANTHROPIC_API_KEY | `secrets-rotation-schedule.md` Ã‚Â§3.5 | 5 steps (grace period) | 10min |
| SUPABASE_SERVICE_ROLE_KEY | `secrets-rotation-schedule.md` Ã‚Â§3.6 | 5 steps (immediate) | 10min |
| SUPABASE_ANON_KEY | `secrets-rotation-schedule.md` Ã‚Â§3.6 | 5 steps (immediate) | 10min |
| SENTRY_DSN | `secrets-rotation-schedule.md` Ã‚Â§3.8 | 3 steps (immediate) | 5min |
| GITHUB_OAUTH_CLIENT_SECRET | `secrets-rotation-schedule.md` Ã‚Â§3.7 | 4 steps (immediate) | 15min |
| GOOGLE_OAUTH_CLIENT_SECRET | `secrets-rotation-schedule.md` Ã‚Â§3.7 | 4 steps (immediate) | 15min |
| HCAPTCHA_SECRET_KEY | `secrets-rotation-schedule.md` Ã‚Â§3.9 | 3 steps (immediate) | 5min |

---

## 6. Emergency Rotation (Compromise Response)

### 6.1 Compromise Triage

| Signal | Action | Escalate If |
|--------|--------|-------------|
| GitHub secret scanning alert | Investigate commit, rotate leaked secret | Public repo fork detected |
| Sentry error shows secret in log output | Rotate secret, fix logging filter | Secret captured in error tracking |
| Unauthorized API requests spike | Rotate all keys, revoke tokens | Evidence of data exfiltration |
| Failed OAuth attempts from unknown IPs | Rotate OAuth client secrets | Multiple provider credentials affected |

### 6.2 Emergency Rotation Procedure

```text
Ã¢â€¢â€Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢â€”
Ã¢â€¢â€˜              EMERGENCY ROTATION - NO GRACE PERIOD            Ã¢â€¢â€˜
Ã¢â€¢Â Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â£
Ã¢â€¢â€˜ T-0min:   Identify compromised secret                       Ã¢â€¢â€˜
Ã¢â€¢â€˜ T-2min:   Open incident in #security-alerts                 Ã¢â€¢â€˜
Ã¢â€¢â€˜ T-5min:   Generate new secret, update env, redeploy         Ã¢â€¢â€˜
Ã¢â€¢â€˜ T-10min:  Revoke old secret at provider dashboard           Ã¢â€¢â€˜
Ã¢â€¢â€˜ T-15min:  Verify all health checks pass                     Ã¢â€¢â€˜
Ã¢â€¢â€˜ T-30min:  Review audit logs for unauthorized access         Ã¢â€¢â€˜
Ã¢â€¢â€˜ T-60min:  Notify affected users (if PII exposed)            Ã¢â€¢â€˜
Ã¢â€¢â€˜ T-4h:     Determine root cause, document findings           Ã¢â€¢â€˜
Ã¢â€¢Å¡Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
```

### 6.3 Post-Compromise Checklist

- Was the secret valid at time of exposure?
- Is there evidence of unauthorized usage? Check provider dashboards (usage graphs, IP logs)
- Were any tokens signed with compromised JWT secrets? If yes, invalidate all sessions.
- Does the provider support credential revocation? (OpenAI, Anthropic, Resend: yes; Supabase: via password rotate)
- Should dependent secrets also be rotated? (e.g., if DATABASE_URL compromises, also rotate SERVICE_ROLE_KEY)

---

## 7. Tools

### 7.1 GitHub CLI (`gh`)

```bash
# List secrets for a repository
gh secret list --repo portfolio/portfolio

# Set a secret
gh secret set DATABASE_URL --repo portfolio/portfolio --body "$(cat config\.env | Select-String 'DATABASE_URL' | Select-String -NotMatch '#')"

# Remove a secret
gh secret remove DATABASE_URL --repo portfolio/portfolio
```

### 7.2 Vercel CLI

```bash
# List environment variables
vercel env list

# Add production variable
vercel env add DATABASE_URL production

# Pull environment to local .env
vercel env pull
```

### 7.3 Docker Secrets (for self-hosted deployments)

When running Docker containers outside Vercel/Railway:

```yaml
# docker-compose.yml
services:
  api:
    image: ghcr.io/portfolio/portfolio/api:latest
    secrets:
      - db_url
      - jwt_secret
    env_file: .env

secrets:
  db_url:
    file: ./secrets/db_url.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

### 7.4 Local Secret Generation

```bash
# Generate cryptographically secure random strings
openssl rand -base64 48   # 64-char secret (JWT, NEXTAUTH)
openssl rand -hex 32      # 64-char hex (API keys)

# Check entropy
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

---

## 8. Audit Logging

### 8.1 Rotation Audit Trail

Every rotation MUST be logged in the rotation history (maintained in `secrets-rotation-schedule.md` Ã‚Â§5):

```json
{
  "rotation_id": "ROT-2026-001",
  "secret_name": "JWT_SECRET",
  "rotation_type": "scheduled",
  "rotated_by": "staff.devops@portfolio.dev",
  "rotated_at": "2026-07-15T10:00:00Z",
  "status": "completed",
  "verification": "passed"
}
```

### 8.2 Runtime Secret Access Logging

All secret access is logged via:

| Layer | Log Source | Retention | Alert Rule |
|-------|-----------|-----------|------------|
| Vercel env access | Vercel Audit Logs (dashboard) | 90 days | Export env vars Ã¢â€ â€™ alert |
| Railway variable access | Railway Activity Log | 30 days | N/A (console only) |
| GitHub secret access | GitHub Audit Log | 90 days | Secret updated by non-DevOps |
| Supabase key usage | Supabase Logs (SQL editor) | 7 days | Anon key used from unknown IP |
| Application-level | Pino structured logs | 30 days | ConfigService init error |

### 8.3 Alerting Thresholds

| Event | Channel | Severity | Response |
|-------|---------|----------|----------|
| GitHub secret modified | #security-alerts | High | Verify with DevOps team |
| Vercel env variable exported | #security-alerts | Medium | Check Audit Log for context |
| Supabase key rotated outside schedule | #security-alerts | Critical | Immediate investigation |
| Failed config load (missing secret) | Pager (Better Uptime) | Critical | Emergency redeployment |

---

## 9. Decision Log

| Decision | Date | Rationale | Alternatives Considered |
|----------|------|-----------|------------------------|
| No Vault/Secrets Manager | July 2026 | Free-tier constraints; platform-native env vars sufficient for scale | AWS Secrets Manager ($), Hashicorp Vault (ops overhead), Doppler ($) |
| `.env` at repo root | June 2026 | Turborepo loads from root; shared across workspaces | Per-workspace `.env` (rejected for DX friction) |
| `_NEW` suffix for grace rotation | July 2026 | Zero-downtime rotation without secret manager | Multi-version config map (over-engineered), single-var swap (downtime) |
| GitHub Actions secrets for CI | June 2026 | Native GHA integration; free for public repos | OpenID Connect (more secure but complex for current scale) |
| Public vars as `NEXT_PUBLIC_*` | June 2026 | Next.js convention for client-safe build-time inlining | Server-only with API proxy (latency overhead) |
| No Docker build-time secrets for runtime | June 2026 | Prevents secret baking in image layers; best practice | Multi-stage with secret mounts (Docker BuildKit, more complex) |

---

## 10. Verification Checklist

### Pre-Deploy

- [ ] `.env` is in `.gitignore` and not staged
- [ ] All 13 required secrets are set in target environment (Vercel/Railway)
- [ ] `config/.env.example` has placeholder values (no real secrets)
- [ ] Docker images contain no build-arg secrets in runtime layers

### Post-Deploy

- [ ] Health check endpoints return 200
- [ ] Auth tokens can be issued and verified (JWT)
- [ ] Database connections succeed (API)
- [ ] AI chat requests complete (FastAPI)
- [ ] Emails can be sent (Resend)
- [ ] Error reporting reaches Sentry
- [ ] Analytics events reach PostHog
- [ ] Captcha verification works on contact form
- [ ] OAuth login flows work (GitHub, Google)

### Weekly

- [ ] GitHub secret scanning alerts reviewed
- [ ] `npm audit` for dependency vulnerabilities
- [ ] Vercel Audit Log checked for env access events

## Cross-References
- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system