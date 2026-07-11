# Master Test Plan

> **Document:** `TestPlan.md` | **Version:** 2.0 | **Last Updated:** July 2026  
> **Status:** ✅ Active | **Owner:** QA Lead

## 1. Overview
This Master Test Plan outlines the testing scope, approach, resources, and schedule for the Ultimate Portfolio project. It serves as the template for release-level and feature-level test plans.

## 2. Test Plan Template

Every release or feature requiring QA must produce a test plan using this template:

```markdown
# Test Plan: [Release/Feature Name]
- **Version**: [SemVer]
- **Owner**: [Name]
- **Scope**: [Brief description of what's being tested]
- **Timeline**: [Start date] → [End date]
- **Risk Level**: [High / Medium / Low]

## In-Scope
- [List of features, components, and integrations to test]

## Out-of-Scope
- [List of features explicitly excluded from this test cycle]

## Test Environments
- [Environment details: URLs, database, configuration]

## Entry Criteria
- [Conditions that must be met before testing starts]

## Exit Criteria
- [Conditions that must be met for testing to be considered complete]

## Test Summary
| Test Type | Test Count | Passed | Failed | Blocked | Coverage |
|-----------|-----------|--------|--------|---------|----------|
| Unit | | | | | |
| Integration | | | | | |
| E2E | | | | | |
| Performance | | | | | |
| Security | | | | | |
| Accessibility | | | | | |

## Known Issues
- [List of known bugs, limitations, and deferred items]

## Sign-Off
| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Tech Lead | | | |
| Product Owner | | | |
```

## 3. Current Project Scope

### 3.1 In-Scope
- **Web Application (`apps/web`):** Next.js 14 App Router public portfolio and admin dashboard. React Three Fiber 3D components, Radix UI accessibility, Framer Motion animations, GSAP scroll effects.
- **API Service (`apps/api`):** NestJS REST API, authentication (JWT + OAuth), authorization guards (RBAC), Prisma schema migrations, caching (`@CacheTTL`), rate limiting (`ThrottlerGuard`), audit logging.
- **AI Service (`apps/ai`):** FastAPI endpoints, LangChain chains, RAG retrieval (pgvector), streaming responses.
- **Shared Packages:** `@portfolio/shared` (Zod schemas, TypeScript types), `@portfolio/ui` (React components), `@portfolio/config` (ESLint, TypeScript configs).

### 3.2 Out-of-Scope
- Third-party managed services uptime (Supabase, Vercel infrastructure, GitHub Actions).
- Load testing beyond anticipated standard traffic (covered separately in PerformanceTesting.md).
- Manual exploratory testing (covered in QA process, not in this test plan).

## 4. Test Types and Execution Approach

### 4.1 Unit Testing
- **Web (Vitest):** Hooks, utilities, Zustand stores, Zod schema validation. Run `npm test` from `apps/web`.
- **API (Jest):** Service methods, DTO validation, guard logic. Run `npm test` from `apps/api`.
- **AI (pytest):** Python utility functions, LangChain chain logic, mock LLM calls. Run `pytest` from `apps/ai`.

### 4.2 Integration Testing
- **API to Database:** Dedicated test database (Supabase test branch). Prisma queries against real Postgres.
- **Web to API:** MSW (Mock Service Worker) intercepts fetch requests. Simulates API responses.
- **Cross-service:** NestJS → FastAPI integration via HTTP calls (mocked for unit tests, real for integration).

### 4.3 End-to-End (E2E) Testing
- **Tool:** Playwright (see E2EStrategy.md for full details).
- **Critical paths:** Homepage load, project detail, blog, contact form, admin CRUD, auth flow.
- **Visual regression:** Playwright screenshot comparison for key pages.

### 4.4 Performance Testing
- **Lighthouse CI:** Runs on every PR. Budget enforcement (LCP < 2.5s, CLS < 0.1, etc.).
- **k6:** Weekly load tests on staging for critical endpoints.
- **Bundle analysis:** `@next/bundle-analyzer` on nightly builds.

### 4.5 Security Testing
- **SAST:** CodeQL on every PR.
- **Dependency scan:** Dependabot + `npm audit` on every PR.
- **Secret scan:** Pre-commit hooks with git-secrets.

