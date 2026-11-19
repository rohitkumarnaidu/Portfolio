# Environment Configuration Matrix

## Environment Overview

| Environment  | Purpose                | URL                       | Hosting                     | Database              |
| ------------ | ---------------------- | ------------------------- | --------------------------- | --------------------- |
| Development  | Local development      | localhost:3000            | Local machine (Docker)      | Docker PostgreSQL     |
| Preview / PR | Per-PR validation      | \<pr\>.vercel.preview.app | Vercel (Preview)            | Supabase staging      |
| Staging      | Pre-production testing | staging.portfolio.dev     | Vercel (Preview/Production) | Supabase (staging)    |
| Production   | Live site              | portfolio.dev             | Vercel (Production)         | Supabase (production) |

## Environment Variables

### Core Configuration

| Variable             | Dev                   | Staging                           | Prod                      | Required | Secret |
| -------------------- | --------------------- | --------------------------------- | ------------------------- | -------- | ------ |
| NODE_ENV             | development           | staging                           | production                | âœ…  | âŒ  |
| PORT                 | 3001                  | 3001                              | 3001                      | âŒ    | âŒ  |
| CORS_ORIGIN          | http://localhost:3000 | https://staging.portfolio.dev     | https://portfolio.dev     | âŒ    | âŒ  |
| NEXT_PUBLIC_API_URL  | http://localhost:3001 | https://staging-api.portfolio.dev | https://api.portfolio.dev | âœ…  | âŒ  |
| NEXT_PUBLIC_SITE_URL | http://localhost:3000 | https://staging.portfolio.dev     | https://portfolio.dev     | âŒ    | âŒ  |
| NEXT_PUBLIC_AI_URL   | http://localhost:8000 | https://staging-ai.portfolio.dev  | https://ai.portfolio.dev  | âŒ    | âŒ  |

### Database & Supabase

| Variable                      | Dev                                                     | Staging                             | Prod                        | Required | Secret  |
| ----------------------------- | ------------------------------------------------------- | ----------------------------------- | --------------------------- | -------- | ------- |
| DATABASE_URL                  | postgresql://postgres:postgres@localhost:5432/portfolio | supabase-staging-url                | supabase-prod-url           | âœ…  | âœ… |
| SUPABASE_URL                  | http://localhost:54321                                  | https://staging-project.supabase.co | https://project.supabase.co | âœ…  | âŒ   |
| SUPABASE_ANON_KEY             | local-anon-key                                          | staging-anon-key                    | prod-anon-key               | âœ…  | âœ… |
| NEXT_PUBLIC_SUPABASE_URL      | http://localhost:54321                                  | https://staging-project.supabase.co | https://project.supabase.co | âœ…  | âŒ   |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | local-anon-key                                          | staging-anon-key                    | prod-anon-key               | âœ…  | âœ… |
| SUPABASE_SERVICE_ROLE_KEY     | local-service-role-key                                  | staging-service-role-key            | prod-service-role-key       | âœ…  | âœ… |

### Auth & JWT

| Variable               | Dev                                                | Staging                       | Prod                  | Required | Secret  |
| ---------------------- | -------------------------------------------------- | ----------------------------- | --------------------- | -------- | ------- |
| JWT_SECRET             | dev-jwt-secret-change-in-production-min-32-chars!! | staging-jwt-secret            | prod-jwt-secret       | âœ…  | âœ… |
| JWT_EXPIRES_IN         | 15m                                                | 15m                           | 15m                   | âŒ    | âŒ   |
| JWT_REFRESH_SECRET     | dev-refresh-secret-change-in-production-min-32!!   | staging-refresh-secret        | prod-refresh-secret   | âœ…  | âœ… |
| JWT_REFRESH_EXPIRES_IN | 7d                                                 | 7d                            | 7d                    | âŒ    | âŒ   |
| JWT_SECRET             | dev-jwt-secret                                     | staging-jwt-secret            | prod-jwt-secret       | —  | ✅ |
| NEXTAUTH_URL           | http://localhost:3000                              | https://staging.portfolio.dev | https://portfolio.dev | —  | ❌   |
| ADMIN_EMAIL            | admin@portfolio.com                                | admin@portfolio.com           | admin@portfolio.com   | âŒ    | âŒ   |
| ADMIN_PASSWORD         | **_REDACTED_**                                     | staging-admin-password        | prod-admin-password   | âŒ    | âœ… |

