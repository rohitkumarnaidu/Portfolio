# User Research & Insights

> **Document:** `UserResearch.md` | **Version:** 2.0 | **Last Updated:** July 2026
> **Status:** Active | **Owner:** Product Owner | **Review Cadence:** Monthly
> **Cross-References:** [ProductStrategy.md](./ProductStrategy.md) | [ProductRequirements.md](./ProductRequirements.md)

---

## 1. Research Framework Overview

Our user research program follows a **continuous, mixed-methods approach** combining qualitative depth (interviews, usability tests) with quantitative breadth (analytics, surveys). Research priorities are aligned with the current strategic theme and feed directly into the product backlog.

### Research Principles

- **Closed feedback loop:** Every finding generates an action item or hypothesis to test
- **Bias-aware:** Research explicitly accounts for confirmation bias, social desirability bias, and sampling bias
- **Actionable output:** Each study produces concrete recommendations, not just observations
- **Lightweight execution:** Research methods selected to maximize insight-to-effort ratio

---

## 2. Research Methods

### 2.1 Active Methods

| Method                              | Frequency  | Sample Size       | Purpose                                                                    | Current Status                          |
| ----------------------------------- | ---------- | ----------------- | -------------------------------------------------------------------------- | --------------------------------------- |
| **Semi-structured user interviews** | Quarterly  | 5–8 participants  | Deep exploration of needs, pain points, mental models                      | Active — planning Q3 2026 round         |
| **Unmoderated usability testing**   | Monthly    | 3–5 participants  | Identify friction points in core flows (browse, chat, admin)               | Active — automated via Maze/UserTesting |
| **Analytics review**                | Continuous | All visitors      | Quantitative behavior patterns, funnel analysis, drop-off points           | Active — GA4 + custom events            |
| **Competitive analysis**            | Quarterly  | 10 competitors    | Positioning, feature gaps, UX patterns, performance benchmarks             | Active — latest report June 2026        |
| **AI chat log analysis**            | Weekly     | All chat sessions | Identify knowledge gaps, common questions, user satisfaction               | Active — reviewed every sprint          |
| **Session recordings**              | Monthly    | 50 sessions       | Visual playback of user behavior, scroll patterns, interaction hesitations | Setup in progress                       |

### 2.2 Planned Methods

| Method               | Target Quarter | Rationale                                                 |
| -------------------- | -------------- | --------------------------------------------------------- |
| **A/B testing**      | Q4 2026        | Quantify impact of AI chat on conversion and engagement   |
| **Survey (on-page)** | Q4 2026        | Scale feedback collection; NPS and satisfaction scores    |
| **Card sorting**     | Q1 2027        | Validate information architecture before i18n expansion   |
| **Diary study**      | Q2 2027        | Understand long-term usage patterns of returning visitors |

---

## 3. Research Cadence

### Monthly Cycle

```
Week 1: Define research question aligned with sprint goals
Week 2: Recruit participants; prepare test scenarios
Week 3: Conduct usability tests (3–5 sessions)
Week 4: Analyze findings; present recommendations at sprint review
```

### Quarterly Deep-Dive Cycle

```
Month 1: Strategic research question definition (aligned with OKRs)
Month 2: Conduct interviews (5–8 participants) + competitive analysis
Month 3: Synthesis, persona updates, backlog recommendations
```

### Weekly Lightweight Cycle

```
Every Monday: Review AI chat logs from prior week
Every Wednesday: Analytics dashboard check (30-min)
Every Friday: Surface top 3 insights to engineering team
```

---

## 4. Key Findings & Insights

### 4.1 Initial Findings (Q2 2026 Baseline)

#### Finding 1: "Static Portfolio Fatigue"

**Evidence:** Review of 50+ competitor portfolios; interviews with 5 technical recruiters.
**Detail:** Recruiters spend an average of 6 seconds on a resume and < 30 seconds on a conventional portfolio. Static "About, Projects, Contact" structures have high bounce rates.
**Implication:** The portfolio needs an immediate "hook." Interactive 3D and conversational AI provide engagement that static pages cannot.
**Action:** Prioritize 3D hero scene (P0) and AI chat (P0) as engagement drivers.

#### Finding 2: "Show, Don't Tell" Mandate

**Evidence:** Interviews with 3 startup founders and 2 engineering managers.
**Detail:** Technical hiring managers are skeptical of claimed skills without proof. Claiming "enterprise architecture" requires the portfolio itself to demonstrate enterprise architecture.
**Implication:** Exposing the tech stack (Next.js, NestJS, FastAPI, Prisma) as visible content validates the creator's claims. The architecture IS the portfolio piece.
**Action:** Add an "Architecture" section to the portfolio with system diagram (P1); include tech stack badges on every project.

#### Finding 3: AI Assistant Must Be Contextual