### 4.6 Accessibility Testing
- **Automated:** axe-core in Vitest (component level) and Playwright (page level).
- **Manual:** Keyboard navigation audit, screen reader test (NVDA/VoiceOver).
- **Target:** WCAG 2.1 AA, zero violations in CI.

## 5. Entry Criteria

Testing for a release begins when ALL of the following are true:
- [ ] All feature code is merged to `main` (feature freeze).
- [ ] All unit tests pass in CI (`npm test` for web, api, ai).
- [ ] No P0 or P1 bugs open against the release scope.
- [ ] Code review is complete (no open PRs targeting the release).
- [ ] Dev/test environment is provisioned and accessible.
- [ ] Test data is seeded (database with representative sample data).
- [ ] CI pipeline is green on `main`.

## 6. Exit Criteria

A release is considered "Done" when ALL of the following are true:
- [ ] All critical (P0) tests pass.
- [ ] No P0 or P1 bugs open against the release.
- [ ] P2 bugs are triaged; none deemed release-blocking by product owner.
- [ ] Accessibility scan passes (zero violations, WCAG 2.1 AA).
- [ ] Lighthouse scores ≥ 90 for all categories.
- [ ] Security scan passes (no critical/high findings).
- [ ] E2E critical paths pass (100% of P0 journeys).
- [ ] Performance budgets are met.
- [ ] Documentation is updated (API docs, README, changelog).

## 7. Test Deliverables

| Deliverable | Format | Owner | Due Date |
|-------------|--------|-------|----------|
| Test Plan | Markdown (this document) | QA Lead | Before test cycle |
| Unit Test Results | CI log + coverage report | Dev | Every PR |
| Integration Test Results | CI log | Dev | Every PR |
| E2E Test Results | Playwright HTML report | QA Lead | Before release |
| Performance Report | Lighthouse JSON + k6 report | Performance Lead | Before release |
| Security Scan Report | CodeQL + Dependabot report | Security Lead | Before release |
| Accessibility Report | axe-core JSON report | QA Lead | Before release |
| Bug Report | GitHub Issues | QA Lead | Continuous |
| Release Sign-Off | Markdown checklist | All leads | At release |

## 8. Defect Management

### 8.1 Severity Levels
| Severity | Definition | Response SLA | Fix SLA |
|----------|-----------|-------------|---------|
| **S0 (Critical)** | System down, data loss, security breach | 15 min | 4 hours |
| **S1 (High)** | Major feature broken, no workaround | 1 hour | 24 hours |
| **S2 (Medium)** | Feature impaired, workaround exists | 4 hours | 48 hours |
| **S3 (Low)** | Cosmetic issue, minor text error | Next business day | Next release |

### 8.2 Bug Triage Process
1. Bugs filed in GitHub Issues with severity, steps to reproduce, and environment.
2. Daily triage meeting: prioritize by severity + frequency + user impact.
3. S0/S1 bugs block release; S2/S3 are prioritized by product owner.
4. Regression bugs are prioritized above new feature bugs.

## 9. Test Environment Strategy

### 9.1 Local Development
- Developers run tests against local Docker containers or Supabase local development stack.
- Database seeded with development fixtures via `npm run prisma:seed`.

### 9.2 CI (Pull Request)
- Supabase test branch (ephemeral) provisioned per PR.
- Environment variables injected via GitHub Actions secrets.
- Preview deployment via Vercel for E2E tests.

### 9.3 Staging
- Fully integrated environment with staging database (production-like data volume).
- Used for pre-release validation: Playwright, k6, a11y, manual QA.
- URL: `https://staging.portfolio.dev`

### 9.4 Production
- Post-deployment smoke tests (read-only, critical paths only).
- RUM data collection active.
- No destructive testing in production.

## 10. Risk & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Flaky E2E tests | Medium | High | Retry mechanism, quarantined flaky tests, weekly review |
| Test environment availability | Low | High | Infrastructure as Code, automated provisioning |
| Insufficient test coverage | Medium | Medium | Coverage targets enforced in CI, quarterly coverage review |
| Performance regression undetected | Low | High | Lighthouse CI on every PR, k6 weekly |
