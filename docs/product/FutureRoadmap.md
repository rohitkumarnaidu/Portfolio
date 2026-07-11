# Future Roadmap — Product Horizon Planning

> **Document:** `FutureRoadmap.md` | **Version:** 2.0 | **Last Updated:** July 2026
> **Status:** Active | **Owner:** Product Owner | **Review Cadence:** Quarterly
> **Format:** Now / Next / Later
> **Cross-References:** [ProductRoadmap.md](./ProductRoadmap.md) | [okrs.md](./okrs.md) | [ProductStrategy.md](./ProductStrategy.md)

---

## 1. Executive Summary

This roadmap spans **four quarters (Q3 2026 – Q2 2027)** and organizes delivery into three horizons: **Now** (this quarter's active builds), **Next** (next quarter's planned work informed by Now outcomes), and **Later** (validated opportunities awaiting capacity). Each initiative includes its expected impact, success criteria, and key dependencies. Decision points at quarter boundaries allow course correction based on data.

---

## 2. Now — Q3 2026 (Current: Jul–Sep)

**Theme:** Launch & Establish — ship the core platform, AI basics, and admin tooling.

### 2.1 Portfolio Foundation (In Progress)

| Initiative | Description | Expected Impact | Success Metric |
|------------|-------------|-----------------|----------------|
| 25 Portfolio sections | Complete all core sections: Hero, About, Projects, Skills, Experience, Education, Testimonials, Stats, Contact, Blog | First impression that captures visitor attention and communicates breadth of work | 100% sections live; Lighthouse ≥ 90 |
| 3D hero experience | React Three Fiber scene with branded GLTF model; performant lazy loading | Immediate visual differentiation from conventional portfolios | 3D scene load < 3s; no impact on LCP > 2.5s |
| Responsive design baseline | Every section adapts gracefully across mobile, tablet, desktop | 100% of visitors get optimal experience regardless of device | No layout shift or content clipping at any breakpoint |
| SEO & metadata | Dynamic OG tags, sitemap, structured data, canonical URLs | Discoverable via search engines; rich social sharing previews | OG tags render correctly on Twitter/LinkedIn/Slack |

### 2.2 AI Assistant v1

| Initiative | Description | Expected Impact | Success Metric |
|------------|-------------|-----------------|----------------|
| RAG pipeline setup | LangChain + pgvector; embed all portfolio content into vector database | AI answers are grounded in the owner's actual experience, not generic LLM knowledge | Embedding coverage: 100% of content |
| Chat UI | Streaming response UI, suggested questions, feedback mechanism | Visitors engage in natural conversation about the owner's work | Chat initiated in > 10% of sessions |
| Knowledge base curation | Curate detailed project post-mortems, skill matrices, and experience narratives | High-quality signal in → high-quality answers out | Human-rated response quality ≥ 85% |

### 2.3 Admin Dashboard

| Initiative | Description | Expected Impact | Success Metric |
|------------|-------------|-----------------|----------------|
| Projects CRUD | Create, edit, publish/unpublish projects with rich text, tags, images | Owner can add new work without touching code | Full CRUD operational for 5+ projects |
| Blog CMS | Markdown editor, categories, publish workflow, draft/publish states | Owner can write and publish blog posts independently | First blog post published via CMS |
| Auth & RBAC | JWT auth with admin/editor/viewer roles; HttpOnly cookie migration | Secure admin access with role-appropriate permissions | Zero auth-related security findings |

### 2.4 Infrastructure

| Initiative | Description | Expected Impact | Success Metric |
|------------|-------------|-----------------|----------------|
| CI/CD pipeline | GitHub Actions: lint → typecheck → test → build → deploy | Every PR is automatically validated; deploy on merge | Pipeline run < 10 min; zero failed deploys |
| Test infrastructure | Jest for API, Vitest for Web, Playwright for E2E | Quality gate prevents regressions | API coverage > 80%; E2E covers 2+ critical paths |
| Monitoring setup | Sentry error tracking; uptime monitoring; Pino structured logging | Visibility into production health | Alert response time < 15 min for SEV-1 |

### Q3 Decision Points
| Decision | When | Inputs | Decision Maker |
|----------|------|--------|----------------|
| **DP-1:** Is AI quality high enough for GA? | End of Q3 | Human eval scores, user feedback, latency metrics | Product Owner |
| **DP-2:** Is 3D performance acceptable on mid-range devices? | Mid-Q3 | Lighthouse on Moto G4, R3F profiler | Architect |
| **DP-3:** Do we invest in more sections or move to analytics? | End of Q3 | Visitor engagement data per section | Product Owner |

---

## 3. Next — Q4 2026 (Oct–Dec)

**Theme:** Scale & Refine — analytics, blog expansion, performance hardening.

### 3.1 Analytics & Insights