### OAuth Providers

| Variable             | Dev                                                  | Staging                                                          | Prod                                                     | Required | Secret  |
| -------------------- | ---------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------- | -------- | ------- |
| GITHUB_CLIENT_ID     | placeholder-id                                       | github-staging-id                                                | github-prod-id                                           | âœ…  | âŒ   |
| GITHUB_CLIENT_SECRET | placeholder-secret                                   | github-staging-secret                                            | github-prod-secret                                       | âœ…  | âœ… |
| GITHUB_CALLBACK_URL  | http://localhost:3001/api/admin/auth/github/callback | https://staging-api.portfolio.dev/api/admin/auth/github/callback | https://api.portfolio.dev/api/admin/auth/github/callback | âŒ    | âŒ   |
| GOOGLE_CLIENT_ID     | placeholder-id                                       | google-staging-id                                                | google-prod-id                                           | âœ…  | âŒ   |
| GOOGLE_CLIENT_SECRET | placeholder-secret                                   | google-staging-secret                                            | google-prod-secret                                       | âœ…  | âœ… |
| GOOGLE_CALLBACK_URL  | http://localhost:3001/api/admin/auth/google/callback | https://staging-api.portfolio.dev/api/admin/auth/google/callback | https://api.portfolio.dev/api/admin/auth/google/callback | âŒ    | âŒ   |

### Redis (Caching & Queue)

| Variable  | Dev                    | Staging             | Prod             | Required | Secret  |
| --------- | ---------------------- | ------------------- | ---------------- | -------- | ------- |
| REDIS_URL | redis://localhost:6379 | upstash-staging-url | upstash-prod-url | âœ…  | âœ… |
| CACHE_TTL | 30                     | 30                  | 30               | âŒ    | âŒ   |

### AI Service

| Variable          | Dev               | Staging               | Prod               | Required | Secret  |
| ----------------- | ----------------- | --------------------- | ------------------ | -------- | ------- |
| OPENAI_API_KEY    | dev-openai-key    | staging-openai-key    | prod-openai-key    | âœ…  | âœ… |
| ANTHROPIC_API_KEY | dev-anthropic-key | staging-anthropic-key | prod-anthropic-key | —  | ✅ |

### Email (Resend)

| Variable                 | Dev                   | Staging               | Prod                  | Required | Secret  |
| ------------------------ | --------------------- | --------------------- | --------------------- | -------- | ------- |
| RESEND_API_KEY           | dev-resend-key        | staging-resend-key    | prod-resend-key       | âœ…  | âœ… |
| EMAIL_FROM               | noreply@portfolio.com | noreply@portfolio.com | noreply@portfolio.com | âŒ    | âŒ   |
| ADMIN_NOTIFICATION_EMAIL | admin@portfolio.com   | admin@portfolio.com   | admin@portfolio.com   | âŒ    | âŒ   |

### Error Tracking (Sentry)

| Variable               | Dev     | Staging            | Prod            | Required | Secret  |
| ---------------------- | ------- | ------------------ | --------------- | -------- | ------- |
| SENTRY_DSN             | — | staging-sentry-dsn | prod-sentry-dsn | ❌    | ✅ |
| NEXT_PUBLIC_SENTRY_DSN | — | staging-sentry-dsn | prod-sentry-dsn | ❌    | ✅ |

### Analytics (PostHog)

| Variable                 | Dev                   | Staging                 | Prod                    | Required | Secret |
| ------------------------ | --------------------- | ----------------------- | ----------------------- | -------- | ------ |
| NEXT_PUBLIC_POSTHOG_KEY  | dev-posthog-key       | staging-posthog-key     | prod-posthog-key        | âŒ    | âŒ  |
| NEXT_PUBLIC_POSTHOG_HOST | http://localhost:8001 | https://app.posthog.com | https://app.posthog.com | âŒ    | âŒ  |

