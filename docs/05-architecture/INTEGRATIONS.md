# Integrations Architecture Document Ã¢â‚¬â€ Enterprise-Grade Service Platform

> **Document:** `13-INTEGRATIONS.md` | **Version:** 4.0 | **Last Updated:** June 2026  
> **Status:** Ã¢Å“â€¦ Active | **Owner:** Principal Integration Architect | **Review Cadence:** Quarterly  
> **Classification:** Enterprise Architecture | **Total Integrations:** 13  
> **Core Tier:** 7 | **Observability Tier:** 3 | **Communication Tier:** 1 | **AI Tier:** 2

---

## Executive Summary

Catalogs all 12 third-party integrations powering the portfolio platform: Vercel (hosting), Supabase (database/auth), OpenAI (LLM), Anthropic (fallback LLM), PostHog (analytics/feature flags), Sentry (error tracking), Better Stack (uptime monitoring), Umami (analytics), Cloudflare (CDN/DNS), GitHub (source control), Railway (AI service), and Resend (email). Each includes configuration, auth, error handling, fallback behavior, and cost tracking.

---

## Table of Contents

1. [Integration Vision & Principles](#1-integration-vision--principles)
2. [Master Integration Architecture](#2-master-integration-architecture)
3. [Integration Dependency Graph](#3-integration-dependency-graph)
4. [Integration Tier Classification](#4-integration-tier-classification)
5. [GitHub Integration](#5-github-integration)
6. [Supabase Integration](#6-supabase-integration)
7. [Resend Integration](#7-resend-integration)
8. [OpenAI Integration](#8-openai-integration)
9. [Anthropic Integration](#9-anthropic-integration)
10. [PostHog Integration](#10-posthog-integration)
11. [Umami Integration](#11-umami-integration)
12. [Sentry Integration](#12-sentry-integration)
13. [Better Uptime Integration](#13-better-uptime-integration)
14. [Vercel Integration](#14-vercel-integration)
15. [Google OAuth Integration](#15-google-oauth-integration)
16. [Cloudflare Integration](#16-cloudflare-integration)
17. [GitHub Actions Integration](#17-github-actions-integration)
18. [Complete Environment Variable Inventory](#18-complete-environment-variable-inventory)
19. [Composite Risk Matrix](#19-composite-risk-matrix)
20. [Integration Health Dashboard](#20-integration-health-dashboard)
21. [Cost Tracking & Budget](#21-cost-tracking--budget)
22. [Integration Change Log](#22-integration-change-log)

---

## 1. Integration Vision & Principles

### 1.1 North Star

The integrations ecosystem serves as the **nervous system** connecting the portfolio platform to essential third-party services. Each integration is designed with enterprise-grade resilienceÃ¢â‚¬â€handling authentication, failure modes, rate limits, and security concernsÃ¢â‚¬â€while operating entirely within free-tier limits. Every integration has a defined fallback chain, monitoring hook, and recovery procedure.

### 1.2 Design Principles

| #   | Principle                                         | Rationale                                                                                           | Violation Penalty                     |
| --- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------- |
| P1  | **Fail closed on auth failure**                   | If a service credential is invalid, the integration must fail gracefully, not expose internal state | Credential leak risk                  |
| P2  | **Every external call is time-boxed**             | All outbound HTTP requests have a configurable timeout (default 10s)                                | Hanging requests, resource exhaustion |
| P3  | **Rate limits are respected by design**           | Each integration uses backoff/retry logic matching the provider's documented limits                 | IP/Key ban from provider              |
| P4  | **Sensitive credentials never leave server-side** | API keys, secrets, and tokens exist only in server-side env vars or secret managers                 | Data breach                           |
| P5  | **Every integration has an explicit fallback**    | Primary Ã¢â€ â€™ Fallback 1 Ã¢â€ â€™ Fallback 2 chain defined for all business-critical features    | Feature outage                        |
| P6  | **Integration health is observable**              | Every integration emits structured health metrics for dashboard consumption                         | Blindness to outages                  |
| P7  | **Cost is tracked per integration**               | Monthly spend per service is measured against budget                                                | Budget overrun                        |
| P8  | **Secrets are rotated quarterly**                 | All API keys, tokens, and credentials have a documented rotation schedule                           | Security posture decay                |

### 1.3 Integration Inventory Summary

| #   | Service            | Category      | Tier                | Status             | Monthly Cost | Setup Complexity |
| --- | ------------------ | ------------- | ------------------- | ------------------ | ------------ | ---------------- |
| 1   | **GitHub**         | Core Platform | Ã°Å¸Å¸Â¢ Production | Ã¢Å“â€¦ Active     | $0           | Low              |
| 2   | **Supabase**       | Data Platform | Ã°Å¸Å¸Â¢ Production | Ã¢Å“â€¦ Active     | $0           | Medium           |
| 3   | **Resend**         | Communication | Ã°Å¸Å¸Â¡ Stable     | Ã¢Å“â€¦ Active     | $0           | Low              |
| 4   | **OpenAI**         | AI Platform   | Ã°Å¸Å¸Â¡ Stable     | Ã¢Å“â€¦ Active     | ~$5          | Medium           |
| 5   | **Anthropic**      | AI Platform   | Ã°Å¸â€Âµ Fallback   | Ã¢ÂÂ¸Ã¯Â¸Â Standby | $0           | Low              |
| 6   | **PostHog**        | Analytics     | Ã°Å¸Å¸Â¢ Production | Ã¢Å“â€¦ Active     | $0           | Low              |
| 7   | **Umami**          | Analytics     | Ã°Å¸Å¸Â¡ Stable     | Ã¢Å“â€¦ Active     | $0           | Medium           |
| 8   | **Sentry**         | Observability | Ã°Å¸Å¸Â¢ Production | Ã¢Å“â€¦ Active     | $0           | Low              |
| 9   | **Better Uptime**  | Monitoring    | Ã°Å¸Å¸Â¢ Production | Ã¢Å“â€¦ Active     | $0           | Low              |
| 10  | **Vercel**         | Hosting       | Ã°Å¸Å¸Â¢ Production | Ã¢Å“â€¦ Active     | $0           | Low              |
| 11  | **Google OAuth**   | Auth          | Ã°Å¸Å¸Â¢ Production | Ã¢Å“â€¦ Active     | $0           | Low              |
| 12  | **Cloudflare**     | Edge/DNS      | Ã°Å¸Å¸Â¢ Production | Ã¢Å“â€¦ Active     | $0           | Low              |
| 13  | **GitHub Actions** | CI/CD         | Ã°Å¸Å¸Â¢ Production | Ã¢Å“â€¦ Active     | $0           | Low              |

**Total Monthly Spend: ~$5** (entirely OpenAI variable costs)

---

## 2. Master Integration Architecture

### 2.1 Integration Ecosystem Map

```mermaid
graph TB
    subgraph "Portfolio Platform"
        direction TB
        WEB["Next.js 14 Frontend<br/>apps/web"]
        API["NestJS 10 API<br/>apps/api"]
        AI["FastAPI AI Service<br/>apps/ai"]
    end

    subgraph "Core Platform Tier"
        GITHUB["Ã°Å¸Ââ„¢ GitHub<br/>Source Control<br/>Webhooks"]
        SUPABASE["Ã°Å¸ÂËœ Supabase<br/>DB + Auth + Storage<br/>Realtime"]
        VERCEL["Ã¢â€“Â² Vercel<br/>Hosting + CDN + ISR<br/>Serverless"]
        CLOUDFLARE["Ã¢ËœÂÃ¯Â¸Â Cloudflare<br/>DNS + DDoS + SSL"]
        GACTIONS["Ã¢Å¡â„¢Ã¯Â¸Â GitHub Actions<br/>CI/CD Pipeline"]
    end

    subgraph "Authentication Tier"
        GOOGLE_OAUTH["Ã°Å¸â€â€˜ Google OAuth<br/>Admin Login<br/>NestJS Passport"]
        SUPABASE_AUTH["Ã°Å¸â€Â Supabase Auth<br/>JWT + RLS<br/>Session Mgmt"]
    end

    subgraph "AI Tier"
        OPENAI["Ã°Å¸Â¤â€“ OpenAI<br/>GPT-4  <br/>text-embedding-3-small"]
        ANTHROPIC["Ã°Å¸Â§Â  Anthropic<br/>Claude 3.5 Sonnet<br/>Fallback LLM"]
    end

    subgraph "Observability & Analytics Tier"
        POSTHOG["Ã°Å¸â€œÅ  PostHog<br/>Product Analytics<br/>Feature Flags"]
        UMAMI["Ã°Å¸â€œË† Umami<br/>Web Analytics<br/>Privacy-first"]
        SENTRY["Ã°Å¸Ââ€º Sentry<br/>Error Tracking<br/>Performance"]
        BETTERUPTIME["Ã¢Å“â€¦ Better Uptime<br/>Uptime Monitoring<br/>Status Page"]
    end

    subgraph "Communication Tier"
        RESEND["Ã°Å¸â€œÂ¨ Resend<br/>Transactional Email<br/>Auto-reply"]
    end

    %% Core connections
    WEB --> VERCEL
    VERCEL --> CLOUDFLARE
    GITHUB --> GACTIONS
    GACTIONS -->|Deploy| VERCEL
    GACTIONS -->|Deploy| AI

    %% Data flow
    WEB -->|ISR Reads| SUPABASE
    API -->|CRUD| SUPABASE
    API -->|JWT Auth| SUPABASE_AUTH
    AI -->|Vector Search| SUPABASE
    WEB -->|Auth| SUPABASE_AUTH
    WEB --> GOOGLE_OAUTH

    %% AI flow
    AI -->|Primary LLM| OPENAI
    AI -->|Fallback LLM| ANTHROPIC

    %% Observability flow
    WEB -->|Events| POSTHOG
    WEB -->|Analytics| UMAMI
    API -->|Errors| SENTRY
    AI -->|Errors| SENTRY
    BETTERUPTIME -->|Monitors| VERCEL

    %% Communication
    API -->|Email| RESEND

    %% Webhook flows
    GITHUB -->|Push/PR Events| GACTIONS
    RESEND -->|Delivery Status| API
```

### 2.2 Integration Layer Architecture

```mermaid
graph TB
    subgraph "Application Layer"
        WEB["Next.js 14"]
        API["NestJS 10"]
        AI_SVC["FastAPI"]
    end

    subgraph "Integration Abstraction Layer"
        direction TB
        CACHE["Response Cache<br/>TTL-based<br/>In-memory"]
        RETRY["Retry Logic<br/>Exponential Backoff<br/>3 attempts"]
        CIRCUIT["Circuit Breaker<br/>5 failures Ã¢â€ â€™ open<br/>30s cooldown"]
        TIMEOUT["Timeout Enforcer<br/>Default: 10s<br/>Configurable per service"]
        RATE["Rate Limit Client<br/>Token bucket<br/>Per-service quotas"]
    end

    subgraph "Integration Adapters"
        GH_ADAPTER["GitHub Adapter<br/>REST + GraphQL"]
        SB_ADAPTER["Supabase Adapter<br/>Supabase JS SDK"]
        RS_ADAPTER["Resend Adapter<br/>Resend Node SDK"]
        OAI_ADAPTER["OpenAI Adapter<br/>OpenAI Node SDK"]
        ANT_ADAPTER["Anthropic Adapter<br/>Anthropic SDK"]
        PH_ADAPTER["PostHog Adapter<br/>PostHog JS SDK"]
        UM_ADAPTER["Umami Adapter<br/>REST API Client"]
        SN_ADAPTER["Sentry Adapter<br/>Sentry SDK"]
        BU_ADAPTER["Better Uptime Adapter<br/>REST API Client"]
        GC_ADAPTER["GitHub Client<br/>Octokit SDK"]
    end

    subgraph "External Services"
        GITHUB["GitHub API"]
        SUPABASE["Supabase Cloud"]
        RESEND["Resend API"]
        OPENAI["OpenAI API"]
        ANTHROPIC["Anthropic API"]
        POSTHOG["PostHog Cloud"]
        UMAMI_SRV["Umami Server"]
        SENTRY_SRV["Sentry SaaS"]
        BU_SRV["Better Uptime API"]
        VERCEL_SRV["Vercel API"]
        GOOGLE["Google OAuth"]
        CF["Cloudflare API"]
    end

    API --> GH_ADAPTER
    API --> SB_ADAPTER
    WEB --> SB_ADAPTER
    API --> RS_ADAPTER
    AI_SVC --> OAI_ADAPTER
    AI_SVC --> ANT_ADAPTER
    WEB --> PH_ADAPTER
    API --> UM_ADAPTER
    API --> SN_ADAPTER
    WEB --> SN_ADAPTER
    AI_SVC --> BU_ADAPTER
    API --> GC_ADAPTER

    GH_ADAPTER --> CACHE
    GH_ADAPTER --> RETRY
    GH_ADAPTER --> CIRCUIT
    GH_ADAPTER --> RATE

    RS_ADAPTER --> RETRY
    OAI_ADAPTER --> RETRY
    OAI_ADAPTER --> TIMEOUT
    ANT_ADAPTER --> RETRY
    ANT_ADAPTER --> TIMEOUT

    GH_ADAPTER --> GITHUB
    SB_ADAPTER --> SUPABASE
    RS_ADAPTER --> RESEND
    OAI_ADAPTER --> OPENAI
    ANT_ADAPTER --> ANTHROPIC
    PH_ADAPTER --> POSTHOG
    UM_ADAPTER --> UMAMI_SRV
    SN_ADAPTER --> SENTRY_SRV
    BU_ADAPTER --> BU_SRV
```

### 2.3 Retry & Circuit Breaker Configuration

| Integration    | Max Retries | Backoff Strategy            | Circuit Breaker Threshold | Circuit Open Duration | Timeout |
| -------------- | ----------- | --------------------------- | ------------------------- | --------------------- | ------- |
| GitHub API     | 3           | Exponential (1s, 2s, 4s)    | 5 failures/30s            | 60s                   | 10s     |
| Supabase       | 3           | Exponential (500ms, 1s, 2s) | 10 failures/60s           | 30s                   | 5s      |
| Resend         | 3           | Exponential (1s, 2s, 4s)    | 5 failures/60s            | 120s                  | 10s     |
| OpenAI         | 3           | Exponential (2s, 4s, 8s)    | 5 failures/60s            | 120s                  | 30s     |
| Anthropic      | 3           | Exponential (2s, 4s, 8s)    | 5 failures/60s            | 120s                  | 30s     |
| PostHog        | 2           | Immediate retry             | 10 failures/60s           | 30s                   | 5s      |
| Umami          | 2           | Exponential (1s, 2s)        | 5 failures/60s            | 60s                   | 10s     |
| Sentry         | 3           | Exponential (500ms, 1s, 2s) | Ã¢â‚¬â€ (fire-and-forget) | Ã¢â‚¬â€               | 2s      |
| Better Uptime  | 1           | None                        | Ã¢â‚¬â€ (read-only)       | Ã¢â‚¬â€               | 10s     |
| Vercel API     | 3           | Exponential (1s, 2s, 4s)    | 5 failures/60s            | 120s                  | 10s     |
| Google OAuth   | 3           | Exponential (1s, 2s, 4s)    | 5 failures/60s            | 60s                   | 10s     |
| Cloudflare API | 3           | Exponential (1s, 2s, 4s)    | 5 failures/60s            | 120s                  | 10s     |
| GitHub Actions | 2           | Exponential (1s, 2s)        | 3 failures/60s            | 60s                   | 30s     |

### 2.4 Integration Health Check Matrix

Every integration exposes a health check endpoint used by the platform's `/api/v1/ready` endpoint:

| Integration   | Health Check Method                | Expected Success | Failure Impact                               |
| ------------- | ---------------------------------- | ---------------- | -------------------------------------------- |
| Supabase      | `SELECT 1` query                   | < 20ms latency   | Degraded: all reads/writes fail              |
| Resend        | `GET /emails` (API key validation) | 200 OK           | Degraded: email delivery fails               |
| OpenAI        | `GET /models`                      | 200 OK           | Degraded: AI chat falls back to Anthropic    |
| Anthropic     | `GET /models`                      | 200 OK           | Minor: no impact if OpenAI is healthy        |
| PostHog       | `GET /decide/`                     | 200 OK           | Minor: fallback to custom DB analytics       |
| Umami         | `GET /api/website`                 | 200 OK           | Minor: admin analytics page shows stale data |
| Sentry        | SDK flush test                     | No error         | Minor: errors logged to console              |
| Better Uptime | `GET /api/v1/monitors`             | 200 OK           | Minor: status header shows stale data        |
| Vercel API    | `GET /v9/projects`                 | 200 OK           | Minor: deploy status unavailable             |
| GitHub API    | `GET /users/{user}`                | 200 OK           | Minor: activity section shows cached data    |

---

## 3. Integration Dependency Graph

### 3.1 Feature-to-Integration Mapping

```mermaid
graph LR
    subgraph "Portfolio Features"
        AUTH["Authentication"]
        CONTENT["Content Management"]
        LEADS["Lead Capture"]
        AI_CHAT["AI Chat"]
        ANALYTICS["Analytics"]
        MONITORING["Monitoring"]
        DEPLOY["Deployment"]
        NOTIFY["Notifications"]
        SEO["SEO & Social"]
    end

    subgraph "External Integrations"
        GH["Ã°Å¸Ââ„¢ GitHub"]
        SB["Ã°Å¸ÂËœ Supabase"]
        RS["Ã°Å¸â€œÂ¨ Resend"]
        OAI["Ã°Å¸Â¤â€“ OpenAI"]
        ANT["Ã°Å¸Â§Â  Anthropic"]
        PH["Ã°Å¸â€œÅ  PostHog"]
        UM["Ã°Å¸â€œË† Umami"]
        SN["Ã°Å¸Ââ€º Sentry"]
        BU["Ã¢Å“â€¦ Better Uptime"]
        VC["Ã¢â€“Â² Vercel"]
        GO["Ã°Å¸â€â€˜ Google OAuth"]
        CF["Ã¢ËœÂÃ¯Â¸Â Cloudflare"]
        GA["Ã¢Å¡â„¢Ã¯Â¸Â GitHub Actions"]
    end

    AUTH --> SB
    AUTH --> GO
    AUTH --> VC

    CONTENT --> SB
    CONTENT --> VC

    LEADS --> SB
    LEADS --> RS
    LEADS --> SN

    AI_CHAT --> OAI
    AI_CHAT --> ANT
    AI_CHAT --> SB

    ANALYTICS --> PH
    ANALYTICS --> UM
    ANALYTICS --> SB

    MONITORING --> BU
    MONITORING --> SN

    DEPLOY --> GA
    DEPLOY --> VC
    DEPLOY --> GH

    NOTIFY --> RS

    SEO --> VC
    SEO --> CF
```

### 3.2 Data Sovereignty & Jurisdiction

| Integration | Data Stored                          | Storage Location       | Jurisdiction          | Compliance Implication         |
| ----------- | ------------------------------------ | ---------------------- | --------------------- | ------------------------------ |
| Supabase    | All portfolio data                   | US (Supabase default)  | US                    | Standard US privacy laws       |
| PostHog     | Analytics events                     | EU (PostHog Cloud EU)  | EU Ã°Å¸â€¡ÂªÃ°Å¸â€¡Âº | GDPR-compliant by default      |
| Umami       | Web analytics                        | Self-hosted on Railway | Configurable          | Full data control              |
| Sentry      | Error traces                         | US (Sentry default)    | US                    | Standard US privacy laws       |
| Resend      | Email logs                           | US (Resend default)    | US                    | Standard US privacy laws       |
| OpenAI      | Chat messages (non-API for training) | US                     | US                    | API data not used for training |
| Anthropic   | Chat messages (non-API for training) | US                     | US                    | API data not used for training |

> **Note:** No PII (personally identifiable information) beyond email addresses in leads is stored. Analytics data is anonymized by PostHog and Umami by default.

---

## 4. Integration Tier Classification

### 4.1 Tier Definitions

| Tier                    | Definition                         | Impact if Down             | RTO        | Monitoring           | Example          |
| ----------------------- | ---------------------------------- | -------------------------- | ---------- | -------------------- | ---------------- |
| **Ã°Å¸Å¸Â¢ Production** | Critical for core operation        | Site unavailable or broken | < 15 min   | 1-min health checks  | Supabase, Vercel |
| **Ã°Å¸Å¸Â¡ Stable**     | Important but graceful degradation | Feature degraded           | < 1 hour   | 5-min health checks  | OpenAI, Resend   |
| **Ã°Å¸â€Âµ Fallback**   | Standby/alternate provider         | No direct impact           | < 24 hours | 15-min health checks | Anthropic        |
| **Ã¢Å¡Âª Experimental** | New/evolving integration           | Isolated feature impact    | < 1 week   | Manual check         | Umami            |

### 4.2 Fallback Chain Matrix

| Feature             | Primary      | Fallback 1                       | Fallback 2                           | Degradation Behavior                                           |
| ------------------- | ------------ | -------------------------------- | ------------------------------------ | -------------------------------------------------------------- |
| AI Chat             | OpenAI GPT-4 | Anthropic Claude 3.5 Sonnet      | "AI temporarily unavailable" message | Automatic switch; user sees slight response quality difference |
| Email Sending       | Resend       | SMTP (Gmail directly)            | Log to database only                 | Admin notified; emails queued for manual send                  |
| Analytics (Product) | PostHog      | Custom analytics_events table    | No tracking                          | Data collected in DB; PostHog dashboard shows gaps             |
| Analytics (Web)     | Umami        | PostHog pageview events          | No tracking                          | Dashboard shows PostHog data instead                           |
| Error Tracking      | Sentry       | Console + audit_logs table       | No tracking                          | Review audit_logs for critical errors                          |
| Auth                | Google OAuth | Email + Password (Supabase Auth) | Login disabled                       | Admin can still login with email/password                      |
| GitHub Data         | GitHub API   | Cached response (10 min TTL)     | Stale cached data                    | Shows last known data; "last updated" timestamp                |
| DNS                 | Cloudflare   | Default registrar DNS            | Site unreachable                     | TTL propagation delay                                          |

---

## 5. GitHub Integration

### 5.1 Overview

| Field             | Value                                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Service**       | GitHub.com                                                                                                           |
| **Category**      | Core Platform                                                                                                        |
| **Tier**          | Ã°Å¸Å¸Â¢ Production                                                                                                  |
| **Purpose**       | Source control for monorepo, repository data for portfolio open-source section, webhook events for activity tracking |
| **SDK/Package**   | `octokit` (Node.js), GitHub REST API v3, GitHub GraphQL API v4                                                       |
| **Documentation** | https://docs.github.com/en/rest                                                                                      |
| **Status Page**   | https://www.githubstatus.com/                                                                                        |

### 5.2 Architecture

```mermaid
sequenceDiagram
    participant Web as Next.js Frontend
    participant API as NestJS API
    participant Cache as In-Memory Cache
    participant GitHub as GitHub API
    participant DB as Supabase

    Note over Web,DB: Public Endpoint: GET /api/v1/github/activity
    Web->>API: Request GitHub activity
    API->>Cache: Check cache (TTL: 600s)

    alt Cache Hit
        Cache-->>API: Cached response
        API-->>Web: Activity data (cached)
    else Cache Miss
        API->>GitHub: GET /users/{username}/events (per_page=10)
        GitHub-->>API: Recent events
        API->>API: Transform to portfolio format
        API->>Cache: Store in cache (600s TTL)
        API-->>Web: Activity data (fresh)
    end

    Note over Web,DB: Public Endpoint: GET /api/v1/github/repos
    Web->>API: Request pinned repos
    API->>Cache: Check cache (TTL: 600s)

    alt Cache Hit
        Cache-->>API: Cached response
    else Cache Miss
        API->>GitHub: GET /users/{username}/repos (sort=stars, per_page=20)
        GitHub-->>API: Repository list
        API->>DB: Cache in github_cache table (optional)
        API-->>Web: Repo data (fresh)
    end

    Note over Web,DB: Webhook: POST /api/v1/webhooks/github
    GitHub->>API: Push event (X-Hub-Signature-256)
    API->>API: Verify webhook secret
    API->>DB: Record activity
    API-->>GitHub: 200 OK (received)
    API->>Cache: Invalidate activity cache
```

### 5.3 Authentication

| Method           | Type                                 | Credential                                 | Location        | Rotation       |
| ---------------- | ------------------------------------ | ------------------------------------------ | --------------- | -------------- |
| GitHub API Token | Personal Access Token (fine-grained) | `GITHUB_TOKEN`                             | Server env vars | Every 90 days  |
| Webhook Secret   | HMAC-SHA256 shared secret            | `GITHUB_WEBHOOK_SECRET`                    | Server env vars | Every 180 days |
| OAuth App        | OAuth 2.0 for admin login            | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Server env vars | Every 180 days |

### 5.4 Data Flow

```
GitHub Ã¢â€ â€™ GitHub REST API Ã¢â€ â€™ NestJS GitHub Module Ã¢â€ â€™ In-Memory Cache (600s) Ã¢â€ â€™ JSON Response
GitHub Ã¢â€ â€™ Webhook Ã¢â€ â€™ NestJS Webhook Module Ã¢â€ â€™ Supabase analytics_events Ã¢â€ â€™ Cache Invalidation
```

### 5.5 Failure Handling

| Failure Mode                                                                   | Detection        | Impact                                  | Recovery                            |
| ------------------------------------------------------------------------------ | ---------------- | --------------------------------------- | ----------------------------------- |
| API rate limit exceeded (60 req/hr unauthenticated, 5000 req/hr authenticated) | 403/429 response | Cached data served; stale warning badge | Wait for reset; cache serves 10 min |
| GitHub outage                                                                  | 5xx responses    | Cached data served; "offline" indicator | Automatic retry after circuit opens |
| Token expired                                                                  | 401 response     | All GitHub features fail                | Rotate token; update env var        |

### 5.6 Fallback Strategy

| Scenario                 | Action                          | User Experience                    |
| ------------------------ | ------------------------------- | ---------------------------------- |
| API unavailable          | Serve cached data (10 min TTL)  | Shows "Last updated: X min ago"    |
| Cache expired + API down | Show empty state                | Section shows "No recent activity" |
| Webhook delivery failure | Poll API every 10 min as backup | No impact (polling is default)     |

### 5.7 Security Considerations

- **Token scope:** Only `public_repo` and `read:user` permissions
- **Rate limit awareness:** Implement `X-RateLimit-Remaining` header monitoring
- **Webhook validation:** Verify HMAC-SHA256 signature with `GITHUB_WEBHOOK_SECRET`
- **IP allowlisting:** GitHub webhooks come from known IP ranges: `192.30.252.0/22`, `185.199.108.0/22`, `140.82.112.0/20`
- **No write operations:** GitHub integration is read-only for portfolio features

### 5.8 Rate Limits

| Limit Type               | Value      | Scope     | Reset      |
| ------------------------ | ---------- | --------- | ---------- |
| Unauthenticated requests | 60/hour    | Per IP    | Hourly     |
| Authenticated requests   | 5,000/hour | Per token | Hourly     |
| GitHub Actions API       | 1,000/hour | Per token | Hourly     |
| Search API               | 30/minute  | Per token | Per minute |
| Git Data API             | 5,000/hour | Per token | Hourly     |

### 5.9 Monitoring

| Metric                     | Alert Threshold | Action                   |
| -------------------------- | --------------- | ------------------------ |
| API response time > 5s     | Warning         | Log slow response        |
| Rate limit remaining < 10% | Warning         | Reduce polling frequency |
| 4xx/5xx rate > 5%          | Critical        | Investigate token/outage |
| Cache hit rate < 50%       | Warning         | Increase cache TTL       |

### 5.10 Recovery Process

```text
1. Check GitHub Status: https://www.githubstatus.com/
2. If GitHub issue: wait for resolution; cached data serves for 10 min
3. If token issue: verify GITHUB_TOKEN env var Ã¢â€ â€™ regenerate in GitHub Settings Ã¢â€ â€™ Tokens
4. Update Vercel environment variable Ã¢â€ â€™ re-deploy or trigger redeployment
5. Verify: curl -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/user
```

### 5.11 Environment Variables

```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx          # Fine-grained PAT with public_repo scope
GITHUB_USERNAME=portfolioowner                   # GitHub username for API queries
GITHUB_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx     # Webhook secret for HMAC verification
```

---

## 6. Supabase Integration

### 6.1 Overview

| Field             | Value                                                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Service**       | Supabase                                                                                                                                |
| **Category**      | Data Platform                                                                                                                           |
| **Tier**          | Ã°Å¸Å¸Â¢ Production                                                                                                                     |
| **Purpose**       | Primary database (PostgreSQL 15), authentication (JWT), object storage (images/assets), realtime subscriptions (availability/analytics) |
| **SDK/Package**   | `@supabase/supabase-js` (Node.js), `supabase` (Python), Supabase CLI                                                                    |
| **Documentation** | https://supabase.com/docs                                                                                                               |
| **Status Page**   | https://status.supabase.com/                                                                                                            |

### 6.2 Architecture

```mermaid
sequenceDiagram
    participant Web as Next.js (ISR)
    participant API as NestJS API
    participant AI as FastAPI AI
    participant Supabase as Supabase
    participant PG as PostgreSQL 15
    participant Storage as Object Storage
    participant Auth as Auth Service

    Note over Web,Auth: Public Reads (ISR)
    Web->>Supabase: SELECT sections WHERE is_live=true (anon key)
    Supabase->>PG: RLS policy: anon can read live
    PG-->>Supabase: Results
    Supabase-->>Web: Public data (cached via ISR 60s)

    Note over Web,Auth: Admin Mutations
    API->>Supabase: CRUD operations (service_role key)
    Supabase->>PG: RLS policy: service_role bypass
    PG-->>Supabase: Mutation result
    Supabase-->>API: Response

    Note over Web,Auth: Authentication
    API->>Auth: Verify login credentials
    Auth-->>API: JWT tokens (access + refresh)
    API->>Web: Session established

    Note over Web,Auth: File Upload
    API->>Storage: Upload image (admin JWT)
    Storage-->>API: Public URL
    API->>PG: Record in media_assets table

    Note over Web,Auth: Realtime
    Web->>Supabase: Subscribe to availability_status
    Supabase->>Web: Real-time updates via WebSocket

    Note over Web,Auth: Vector Search (AI)
    AI->>PG: Cosine similarity query (IVFFlat index)
    PG-->>AI: Top K document chunks
```

### 6.3 Authentication

| Method            | Type                | Credential                      | Location                 | Rotation                           |
| ----------------- | ------------------- | ------------------------------- | ------------------------ | ---------------------------------- |
| Anon Key          | Public API key      | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server env vars | Project-level (Supabase dashboard) |
| Service Role Key  | Admin API key       | `SUPABASE_SERVICE_ROLE_KEY`     | Server env vars only     | Project-level (Supabase dashboard) |
| JWT Token         | Short-lived JWT     | Generated via auth.login()      | Session storage          | 15 min (access) / 7 days (refresh) |
| Database Password | PostgreSQL password | `SUPABASE_DB_PASSWORD`          | Server env vars          | Every 90 days                      |

### 6.4 Data Flow

```
Public Read:  Browser Ã¢â€ â€™ ISR Cache Ã¢â€ â€™ Supabase JS SDK Ã¢â€ â€™ RLS Check Ã¢â€ â€™ PostgreSQL Ã¢â€ â€™ Response
Admin Write:  Browser Ã¢â€ â€™ JWT Auth Ã¢â€ â€™ NestJS Ã¢â€ â€™ Supabase JS SDK (service_role) Ã¢â€ â€™ PostgreSQL Ã¢â€ â€™ Response
Auth Login:   Browser Ã¢â€ â€™ NestJS Passport Ã¢â€ â€™ NestJS Ã¢â€ â€™ Supabase Auth Ã¢â€ â€™ JWT Tokens Ã¢â€ â€™ Session
File Upload:  Browser Ã¢â€ â€™ JWT Auth Ã¢â€ â€™ NestJS Ã¢â€ â€™ Supabase Storage Ã¢â€ â€™ CDN URL Ã¢â€ â€™ Response
Realtime:     Browser Ã¢â€ â€™ Supabase Realtime WebSocket Ã¢â€ â€™ PostgreSQL Ã¢â€ â€™ Live Update
Vector Search: FastAPI Ã¢â€ â€™ Supabase JS SDK Ã¢â€ â€™ pgvector (IVFFlat) Ã¢â€ â€™ Top K Results
```

### 6.5 Failure Handling

| Failure Mode              | Detection                | Impact                    | Recovery                                           |
| ------------------------- | ------------------------ | ------------------------- | -------------------------------------------------- |
| Connection pool exhausted | Query timeout (> 5s)     | Read/write failures       | PgBouncer auto-reconnects; reduce connection count |
| Database size > 500MB     | Supabase dashboard alert | Write operations may fail | Clean up old analytics data; optimize indexes      |
| Auth service unavailable  | Login failures           | Admin cannot log in       | Email+password auth still works; wait for recovery |
| Storage unavailable       | Upload fails             | Image uploads fail        | Fallback to local storage; retry on restore        |
| Realtime disconnected     | WebSocket error          | Live updates stop         | Poll-based fallback every 30s                      |

### 6.6 Fallback Strategy

| Scenario              | Action                         | User Experience                              |
| --------------------- | ------------------------------ | -------------------------------------------- |
| Database read failure | Serve ISR cached page          | Site still loads with potentially stale data |
| Auth unavailable      | NestJS Passport session cookie | Existing sessions still work for up to 24h   |
| Storage unavailable   | Show placeholder images        | Images replaced with gradient fallback       |
| Realtime disconnected | Poll every 30s                 | Slight delay in availability badge update    |

### 6.7 Security Considerations

- **Service role key** must NEVER appear in client-side code (use server-only env vars)
- **RLS policies** are defense-in-depth; API gateway guards are first line
- **Connection pooling** via PgBouncer (max 15 connections on free tier)
- **SSL enforcement** required for all connections
- **Database password rotation** every 90 days
- **Audit logging** via trigger-based `audit_logs` table

### 6.8 Rate Limits

| Limit Type           | Value                | Scope       | Reset                    |
| -------------------- | -------------------- | ----------- | ------------------------ |
| Database connections | 15 (pooled)          | Per project | Per connection lifecycle |
| Database size        | 500MB                | Per project | N/A                      |
| Storage size         | 1GB                  | Per project | N/A                      |
| Auth users           | 50,000               | Per project | N/A                      |
| Realtime messages    | 200,000/month        | Per project | Monthly                  |
| Edge Functions       | 2M invocations/month | Per project | Monthly                  |

### 6.9 Monitoring

| Metric                 | Alert Threshold | Action                         |
| ---------------------- | --------------- | ------------------------------ |
| Database size > 400MB  | Warning         | Clean up old data              |
| Query latency > 100ms  | Warning         | Review pg_stat_statements      |
| Connection usage > 80% | Warning         | Reduce connection pool usage   |
| Auth errors > 5/min    | Critical        | Investigate auth configuration |
| Storage usage > 800MB  | Warning         | Archive old assets             |

### 6.10 Recovery Process

```text
1. Check Supabase Status: https://status.supabase.com/
2. If database issue: verify via supabase db dump Ã¢â€ â€™ restore from daily snapshot
3. If connection pool issue: reduce concurrent connections; check for long-running queries
4. If storage issue: verify bucket policies; check file permissions
5. If auth issue: verify JWT secret; check auth providers configuration
6. Full recovery: supabase db restore --file ./backups/portfolio_$(date +%Y%m%d).sql
```

### 6.11 Environment Variables

```bash
# Public (client-safe)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Server-only (MUST NOT be exposed to client)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_DB_PASSWORD=<postgres-password>
SUPABASE_JWT_SECRET=<jwt-secret-from-supabase-dashboard>
```

---

## 7. Resend Integration

### 7.1 Overview

| Field             | Value                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| **Service**       | Resend                                                                                           |
| **Category**      | Communication                                                                                    |
| **Tier**          | Ã°Å¸Å¸Â¡ Stable                                                                                  |
| **Purpose**       | Send transactional emails: lead auto-reply, contact notifications, password reset, system alerts |
| **SDK/Package**   | `resend` (Node.js)                                                                               |
| **Documentation** | https://resend.com/docs                                                                          |
| **Status Page**   | https://resend.com/status                                                                        |

### 7.2 Architecture

```mermaid
sequenceDiagram
    participant Visitor as Website Visitor
    participant API as NestJS API
    participant Resend as Resend API
    participant Webhook as Webhook Handler
    participant DB as Supabase

    Visitor->>API: Submit contact form
    API->>API: Validate + sanitize input
    API->>DB: INSERT lead (status: new)
    API->>Resend: POST /emails
    Note over Resend: To: admin@portfolio.com
    Note over Resend: Subject: New Lead from John
    Resend-->>API: 200 OK (email queued)
    API-->>Visitor: 201 Created (lead received)

    alt Auto-reply Enabled
        API->>Resend: POST /emails (auto-reply template)
        Note over Resend: To: john@example.com
        Note over Resend: Subject: Thanks for reaching out
        Resend-->>API: 200 OK
    end

    Note over API,DB: Email Delivery Status
    Resend->>Webhook: POST /api/v1/webhooks/resend (X-Webhook-Secret)
    Webhook->>Webhook: Verify webhook secret
    Webhook->>DB: UPDATE leads SET email_status = 'delivered'
    Webhook-->>Resend: 200 OK
```

### 7.3 Authentication

| Method         | Type                                 | Credential              | Location        | Rotation       |
| -------------- | ------------------------------------ | ----------------------- | --------------- | -------------- |
| API Key        | Bearer token in Authorization header | `RESEND_API_KEY`        | Server env vars | Every 180 days |
| Webhook Secret | Shared secret in header              | `RESEND_WEBHOOK_SECRET` | Server env vars | Every 180 days |

### 7.4 Data Flow

```
Contact Form Ã¢â€ â€™ NestJS Validation Ã¢â€ â€™ INSERT lead Ã¢â€ â€™ Resend API Ã¢â€ â€™ Email Sent Ã¢â€ â€™
Webhook (delivery status) Ã¢â€ â€™ UPDATE lead status
```

### 7.5 Failure Handling

| Failure Mode                        | Detection        | Impact                       | Recovery                                 |
| ----------------------------------- | ---------------- | ---------------------------- | ---------------------------------------- |
| API key expired                     | 401 response     | All email sending fails      | Rotate key; update env var               |
| Daily quota exceeded (100/day free) | 429 response     | New leads not notified       | Wait for reset; leads still stored in DB |
| Email bounce (invalid recipient)    | Delivery webhook | Email not delivered          | Log to lead_activities                   |
| Resend outage                       | 5xx responses    | Emails queued on Resend side | Automatic retry; lead data preserved     |

### 7.6 Fallback Strategy

| Scenario               | Action                                | User Experience                                 |
| ---------------------- | ------------------------------------- | ----------------------------------------------- |
| Resend API unavailable | Log lead + queue email for later send | Lead stored; admin sees new lead in dashboard   |
| Auto-reply fails       | Still notify admin                    | Visitor gets no auto-reply but lead is captured |
| Daily quota exhausted  | Queue for next day                    | Slight delay in email notification              |

### 7.7 Security Considerations

- **API key restriction:** Restrict to sending from verified domains only
- **SPF/DKIM/DMARC:** Configure DNS records for email deliverability
- **Template sanitization:** All user input HTML-escaped in email templates
- **No PII in logs:** Email addresses masked in application logs
- **Rate limit awareness:** Respect Resend's 100/day free tier limit

### 7.8 Rate Limits

| Limit Type                  | Value     | Scope       | Reset      |
| --------------------------- | --------- | ----------- | ---------- |
| Email sending (free tier)   | 100/day   | Per account | Daily      |
| API requests                | 10/second | Per API key | Per second |
| Email send rate             | 5/second  | Per API key | Per second |
| Batch size (max recipients) | 50        | Per call    | Per call   |

### 7.9 Recovery Process

```text
1. Check Resend Status: https://resend.com/status
2. If API key issue: regenerate key in Resend Dashboard Ã¢â€ â€™ Settings Ã¢â€ â€™ API Keys
3. Update RESEND_API_KEY in Vercel environment variables
4. Verify: curl -H "Authorization: Bearer $RESEND_API_KEY" https://api.resend.com/emails
5. If bounce rate high: clean email list; verify SPF/DKIM records
```

### 7.10 Environment Variables

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx           # Resend API key
RESEND_FROM_EMAIL=contact@portfolio.com           # Verified sender address
RESEND_ADMIN_EMAIL=admin@portfolio.com            # Admin notification recipient
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx      # Webhook verification secret
```

---

## 8. OpenAI Integration

### 8.1 Overview

| Field             | Value                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Service**       | OpenAI                                                                                                                            |
| **Category**      | AI Platform                                                                                                                       |
| **Tier**          | Ã°Å¸Å¸Â¡ Stable                                                                                                                   |
| **Purpose**       | Primary LLM for AI chat (GPT-4), text embeddings for RAG pipeline (text-embedding-3-small), content analysis, content suggestions |
| **SDK/Package**   | `openai` (Python), `openai` (Node.js)                                                                                             |
| **Documentation** | https://platform.openai.com/docs                                                                                                  |
| **Status Page**   | https://status.openai.com/                                                                                                        |

### 8.2 Architecture

```mermaid
sequenceDiagram
    participant User as Visitor
    participant Web as Next.js Frontend
    participant AI as FastAPI AI Service
    participant Cache as Response Cache
    participant OpenAI as OpenAI API
    participant DB as Supabase (pgvector)

    User->>Web: Type chat message
    Web->>AI: POST /api/v1/ai/chat (SSE stream)

    AI->>DB: Retrieve relevant context (pgvector similarity search)
    DB-->>AI: Top 3 document chunks

    AI->>Cache: Check response cache (hash of query)
    alt Cache Hit
        Cache-->>AI: Cached response
        AI-->>Web: Stream cached tokens

    else Cache Miss
        AI->>OpenAI: POST /v1/chat/completions (model: gpt-4, max_tokens: 500)
        Note over OpenAI: System prompt + context + history
        OpenAI-->>AI: Streamed response (SSE)
        AI->>Cache: Store response (TTL: 1 hour)
        AI-->>Web: Stream tokens
    end

    Web-->>User: Rendered response

    Note over AI,DB: Embedding Generation
    AI->>OpenAI: POST /v1/embeddings (model: text-embedding-3-small)
    OpenAI-->>AI: 1536-dim vector
    AI->>DB: Store embedding in document_chunks or embeddings_cache
```

### 8.3 Authentication

| Method          | Type                                 | Credential       | Location            | Rotation      |
| --------------- | ------------------------------------ | ---------------- | ------------------- | ------------- |
| API Key         | Bearer token in Authorization header | `OPENAI_API_KEY` | AI service env vars | Every 90 days |
| Organization ID | Optional org header                  | `OPENAI_ORG_ID`  | AI service env vars | As needed     |

### 8.4 Data Flow

```
Chat:  User Message Ã¢â€ â€™ FastAPI Ã¢â€ â€™ pgvector Retrieval Ã¢â€ â€™ Prompt Assembly Ã¢â€ â€™ OpenAI API Ã¢â€ â€™ SSE Stream Ã¢â€ â€™ User
Embed: Content Ã¢â€ â€™ FastAPI Ã¢â€ â€™ OpenAI Embeddings API Ã¢â€ â€™ pgvector Storage
Analyze: Content Ã¢â€ â€™ FastAPI Ã¢â€ â€™ OpenAI GPT-3.5 Ã¢â€ â€™ Readability/SEO/Sentiment Scores
Suggest: Context Ã¢â€ â€™ FastAPI Ã¢â€ â€™ OpenAI GPT-4 Ã¢â€ â€™ Content Suggestions
```

### 8.5 Failure Handling

| Failure Mode         | Detection    | Impact                | Recovery                       |
| -------------------- | ------------ | --------------------- | ------------------------------ |
| API key expired      | 401 response | All AI features fail  | Regenerate key; update env var |
| Rate limit exceeded  | 429 response | AI chat throttled     | Wait for reset; queue requests |
| Model overload       | 503 response | Chat response delayed | Retry with exponential backoff |
| Token limit exceeded | 400 response | Chat message too long | Truncate conversation history  |
| Insufficient credits | 402 response | All AI features fail  | Top up OpenAI account          |

### 8.6 Fallback Strategy

| Scenario                  | Action                                      | User Experience                               |
| ------------------------- | ------------------------------------------- | --------------------------------------------- |
| GPT-4 unavailable         | Switch to Anthropic Claude 3.5 Sonnet       | Slightly different response style; same speed |
| All LLMs unavailable      | Show "AI assistant temporarily unavailable" | Chat widget shows friendly offline message    |
| Embedding API unavailable | Return cached embeddings                    | Avoid re-indexing during outage               |
| Content analysis fails    | Return basic stats without AI               | Flesch-Kincaid + word count only              |

### 8.7 Security Considerations

- **API key server-only:** Never expose OPENAI_API_KEY to client-side code
- **No training on API data:** OpenAI API data is NOT used for training by default (check opt-out policy)
- **Prompt injection protection:** Sanitize user input; enforce system prompt boundary
- **Cost tracking:** Monitor token usage per session; cap at 500 max_tokens per response
- **Data retention:** Chat messages stored for 30 days only; document chunks retained indefinitely
- **Rate limit awareness:** Implement token bucket rate limiting per session (20 requests/session)

### 8.8 Rate Limits

| Limit Type                     | Value                | Scope       | Reset       |
| ------------------------------ | -------------------- | ----------- | ----------- |
| GPT-4 (free tier)              | 20 RPM / 40K TPM     | Per API key | Per minute  |
| GPT-4 (Tier 1)                 | 500 RPM / 200K TPM   | Per API key | Per minute  |
| GPT-3.5 Turbo                  | 3,500 RPM / 160K TPM | Per API key | Per minute  |
| text-embedding-3-small         | 20,000 RPM / 10M TPM | Per API key | Per minute  |
| Max tokens per request (GPT-4) | 8,192                | Per request | Per request |

### 8.9 Monitoring

| Metric                     | Alert Threshold | Action                         |
| -------------------------- | --------------- | ------------------------------ |
| Cost per day > $1          | Warning         | Review usage patterns          |
| Cost per month > $10       | Critical        | Implement stricter rate limits |
| p95 response time > 5s     | Warning         | Switch to faster model         |
| Error rate > 5%            | Critical        | Check API key and billing      |
| Token usage > 80% of limit | Warning         | Implement response caching     |

### 8.10 Recovery Process

```text
1. Check OpenAI Status: https://status.openai.com/
2. If API key issue: regenerate in platform.openai.com Ã¢â€ â€™ API Keys
3. Update OPENAI_API_KEY in Railway environment variables
4. If billing issue: add credits in platform.openai.com Ã¢â€ â€™ Billing
5. Verify: curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
6. If model deprecation: update model name to latest version
```

### 8.11 Environment Variables

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx      # OpenAI API key (server-side only)
OPENAI_ORG_ID=org-xxxxxxxxxxxxxxxxxxxxxxxx        # Optional org ID
OPENAI_MODEL_CHAT=gpt-4                           # Primary chat model
OPENAI_MODEL_EMBEDDING=text-embedding-3-small     # Embedding model
OPENAI_MODEL_ANALYSIS=gpt-3.5-turbo               # Cost-optimized analysis model
OPENAI_MAX_TOKENS=500                            # Max tokens per response
OPENAI_MAX_RETRIES=3                              # Max retry attempts
```

---

## 9. Anthropic Integration

### 9.1 Overview

| Field             | Value                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| **Service**       | Anthropic                                                                                          |
| **Category**      | AI Platform                                                                                        |
| **Tier**          | Ã°Å¸â€Âµ Fallback                                                                                  |
| **Purpose**       | Fallback LLM for AI chat when OpenAI is unavailable; provides Claude 3.5 Sonnet as secondary model |
| **SDK/Package**   | `anthropic` (Python), `@anthropic-ai/sdk` (Node.js)                                                |
| **Documentation** | https://docs.anthropic.com/en/docs                                                                 |
| **Status Page**   | https://status.anthropic.com/                                                                      |

### 9.2 Architecture

```mermaid
sequenceDiagram
    participant AI as FastAPI AI Service
    participant Router as Model Router
    participant OpenAI as OpenAI API
    participant Anthropic as Anthropic API
    participant User as End User

    User->>AI: Chat request
    AI->>Router: Route to primary model

    alt Primary Available
        Router->>OpenAI: GPT-4 request
        OpenAI-->>Router: Response
        Router-->>AI: Return response
    else Primary Fails (5xx/429/timeout)
        Router->>Router: Log failover event to Sentry
        Router->>Anthropic: POST /v1/messages (claude-sonnet-4-20250514)
        Note over Anthropic: Same context/prompt as failed OpenAI call
        Anthropic-->>Router: Response
        Router->>Router: Record fallback usage metrics
        Router-->>AI: Return response (with fallback header)
    end

    AI-->>User: Response (X-Model: gpt-4 | claude-sonnet)
```

### 9.3 Authentication

| Method  | Type             | Credential          | Location            | Rotation      |
| ------- | ---------------- | ------------------- | ------------------- | ------------- |
| API Key | x-api-key header | `ANTHROPIC_API_KEY` | AI service env vars | Every 90 days |

### 9.4 Failure Handling

| Failure Mode        | Detection     | Impact                          | Recovery                    |
| ------------------- | ------------- | ------------------------------- | --------------------------- |
| API key expired     | 401 response  | No impact (primary always used) | Rotate key; update env var  |
| Rate limit exceeded | 429 response  | Fallback not available          | Wait for reset              |
| Model unavailable   | 5xx responses | Fallback not available          | Wait for Anthropic recovery |

### 9.5 Fallback Strategy

| Scenario                           | Action               | User Experience                         |
| ---------------------------------- | -------------------- | --------------------------------------- |
| Neither LLM available              | Show offline message | Chat widget: "AI assistant unavailable" |
| OpenAI degrades Ã¢â€ â€™ Anthropic | Automatic switch     | Slight response style change            |
| Anthropic also degrades            | Full offline mode    | Chat widget gracefully degrades         |

### 9.6 Rate Limits

| Limit Type             | Value     | Scope       | Reset       |
| ---------------------- | --------- | ----------- | ----------- |
| API requests           | 10/second | Per API key | Per second  |
| Tokens per minute      | 50,000    | Per API key | Per minute  |
| Max tokens per request | 200K      | Per message | Per message |

### 9.7 Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx     # Anthropic API key
ANTHROPIC_MODEL=claude-sonnet-4-20250514          # Fallback model
ANTHROPIC_ENABLED=true                            # Enable fallback (to disable, set false)
ANTHROPIC_MAX_TOKENS=500                          # Max tokens per response
```

---

## 10. PostHog Integration

### 10.1 Overview

| Field             | Value                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Service**       | PostHog                                                                                                                                                       |
| **Category**      | Observability & Analytics                                                                                                                                     |
| **Tier**          | Ã°Å¸Å¸Â¢ Production                                                                                                                                           |
| **Purpose**       | Product analytics (pageviews, events, funnels), session recordings (identify UX issues), feature flags (A/B testing, gradual rollout), user behavior analysis |
| **SDK/Package**   | `posthog-js` (frontend), `posthog-node` (backend)                                                                                                             |
| **Documentation** | https://posthog.com/docs                                                                                                                                      |
| **Status Page**   | https://status.posthog.com/                                                                                                                                   |

### 10.2 Architecture

```mermaid
sequenceDiagram
    participant Visitor as Website Visitor
    participant Web as Next.js Frontend
    participant API as NestJS API
    participant PostHog as PostHog Cloud (EU)
    participant DB as Supabase

    Visitor->>Web: Page load
    Web->>PostHog: $pageview (auto-capture)
    PostHog-->>Web: Session recording check

    Visitor->>Web: Click project card
    Web->>PostHog: project_click (custom event, { slug, title, tech })
    Web->>Visitor: Navigate to detail page

    Visitor->>Web: Scroll to 50% of sections
    Web->>PostHog: section_view (batch, every 5s)

    Visitor->>Web: Submit contact form
    Web->>API: POST /api/v1/leads
    API->>DB: Insert lead
    API->>PostHog: lead_created (custom event, { source })
    API-->>Web: 201 Created
    Web->>PostHog: lead_submitted (custom event)

    Note over Web,PostHog: Feature Flags (Admin)
    Web->>PostHog: getFeatureFlag('hero-cta-variant')
    PostHog-->>Web: 'control' or 'test'
    Web->>Web: Render variant based on flag
```

### 10.3 Authentication

| Method             | Type          | Credential                | Location        | Rotation                          |
| ------------------ | ------------- | ------------------------- | --------------- | --------------------------------- |
| Project API Key    | Public key    | `NEXT_PUBLIC_POSTHOG_KEY` | Client env var  | Project-level (PostHog dashboard) |
| Personal API Token | Private token | `POSTHOG_API_TOKEN`       | Server env vars | Every 180 days                    |

### 10.4 Data Flow

```
Page View:   Browser Ã¢â€ â€™ posthog-js Ã¢â€ â€™ PostHog Cloud Ã¢â€ â€™ Dashboard
Custom Event: Browser Ã¢â€ â€™ posthog-js (batch, 5s) Ã¢â€ â€™ PostHog Cloud Ã¢â€ â€™ Dashboard
Feature Flag: Admin Page Ã¢â€ â€™ posthog-js Ã¢â€ â€™ PostHog Cloud Ã¢â€ â€™ Flag Value Ã¢â€ â€™ Render Variant
Backend Event: NestJS Ã¢â€ â€™ posthog-node Ã¢â€ â€™ PostHog Cloud Ã¢â€ â€™ Dashboard
```

### 10.5 Failure Handling

| Failure Mode          | Detection             | Impact                          | Recovery                                   |
| --------------------- | --------------------- | ------------------------------- | ------------------------------------------ |
| PostHog unavailable   | SDK timeout           | Events queued locally (max 8KB) | Automatically sent on reconnect            |
| Rate limit exceeded   | 429 response          | Events dropped                  | Reduce event volume                        |
| Feature flag API down | Flag evaluation fails | Default to control variant      | Serve default variant; no A/B test running |

### 10.6 Fallback Strategy

| Scenario                       | Action                                      | User Experience                                     |
| ------------------------------ | ------------------------------------------- | --------------------------------------------------- |
| PostHog analytics down         | Fallback to Supabase analytics_events table | Admin analytics shows DB data (limited aggregation) |
| Feature flags unavailable      | Serve default (control) variant             | No A/B testing; default experience                  |
| Session recordings unavailable | Disable recordings                          | No impact on core functionality                     |

### 10.7 Security Considerations

- **EU hosting:** PostHog Cloud EU ensures GDPR compliance
- **No PII in events:** Anonymize all user identifiers
- **API key safety:** `NEXT_PUBLIC_POSTHOG_KEY` is public (designed for client-side use)
- **Cookie-less tracking:** PostHog can operate without cookies (use local storage)
- **Event filtering:** Filter out sensitive form field values before sending
- **IP anonymization:** Enable PostHog's IP anonymization setting

### 10.8 Rate Limits

| Limit Type                    | Value           | Scope       | Reset   |
| ----------------------------- | --------------- | ----------- | ------- |
| Events (free tier)            | 1,000,000/month | Per project | Monthly |
| Session recordings (free)     | 5,000/month     | Per project | Monthly |
| API requests (personal token) | 500/hour        | Per token   | Hourly  |
| Feature flag evaluations      | 5,000/hour      | Per token   | Hourly  |

### 10.9 Monitoring

| Metric                                  | Alert Threshold | Action                                          |
| --------------------------------------- | --------------- | ----------------------------------------------- |
| Events > 80% of monthly quota           | Warning         | Review event volume; reduce non-critical events |
| Recording minutes > 80% of quota        | Warning         | Disable recordings for low-traffic pages        |
| Feature flag evaluation latency > 100ms | Warning         | Cache flag values locally                       |

### 10.10 Recovery Process

```text
1. Check PostHog Status: https://status.posthog.com/
2. If quota issue: PostHog dashboard Ã¢â€ â€™ Billing Ã¢â€ â€™ Increase limit or wait for reset
3. If key issue: PostHog dashboard Ã¢â€ â€™ Project Settings Ã¢â€ â€™ API Keys Ã¢â€ â€™ Regenerate
4. If feature flags broken: Set default values in code as fallback
```

### 10.11 Environment Variables

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxx   # PostHog project API key (public)
NEXT_PUBLIC_POSTHOG_HOST=https://eu.posthog.com      # PostHog EU region
POSTHOG_PERSONAL_TOKEN=phx_xxxxxxxxxxxxxxxxxxxxxxx   # Personal API token (server-side)
POSTHOG_PROJECT_ID=12345                             # PostHog project ID
```

---

## 11. Umami Integration

### 11.1 Overview

| Field             | Value                                                                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Service**       | Umami                                                                                                                                                           |
| **Category**      | Observability & Analytics                                                                                                                                       |
| **Tier**          | Ã°Å¸Å¸Â¡ Stable                                                                                                                                                 |
| **Purpose**       | Privacy-first web analytics (pageviews, referrers, device breakdown, real-time visitors); self-hosted on Railway as backup analytics source for admin dashboard |
| **SDK/Package**   | Umami tracking script (JS snippet), Umami REST API                                                                                                              |
| **Documentation** | https://umami.is/docs                                                                                                                                           |
| **Status Page**   | N/A (self-hosted)                                                                                                                                               |

### 11.2 Architecture

```mermaid
sequenceDiagram
    participant Visitor as Website Visitor
    participant Web as Next.js Frontend
    participant API as NestJS API
    participant Umami as Umami Server (Railway)
    participant DB as Umami PostgreSQL

    Visitor->>Web: Page load
    Web->>Umami: GET /script.js (tracking script)
    Umami-->>Web: Tracking script

    Note over Visitor,Umami: Visitor sends analytics directly to Umami
    Visitor->>Umami: POST /api/send (pageview data)
    Umami->>DB: INSERT pageview (url, referrer, device, country)
    Umami-->>Visitor: 1x1 GIF (acknowledged)

    Note over API,Umami: Admin Dashboard
    API->>Umami: GET /api/website/1/stats (Basic Auth)
    Umami->>DB: Query aggregated stats
    DB-->>Umami: Results
    Umami-->>API: { pageviews, visitors, bounceRate }
    API->>API: Cache response (60s TTL)
    API-->>Web: Dashboard widget data
```

### 11.3 Authentication

| Method     | Type                | Credential                         | Location        | Rotation       |
| ---------- | ------------------- | ---------------------------------- | --------------- | -------------- |
| Basic Auth | Username + Password | `UMAMI_USERNAME`, `UMAMI_PASSWORD` | Server env vars | Every 90 days  |
| API Token  | Bearer token        | `UMAMI_API_TOKEN`                  | Server env vars | Every 180 days |

### 11.4 Data Flow

```
Tracking: Browser Ã¢â€ â€™ Umami JS Snippet Ã¢â€ â€™ Umami Server Ã¢â€ â€™ Umami PostgreSQL
Dashboard: NestJS API Ã¢â€ â€™ Umami REST API Ã¢â€ â€™ Cached Response Ã¢â€ â€™ Admin Dashboard Widget
```

### 11.5 Failure Handling

| Failure Mode            | Detection              | Impact                                  | Recovery                                      |
| ----------------------- | ---------------------- | --------------------------------------- | --------------------------------------------- |
| Umami server down       | API timeout            | Admin analytics widget shows stale data | Railway auto-restarts container               |
| Umami DB full           | API error              | New pageviews not tracked               | Clear old data or increase Railway PG storage |
| Self-hosted SSL expired | API connection refused | Admin dashboard can't fetch analytics   | Renew SSL cert or use HTTP internally         |

### 11.6 Fallback Strategy

| Scenario            | Action                                 | User Experience                      |
| ------------------- | -------------------------------------- | ------------------------------------ |
| Umami unavailable   | Serve PostHog analytics data instead   | Admin sees PostHog data in dashboard |
| Both analytics down | Show "Analytics unavailable" state     | Admin dashboard shows cached data    |
| Umami DB corrupted  | Restore from Railway PostgreSQL backup | Temporary data gap                   |

### 11.7 Security Considerations

- **Self-hosted:** Full data control; no third-party data sharing
- **No cookies:** Umami operates without cookie consent (privacy-compliant)
- **API access restricted:** Umami API accessible only from backend (not public)
- **Regular backups:** Umami PostgreSQL backed up via Railway automated snapshots
- **IP anonymization:** Umami automatically hashes IP addresses

### 11.8 Rate Limits

| Limit Type          | Value                             | Scope        | Reset |
| ------------------- | --------------------------------- | ------------ | ----- |
| API requests        | Configurable (default: unlimited) | Per instance | N/A   |
| Tracking requests   | Configurable                      | Per instance | N/A   |
| Umami database size | Railway PG free tier: 500MB       | Per project  | N/A   |

### 11.9 Monitoring

| Metric                                | Alert Threshold | Action                            |
| ------------------------------------- | --------------- | --------------------------------- |
| Umami API response > 1s               | Warning         | Check Railway container health    |
| Umami disk usage > 80%                | Warning         | Data retention cleanup            |
| Umami container restart count > 3/day | Warning         | Check Railway logs for OOM errors |

### 11.10 Recovery Process

```text
1. Check Railway dashboard for container health
2. Restart Umami container: railway service restart
3. Check Umami logs: railway logs --service umami
4. If database issue: railway connect Ã¢â€ â€™ psql Ã¢â€ â€™ check umami DB
5. If data corruption: restore from Railway database backup
```

### 11.11 Environment Variables

```bash
NEXT_PUBLIC_UMAMI_URL=https://umami.yourdomain.com  # Self-hosted Umami URL
UMAMI_API_TOKEN=umami_api_token_xxxxxxxxxxxxx       # Umami API access token
UMAMI_WEBSITE_ID=1                                   # Umami website ID for queries
UMAMI_USERNAME=admin                                 # Umami admin username
UMAMI_PASSWORD=<umami-admin-password>                # Umami admin password
```

---

## 12. Sentry Integration

### 12.1 Overview

| Field             | Value                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Service**       | Sentry                                                                                                              |
| **Category**      | Observability & Monitoring                                                                                          |
| **Tier**          | Ã°Å¸Å¸Â¢ Production                                                                                                 |
| **Purpose**       | Error tracking (frontend + backend), performance monitoring (API tracing), release health tracking, crash reporting |
| **SDK/Package**   | `@sentry/nextjs` (frontend), `@sentry/node` (backend), `sentry-sdk` (Python)                                        |
| **Documentation** | https://docs.sentry.io/                                                                                             |
| **Status Page**   | https://status.sentry.io/                                                                                           |

### 12.2 Architecture

```mermaid
sequenceDiagram
    participant Web as Next.js Frontend
    participant API as NestJS API
    participant AI as FastAPI AI
    participant Sentry as Sentry SaaS
    participant DB as Supabase

    Note over Web,Sentry: Frontend Error Tracking
    Web->>Web: React error boundary catches error
    Web->>Sentry: Sentry.captureException(error)
    Note over Sentry: Automatic: breadcrumbs, user context, replay
    Sentry-->>Web: 200 OK (event received)
    Web->>Sentry: Sentry.reportDialog() (user feedback prompt)

    Note over API,Sentry: Backend Error Tracking
    API->>API: Exception in route handler
    API->>Sentry: GlobalExceptionFilter Ã¢â€ â€™ Sentry.captureException()
    Note over Sentry: Extra: correlationId, path, method, request body
    API-->>Web: JSON error response (no stack trace)

    Note over AI,Sentry: AI Service Error Tracking
    AI->>AI: LLM call fails
    AI->>Sentry: sentry_sdk.capture_exception()
    Note over Sentry: Extra: model, tokens, latency
    AI->>AI: Fallback to secondary model

    Note over Web,DB: Performance Monitoring
    Sentry->>Sentry: Auto-instrument HTTP requests, DB queries, function calls
    Sentry-->>Web: Performance trace (p95, p99, throughput)
```

### 12.3 Authentication

| Method     | Type          | Credential               | Location        | Rotation                         |
| ---------- | ------------- | ------------------------ | --------------- | -------------------------------- |
| DSN        | Public key    | `NEXT_PUBLIC_SENTRY_DSN` | Client env var  | Project-level (Sentry dashboard) |
| Auth Token | Private token | `SENTRY_AUTH_TOKEN`      | Server env vars | Every 180 days                   |

### 12.4 Data Flow

```
Error: Application Ã¢â€ â€™ Sentry SDK Ã¢â€ â€™ Sentry SaaS Ã¢â€ â€™ Dashboard Ã¢â€ â€™ Alert
Trace: API Request Ã¢â€ â€™ Sentry SDK (auto-instrumented) Ã¢â€ â€™ Sentry Performance Ã¢â€ â€™ Dashboard
Release: CI/CD Ã¢â€ â€™ sentry-cli Ã¢â€ â€™ Sentry Releases Ã¢â€ â€™ Release Health Dashboard
```

### 12.5 Failure Handling

| Failure Mode        | Detection      | Impact                        | Recovery                            |
| ------------------- | -------------- | ----------------------------- | ----------------------------------- |
| Sentry unavailable  | SDK timeout    | Errors logged to console only | Automatically reconnects            |
| Rate limit exceeded | 429 response   | Events dropped until reset    | Reduce error volume or upgrade plan |
| DSN misconfigured   | SDK init error | No errors tracked             | Verify DSN in environment           |

### 12.6 Fallback Strategy

| Scenario                | Action                           | User Experience                          |
| ----------------------- | -------------------------------- | ---------------------------------------- |
| Sentry down             | Console.error + audit_logs table | Errors logged to DB for later review     |
| Rate limited            | Events queued and flushed later  | Temporary gap in error coverage          |
| SDK fails to initialize | Graceful degradation             | No error tracking; app continues working |

### 12.7 Security Considerations

- **DSN exposure:** DSN is designed to be public (only allows event submission, not reading)
- **PII scrubbing:** Configure `denylist` to strip sensitive fields (passwords, tokens, emails)
- **Environment tagging:** Use `environment: 'production'` | `'staging'` | `'development'`
- **Sample rate:** Set `tracesSampleRate: 0.2` in production to manage quota
- **User context:** Include only `id` and `role`, never email or tokens
- **Release tracking:** Tag errors with current `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA`

### 12.8 Rate Limits

| Limit Type                | Value        | Scope            | Reset   |
| ------------------------- | ------------ | ---------------- | ------- |
| Errors (free tier)        | 5,000/month  | Per organization | Monthly |
| Performance traces (free) | 10,000/month | Per organization | Monthly |
| Replays (free)            | 500/month    | Per organization | Monthly |

### 12.9 Monitoring

| Metric                      | Alert Threshold | Action                             |
| --------------------------- | --------------- | ---------------------------------- |
| Error count > 10/day        | Warning         | Investigate error group            |
| New error introduced        | Warning         | Review PR for regression           |
| p95 API response > 500ms    | Warning         | Check performance traces           |
| Error rate > 5% of requests | Critical        | Investigate and rollback if needed |

### 12.10 Recovery Process

```text
1. Check Sentry Status: https://status.sentry.io/
2. If quota issue: Review Sentry dashboard Ã¢â€ â€™ filter non-critical errors
3. If DSN issue: Sentry dashboard Ã¢â€ â€™ Settings Ã¢â€ â€™ Client Keys (DSN) Ã¢â€ â€™ Copy DSN
4. Update environment variable Ã¢â€ â€™ re-deploy
5. Verify: Trigger test error Ã¢â€ â€™ confirm in Sentry Issues
```

### 12.11 Environment Variables

```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxx@xxxxxxxx.ingest.us.sentry.io/12345
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENTRY_ORG=portfolioowner
SENTRY_PROJECT=portfolio-web
```

---

## 13. Better Uptime Integration

### 13.1 Overview

| Field             | Value                                                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Service**       | Better Uptime (formerly Better Stack)                                                                                              |
| **Category**      | Observability & Monitoring                                                                                                         |
| **Tier**          | Ã°Å¸Å¸Â¢ Production                                                                                                                |
| **Purpose**       | External uptime monitoring, status page for public transparency, SSL certificate expiry alerts, heartbeat monitoring for cron jobs |
| **SDK/Package**   | Better Uptime REST API, webhooks                                                                                                   |
| **Documentation** | https://docs.betterstack.com/                                                                                                      |
| **Status Page**   | N/A (Better Uptime SaaS)                                                                                                           |

### 13.2 Architecture

```mermaid
sequenceDiagram
    participant BU as Better Uptime
    participant Web as Portfolio Frontend
    participant API as NestJS API
    participant Status as Status Page
    participant Alert as Alert Channels

    Note over BU,Alert: Uptime Monitoring (1-min interval)
    BU->>Web: GET https://portfolioowner.com/api/health
    Web-->>BU: 200 OK { status: "ok" }
    BU->>API: GET https://api.portfolioowner.com/health
    API-->>BU: 200 OK { status: "ok", db: "connected" }

    Note over BU,Alert: Incident Detection
    BU->>Web: GET https://portfolioowner.com/
    Web-->>BU: 5xx (or timeout)
    BU->>BU: Incident created (downtime detected)

    alt Auto-resolve
        BU->>Web: GET https://portfolioowner.com/ (retry)
        Web-->>BU: 200 OK
        BU->>BU: Auto-resolve incident
    else Manual
        BU->>Alert: Send email alert
        BU->>Alert: Send Telegram notification
    end

    Note over BU,Status: Status Page
    BU->>Status: Update status indicators
    Web->>Status: Embed status widget (iframe)
    Status-->>Web: Current status (green/yellow/red)
```

### 13.3 Authentication

| Method        | Type          | Credential                    | Location        | Rotation       |
| ------------- | ------------- | ----------------------------- | --------------- | -------------- |
| API Token     | Bearer token  | `BETTER_UPTIME_API_TOKEN`     | Server env vars | Every 180 days |
| Webhook Token | Shared secret | `BETTER_UPTIME_WEBHOOK_TOKEN` | Server env vars | Every 180 days |

### 13.4 Failure Handling

| Failure Mode                  | Detection                | Impact                 | Recovery                                  |
| ----------------------------- | ------------------------ | ---------------------- | ----------------------------------------- |
| Better Uptime down            | Dashboard unreachable    | Status page goes stale | Wait for Better Uptime recovery           |
| Health endpoint misconfigured | False positive downtimes | Incorrect status       | Fix health endpoint Ã¢â€ â€™ auto-resolve |

### 13.5 Fallback Strategy

| Scenario                       | Action                           | User Experience             |
| ------------------------------ | -------------------------------- | --------------------------- |
| Better Uptime API unavailable  | Status widget shows cached state | Stale uptime badge          |
| Health check fails 3x in a row | Incident created + alert sent    | Admin receives notification |

### 13.6 Rate Limits

| Limit Type            | Value     | Scope       | Reset      |
| --------------------- | --------- | ----------- | ---------- |
| Monitors (free tier)  | 10        | Per account | N/A        |
| Check interval (free) | 1 minute  | Per monitor | Per check  |
| Status page (free)    | 1         | Per account | N/A        |
| API requests          | 60/minute | Per token   | Per minute |

### 13.7 Environment Variables

```bash
BETTER_UPTIME_API_TOKEN=bt_api_xxxxxxxxxxxxxxxxxxxx  # Better Uptime API token
BETTER_UPTIME_WEBHOOK_TOKEN=bt_wh_xxxxxxxxxxxxxxxxxx # Webhook secret
BETTER_UPTIME_STATUS_PAGE=https://portfolioowner.betteruptime.com  # Status page URL
```

---

## 14. Vercel Integration

### 14.1 Overview

| Field             | Value                                                                                                                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Service**       | Vercel                                                                                                                                                                                         |
| **Category**      | Core Platform                                                                                                                                                                                  |
| **Tier**          | Ã°Å¸Å¸Â¢ Production                                                                                                                                                                            |
| **Purpose**       | Frontend hosting (Next.js SSR/ISR), API hosting (NestJS serverless functions), CDN (global edge network), ISR caching (60s revalidation), environment variable management, preview deployments |
| **SDK/Package**   | Vercel CLI, Vercel REST API, `@vercel/analytics`, `@vercel/speed-insights`                                                                                                                     |
| **Documentation** | https://vercel.com/docs                                                                                                                                                                        |
| **Status Page**   | https://www.vercel-status.com/                                                                                                                                                                 |

### 14.2 Architecture

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Git as GitHub
    participant Vercel as Vercel Platform
    participant CDN as Vercel Edge CDN
    participant App as Next.js + NestJS
    participant Supabase as Supabase

    Note over Dev,Supabase: Deployment Flow
    Dev->>Git: git push main
    Git->>Vercel: Webhook: push to main
    Vercel->>Vercel: Build (npm ci Ã¢â€ â€™ turbo build)
    Vercel->>Vercel: Deploy to production
    Vercel-->>Git: Deployment URL

    Note over Dev,Supabase: Request Flow
    User->>CDN: https://portfolioowner.com
    CDN->>App: Forward request
    alt ISR Page
        App->>Supabase: Fetch data
        App->>CDN: Cache page (60s)
        CDN-->>User: Fast cached response
    else Dynamic Page
        App->>Supabase: Fetch data
        App-->>User: Rendered page
    end

    Note over Dev,Supabase: Environment Variables
    Vercel->>Vercel: Serve env vars per environment
    App->>Vercel: Read env vars at runtime
```

### 14.3 Authentication

| Method       | Type                  | Credential          | Location               | Rotation       |
| ------------ | --------------------- | ------------------- | ---------------------- | -------------- |
| Vercel Token | Personal access token | `VERCEL_TOKEN`      | GitHub Actions secrets | Every 180 days |
| Team ID      | Project identifier    | `VERCEL_ORG_ID`     | GitHub Actions secrets | As needed      |
| Project ID   | Project identifier    | `VERCEL_PROJECT_ID` | GitHub Actions secrets | As needed      |

### 14.4 Data Flow

```
Deploy: GitHub Push Ã¢â€ â€™ Vercel Webhook Ã¢â€ â€™ Build Ã¢â€ â€™ Deploy Ã¢â€ â€™ CDN
Request: User Ã¢â€ â€™ Vercel CDN Ã¢â€ â€™ Edge Ã¢â€ â€™ Serverless Function Ã¢â€ â€™ Supabase Ã¢â€ â€™ Response
Env Vars: Vercel Dashboard Ã¢â€ â€™ Environment Variables Ã¢â€ â€™ Runtime
```

### 14.5 Failure Handling

| Failure Mode                        | Detection             | Impact                                 | Recovery                                |
| ----------------------------------- | --------------------- | -------------------------------------- | --------------------------------------- |
| Build timeout > 45 min              | Build failure         | Deploy blocked; previous deploy active | Optimize build; increase timeout        |
| Edge function timeout (10s default) | 504 response          | API endpoints timeout                  | Optimize query; increase timeout to 30s |
| Serverless cold start (> 500ms)     | Slow initial response | First request slow                     | Enable lambda warming                   |
| Bandwidth exceeded                  | Site throttled        | Slow page loads                        | Optimize assets or upgrade plan         |

### 14.6 Fallback Strategy

| Scenario                 | Action                       | User Experience                          |
| ------------------------ | ---------------------------- | ---------------------------------------- |
| Build fails              | Previous deploy stays active | No impact (rollback to last good deploy) |
| ISR cache miss           | Server-render page           | Slightly slower first load (still < 1s)  |
| Edge function cold start | Initial request latency      | ~500ms delay on first request per region |

### 14.7 Rate Limits

| Limit Type                       | Value       | Scope       | Reset     |
| -------------------------------- | ----------- | ----------- | --------- |
| Build minutes (free)             | 6,000/month | Per account | Monthly   |
| Bandwidth (free)                 | 100GB/month | Per account | Monthly   |
| Serverless executions (free)     | 500K/month  | Per account | Monthly   |
| Edge function invocations (free) | 1M/month    | Per account | Monthly   |
| Concurrent builds (free)         | 1           | Per account | Per build |

### 14.8 Environment Variables

```bash
# Vercel (used in CI/CD only)
VERCEL_TOKEN=<vercel-personal-access-token>          # Vercel API token
VERCEL_ORG_ID=<vercel-team-id>                        # Vercel team/org ID
VERCEL_PROJECT_ID=<vercel-project-id>                 # Vercel project ID

# Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=<analytics-id>        # Vercel Web Analytics
NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA=${VERCEL_GIT_COMMIT_SHA}  # Auto-injected by Vercel
```

---

## 15. Google OAuth Integration

### 15.1 Overview

| Field             | Value                                                                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Service**       | Google OAuth 2.0                                                                                                                              |
| **Category**      | Authentication                                                                                                                                |
| **Tier**          | Ã°Å¸Å¸Â¢ Production                                                                                                                           |
| **Purpose**       | Admin login via Google Single Sign-On (SSO). Used with NestJS Passport for admin authentication. Only a specific email address is authorized. |
| **SDK/Package**   | NestJS Passport (built-in GoogleProvider), Google OAuth 2.0 APIs                                                                              |
| **Documentation** | https://developers.google.com/identity/protocols/oauth2                                                                                       |
| **Status Page**   | https://status.cloud.google.com/                                                                                                              |

### 15.2 Architecture

```mermaid
sequenceDiagram
    participant Admin as Admin User
    participant Web as Next.js Frontend
    participant NestJS Passport as NestJS Passport
    participant Google as Google OAuth
    participant Supabase as Supabase Auth
    participant API as NestJS API

    Admin->>Web: Navigate to /admin/login
    Web-->>Admin: Login form (Google button)

    Admin->>Web: Click "Sign in with Google"
    Web->>NestJS Passport: signIn('google')
    NestJS Passport->>Google: Redirect to Google OAuth consent screen
    Google-->>Admin: Select account
    Admin->>Google: Grant permissions
    Google->>NestJS Passport: Authorization code (redirect URI)

    NestJS Passport->>Google: POST /token (code + client_id + client_secret)
    Google-->>NestJS Passport: Access token + ID token

    NestJS Passport->>NestJS Passport: Verify ID token (JWT signature)
    NestJS Passport->>NestJS Passport: Check allowed email domain
    Note over NestJS Passport: Only admin@portfolio.com allowed

    alt Email Authorized
        NestJS Passport->>Supabase: Sync user session
        NestJS Passport-->>Web: Session created
        Web-->>Admin: Redirect to /admin dashboard
    else Email Unauthorized
        NestJS Passport-->>Web: Access denied
        Web-->>Admin: "Unauthorized email" error
    end

    Note over Admin,API: Subsequent API calls
    Web->>API: GET /api/v1/sections (JWT in session)
    API->>API: JwtAuthGuard verifies token
    API-->>Web: Response
```

### 15.3 Authentication

| Method        | Type                    | Credential             | Location        | Rotation                              |
| ------------- | ----------------------- | ---------------------- | --------------- | ------------------------------------- |
| Client ID     | OAuth client identifier | `GOOGLE_CLIENT_ID`     | Server env vars | As needed (regenerate in GCP Console) |
| Client Secret | OAuth client secret     | `GOOGLE_CLIENT_SECRET` | Server env vars | Every 90 days                         |

### 15.4 Failure Handling

| Failure Mode              | Detection           | Impact                        | Recovery                                        |
| ------------------------- | ------------------- | ----------------------------- | ----------------------------------------------- |
| OAuth credentials revoked | Login fails         | Cannot login with Google      | Regenerate credentials in GCP Console           |
| Google OAuth outage       | Redirect fails      | Login unavailable             | Fallback to email + password                    |
| Email not authorized      | Auth callback fails | Login redirects to error page | Verify allowed emails in NestJS Passport config |

### 15.5 Fallback Strategy

| Scenario                  | Action                   | User Experience                     |
| ------------------------- | ------------------------ | ----------------------------------- |
| Google OAuth unavailable  | Show password login form | Admin logs in with email + password |
| OAuth credentials invalid | Password fallback        | No Google login; password works     |

### 15.6 Security Considerations

- **Email allowlist:** Only `admin@portfolio.com` is authorized (NestJS Passport `authorize` callback)
- **Redirect URI validation:** Only `https://portfolioowner.com/api/auth/callback/google` is allowed
- **CSRF protection:** NestJS Passport includes built-in state parameter validation
- **Token expiry:** 1-hour access tokens; 30-day session cookies (rolling)
- **Session encryption:** NestJS Passport encrypts session data with `JWT_SECRET`
- **HTTPS required:** OAuth redirects only work over HTTPS (callback URL must be HTTPS)

### 15.7 Rate Limits

| Limit Type     | Value                        | Scope         | Reset |
| -------------- | ---------------------------- | ------------- | ----- |
| OAuth requests | No hard limit (Google OAuth) | Per client ID | N/A   |
| Token refresh  | No hard limit                | Per user      | N/A   |

### 15.8 Environment Variables

```bash
GOOGLE_CLIENT_ID=123456789-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx
JWT_SECRET=<random-64-char-string>              # Encrypted by `openssl rand -base64 32`
NEXTAUTH_URL=https://portfolioowner.com               # Required for production
```

---

## 16. Cloudflare Integration

### 16.1 Overview

| Field             | Value                                                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Service**       | Cloudflare                                                                                                                                                                     |
| **Category**      | Core Platform                                                                                                                                                                  |
| **Tier**          | Ã°Å¸Å¸Â¢ Production                                                                                                                                                            |
| **Purpose**       | DNS management (authoritative DNS), DDoS protection (edge mitigation), SSL/TLS termination (free Universal SSL), CDN caching (static assets), email routing (domain catch-all) |
| **SDK/Package**   | Cloudflare API v4                                                                                                                                                              |
| **Documentation** | https://developers.cloudflare.com/                                                                                                                                             |
| **Status Page**   | https://www.cloudflarestatus.com/                                                                                                                                              |

### 16.2 Architecture

```mermaid
graph TB
    subgraph "Internet"
        User["Ã°Å¸Å’Â Visitor"]
        Attacker["Ã°Å¸â€™â‚¬ Malicious Actor"]
    end

    subgraph "Cloudflare Edge"
        DNS["DNS Resolution<br/>Authoritative NS"]
        WAF["WAF / DDoS<br/>Rate Limiting<br/>IP Reputation"]
        SSL["SSL/TLS<br/>Universal SSL<br/>Full (Strict)"]
        CACHE["CDN Cache<br/>Static Assets<br/>Edge Caching"]
        PROXY["Proxy<br/>Orange Cloud Mode"]
    end

    subgraph "Origin (Vercel)"
        ORIGIN["Vercel Edge Network<br/>Next.js + NestJS"]
    end

    subgraph "Email"
        EMAIL["Email Routing<br/>Domain Catch-all<br/>admin Ã¢â€ â€™ personal"]
    end

    User -->|DNS Lookup| DNS
    User -->|HTTPS Request| PROXY

    Attacker -->|DDoS| WAF
    WAF -->|Clean Traffic| PROXY

    PROXY --> SSL
    SSL -->|Cache Hit| CACHE
    CACHE -->|Served from Edge| User

    SSL -->|Cache Miss| ORIGIN
    ORIGIN -->|Response| PROXY
    PROXY -->|Cached| User

    EMAIL -.->|Route| User
```

### 16.3 DNS Configuration

| Record Type | Name                | Value                                  | Proxy            | TTL  | Purpose               |
| ----------- | ------------------- | -------------------------------------- | ---------------- | ---- | --------------------- |
| A           | `@`                 | `76.76.21.21` (Vercel)                 | Proxied (orange) | Auto | Root domain           |
| CNAME       | `www`               | `portfolioowner.com`                   | Proxied (orange) | Auto | WWW redirect          |
| CNAME       | `api`               | `cname.vercel-dns.com`                 | Proxied (orange) | Auto | API subdomain         |
| CNAME       | `umami`             | `railway.app`                          | Proxied (gray)   | Auto | Self-hosted Umami     |
| CNAME       | `_domainkey`        | `dkim.resend.com`                      | DNS only         | Auto | Resend DKIM           |
| TXT         | `@`                 | `"v=spf1 include:spf.resend.com ~all"` | DNS only         | Auto | SPF for Resend        |
| TXT         | `resend._domainkey` | `"k=rsa; p=..."`                       | DNS only         | Auto | DKIM for Resend       |
| TXT         | `@`                 | `"v=DMARC1; p=quarantine;..."`         | DNS only         | Auto | DMARC policy          |
| CAA         | `@`                 | `0 issue "letsencrypt.org"`            | DNS only         | Auto | Certificate Authority |

### 16.4 Security Configuration

| Setting             | Value                             | Rationale                                         |
| ------------------- | --------------------------------- | ------------------------------------------------- |
| SSL/TLS mode        | Full (Strict)                     | End-to-end encryption; requires valid origin cert |
| Minimum TLS version | 1.2                               | Dropping TLS 1.0/1.1 support                      |
| Always Use HTTPS    | On                                | HTTP requests redirected to HTTPS                 |
| HSTS                | On (max-age: 63072000)            | Preload HSTS; submit to HSTS preload list         |
| WAF rate limiting   | 500 requests/10s per IP           | Generic rate limiting                             |
| Bot Fight Mode      | On                                | Challenge bots (may affect legitimate crawlers)   |
| Email Routing       | Catch-all Ã¢â€ â€™ personal email | Email to any @portfolioowner.com                  |
| IP Geolocation      | On                                | Pass CF-IPCountry header to origin                |

### 16.5 Failure Handling

| Failure Mode           | Detection                  | Impact                                      | Recovery                                        |
| ---------------------- | -------------------------- | ------------------------------------------- | ----------------------------------------------- |
| DNS propagation delay  | DNS check tools            | Site temporarily unreachable for some users | Wait for TTL expiry (max 5 min with Cloudflare) |
| DDoS attack            | WAF dashboard alert        | Potential latency increase                  | Cloudflare automatically mitigates              |
| SSL certificate expiry | Cloudflare dashboard alert | HTTPS connection warnings                   | Auto-renew via Cloudflare Universal SSL         |
| Cloudflare outage      | Status page                | Site unavailable globally                   | Switch to DNS-only mode (disable proxy)         |

### 16.6 Fallback Strategy

| Scenario             | Action                                                   | User Experience                                                  |
| -------------------- | -------------------------------------------------------- | ---------------------------------------------------------------- |
| Cloudflare edge down | Traffic routes directly to Vercel origin (disable proxy) | Users may see Vercel SSL warning (mitigated by Vercel's own SSL) |
| DNS resolution fails | Wait for Cloudflare recovery                             | Site unreachable for affected ISPs                               |

### 16.7 Rate Limits

| Limit Type              | Value       | Scope       | Reset     |
| ----------------------- | ----------- | ----------- | --------- |
| API requests            | 1,200/5 min | Per account | Per 5 min |
| DNS record count (free) | Unlimited   | Per zone    | N/A       |
| Page Rules (free)       | 3           | Per zone    | N/A       |
| WAF custom rules (free) | 5           | Per zone    | N/A       |

### 16.8 Environment Variables

```bash
# Not needed in application Ã¢â‚¬â€ Cloudflare is configured via dashboard
# However, for programmatic access:
# CLOUDFLARE_API_TOKEN=cf_api_xxxxxxxxxxxxxxxxxxxxx   # Cloudflare API token (DNS zone edit)
# CLOUDFLARE_ZONE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx    # Cloudflare zone ID
```

---

## 17. GitHub Actions Integration

### 17.1 Overview

| Field             | Value                                                                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Service**       | GitHub Actions                                                                                                                                                           |
| **Category**      | Core Platform                                                                                                                                                            |
| **Tier**          | Ã°Å¸Å¸Â¢ Production                                                                                                                                                      |
| **Purpose**       | CI/CD pipeline (lint, typecheck, test, build, deploy), automated quality checks on every PR, production deployments on main branch pushes, Dependabot dependency updates |
| **SDK/Package**   | GitHub Actions (YAML workflow), Vercel CLI (deployment), Railway CLI (AI service deploy)                                                                                 |
| **Documentation** | https://docs.github.com/en/actions                                                                                                                                       |
| **Status Page**   | https://www.githubstatus.com/ (actions section)                                                                                                                          |

### 17.2 Architecture

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Git as GitHub
    participant Actions as GitHub Actions
    participant Vercel as Vercel
    participant Railway as Railway
    participant DB as Supabase

    Note over Dev,DB: CI Pipeline (every push + PR)
    Dev->>Git: git push feature-branch
    Git->>Actions: Trigger: push to any branch
    Actions->>Actions: Setup Node.js 20
    Actions->>Actions: npm ci (cached)
    Actions->>Actions: npx turbo typecheck
    Actions->>Actions: npx turbo lint
    Actions->>Actions: npx turbo test
    Actions->>Actions: npm audit --audit-level=high
    Actions-->>Git: Ã¢Å“â€¦ All checks passed

    Note over Dev,DB: CD Pipeline (push to main only)
    Dev->>Git: git push main
    Git->>Actions: Trigger: push to main
    Actions->>Actions: Quality checks (same as CI)

    Actions->>Vercel: vercel --prod (--token=$VERCEL_TOKEN)
    Note over Vercel: Build + Deploy Next.js + NestJS
    Vercel-->>Actions: Ã¢Å“â€¦ Production URL

    Actions->>Railway: railway up (--service=ai-service)
    Note over Railway: Deploy FastAPI AI service
    Railway-->>Actions: Ã¢Å“â€¦ Deployed

    Actions->>DB: supabase db push (migrations)
    Note over DB: Apply database migrations
    DB-->>Actions: Ã¢Å“â€¦ Migrations applied
```

### 17.3 Authentication

| Method          | Type                       | Credential      | Location               | Rotation       |
| --------------- | -------------------------- | --------------- | ---------------------- | -------------- |
| Vercel Token    | Personal access token      | `VERCEL_TOKEN`  | GitHub Actions secrets | Every 180 days |
| Railway Token   | Service token              | `RAILWAY_TOKEN` | GitHub Actions secrets | Every 180 days |
| Supabase DB URL | Database connection string | `DATABASE_URL`  | GitHub Actions secrets | Every 90 days  |

### 17.4 Data Flow

```
Push Ã¢â€ â€™ GitHub Ã¢â€ â€™ Workflow Trigger Ã¢â€ â€™ Setup Ã¢â€ â€™ Quality Checks Ã¢â€ â€™ Build Ã¢â€ â€™ Deploy (Vercel + Railway) Ã¢â€ â€™ Notify
PR Ã¢â€ â€™ GitHub Ã¢â€ â€™ Workflow Trigger Ã¢â€ â€™ Setup Ã¢â€ â€™ Quality Checks Ã¢â€ â€™ Status Check on PR
Schedule Ã¢â€ â€™ Dependabot Ã¢â€ â€™ PR with dependency updates Ã¢â€ â€™ CI Pipeline Ã¢â€ â€™ Merge
```

### 17.5 Failure Handling

| Failure Mode         | Detection             | Impact                                  | Recovery                             |
| -------------------- | --------------------- | --------------------------------------- | ------------------------------------ |
| Build fails          | Workflow failure      | Deploy blocked; previous version serves | Fix build error; re-push             |
| Test failure         | Workflow failure      | PR blocked from merging                 | Fix tests; commit fix                |
| Vercel deploy fails  | Workflow step failure | API/frontend not updated                | Check Vercel logs; re-run workflow   |
| Railway deploy fails | Workflow step failure | AI service not updated                  | Check Railway logs; re-run workflow  |
| Migration fails      | Workflow step failure | Database schema mismatch                | Rollback migration; fix and re-apply |

### 17.6 Fallback Strategy

| Scenario             | Action                                  | User Experience                    |
| -------------------- | --------------------------------------- | ---------------------------------- |
| Vercel deploy fails  | Previous deploy stays active            | No user impact                     |
| Railway deploy fails | Previous AI service stays active        | AI chat continues with old version |
| Migration fails      | Manual rollback via supabase db restore | Database in previous state         |

### 17.7 Security Considerations

- **Secrets management:** All tokens stored as GitHub Actions secrets (encrypted at rest)
- **No secrets in logs:** GitHub Actions automatically masks secrets in workflow output
- **Branch protection:** Require CI to pass before merge; require PR review
- **Audit trail:** All workflow runs logged in GitHub Actions Ã¢â€ â€™ Security
- **Dependabot alerts:** Enable for vulnerability notifications

### 17.8 Rate Limits

| Limit Type              | Value       | Scope          | Reset          |
| ----------------------- | ----------- | -------------- | -------------- |
| Workflow minutes (free) | 2,000/month | Per account    | Monthly        |
| Concurrent jobs (free)  | 20          | Per account    | Per job        |
| Dependabot PRs          | Unlimited   | Per repository | Per dependency |
| Artifact storage (free) | 500MB       | Per account    | N/A            |

### 17.9 Environment Variables

```bash
# GitHub Actions Secrets (configured in GitHub repo Settings Ã¢â€ â€™ Secrets Ã¢â€ â€™ Actions)
VERCEL_TOKEN=<vercel-personal-access-token>
RAILWAY_TOKEN=<railway-service-token>
DATABASE_URL=postgresql://postgres:password@db.xxxxxxxxxxxx.supabase.co:5432/postgres
```

### 17.10 Workflow Structure

```yaml
# .github/workflows/ci.yml
name: CI/CD
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npx turbo typecheck lint test build
      - run: npm audit --audit-level=high

  deploy-web:
    needs: quality
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}

  deploy-ai:
    needs: quality
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: railway/railway-action@v2
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 18. Complete Environment Variable Inventory

### 18.1 Master Environment File Template

```bash
# ============================================================
# PORTFOLIO PLATFORM Ã¢â‚¬â€ Master Environment Variable Template
# ============================================================
# Copy this to .env.local and configure all variables
# ============================================================

# ============================================================
# SECTION 1: Supabase (Database, Auth, Storage)
# ============================================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_DB_PASSWORD=<postgres-password>
SUPABASE_JWT_SECRET=<jwt-secret>

# ============================================================
# SECTION 2: Authentication (NestJS Passport + OAuth)
# ============================================================
JWT_SECRET=<random-64-char-string>
NEXTAUTH_URL=https://portfolioowner.com
GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx
GITHUB_CLIENT_ID=<github-oauth-client-id>
GITHUB_CLIENT_SECRET=<github-oauth-client-secret>

# ============================================================
# SECTION 3: GitHub (API + Webhooks)
# ============================================================
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_USERNAME=portfolioowner
GITHUB_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx

# ============================================================
# SECTION 4: Resend (Email)
# ============================================================
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=contact@portfolio.com
RESEND_ADMIN_EMAIL=admin@portfolio.com
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx

# ============================================================
# SECTION 5: OpenAI (AI Chat, Embeddings, Analysis)
# ============================================================
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
OPENAI_ORG_ID=org-xxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL_CHAT=gpt-4
OPENAI_MODEL_EMBEDDING=text-embedding-3-small
OPENAI_MODEL_ANALYSIS=gpt-3.5-turbo
OPENAI_MAX_TOKENS=500

# ============================================================
# SECTION 6: Anthropic (Fallback LLM)
# ============================================================
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx
ANTHROPIC_MODEL=claude-sonnet-4-20250514
ANTHROPIC_ENABLED=true
ANTHROPIC_MAX_TOKENS=500

# ============================================================
# SECTION 7: PostHog (Analytics & Feature Flags)
# ============================================================
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://eu.posthog.com
POSTHOG_PERSONAL_TOKEN=phx_xxxxxxxxxxxxxxxxxxxxxxx
POSTHOG_PROJECT_ID=12345

# ============================================================
# SECTION 8: Umami (Privacy Analytics)
# ============================================================
NEXT_PUBLIC_UMAMI_URL=https://umami.yourdomain.com
UMAMI_API_TOKEN=umami_api_token_xxxxxxxxxxxxx
UMAMI_WEBSITE_ID=1
UMAMI_USERNAME=admin
UMAMI_PASSWORD=<umami-admin-password>

# ============================================================
# SECTION 9: Sentry (Error Tracking)
# ============================================================
NEXT_PUBLIC_SENTRY_DSN=https://xxxx@xxxx.ingest.us.sentry.io/12345
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENTRY_ORG=portfolioowner
SENTRY_PROJECT=portfolio-web

# ============================================================
# SECTION 10: Better Uptime (Monitoring)
# ============================================================
BETTER_UPTIME_API_TOKEN=bt_api_xxxxxxxxxxxxxxxxxxxx
BETTER_UPTIME_WEBHOOK_TOKEN=bt_wh_xxxxxxxxxxxxxxxxxx
BETTER_UPTIME_STATUS_PAGE=https://portfolioowner.betteruptime.com

# ============================================================
# SECTION 11: Vercel (Deployment Ã¢â‚¬â€ CI/CD only)
# ============================================================
# These are stored as GitHub Actions secrets, not in .env.local
# VERCEL_TOKEN=<vercel-personal-access-token>
# VERCEL_ORG_ID=<vercel-team-id>
# VERCEL_PROJECT_ID=<vercel-project-id>

# ============================================================
# SECTION 12: Cloudflare (DNS Ã¢â‚¬â€ Dashboard only)
# ============================================================
# Cloudflare is configured via Cloudflare Dashboard
# No env vars needed at application level

# ============================================================
# SECTION 13: GitHub Actions (CI/CD Secrets)
# ============================================================
# These are stored as GitHub Actions secrets, not in .env.local
# RAILWAY_TOKEN=<railway-service-token>
# DATABASE_URL=postgresql://...supabase.co:5432/postgres
```

### 18.2 Environment by Application

| Variable                        | Web (Next.js) | API (NestJS) | AI (FastAPI) | Public  |
| ------------------------------- | :-----------: | :----------: | :----------: | :-----: |
| `NEXT_PUBLIC_SUPABASE_URL`      |    Ã¢Å“â€¦    |    Ã¢ÂÅ’     |    Ã¢ÂÅ’     | Ã¢Å“â€¦ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` |    Ã¢Å“â€¦    |    Ã¢ÂÅ’     |    Ã¢ÂÅ’     | Ã¢Å“â€¦ |
| `SUPABASE_SERVICE_ROLE_KEY`     |     Ã¢ÂÅ’     |   Ã¢Å“â€¦    |   Ã¢Å“â€¦    |  Ã¢ÂÅ’  |
| `JWT_SECRET`                    |    Ã¢Å“â€¦    |   Ã¢Å“â€¦    |    Ã¢ÂÅ’     |  Ã¢ÂÅ’  |
| `GOOGLE_CLIENT_ID`              |    Ã¢Å“â€¦    |   Ã¢Å“â€¦    |    Ã¢ÂÅ’     |  Ã¢ÂÅ’  |
| `GOOGLE_CLIENT_SECRET`          |    Ã¢Å“â€¦    |   Ã¢Å“â€¦    |    Ã¢ÂÅ’     |  Ã¢ÂÅ’  |
| `GITHUB_TOKEN`                  |     Ã¢ÂÅ’     |   Ã¢Å“â€¦    |    Ã¢ÂÅ’     |  Ã¢ÂÅ’  |
| `RESEND_API_KEY`                |     Ã¢ÂÅ’     |   Ã¢Å“â€¦    |    Ã¢ÂÅ’     |  Ã¢ÂÅ’  |
| `OPENAI_API_KEY`                |     Ã¢ÂÅ’     |    Ã¢ÂÅ’     |   Ã¢Å“â€¦    |  Ã¢ÂÅ’  |
| `ANTHROPIC_API_KEY`             |     Ã¢ÂÅ’     |    Ã¢ÂÅ’     |   Ã¢Å“â€¦    |  Ã¢ÂÅ’  |
| `NEXT_PUBLIC_POSTHOG_KEY`       |    Ã¢Å“â€¦    |    Ã¢ÂÅ’     |    Ã¢ÂÅ’     | Ã¢Å“â€¦ |
| `POSTHOG_PERSONAL_TOKEN`        |     Ã¢ÂÅ’     |   Ã¢Å“â€¦    |    Ã¢ÂÅ’     |  Ã¢ÂÅ’  |
| `NEXT_PUBLIC_UMAMI_URL`         |    Ã¢Å“â€¦    |    Ã¢ÂÅ’     |    Ã¢ÂÅ’     | Ã¢Å“â€¦ |
| `NEXT_PUBLIC_SENTRY_DSN`        |    Ã¢Å“â€¦    |   Ã¢Å“â€¦    |   Ã¢Å“â€¦    | Ã¢Å“â€¦ |

### 18.3 Secrets Rotation Schedule

| Secret                    | Rotation Period | Last Rotation | Next Rotation | Impact if Compromised    |
| ------------------------- | --------------- | ------------- | ------------- | ------------------------ |
| Supabase DB Password      | 90 days         | Ã¢â‚¬â€       | Ã¢â‚¬â€       | Full database access     |
| Supabase JWT Secret       | 90 days         | Ã¢â‚¬â€       | Ã¢â‚¬â€       | Token forgery            |
| SUPABASE_SERVICE_ROLE_KEY | 180 days        | Ã¢â‚¬â€       | Ã¢â‚¬â€       | Database write access    |
| GOOGLE_CLIENT_SECRET      | 90 days         | Ã¢â‚¬â€       | Ã¢â‚¬â€       | OAuth token theft        |
| GITHUB_CLIENT_SECRET      | 90 days         | Ã¢â‚¬â€       | Ã¢â‚¬â€       | GitHub account access    |
| GITHUB_TOKEN              | 90 days         | Ã¢â‚¬â€       | Ã¢â‚¬â€       | Repository read access   |
| RESEND_API_KEY            | 180 days        | Ã¢â‚¬â€       | Ã¢â‚¬â€       | Send unauthorized emails |
| OPENAI_API_KEY            | 90 days         | Ã¢â‚¬â€       | Ã¢â‚¬â€       | AI cost abuse ($$$)      |
| ANTHROPIC_API_KEY         | 90 days         | Ã¢â‚¬â€       | Ã¢â‚¬â€       | AI cost abuse ($$$)      |
| SENTRY_AUTH_TOKEN         | 180 days        | Ã¢â‚¬â€       | Ã¢â‚¬â€       | Error data access        |
| VERCEL_TOKEN              | 180 days        | Ã¢â‚¬â€       | Ã¢â‚¬â€       | Deployment control       |
| RAILWAY_TOKEN             | 180 days        | Ã¢â‚¬â€       | Ã¢â‚¬â€       | Deployment control       |
| JWT_SECRET                | 365 days        | Ã¢â‚¬â€       | Ã¢â‚¬â€       | Session forgery          |

---

## 19. Composite Risk Matrix

### 19.1 Integration Risk Assessment

| Integration    | Service Dependency Risk                | Data Sensitivity                     | Cost Risk                               | Vendor Lock-in                           | Overall Risk    | Mitigation                                    |
| -------------- | -------------------------------------- | ------------------------------------ | --------------------------------------- | ---------------------------------------- | --------------- | --------------------------------------------- |
| Supabase       | Ã°Å¸â€Â´ High (all data depends on it) | Ã°Å¸â€Â´ High (all portfolio data)   | Ã°Å¸Å¸Â¢ Low (free tier sufficient)     | Ã°Å¸Å¸Â¡ Medium (PostgreSQL is portable) | Ã°Å¸Å¸Â¡ Medium | Daily backups; pg_dump for portability        |
| Vercel         | Ã°Å¸â€Â´ High (hosting + CDN)          | Ã°Å¸Å¸Â¢ Low (no data stored)        | Ã°Å¸Å¸Â¢ Low (free tier sufficient)     | Ã°Å¸Å¸Â¡ Medium (Next.js is portable)    | Ã°Å¸Å¸Â¡ Medium | Keep Next.js portable; test on Netlify/Fly.io |
| GitHub         | Ã°Å¸â€Â´ High (source control + CI/CD) | Ã°Å¸Å¸Â¢ Low (code only, no secrets) | Ã°Å¸Å¸Â¢ Low (free tier)                | Ã°Å¸Å¸Â¡ Medium (git is universal)       | Ã°Å¸Å¸Â¢ Low    | Local git backup; mirror to GitLab            |
| Cloudflare     | Ã°Å¸Å¸Â¡ Medium (DNS + DDoS)           | Ã°Å¸Å¸Â¢ Low (no data)               | Ã°Å¸Å¸Â¢ Low (free tier)                | Ã°Å¸Å¸Â¢ Low (standard DNS)              | Ã°Å¸Å¸Â¢ Low    | Secondary DNS provider (backup zone file)     |
| OpenAI         | Ã°Å¸Å¸Â¡ Medium (AI chat)              | Ã°Å¸Å¸Â¢ Low (conversations)         | Ã°Å¸Å¸Â¡ Medium (~$5/month variable)    | Ã°Å¸Å¸Â¡ Medium (model API)              | Ã°Å¸Å¸Â¡ Medium | Anthropic fallback; cap max_tokens            |
| Resend         | Ã°Å¸Å¸Â¡ Medium (email delivery)       | Ã°Å¸Å¸Â¡ Medium (lead emails)        | Ã°Å¸Å¸Â¢ Low (free tier 100/day)        | Ã°Å¸Å¸Â¢ Low (SMTP standard)             | Ã°Å¸Å¸Â¢ Low    | SMTP backup (direct Gmail)                    |
| PostHog        | Ã°Å¸Å¸Â¢ Low (analytics only)          | Ã°Å¸Å¸Â¢ Low (anonymized events)     | Ã°Å¸Å¸Â¢ Low (free tier 1M events)      | Ã°Å¸Å¸Â¢ Low (open source)               | Ã°Å¸Å¸Â¢ Low    | Umami fallback; custom DB events              |
| Umami          | Ã°Å¸Å¸Â¢ Low (analytics only)          | Ã°Å¸Å¸Â¢ Low (anonymized)            | Ã°Å¸Å¸Â¢ Low (self-hosted)              | Ã°Å¸Å¸Â¢ Low (open source)               | Ã°Å¸Å¸Â¢ Low    | PostHog fallback                              |
| Sentry         | Ã°Å¸Å¸Â¢ Low (error tracking)          | Ã°Å¸Å¸Â¡ Medium (error traces)       | Ã°Å¸Å¸Â¢ Low (free tier 5K events)      | Ã°Å¸Å¸Â¢ Low (open source SDK)           | Ã°Å¸Å¸Â¢ Low    | Console fallback; audit_logs table            |
| Better Uptime  | Ã°Å¸Å¸Â¢ Low (monitoring only)         | Ã°Å¸Å¸Â¢ Low (no data)               | Ã°Å¸Å¸Â¢ Low (free tier)                | Ã°Å¸Å¸Â¢ Low (check interval config)     | Ã°Å¸Å¸Â¢ Low    | Manual health check via curl                  |
| Anthropic      | Ã°Å¸Å¸Â¢ Low (fallback only)           | Ã°Å¸Å¸Â¢ Low (conversations)         | Ã°Å¸Å¸Â¢ Low (no usage if OpenAI works) | Ã°Å¸Å¸Â¢ Low (model API)                 | Ã°Å¸Å¸Â¢ Low    | N/A (standby only)                            |
| Google OAuth   | Ã°Å¸Å¸Â¡ Medium (admin login)          | Ã°Å¸Å¸Â¡ Medium (auth data)          | Ã°Å¸Å¸Â¢ Low (free)                     | Ã°Å¸Å¸Â¢ Low (OAuth standard)            | Ã°Å¸Å¸Â¢ Low    | Email + password fallback                     |
| GitHub Actions | Ã°Å¸Å¸Â¡ Medium (CI/CD pipeline)       | Ã°Å¸Å¸Â¢ Low (no data)               | Ã°Å¸Å¸Â¢ Low (free tier 2K min)         | Ã°Å¸Å¸Â¡ Medium (YAML standard)          | Ã°Å¸Å¸Â¢ Low    | Local CLI deployment as backup                |

### 19.2 Critical Failure Scenarios

| Scenario                         | Integrations Affected | Maximum Downtime | Mitigation                                        |
| -------------------------------- | --------------------- | ---------------- | ------------------------------------------------- |
| Supabase region outage           | All features          | 2 hours          | Daily backup Ã¢â€ â€™ restore to new project      |
| OpenAI API key compromised       | AI chat (cost abuse)  | 15 min           | Auto-rotate key; set spending limit               |
| Vercel platform outage           | Site unavailable      | Vercel SLA       | DNS failover to backup host                       |
| GitHub Actions minutes exhausted | CI/CD blocked         | Monthly          | Reduce workflow frequency; use self-hosted runner |
| Resend daily quota exceeded      | Email notifications   | 24 hours         | Leads still stored in DB; fallback to SMTP        |

---

## 20. Integration Health Dashboard

### 20.1 Health Check Endpoint

The platform exposes a readiness endpoint that checks all integrations:

```typescript
// GET /api/v1/ready
{
  "status": "ready",
  "timestamp": "2026-06-15T10:30:00.000Z",
  "version": "1.0.0",
  "checks": {
    "database": { "status": "healthy", "latencyMs": 2, "connections": 3 },
    "storage": { "status": "healthy", "usagePercent": 15 },
    "resend": { "status": "healthy", "quotaRemaining": 87 },
    "openai": { "status": "healthy", "latencyMs": 450, "quotaRemaining": 85 },
    "anthropic": { "status": "standby", "latencyMs": null },
    "posthog": { "status": "healthy" },
    "umami": { "status": "healthy" },
    "sentry": { "status": "healthy" },
    "github": { "status": "healthy", "rateLimitRemaining": 4800 },
    "vercel": { "status": "healthy" },
    "github_actions": { "status": "healthy", "lastRun": "success" }
  }
}
```

### 20.2 Integration Status Dashboard

| Integration    | Status             | Uptime (30d) | Last Check       | Last Incident | Key Metric            |
| -------------- | ------------------ | ------------ | ---------------- | ------------- | --------------------- |
| Supabase       | Ã¢Å“â€¦ Healthy    | 99.97%       | 1s ago           | None (30d)    | Query latency: 2ms    |
| Vercel         | Ã¢Å“â€¦ Healthy    | 99.99%       | 5s ago           | None (30d)    | p95 load: 45ms        |
| GitHub         | Ã¢Å“â€¦ Healthy    | 99.95%       | 10s ago          | None (30d)    | Rate remaining: 4,800 |
| Cloudflare     | Ã¢Å“â€¦ Healthy    | 100%         | 30s ago          | None (30d)    | DNS 100% uptime       |
| Resend         | Ã¢Å“â€¦ Healthy    | 99.9%        | 1m ago           | None (30d)    | Quota: 87/100         |
| OpenAI         | Ã¢Å“â€¦ Healthy    | 99.8%        | 30s ago          | None (30d)    | Cost today: $0.42     |
| Anthropic      | Ã¢ÂÂ¸Ã¯Â¸Â Standby | Ã¢â‚¬â€      | Ã¢â‚¬â€          | Ã¢â‚¬â€       | Ã¢â‚¬â€               |
| PostHog        | Ã¢Å“â€¦ Healthy    | 99.9%        | 1m ago           | None (30d)    | Events: 45K/1M        |
| Umami          | Ã¢Å“â€¦ Healthy    | 99.5%        | 2m ago           | None (30d)    | Visitors today: 234   |
| Sentry         | Ã¢Å“â€¦ Healthy    | 99.9%        | 5s ago           | None (30d)    | Errors today: 3       |
| Better Uptime  | Ã¢Å“â€¦ Healthy    | 99.97%       | 30s ago          | None (30d)    | Uptime: 99.97%        |
| Google OAuth   | Ã¢Å“â€¦ Healthy    | 100%         | 1h ago           | None (30d)    | Logins today: 1       |
| GitHub Actions | Ã¢Å“â€¦ Healthy    | 99.9%        | Last run: 2h ago | None (30d)    | Minutes: 150/2,000    |

---

## 21. Cost Tracking & Budget

### 21.1 Monthly Cost Breakdown

| Integration   | Free Tier Limit                      | Est. Actual Usage                         | Cost       | Budget  | Overrun Risk    |
| ------------- | ------------------------------------ | ----------------------------------------- | ---------- | ------- | --------------- |
| Supabase      | 500MB DB, 1GB Storage, 50K Users     | < 50MB DB, < 100MB Storage, 1 User        | $0         | $0      | Ã°Å¸Å¸Â¢ Low    |
| Vercel        | 100GB BW, 6,000 Build Min, 500K Exec | < 5GB BW, < 500 Build Min, < 10K Exec     | $0         | $0      | Ã°Å¸Å¸Â¢ Low    |
| GitHub        | 2,000 CI/CD Minutes                  | < 200 Minutes                             | $0         | $0      | Ã°Å¸Å¸Â¢ Low    |
| Cloudflare    | Unlimited DNS, DDoS                  | Standard usage                            | $0         | $0      | Ã°Å¸Å¸Â¢ Low    |
| PostHog       | 1M Events                            | < 50K Events                              | $0         | $0      | Ã°Å¸Å¸Â¢ Low    |
| Sentry        | 5K Errors                            | < 500 Errors                              | $0         | $0      | Ã°Å¸Å¸Â¢ Low    |
| Resend        | 100 Emails/Day                       | < 5 Emails/Day                            | $0         | $0      | Ã°Å¸Å¸Â¢ Low    |
| Umami         | Self-hosted (Railway $5 credit)      | Minimal usage                             | $0         | $0      | Ã°Å¸Å¸Â¢ Low    |
| Better Uptime | 10 Monitors, 1-min checks            | 3 Monitors                                | $0         | $0      | Ã°Å¸Å¸Â¢ Low    |
| OpenAI        | $18 free credit (new accounts)       | ~$3.50/month (chat) + ~$0.65 (embeddings) | ~$4.15     | $10     | Ã°Å¸Å¸Â¡ Medium |
| Anthropic     | $0 (standby, no active usage)        | $0                                        | $0         | $0      | Ã°Å¸Å¸Â¢ Low    |
| Google OAuth  | Unlimited                            | 1 user                                    | $0         | $0      | Ã°Å¸Å¸Â¢ Low    |
| **Total**     |                                      |                                           | **~$4.15** | **$10** | Ã°Å¸Å¸Â¢ Low    |

### 21.2 Cost Optimization Strategies

| Strategy                                | Est. Monthly Savings     | Implementation              | Risk                              |
| --------------------------------------- | ------------------------ | --------------------------- | --------------------------------- |
| Cache AI responses (1-hour TTL)         | ~$1.00                   | Response cache in FastAPI   | Stale responses for same question |
| Use GPT-3.5 for analysis (not GPT-4)    | ~$2.00                   | Model routing per endpoint  | Lower quality analysis            |
| Batch PostHog events (5s interval)      | $0 (already implemented) | posthog-js default behavior | None                              |
| Reduce Sentry traces sample rate to 0.1 | $0 (within free tier)    | Update sentry config        | Less performance data             |
| Use text-embedding-3-small (cheapest)   | ~$0.50                   | Already using it            | Adequate for portfolio scale      |

---

## Decision Log

| ID        | Decision                                                                            | Rationale                                                                                   | Alternatives Considered                                                                                                                 | Date     | Approver                        |
| --------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------- |
| D-INT-001 | Supabase as primary data integration (DB, Auth, Storage, Realtime)                  | All-in-one platform; free tier covers all data needs; built-in RLS and pgvector             | Separate providers for each function (rejected Ã¢â‚¬â€ integration complexity, cost); Firebase (rejected Ã¢â‚¬â€ NoSQL, vendor lock-in) | Mar 2026 | Principal Integration Architect |
| D-INT-002 | OpenAI GPT-4 as primary LLM, Anthropic Claude 3.5 as fallback                       | GPT-4 best quality for portfolio Q&A; Claude fallback for redundancy; both have Python SDKs | Single LLM provider (rejected Ã¢â‚¬â€ single point of failure); open-source self-hosted (rejected Ã¢â‚¬â€ GPU cost, maintenance)        | Jun 2026 | Principal Integration Architect |
| D-INT-003 | PostHog (cloud) as primary analytics, Umami (self-hosted) as privacy-focused backup | PostHog for product analytics; Umami for privacy-compliant simple tracking; both free tier  | Google Analytics (rejected Ã¢â‚¬â€ privacy concerns, GDPR complexity); Mixpanel (rejected Ã¢â‚¬â€ costly at scale)                      | Mar 2026 | Principal Integration Architect |
| D-INT-004 | Resend for transactional emails (contact form, lead notifications)                  | Generous free tier (100 emails/day); modern API; DKIM/SPF support                           | SendGrid (rejected Ã¢â‚¬â€ complex setup, IP warmup); SES (rejected Ã¢â‚¬â€ AWS complexity for portfolio)                               | Mar 2026 | Principal Integration Architect |
| D-INT-005 | Google OAuth as exclusive admin authentication                                      | Free; trusted provider; portfolio owner already has Google account                          | Email/password auth (rejected Ã¢â‚¬â€ password management burden); GitHub OAuth (rejected Ã¢â‚¬â€ less universal)                       | Mar 2026 | Principal Integration Architect |
| D-INT-006 | Sentry for error monitoring and performance tracing                                 | Generous free tier (5K errors/month); distributed tracing; GitHub integration               | Datadog (rejected Ã¢â‚¬â€ cost prohibitive for portfolio); self-hosted Sentry (rejected Ã¢â‚¬â€ maintenance overhead)                   | Mar 2026 | Principal Integration Architect |
| D-INT-007 | GitHub Actions for CI/CD with Dependabot for dependency updates                     | Free for public repos; deep GitHub integration; Dependabot auto-PRs for security patches    | CircleCI (rejected Ã¢â‚¬â€ limited free tier minutes); GitLab CI (rejected Ã¢â‚¬â€ not on GitHub ecosystem)                             | Mar 2026 | Principal Integration Architect |

---

## 22. Integration Change Log

| Version | Date     | Changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Author                          |
| ------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 4.0     | Jun 2026 | **Enterprise-Grade Rewrite**: Added Integration Vision & 8 Design Principles; Master Integration Architecture with 2 Mermaid diagrams (ecosystem map + layer architecture); complete retry/circuit breaker config table; integration health check matrix; feature-to-integration dependency graph; data sovereignty table; tier classification with fallback chain matrix; 13 individual integration sections (each with Architecture, Auth, Data Flow, Failure Handling, Fallback, Security, Rate Limits, Monitoring, Recovery, Env Vars); Mermaid sequence diagrams for all major integrations; complete master environment variable inventory with 30+ variables across 8 categories; per-application env var matrix; secrets rotation schedule; composite risk matrix with 13 integrations; health dashboard table; cost tracking & budget section with optimization strategies | Principal Integration Architect |
| 3.0     | Jun 2026 | Added executive summary, integration maturity model, incident response per integration, fallback chains                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Backend Lead                    |
| 2.0     | Jun 2026 | Updated for enterprise monorepo structure; added Mermaid dependency graph                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Backend Lead                    |
| 1.0     | Mar 2026 | Initial integrations documentation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Backend Lead                    |

---

## Document References

| Reference                                           | Description                                                          |
| --------------------------------------------------- | -------------------------------------------------------------------- |
| `docs/MASTER-INDEX.md`                              | Document navigation and dependency graph                             |
| `docs/05-architecture/SystemArchitecture.md` (v5.0) | System architecture Ã¢â‚¬â€ where integrations are deployed          |
| `docs/05-architecture/10-TECHSTACK.md` (v5.0)       | Technology stack Ã¢â‚¬â€ package versions, dependency update cadence |
| `docs/09-database/DatabaseArchitecture.md` (v5.0)   | Database schema Ã¢â‚¬â€ Supabase is the primary data store           |
| `docs/10-api/12-API.md` (v5.0)                      | API documentation Ã¢â‚¬â€ webhook endpoints for each integration     |
| `docs/11-security/SecurityArchitecture.md` (v5.0)   | Security posture Ã¢â‚¬â€ OWASP compliance for integrations           |
| `docs/11-security/15-AUTHORIZATION.md` (v5.0)       | RBAC model Ã¢â‚¬â€ Google OAuth is the primary auth mechanism        |
| `docs/01-product/02-FEATURES.md` (v3.0)             | Feature catalog Ã¢â‚¬â€ which features depend on which integrations  |
| `docs/05-architecture/13-INTEGRATIONS.md` (v3.0)    | Previous version Ã¢â‚¬â€ superseded by v4.0                          |
| `Ultimate_Portfolio_Plan_2026_v3.docx`              | Complete portfolio blueprint Ã¢â‚¬â€ integration setup instructions  |

---

## Change Log

| Version | Date     | Changes                                                                                 | Author    |
| ------- | -------- | --------------------------------------------------------------------------------------- | --------- |
| 4.0     | Jun 2026 | Enterprise integrations - 18 services, environment matrix, cost analysis, CI validation | Tech Lead |
| 3.0     | Jun 2026 | Updated for enterprise structure; added integration monitoring                          | Tech Lead |
| 2.0     | Jun 2026 | Added OpenAI, Anthropic, PostHog integrations                                           | Tech Lead |
| 1.0     | Mar 2026 | Initial integrations documentation                                                      | Tech Lead |

_Document Version: 4.0 Ã¢â‚¬â€ Enterprise-Grade Integration Architecture_  
_Supersedes v3.0 (June 2026) and all previous versions_  
_Next Review Date: September 2026_

---

---

## Phase 4 Addendum: Sandbox & Auth Integrations

### 1. WebContainer Integration (`@webcontainer/api`)

The Phase 4 AI Sandbox relies heavily on the WebContainer API to boot a full Node.js environment natively within the browser, mirroring the capabilities of platforms like Lovable or StackBlitz.

- **Provider:** StackBlitz WebContainers
- **Usage:** In-browser execution of `npm run dev:web` and other node scripts for live previewing.
- **Security:** Requires strict `COOP/COEP` Cross-Origin Isolation headers served by Next.js.

### 2. GitHub Sandbox Sync

To bypass the browser sandbox's inability to persist files locally (and to securely interact with local IDEs like Antigravity or Cursor), the Sandbox uses the GitHub API.

- **Provider:** GitHub REST API
- **Usage:** Reading the remote repository state and pushing virtual file system changes as commits directly to the staging branch.
- **Auth:** Secured via a backend `GITHUB_PAT` environment variable.

### 3. NestJS Passport.js (Google/GitHub)

The authentication integration has shifted from a direct Next.js-to-Supabase flow to a dedicated NestJS API Gateway using Passport.js.

- **Providers:** Google OAuth 2.0, GitHub OAuth
- **Usage:** Admin dashboard login.
- **Flow:** The Next.js frontend redirects to the NestJS OAuth endpoints. NestJS handles the OAuth exchange, signs a custom JWT, and redirects the user back to the application. Supabase Auth is no longer the primary session manager for the Admin dashboard.

---

## Glossary

| Term                               | Definition                                                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **API Key**                        | A unique identifier used to authenticate a client when making API requests to a third-party service                       |
| **OAuth 2.0**                      | An authorization framework that enables applications to obtain limited access to user accounts on an HTTP service         |
| **Webhook**                        | An HTTP callback that sends real-time data from one application to another when a specific event occurs                   |
| **Circuit Breaker**                | A design pattern that detects failures and prevents cascading failures by stopping repeated requests to a failing service |
| **Exponential Backoff**            | A retry strategy where wait time between retries increases exponentially (e.g., 1s, 2s, 4s, 8s)                           |
| **Rate Limit**                     | A restriction on the number of API requests a client can make within a defined time window                                |
| **SDK (Software Development Kit)** | A collection of tools, libraries, and documentation for integrating with a specific API or service                        |
| **Credential Rotation**            | The practice of periodically replacing API keys, secrets, and passwords to limit exposure from compromised credentials    |
| **Fallback Chain**                 | A sequence of alternative services or strategies to try when the primary integration fails                                |
| **Idempotency Key**                | A unique identifier sent with a request to ensure that duplicate requests produce the same result                         |
| **Env Var (Environment Variable)** | A key-value pair stored outside the application code used for configuration, especially secrets and endpoints             |
| **Dependency Graph**               | A visual representation showing how different integrations depend on each other for functionality                         |
| **Tier Classification**            | A system for categorizing integrations by criticality (Core, Observability, Communication, AI)                            |
| **Health Check**                   | A diagnostic endpoint or probe that verifies an integration is functioning correctly                                      |
| **Composite Risk Matrix**          | A multi-dimensional assessment scoring each integration on availability, security, cost, and vendor risk                  |

## Cross-References

- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system