| Initiative | Description | Expected Impact | Success Metric |
|------------|-------------|-----------------|----------------|
| Visitor analytics dashboard | Page views, session duration, bounce rate, geographic data, device breakdown | Understand audience behavior to optimize content and UX | 10+ dashboard widgets; data within 5 min of real-time |
| AI query analytics | Most asked questions, unanswered queries, user satisfaction by topic | Identify knowledge gaps in RAG corpus; prioritize content curation | AI analytics surfaced in admin dashboard |
| Lead tracking | Contact form → lead pipeline → conversion tracking | Quantify portfolio's ROI as a lead generation tool | Lead source attribution visible |
| Custom event tracking | Track 3D interactions, CTA clicks, scroll depth | Granular understanding of engagement patterns | 15+ custom events implemented |

### 3.2 Content & Blog

| Initiative | Description | Expected Impact | Success Metric |
|------------|-------------|-----------------|----------------|
| Blog CMS improvements | Rich media embeds, scheduled publishing, series/category management | Blog becomes a compelling reason to return | 4+ blog posts published via CMS |
| Case studies expansion | Deep-dive pages: problem, approach, architecture, results per project | Convince skeptical technical hiring managers with real architecture | 3+ case studies published |
| Newsletter integration | RSS feed, email subscription (Mailchimp/SendGrid) | Build recurring audience; re-engage past visitors | 50+ subscribers by end of quarter |

### 3.3 Performance & Hardening

| Initiative | Description | Expected Impact | Success Metric |
|------------|-------------|-----------------|----------------|
| Lighthouse 95+ across all categories | Image optimization, code splitting, caching strategy, critical CSS | Best-in-class performance signals engineering quality | Lighthouse score ≥ 95 in all categories |
| API caching (Redis) | NestJS cache module with Redis; conditional cache invalidation | Sub-100ms API response times for repeated queries | P95 API response < 200ms |
| 3D asset optimization | GLTF compression, LOD (level of detail), fallback for low-end devices | Maintain 3D experience without penalizing mobile users | 3D page load < 3s on mid-range mobile |

### Q4 Decision Points
| Decision | When | Inputs | Decision Maker |
|----------|------|--------|----------------|
| **DP-4:** Invest in i18n or AI expansion? | End of Q4 | Visitor geographic data, AI engagement metrics | Product Owner |
| **DP-5:** Should we open-source the design system? | Mid-Q4 | Community interest (GitHub stars, forks) | Architect |
| **DP-6:** Is AI chat ready for multi-language support? | End of Q4 | AI quality in EN; demand for localized content | Product Owner |

---

## 4. Later — Q1 2027 (Jan–Mar)

**Theme:** Intelligence & Reach — AI agents, multi-language, community growth.

### 4.1 AI Agent Framework

| Initiative | Description | Expected Impact | Success Metric |
|------------|-------------|-----------------|----------------|
| AI code review agent | Agent analyzes PRs against style guide, suggests improvements | Accelerate development velocity; demonstrate AI/DevOps skill | Agent merges 5+ PRs with human approval |
| AI content generator | Draft blog posts from outline + knowledge base | Scale content production while maintaining quality | 2+ AI-assisted blog posts published |
| Proactive AI suggestions | AI recommends sections to add, content to update, gaps to fill | Portfolio remains current with minimal manual effort | 3+ AI-suggested improvements accepted per quarter |

### 4.2 Multi-Language Support

| Initiative | Description | Expected Impact | Success Metric |
|------------|-------------|-----------------|----------------|
| i18n framework | Next.js i18n routing; translation management UI | Serve global audience in their preferred language | 3 locales live (EN + 2) |
| Localized AI responses | RAG queries answered in user's language | Non-English visitors get full value from AI chat | AI quality ≥ 80% in supported locales |
| Translated content workflow | Translation memory, human review step, fallback to English | Quality translations without manual duplication | 100% of portfolio content available in 3 locales |

### 4.3 Community & Open Source

| Initiative | Description | Expected Impact | Success Metric |
|------------|-------------|-----------------|----------------|
| Contribution guide | CONTRIBUTING.md, CODE_OF_CONDUCT.md, issue templates | Lower barrier for community participation | 10+ contributors |
| Architecture public docs | ADR index, system architecture diagrams, deployment guide | Demonstrate engineering leadership; attract contributors | 5+ ADRs documented |
| Community PR review workflow | CI for forks, review checklist, automated labeling | Scale engineering capacity through community | 5+ community PRs merged |

---

## 5. Later — Q2 2027 (Apr–Jun)

**Theme:** Platform & Ecosystem — APIs, templates, community features.

### 5.1 Public API

