# Category 37 — Future / Vision Documents

> **Category:** 37-future
> **Purpose:** Aspirational design specs for forward-looking features, strategic platform evolutions, and long-term product vision. These documents describe what could be built next, grounded in the actual project architecture and tech stack.
> **Status:** All documents in this category are **Design Spec** — they describe proposed architectures not yet implemented. They serve as reference for roadmap prioritization and architectural planning.
> **Version:** 1.0 | **Last Updated:** July 2026
> **Category Owner:** CTO / Director of Engineering

---

## Document Inventory

| # | Document | Status | Pages | Key Dependencies | Cross-References |
|---|----------|--------|-------|------------------|-----------------|
| 1 | [AI-PERSONALIZATION-ENGINE.md](./AI-PERSONALIZATION-ENGINE.md) | Design Spec | ~380 lines | FastAPI AI service (`apps/ai`), pgvector, `AnalyticsEvent`/`FeatureFlag` models, `detect-gpu`, `@portfolio/shared` Zod schemas | IB-18, IB-20, IB-21 in INNOVATION-BACKLOG |
| 2 | [REALTIME-COLLABORATION.md](./REALTIME-COLLABORATION.md) | Design Spec | ~390 lines | `@tiptap/react`/`@tiptap/pm` (v3.27.1), NestJS WebSocket Gateway, BullMQ, Redis, JWT auth (`User` model) | IB-05 in INNOVATION-BACKLOG |
| 3 | [MOBILE-NATIVE-STRATEGY.md](./MOBILE-NATIVE-STRATEGY.md) | Design Spec | ~410 lines | `@portfolio/shared`, `@portfolio/ui`, `@tanstack/react-query`, `detect-gpu`, Three.js responsive scene | IB-20 in INNOVATION-BACKLOG |
| 4 | [MULTITENANCY-STRATEGY.md](./MULTITENANCY-STRATEGY.md) | Design Spec | ~420 lines | All Prisma content models, Supabase RLS, JWT auth (`UserRole`), Stripe billing, Vercel Edge Functions | IB-22 in INNOVATION-BACKLOG |
| 5 | [CIRCADIAN-THEME.md](./CIRCADIAN-THEME.md) | Design Spec | ~344 lines | `next-themes`, CSS custom properties, Framer Motion `layoutId`, Three.js hero scene compatibility | CT-D001–CT-D004 decision log |

---

## Cross-Reference Index

### Innovation Backlog (`docs/25-roadmap/INNOVATION-BACKLOG.md`)

| Initiative | Future Doc | Alignment |
|------------|-----------|-----------|
| IB-05 (Real-time Collaboration) | `REALTIME-COLLABORATION.md` | Full design spec coverage |
| IB-18 (AI A/B Testing) | `AI-PERSONALIZATION-ENGINE.md` — Section 6.6 (Experiment Engine) | Feature flag integration detailed |
| IB-20 (Personalized Dashboard) | `AI-PERSONALIZATION-ENGINE.md` — Section 4 (Visitor Intent) + `MOBILE-NATIVE-STRATEGY.md` | Cross-cutting personalization + mobile |
| IB-21 (Neural Portfolio Engine) | `AI-PERSONALIZATION-ENGINE.md` — Phase 4 (Learning & Optimization) | Long-term vision alignment |
| IB-22 (Portfolio-as-a-Platform) | `MULTITENANCY-STRATEGY.md` | Full design spec coverage |

### Product Roadmap (`docs/25-roadmap/PRODUCT-ROADMAP.md`)

| Roadmap Item | Future Doc | Notes |
|-------------|-----------|-------|
| A-02 (Blog CMS enhancement) | `REALTIME-COLLABORATION.md` | Collaboration extends blog editor |
| P-09 (i18n) | `MOBILE-NATIVE-STRATEGY.md` | Multi-language PWA support |
| PL-02 (Public API) | `MULTITENANCY-STRATEGY.md` — Section 8 (Admin Console) | API key management for tenants |

### Architectural Documents

