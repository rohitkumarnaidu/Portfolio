# Environment Configuration Matrix

## Environment Overview

| Environment | Purpose | URL | Hosting | Database |
|-------------|---------|-----|---------|----------|
| Development | Local development | localhost:3000 | Local machine (Docker) | Docker PostgreSQL |
| Preview / PR | Per-PR validation | \<pr\>.vercel.preview.app | Vercel (Preview) | Supabase staging |
| Staging | Pre-production testing | staging.portfolio.dev | Vercel (Preview/Production) | Supabase (staging) |
| Production | Live site | portfolio.dev | Vercel (Production) | Supabase (production) |

## Environment Variables

### Core Configuration
| Variable | Dev | Staging | Prod | Required | Secret |
|----------|-----|---------|------|----------|--------|
| NODE_ENV | development | staging | production | ✅ | ❌ |
| PORT | 3001 | 3001 | 3001 | ❌ | ❌ |
| CORS_ORIGIN | http://localhost:3000 | https://staging.portfolio.dev | https://portfolio.dev | ❌ | ❌ |
| NEXT_PUBLIC_API_URL | http://localhost:3001 | https://staging-api.portfolio.dev | https://api.portfolio.dev | ✅ | ❌ |
| NEXT_PUBLIC_SITE_URL | http://localhost:3000 | https://staging.portfolio.dev | https://portfolio.dev | ❌ | ❌ |
| NEXT_PUBLIC_AI_URL | http://localhost:8000 | https://staging-ai.portfolio.dev | https://ai.portfolio.dev | ❌ | ❌ |

### Database & Supabase
| Variable | Dev | Staging | Prod | Required | Secret |
|----------|-----|---------|------|----------|--------|
| DATABASE_URL | postgresql://postgres:postgres@localhost:5432/portfolio | supabase-staging-url | supabase-prod-url | ✅ | ✅ |
| SUPABASE_URL | http://localhost:54321 | https://staging-project.supabase.co | https://project.supabase.co | ✅ | ❌ |
| SUPABASE_ANON_KEY | local-anon-key | staging-anon-key | prod-anon-key | ✅ | ✅ |
| NEXT_PUBLIC_SUPABASE_URL | http://localhost:54321 | https://staging-project.supabase.co | https://project.supabase.co | ✅ | ❌ |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | local-anon-key | staging-anon-key | prod-anon-key | ✅ | ✅ |
| SUPABASE_SERVICE_ROLE_KEY | local-service-role-key | staging-service-role-key | prod-service-role-key | ✅ | ✅ |

### Auth & JWT
| Variable | Dev | Staging | Prod | Required | Secret |
|----------|-----|---------|------|----------|--------|
| JWT_SECRET | dev-jwt-secret-change-in-production-min-32-chars!! | staging-jwt-secret | prod-jwt-secret | ✅ | ✅ |
| JWT_EXPIRES_IN | 15m | 15m | 15m | ❌ | ❌ |
| JWT_REFRESH_SECRET | dev-refresh-secret-change-in-production-min-32!! | staging-refresh-secret | prod-refresh-secret | ✅ | ✅ |
| JWT_REFRESH_EXPIRES_IN | 7d | 7d | 7d | ❌ | ❌ |
| NEXTAUTH_SECRET | dev-nextauth-secret | staging-nextauth-secret | prod-nextauth-secret | — | ✅ |
| NEXTAUTH_URL | http://localhost:3000 | https://staging.portfolio.dev | https://portfolio.dev | — | ❌ |
| ADMIN_EMAIL | admin@portfolio.com | admin@portfolio.com | admin@portfolio.com | ❌ | ❌ |
| ADMIN_PASSWORD | Admin123! | staging-admin-password | prod-admin-password | ❌ | ✅ |

### OAuth Providers
| Variable | Dev | Staging | Prod | Required | Secret |
|----------|-----|---------|------|----------|--------|
| GITHUB_CLIENT_ID | placeholder-id | github-staging-id | github-prod-id | ✅ | ❌ |
| GITHUB_CLIENT_SECRET | placeholder-secret | github-staging-secret | github-prod-secret | ✅ | ✅ |
| GITHUB_CALLBACK_URL | http://localhost:3001/api/admin/auth/github/callback | https://staging-api.portfolio.dev/api/admin/auth/github/callback | https://api.portfolio.dev/api/admin/auth/github/callback | ❌ | ❌ |
| GOOGLE_CLIENT_ID | placeholder-id | google-staging-id | google-prod-id | ✅ | ❌ |
| GOOGLE_CLIENT_SECRET | placeholder-secret | google-staging-secret | google-prod-secret | ✅ | ✅ |
| GOOGLE_CALLBACK_URL | http://localhost:3001/api/admin/auth/google/callback | https://staging-api.portfolio.dev/api/admin/auth/google/callback | https://api.portfolio.dev/api/admin/auth/google/callback | ❌ | ❌ |

