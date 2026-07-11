# Integration Architecture

All internal and external integration points for the Ultimate Portfolio — patterns, authentication, error handling, retry strategies, fallback behavior, and circuit-breaking decisions.

---

## Integration Overview

```
External Services            Internal Services
 GitHub OAuth ------------>
 Google OAuth ------------>   NestJS API
 Resend      <------------   (apps/api)
 Sentry      <------------
 PostHog     <--- SDK -----
                              HTTP/REST
                                  v
                          FastAPI AI Service
                          (apps/ai)
                             pgvector
                                  v
                          Supabase PostgreSQL
                          (DB + Auth + Store)
```

---

## 1. Supabase / PostgreSQL

| Aspect             | Detail                                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Pattern**        | Connection pool via Prisma pg adapter                                                                                              |
| **Auth**           | Supabase service role key in DATABASE_URL env var                                                                                  |
| **Error Handling** | Prisma throws typed exceptions (PrismaClientKnownRequestError). Caught by GlobalExceptionFilter and mapped to HTTP 400/404/409/500 |
| **Retry**          | Prisma client has 3 retries built-in for connection issues                                                                         |
| **Pool**           | pg.Pool managed by @prisma/adapter-pg. Pool size via DATABASE_POOL_MIN/MAX                                                         |
| **Vector**         | pgvector extension for 1536-dimension OpenAI embeddings. IVFFlat index on DocumentChunk                                            |
| **RLS**            | Row-Level Security on all tables as defense-in-depth. Service role bypasses RLS for admin operations                               |
| **Key File**       | apps/api/src/common/database/prisma.service.ts, apps/api/prisma/schema.prisma                                                      |

## 2. GitHub OAuth

| Aspect             | Detail                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------- |
| **Pattern**        | OAuth 2.0 Authorization Code flow                                                            |
| **Auth**           | GITHUB_CLIENT_ID + GITHUB_CLIENT_SECRET env vars. Callback at POST /api/auth/github/callback |
| **Error Handling** | Invalid state or code exchange failure returns 401 with AUTH_FAILED code                     |
| **Retry**          | None; user-driven OAuth redirect on failure                                                  |
| **Fallback**       | Google OAuth as alternative. Email/password at /admin/login if both fail                     |
| **Key File**       | apps/api/src/modules/auth/ (Passport.js strategies)                                          |

## 3. Google OAuth

| Aspect             | Detail                                                               |
| ------------------ | -------------------------------------------------------------------- |
| **Pattern**        | OAuth 2.0 Authorization Code + OpenID Connect                        |
| **Auth**           | GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET. Scope: openid profile email |
| **Error Handling** | Returns 401 with correlation ID for debugging                        |
| **Retry**          | None; user-driven                                                    |
| **Fallback**       | GitHub OAuth, then email/password                                    |
| **Key File**       | apps/api/src/modules/auth/ (Passport.js strategies)                  |

## 4. Resend (Transactional Email)

| Aspect             | Detail                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| **Pattern**        | REST API call from LeadsService after lead creation                                             |
| **Auth**           | RESEND_API_KEY in Authorization: Bearer header                                                  |
| **Error Handling** | 4xx -> log warning, partial success to user. 5xx -> retry via BullMQ                            |
| **Retry**          | 3 retries via BullMQ with exponential backoff (10s, 30s, 90s). Max queue age: 24h               |
| **Fallback**       | Email logged to DB with status=failed. Admin notifications show failed emails for manual resend |
| **Templates**      | Auto-reply (Thanks for your message), Admin notification (New lead)                             |
| **Key File**       | Queue worker in apps/api/src/common/queue/                                                      |

## 5. OpenAI / Anthropic (AI)

| Aspect             | Detail                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| **Pattern**        | REST from FastAPI (apps/ai/). Chat = SSE streaming. Embeddings = synchronous batch                                             |
| **Auth**           | OPENAI_API_KEY / ANTHROPIC_API_KEY env vars in FastAPI                                                                         |
| **Error Handling** | Rate limit (429) -> exponential backoff + jitter. Token limit -> context window reduction. Model unavailable -> fallback model |
| **Retry**          | 3 retries with exponential backoff (1s, 4s, 16s). Circuit breaker opens after 5 consecutive failures                           |
| **Fallback**       | Primary (GPT-4 / Claude 3.5 Sonnet) -> Secondary (GPT-4o-mini / Claude 3 Haiku). All fail -> Static FAQ response               |
| **Caching**        | Response cache with 5-min TTL for identical queries. Cache key = hashed query + context snippet                                |
| **Cost Control**   | Token usage tracked and logged. Daily/monthly budget caps via middleware                                                       |
| **Key File**       | apps/ai/app/main.py                                                                                                            |

