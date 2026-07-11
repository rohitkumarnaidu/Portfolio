# Product Backlog — Prioritized Feature & Technical Work

> **Document:** `Backlog.md` | **Version:** 2.0 | **Last Updated:** July 2026
> **Status:** Active | **Owner:** Product Owner | **Review Cadence:** Sprintly (bi-weekly)
> **Tracking:** Linear | **Total Items:** 40+ | **Current Sprint:** Sprint 4 (Jul 14–Jul 25)

---

## 1. Current Sprint Focus — Sprint 4

| Area                   | Goal                                                         | Items        |
| ---------------------- | ------------------------------------------------------------ | ------------ |
| **AI Service**         | Ship functional AI chat with RAG pipeline                    | B-014, B-018 |
| **Portfolio Sections** | Complete remaining 5 sections (Testimonials, Stats, Contact) | B-003, B-007 |
| **Admin Dashboard**    | Project CRUD + Blog post editor MVP                          | B-005, B-011 |
| **Infrastructure**     | E2E test setup for critical paths                            | B-020        |

---

## 2. Backlog Prioritization Framework

### 2.1 Priority Levels

| Level  | Label    | Definition                                                  | Response                   |
| ------ | -------- | ----------------------------------------------------------- | -------------------------- |
| **P0** | Critical | Blocks launch or core functionality; security vulnerability | Must ship this sprint      |
| **P1** | High     | Major feature or improvement; significant user value        | Must ship this quarter     |
| **P2** | Medium   | Important but not urgent; nice-to-have enhancement          | Ship when capacity allows  |
| **P3** | Low      | Future idea; speculative; dependent on other milestones     | Backlog grooming candidate |

### 2.2 MoSCoW Classification

Each backlog item is also assigned a MoSCoW category that is reviewed quarterly:

| Category        | Allocation      | Description                                                                            |
| --------------- | --------------- | -------------------------------------------------------------------------------------- |
| **Must Have**   | ~40% of backlog | Non-negotiable for current strategic theme. Without these, the release is meaningless. |
| **Should Have** | ~30% of backlog | Important but not vital. Short-term workaround acceptable if delayed.                  |
| **Could Have**  | ~20% of backlog | Desirable but not necessary. Included if time/resources permit.                        |
| **Won't Have**  | ~10% of backlog | Explicitly out of scope for current theme. Captured for future reference.              |

### 2.3 Effort Estimation

| Size           | Hours  | Typical Items                                         |
| -------------- | ------ | ----------------------------------------------------- |
| **S** (Small)  | 2–8h   | Bug fix, copy change, minor UI tweak, test addition   |
| **M** (Medium) | 8–24h  | New component, API endpoint, feature flag integration |
| **L** (Large)  | 24–80h | New feature, module, integration, migration           |

---

## 3. Theme-Based Backlog Groups

### Core Portfolio (CP)

Public-facing portfolio sections, 3D experiences, animations, and content presentation. **Current completion: ~70%** (20 of 25 sections live).

### Admin Dashboard (AD)

Content management, analytics views, user administration, and configuration UI. **Current status: Scaffolding complete, features in progress.**

### AI Features (AI)

AI chat, RAG pipeline, embeddings, LLM integrations, agent capabilities. **Current status: Stub exists, implementation in progress.**

### Developer Experience (DX)

Monorepo tooling, CI/CD, testing infrastructure, documentation, code quality. **Current status: Solid foundation, gaps in testing.**

### Infrastructure & Security (IS)

Deployment, database, caching, auth, monitoring, performance optimization. **Current status: Core infra provisioned, hardening needed.**

---

## 4. Top 20 Prioritized Backlog Items

