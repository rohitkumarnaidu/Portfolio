# User Journey Maps

> **Document:** `user-journey-maps.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** Ã¢Å“â€¦ Active | **Owner:** Product Owner | **Review Cadence:** Quarterly
> **Related:** `UserPersonas.md`, `UserFlows.md`, `ProductRequirements.md`

---

## 1. Overview

This document defines detailed user journey maps for each primary persona defined in `UserPersonas.md`. Unlike the swimlane flows in `UserFlows.md` (which focus on step-by-step system interactions), these journey maps model the **full emotional and behavioral experience** Ã¢â‚¬â€ from awareness through post-conversion Ã¢â‚¬â€ highlighting pain points, opportunities, and success metrics at every phase.

### 1.1 Journey Map Structure

Each journey map includes:

1. **Persona context** Ã¢â‚¬â€ Who, what, why
2. **Journey phases** Ã¢â‚¬â€ End-to-end lifecycle stages
3. **Touchpoints** Ã¢â‚¬â€ Where users interact with the system
4. **Emotional journey** Ã¢â‚¬â€ Highs, lows, and inflection points
5. **Pain points & opportunities** Ã¢â‚¬â€ Friction and improvement areas
6. **Success metrics per phase** Ã¢â‚¬â€ Quantitative targets

### 1.2 Journey vs. Flow

| Dimension | Journey Map (this doc)             | User Flow (`UserFlows.md`)     |
| --------- | ---------------------------------- | ------------------------------ |
| Scope     | End-to-end lifecycle               | Single-session interaction     |
| Focus     | Emotions, context, opportunities   | Step-by-step system actions    |
| Output    | Qualitative insights + metrics     | Swimlane diagrams + test cases |
| Use case  | Product strategy, design decisions | Engineering implementation, QA |

---

## 2. Journey 1: Recruiter Assessment Journey

**Persona:** Sarah Chen Ã¢â‚¬â€ Senior Technical Recruiter
**Primary Goal:** Qualify candidate in < 30 seconds and access resume/contact
**Entry Sources:** LinkedIn profile link, resume URL, Google search, referral

### 2.1 Journey Table

| Phase                    | 1. Awareness                                              | 2. Landing                                          | 3. Scanning                                        | 4. Evaluation                                             | 5. Verification                                       | 6. Action                                                   | 7. Post-Visit                                               |
| ------------------------ | --------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
| **User Actions**         | Receives portfolio link from candidate or search          | Opens URL, page renders                             | Scans hero for name, role, location                | Reviews skills section, glances at 1-2 projects           | Checks GitHub, reads testimonials                     | Downloads resume, clicks contact, or copies LinkedIn        | Enters notes in ATS, compares with other candidates         |
| **Touchpoints**          | Email, LinkedIn, Google                                   | Browser address bar, loading spinner                | Hero section, navigation                           | Skills section, project cards                             | GitHub link, testimonial cards                        | Resume download button, CTA buttons, contact form           | ATS, spreadsheet, email client                              |
| **System Interactions**  | SEO meta tags render in search results, OG tags in social | Page load, LCP measurement, analytics session start | Content render, above-fold paint                   | Section lazy-load, skill tag rendering                    | External link (GitHub), modal or page transition      | File download trigger, form submission, analytics event     | N/A (offline)                                               |
| **Emotional State**      | Ã°Å¸ËœÂ Neutral Ã¢â‚¬â€ "Another portfolio to review"     | Ã°Å¸ËœÅ  Hopeful Ã¢â‚¬â€ "This loaded fast"         | Ã°Å¸ËœÅ  Interested Ã¢â‚¬â€ "Clear, concise info"  | Ã°Å¸Â¤â€ Evaluating Ã¢â‚¬â€ "Skills match but need proof" | Ã°Å¸ËœÅ  Confident Ã¢â‚¬â€ "Evidence supports claims" | Ã°Å¸Å½Â¯ Satisfied Ã¢â‚¬â€ "Got what I needed"              | Ã¢ËœÂºÃ¯Â¸Â Positive Ã¢â‚¬â€ "Good candidate, easy process" |
| **Emotional Low Points** | Skepticism from past slow portfolios                      | Impatience if >3s load time                         | Confusion if role not immediately visible          | Frustration if skills are buzzwords without context       | Distrust if GitHub is empty or projects outdated      | Frustration if resume requires login or form is broken      | Disappointment if they forgot key info                      |
| **Pain Points**          | Portfolio not findable in search                          | Slow load time (abandonment risk)                   | Role/location not in hero                          | Skills mismatch unclear, no depth indicators              | Broken GitHub link, no testimonials                   | No downloadable resume, complex contact form                | ATS data entry friction                                     |
| **Opportunities**        | SEO optimization, Open Graph tags                         | Sub-1.5s LCP target                                 | Hero must show: name, role, location, availability | Skills with proficiency bars, project count badges        | Pre-connected GitHub repos with recent activity       | One-click resume, 2-field contact form, calendar scheduling | "Send to ATS" feature? Export as structured data            |
| **Success Metrics**      | SEO rank in top 3 for name + "portfolio"                  | LCP < 1.5s, TBT < 200ms                             | Time-to-role < 3s                                  | Skills section view rate > 80%                            | GitHub click rate > 25%                               | Resume download > 15%, form submit > 8%                     | N/A                                                         |
| **Drop-off Risk**        | Ã¢Å¡Â Ã¯Â¸Â High if not in search results                 | Ã¢Å¡Â Ã¯Â¸Â High if >3s load                        | Ã¢Å¡Â Ã¯Â¸Â Medium if hero is vague                | Ã¢Å¡Â Ã¯Â¸Â High if skills don't match                    | Ã¢Å¡Â Ã¯Â¸Â Medium if verification fails              | Ã¢Å¡Â Ã¯Â¸Â Low (sunk cost)                                 | N/A                                                         |

### 2.2 Emotional Journey Curve

```
Ã°Å¸ËœÅ  Happy Ã¢â€Â¤                                 Ã¢â€¢Â±Ã¢â€¢Â²
         Ã¢â€â€š                              Ã¢â€¢Â±Ã¢â€¢Â±  Ã¢â€¢Â²Ã¢â€¢Â²
         Ã¢â€â€š                            Ã¢â€¢Â±Ã¢â€¢Â±     Ã¢â€¢Â²Ã¢â€¢Â²