## 6. Sentry (Error Tracking)

| Aspect             | Detail                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Pattern**        | SDK initialization at NestJS bootstrap + Next.js error boundaries                                                                     |
| **Auth**           | SENTRY_DSN env var. Initialized at apps/api/src/main.ts:16-25                                                                         |
| **Error Handling** | GlobalExceptionFilter at apps/api/src/common/filters/global-exception.filter.ts:55-63 captures 5xx with request context and user info |
| **Sampling**       | tracesSampleRate: 0.1 production, 1.0 development. profiling at 0.3 in production                                                     |
| **Scope**          | NestJS API errors + Next.js server-side errors. Separate browser init for client errors                                               |

## 7. PostHog (Analytics)

| Aspect             | Detail                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Pattern**        | Client-side SDK (posthog-js) + server-side SDK for API events                                                                        |
| **Auth**           | NEXT_PUBLIC_POSTHOG_KEY and POSTHOG_API_KEY env vars                                                                                 |
| **Events Tracked** | Page views, lead submissions, AI chat interactions, admin logins, content mutations                                                  |
| **Feature Flags**  | PostHog feature flags for beta features and A/B tests. Checked via useFeatureFlags hook at apps/web/src/lib/hooks/useFeatureFlags.ts |
| **Fallback**       | Silently dropped if PostHog unreachable (fire-and-forget, no retry)                                                                  |

## 8. Redis (Cache / BullMQ Queue)

| Aspect              | Detail                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Pattern**         | BullMQ for background job queue + optional NestJS CacheModule backend                                        |
| **Auth**            | REDIS_URL env var                                                                                            |
| **Queues**          | email (lead auto-replies, notifications), ai-embeddings (re-index chunks), cleanup (hard-delete old records) |
| **Error Handling**  | Failed jobs to stalled/dead-letter queue. Max 10 retries, exponential backoff (1min to 30min)                |
| **Circuit Breaker** | Redis down -> BullMQ buffers to disk. Cache degrades to in-memory NestJS cache                               |
| **Fallback**        | No Redis -> NestJS in-memory cache. BullMQ jobs logged to DB for later replay                                |

## 9. Vercel (Hosting & CDN)

| Aspect         | Detail                                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| **Pattern**    | Vercel for Next.js frontend + serverless API functions                                                     |
| **Deployment** | Automatic via GitHub integration on main branch push. Preview deployments on PRs                           |
| **ISR**        | Incremental Static Regeneration for public pages (60-300s TTL). On-demand revalidation via /api/revalidate |
| **Edge**       | Lightweight Edge Middleware for redirects and header manipulation                                          |
| **Domains**    | Custom domain with Vercel DNS, SSL termination at edge                                                     |

## 10. Circuit Breaker Summary

| Circuit                | Threshold                         | Cooldown | Half-Open Test       |
| ---------------------- | --------------------------------- | -------- | -------------------- |
| OpenAI / Anthropic API | 5 consecutive failures            | 60s      | Single test request  |
| Resend API             | 3 consecutive failures            | 30s      | Single test request  |
| Redis (BullMQ)         | 10 consecutive failures           | 120s     | Queue health check   |
| Supabase (DB)          | 5 consecutive connection failures | 30s      | Lightweight SELECT 1 |

Circuit breakers implemented as NestJS interceptors in apps/api/src/common/. When open, returns cached or degraded response immediately.

## 11. Webhook vs Polling Decisions

| Integration           | Method                     | Rationale                                                        |
| --------------------- | -------------------------- | ---------------------------------------------------------------- |
| GitHub OAuth callback | Redirect (webhook)         | Standard OAuth flow                                              |
| Google OAuth callback | Redirect (webhook)         | Standard OAuth flow                                              |
| Email delivery status | Polling (Resend API)       | Polled on demand in admin leads view. No webhook endpoint needed |
| AI embedding updates  | Polling (BullMQ)           | Queue-based batch processing avoids blocking HTTP requests       |
| Cache invalidation    | Webhook (ISR revalidation) | On-demand revalidate triggered by admin content mutations        |
| PostHog events        | Push (SDK)                 | Fire-and-forget from browser. No polling or webhook needed       |

## 12. Error Handling Flow

All external API calls follow this pattern:

1. Attempt the call with a timeout (configurable per integration)
2. On failure, classify: 4xx (client error) or 5xx (server error)
3. 4xx: Log warning, return error to caller immediately
4. 5xx: Increment circuit breaker counter. If threshold not reached, retry with backoff
5. If circuit breaker open, return degraded response (cached data or user-facing error)
6. Log full error with correlation ID to Sentry (if 5xx) or Pino (if 4xx)