**Evidence:** Testing of 3 existing AI-augmented portfolios; competitor analysis.
**Detail:** Generic LLM wrappers that produce vague answers are viewed negatively. Users expect the AI to have deep, specific knowledge about the person.
**Implication:** The RAG pipeline must be highly curated. Detailed project post-mortems, specific skill matrices, and nuanced experience narratives are required — not a scraped resume PDF.
**Action:** Allocate 2 weeks for knowledge base curation before AI launch (B-018).

#### Finding 4: Content Update Friction

**Evidence:** Interviews with 5 developers who abandoned custom portfolio projects.
**Detail:** Developers abandon custom portfolios because updating content requires a code change — build, test, deploy cycle. Without a CMS, the portfolio goes stale.
**Implication:** A dedicated admin dashboard with database-backed CRUD is essential for long-term viability. Without it, the portfolio will be abandoned within 6 months.
**Action:** Admin dashboard (B-005, B-008) is P0 — not a nice-to-have.

#### Finding 5: Accessibility Matters More Than Expected

**Evidence:** Analytics from comparable portfolio sites; WCAG compliance audit.
**Detail:** ~15% of visitors to developer portfolio sites have a disclosed disability (visual, motor, cognitive). Non-accessible portfolios actively exclude this audience — and may violate legal requirements in some jurisdictions.
**Implication:** Accessibility is not just ethical — it expands the addressable audience by 15%.
**Action:** WCAG 2.2 AA compliance is a P0 requirement, not a stretch goal.

### 4.2 Insights Pending Validation

| Hypothesis                                                        | Planned Validation Method                   | Quarter |
| ----------------------------------------------------------------- | ------------------------------------------- | ------- |
| AI chat increases time-on-site by 50%+                            | A/B test (page with/without chat)           | Q4 2026 |
| Visitors prefer dark mode for portfolio browsing                  | Survey + analytics (theme toggle usage)     | Q3 2026 |
| Case studies drive more conversions than project lists            | Analytics (CTA click rate per content type) | Q4 2026 |
| Multi-language support will increase international traffic by 30% | Pre/post i18n launch traffic comparison     | Q1 2027 |
| Open-sourcing the codebase will attract qualified job offers      | Track inbound from GitHub profile           | Q1 2027 |

---

## 5. Persona Validation Approach

### Persona 1: "The Technical Sourcer" (Primary)

| Attribute              | Detail                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| **Goal**               | Find a senior/staff engineer with specific technical depth                                    |
| **Behavior**           | Scans portfolio < 30s; looks at projects, tech stack, code quality; may chat with AI          |
| **Key Question**       | "Can this person actually build what they claim?"                                             |
| **Validation method**  | Recruiter interviews; session recordings; task completion rate for "find evidence of skill X" |
| **Current confidence** | Medium — need 5 more recruiter interviews to validate                                         |

### Persona 2: "The Cautious Client" (Secondary)

| Attribute              | Detail                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------ |
| **Goal**               | Hire a freelancer/contractor for a specific project                                  |
| **Behavior**           | Reads case studies thoroughly; checks testimonials; uses AI to probe expertise depth |
| **Key Question**       | "Has this person solved a problem like mine before?"                                 |
| **Validation method**  | Client interviews; conversion funnel analysis; case study engagement metrics         |
| **Current confidence** | Low — initial assumptions based on 3 interviews only                                 |

### Persona 3: "The Curious Peer" (Tertiary)

| Attribute              | Detail                                                               |
| ---------------------- | -------------------------------------------------------------------- |
| **Goal**               | Learn from the architecture; potentially contribute                  |
| **Behavior**           | Clones the repo, reads architecture docs, may submit PRs             |
| **Key Question**       | "Is this well-engineered enough to learn from?"                      |
| **Validation method**  | GitHub analytics; README engagement; contribution quality            |
| **Current confidence** | Medium — validated against own experience but needs community signal |

---

## 6. Feedback Collection Channels

| Channel                  | Type                   | Volume (current)        | Insights Captured                                 | Owner         |
| ------------------------ | ---------------------- | ----------------------- | ------------------------------------------------- | ------------- |
| Contact form             | Structured             | 0/mo (pre-launch)       | Lead intent, client questions                     | Product Owner |
| AI chat logs             | Unstructured + ratings | 0 chats (pre-launch)    | Knowledge gaps, user interests, satisfaction      | AI Architect  |
| Session recordings       | Behavioral             | 0 sessions (pre-launch) | UX friction, navigation patterns, drop-off points | Product Owner |
| GitHub issues            | Structured             | 0 (pre-launch)          | Bug reports, feature requests, questions          | Engineering   |
| On-page survey (planned) | Structured             | —                       | NPS, feature requests, satisfaction               | Product Owner |

---

## 7. Research Prioritization Framework

Research opportunities are scored on three axes:

| Criterion               | Weight | Scoring (1–5)                                                             |
| ----------------------- | ------ | ------------------------------------------------------------------------- |
| **Strategic alignment** | 40%    | 1 = unrelated to current OKRs; 5 = directly measures KR progress          |
| **Decision impact**     | 35%    | 1 = interesting but changes nothing; 5 = could alter roadmap direction    |
| **Ease of execution**   | 25%    | 1 = requires 40+ hours and special tools; 5 = 4 hours with existing tools |

**Priority score = (Strategic Alignment × 0.4) + (Decision Impact × 0.35) + (Ease of Execution × 0.25)**

Research backlog (current quarter):

| Study                            | Score | Quarter | Status       |
| -------------------------------- | ----- | ------- | ------------ |
| AI chat usability test           | 4.6   | Q3 2026 | Planned      |
| 3D performance perception survey | 4.1   | Q3 2026 | Planned      |
| Recruiter deep-dive interviews   | 4.5   | Q3 2026 | In progress  |
| Theme toggle preference analysis | 3.2   | Q3 2026 | Low priority |

---

## 8. Research Brief Template

Each research study begins with a structured brief:

```markdown
## Research Brief: [Study Name]

### Background

[1–2 sentences on context: what prompted this research]

### Research Question

[Single, specific question the study aims to answer]

### Methodology

- Method: [Interview / Usability test / Survey / Analytics review]
- Participants: [Number and profile]
- Duration: [Estimated hours for research + analysis]
- Tools: [e.g., Zoom, Maze, GA4, Hotjar]

### Key Metrics

- [Metric 1]: [Definition and target]
- [Metric 2]: [Definition and target]

### Success Criteria

- [ ] [Criterion 1 — what constitutes a valid answer to the research question]
- [ ] [Criterion 2 — data quality threshold]

### Related Backlog Items

- [B-XXX] — [Title]
- [B-XXX] — [Title]

### Schedule

- Recruitment start: [Date]
- Research sessions: [Date(s)]
- Analysis complete: [Date]
- Findings presented: [Date]
```

### Example: Filled Brief (Q3 2026)

```markdown
## Research Brief: AI Chat Beta Usability

### Background

AI chat P0 implementation is on track for Q3 launch. Before GA, we need to validate
that the interaction pattern is intuitive and that responses meet user expectations.

### Research Question

Can a first-time visitor successfully learn about the portfolio owner's skills
using the AI chat interface without instructions or onboarding?

### Methodology

- Method: Unmoderated usability testing (Maze)
- Participants: 5 technical professionals (mix of recruiters, engineers)
- Duration: 8 hours total (1.5h prep, 5h analysis, 1.5h reporting)
- Tools: Maze, staging environment, Loom

### Key Metrics

- Task completion rate: Can user find "Has person worked with React?" via chat?
- Time-on-task: < 60s to get a meaningful answer
- Satisfaction: Post-test SUS score > 70

### Success Criteria

- [ ] Task completion rate ≥ 80%
- [ ] Average SUS score ≥ 70
- [ ] Zero cases of user abandoning chat due to confusion

### Related Backlog Items

- B-014 — AI chat UI
- B-006 — RAG pipeline
- B-018 — Embeddings generation
```

---

## 9. Research Log & Output Archive

| Study ID | Date          | Method               | Participants  | Key Finding                                                       | Report Link                                     |
| -------- | ------------- | -------------------- | ------------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| RS-001   | Jun 2026      | Competitive analysis | 10 portfolios | Static layout fatigue confirmed; AI-augmented portfolios are rare | `docs/research/competitor-analysis-2026-06.md`  |
| RS-002   | Jun 2026      | Recruiter interviews | 5 recruiters  | "Show, don't tell" mandate; architecture-as-content validated     | `docs/research/recruiter-interviews-2026-06.md` |
| RS-003   | Planned (Aug) | AI chat usability    | 5 users       | —                                                                 | —                                               |
| RS-004   | Planned (Sep) | Recruiter deep-dive  | 5 recruiters  | —                                                                 | —                                               |

---

## 10. Research Ethics & Privacy

- All participant data anonymized in reports; identifiable information stored separately with explicit consent
- Session recordings stored for maximum 90 days; participants notified of recording
- Consent obtained before every session; participants may withdraw at any time
- No deceptive research practices; purpose of study clearly communicated
- Compensation: $25 gift card per 30-min session; $50 per 60-min session

---

## Cross-References

- MASTER-INDEX.md — Documentation master index
- ../26-reference/CROSS-REFERENCE-INDEX.md — Cross-reference mapping
- UserPersonas.md — User personas
- user-journey-maps.md — User journey maps

_Document Version: 2.0 — User Research & Insights_
_Last Updated: July 2026_
_Next Scheduled Study: AI Chat Beta Usability (Aug 2026)_
