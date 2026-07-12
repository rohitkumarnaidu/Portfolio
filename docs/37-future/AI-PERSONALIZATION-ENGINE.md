# AI Personalization Engine — Adaptive Visitor Experience Platform

> **Document:** `docs/37-future/AI-PERSONALIZATION-ENGINE.md`
> **Status:** Design Spec
> **Version:** 1.0
> **Last Updated:** July 2026
> **Owner:** Director of Engineering / AI Team Lead
> **Audience:** Engineering leadership, AI/ML team, Product, Infrastructure

---

## 1. Executive Summary

The AI Personalization Engine transforms the portfolio from a static showcase into an adaptive, intelligent experience that tailors every aspect of the visitor journey — content selection, visual styling, 3D scene complexity, interaction depth, and call-to-action prioritization — based on inferred intent, behavioral signals, and contextual data. Each visitor sees a version of the portfolio optimized for their interests, attention span, and device capabilities.

This system builds on the existing infrastructure: `AnalyticsEvent`, `AnalyticsSession`, `PageView`, and `FeatureFlag` models in the NestJS API; the pgvector-powered `ContentEmbedding` model and RAG pipeline; and the FastAPI AI microservice that currently provides chat, analyze, suggest, and agent endpoints. The engine treats the existing `Section` model's `style_preset`, `style_config`, and `content` fields as personalization levers, applying real-time adjustments without requiring schema changes.

Current baselines (from `docs/15-performance/PERFORMANCE-BENCHMARKS.md` and `docs/operations/AnalyticsArchitecture.md`): ~120 monthly visitors, ~450 page views, 3:42 average session duration. The personalization engine targets a 40% improvement in session duration and a 25% increase in lead conversion within 6 months of full rollout.

---

## 2. Purpose

Design and specify a privacy-first, real-time AI personalization system for the portfolio that:

- Infers visitor intent (browsing, evaluating, hiring, collaborating) from behavioral signals
- Adapts content ordering, section visibility, visual theme, and 3D scene parameters per visitor
- Learns continuously from interactions without retaining PII beyond session boundaries
- Integrates with the existing feature flag system for gradual rollout and A/B testing
- Provides transparent controls: visitors can view, reset, or opt out of personalization

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Visitor Browser                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  @portfolio/web (Next.js App Router)                             │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │  │
│  │  │  Three.js│ │  Sections│ │  Theme   │ │  Personalization │   │  │
│  │  │  Scene   │ │  (order/ │ │  Engine  │ │  Client SDK      │   │  │
│  │  │  Adapter │ │  content)│ │  (theme  │ │  (read profile,  │   │  │
│  │  │          │ │          │ │  switch) │ │   report events)  │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │ HTTP + Server-Sent Events
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Vercel Edge Network (CDN + Edge Functions)                            │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Personalization Edge Middleware                                 │  │
│  │  • Read visitor profile cookie (encrypted, non-PII)             │  │
│  │  • Inject personalization context header to upstream             │  │
│  │  • Serve personalized ISR pages at edge (stale-while-revalidate) │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  NestJS API (apps/api) — Personalization Module                        │
│                                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐                    │
│  │  Signal Collector    │  │  Profile Builder     │                    │
│  │  • Captures raw      │  │  • Session stitching  │                    │
│  │    behavioral events  │  │  • Cross-session      │                    │
│  │  • Batches and       │  │    visitor profiles    │                    │
│  │    enqueues to BullMQ │  │  • PII-free fingerprint│                   │
│  └──────────────────────┘  └──────────────────────┘                    │
│                                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐                    │
│  │  Intent Classifier   │  │  Content Ranker      │                    │
│  │  • Infers intent     │  │  • Reranks sections/  │                    │
│  │    from signal vector │  │    projects per        │                    │
│  │  • Confidence score   │  │    visitor intent      │                    │
│  │  • Fallback to        │  │  • Uses pgvector       │                    │
│  │    default on low     │  │    similarity search   │                    │
│  │    confidence         │  │                        │                    │
│  └──────────────────────┘  └──────────────────────┘                    │
│                                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐                    │
│  │  Experiment Engine   │  │  Scene Optimizer     │                    │
│  │  • A/B test dispatch │  │  • 3D scene params   │                    │
│  │  • Feature flag      │  │  • GPU capability     │                    │
│  │    integration        │  │    detection          │                    │
│  │  • Bayesian analysis  │  │  • Animation          │                    │
│  │    via apps/ai        │  │    complexity tier    │                    │
│  └──────────────────────┘  └──────────────────────┘                    │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Persistence Layer                                                │  │
│  │  • AnalyticsEvent (existing) — raw signals                       │  │
│  │  • VisitorProfile (new) — computed profile per visitorId         │  │
│  │  • ExperimentAssignment (new) — A/B test membership + variant    │  │
│  │  • pgvector ContentEmbedding (existing) — semantic content search│  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │ Internal HTTP
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  FastAPI AI Service (apps/ai)                                           │
│                                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐                    │
│  │  Intent Inference    │  │  Content Generation   │                    │
│  │  • LLM-based intent  │  │  • Personalized       │                    │
│  │    classification     │  │    section summaries   │                    │
│  │  • Zero-shot fallback │  │  • Dynamic CTA text    │                    │
│  └──────────────────────┘  └──────────────────────┘                    │
│                                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐                    │
│  │  Bayesian A/B Engine │  │  Anomaly Detection   │                    │
│  │  • Thompson sampling │  │  • Bots vs humans     │                    │
│  │  • Multi-armed       │  │  • Session poisoning  │                    │
│  │    bandit analysis    │  │    detection          │                    │
│  └──────────────────────┘  └──────────────────────┘                    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Core Concepts