### Redis (Caching & Queue)
| Variable | Dev | Staging | Prod | Required | Secret |
|----------|-----|---------|------|----------|--------|
| REDIS_URL | redis://localhost:6379 | upstash-staging-url | upstash-prod-url | ✅ | ✅ |
| CACHE_TTL | 30 | 30 | 30 | ❌ | ❌ |

### AI Service
| Variable | Dev | Staging | Prod | Required | Secret |
|----------|-----|---------|------|----------|--------|
| OPENAI_API_KEY | dev-openai-key | staging-openai-key | prod-openai-key | ✅ | ✅ |
| ANTHROPIC_API_KEY | dev-anthropic-key | staging-anthropic-key | prod-anthropic-key | — | ✅ |

### Email (Resend)
| Variable | Dev | Staging | Prod | Required | Secret |
|----------|-----|---------|------|----------|--------|
| RESEND_API_KEY | dev-resend-key | staging-resend-key | prod-resend-key | ✅ | ✅ |
| EMAIL_FROM | noreply@portfolio.com | noreply@portfolio.com | noreply@portfolio.com | ❌ | ❌ |
| ADMIN_NOTIFICATION_EMAIL | admin@portfolio.com | admin@portfolio.com | admin@portfolio.com | ❌ | ❌ |

### Error Tracking (Sentry)
| Variable | Dev | Staging | Prod | Required | Secret |
|----------|-----|---------|------|----------|--------|
| SENTRY_DSN | — | staging-sentry-dsn | prod-sentry-dsn | ❌ | ✅ |
| NEXT_PUBLIC_SENTRY_DSN | — | staging-sentry-dsn | prod-sentry-dsn | ❌ | ✅ |

### Analytics (PostHog)
| Variable | Dev | Staging | Prod | Required | Secret |
|----------|-----|---------|------|----------|--------|
| NEXT_PUBLIC_POSTHOG_KEY | dev-posthog-key | staging-posthog-key | prod-posthog-key | ❌ | ❌ |
| NEXT_PUBLIC_POSTHOG_HOST | http://localhost:8001 | https://app.posthog.com | https://app.posthog.com | ❌ | ❌ |

### Rate Limiting & Security
| Variable | Dev | Staging | Prod | Required | Secret |
|----------|-----|---------|------|----------|--------|
| RATE_LIMIT_TTL | 60 | 60 | 60 | ❌ | ❌ |
| RATE_LIMIT_MAX | 100 | 100 | 100 | ❌ | ❌ |
| LOCKOUT_THRESHOLD | 5 | 5 | 5 | ❌ | ❌ |
| LOCKOUT_DURATION_MS | 900000 | 900000 | 900000 | ❌ | ❌ |

### Sandbox (GitHub)
| Variable | Dev | Staging | Prod | Required | Secret |
|----------|-----|---------|------|----------|--------|
| GITHUB_PERSONAL_ACCESS_TOKEN | placeholder-token | placeholder-token | sandbox-prod-token | — | ✅ |
| GITHUB_OWNER | placeholder-owner | placeholder-owner | portfolio-org | — | ❌ |
| GITHUB_REPO | placeholder-repo | placeholder-repo | portfolio | — | ❌ |

## Feature Flag Matrix

| Flag | Dev | Staging | Prod |
|------|-----|---------|------|
| AI Chatbot | enabled | enabled | enabled |
| Admin Sandbox | enabled | enabled | enabled |
| Analytics | disabled | enabled | enabled |
| Sentry APM | disabled | enabled (low sample) | enabled |
| Email (real) | disabled (test mode) | disabled (test mode) | enabled |

## Environment Promotion

Changes flow: Dev → Staging → Production

1. **Dev**: Feature branches deployed as Vercel previews; local Docker environment for full stack
2. **PR Preview**: Auto-deployed per PR via Vercel; shared staging DB
3. **Staging**: Merged to `develop` branch; auto-deployed to staging domain
4. **Production**: Merged to `main` branch (with approval); auto-deployed to production domain

Secret values are stored in platform-specific vaults (Vercel Environment Variables, GitHub Secrets) — never in code.