| Doc | Future Doc Integration |
|-----|----------------------|
| `docs/operations/AnalyticsArchitecture.md` | `AI-PERSONALIZATION-ENGINE.md` extends analytics pipeline with intent classification |
| `docs/design/08o-IMMERSIVE-EXPERIENCE.md` | `AI-PERSONALIZATION-ENGINE.md` Scene Optimizer adapts 3D per visitor |
| `docs/adr/ADR-008-tiptap-editor.md` | `REALTIME-COLLABORATION.md` adds OT layer on ProseMirror |
| `docs/security/PRIVACY.md` | All four future docs comply with documented privacy standards |
| `docs/adr/ADR-006-fastapi-ai.md` | `AI-PERSONALIZATION-ENGINE.md` relies on FastAPI for intent classification |
| `docs/adr/ADR-017-bullmq-queue.md` | `AI-PERSONALIZATION-ENGINE.md` (signal processing) + `REALTIME-COLLABORATION.md` (operation persistence) |
| `docs/design/ResponsiveStrategy.md` | `MOBILE-NATIVE-STRATEGY.md` extends responsive design to PWA + native |
| `docs/security/15-AUTHORIZATION.md` | `MULTITENANCY-STRATEGY.md` extends auth model with tenant roles |
| `docs/database/DatabaseArchitecture.md` | `MULTITENANCY-STRATEGY.md` redefines DB isolation model |
| `docs/backend/feature-flag-guide.md` | `AI-PERSONALIZATION-ENGINE.md` A/B testing uses FeatureFlag model |

---

## Dependency Map

```mermaid
graph TD
    A[AI-PERSONALIZATION-ENGINE] --> B[apps/ai FastAPI]
    A --> C[AnalyticsEvent / AnalyticsSession]
    A --> D[FeatureFlag model]
    A --> E[pgvector / ContentEmbedding]
    A --> F[detect-gpu]
    A --> G[Circadian Theme Engine]
    
    H[REALTIME-COLLABORATION] --> I[@tiptap/react + @tiptap/pm]
    H --> J[NestJS WebSocket Gateway]
    H --> K[BullMQ Queue]
    H --> L[Redis Pub/Sub]
    H --> M[User model / JWT auth]
    
    N[MOBILE-NATIVE-STRATEGY] --> O[@portfolio/shared]
    N --> P[@portfolio/ui tokens]
    N --> Q[Three.js responsive scene]
    N --> R[Service Worker / PWA manifest]
    
    S[MULTITENANCY-STRATEGY] --> T[All Prisma models + tenant_id]
    S --> U[Supabase RLS policies]
    S --> V[JWT tenant claims]
    S --> W[Stripe billing webhooks]
    S --> X[Vercel Edge subdomain routing]
    
    Y[CIRCADIAN-THEME] --> Z[CSS custom properties]
    Y --> AA[next-themes]
    Y --> AB[Framer Motion layout animations]
```

---

## Quality Gates

All documents in this category are reviewed against:

| Standard | Requirement | Status |
|----------|-------------|--------|
| Completeness | Covers all required sections (Purpose, Architecture, Data Model, Security, Rollout Plan) | ✅ All docs |
| Accuracy | Grounded in actual project code, packages, and models | ✅ All docs |
| Cross-references | Links to existing docs in `docs/25-roadmap/`, `docs/adr/`, `docs/security/`, etc. | ✅ All docs |
| Code references | References actual file paths (`apps/web/package.json`, `apps/api/prisma/schema.prisma`, etc.) | ✅ All docs |
| Decision log | Records key architectural decisions with rationale | ✅ All docs |
| Success metrics | Quantifiable targets for measuring implementation success | ✅ AI-PERSONALIZATION, MOBILE, MULTITENANCY |
| Phased rollout | Incremental delivery plan with gates | ✅ AI-PERSONALIZATION, REALTIME-COLLAB, MOBILE, MULTITENANCY |
| Security review | Privacy and security considerations documented | ✅ All docs |

---

## How to Use These Documents

1. **Prioritization:** Use the Innovation Backlog scoring rubric (`docs/25-roadmap/INNOVATION-BACKLOG.md:166-181`) to evaluate each future doc against strategic goals
2. **RFCs:** Before implementation, convert the relevant future doc into an RFC using the template at `docs/28-templates/RFC-TEMPLATE.md`
3. **Roadmap alignment:** Map each future doc's phases to the quarterly product roadmap (`docs/25-roadmap/PRODUCT-ROADMAP.md`)
4. **Architecture review:** Each document should be reviewed by the architecture team before any implementation begins
5. **Cross-team handoff:** Documents reference specific teams (Backend, Frontend, AI/ML, Infrastructure) — use these assignments for sprint planning

---

## Maintenance

| Activity | Cadence | Owner |
|----------|---------|-------|
| Review innovation backlog alignment | Monthly | CTO |
| Update dependency versions | Quarterly | Engineering |
| Promote Design Spec → Active (when implemented) | On implementation | Document owner |
| Archive superseded design specs | On replacement | CTO |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Jul 2026 | Initial category index with 5 design spec documents: AI Personalization Engine, Real-Time Collaboration, Mobile Native Strategy, Multi-Tenancy Strategy, Circadian Theme Engine | CTO / Director of Engineering |

---

*End of Document — Category 37 Index v1.0*