### 4.1 Visitor Intent Taxonomy

The engine classifies visitors into one of five intent categories, each driving different personalization strategies:

| Intent | Description | Typical Signals | Personalization Strategy |
|--------|-------------|-----------------|-------------------------|
| **Browsing** | Casual discovery, no clear goal | Short sessions (<30s), scroll depth <40%, no CTA interaction | Default experience, subtle content highlighting |
| **Evaluating** | Assessing skills for a potential hire or project | Deep project page views, multi-section navigation, tech stack comparison | Surface relevant projects, show testimonial density, enable detailed case studies |
| **Hiring** | Looking to contract or employ | Contact page visit, lead form start, multiple testimonial views | Prioritize CTA, show availability status, simplify contact flow |
| **Collaborating** | Potential partner, open-source contributor | GitHub link clicks, blog reading, sandbox IDE usage | Surface open-source projects, show collaboration history, link to contribution guide |
| **Learning** | Researching technologies or the creator's methods | Blog deep reads, code snippet views, project tech stack exploration | Promote in-depth content, surface related blog posts, enable sandbox exploration |

### 4.2 Signal Vector

The signal vector is a JSON object computed from the visitor's current session, passed to the intent classifier:

```typescript
interface SignalVector {
  session_id: string;
  visitor_id: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  country?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  page_sequence: string[];
  current_page: string;
  pages_viewed: number;
  session_duration_ms: number;
  scroll_depth_percent: number;
  interactions: {
    cta_clicks: number;
    project_clicks: number;
    blog_clicks: number;
    testimonial_clicks: number;
    github_clicks: number;
    lead_form_starts: number;
    lead_form_completions: number;
    search_queries: string[];
    theme_switches: string[];
    chat_messages: number;
  };
  // GPU capabilities (from detect-gpu library)
  gpu: {
    tier: 'low' | 'medium' | 'high';
    vendor?: string;
    renderer?: string;
  };
  time_of_day: number; // 0-23 local hour
  day_of_week: number; // 0-6
  is_return_visitor: boolean;
  return_visit_count: number;
  inferred_language: string; // from Accept-Language header
  reduced_motion: boolean; // prefers-reduced-motion
  color_scheme: 'light' | 'dark'; // prefers-color-scheme
}
```

### 4.3 Personalization Levers

The engine can adjust these aspects of the experience per visitor:

| Lever | Control | Implementation | Existing Foundation |
|-------|---------|----------------|---------------------|
| Section ordering | Reorder portfolio sections per visitor | `Section.display_order` override in profile | Section model |
| Content density | Show/hide optional sections | `Section.is_always_visible` flag | Section model |
| Style preset | Choose visual theme per intent | `Section.style_preset` selection | Section model + Circadian Theme |
| 3D scene complexity | Adjust Three.js scene detail | Scene tier (low/medium/high) | `detect-gpu`, Three.js |
| CTA prioritization | Which CTA appears first, with what text | Dynamic `Section.content` overrides | Section model `content` JSON |
| Project spotlight | Which projects appear first/top | Rerank project list per visitor | Project model, pgvector |
| Animation intensity | GSAP/Framer Motion complexity tier | Redux store personalization context | Framer Motion, GSAP, `prefers-reduced-motion` |
| Testimonial selection | Show testimonials matching visitor context | Rerank testimonial list per intent | Testimonial model |
| Chat persona | Adjust chatbot tone to match intent | `apps/ai` chat endpoint prompt param | Chat routes in FastAPI |
| Blog recommendations | Related articles based on interest vector | pgvector similarity on ContentEmbedding | BlogPost + ContentEmbedding |