Ã°Å¸ËœÂ NeutralÃ¢â€Â¤Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€¢Â±Ã¢â€¢Â²Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€¢Â±Ã¢â€¢Â±        Ã¢â€¢Â²Ã¢â€¢Â²______
         Ã¢â€â€š         Ã¢â€¢Â±  Ã¢â€¢Â²            Ã¢â€¢Â±
Ã°Å¸ËœÅ¸ FrustratedÃ¢â€Â¤        Ã¢â€¢Â±    Ã¢â€¢Â²    Ã¢â€¢Â±Ã¢â€¢Â±
         Ã¢â€â€š       Landing  Eval  Action
         Ã¢â€â€š  Aware  |       |       |
Ã°Å¸ËœÂ¡ Angry  Ã¢â€Â¤Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
                 Time Ã¢â€ â€™
```

Key inflection points:

- **Landing**: Fast load Ã¢â€ â€™ positive start; slow load Ã¢â€ â€™ immediate negative
- **Skills Ã¢â€ â€™ Projects transition**: Biggest drop-off risk if skills don't match
- **Verification**: Second peak Ã¢â‚¬â€ testimonials and GitHub build confidence
- **Action**: Must be frictionless to convert the built-up positive emotion

### 2.3 Key Improvements for This Journey

1. **Sub-1.5s LCP**: Above-the-fold hero must render instantly Ã¢â‚¬â€ static HTML, no client JS dependency
2. **Hero clarity**: Name, current role, location, and availability status in the first viewport
3. **Skills section**: Filterable, with proficiency indicators and project count per technology
4. **Resume access**: Direct PDF link in header or hero Ã¢â‚¬â€ no login, no modal
5. **Performance budget**: Enforce via CI Lighthouse gates Ã¢â‚¬â€ fail build if LCP > 1.5s

---

## 3. Journey 2: Client Assessment Journey

**Persona:** Marcus Johnson Ã¢â‚¬â€ CTO / Startup Founder
**Primary Goal:** Find evidence of capability and initiate contact
**Entry Sources:** Google search, referral, blog post, LinkedIn

### 3.1 Journey Table

| Phase                    | 1. Discovery                                             | 2. Qualification                                          | 3. Deep Evaluation                                                            | 4. Trust Building                                         | 5. Conversion                                                         | 6. Follow-Up                                             |
| ------------------------ | -------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------- |
| **User Actions**         | Searches for specialized developer or receives referral  | Lands on portfolio, reads About, scans services offered   | Reads 1-3 case studies in detail, examines architecture                       | Reads testimonials, checks social proof indicators        | Submits detailed contact form or schedules call                       | Receives response, schedules consultation                |
| **Touchpoints**          | Google, LinkedIn, referral link                          | Homepage, About section, Services section                 | Case study pages, project detail modals                                       | Testimonial cards, social feed, GitHub stars              | Contact form, calendar widget, email                                  | Email, calendar invite                                   |
| **System Interactions**  | SEO indexing, social meta tags                           | Analytics session, scroll tracking, section transitions   | Case study lazy-load, code snippet rendering, image galleries                 | Social proof widgets, dynamic testimonial carousel        | Form validation, CAPTCHA, notification to admin                       | Auto-reply email, CRM update                             |
| **Emotional State**      | Ã°Å¸ËœÅ  Curious Ã¢â‚¬â€ "Need to find the right person" | Ã°Å¸ËœÂ Cautious Ã¢â‚¬â€ "Does this person fit my needs?" | Ã°Å¸Â¤â€ Analytical Ã¢â‚¬â€ "Digging into the details"                        | Ã°Å¸ËœÅ  Warming Ã¢â‚¬â€ "Others trust them, that's good" | Ã°Å¸ËœÅ  Confident Ã¢â‚¬â€ "Ready to reach out"                       | Ã°Å¸Å½Â¯ Hopeful Ã¢â‚¬â€ "Looking forward to discussion" |
| **Emotional Low Points** | Overwhelmed by too many choices                          | Underwhelmed by generic portfolio                         | Skeptical if case studies lack metrics                                        | Doubt if testimonials seem fake                           | Frustration if form asks too many questions                           | Anxiety if no response within 24h                        |
| **Pain Points**          | Hard to differentiate candidates                         | No services page, unclear what they offer                 | Case studies with no quantifiable results                                     | No testimonials or client names                           | Long forms with unnecessary fields                                    | Slow or no response to inquiry                           |
| **Opportunities**        | Niche SEO strategy (e.g., "NestJS consultant")           | Clear services + engagement model in hero/secondary nav   | Case study template: Problem Ã¢â€ â€™ Approach Ã¢â€ â€™ Result (with metrics) | Video testimonials, client logos, case study PDFs         | Smart form (adapts fields based on project type), calendar scheduling | Auto-reply within 60s, SLA guarantee                     |
| **Success Metrics**      | Search rank for niche terms                              | About section scroll depth > 50%                          | Case study completion > 60%                                                   | Testimonial engagement > 40%                              | Contact conversion > 12%                                              | Response time < 24h                                      |
| **Drop-off Risk**        | Ã¢Å¡Â Ã¯Â¸Â Low (specific need)                          | Ã¢Å¡Â Ã¯Â¸Â Medium if About is generic                    | Ã¢Å¡Â Ã¯Â¸Â High if no quantified results                                     | Ã¢Å¡Â Ã¯Â¸Â Medium if social proof missing                | Ã¢Å¡Â Ã¯Â¸Â Medium if form is long                                    | Ã¢Å¡Â Ã¯Â¸Â High if response is slow                     |

### 3.2 Emotional Journey Curve

```
Ã°Å¸ËœÅ  Happy Ã¢â€Â¤                       Ã¢â€¢Â±Ã¢â€¢Â²        Ã¢â€¢Â±Ã¢â€¢Â²
         Ã¢â€â€š                    Ã¢â€¢Â±Ã¢â€¢Â±  Ã¢â€¢Â²Ã¢â€¢Â²    Ã¢â€¢Â±Ã¢â€¢Â±  Ã¢â€¢Â²Ã¢â€¢Â²
         Ã¢â€â€š                 Ã¢â€¢Â±Ã¢â€¢Â±      Ã¢â€¢Â²Ã¢â€¢Â² Ã¢â€¢Â±Ã¢â€¢Â±      Ã¢â€¢Â²Ã¢â€¢Â²