| ID        | Title                               | Theme | Priority | MoSCoW | Effort | Dependencies       | Notes                                                |
| --------- | ----------------------------------- | ----- | -------- | ------ | ------ | ------------------ | ---------------------------------------------------- |
| **B-001** | Hero section with 3D scene          | CP    | P0       | Must   | M      | —                  | Core first impression; partial implementation exists |
| **B-002** | Projects showcase with filtering    | CP    | P0       | Must   | L      | B-005 (Admin CRUD) | Filter/search by tech stack, year, category          |
| **B-003** | Skills & expertise visualization    | CP    | P0       | Must   | M      | —                  | Interactive skill matrix with proficiency bars       |
| **B-004** | Experience timeline                 | CP    | P0       | Must   | M      | —                  | Chronological career history with key highlights     |
| **B-005** | Admin dashboard — Projects CRUD     | AD    | P0       | Must   | L      | Auth system        | Rich text editor, image upload, tag management       |
| **B-006** | AI chat assistant — RAG pipeline    | AI    | P0       | Must   | L      | B-018 (Embeddings) | LangChain + pgvector; answer portfolio questions     |
| **B-007** | Testimonials & social proof section | CP    | P1       | Should | S      | —                  | Carousel of recommendations with avatars             |
| **B-008** | Blog/Articles CMS                   | AD    | P1       | Should | L      | B-005              | Markdown editor, categories, publish workflow        |
| **B-009** | Contact form with lead capture      | CP    | P1       | Should | M      | —                  | SendGrid/Nodemailer integration; spam protection     |
| **B-010** | Analytics dashboard (Admin)         | AD    | P1       | Should | L      | B-005              | Visitor stats, page views, AI query logs             |
| **B-011** | Blog post public view               | CP    | P1       | Should | M      | B-008              | Rich rendering, reading time, related posts          |
| **B-012** | Dark/light theme toggle             | CP    | P1       | Should | S      | —                  | System default + manual override; persisted          |
| **B-013** | SEO metadata management             | AD    | P1       | Should | M      | B-005              | Per-page OG tags, meta description, keywords         |
| **B-014** | AI chat UI — conversation UI        | AI    | P1       | Must   | M      | —                  | Streaming responses, suggested questions, feedback   |
| **B-015** | Performance — 3D lazy loading       | CP    | P2       | Could  | M      | B-001              | Dynamic import R3F components; code splitting        |
| **B-016** | Case studies deep-dive pages        | CP    | P2       | Could  | L      | B-002              | Per-project deep dive with architecture diagrams     |
| **B-017** | Internationalization (i18n)         | CP    | P2       | Could  | L      | —                  | Next.js i18n; EN primary, 2 additional locales       |
| **B-018** | Embeddings generation pipeline      | AI    | P0       | Must   | M      | —                  | Chunk portfolio content → embed → pgvector           |
| **B-019** | HttpOnly cookie auth migration      | IS    | P0       | Must   | M      | B-005              | Replace localStorage JWT; mitigate XSS               |
| **B-020** | E2E test suite (Playwright)         | DX    | P1       | Should | L      | CI/CD infra        | Cover: portfolio browse, admin CRUD, AI chat         |

---

## 5. Backlog Refinement Process

### Cadence

| Event                    | Frequency       | Duration | Participants             |
| ------------------------ | --------------- | -------- | ------------------------ |
| Backlog Grooming         | Weekly (Wed)    | 30 min   | PO + Eng Lead            |
| Sprint Planning          | Bi-weekly (Mon) | 60 min   | PO + Eng Lead + Team     |
| Quarterly Prioritization | Quarterly       | 90 min   | PO + Arch + Stakeholders |

### Refinement Activities

1. **Re-prioritization** — Review priority drift based on new insights, market changes, technical discoveries
2. **Estimation** — Apply T-shirt sizing (S/M/L) to un-estimated items
3. **Decomposition** — Split large items (L) into smaller actionable stories
4. **Dependency mapping** — Identify and document cross-item dependencies
5. **Acceptance criteria review** — Ensure criteria are testable and unambiguous
6. **Stale item pruning** — Archive items untouched for 3+ sprints with rationale

### Definition of Ready (DoR)

A backlog item must meet all criteria below before it enters a sprint:

- [ ] Title and description clearly articulate the feature/fix/pain point
- [ ] Priority level (P0–P3) assigned and justified
- [ ] Effort estimate (S/M/L) provided by engineering
- [ ] Dependencies identified and unblocked (or acceptance of risk documented)
- [ ] Acceptance criteria defined (3–5 concrete, testable conditions)
- [ ] UX design complete or explicitly waived
- [ ] API contract documented (if backend change required)
- [ ] Feature flag defined (if feature-scoped rollout needed)
- [ ] Analytics tracking requirements specified (if applicable)

### Definition of Done (DoD)

Items removed from the active sprint must meet:

- [ ] Code merged to main branch via reviewed PR
- [ ] Unit/integration tests passing (min 80% coverage on new code)
- [ ] E2E test added for critical user path
- [ ] Feature flag configured and verified
- [ ] API response envelope (`{ data, meta }`) conforms to shared contract
- [ ] Documentation updated (API docs, README, or ADR as applicable)
- [ ] Accessibility review passed (keyboard nav + screen reader)
- [ ] Lighthouse score not regressed on affected pages

---

## 6. Backlog Health Metrics

| Metric                      | Target    | Current   | Trend          |
| --------------------------- | --------- | --------- | -------------- |
| Items with valid estimate   | > 80%     | 65%       | Improving      |
| Items with clear DoR        | > 90%     | 70%       | Improving      |
| P0 items in current sprint  | ≤ 5       | 4         | Stable         |
| Items untouched > 3 sprints | < 10%     | 15%       | Needs grooming |
| Average refinement age      | < 2 weeks | 1.8 weeks | Stable         |

---

## 7. Icebox — Future Exploration Candidates

| ID    | Title                                       | Theme | Rationale for Deferring                        |
| ----- | ------------------------------------------- | ----- | ---------------------------------------------- |
| B-101 | AI agent — automated blog post generation   | AI    | Requires robust RAG first; speculative value   |
| B-102 | Public API (REST for portfolio data)        | IS    | Useful but no consumer identified yet          |
| B-103 | Template marketplace for portfolio sections | AD    | Full build-out depends on modular architecture |
| B-104 | WebSocket-driven real-time collaboration    | IS    | Over-engineered for single-user admin          |
| B-105 | Blockchain credential verification          | IS    | Experimental; no clear demand                  |

---

_Document Version: 2.0 — Product Backlog_
_Next Refinement: July 16, 2026_