---

## 5. Data Model Changes

### 5.1 New Models

```prisma
// —── Visitor Profile —─────────────────────────────────
model VisitorProfile {
  id                String   @id @default(uuid())
  visitorId         String   @unique @map("visitor_id")
  
  // Computed profile (updated via BullMQ job after session)
  intent            String?  // "browsing" | "evaluating" | "hiring" | "collaborating" | "learning"
  intentConfidence  Float?   @map("intent_confidence")
  signalVector      Json     @default("{}") @map("signal_vector")
  preferredTheme    String?  @map("preferred_theme")
  preferredMode     String?  @map("preferred_mode")
  
  // Aggregated stats
  totalSessions     Int      @default(0) @map("total_sessions")
  totalPageViews    Int      @default(0) @map("total_page_views")
  firstSeenAt       DateTime @default(now()) @map("first_seen_at")
  lastSeenAt        DateTime @default(now()) @map("last_seen_at")
  
  // Personalization state
  activeExperiments Json     @default("{}") @map("active_experiments")
  contentOverrides  Json     @default("{}") @map("content_overrides")
  
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  @@index([visitorId])
  @@index([lastSeenAt(sort: Desc)])
  @@map("visitor_profiles")
}

// —── Experiment Assignment —───────────────────────────
model ExperimentAssignment {
  id              String   @id @default(uuid())
  experimentKey   String   @map("experiment_key")
  visitorId       String   @map("visitor_id")
  variant         String
  assignedAt      DateTime @default(now()) @map("assigned_at")
  convertedAt     DateTime? @map("converted_at")
  
  // Metrics for this assignment
  sessionCount    Int      @default(0) @map("session_count")
  totalDuration   Int      @default(0) @map("total_duration")
  interactionCount Int     @default(0) @map("interaction_count")
  leadGenerated   Boolean  @default(false) @map("lead_generated")

  @@unique([experimentKey, visitorId])
  @@index([experimentKey])
  @@index([visitorId])
  @@map("experiment_assignments")
}

// —── Personalization Event (new, high-level) —─────────
model PersonalizationEvent {
  id        String   @id @default(uuid())
  visitorId String   @map("visitor_id")
  eventType String   @map("event_type")
  // "intent_changed" | "variant_assigned" | "content_adapted" | "profile_updated"
  details   Json     @default("{}")
  createdAt DateTime @default(now()) @map("created_at")

  @@index([visitorId])
  @@index([eventType, createdAt(sort: Desc)])
  @@map("personalization_events")
}
```

### 5.2 Schema Migration Path

```
Phase 1: ──→ Add `visitor_profiles` table
              Add `experiment_assignments` table
              Add `personalization_events` table

Phase 2: ──→ Add `signal_vector` column to `AnalyticsSession` (denormalized)
              Add GIN index on `AnalyticsSession.referrer` for attribution analysis
              
Phase 3: ──→ Add RLS policies on all new tables (see Section 10)
              Add TTL-based cleanup job to `PersonalizationEvent` (retention: 90 days)
```

---

## 6. Core Services

### 6.1 Signal Collector (NestJS Module)

Located at `apps/api/src/modules/personalization/`, the Signal Collector is a NestJS module that:

- Listens to a `POST /api/portfolio/personalization/signal` endpoint called by the client SDK
- Validates incoming signal vectors against a Zod schema shared via `@portfolio/shared`
- Enqueues signal processing jobs to BullMQ (`personalization.signal-queue`)
- Batches high-frequency signals (mouse movement, scroll depth changes) at 500ms intervals client-side

The client SDK bundles signals and sends them via `navigator.sendBeacon()` on page unload for reliable capture of exit-time signals.

```typescript
// BullMQ job definition
interface SignalProcessJob {
  visitorId: string;
  sessionId: string;
  signalVector: SignalVector;
  timestamp: string;
}
```

### 6.2 Profile Builder (BullMQ Worker)

The Profile Builder is a BullMQ worker that:

1. Receives processed signals from the signal queue
2. Updates or creates the `VisitorProfile` record
3. Calls the FastAPI intent classifier to update intent classification
4. Computes aggregated metrics (total sessions, page views, etc.)
5. Triggers content reranking if intent has changed beyond a confidence threshold

### 6.3 Intent Classifier (FastAPI + LLM)

Located at `apps/ai/app/services/intent_service.py`, the Intent Classifier uses a multi-stage pipeline:

```
Stage 1 — Rule-Based Heuristics:
  Rule: lead_form_completions > 0 → "hiring" (confidence: 0.8)
  Rule: github_clicks > 2 + sandbox_session → "collaborating" (confidence: 0.7)
  Rule: blog_deep_reads > 2 + no project_clicks → "learning" (confidence: 0.6)

Stage 2 — LLM Classification (when heuristic confidence < 0.7):
  Prompt: Classify visitor intent based on signal vector.
  Returns: { intent: string, confidence: float, reasoning: string }

Stage 3 — Temporal Smoothing:
  Apply exponential moving average to intent over the session
  Prevent flapping between intents on short timescales
  α = 0.3 (smoothing factor), min confidence delta for switch: 0.15
```

### 6.4 Content Ranker (NestJS + pgvector)

The Content Ranker reranks portfolio content per visitor:

1. **Project reranking:** Uses `ContentEmbedding` similarity between the visitor's interest vector (derived from pages viewed, projects clicked, tech stack mentions) and project embeddings
2. **Section ordering:** Reorders sections by matching section type to inferred intent. For example, "hiring" visitors see the Services section before the Blog section
3. **Testimonial selection:** Surfaces testimonials where `company` or `role` matches the visitor's inferred industry or role

### 6.5 Scene Optimizer (Frontend Service)

The Scene Optimizer adjusts the Three.js hero scene based on GPU capability and personalization context:

```typescript
interface SceneConfig {
  quality: 'low' | 'medium' | 'high';
  particleCount: number;         // e.g., 500 / 2000 / 8000
  geometryComplexity: number;     // e.g., 8 / 16 / 32 segments
  shadowsEnabled: boolean;
  postProcessing: string[];       // e.g., [] / ['bloom'] / ['bloom', 'ssao']
  animationFPS: number;           // 30 / 60
  theatreTimeline: boolean;       // enable Theatre.js sequenced animations
}
```

The `detect-gpu` library is already in the dependency tree (`apps/web/package.json:41: "detect-gpu": "*"`). The optimizer queries GPU tier once per session and caches it:

```
GPU Tier Detection:
  High:   Desktop GPU (NVIDIA/AMD), Apple Silicon → Full scene
  Medium: Integrated GPU, M1 MacBook → Reduced particles, no SSAO
  Low:    Mobile GPU, Intel UHD → Static scene, no post-processing
```

### 6.6 Experiment Engine (A/B Testing Framework)

The Experiment Engine leverages the existing `FeatureFlag` model (`apps/api/prisma/schema.prisma:599-610`) and extends it with:

- **Multi-armed bandit assignments** via the FastAPI Bayesian engine
- **Sticky assignment** across sessions per visitor (stored in `ExperimentAssignment`)
- **Traffic allocation** via the existing `rollout_percentage` field
- **Conversion tracking** tied to lead generation, CTA clicks, and session duration

Experiment types:

| Type | Description | Example |
|------|-------------|---------|
| Section layout A/B | Compare two `style_preset` values | `"minimal"` vs `"expanded"` for the Projects section |
| Scene variant | Compare hero 3D scene configurations | High-detail vs low-detail for mobile visitors |
| CTA copy | Compare CTA text and placement | Primary CTA at top vs bottom of page |
| Content ordering | Compare content ranking strategies | Skill-based reranking vs chronological defaults |
| Theme personalization | Compare auto-theme vs user-selected theme | Auto-match intent vs manual theme selection |

---

## 7. Tech Stack

| Layer | Technology | Location | Purpose |
|-------|-----------|----------|---------|
| **Client SDK** | TypeScript + `navigator.sendBeacon()` | `apps/web/src/lib/personalization/` | Collect signals, apply overrides |
| **Signal API** | NestJS controller | `apps/api/src/modules/personalization/` | Receive and validate signals |
| **Profile DB** | Prisma + PostgreSQL | `visitor_profiles` table | Store computed profiles |
| **Queue** | BullMQ (existing) | `apps/api/src/common/queue/` | Async signal processing |
| **Intent Classifier** | FastAPI + LLM | `apps/ai/app/services/intent_service.py` | Infer intent from signals |
| **Content Search** | pgvector (existing) | `apps/api/prisma/schema.prisma:612` | Semantic content reranking |
| **Feature Flags** | `FeatureFlag` model (existing) | `apps/api/prisma/schema.prisma:599` | Experiment targeting |
| **Analytics Storage** | `AnalyticsEvent` (existing) | `apps/api/prisma/schema.prisma:335` | Raw signal persistence |
| **3D Detection** | `detect-gpu` (existing) | `apps/web/package.json:41` | GPU capability detection |
| **Animation** | GSAP + Framer Motion (existing) | `apps/web/package.json:42-43` | Adaptive animation complexity |
| **Theme Engine** | `data-theme` + `data-mode` | `apps/web/src/components/layout/` | Circadian theme adaptation |
| **Edge Distribution** | Vercel Edge Functions | Edge middleware | Low-latency profile reads |
| **Monitoring** | Sentry (existing) | `apps/api/src/main.ts:16` | Error tracking for personalization pipeline |