### Rate Limiting & Security

| Variable            | Dev    | Staging | Prod   | Required | Secret |
| ------------------- | ------ | ------- | ------ | -------- | ------ |
| RATE_LIMIT_TTL      | 60     | 60      | 60     | âŒ    | âŒ  |
| RATE_LIMIT_MAX      | 100    | 100     | 100    | âŒ    | âŒ  |
| LOCKOUT_THRESHOLD   | 5      | 5       | 5      | âŒ    | âŒ  |
| LOCKOUT_DURATION_MS | 900000 | 900000  | 900000 | âŒ    | âŒ  |

### Sandbox (GitHub)

| Variable                     | Dev               | Staging           | Prod               | Required | Secret  |
| ---------------------------- | ----------------- | ----------------- | ------------------ | -------- | ------- |
| GITHUB_PERSONAL_ACCESS_TOKEN | placeholder-token | placeholder-token | sandbox-prod-token | —  | ✅ |
| GITHUB_OWNER                 | placeholder-owner | placeholder-owner | portfolio-org      | —  | ❌   |
| GITHUB_REPO                  | placeholder-repo  | placeholder-repo  | portfolio          | —  | ❌   |

## Feature Flag Matrix

| Flag          | Dev                  | Staging              | Prod    |
| ------------- | -------------------- | -------------------- | ------- |
| AI Chatbot    | enabled              | enabled              | enabled |
| Admin Sandbox | enabled              | enabled              | enabled |
| Analytics     | disabled             | enabled              | enabled |
| Sentry APM    | disabled             | enabled (low sample) | enabled |
| Email (real)  | disabled (test mode) | disabled (test mode) | enabled |

## Environment Promotion

Changes flow: Dev â†’ Staging â†’ Production

1. **Dev**: Feature branches deployed as Vercel previews; local Docker environment for full stack
2. **PR Preview**: Auto-deployed per PR via Vercel; shared staging DB
3. **Staging**: Merged to `develop` branch; auto-deployed to staging domain
4. **Production**: Merged to `main` branch (with approval); auto-deployed to production domain

Secret values are stored in platform-specific vaults (Vercel Environment Variables, GitHub Secrets) — never in code.

---

## Diagram

### Environment Comparison

```mermaid
graph TD
    subgraph Development["Development"]
        DEV_Purpose["Purpose: Local dev & debugging"]
        DEV_URL["URL: localhost:3000"]
        DEV_DB["DB: Docker PostgreSQL (seed data)"]
        DEV_Config["Config: .env.local"]
        DEV_Gate["Gate: None"]
    end

    subgraph Preview["Preview / PR"]
        PREV_Purpose["Purpose: Per-PR validation"]
        PREV_URL["URL: <pr>.vercel.app"]
        PREV_DB["DB: Shared Supabase staging"]
        PREV_Config["Config: Vercel env vars"]
        PREV_Gate["Gate: CI checks pass"]
    end

    subgraph Staging["Staging"]
        STG_Purpose["Purpose: Pre-production QA"]
        STG_URL["URL: staging.portfolio.dev"]
        STG_DB["DB: Dedicated Supabase staging"]
        STG_Config["Config: Vercel env vars + GitHub secrets"]
        STG_Gate["Gate: Manual approval + load tests"]
    end

    subgraph Production["Production"]
        PROD_Purpose["Purpose: Live site"]
        PROD_URL["URL: portfolio.dev"]
        PROD_DB["DB: Dedicated Supabase prod (PITR)"]
        PROD_Config["Config: Vercel env vars + GitHub secrets"]
        PROD_Gate["Gate: Smoke tests + 30 min monitor"]
    end

    Development -->|Merge PR| Preview
    Preview -->|CI & QA pass| Staging
    Staging -->|Approval| Production
```

## Cross-References

- [../MASTER-INDEX.md](../../MASTER-INDEX.md) — Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) — Cross-reference system
