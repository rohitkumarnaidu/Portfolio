# Requirements Traceability Matrix

> **Document:** `REQUIREMENTS-TRACEABILITY-MATRIX.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** Active | **Owner:** Product Owner
> **Scope:** Forward-backward traceability across Business Goals, Features, User Stories, Test Cases, and Implementation

---

## 1. Purpose

This matrix provides end-to-end traceability from business goals through to implementation status. It ensures every feature can be traced back to a business goal and forward to user stories, test cases, and code. Use this document for impact analysis, gap identification, audit compliance, and release planning.

---

## 2. Business Goal to Feature Traceability

| Goal ID | Business Goal | Metric | Feature IDs | Epic | Priority |
|---------|---------------|--------|-------------|------|----------|
| BG-01 | Lead generation +300% | Conversion rate from 1% to 4% | F-007, F-800, F-801, F-802, F-803, F-804 | E3: Lead Management | P0 |
| BG-02 | Establish brand authority | Top-3 SERP for name + keywords | F-001, F-004, F-200, F-201, F-202, F-105 | E1: Visitor Experience, E9: Blog Engine | P1 |
| BG-03 | Operational efficiency -50% | Content update time from 2h to 15min | F-400, F-401, F-600, F-601, F-602, F-603 | E2: Admin Content Management | P0 |
| BG-04 | Technical showcase | Lighthouse 95+, sub-2s global load | F-014, F-015, F-013, F-1000, F-1001, F-1002 | E8: Performance & Reliability | P1 |
| BG-05 | AI innovation showcase | 40%+ engagement via AI chat | F-300, F-301, F-302, F-303, F-304, F-305 | E6: AI & Intelligence | P2 |
| BG-06 | Secure admin access | Zero security incidents | F-700, F-701, F-702 | E4: Admin Authentication | P0 |
| BG-07 | Data-driven optimization | Analytics usage > 80% of admin sessions | F-900, F-901 | E5: Analytics & Insights | P1 |

---

## 3. Feature to User Story Traceability

| Feature ID | Feature Name | User Stories | Epic | Status |
|------------|--------------|--------------|------|--------|
| F-001 | Hero Section | US-001 | E1: Visitor Experience | Planned |
| F-002 | Skills Section | US-002 | E1: Visitor Experience | Planned |
| F-003 | Navigation System | US-003 | E1: Visitor Experience | Planned |
| F-004 | About Section | US-004 | E1: Visitor Experience | Planned |
| F-005 | Experience Timeline | US-005 | E1: Visitor Experience | Planned |
| F-006 | Testimonials Carousel | US-006 | E1: Visitor Experience | Planned |
| F-007 | Contact Form | US-007, US-204 | E1: Visitor Experience, E3: Lead Management | Planned |
| F-008 | FAQ Section | US-008 | E1: Visitor Experience | Planned |
| F-009 | Services Section | US-009 | E1: Visitor Experience | Planned |
| F-010 | Portfolio Statistics | US-010 | E1: Visitor Experience | Planned |
| F-011 | Client Logos | US-011 | E1: Visitor Experience | Planned |
| F-012 | Dark/Light Theme | US-012 | E1: Visitor Experience | Planned |
| F-013 | Section Animations | US-013 | E1: Visitor Experience | Planned |
| F-014 | Loading Skeletons | US-014 | E1: Visitor Experience | Planned |
| F-015 | Error Boundaries | US-015 | E1: Visitor Experience | Planned |
| F-100 | Projects Grid | US-016 | E1: Visitor Experience | Planned |
| F-101 | Project Detail | US-017 | E1: Visitor Experience | Planned |
| F-102 | Featured Carousel | US-018 | E1: Visitor Experience | Planned |
| F-105 | Case Studies | US-019 | E1: Visitor Experience | Future |
| F-106 | Project Filters | US-020 | E1: Visitor Experience | Planned |
| F-200 | Blog Listing | US-801 | E9: Blog Engine | Future |
| F-201 | Blog Article | US-802 | E9: Blog Engine | Future |
| F-202 | RSS Feed | US-803 | E9: Blog Engine | Future |
| F-300 | AI Chatbot | US-501 | E6: AI & Intelligence | Planned |
| F-301 | RAG Pipeline | US-502 | E6: AI & Intelligence | Planned |
| F-302 | AI Infrastructure | US-503 | E6: AI & Intelligence | Planned |
| F-303 | Content Analysis | US-504 | E6: AI & Intelligence | Planned |
| F-304 | Conversation History | US-505 | E6: AI & Intelligence | Planned |
| F-305 | Content Suggestions | US-506 | E6: AI & Intelligence | Planned |
| F-400 | Admin Dashboard | US-101 | E2: Admin Content Management | Planned |
| F-401 | Admin Sidebar | US-101 | E2: Admin Content Management | Planned |
| F-600 | Section Manager | US-102 | E2: Admin Content Management | Planned |
| F-601 | Rich Text Editor | US-103 | E2: Admin Content Management | Planned |
| F-602 | Image Upload | US-104 | E2: Admin Content Management | Planned |
| F-603 | Style Presets | US-105 | E2: Admin Content Management | Planned |
| F-700 | Admin Auth | US-301 | E4: Admin Authentication | Planned |
| F-701 | JWT API Auth | US-302 | E4: Admin Authentication | Planned |
| F-702 | Admin Registration | US-303 | E4: Admin Authentication | Planned |
| F-800 | Lead Inbox | US-201 | E3: Lead Management | Planned |
| F-801 | Lead Detail | US-202 | E3: Lead Management | Planned |
| F-802 | CSV Export | US-203 | E3: Lead Management | Planned |
| F-803 | Auto-Reply Email | US-204 | E3: Lead Management | Planned |
| F-804 | Telegram Notification | US-205 | E3: Lead Management | Planned |
| F-900 | Analytics Dashboard | US-401 | E5: Analytics & Insights | Planned |
| F-901 | Event Tracking | US-402 | E5: Analytics & Insights | Planned |
| F-1000 | Error Tracking (Sentry) | US-901 | E10: Monitoring & Observability | Planned |
| F-1001 | Uptime Monitoring | US-902 | E10: Monitoring & Observability | Planned |
| F-1002 | Performance Monitoring | US-903 | E10: Monitoring & Observability | Planned |
| F-1100 | Multi-Language i18n | US-1001 | E11: Future Features | Future |
| F-1101 | A/B Testing | US-1002 | E11: Future Features | Future |
| F-1102 | Blog Comments | US-1003 | E11: Future Features | Future |
| F-1103 | Newsletter Signup | US-1004 | E11: Future Features | Future |
| F-1104 | PDF Resume | US-1005 | E11: Future Features | Future |
| F-1105 | Calendar Booking | US-1006 | E11: Future Features | Future |
| F-1106 | Interactive 3D | US-1007 | E11: Future Features | Future |
| F-1108 | PWA Support | US-1008 | E11: Future Features | Future |

---

## 4. Feature to NFR Traceability

| NFR ID | NFR Name | Related Features | Test Requirement | Acceptance Criteria |
|--------|----------|------------------|------------------|---------------------|
| NFR-01 | Lighthouse Performance ≥ 95 | F-001, F-100, F-200, F-014 | Lighthouse CI in PR pipeline | All categories ≥ 95 |
| NFR-02 | WCAG 2.2 AA Compliance | All public features | axe DevTools (0 violations) | Keyboard nav, screen reader, contrast 4.5:1 |
| NFR-03 | LCP < 2.5s | F-001 (Hero), F-100 (Grid) | Vercel Analytics tracking | Hero loads within 2s |
| NFR-04 | CLS < 0.1 | All layout features | Lighthouse CI | No layout shift |
| NFR-05 | Global sub-2s load | F-003, F-100, F-200 | Synthetic monitoring from 5 regions | Cold cache < 3s, warm < 1s |
| NFR-06 | OWASP Top 10:2025 | F-700, F-701, F-007 | OWASP ZAP scan | Zero critical/high findings |
| NFR-07 | 99.9% Uptime | F-1000, F-1001 | Uptime monitoring | < 8.76h downtime/year |
| NFR-08 | JWT 15-min expiry | F-701 | Automated token expiry tests | 401 on expired token |
| NFR-09 | API response < 200ms p95 | F-600, F-800, F-900 | Prometheus metrics | p95 < 200ms |
| NFR-10 | AI response < 3s | F-300 | FastAPI metrics | p95 response time |
| NFR-11 | GDPR Compliance | F-901, F-304 | Cookie consent banner | Opt-out available, IP anonymized |
| NFR-12 | Rate Limiting (auth: 5/15min) | F-700, F-007 | k6 load test | 429 after threshold |
| NFR-13 | ISR revalidation ≤ 60s | F-100, F-101, F-200 | Cache header verification | `stale-while-revalidate` |
| NFR-14 | Bundle size < 200KB JS | All web features | Bundle analyzer CI check | No regression > 5% |
| NFR-15 | 320px min viewport | All public features | Responsive design QA | No overflow at 320px |

---

## 5. Feature to Implementation Traceability

| Feature ID | Feature Name | Frontend Files | API Module | Database Tables | Config/Flags | Build Phase |
|------------|--------------|----------------|------------|-----------------|--------------|-------------|
| F-001 | Hero Section | `sections/Hero.tsx`, `page.tsx` | `modules/sections` | `sections` (slug=hero) | `hero-section` flag | Phase 03 |
| F-002 | Skills Section | `sections/Skills.tsx` | `modules/skills` | `skills` | `skills-section` flag | Phase 04 |
| F-003 | Navigation | `Navigation.tsx`, `MobileMenu.tsx` | — | `sections` (display_order) | `sticky-nav` flag | Phase 02 |
| F-004 | About Section | `sections/About.tsx` | `modules/sections` | `sections` (slug=about) | `about-section` flag | Phase 04 |
| F-005 | Experience Timeline | `sections/Experience.tsx` | `modules/experience` | `experience` | `experience-section` flag | Phase 04 |
| F-006 | Testimonials | `sections/Testimonials.tsx` | `modules/sections` | `testimonials` | `testimonials-section` flag | Phase 06 |
| F-007 | Contact Form | `sections/Contact.tsx` | `modules/leads` | `leads` | `contact-form` flag | Phase 04 |
| F-100 | Projects Grid | `sections/Projects.tsx`, `projects/page.tsx` | `modules/projects` | `projects` | `projects-section` flag | Phase 05 |
| F-101 | Project Detail | `projects/[slug]/page.tsx` | `modules/projects` | `projects` (extended) | `project-detail` flag | Phase 05 |
| F-200 | Blog Listing | `blog/page.tsx` | `modules/blog` | `blog_posts` | `blog` flag | TBD |
| F-201 | Blog Article | `blog/[slug]/page.tsx` | `modules/blog` | `blog_posts` | `blog` flag | TBD |
| F-300 | AI Chatbot | `Chatbot.tsx`, `ChatMessage.tsx` | `ai/app/routes/chat.py` | `chat_conversations` | `ai-chatbot` flag | Phase 07 |
| F-301 | RAG Pipeline | — | `ai/app/services/rag_service.py` | `documents` (pgvector) | `rag-pipeline` flag | Phase 07 |
| F-400 | Admin Dashboard | `admin/page.tsx`, `admin/layout.tsx` | `modules/analytics` | Aggregated tables | `admin-dashboard` flag | Phase 08 |
| F-600 | Section Manager | `admin/sections/page.tsx` | `modules/sections` | `sections` | `section-manager` flag | Phase 08 |
| F-601 | Rich Text Editor | `admin/RichTextEditor.tsx` | — | — | `rich-text-editor` flag | Phase 08 |
| F-602 | Image Upload | `admin/ImageUploader.tsx` | `modules/upload` | `images` | `image-upload` flag | Phase 08 |
| F-700 | Admin Auth | `admin/login/page.tsx` | `modules/auth` | Users (Supabase Auth) | `admin-auth` flag | Phase 08 |
| F-701 | JWT API Auth | — | `modules/auth/jwt` | — | — | Phase 08 |
| F-800 | Lead Inbox | `admin/leads/page.tsx` | `modules/leads` | `leads` | `lead-management` flag | Phase 08 |
| F-900 | Analytics Dashboard | `admin/analytics/page.tsx` | — | PostHog API | `analytics-dashboard` flag | Phase 09 |
| F-901 | Event Tracking | `lib/analytics.ts`, `AnalyticsProvider.tsx` | — | PostHog | `event-tracking` flag | Phase 02 |
| F-1000 | Sentry | `lib/sentry.ts` | Common filters | Sentry | `sentry` flag | Phase 09 |

---

## 6. Coverage Summary

| Domain | Total Requirements | Planned | In Progress | Completed | Future | Coverage % |
|--------|-------------------|---------|-------------|-----------|--------|------------|
| Portfolio Public Pages | 15 | 14 | 0 | 0 | 1 | 0% |
| Projects & Case Studies | 4 | 3 | 0 | 0 | 1 | 0% |
| Blog Engine | 3 | 0 | 0 | 0 | 3 | 0% |
| AI Assistant | 6 | 6 | 0 | 0 | 0 | 0% |
| Admin Dashboard | 7 | 7 | 0 | 0 | 0 | 0% |
| User Management & Auth | 3 | 3 | 0 | 0 | 0 | 0% |
| Analytics & Monitoring | 3 | 3 | 0 | 0 | 0 | 0% |
| System Infrastructure | 4 | 4 | 0 | 0 | 0 | 0% |
| Developer Experience | 4 | 0 | 4 | 0 | 0 | 100% |
| Performance & Reliability | 3 | 0 | 0 | 0 | 3 | 0% |
| Future Features | 8 | 0 | 0 | 0 | 8 | 0% |
| **Total** | **60** | **40** | **4** | **0** | **16** | **~7%** |

### Implementation Status Breakdown

| Status | Count | Percentage |
|--------|-------|------------|
| Completed | 0 | 0% |
| In Progress | 4 | 7% |
| Planned | 40 | 67% |
| Future | 16 | 27% |

**Currently In Progress (Sprint 4):** F-300 (AI Chatbot), F-301 (RAG Pipeline), F-001 (Hero 3D), F-600 (Section Manager)

---

## 7. Gap Analysis

| Gap ID | Description | Impact | Affected Features | Resolution |
|--------|-------------|--------|-------------------|------------|
| G-01 | No React components implemented | Portfolio renders nothing | F-001 through F-015 | Build all section components (Phase 03-04) |
| G-02 | No NestJS API logic | No data persistence | F-100, F-600, F-800 | Implement controllers/services (Phase 03-08) |
| G-03 | No Supabase connection | Database unavailable | All data features | Configure Supabase client (Phase 01) |
| G-04 | No admin dashboard pages | No CMS capability | F-400, F-600, F-601 | Build admin routes (Phase 08) |
| G-05 | No auth working | No admin login | F-700, F-701, F-702 | Implement NestJS Passport + JWT (Phase 08) |
| G-06 | No AI endpoints | No chatbot/analysis | F-300, F-301, F-303 | Implement FastAPI routes (Phase 07) |
| G-07 | No PostHog or Sentry | No analytics/monitoring | F-900, F-901, F-1000 | Configure SDKs (Phase 09) |

---

## 8. Requirements Verification Matrix

| Requirement Type | Verified By | Tool/Method | Frequency |
|-----------------|-------------|-------------|-----------|
| Functional (AC) | QA Engineer | Manual + automated E2E | Per sprint |
| Performance | CI Pipeline | Lighthouse CI, k6 | Per PR |
| Accessibility | CI + QA | axe DevTools, keyboard nav | Per PR |
| Security | Security Review | OWASP ZAP, manual review | Quarterly |
| NFR (Uptime) | Monitoring | Better Uptime | Continuous |
| NFR (CWV) | Vercel Analytics | Real User Monitoring | Continuous |
| Traceability | Product Owner | Matrix audit | Per release |

---

## 9. Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Jul 2026 | Initial traceability matrix covering 60 features, 52 user stories, 15 NFRs | Product Owner |

---

*Document Version: 1.0 — Requirements Traceability Matrix*
*Next Review: August 2026*