---

## 8. Client-Side SDK

The Personalization Client SDK is a lightweight TypeScript library bundled in `apps/web/src/lib/personalization/client-sdk.ts`.

### API

```typescript
class PersonalizationClient {
  constructor(options: {
    apiUrl: string;       // e.g., "/api/portfolio/personalization"
    visitorId: string;    // Cross-session visitor identifier
    sessionId: string;    // Current session identifier
    debug?: boolean;      // Enable console logging
  });

  // Report a signal to the engine (batched, throttled)
  reportSignal(signal: Partial<SignalVector>): void;

  // Get the current personalization profile
  getProfile(): Promise<VisitorProfile>;

  // Get content overrides for a specific section
  getSectionOverrides(sectionKey: string): Promise<SectionOverrides>;

  // Reset personalization for this session
  resetSession(): Promise<void>;

  // Opt out of personalization entirely
  optOut(): Promise<void>;

  // Check if personalization is active
  isActive(): boolean;
}
```

### Integration Points

The SDK integrates with existing frontend infrastructure:

1. **React Query** (`@tanstack/react-query`): Profile data is fetched and cached using existing query infrastructure
2. **Theme Provider** (`next-themes`): The SDK can suggest theme/mode changes based on profile
3. **Section rendering**: Sections wrap content in a `PersonalizedSection` component that applies overrides from the profile
4. **Three.js Scene**: The `ThreeScene` component reads GPU tier from the SDK and adjusts rendering

### Initial Script

To prevent layout shift from late personalization, a `<script>` tag in the `<head>` reads the encrypted visitor ID cookie and injects a `data-personalization` attribute on `<html>`:

```html
<script>
  // Inlined in layout.tsx <head>
  (function() {
    try {
      var cookie = document.cookie.match(/(?:^|;\s*)v_pid=([^;]*)/);
      var pid = cookie ? atob(cookie[1]) : crypto.randomUUID();
      if (!cookie) document.cookie = 'v_pid=' + btoa(pid) + ';max-age=31536000;path=/;SameSite=Lax';
      document.documentElement.dataset.visitorId = pid;
    } catch(e) { /* fail silently */ }
  })();
</script>
```

---

## 9. Performance Budget

| Metric | Target | Measurement |
|--------|--------|-------------|
| Client SDK bundle size | < 8 KB gzipped | Webpack bundle analyzer |
| Signal overhead per page | < 50 ms added to TTI | Lighthouse lab test |
| Signal batch frequency | 500ms (coalesced) | Chrome DevTools network |
| Intent classification latency | < 500 ms P95 | NestJS + FastAPI tracing |
| Profile read latency | < 10 ms P95 | Prisma query timings |
| BullMQ processing delay | < 2 seconds P95 | BullMQ dashboard |
| Content reranking latency | < 200 ms P95 | pgvector query timings |
| Edge middleware latency | < 5 ms | Vercel Edge analytics |
| Max concurrent experiments | 5 | FeatureFlag targeting rules |
| Database connection pool | +10 connections baseline | PG Bouncer config |
| Privacy data retention | 90 days (rolling window) | Cron cleanup job |

Current baseline (from `docs/15-performance/PERFORMANCE-BENCHMARKS.md`): API P95 response time is 180ms, database connection pool is 20 connections. The personalization pipeline adds an estimated 15% overhead, manageable with the existing pool.

---

## 10. Privacy & Security

### 10.1 Privacy-Preserving Design

The system follows a privacy-first architecture compliant with `docs/security/PRIVACY.md` and `docs/security/data-classification.md`:

| Principle | Implementation |
|-----------|---------------|
| **No PII in signals** | The signal vector explicitly excludes name, email, IP address, and any identifiable metadata |
| **Visitor ID is non-reversible** | `visitor_id` is a UUID, not derived from PII; no user lookup table exists |
| **Session-bound profiles** | Cross-session stitching is opt-in (requires cookie consent); profiles default to session-scoped |
| **Right to deletion** | `POST /api/portfolio/personalization/forget` deletes all profile data for a visitor ID |
| **Transparency** | The Theme Switcher panel includes a "Personalization: Active" indicator with details |
| **Opt-out** | `localStorage` key `personalization_opt_out: true` disables all personalization |
| **Data retention** | `visitor_profiles` TTL: 90 days; `personalization_events` TTL: 90 days; `experiment_assignments` TTL: 365 days |

### 10.2 Encryption

