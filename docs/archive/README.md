# Documentation Archive

> **Unmaintained history.** Current truth lives in the root [`AGENTS.md`](../../AGENTS.md)
> docs map and the live documents it lists.

This directory holds everything that predates the 2.0 architecture (November 2026)
or was explicitly superseded. It is kept for provenance — the decisions, trade-offs
and false starts that led to the current system — not as a description of the code.

The archive keeps the original relative layout, so `docs/11-security/X.md` became
`docs/archive/11-security/X.md`. Links between archived documents therefore still
resolve. During the 2026-11-19 move every relative link was rewritten to its new
location; the 166 references to documents that never existed in this repository
were reduced to their label text. Six files damaged by a lossy encoding pass were
repaired by reconstructing `U+FFFD` runs from context (see the note at the top of
`14-observability/ANALYTICS-IMPLEMENTATION.md` and
`07-frontend/DESIGN-SYSTEM-EXTENDED.md`), and 85 files of double-encoded UTF-8
were round-tripped back to the intended characters.

On 2026-11-20 a second pass reconstructed the remaining glyph losses in those two
documents: status marks, arrows, multiplication signs, and section/numeric range
separators that an earlier non-Unicode conversion had left as `?` or `§`. As with
the first pass, the replacements are contextual inference from the surviving
tables, not recovered bytes; the documents' content, decisions, and claims are
unchanged. This is the only kind of edit the archive accepts — see the rule in
root `AGENTS.md`.

Do not cite these documents as sources of truth, and do not link to them from
maintained documentation.

## Superseded topics

Where several archived documents cover the same ground, the table names the one
worth reading first. The others carry a "Superseded" banner.

| Topic                      | Start here                                    | Also archived                                                                                   |
| -------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Code review                | `29-checklists/CODE-REVIEW-CHECKLIST.md`      | `13-testing/CODE-REVIEW-CHECKLIST.md`, `24-development/CODE-REVIEW-STANDARDS.md`                |
| Incident response          | `31-playbooks/INCIDENT-RESPONSE.md`           | `30-runbooks/INCIDENT-RESPONSE.md`, `30-runbooks/INCIDENT-MANAGEMENT.md`                        |
| CI/CD                      | `12-devops/CI-CD-PIPELINE-STRATEGY.md`        | `CI-CD-OVERVIEW.md`, `CI-CD-PIPELINE.md`, `CI-CD-IMPLEMENTATION-GUIDE.md` in the same directory |
| Monitoring & observability | `14-observability/OBSERVABILITY.md`           | `MONITORING.md`, `MONITORING-DASHBOARDS.md`, `ALERTING.md`, `METRICS.md`                        |
| Privacy                    | `11-security/PRIVACY-POLICY.md` (public text) | `11-security/PRIVACY.md` (internal framework)                                                   |
| Testing strategy           | `13-testing/TESTING-ARCHITECTURE.md`          | `13-testing/E2E-TESTING.md`, `FRONTEND-TESTING.md`, `PERFORMANCE-TESTING.md`                    |
| Analytics                  | `14-observability/ANALYTICS-ARCHITECTURE.md`  | `14-observability/ANALYTICS-IMPLEMENTATION.md`                                                  |
| Design system              | `04-design/DESIGN-SYSTEM.md`                  | `07-frontend/DESIGN-SYSTEM-EXTENDED.md`, `04-design/DESIGN-TOKENS.md`                           |
| Technical debt             | `21-operations/TECHNICAL-DEBT.md`             | —                                                                                               |

## What is in each directory

| Directory               | Contents                                                 |
| ----------------------- | -------------------------------------------------------- |
| `01-product/`           | Product vision, feature inventory (4,000+ lines)         |
| `02-strategy/`          | Competitive analysis, product strategy                   |
| `03-requirements/`      | Non-functional requirements, quality attribute scenarios |
| `04-design/`            | Design system, tokens, wireframes, screen flows, UI/UX   |
| `05-architecture/`      | Architecture principles, technology radar                |
| `06-backend/`           | Feature flags, event architecture notes                  |
| `07-frontend/`          | Component library, implementation plan, neumorphism      |
| `09-database/`          | Data dictionary, schema, retention                       |
| `10-api/`               | API standards, data contracts, error catalog             |
| `11-security/`          | Security architecture, compliance mappings, policies     |
| `12-devops/`            | CI/CD, infrastructure, deployment, cost                  |
| `13-testing/`           | Testing architecture and per-layer strategies            |
| `14-observability/`     | Monitoring, observability, analytics                     |
| `15-performance/`       | Performance budgets and benchmarks                       |
| `16-accessibility/`     | Accessibility architecture and WCAG statement            |
| `17-seo/`               | SEO architecture and checklists                          |
| `19-admin/`             | Admin dashboard and user manual                          |
| `20-cms/`               | CMS, content model, image management, sandbox IDE        |
| `21-operations/`        | Release management, dependency inventory, technical debt |
| `22-release/`           | Release, hotfix, versioning                              |
| `23-governance/`        | Constitution, coding standards, git standards            |
| `24-development/`       | Onboarding, playbook, naming, code review                |
| `26-reference/`         | Cross-reference index, glossary, URL matrix              |
| `28-templates/`         | RFC, postmortem, incident comms, release notes           |
| `29-checklists/`        | Code review, accessibility, performance                  |
| `30-runbooks/`          | Operational runbooks                                     |
| `31-playbooks/`         | Incident, rollback, severity                             |
| `32-disaster-recovery/` | Backup, business continuity, failover                    |
| `33-onboarding/`        | Contributor onboarding                                   |
| `34-contributing/`      | Contributing, security policy, code of conduct, license  |
| `35-quality/`           | Documentation standards, DocOps plan, quality metrics    |
