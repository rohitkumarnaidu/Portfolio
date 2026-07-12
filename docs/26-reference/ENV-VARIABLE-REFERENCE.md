# Environment Variable Reference

> **Document:** `26-reference/ENV-VARIABLE-REFERENCE.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** ✅ Active | **Owner:** DevOps Lead | **Source:** `config/.env.example`

---

## Classification Legend

| Badge | Meaning |
|-------|---------|
| 🔴 Secret | Must never be committed, logged, or exposed. Rotate quarterly. |
| 🟡 Internal | Safe in env files but not public. Rotate annually. |
| 🟢 Public | Safe to expose in client-side code (prefixed `NEXT_PUBLIC_`). |

## Core

| Variable | Req | Description | Default | Secret | Used By |
|----------|-----|-------------|---------|--------|---------|
| `NODE_ENV` | Required | Runtime environment | `development` | 🟢 | all |
| `PORT` | Optional | API server port | `3001` | 🟢 | api |
| `CORS_ORIGIN` | Required | Allowed CORS origin | `http://localhost:3000` | 🟡 | api |
| `API_VERSION` | Optional | API version header | `1` | 🟢 | api |

## Database (Supabase)

| Variable | Req | Description | Default | Secret | Used By |
|----------|-----|-------------|---------|--------|---------|
| `DATABASE_URL` | Required | PostgreSQL connection string | — | 🔴 | api |
| `SUPABASE_URL` | Required | Supabase project URL | — | 🟡 | api |
| `SUPABASE_ANON_KEY` | Required | Public anon key | — | 🟡 | api |
| `SUPABASE_SERVICE_ROLE_KEY` | Required | Service role key (admin) | — | 🔴 | api |

## Authentication

| Variable | Req | Description | Default | Secret | Used By |
|----------|-----|-------------|---------|--------|---------|
| `JWT_SECRET` | Required | JWT signing secret (256-bit) | — | 🔴 | api |
| `JWT_EXPIRATION` | Optional | Access token TTL | `15m` | 🟡 | api |
| `NEXTAUTH_SECRET` | Required | NextAuth.js secret | — | 🔴 | web |
| `NEXTAUTH_URL` | Required | NextAuth.js base URL | `http://localhost:3000` | 🟡 | web |

## AI Service

| Variable | Req | Description | Default | Secret | Used By |
|----------|-----|-------------|---------|--------|---------|
| `OPENAI_API_KEY` | Required | OpenAI API key | — | 🔴 | ai |
| `ANTHROPIC_API_KEY` | Optional | Anthropic API key (fallback) | — | 🔴 | ai |
| `AI_MODEL` | Optional | Default LLM model | `gpt-4o` | 🟢 | ai |
| `AI_TEMPERATURE` | Optional | LLM temperature | `0.7` | 🟢 | ai |
| `AI_MAX_TOKENS` | Optional | Max response tokens | `500` | 🟢 | ai |
| `COST_BUDGET_DAILY` | Optional | Daily AI cost cap ($) | `10` | 🟢 | ai |

## Monitoring

| Variable | Req | Description | Default | Secret | Used By |
|----------|-----|-------------|---------|--------|---------|
| `SENTRY_DSN` | Required | Sentry server-side DSN | — | 🔴 | api |
| `NEXT_PUBLIC_SENTRY_DSN` | Required | Sentry client-side DSN | — | 🟡 | web |
| `SENTRY_ENVIRONMENT` | Optional | Environment tag | `development` | 🟢 | all |
| `NEXT_PUBLIC_POSTHOG_KEY` | Required | PostHog API key | — | 🟡 | web |
| `NEXT_PUBLIC_POSTHOG_HOST` | Optional | PostHog host | `https://app.posthog.com` | 🟢 | web |

## Email (Resend)

| Variable | Req | Description | Default | Secret | Used By |
|----------|-----|-------------|---------|--------|---------|
| `RESEND_API_KEY` | Required | Resend API key | — | 🔴 | api |
| `EMAIL_FROM` | Required | Sender email address | `noreply@portfolio.com` | 🟡 | api |
| `ADMIN_NOTIFICATION_EMAIL` | Required | Admin notification recipient | `admin@portfolio.com` | 🟡 | api |

## Storage

| Variable | Req | Description | Default | Secret | Used By |
|----------|-----|-------------|---------|--------|---------|
| `REDIS_URL` | Required | Redis connection string | `redis://localhost:6379` | 🔴 | api |
| `SUPABASE_STORAGE_BUCKET` | Optional | Media storage bucket | `media` | 🟢 | api |

## Analytics

| Variable | Req | Description | Default | Secret | Used By |
|----------|-----|-------------|---------|--------|---------|
| `NEXT_PUBLIC_GA_ID` | Optional | Google Analytics ID | — | 🟡 | web |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Optional | Google Search Console verification | — | 🟢 | web |

## Account Lockout

| Variable | Req | Description | Default | Secret | Used By |
|----------|-----|-------------|---------|--------|---------|
| `LOCKOUT_THRESHOLD` | Optional | Failed attempts before lockout | `5` | 🟢 | api |
| `LOCKOUT_DURATION_MS` | Optional | Lockout duration in ms | `900000` (15 min) | 🟢 | api |

---

## Environment Matrix

| Variable | Local (.env) | Vercel | Railway | Docker Compose |
|----------|-------------|--------|---------|----------------|
| `DATABASE_URL` | ✅ | ❌ | ❌ | ✅ (local PG) |
| `SUPABASE_*` | ✅ | ✅ | ❌ | ❌ |
| `JWT_SECRET` | ✅ | ✅ | ❌ | ✅ |
| `OPENAI_API_KEY` | ✅ | ❌ | ✅ | ✅ |
| `SENTRY_DSN` | ✅ | ✅ | ✅ | ✅ |
| `REDIS_URL` | ✅ | ❌ | ❌ | ✅ (local Redis) |
| `NEXT_PUBLIC_*` | ✅ | ✅ | ❌ | ✅ |

## Secret Rotation Schedule

| Variable | Rotation | Last Rotated | Next Due |
|----------|----------|-------------|----------|
| `JWT_SECRET` | Quarterly | — | — |
| `OPENAI_API_KEY` | Quarterly | — | — |
| `ANTHROPIC_API_KEY` | Quarterly | — | — |
| `SUPABASE_SERVICE_ROLE_KEY` | Annually | — | — |
| `RESEND_API_KEY` | Annually | — | — |
| `NEXTAUTH_SECRET` | Annually | — | — |
| `SENTRY_DSN` | Annually | — | — |

Secrets are stored in: Vercel Environment Variables (web + api), Railway Secrets (ai), and local `config/.env` (never committed).

---

*Document Version: 1.0 | Last Updated: July 2026*

## Cross-References
- [MASTER-INDEX.md](../MASTER-INDEX.md) — Documentation master index
- [CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) — Cross-reference system