- Visitor ID cookie (`v_pid`) is base64-encoded UUID (not encryption, but non-PII)
- Profile data at rest: no PII is stored; signal vectors may contain referrer URLs (filtered for known patterns)
- In transit: all personalization endpoints use the existing HTTPS/TLS setup

### 10.3 Audit Trail

All personalization events are logged via the existing `AuditLog` model with:

```typescript
{
  tableName: 'visitor_profiles',
  recordId: visitorId,
  action: 'profile_updated' | 'intent_changed' | 'variant_assigned' | 'personalization_forgotten',
  actorId: null, // No auth for visitors
  ipAddress: null, // Not stored for privacy
  newValues: { /* changed fields only */ },
  correlationId: sessionId,
}
```

### 10.4 Anti-Abuse

- Rate limit: 100 signal writes per session per minute (via existing `ThrottlerGuard`)
- Bot detection: signals from known bot user agents or headless browsers (detected via anomaly detection in FastAPI) are discarded
- Session poisoning: if signal velocity exceeds 10 events/second, the session is flagged and excluded from personalization

---

## 11. Success Metrics

### 11.1 Primary KPIs

| Metric | Baseline (Current) | Target (6 months) | Measurement |
|--------|-------------------|-------------------|-------------|
| Avg session duration | 3:42 min | 5:10 min (+40%) | `AnalyticsSession.durationSeconds` |
| Pages per session | 3.75 | 5.25 (+40%) | `AnalyticsSession.pageViews` |
| Lead conversion rate | 2.1% | 2.6% (+25%) | Lead form completions / unique visitors |
| Blog read rate | 18% | 25% (+39%) | Blog page views / total page views |
| CTA click-through rate | 4.2% | 5.9% (+40%) | CTA clicks / impressions |
| Return visitor rate | 12% | 18% (+50%) | Visitors with >1 session in 30 days |

### 11.2 Secondary KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Personalization accuracy | Intent correctly classified >80% of sessions | Manual audit of 200 labeled sessions/month |
| A/B test confidence | 95% statistical significance within 2 weeks | Bayesian analysis (FastAPI) |
| False intent changes | <5% of sessions show >2 intent changes | Profile change frequency |
| Privacy compliance | Zero PII incidents | Quarterly audit |
| Opt-out rate | <5% of visitors | opt_out count / total visitors |
| Personalization overhead | <2% increase in API response times | Sentry tracing |

### 11.3 Business Impact Projections

| Scenario | Confidence | Revenue Impact |
|----------|-----------|---------------|
| Conservative (60% of targets) | 70% | +15% lead gen, +20% session duration |
| Expected (100% of targets) | 25% | +25% lead gen, +40% session duration |
| Optimistic (130% of targets) | 5% | +35% lead gen, +55% session duration |

---

## 12. Phased Rollout Plan

### Phase 0: Foundation (Weeks 1-4)

**Dependencies:** FeatureFlag model operational, BullMQ queue infrastructure stable, FastAPI service at baseline

| Task | Est. Effort | Owner | Deliverable |
|------|-------------|-------|-------------|
| Create `VisitorProfile`, `ExperimentAssignment`, `PersonalizationEvent` Prisma models | 2 days | Backend | Migration file |
| Build Signal Collector NestJS module + controller | 3 days | Backend | `POST /api/portfolio/personalization/signal` |
| Create BullMQ signal processing queue and worker | 2 days | Backend | Queue + worker |
| Build Personalization Client SDK | 4 days | Frontend | `client-sdk.ts` |
| Write signal batching and `sendBeacon` integration | 1 day | Frontend | SDK + integration tests |
| Add encrypted visitor ID cookie + `<head>` script | 1 day | Frontend | Cookie integration |
| Performance budget baseline measurement | 2 days | Infrastructure | Current metrics snapshot |

**Phase 0 Gate:** End-to-end signal flow working in staging (browser → SDK → API → BullMQ → DB). P95 latency < 500ms.

### Phase 1: Intent Classification (Weeks 5-8)

**Dependencies:** FastAPI service operational (currently a stub), pgvector embeddings seeded

| Task | Est. Effort | Owner | Deliverable |
|------|-------------|-------|-------------|
| Build heuristic intent classifier (rule-based) | 2 days | Backend | Intent service v1 |
| Build LLM intent classifier in FastAPI | 4 days | AI/ML | Intent service v2 |
| Build temporal smoothing logic | 1 day | Backend | Smoothing pipeline |
| Create intent → personalization lever mapping | 2 days | Product | Decision table |
| Build Profile Builder BullMQ worker | 2 days | Backend | Worker |
| Write integration tests for intent pipeline | 2 days | QA | Test suite |
| Deploy to staging with synthetic visitors | 1 day | DevOps | Staging test |