Ã°Å¸ËœÂ NeutralÃ¢â€Â¤Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€¢Â±Ã¢â€¢Â²Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€¢Â±Ã¢â€¢Â±          Ã¢â€¢Â²Ã¢â€¢Â±          Ã¢â€¢Â²Ã¢â€¢Â²_____
         Ã¢â€â€š         Ã¢â€¢Â±  Ã¢â€¢Â²Ã¢â€¢Â±
Ã°Å¸ËœÅ¸ FrustratedÃ¢â€Â¤      Qualify  Eval   Trust  Convert
         Ã¢â€â€š  Disc.    |       |       |       |
Ã°Å¸ËœÂ¡ Angry  Ã¢â€Â¤Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
                 Time Ã¢â€ â€™
```

Key inflection points:

- **Qualification Ã¢â€ â€™ Evaluation**: High risk if services are unclear Ã¢â‚¬â€ user leaves before seeing evidence
- **Trust Building**: Testimonials are the conversion bridge Ã¢â‚¬â€ must be authentic and relevant
- **Conversion**: Form length inversely correlates with completion rate Ã¢â‚¬â€ optimize for 4-5 fields max

### 3.3 Key Improvements for This Journey

1. **Services section above the fold**: Clear offerings, engagement models, and indicative rates
2. **Case study template**: Every case study follows Problem Ã¢â€ â€™ Approach Ã¢â€ â€™ Result format with hard metrics
3. **Trust signals throughout**: Client logos in nav, testimonial snippets on case study pages
4. **Smart contact form**: Dropdown for project type, dynamic follow-up fields, free-form message
5. **Auto-confirmation**: Email auto-reply with availability and next steps within 60 seconds

---

## 4. Journey 3: Admin/Owner Management Journey

**Persona:** Alex Rivera Ã¢â‚¬â€ Portfolio Owner
**Primary Goal:** Maintain content, manage leads, analyze performance
**Entry Source:** Direct URL / Bookmark

### 4.1 Journey Table

| Phase                    | 1. Login                                       | 2. Dashboard Overview                                        | 3. Lead Management                                      | 4. Content Management                                                | 5. Analytics Review                                        | 6. Logout                                        |
| ------------------------ | ---------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| **User Actions**         | Navigates to admin URL, enters credentials     | Views summary: new leads, visitor count, recent activity     | Reads new messages, marks as read/responded, exports    | Edits project, writes blog post, updates skills, previews, publishes | Reviews traffic sources, popular sections, conversion data | Securely logs out                                |
| **Touchpoints**          | Admin login page, OAuth provider               | Dashboard widgets: KPI cards, activity feed, chart           | Lead inbox, message detail modal, export button         | CMS editor (WYSIWYG + markdown), media library, preview              | Analytics dashboard, chart filters, date range selector    | Logout button, session expiry                    |
| **System Interactions**  | JWT auth, session creation, redirect           | API aggregation: lead count, visitor stats, system health    | API: mark as read, reply email trigger, CSV generation  | API: CRUD content, image upload (CDN), preview rendering             | API: analytics queries, PostHog/session data aggregation   | Session invalidation, redirect to login          |
| **Emotional State**      | Ã°Å¸ËœÅ  Routine Ã¢â‚¬â€ "Part of my workflow" | Ã°Å¸ËœÅ  Informed Ã¢â‚¬â€ "Good, 3 new leads"                | Ã°Å¸ËœÅ  Productive Ã¢â‚¬â€ "Following up with leads"   | Ã°Å¸ËœÅ  Creative Ã¢â‚¬â€ "Sharing new work"                         | Ã°Å¸Â¤â€ Analytical Ã¢â‚¬â€ "What's resonating?"           | Ã¢ËœÂºÃ¯Â¸Â Done Ã¢â‚¬â€ "Everything is current" |
| **Emotional Low Points** | Frustration if login is slow or broken         | Anxiety if lead count is high (overwhelmed)                  | Guilt if leads are old/unanswered                       | Frustration if CMS is buggy or preview is inaccurate                 | Confusion if data is inconsistent                          | N/A                                              |
| **Pain Points**          | No SSO, password reset friction                | Dashboard shows vanity metrics, not actionable insights      | No lead status tracking, no email integration           | Rich text editor loses formatting, image upload fails                | Metrics mismatch between analytics tools                   | No auto-save, risk of losing work                |
| **Opportunities**        | SSO (Google/GitHub), biometric auth            | Actionable widget: "Leads needing response", "Stale content" | Lead pipeline with stages, email integration (SendGrid) | Autosave, revision history, one-click publish                        | Unified analytics dashboard, exportable reports            | Auto-save state, session persistence             |
| **Success Metrics**      | Login time < 3s                                | Time to first insight < 10s                                  | Lead response time < 24h                                | Content update time < 5min                                           | Analytics review frequency > 2x/week                       | 100% session persistence                         |
| **Drop-off Risk**        | Ã¢Å¡Â Ã¯Â¸Â Low (motivated user)               | Ã¢Å¡Â Ã¯Â¸Â Low                                              | Ã¢Å¡Â Ã¯Â¸Â Medium (notification fatigue)               | Ã¢Å¡Â Ã¯Â¸Â Medium (frustration with editor)                         | Ã¢Å¡Â Ã¯Â¸Â Low                                            | N/A                                              |

### 4.2 Key Improvements for This Journey

1. **Actionable dashboard**: Widgets prioritized by urgency Ã¢â‚¬â€ unanswered leads first, then content freshness warnings
2. **CMS reliability**: Autosave every 30 seconds, revision history with diff view, preview on mobile/desktop/tablet
3. **Lead management pipeline**: Inbox (new) Ã¢â€ â€™ Read Ã¢â€ â€™ Responded Ã¢â€ â€™ Closed, with email integration
4. **Mobile admin**: Critical actions (lead response, content publish) available via mobile-responsive admin
5. **Push notifications**: Browser push for new leads, daily digest email for analytics

---

## 5. Journey 4: Open-Source Contributor Journey

**Persona:** Jordan Kim Ã¢â‚¬â€ Developer / OSS Contributor
**Primary Goal:** Understand, set up, and contribute to the codebase
**Entry Sources:** GitHub, Hacker News, blog post, peer referral

### 5.1 Journey Table

| Phase                    | 1. Discovery                                     | 2. Evaluation                                       | 3. Setup                                    | 4. Code Exploration                                              | 5. Contribution                                   | 6. PR Lifecycle                                                      |
| ------------------------ | ------------------------------------------------ | --------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------- |
| **User Actions**         | Finds repo on GitHub, reads README               | Reviews docs, checks CI/CD badges                   | Clones repo, installs deps, runs Docker     | Browses codebase, reads module structure, finds good first issue | Forks repo, implements fix/feature, pushes branch | Opens PR with description, responds to review, merges                |
| **Touchpoints**          | GitHub repo page, stars, forks count             | docs/ folder, CONTRIBUTING.md, README               | Terminal, npm/pip, Docker Compose           | VS Code, GitHub code search, issue tracker                       | Git CLI, GitHub fork/PR UI                        | GitHub PR page, CI status checks, code review comments               |
| **System Interactions**  | GitHub API (stars, issues, PRs)                  | Docs rendering, badge status API                    | Docker image pull, dependency install       | GitHub file rendering, issue labels                              | GitHub fork, branch, commit status                | CI pipeline (lint, typecheck, test), code owners review              |
| **Emotional State**      | Ã°Å¸ËœÅ  Excited Ã¢â‚¬â€ "This looks promising!" | Ã°Å¸ËœÂ Cautious Ã¢â‚¬â€ "Is this well-maintained?" | Ã°Å¸ËœÅ  Hopeful Ã¢â‚¬â€ "Setup is smooth"  | Ã°Å¸ËœÅ  Engaged Ã¢â‚¬â€ "I understand the structure"            | Ã°Å¸ËœÅ  Productive Ã¢â‚¬â€ "I can contribute!"   | Ã°Å¸ËœÂ Anxious Ã¢â€ â€™ Ã°Å¸ËœÅ  Proud Ã¢â‚¬â€ "Waiting for review" |
| **Emotional Low Points** | Overwhelmed by large codebase                    | Discouraged by missing docs                         | Frustrated if Docker fails or deps conflict | Confused by complex architecture                                 | Impostor syndrome, fear of rejection              | Anxious waiting, frustrated by slow review                           |
| **Pain Points**          | Unclear if project is active                     | No CONTRIBUTING.md, outdated docs                   | Complex local setup, missing env vars       | No "good first issue" labels, unclear code ownership             | No PR template, unclear coding standards          | Slow CI, no response to PR, unclear merge timeline                   |
| **Opportunities**        | Active badges, recent commit visible             | Setup Ã¢â€ â€™ contribution path in < 1 hour        | Docker Compose with one command             | Good first issues with implementation hints                      | PR template with checklist, auto-assign reviewers | CI under 5 min, SLA on PR review < 48h                               |
| **Success Metrics**      | README-to-clone conversion > 20%                 | Setup success rate > 80%                            | Setup time < 15 minutes                     | First issue discovery < 10 min                                   | PR submission rate > 40% of clones                | PR merge rate > 70%, merge time < 48h                                |
| **Drop-off Risk**        | Ã¢Å¡Â Ã¯Â¸Â Medium (many repos compete)          | Ã¢Å¡Â Ã¯Â¸Â High (poor docs = instant abandon)      | Ã¢Å¡Â Ã¯Â¸Â High (setup friction)           | Ã¢Å¡Â Ã¯Â¸Â Medium (complexity)                                  | Ã¢Å¡Â Ã¯Â¸Â Low (invested)                        | Ã¢Å¡Â Ã¯Â¸Â Medium (slow review)                                     |

### 5.2 Key Improvements for This Journey

1. **README optimization**: Badges (build, coverage, license), one-line Docker setup, link to CONTRIBUTING.md
2. **CONTRIBUTING.md**: Step-by-step local setup, coding standards, PR workflow, review process, code of conduct
3. **Good first issues**: Labeled and well-scoped with implementation hints and estimated effort
4. **PR template**: Description template with checklist (tests, docs, lint), auto-assign maintainer
5. **CI speed**: Parallel lint + typecheck + test under 5 minutes, with status badge on PR
6. **Review SLA**: Automated comment if unreviewed after 48 hours, maintainer rotation for responsiveness

---

## 6. Journey 5: Peer/Visitor Content Journey

**Persona:** Priya Sharma Ã¢â‚¬â€ Senior Engineer / Blog Reader
**Primary Goal:** Read quality technical content and evaluate the author
**Entry Sources:** Twitter/X, newsletter, blog post link, peer referral

### 6.1 Journey Table

| Phase                    | 1. Entry                                        | 2. Content Consumption                                              | 3. Exploration                                                 | 4. Connection                                                     | 5. Retention                                              |
| ------------------------ | ----------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------- |
| **User Actions**         | Clicks blog post link from social or newsletter | Reads article, interacts with code snippets, watches demos          | Browses projects, explores skills, checks other posts          | Shares article on social, follows on Twitter/LinkedIn, subscribes | Returns for new posts, engages in comments, refers others |
| **Touchpoints**          | Twitter/X, LinkedIn, email client, direct link  | Blog post page (code blocks, images, TOC, read time)                | Projects page, skills section, blog archive                    | Social share buttons, follow links, newsletter signup             | RSS feed, email newsletter, bookmark, browser history     |
| **System Interactions**  | OG tag rendering, analytics session             | Syntax highlighting, lazy-loaded images, reading progress indicator | Section rendering, project card hover animations               | Share API, mailchimp/substack integration, external social links  | Cookie recognition, email campaign delivery               |
| **Emotional State**      | Ã°Å¸ËœÅ  Curious Ã¢â‚¬â€ "Interesting title"    | Ã°Å¸ËœÅ  Engaged Ã¢â‚¬â€ "Great explanation!"                       | Ã°Å¸ËœÅ  Impressed Ã¢â‚¬â€ "They really know their stuff"      | Ã°Å¸ËœÅ  Generous Ã¢â‚¬â€ "Sharing this with my network"          | Ã°Å¸ËœÅ  Loyal Ã¢â‚¬â€ "I'll keep coming back"            |
| **Emotional Low Points** | Skepticism if title is clickbaity               | Boredom if content is shallow                                       | Disappointment if code doesn't match blog quality              | N/A                                                               | Annoyance if notification frequency is too high           |
| **Pain Points**          | Slow page load kills curiosity                  | No code snippets, poor formatting, no TOC                           | Projects don't match blog quality                              | No social links, no share buttons, no newsletter                  | Inconsistent posting, no notification system              |
| **Opportunities**        | Clean link preview with OG tags                 | Estimated read time, TOC, syntax-highlighted code, embeddable demos | Blog-driven project exploration (related projects under posts) | One-click share, newsletter CTA at article end                    | RSS + email + social cross-promotion, content calendar    |
| **Success Metrics**      | Blog landing speed < 2s                         | Average read time > 5 min                                           | Blog-to-portfolio navigation > 20%                             | Social share rate > 5%, newsletter signup > 3%                    | Return visitor rate > 30%, posts/month > 2                |
| **Drop-off Risk**        | Ã¢Å¡Â Ã¯Â¸Â Medium (distraction from social)    | Ã¢Å¡Â Ã¯Â¸Â High (shallow content)                                  | Ã¢Å¡Â Ã¯Â¸Â Medium (inconsistency)                             | Ã¢Å¡Â Ã¯Â¸Â Low                                                   | Ã¢Å¡Â Ã¯Â¸Â Medium (content drought)                      |

### 6.2 Key Improvements for This Journey

1. **Post quality bar**: Minimum 8-minute read equivalent, original insights, real code examples
2. **Reading experience**: Syntax highlighting, responsive typography, estimated read time, table of contents sticky nav
3. **Cross-linking**: Each blog post links to relevant projects, skills, and related posts
4. **Distribution**: Twitter/X threads for each post, LinkedIn article cross-post, email newsletter
5. **Community**: Comments section (or forward to Twitter), subscriber count as social proof

---

## 7. Cross-Persona Journey Overlap Matrix

| Phase                        | Recruiter                   | Client                           | Admin                    | Contributor            | Peer                             |
| ---------------------------- | --------------------------- | -------------------------------- | ------------------------ | ---------------------- | -------------------------------- |
| **Entry (0Ã¢â‚¬â€œ5s)**      | Ã¢Å“â€¦ Fast load critical  | Ã¢Å“â€¦ Fast load critical       | Ã¢Å“â€¦ Login speed      | Ã¢Å“â€¦ Repo load      | Ã¢Å“â€¦ Page load                |
| **Hero/Core (5Ã¢â‚¬â€œ15s)** | Ã¢Å“â€¦ Role + availability | Ã¢Å“â€¦ Services + credibility   | Ã¢Å“â€¦ Dashboard KPIs   | Ã¢Å“â€¦ README quality | Ã¢Å“â€¦ Content quality          |
| **Deep Engagement**          | Project evaluation          | Case study analysis              | CMS editing              | Code exploration       | Blog reading                     |
| **Trust Signals**            | Testimonials, GitHub        | Case study results, testimonials | System health, analytics | CI/CD badges, docs     | Author credibility, post quality |
| **Conversion Action**        | Resume download             | Contact form                     | Content publish          | PR submit              | Social share                     |
| **Post-Conversion**          | ATS entry                   | Email follow-up                  | Lead management          | PR merge cycle         | Newsletter, return               |

### 7.1 Shared Pain Points Across All Journeys

| Shared Pain Point     | Affected Personas       | Resolution                                     |
| --------------------- | ----------------------- | ---------------------------------------------- |
| Slow initial load     | Recruiter, Client, Peer | Performance budget, static generation          |
| Unclear next action   | Recruiter, Client       | Above-fold CTAs, clear navigation              |
| Missing social proof  | Client, Recruiter       | Testimonial section, social feed widget        |
| Content staleness     | All visitors            | Admin CMS Ã¢â€ â€™ automatic freshness updates |
| Broken external links | All visitors            | Automated link checker in CI/CD                |

---

## 8. Prioritized Improvement Roadmap

Based on cross-journey analysis, the following improvements deliver the most impact across multiple personas:

| Priority | Improvement                                                 | Personas Impacted       | Effort | Impact                          |
| -------- | ----------------------------------------------------------- | ----------------------- | ------ | ------------------------------- |
| **P0**   | Sub-1.5s LCP performance budget                             | Recruiter, Client, Peer | Medium | Critical (prevents bounce)      |
| **P0**   | Above-the-fold hero with role/CTA                           | Recruiter, Client       | Low    | High (reduces time-to-decision) |
| **P0**   | One-click resume download                                   | Recruiter               | Low    | High (primary conversion)       |
| **P0**   | Case study template (ProblemÃ¢â€ â€™ApproachÃ¢â€ â€™Result) | Client                  | Medium | High (trust + conversion)       |
| **P1**   | Social proof section (testimonials, client logos)           | Client, Recruiter       | Medium | High (trust building)           |
| **P1**   | Admin auto-save + revision history                          | Admin                   | Medium | High (content confidence)       |
| **P1**   | Lead management pipeline + email notifications              | Admin                   | Medium | High (response time)            |
| **P2**   | Good first issues for OSS contributors                      | Contributor             | Low    | Medium (community growth)       |
| **P2**   | Blog reading experience (TOC, code blocks, read time)       | Peer                    | Low    | Medium (engagement)             |
| **P2**   | Docker one-command setup                                    | Contributor             | Medium | High (setup success rate)       |

---

## 9. Validation & Next Steps

### 9.1 Pre-Launch Validation

- **Recruiter journey**: A/B test hero variants with 5 real recruiters using session recording
- **Client journey**: Validate case study format with 3 startup founders via user interviews
- **Admin journey**: Time trial Ã¢â‚¬â€ measure content update speed from login to publish
- **Contributor journey**: Onboarding test with 5 external developers (time-to-first-PR)

### 9.2 Post-Launch Measurement

- Deploy analytics events mapped to every journey phase metric
- Monthly journey audit comparing metrics against targets
- Quarterly persona refresh based on analytics data and user feedback

### 9.3 Tooling

- **Session recordings**: Hotjar/PostHog for visual journey analysis
- **Funnel analysis**: Track drop-off rates at each journey phase
- **Heatmaps**: Identify where users click (or don't) in critical sections
- **Surveys**: Post-contact and post-subscribe NPS surveys

---

## 10. Revision History

| Version | Date         | Author            | Changes                                                                                                                                                                                                                                                                     |
| ------- | ------------ | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1.0** | **Jul 2026** | **Product Owner** | **Initial release. 5 persona journey maps (Recruiter, Client, Admin, Contributor, Peer) with phase-by-phase tables, emotional curves, pain points, opportunities, success metrics. Cross-persona overlap matrix. Prioritized improvement roadmap. Validation methodology.** |

---

_Document Version: 1.0 Ã¢â‚¬â€ User Journey Maps_

## Cross-References

- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system
