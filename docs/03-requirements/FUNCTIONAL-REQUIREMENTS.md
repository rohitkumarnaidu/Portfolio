# Functional Requirements Document

> **Document:** `FUNCTIONAL-REQUIREMENTS.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** Approved | **Owner:** Product Owner
> **Total Requirements:** 36 | **P0:** 14 | **P1:** 10 | **P2:** 8 | **P3:** 4

---

## 1. Overview

This document defines the complete functional requirements for the My Portfolio platform. Each requirement is assigned a unique FR-ID, priority (P0-P3), dependencies, related user stories, and current status. Requirements are organized into 8 feature groups covering the full product scope from public portfolio pages through system infrastructure.

The platform is a FAANG-level personal portfolio with 25+ customizable sections, admin CMS, lead capture, AI-powered features, and enterprise-grade observability. Implementation is approximately 20% complete Ã¢â‚¬â€ the monorepo structure, design tokens, and shared packages are scaffolded, but most application code and business logic remain to be built.

### Priority Definitions

| Priority | Label | Definition |
|----------|-------|------------|
| P0 | Critical | Must have for MVP Ã¢â‚¬â€ blocks launch |
| P1 | High | Important, launch + 30 days |
| P2 | Medium | Differentiator, launch + 60 days |
| P3 | Low | Future roadmap item |

### Status Definitions

| Status | Meaning |
|--------|---------|
| Completed | Fully implemented, tested, deployed |
| In Progress | Under active development |
| Planned | Spec'd but not started |
| Future | Roadmap, not yet scheduled |

---

## 2. Feature Group F-100: Portfolio Public Pages

**Domain:** Visitor-facing sections that form the core portfolio experience.
**Epic:** E1 (Visitor Experience)
**Implementation:** ~20% Ã¢â‚¬â€ placeholders exist, components need building

### FR-1001: Hero Section

| Field | Value |
|-------|-------|
| **Title** | Hero Section with 3D Background |
| **Description** | Display a visually compelling hero with name, title, CTAs, social links, and an interactive 3D/scene background. Must load within 2s LCP and respect reduced-motion preferences. |
| **Priority** | P0 |
| **Dependencies** | Navigation (FR-1003), Theme System (FR-1012) |
| **Related User Stories** | US-001 |
| **Status** | Planned |

### FR-1002: About Section

| Field | Value |
|-------|-------|
| **Title** | About Section with Bio & Stats |
| **Description** | Provide a split-layout professional bio with profile image, rich text biography, animated stat counters (years experience, projects, clients), and resume download. |
| **Priority** | P0 |
| **Dependencies** | Navigation (FR-1003) |
| **Related User Stories** | US-004 |
| **Status** | Planned |

### FR-1003: Skills & Expertise Section

| Field | Value |
|-------|-------|
| **Title** | Interactive Skills Matrix |
| **Description** | Display skills grouped by category (Frontend, Backend, DevOps) with visual proficiency bars/circles. Filterable by category, animated on scroll, responsive grid layout. |
| **Priority** | P1 |
| **Dependencies** | Navigation (FR-1003) |
| **Related User Stories** | US-002 |
| **Status** | Planned |

### FR-1004: Experience Timeline

| Field | Value |
|-------|-------|
| **Title** | Career Timeline |
| **Description** | Render a vertical timeline of work experience with alternating left/right layout, company logos, date ranges, role descriptions, and technology badges. Expandable for detailed achievements. |
| **Priority** | P1 |
| **Dependencies** | Navigation (FR-1003) |
| **Related User Stories** | US-005 |
| **Status** | Planned |

### FR-1005: Testimonials Carousel

| Field | Value |
|-------|-------|
| **Title** | Testimonial/Social Proof Carousel |
| **Description** | Display client/colleague testimonials in an auto-advancing carousel with avatar, name, role, star rating, and content. Pause on hover, support touch swipe, keyboard navigation. |
| **Priority** | P1 |
| **Dependencies** | Navigation (FR-1003) |
| **Related User Stories** | US-006 |
| **Status** | Planned |

### FR-1006: Contact Form with Lead Capture

| Field | Value |
|-------|-------|
| **Title** | Contact Form & Lead Submission |
| **Description** | Provide a validated contact form (name, email, message) with honeypot spam protection, rate limiting (10/15min), server-side Zod validation, auto-reply email, and success/error UI with confetti animation. |
| **Priority** | P0 |
| **Dependencies** | Lead Storage API (FR-5003) |
| **Related User Stories** | US-007, US-204 |
| **Status** | Planned |

### FR-1007: FAQ Accordion Section

| Field | Value |
|-------|-------|
| **Title** | FAQ Section |
| **Description** | Accordion-style expandable FAQ with rich text answers, aria-expanded/controls accessibility, keyboard navigation, smooth animations. Single-item-open behavior. |
| **Priority** | P1 |
| **Dependencies** | Navigation (FR-1003) |
| **Related User Stories** | US-008 |
| **Status** | Planned |

### FR-1008: Services Section

| Field | Value |
|-------|-------|
| **Title** | Services & Pricing Display |
| **Description** | Show service offerings as cards with icons, descriptions, pricing tiers, and CTAs linking to contact form or Calendly. Responsive grid with hover effects. |
| **Priority** | P1 |
| **Dependencies** | Navigation (FR-1003) |
| **Related User Stories** | US-009 |
| **Status** | Planned |

---

## 3. Feature Group F-200: Projects & Case Studies

**Domain:** Project showcase with filtering, detail pages, and in-depth case studies.
**Epic:** E1 (Visitor Experience)
**Implementation:** ~10% Ã¢â‚¬â€ data model defined, views not built

### FR-2001: Projects Grid with Filtering

| Field | Value |
|-------|-------|
| **Title** | Projects Grid |
| **Description** | Responsive card grid (1/2/3 cols) with thumbnail, title, description, tech badges. Multi-dimensional filtering by category, technology, year. URL-synced filters for bookmarkability. Pagination (12/page). Search by title. |
| **Priority** | P0 |
| **Dependencies** | Navigation (FR-1003), Animations (FR-1013) |
| **Related User Stories** | US-016 |
| **Status** | Planned |

### FR-2002: Project Detail Page

| Field | Value |
|-------|-------|
| **Title** | Project Detail Page |
| **Description** | Dynamic route `/projects/[slug]` with hero image/gallery, tech stack badges, live demo + GitHub links, rich content (features, challenges, outcomes), related projects, prev/next navigation, JSON-LD structured data, ISR. |
| **Priority** | P0 |
| **Dependencies** | Projects Grid (FR-2001) |
| **Related User Stories** | US-017 |
| **Status** | Planned |

### FR-2003: Featured Projects Carousel

| Field | Value |
|-------|-------|
| **Title** | Featured Projects Carousel |
| **Description** | Homepage carousel showcasing 3-5 featured projects with partial next/prev card peek, auto-advance (pause on hover), touch swipe, dot indicators, "View Project" CTA. |
| **Priority** | P2 |
| **Dependencies** | Projects Grid (FR-2001) |
| **Related User Stories** | US-018 |
| **Status** | Planned |

### FR-2004: Case Studies (Deep-Dive)

| Field | Value |
|-------|-------|
| **Title** | Structured Case Studies |
| **Description** | In-depth project case studies following Challenge Ã¢â€ â€™ Approach Ã¢â€ â€™ Solution Ã¢â€ â€™ Impact format with architecture diagrams, before/after metrics, code snippets, client testimonials, and print-friendly styles. |
| **Priority** | P2 |
| **Dependencies** | Project Detail (FR-2002) |
| **Related User Stories** | US-019 |
| **Status** | Future |

---

## 4. Feature Group F-300: Blog Engine

**Domain:** Content publishing with articles, RSS, and search.
**Epic:** E9 (Blog Engine)
**Implementation:** ~0% Ã¢â‚¬â€ data model defined, no code started

### FR-3001: Blog Listing Page

| Field | Value |
|-------|-------|
| **Title** | Blog Article Listing |
| **Description** | Card-based blog listing with cover image, title, excerpt, date, read time. Pagination, category/tag filtering, search by title, RSS link, JSON-LD structured data, ISR. |
| **Priority** | P3 |
| **Dependencies** | Blog Article (FR-3002) |
| **Related User Stories** | US-801 |
| **Status** | Future |

### FR-3002: Blog Article Page

| Field | Value |
|-------|-------|
| **Title** | Blog Article Detail |
| **Description** | Markdown-rendered article with syntax highlighting, table of contents (scroll tracking), reading progress bar, estimated read time, author bio, related articles, share buttons, JSON-LD Article schema. |
| **Priority** | P3 |
| **Dependencies** | Blog Listing (FR-3001) |
| **Related User Stories** | US-802 |
| **Status** | Future |

### FR-3003: RSS Feed

| Field | Value |
|-------|-------|
| **Title** | RSS Feed Generation |
| **Description** | Dynamic RSS 2.0 XML feed of all published blog posts with proper `<link>`, `<guid>`, `<pubDate>`. Auto-discovery via `<link>` in `<head>`. |
| **Priority** | P3 |
| **Dependencies** | Blog Listing (FR-3001) |
| **Related User Stories** | US-803 |
| **Status** | Future |

### FR-3004: Blog Search

| Field | Value |
|-------|-------|
| **Title** | Blog Content Search |
| **Description** | Full-text search across blog posts by title and content. Debounced input, results displayed inline. Index via PostgreSQL full-text search or external search service. |
| **Priority** | P3 |
| **Dependencies** | Blog Listing (FR-3001) |
| **Related User Stories** | US-801 |
| **Status** | Future |

---

## 5. Feature Group F-400: AI Assistant

**Domain:** AI-powered visitor assistance, content analysis, and suggestions.
**Epic:** E6 (AI & Intelligence)
**Implementation:** ~5% Ã¢â‚¬â€ FastAPI scaffolded, no endpoints implemented

### FR-4001: AI Chatbot

| Field | Value |
|-------|-------|
| **Title** | AI Chat Assistant |
| **Description** | Floating chat widget on all pages with message history, suggested questions, typing indicator, context-aware responses (page-aware), RAG-grounded answers with source citations. Rate limit: 20 msg/session. Response time < 3s. |
| **Priority** | P2 |
| **Dependencies** | RAG Pipeline (FR-4002), AI Service (FR-4003) |
| **Related User Stories** | US-501 |
| **Status** | Planned |

### FR-4002: RAG Pipeline

| Field | Value |
|-------|-------|
| **Title** | Retrieval-Augmented Generation Pipeline |
| **Description** | Index portfolio content: chunking (500 chars, 50 overlap), embedding via text-embedding-3-small (1536d), pgvector IVFFlat index, top-K retrieval (k=3, threshold 0.7). Batch + incremental indexing, embedding cache. |
| **Priority** | P2 |
| **Dependencies** | AI Service (FR-4003), pgvector (Supabase) |
| **Related User Stories** | US-502 |
| **Status** | Planned |

### FR-4003: AI Service Infrastructure

| Field | Value |
|-------|-------|
| **Title** | AI Microservice (FastAPI) |
| **Description** | FastAPI service with LangChain orchestration, multi-LLM support (GPT-4 primary, Claude fallback), response caching, rate limiting (20 req/min), Prometheus metrics, cost tracking, health endpoint. |
| **Priority** | P2 |
| **Dependencies** | Phase 01 (Infrastructure) |
| **Related User Stories** | US-503 |
| **Status** | Planned |

### FR-4004: Content Analysis

| Field | Value |
|-------|-------|
| **Title** | AI Content Analysis |
| **Description** | `POST /api/ai/analyze` returning Flesch-Kincaid readability, SEO score (0-100), tone analysis, keyword extraction, improvement suggestions, and word/sentence counts. Analysis in < 5s. |
| **Priority** | P2 |
| **Dependencies** | AI Service (FR-4003) |
| **Related User Stories** | US-504 |
| **Status** | Planned |

### FR-4005: AI Content Suggestions

| Field | Value |
|-------|-------|
| **Title** | AI Writing Suggestions |
| **Description** | "Suggest with AI" button in section editor generating 3 variants of content. Context-aware (section type + existing content). One-click insert. Accept/reject tracking. Fallback cached suggestions. |
| **Priority** | P2 |
| **Dependencies** | RAG Pipeline (FR-4002), AI Service (FR-4003) |
| **Related User Stories** | US-506 |
| **Status** | Planned |

---

## 6. Feature Group F-500: Admin Dashboard

**Domain:** Content management, CRUD operations, media management, lead management.
**Epics:** E2 (Admin Content Management), E3 (Lead Management)
**Implementation:** ~5% Ã¢â‚¬â€ admin layout not started, NestJS modules scaffolded

### FR-5001: Admin Dashboard Overview

| Field | Value |
|-------|-------|
| **Title** | Admin Dashboard Home |
| **Description** | Protected dashboard with stat cards (visitors today, active sections, new leads), visitor chart (7d), recent leads table, top pages list, quick action cards. Per-widget loading/error states. Responsive sidebar layout. |
| **Priority** | P0 |
| **Dependencies** | Auth (FR-6001) |
| **Related User Stories** | US-101 |
| **Status** | Planned |

### FR-5002: Section Manager (CRUD)

| Field | Value |
|-------|-------|
| **Title** | Portfolio Section CRUD |
| **Description** | Full CRUD for portfolio sections: list with visibility toggles, drag-and-drop reorder, create from template, edit with rich text editor, delete with confirmation, style preset selector (8 presets), preview mode, auto-save drafts (30s). |
| **Priority** | P0 |
| **Dependencies** | Auth (FR-6001), Rich Text Editor (FR-5004) |
| **Related User Stories** | US-102, US-105 |
| **Status** | Planned |

### FR-5003: Lead Inbox & Management

| Field | Value |
|-------|-------|
| **Title** | Lead Management System |
| **Description** | Centralized inbox with table view (name, email, date, status), pagination (50/page), read/unread indicators, filtering (date, status, source), search, bulk actions (mark read, archive, delete), CSV export, Telegram notifications. |
| **Priority** | P0 |
| **Dependencies** | Auth (FR-6001) |
| **Related User Stories** | US-201, US-202, US-203, US-205 |
| **Status** | Planned |

### FR-5004: Rich Text Editor

| Field | Value |
|-------|-------|
| **Title** | WYSIWYG Rich Text Editor |
| **Description** | TipTap-based editor with formatting toolbar (B/I/U, headings, lists, links, blockquote, code blocks), image embed, keyboard shortcuts, clean HTML output, markdown paste support, auto-save, character count. |
| **Priority** | P0 |
| **Dependencies** | Section Manager (FR-5002), Image Upload (FR-5005) |
| **Related User Stories** | US-103 |
| **Status** | Planned |

### FR-5005: Image Upload & Media Manager

| Field | Value |
|-------|-------|
| **Title** | Image Upload & Library |
| **Description** | Drag-and-drop upload with progress bar, auto WebP conversion, image library grid view, preview lightbox, copy URL, alt text field, delete with confirmation. Supported: PNG/JPG/WebP/GIF, max 5MB. Supabase Storage backend. |
| **Priority** | P0 |
| **Dependencies** | Supabase Storage, Auth (FR-6001) |
| **Related User Stories** | US-104 |
| **Status** | Planned |

---

## 7. Feature Group F-600: User Management & Auth

**Domain:** Authentication, authorization, role management.
**Epic:** E4 (Admin Authentication)
**Implementation:** ~5% Ã¢â‚¬â€ Passport.js strategy scaffolded, no login UI

### FR-6001: Admin Authentication (NestJS Passport)

| Field | Value |
|-------|-------|
| **Title** | Admin Login & Session Management |
| **Description** | Email/password + OAuth (Google, GitHub) login via NestJS Passport. Login page at `/admin/login`, "Remember me" (30d vs 24h), rate limiting (5/15min), account lockout, password reset flow (email link, 15min expiry), session persistence across tabs. |
| **Priority** | P0 |
| **Dependencies** | Supabase Auth |
| **Related User Stories** | US-301 |
| **Status** | Planned |

### FR-6002: JWT API Authentication (NestJS)

| Field | Value |
|-------|-------|
| **Title** | JWT-based API Security |
| **Description** | Passport JWT strategy with 15-min access tokens, 7-day refresh tokens with rotation, `@UseGuards(JwtAuthGuard)` on all admin endpoints, role-based guards (`@Roles('admin','editor','viewer')`), token blacklist, Swagger auth docs. |
| **Priority** | P0 |
| **Dependencies** | Admin Auth (FR-6001) |
| **Related User Stories** | US-302 |
| **Status** | Planned |

### FR-6003: Admin Registration & Role Management

| Field | Value |
|-------|-------|
| **Title** | First-Time Registration & Roles |
| **Description** | One-time admin registration at `/admin/register` with password strength indicator, email verification (optional). Role-based access control with three roles: admin (full access), editor (content only), viewer (read-only). |
| **Priority** | P0 |
| **Dependencies** | Admin Auth (FR-6001) |
| **Related User Stories** | US-303 |
| **Status** | Planned |

---

## 8. Feature Group F-700: Analytics & Monitoring

**Domain:** Visitor analytics, error tracking, performance monitoring.
**Epics:** E5 (Analytics & Insights), E10 (Monitoring & Observability)
**Implementation:** ~0% Ã¢â‚¬â€ PostHog/Sentry not integrated

### FR-7001: Visitor Event Tracking (PostHog)

| Field | Value |
|-------|-------|
| **Title** | Comprehensive Event Tracking |
| **Description** | PostHog SDK on all pages: auto-capture (page views, clicks, page leaves) + custom events (section views via IntersectionObserver, CTA clicks, form interactions). Anonymous UUID identification, IP anonymization, GDPR-compliant cookie consent banner, 90% sampling. |
| **Priority** | P0 |
| **Dependencies** | PostHog SDK |
| **Related User Stories** | US-402 |
| **Status** | Planned |

### FR-7002: Analytics Dashboard

| Field | Value |
|-------|-------|
| **Title** | Admin Analytics Dashboard |
| **Description** | Real-time visitor count, page views chart (7/30/90d), traffic sources pie chart, geo-map, device breakdown, top pages, conversion funnel (visit Ã¢â€ â€™ section Ã¢â€ â€™ contact Ã¢â€ â€™ lead), section popularity ranking, date range selector, PDF export. |
| **Priority** | P1 |
| **Dependencies** | Event Tracking (FR-7001), Auth (FR-6001) |
| **Related User Stories** | US-401 |
| **Status** | Planned |

### FR-7003: Error Tracking (Sentry) & Performance Monitoring

| Field | Value |
|-------|-------|
| **Title** | Error & Performance Monitoring |
| **Description** | Sentry integration across all three services (web, API, AI) with source maps, release tracking, and alerting. Core Web Vitals tracking (LCP, FID, CLS) via Vercel Analytics. Lighthouse CI on every PR with performance budgets. Uptime monitoring for all service endpoints. |
| **Priority** | P1 |
| **Dependencies** | Phase 01 (Infrastructure) |
| **Related User Stories** | US-901, US-902, US-903 |
| **Status** | Planned |

---

## 9. Feature Group F-800: System

**Domain:** Cross-cutting infrastructure Ã¢â‚¬â€ feature flags, caching, queue, health.
**Implementation:** ~30% Ã¢â‚¬â€ architecture decisions documented, BullMQ, Redis stubs exist

### FR-8001: Feature Flag System

| Field | Value |
|-------|-------|
| **Title** | Feature Flag Registry |
| **Description** | Centralized feature flag system with 44+ flags for phased rollout. Each feature gated by a flag name. Flags configurable via PostHog (remote) or local config file. On/off states tested for all gated features. |
| **Priority** | P1 |
| **Dependencies** | Phase 01 (Infrastructure) |
| **Related User Stories** | Ã¢â‚¬â€ |
| **Status** | Planned |

### FR-8002: Caching Layer

| Field | Value |
|-------|-------|
| **Title** | Response & Data Caching |
| **Description** | Multi-level caching: ISR (60s revalidation) for public pages, NestJS `@CacheTTL` on portfolio endpoints, in-memory cache for AI responses (5min TTL), Redis/BullMQ for job queues. Cache invalidation on content updates. |
| **Priority** | P1 |
| **Dependencies** | Redis (optional), Vercel ISR |
| **Related User Stories** | US-701 |
| **Status** | Planned |

### FR-8003: Queue & Background Jobs (BullMQ)

| Field | Value |
|-------|-------|
| **Title** | Background Job Queue |
| **Description** | BullMQ (Redis-backed) for async tasks: auto-reply email sending, Telegram notifications, embeddings generation, CSV export generation, data cleanup (conversation TTL). Job retry with exponential backoff, failure alerts, admin job monitoring dashboard. |
| **Priority** | P2 |
| **Dependencies** | Redis |
| **Related User Stories** | US-204, US-205 |
| **Status** | Planned |

### FR-8004: Health Checks & Observability

| Field | Value |
|-------|-------|
| **Title** | Service Health & Readiness |
| **Description** | Health endpoints (`/api/health`, `/api/ai/health`) returning service status, DB connectivity, queue health, and last error timestamps. Prometheus metrics for all services. Structured logging with correlation IDs (Pino for NestJS, structlog for FastAPI). |
| **Priority** | P2 |
| **Dependencies** | Phase 01 (Infrastructure) |
| **Related User Stories** | Ã¢â‚¬â€ |
| **Status** | Planned |

---

## 10. Requirement Summary

| Feature Group | Domain | Total Reqs | P0 | P1 | P2 | P3 | Status |
|---------------|--------|------------|----|----|----|----|--------|
| F-100 | Portfolio Public Pages | 8 | 3 | 5 | 0 | 0 | Planned |
| F-200 | Projects & Case Studies | 4 | 2 | 0 | 1 | 1 | Planned/Future |
| F-300 | Blog Engine | 4 | 0 | 0 | 0 | 4 | Future |
| F-400 | AI Assistant | 5 | 0 | 0 | 5 | 0 | Planned |
| F-500 | Admin Dashboard | 5 | 4 | 0 | 0 | 0 | Planned |
| F-600 | User Management & Auth | 3 | 3 | 0 | 0 | 0 | Planned |
| F-700 | Analytics & Monitoring | 3 | 1 | 2 | 0 | 0 | Planned |
| F-800 | System | 4 | 0 | 2 | 2 | 0 | Planned |
| **Total** | Ã¢â‚¬â€ | **36** | **14** | **10** | **8** | **4** | Ã¢â‚¬â€ |

---

*Document Version: 1.0 Ã¢â‚¬â€ Functional Requirements*
*Next Review: August 2026*

## Cross-References
- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system