**Phase 1 Gate:** Intent classification accuracy >75% on test set of 100 labeled sessions. False positive rate <10%.

### Phase 2: Content Adaptation (Weeks 9-12)

**Dependencies:** Phase 1 complete, pgvector content embeddings populated

| Task | Est. Effort | Owner | Deliverable |
|------|-------------|-------|-------------|
| Build Content Ranker using pgvector similarity | 3 days | Backend | `GET /api/portfolio/personalization/overrides` |
| Build `PersonalizedSection` React component | 2 days | Frontend | Component |
| Integrate SDK with section rendering | 2 days | Frontend | Section adapter |
| Build Scene Optimizer with `detect-gpu` integration | 3 days | Frontend | Scene tier adjustment |
| Build Project spotlight reranking | 2 days | Backend | Reranking endpoint |
| Build Testimonial contextual selection | 1 day | Backend | Testimonial reranking |
| Write E2E tests for adaptation pipeline | 3 days | QA | Playwright test suite |
| A/B test: personalized vs default (internal team) | 1 week | Product | Experiment results |

**Phase 2 Gate:** Personalization applied in <200ms after page load. No regressions in Lighthouse scores.

### Phase 3: Experiment Engine (Weeks 13-15)

**Dependencies:** Phase 2 complete, FeatureFlag system stable

| Task | Est. Effort | Owner | Deliverable |
|------|-------------|-------|-------------|
| Extend FeatureFlag with experiment metadata | 2 days | Backend | Flag schema updates |
| Build multi-armed bandit engine in FastAPI | 4 days | AI/ML | Bayesian engine |
| Build Experiment Assignment service | 2 days | Backend | `ExperimentAssignment` CRUD |
| Build experiment admin UI | 3 days | Frontend | Admin panel |
| Build results dashboard (Bayesian charts) | 3 days | Frontend | Dashboard |
| Write experiment reporting pipeline | 2 days | Backend | Report generation |
| Security review of experiment assignment | 1 day | Security | Review sign-off |

**Phase 3 Gate:** Admin can create experiment, assign variants, view results with >90% statistical confidence within 2 weeks.

### Phase 4: Learning & Optimization (Weeks 16-20)

**Dependencies:** Phase 3 complete, sufficient traffic for statistical learning

| Task | Est. Effort | Owner | Deliverable |
|------|-------------|-------|-------------|
| Build cross-session profile stitching | 3 days | Backend | Stitching service |
| Implement bandit-based auto-optimization | 3 days | AI/ML | Auto-optimization |
| Build anomaly detection for bot filtering | 2 days | AI/ML | Bouncer service |
| Build privacy dashboard (opt-out mgmt, data deletion) | 3 days | Frontend | Privacy panel |
| Build personalization analytics dashboard | 3 days | Frontend | Analytics |
| Load test with 10x current traffic | 2 days | Infrastructure | Test report |
| Production rollout with 1% traffic ramp (5 stages) | 3 days | DevOps | Gradual rollout |
| Documentation finalization | 2 days | All | Updated docs |

**Phase 4 Gate:** Full production rollout. All targets met at 100% traffic. Zero PII incidents. Opt-out rate <5%.

---

## 13. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Intent misclassification degrades UX | Medium | High | Always serve fallback default; confidence threshold of 0.6; allow manual opt-out |
| Personalization increases API costs | Medium | Medium | Batch signals aggressively; cache profiles in Redis via existing cache module |
| Privacy compliance violation | Low | Critical | No PII in signal vector; 90-day TTL; automated cleanup jobs; quarterly audit |
| A/B test contamination from same-visitor sessions | Medium | Medium | Sticky experiment assignments; session stitching |
| GPU detection fails on unknown hardware | Low | Low | Default to "medium" tier; cache tier in localStorage |
| FastAPI LLM calls add latency | Medium | Medium | Heuristic classifier as fast path; LLM only for low-confidence cases |

---

## 14. Cross-References

### Internal Documents