| Initiative | Description | Expected Impact | Success Metric |
|------------|-------------|-----------------|----------------|
| Public REST API | Portfolio data accessible via versioned API; API key auth | Enable third-party integrations; demonstrate API design skills | 3+ external consumers |
| API documentation | Swagger/OpenAPI with examples, rate limits, auth docs | Reduces friction for API consumers | API docs score ≥ 90/100 on clarity |
| Developer portal | API playground, SDK snippets, changelog | Comprehensive developer experience | 100+ API explorer sessions |

### 5.2 Template System

| Initiative | Description | Expected Impact | Success Metric |
|------------|-------------|-----------------|----------------|
| Section templates | Reusable, configurable section layouts with different visual styles | Owner can rapidly experiment with portfolio layout | 3+ templates available |
| Theme marketplace | User-submitted themes; theme preview and one-click apply | Community-driven design variety | 5+ community themes submitted |
| Drag-and-drop layout editor | Visual editor for section ordering and arrangement | No-code portfolio customization | Layout changed via editor by owner |

### 5.3 Community Features

| Initiative | Description | Expected Impact | Success Metric |
|------------|-------------|-----------------|----------------|
| Guestbook / testimonials | Visitor-submitted testimonials with moderation | Social proof; community engagement | 20+ guestbook entries |
| Portfolio analytics sharing | Public stats badge ("Powered by" with visitor count) | Viral growth mechanism | 100+ badge impressions |
| Changelog / release notes | Public changelog for platform updates | Transparency builds trust with community | Monthly release notes published |

---

## 6. Dependency Map

```
Q3 ──────────────────────────────────────────────────────────────>
  │
  ├─ Portfolio sections ──────► SEO ────────────────► Lighthouse 95+
  ├─ AI chat ─────────────────► Analytics ──────────► AI agents (Q1)
  ├─ Admin CRUD ──────────────► Blog CMS ───────────► Case studies
  ├─ Auth/RBAC ───────────────► HttpOnly cookie ────► Public API (Q2)
  └─ CI/CD ───────────────────► E2E tests ──────────► Community PRs (Q1)
                                  │
                                  └──────────────────► Template system (Q2)
```

---

## 7. Key Milestones

| Milestone | Target Date | Description | Exit Criteria |
|-----------|-------------|-------------|---------------|
| **M1: Platform Launch** | Sep 30, 2026 | Public launch of portfolio with core sections, AI chat, admin dashboard | All P0 items shipped and validated |
| **M2: Analytics Live** | Nov 15, 2026 | Visitor and AI analytics operational in admin dashboard | 10+ dashboard widgets; data pipeline verified |
| **M3: Performance Lock** | Dec 15, 2026 | Lighthouse 95+ across all categories; P95 API < 200ms | Performance budgets enforced in CI |
| **M4: AI Agent MVP** | Feb 15, 2027 | First AI agent (code review) operational | 2+ successful agent runs with human approval |
| **M5: i18n Go-Live** | Mar 15, 2027 | Multi-language support in 3 locales | 100% of content translated in all locales |
| **M6: Public API Beta** | May 15, 2027 | Public API available with docs and auth | 3 external consumers actively using API |
| **M7: Community Launch** | Jun 30, 2027 | Templates, guestbook, changelog live | 5+ community contributions merged |

---

## 8. Capacity Planning (Person-Quarter Estimates)

| Quarter | Portfolio | AI | Admin | Infra | Total (person-quarters) |
|---------|-----------|-----|-------|-------|------------------------|
| Q3 2026 | 1.0 | 0.5 | 0.5 | 0.5 | 2.5 |
| Q4 2026 | 0.5 | 0.5 | 0.25 | 0.75 | 2.0 |
| Q1 2027 | 0.5 | 0.75 | 0.25 | 0.25 | 1.75 |
| Q2 2027 | 0.5 | 0.25 | 0.5 | 0.5 | 1.75 |

*Note: Single-person project — estimates reflect relative time allocation across focus areas.*

---

## 9. Risk-Adjusted Timeline

| Risk | Impact if Realized | Probability | Mitigation | Contingency |
|------|-------------------|-------------|------------|-------------|
| AI RAG quality below 85% threshold | Delays AI GA; reduces differentiation value | Medium | Early spike testing in Q3; human eval rubric ready by mid-Q3 | Defer AI agent work; focus on analytics instead |
| 3D performance unacceptable on mid-range devices | Core visual differentiator fails | Medium | LOD and fallback strategy built from day one | Strip 3D to hero only; rest is CSS animations |
| Auth migration (HttpOnly cookie) breaks admin workflows | Admin dashboard unavailable | Low | Staged rollout with feature flag; parallel localStorage fallback for 1 sprint | Rollback to localStorage; re-plan migration |
| E2E test maintenance overhead slows velocity | CI pipeline becomes bottleneck | Medium | Focus on 3 critical paths only; page object model for maintainability | Accept lower coverage temporarily |

---

*Document Version: 2.0 — Future Roadmap*
*Last Updated: July 2026*
*Next Review: October 2026*