| Document | Path | Relevance |
|----------|------|-----------|
| Innovation Backlog | `docs/25-roadmap/INNOVATION-BACKLOG.md` | IB-18 (A/B Testing), IB-20 (Personalized Dashboard), IB-21 (Neural Portfolio Engine) |
| Product Roadmap | `docs/25-roadmap/PRODUCT-ROADMAP.md` | P-09 (i18n), PL-02 (Public API) — dependencies for full personalization |
| Feature Flag Guide | `docs/backend/feature-flag-guide.md` | Experiment Engine builds on existing FeatureFlag system |
| Privacy Policy | `docs/security/PRIVACY.md` | All personalization must comply with documented privacy standards |
| Data Classification | `docs/security/data-classification.md` | Visitor profile data classification and handling requirements |
| Analytics Architecture | `docs/operations/AnalyticsArchitecture.md` | Existing analytics pipeline that personalization extends |
| Frontend Architecture | `docs/07-frontend/FRONTEND-ARCHITECTURE.md` | Client SDK integration points with existing component structure |
| 3D Architecture | `docs/07-frontend/3D-ARCHITECTURE.md` | Scene Optimizer builds on existing Three.js setup |
| Circadian Theme Engine | `docs/37-future/CIRCADIAN-THEME.md` | Theme personalization lever integrates with 4-theme system |
| RAG Design | `docs/ai/19-RAG.md` | ContentEmbedding + pgvector foundation for reranking |
| AI Strategy | `docs/ai/strategy.md` | Overall AI vision alignment |
| FastAPI ADR | `docs/adr/ADR-006-fastapi-ai.md` | AI microservice architecture and constraints |
| pgvector ADR | `docs/adr/ADR-007-pgvector.md` | Vector search architecture |
| BullMQ ADR | `docs/adr/ADR-017-bullmq-queue.md` | Background job queue for signal processing |
| Performance Benchmarks | `docs/15-performance/PERFORMANCE-BENCHMARKS.md` | Baseline metrics for success measurement |
| Scalability Strategy | `docs/15-performance/SCALABILITY-STRATEGY.md` | Infrastructure scaling for personalization load |
| SOC 2 Readiness | `docs/36-enterprise/SOC2-READINESS.md` | Personalization privacy controls align with SOC 2 requirements |
| API Contracts | `docs/api/APIContracts.md` | Personalization API follows existing response envelope pattern (`{ data, meta }`) |

### ADR References

| ADR | Title | Relevance |
|-----|-------|-----------|
| ADR-006 | FastAPI AI Service | Intent classification and Bayesian analysis run here |
| ADR-007 | pgvector Embeddings | Content reranking relies on vector similarity |
| ADR-014 | Zod Validation | Signal vectors validated via shared Zod schemas |
| ADR-016 | Sentry Error Tracking | Personalization errors captured in Sentry |
| ADR-017 | BullMQ Background Jobs | Async signal processing pipeline |
| ADR-009 | PostHog Analytics | Personalization experiment events tracked |

### External References

- **pgvector:** https://github.com/pgvector/pgvector — Content embedding similarity search
- **detect-gpu:** https://www.npmjs.com/package/detect-gpu — Client GPU capability detection
- **multi-armed bandit:** https://en.wikipedia.org/wiki/Multi-armed_bandit — A/B test optimization algorithm
- **Thompson sampling:** https://en.wikipedia.org/wiki/Thompson_sampling — Bandit variant selection

---

## 15. Decision Log

| ID | Decision | Rationale |
|----|----------|-----------|
| AP-D001 | No PII in signal vectors | Eliminates GDPR/CCPA risk at source; aligns with PRIVACY.md policy |
| AP-D002 | Heuristic + LLM hybrid intent classification | LLM-only is too slow and expensive for every signal; heuristic fast path handles 70%+ of cases |
| AP-D003 | BullMQ for async signal processing | Existing queue infrastructure; decouples signal ingestion from profile computation |
| AP-D004 | Session-scoped profiles by default | Privacy-first; cross-session stitching is opt-in with cookie consent |
| AP-D005 | Visitor ID stored as non-reversible UUID | Prevents any PII reconstruction; minimal tracking surface |
| AP-D006 | Edge middleware for low-latency profile reads | Avoids API round-trip for every page load; profile read in <5ms |
| AP-D007 | 90-day data retention window | Balances learning effectiveness with privacy; matches analytics data retention policy |
| AP-D008 | Exponential moving average for intent smoothing | Prevents rapid intent flips from noisy signals; easy to tune α parameter |

---

## 16. Open Questions

| Question | Status | Owner | Target Resolution |
|----------|--------|-------|-------------------|
| Should personalization data be included in analytics exports? | Pending | PM | Phase 1 |
| What is the GDPR consent mechanism for cross-session stitching? | TBD | Legal/Security | Phase 1 |
| How do we handle shared devices (multiple visitors, same browser)? | TBD | Engineering | Phase 2 |
| Should personalization be exposed via the public API for third-party consumers? | Pending | Product | Phase 4 |
| What is the cost ceiling for LLM-based intent classification at scale? | TBD | Infrastructure | Phase 1 |

---

## Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Jul 2026 | Initial design specification — AI Personalization Engine | Director of Engineering |

---

*End of Document — AI Personalization Engine v1.0*
