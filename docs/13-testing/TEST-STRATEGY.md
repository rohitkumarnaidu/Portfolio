# Test Strategy Master Plan

> **Document:** `test-strategy-master-plan.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** Ã¢Å“â€¦ Active | **Owner:** QA Lead | **Review Cadence:** Monthly
> **Classification:** Enterprise Architecture | **Testing Stack:** 8 tools | **Test Levels:** 8

> **Note:** This document covers test strategy. For detailed testing architecture, see [TESTING-ARCHITECTURE.md](./TESTING-ARCHITECTURE.md).

---

## Table of Contents

1. [Testing Principles](#1-testing-principles)
2. [Test Pyramid & Coverage Targets](#2-test-pyramid--coverage-targets)
3. [What to Test Per Layer](#3-what-to-test-per-layer)
4. [Test Infrastructure](#4-test-infrastructure)
5. [CI Integration](#5-ci-integration)
6. [Test Naming & Organization](#6-test-naming--organization)
7. [Mocking Strategy](#7-mocking-strategy)
8. [Test Data Strategy](#8-test-data-strategy)
9. [Quality Gates & Thresholds](#9-quality-gates--thresholds)
10. [Tools & Configuration](#10-tools--configuration)
11. [Roadmap](#11-roadmap)

---

## 1. Testing Principles

### 1.1 Tests Are First-Class Citizens

Test code is product code. It undergoes the same review process, follows the same coding standards, and lives alongside the source code it tests. Skipping tests to ship faster is an unacceptable tradeoff Ã¢â‚¬â€ tests are how we ship fast without breaking things.

- Every PR must include tests for new functionality or changes to existing functionality.
- Test code is reviewed with the same rigor as production code.
- Test maintainability is a first-class concern: refactor brittle tests, eliminate duplication, and keep test suites fast.

### 1.2 The Testing Trophy (Not the Pyramid)

This project follows the **Testing Trophy** model popularized by Kent C. Dodds, adapted for a full-stack NestJS + Next.js architecture:

```
        Ã¢â€¢Â±  E2E  Ã¢â€¢Â²             Ã¢â€ Â few, high-value user journeys
       Ã¢â€¢Â±Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€¢Â²
      Ã¢â€¢Â± Integration Ã¢â€¢Â²         Ã¢â€ Â most investment: service + DB + controller
     Ã¢â€¢Â±Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€¢Â²
    Ã¢â€¢Â±   Unit Tests     Ã¢â€¢Â²      Ã¢â€ Â pure logic, utilities, hooks
   Ã¢â€¢Â±Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€¢Â²
  Ã¢â€¢Â±  Static Analysis       Ã¢â€¢Â²  Ã¢â€ Â TypeScript strict, ESLint (every file, every commit)
 Ã¢â€¢Â±Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€¢Â²
```

- **Static Analysis** catches type errors, unused imports, and code quality issues at write time. Zero-cost signal.
- **Unit Tests** validate pure logic: utility functions, data transformations, validation logic. Fast (ms), highly parallelizable.
- **Integration Tests** are where we invest the most. They verify that services, controllers, databases, and middleware work together correctly. They catch the bugs that unit tests miss and that E2E tests are too slow to surface.
- **E2E Tests** cover the critical user journeys that must work end-to-end. Few in number, high in value. They are the safety net, not the primary test layer.

### 1.3 Tests Must Be Deterministic

Flaky tests erode trust and slow development. Every test must produce the same result on every run.

- **No shared mutable state** between tests. Each test sets up its own data and cleans up after itself.
- **Seeded randomness.** If a test uses random data, the random seed is fixed so results are reproducible.
- **No network calls in unit tests.** External dependencies (APIs, databases, caches) are mocked or stubbed at the unit level.
- **Test ordering independence.** Tests can run in any order, in parallel, or sequentially Ã¢â‚¬â€ the result is always the same.
- **Time-aware testing.** Uses fake timers (`vi.useFakeTimers` / `jest.useFakeTimers`) instead of `setTimeout` or `sleep` in tests.
- **CI retries for E2E only.** Playwright may retry flaky browser tests (max 2 retries in CI). Unit and integration tests must pass on the first try Ã¢â‚¬â€ retries mask real problems.

**Flaky test protocol:**

1. When a flaky test is identified, file a P1 bug with the test name and failure pattern.
2. The test is quarantined (skipped with a `TODO` comment referencing the bug).
3. The root cause is fixed within one sprint.
4. The test is un-skipped only after the fix is verified.

### 1.4 Tests Run in CI for Every PR

Every pull request triggers the full test suite. Results are visible in the PR before merge.

- The full CI pipeline must pass before merge (barring explicitly documented exceptions).
- Test execution time is monitored. If the suite exceeds 10 minutes, optimization is required.
- Failed tests block the merge. `continue-on-error` is only acceptable during a transitional period (documented in the CI config with an expiration date).

### 1.5 Coverage Is a Guide, Not a Target

Coverage percentages are useful indicators of untested code, but they are not goals in themselves.

- 100% coverage does not mean 100% confidence. A test that asserts nothing still counts as "covered."
- Focus on testing **behavior and outcomes**, not implementation details.
- Coverage should guide you to untested paths, not constrain you to hit arbitrary numbers.
- Mutation testing (future) will replace line coverage as the quality metric for test effectiveness.

### 1.6 Summary Table

| #   | Principle         | Description                                            | Enforcement                 |
| --- | ----------------- | ------------------------------------------------------ | --------------------------- |
| P1  | First-class tests | Tests reviewed like production code, mandatory for PRs | Code review checklist       |
| P2  | Trophy model      | Invest most in integration tests                       | Test distribution targets   |
| P3  | Deterministic     | No flaky tests, no shared state, no network in units   | CI pass/fail, flaky tracker |
| P4  | CI on every PR    | Full suite runs, failures block merge                  | GitHub branch protection    |
| P5  | Coverage as guide | Behavior over numbers, meaningful assertions           | Coverage reports, not gates |

---

### Test Pyramid

```mermaid
graph LR
    subgraph Static[Static Analysis]
        TS[TypeScript Strict] --- ESLint
    end

    subgraph Unit[Unit Tests]
        API_Jest["API: Jest + ts-jest<br/>80% line / 70% branch"]
        Web_Vitest["Web: Vitest + RTL<br/>80% line / 70% branch"]
    end

    subgraph Integration[Integration Tests]
        API_Super["API: Jest + Supertest<br/>60% line"]
        Comp["Web: Component Tests<br/>70% coverage"]
    end

    subgraph E2E[E2E Tests]
        PW["Playwright<br/>40% critical paths"]
        A11y["a11y: axe-core<br/>WCAG 2.2 AA"]
        VRT["Visual Regression<br/>10+ key screens"]
    end

    E2E --> Integration --> Unit --> Static
```

---

## 2. Test Pyramid & Coverage Targets

### 2.1 Current State Assessment

This is an honest assessment of where the project stands today, based on the actual test files in the repository.

| Dimension                   | Current State                                            |
| --------------------------- | -------------------------------------------------------- |
| **Total test files (API)**  | 3 service specs + 1 e2e spec                             |
| **Total test files (Web)**  | 2 unit tests + 2 Playwright specs                        |
| **API services with tests** | 3 / 27 (`auth.service`, `blog.service`, `leads.service`) |
| **Test DB setup**           | Ad-hoc via `DATABASE_URL` check (`hasDb` flag)           |
| **CI test execution**       | `continue-on-error: true` for web tests                  |
| **Coverage thresholds**     | None configured                                          |
| **Visual regression**       | 0%                                                       |
| **Performance tests**       | 0%                                                       |
| **a11y tests**              | 1 Playwright spec (basic)                                |

**The gap is significant but expected for a project transitioning from rapid prototyping to production readiness. This plan closes that gap over 6 weeks.**

### 2.2 Target Coverage by Layer

| Layer                 | Technology                | Target Coverage         | Current Coverage       | Priority           |
| --------------------- | ------------------------- | ----------------------- | ---------------------- | ------------------ |
| **Static Analysis**   | TypeScript strict, ESLint | 100% codebase           | ~100% (ts strict)      | Ã¢Å“â€¦ Done       |
| **Unit (API)**        | Jest + ts-jest            | 80% line, 70% branch    | ~5%                    | Ã°Å¸â€Â´ Week 2    |
| **Unit (Web)**        | Vitest + Testing Library  | 80% line, 70% branch    | ~3%                    | Ã°Å¸â€Â´ Week 3    |
| **Integration**       | Jest + Supertest          | 60% line                | ~15% (e2e covers some) | Ã°Å¸Å¸Â¡ Week 2    |
| **E2E (Web)**         | Playwright                | 40% critical paths      | ~5%                    | Ã°Å¸Å¸Â¡ Week 4    |
| **E2E (API)**         | Jest + Supertest          | 30% critical paths      | ~15%                   | Ã°Å¸Å¸Â¡ Week 2    |
| **Visual Regression** | Playwright Screenshot     | Key pages (10+ screens) | 0%                     | Ã°Å¸â€Âµ Week 5    |
| **Accessibility**     | axe-core + Playwright     | WCAG 2.2 AA, all pages  | ~5%                    | Ã°Å¸â€Âµ Week 5    |
| **Performance**       | k6 / Lighthouse CI        | Budget compliance       | 0%                     | Ã°Å¸Å¸Â£ Week 6    |
| **Security**          | CodeQL, npm audit         | All critical/high       | Partial                | Ã°Å¸Å¸Â£ Quarter 3 |

> **Legend:** Ã¢Å“â€¦ Done | Ã°Å¸â€Â´ Immediate (Week 1-2) | Ã°Å¸Å¸Â¡ Short-term (Week 3-4) | Ã°Å¸â€Âµ Medium-term (Week 5-6) | Ã°Å¸Å¸Â£ Future (Quarter 3)

### 2.3 Test Distribution Targets

The ideal distribution of tests across layers for a full-stack application of this size:

| Layer                | Target Count        | Current Count  | Ratio   |
| -------------------- | ------------------- | -------------- | ------- |
| Static analysis      | N/A (tool-enforced) | N/A            | Ã¢â‚¬â€ |
| Unit (API services)  | 150+                | ~50 (3 files)  | 3%      |
| Unit (Web utilities) | 50+                 | ~0             | 0%      |
| Unit (Web hooks)     | 80+                 | ~20            | 25%     |
| Component tests      | 80+                 | ~0             | 0%      |
| Integration (API)    | 100+                | ~40 (e2e spec) | 40%     |
| E2E (Playwright)     | 25+                 | ~8 (2 files)   | 32%     |
| Visual regression    | 15+                 | 0              | 0%      |
| a11y                 | 10+                 | ~4             | 40%     |
| Performance          | 5+                  | 0              | 0%      |
| **Total**            | **500+**            | **~120**       | **24%** |

### 2.4 Coverage Evolution Roadmap

```
Week 0:  ~5%  line,  ~3% branch  Ã¢â€ Â current
Week 2:  40%  line,  30% branch  Ã¢â€ Â service tests
Week 4:  60%  line,  50% branch  Ã¢â€ Â component + integration
Week 6:  75%  line,  65% branch  Ã¢â€ Â all planned tests
Q3:      90%+ line,  80%+ branch Ã¢â€ Â long tail + mutation
```

The goal is sustainable coverage growth. Rushing to 90% in one sprint would produce shallow tests. We grow coverage methodically, prioritizing critical paths and core business logic.

---

## 3. What to Test Per Layer

### 3.1 Static Analysis (All Files, Every Commit)

**Tool:** TypeScript strict mode + ESLint
**Location:** Pre-commit hook (husky + lint-staged) + CI

**Checked automatically:**

- Type errors (strict mode: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `strictNullChecks`)
- Unused imports and variables (`noUnusedLocals`, `noUnusedParameters`)
- Code style and formatting (Prettier + ESLint)
- Import ordering, naming conventions
- Accessibility lint rules (`jsx-a11y`) for React components

**What does NOT need a separate test:**

- Anything that TypeScript catches at compile time (wrong types, missing properties, null checks)

### 3.2 Unit Tests Ã¢â‚¬â€ API Services

**Tool:** Jest + ts-jest
**Location:** `apps/api/src/modules/*/*.service.spec.ts`
**Scope:** Every NestJS service in isolation

#### What to test in each service:

**CRUD operations (every entity):**

- `create()` with valid data returns the created entity
- `create()` with invalid/missing data throws appropriate error
- `create()` enforces unique constraints
- `findAll()` / `findMany()` returns paginated results
- `findAll()` applies correct filters and sorting
- `findById()` returns the entity when it exists
- `findById()` throws `NotFoundException` when it does not
- `update()` modifies the entity correctly
- `update()` rejects invalid update data
- `remove()` deletes the entity
- `remove()` throws `NotFoundException` for nonexistent IDs

**Business logic (entity-specific):**

- Auth service: password hashing, token generation, token refresh, role verification
- Blog service: published/unpublished filtering, slug generation, category filtering
- Leads service: spam detection, rate limiting, status transitions
- Media service: file validation, upload handling, access control
- Projects service: featured filtering, pagination, tech stack filtering
- Skills service: category grouping, proficiency ordering
- Analytics service: event tracking, aggregation queries
- Notifications service: delivery logic, template rendering
- Feature flags: evaluation logic, user targeting, rollout percentages

**Cross-cutting concerns:**

- Caching decorators work correctly (cache hit returns cached data, cache miss calls service)
- Audit logging fires on mutation endpoints
- Rate limiting doesn't block legitimate requests
- Validation pipes reject malformed input

#### Services to test (ordered by priority):

| Priority | Service                   | File           | Tests Needed                               |
| -------- | ------------------------- | -------------- | ------------------------------------------ |
| P0       | `auth.service.ts`         | Ã¢Å“â€¦ Exists | ~15 tests (token, hashing, refresh, roles) |
| P0       | `leads.service.ts`        | Ã¢Å“â€¦ Exists | ~10 tests (CRUD + spam + status)           |
| P0       | `projects.service.ts`     | Ã¢ÂÅ’ Missing  | ~12 tests (CRUD + filter + pagination)     |
| P0       | `blog.service.ts`         | Ã¢Å“â€¦ Exists | ~12 tests (CRUD + published + categories)  |
| P1       | `skills.service.ts`       | Ã¢ÂÅ’ Missing  | ~8 tests (CRUD + category)                 |
| P1       | `sections.service.ts`     | Ã¢ÂÅ’ Missing  | ~8 tests (CRUD + ordering)                 |
| P1       | `testimonials.service.ts` | Ã¢ÂÅ’ Missing  | ~8 tests (CRUD + featured)                 |
| P1       | `experiences.service.ts`  | Ã¢ÂÅ’ Missing  | ~8 tests (CRUD + ordering)                 |
| P1       | `services.service.ts`     | Ã¢ÂÅ’ Missing  | ~8 tests (CRUD)                            |
| P1       | `faqs.service.ts`         | Ã¢ÂÅ’ Missing  | ~8 tests (CRUD)                            |
| P2       | Remaining 17 services     | Ã¢ÂÅ’ Missing  | ~4-8 tests each (basic CRUD)               |

### 3.3 Unit Tests Ã¢â‚¬â€ Web Utilities

**Tool:** Vitest
**Location:** `apps/web/src/test/__tests__/*.test.ts`
**Scope:** Pure utility functions, data transformations, formatters

**What to test:**

- **Date formatting:** `formatDate()`, `timeAgo()`, `formatDuration()` Ã¢â‚¬â€ locale, edge cases, invalid inputs
- **String utilities:** `slugify()`, `truncate()`, `capitalize()` Ã¢â‚¬â€ special characters, Unicode, empty strings
- **Number formatting:** `formatNumber()`, `formatCurrency()` Ã¢â‚¬â€ large numbers, decimals, edge cases
- **Array utilities:** `groupBy()`, `sortBy()`, `chunk()` Ã¢â‚¬â€ empty arrays, single elements, duplicates
- **Validation helpers:** email validation, URL validation, phone formatting Ã¢â‚¬â€ valid, invalid, edge cases
- **Color utilities:** hex-to-rgb, contrast ratio, lighten/darken Ã¢â‚¬â€ valid hex, shorthand hex, named colors

### 3.4 Unit Tests Ã¢â‚¬â€ React Hooks

**Tool:** Vitest + `@testing-library/react` (renderHook)
**Location:** `apps/web/src/test/__tests__/hooks.test.tsx`
**Scope:** All custom React Query hooks in `src/lib/hooks/`

#### Every hook needs 3 test cases:

| State       | What to Test                                           | Example                                                                              |
| ----------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| **Loading** | Returns `isLoading: true` initially, data is undefined | `renderHook(() => useProjects())` Ã¢â€ â€™ `result.current.isLoading === true`       |
| **Success** | Returns data after fetch resolves                      | Mock fetch Ã¢â€ â€™ `waitFor(() => expect(result.current.isSuccess).toBe(true))`     |
| **Error**   | Returns error after fetch rejects                      | Mock fetch error Ã¢â€ â€™ `waitFor(() => expect(result.current.isError).toBe(true))` |

#### Hooks to test (27 total):

| Priority | Hook                                          | Tests Needed                                         | Has Tests? |
| -------- | --------------------------------------------- | ---------------------------------------------------- | ---------- |
| P0       | `useProjects`                                 | 3 (loading, success, error)                          | Ã¢Å“â€¦    |
| P0       | `useBlogPosts`                                | 3                                                    | Ã¢Å“â€¦    |
| P0       | `useAuth`                                     | 6 (login, register, logout, refresh, profile, error) | Ã¢ÂÅ’      |
| P0       | `useLeads`                                    | 3                                                    | Ã¢ÂÅ’      |
| P1       | `useSkills`, `useSections`, `useTestimonials` | 3 each                                               | Ã¢ÂÅ’      |
| P1       | `useExperiences`, `useServices`, `useFAQs`    | 3 each                                               | Ã¢ÂÅ’      |
| P1       | `useCaseStudies`, `useMedia`, `useChat`       | 3 each                                               | Ã¢ÂÅ’      |
| P2       | Remaining 16 hooks                            | 3 each                                               | Ã¢ÂÅ’      |

> **Note:** The existing `hooks.test.tsx` tests `useProjects` and `useBlogPosts` with loading, success, and error states. These serve as the template for all remaining hooks.

### 3.5 Component Tests (Integration Level)

**Tool:** Vitest + `@testing-library/react` + `jsdom`
**Location:** `apps/web/src/test/__tests__/components/*.test.tsx`
**Scope:** UI components

#### What to test for each component:

**Render states:**

- Default render (no props, empty data)
- With data (variants, different states)
- Loading/skeleton state
- Empty state (no results, no items)
- Error state (if applicable)
- Edge cases (very long text, missing optional props)

**Interactions:**

- Click handlers fire correctly
- Form submission works
- Keyboard navigation (Tab, Enter, Escape)
- Focus management (focus trap, auto-focus)
- State changes after interaction (open/close, selected/unselected)

**Accessibility (basic):**

- Roles are correct (`button`, `navigation`, `dialog`, `list`)
- Labels are present and meaningful
- ARIA attributes are correct
- Focus order is logical

#### Top 10 UI components to test first:

| Priority | Component      | Tests Needed | Key Concerns                                              |
| -------- | -------------- | ------------ | --------------------------------------------------------- |
| P0       | `Button`       | 5            | Variants, disabled, loading, click, keyboard              |
| P0       | `Card`         | 4            | Render, with children, with image, without image          |
| P0       | `Input`        | 5            | Value, placeholder, disabled, error state, onChange       |
| P0       | `Navbar`       | 4            | Desktop render, mobile menu, active link, keyboard nav    |
| P1       | `Footer`       | 3            | Render, links render, responsive                          |
| P1       | `ThemeToggle`  | 3            | Click toggles, initial state, persists                    |
| P1       | `Tooltip`      | 4            | Show on hover, hide on leave, keyboard focus, positioning |
| P1       | `CopyButton`   | 3            | Click copies, tooltip shows "Copied!", fallback           |
| P1       | `FileDropZone` | 4            | Drag over, file selected, error state, accessibility      |
| P1       | `BottomSheet`  | 4            | Open/close, backdrop click, escape key, content render    |

#### Section components (next tier):

| Component      | Tests Needed | Key Concerns                                         |
| -------------- | ------------ | ---------------------------------------------------- |
| `Hero`         | 3            | Render with content, without content, responsive     |
| `About`        | 2            | Render, with/without image                           |
| `Skills`       | 3            | Category grouping, progress bars, animation triggers |
| `Projects`     | 3            | Grid render, filter buttons, empty state             |
| `Experience`   | 3            | Timeline render, ordering, date formatting           |
| `Testimonials` | 3            | Carousel, featured first, empty state                |
| `Contact`      | 4            | Form render, validation, submission, success state   |
| `BlogPreview`  | 3            | Cards render, with/without images, tags              |

### 3.6 Integration Tests Ã¢â‚¬â€ API Controllers + Services + DB

**Tool:** Jest + Supertest
**Location:** `apps/api/test/*.spec.ts` (or alongside controllers)
**Scope:** Full request Ã¢â€ â€™ controller Ã¢â€ â€™ service Ã¢â€ â€™ database flow

#### What to test:

**Public Portfolio Endpoints (`/api/portfolio/*`):**

- `GET /api/portfolio/sections` returns sections ordered correctly
- `GET /api/portfolio/skills?category=Frontend` filters by category
- `GET /api/portfolio/projects?featured=true&page=1&per_page=6` respects pagination + filter
- `GET /api/portfolio/blog/:slug` returns a single published post
- `GET /api/portfolio/blog/:slug` returns 404 for unpublished posts
- `GET /api/portfolio/case-studies/:slug` returns a single case study
- `POST /api/portfolio/leads` creates a lead with valid data
- `POST /api/portfolio/leads` rejects invalid email
- `POST /api/portfolio/leads` rate limits after N requests
- `GET /api/portfolio/availability-status` returns current status

**Protected Admin Endpoints (`/api/admin/*`):**

- `GET /api/admin/*` returns 401 without token
- `GET /api/admin/*` returns 403 with viewer role for mutation endpoints
- `POST /api/admin/projects` creates a project with valid data (admin role)
- `PUT /api/admin/projects/:id` updates a project
- `DELETE /api/admin/projects/:id` deletes a project
- `POST /api/admin/blog` creates a blog post
- `PUT /api/admin/sections/reorder` reorders sections
- `PATCH /api/admin/leads/:id/status` transitions lead status
- `GET /api/admin/analytics/overview` returns aggregated data

**Middleware & Cross-cutting:**

- Rate limiting headers present on all responses
- CORS headers match configured origin
- Content-Type `application/json` on all API responses
- API versioning via Accept header works
- Structured error responses (correlation_id, status_code, message)
- Validation errors return 400 with field-level details
- Cache headers (ETag, Cache-Control) on portfolio endpoints

### 3.7 E2E Tests Ã¢â‚¬â€ Critical User Journeys

**Tool:** Playwright
**Location:** `apps/web/e2e/*.spec.ts`
**Scope:** Full browser-based tests

#### Critical journeys to cover:

**Public Ã¢â‚¬â€ Homepage:**

- Homepage loads with all sections visible
- Navigation links work (scroll to section or navigate)
- Projects section loads and displays cards
- Contact form submits successfully
- Blog preview shows latest posts
- Responsive layout at mobile, tablet, desktop breakpoints

**Public Ã¢â‚¬â€ Blog:**

- Blog listing page loads with pagination
- Single blog post loads with content
- Category filtering works
- Tags are clickable and filter correctly
- Related posts section shows

**Public Ã¢â‚¬â€ Projects:**

- Project listing loads with filters
- Single project detail loads
- Project images/gallery works
- Tech stack tags displayed
- Links to live site / source code

**Admin Ã¢â‚¬â€ Auth:**

- Login page renders
- Valid credentials allow login
- Invalid credentials show error
- Token refresh works on page reload
- Logout clears session

**Admin Ã¢â‚¬â€ CRUD:**

- Projects list loads with pagination
- Create project form submits successfully
- Edit project form pre-fills data
- Delete project shows confirmation and removes
- Blog posts CRUD works similarly
- Media upload flow works

**Admin Ã¢â‚¬â€ Dashboard:**

- Dashboard loads analytics data
- Recent activity feed shows
- Quick actions work

### 3.8 Visual Regression Tests

**Tool:** Playwright screenshot comparison
**Location:** `apps/web/e2e/visual/*.spec.ts`
**Scope:** Key pages at fixed viewport sizes

#### Screenshots to capture:

| Page                  | Desktop (1280px) | Tablet (768px) | Mobile (375px) |
| --------------------- | :--------------: | :------------: | :------------: |
| Homepage (full)       |     Ã¢Å“â€¦      |    Ã¢Å“â€¦     |    Ã¢Å“â€¦     |
| Homepage (above fold) |     Ã¢Å“â€¦      |    Ã¢Å“â€¦     |    Ã¢Å“â€¦     |
| Blog listing          |     Ã¢Å“â€¦      |    Ã¢Å“â€¦     |    Ã¢Å“â€¦     |
| Blog detail (article) |     Ã¢Å“â€¦      |    Ã¢Å“â€¦     |    Ã¢â‚¬â€     |
| Project detail        |     Ã¢Å“â€¦      |    Ã¢Å“â€¦     |    Ã¢â‚¬â€     |
| Admin dashboard       |     Ã¢Å“â€¦      |    Ã¢Å“â€¦     |    Ã¢â‚¬â€     |
| Admin project form    |     Ã¢Å“â€¦      |    Ã¢â‚¬â€     |    Ã¢â‚¬â€     |
| Contact form          |     Ã¢Å“â€¦      |    Ã¢Å“â€¦     |    Ã¢Å“â€¦     |
| 404 page              |     Ã¢Å“â€¦      |    Ã¢Å“â€¦     |    Ã¢Å“â€¦     |

**Threshold:** 0.1% pixel difference tolerance for intentional changes. Any change >0.1% must be reviewed and approved.

### 3.9 Accessibility Tests

**Tool:** Playwright + `@axe-core/playwright`
**Location:** `apps/web/e2e/accessibility.spec.ts` (extend existing)

#### Scan all unique page templates:

| Page Template     | Impact | WCAG Criteria         |
| ----------------- | ------ | --------------------- |
| Homepage          | High   | All applicable        |
| Blog listing      | High   | All applicable        |
| Blog detail       | High   | All applicable        |
| Project detail    | High   | All applicable        |
| Project listing   | Medium | All applicable        |
| Admin login       | High   | All applicable        |
| Admin dashboard   | Medium | All applicable        |
| Admin forms (all) | Medium | Forms, labels, errors |
| 404 page          | Low    | All applicable        |

### 3.10 Performance Tests

**Tool:** Lighthouse CI (CI integration), k6 (load testing)
**Location:** CI pipeline stage (Lighthouse), `tests/performance/` (k6)

#### Lighthouse budgets (CI gate):

| Metric                          | Budget        | Current (approx) |
| ------------------------------- | ------------- | ---------------- |
| Performance score               | Ã¢â€°Â¥ 90    | ?                |
| First Contentful Paint (FCP)    | Ã¢â€°Â¤ 1.5s  | ?                |
| Largest Contentful Paint (LCP)  | Ã¢â€°Â¤ 2.0s  | ?                |
| Cumulative Layout Shift (CLS)   | Ã¢â€°Â¤ 0.05  | ?                |
| Interaction to Next Paint (INP) | Ã¢â€°Â¤ 100ms | ?                |
| Total Blocking Time (TBT)       | Ã¢â€°Â¤ 200ms | ?                |
| Accessibility score             | Ã¢â€°Â¥ 95    | ?                |
| Best Practices score            | Ã¢â€°Â¥ 95    | ?                |
| SEO score                       | Ã¢â€°Â¥ 95    | ?                |

#### k6 load test scenarios (future):

| Scenario                | Virtual Users | Duration | Target        |
| ----------------------- | ------------- | -------- | ------------- |
| Portfolio read (heavy)  | 100           | 5 min    | p95 < 500ms   |
| Admin operations        | 20            | 3 min    | p95 < 1s      |
| Auth (login + refresh)  | 50            | 3 min    | p95 < 1s      |
| Contact form submission | 30            | 3 min    | p95 < 2s      |
| Spike test              | 200           | 1 min    | No 5xx errors |

### 3.11 Security Tests

**Tool:** CodeQL (GitHub), `npm audit`, `socket.dev`

| Check                  | Frequency               | Action on Failure               |
| ---------------------- | ----------------------- | ------------------------------- |
| CodeQL analysis        | Every PR                | Block merge                     |
| `npm audit` (critical) | Every PR                | Block merge                     |
| `npm audit` (high)     | Every PR                | Block merge (triage within 24h) |
| `npm audit` (moderate) | Weekly                  | Review and prioritize           |
| Dependabot alerts      | Continuous              | Auto-PR for critical patches    |
| Container scan (Trivy) | Every build             | Block deployment                |
| Secret scanning        | Every push (pre-commit) | Block commit                    |

---

## 4. Test Infrastructure

### 4.1 API Unit Tests

**Stack:**

- **Runtime:** Jest 29+ + `ts-jest` 29+
- **Test runner:** Jest CLI
- **Mocking:** Manual mocks (`__mocks__` directories), `jest.fn()`, `jest.spyOn()`
- **Assertions:** Jest built-in matchers + `jest-extended` (optional)

**Configuration** (`apps/api/jest.config.ts`):

```typescript
const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(t|j)s', '!**/*.module.ts', '!main.ts', '!**/dto/**'],
  coverageDirectory: '../coverage',
  coverageThreshold: {
    global: {
      lines: 40, // Start: raise to 60 (W2), 70 (W4), 80 (W6)
      branches: 30, // Start: raise to 50 (W2), 60 (W4), 70 (W6)
      functions: 40,
      statements: 40,
    },
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Run tests that don't need DB first (unit tests)
  testPathIgnorePatterns: ['/test/'],
};
```

**Mock patterns for services:**

```typescript
// PrismaService is mocked at the module level
const mockPrismaService = {
  client: {
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    blogPost: { ... },
    lead: { ... },
  },
  $on: jest.fn(),
};

// CacheService is always mocked
const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  reset: jest.fn(),
};
```

### 4.2 Web Unit Tests

**Stack:**

- **Runtime:** Vitest 1+
- **Renderer:** `jsdom` (for DOM API emulation)
- **Component testing:** `@testing-library/react` 14+
- **User interaction:** `@testing-library/user-event` 14+
- **Assertions:** `@testing-library/jest-dom` (custom DOM matchers)

**Configuration** (`apps/web/vitest.config.ts` Ã¢â‚¬â€ already set up):

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.tsx'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**/*',
        'src/**/*.d.ts',
        'src/app/**/layout.tsx',
      ],
      thresholds: {
        lines: 40,
        branches: 30,
        functions: 40,
        statements: 40,
      },
    },
  },
});
```

**Setup file** (`apps/web/src/test/setup.tsx` Ã¢â‚¬â€ already configured with):

- Mocked `next/navigation` (useRouter, usePathname, useSearchParams)
- Mocked `next/link`
- Mocked `next/image`
- Mocked `window.matchMedia`
- Mocked `IntersectionObserver`
- Mocked `localStorage`

**Additional setup needed:**

- Mock `next/headers` (for server components)
- Mock ResizeObserver (for chart/visualization components)
- Mock `requestAnimationFrame` / `cancelAnimationFrame`
- Configure `@testing-library/jest-dom/vitest` globally

### 4.3 E2E Tests

**Stack:**

- **Runtime:** Playwright 1.40+
- **Browser:** Chromium (primary), Firefox (secondary Ã¢â‚¬â€ add in Week 4)
- **Assertions:** `@playwright/test` built-in
- **Accessibility:** `@axe-core/playwright`

**Configuration** (`apps/web/playwright.config.ts` Ã¢â‚¬â€ already set up):

```typescript
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list'], ['junit', { outputFile: 'e2e-results.xml' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure', // Add: helps debug flaky E2E
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox', // Add in Week 4
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### 4.4 Test Database Strategy

**Current problem:** The e2e tests use a conditional check `const hasDb = !!process.env.DATABASE_URL` and skip DB-dependent tests when no database is available. This means the bulk of meaningful tests only run in environments with a database configured.

**Target state:** A dedicated test database that is:

1. Provisioned in CI via a Postgres service container
2. Migrated on every test run (`prisma migrate deploy` or `prisma db push`)
3. Seeded with deterministic test data before the test suite runs
4. Truncated/cleaned up between test runs

**CI database configuration:**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: portfolio_test
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

Environment variables for the test job:

```
DATABASE_URL: postgresql://test:test@localhost:5432/portfolio_test
```

### 4.5 Test Data: Factories

Each entity gets a factory function that produces valid, unique test data. Factories live in `apps/api/test/factories/` and are shared between unit, integration, and e2e tests.

```typescript
// apps/api/test/factories/project.factory.ts
export function createProjectFactory(overrides?: Partial<ProjectInput>): ProjectInput {
  const seed = Date.now() + Math.random();
  return {
    title: `Test Project ${seed}`,
    slug: `test-project-${seed}`,
    description: 'A test project for e2e testing',
    tech_stack: ['TypeScript', 'React', 'Node.js'],
    is_featured: false,
    is_private: false,
    display_order: 0,
    content: { overview: 'Test content', highlights: [] },
    ...overrides,
  };
}
```

### 4.6 Test DB Seed Script

A dedicated seed script for the test environment at `apps/api/prisma/test-seed.ts`:

```typescript
// Creates a minimal but realistic dataset for tests
// - 5 projects (2 featured, 1 private)
// - 3 blog posts (2 published, 1 draft)
// - 5 skills (across 3 categories)
// - 3 sections
// - 2 testimonials (1 featured)
// - 1 test user (admin role)
// All data uses unique identifiers prefixed with 'test-'
```

---

## 5. CI Integration

### 5.1 Current CI Gaps

The current CI workflow (`.github/workflows/ci.yml`) has several gaps:

| Issue                | Current Behavior               | Target Behavior                        |
| -------------------- | ------------------------------ | -------------------------------------- |
| Test DB              | No database available          | Postgres service container             |
| Web test failures    | `continue-on-error: true`      | Block on failure (after stabilization) |
| Coverage             | Not collected                  | Coverage reports uploaded as artifacts |
| E2E tests            | Not in CI (no web test job)    | Playwright runs in CI                  |
| Test isolation       | No database Ã¢â‚¬â€ tests skip | Dedicated test DB with seed data       |
| `test` task in Turbo | Missing from `turbo.json`      | Add `test` task with dependency chain  |

### 5.2 Target CI Pipeline

```yaml
name: CI
on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master, develop]

jobs:
  quality:
    name: Lint & Typecheck & Test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        workspace: [apps/api, apps/web]

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: portfolio_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npm run lint --workspace=${{ matrix.workspace }}
      - run: npm run typecheck --workspace=${{ matrix.workspace }}

      - name: Generate Prisma client (API)
        if: matrix.workspace == 'apps/api'
        run: npm run prisma:generate --workspace=apps/api
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/portfolio_test

      - name: Run migrations (API)
        if: matrix.workspace == 'apps/api'
        run: npm run prisma:migrate:deploy --workspace=apps/api
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/portfolio_test

      - name: Run unit + integration tests
        run: npm run test --workspace=${{ matrix.workspace }}
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/portfolio_test
          NODE_ENV: test
          JWT_SECRET: test-jwt-secret-for-ci

      - name: Upload coverage
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-${{ matrix.workspace }}
          path: ${{ matrix.workspace }}/coverage/

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [quality]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npx playwright install --with-deps chromium

      - name: Build web
        run: npm run build --workspace=apps/web

      - name: Run Playwright tests
        run: npx playwright test
        working-directory: apps/web
        env:
          PLAYWRIGHT_TEST_BASE_URL: http://localhost:3000

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: apps/web/playwright-report/

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm audit --audit-level=high
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript, typescript
      - uses: github/codeql-action/analyze@v3

  lighthouse:
    name: Lighthouse CI
    runs-on: ubuntu-latest
    needs: [build]
    steps:
      - uses: actions/checkout@v4
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
            http://localhost:3000/
            http://localhost:3000/blog
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### 5.3 Turbo Configuration Update

The `test` task must be added to `turbo.json` to ensure proper dependency ordering:

```json
{
  "tasks": {
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "inputs": ["src/**/*.ts", "src/**/*.tsx", "test/**"]
    }
  }
}
```

### 5.4 Test Execution Workflow

```
PR Created
    Ã¢â€â€š
    Ã¢â€“Â¼
  Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
  Ã¢â€â€š Static Analysis   Ã¢â€â€š  Ã¢â€ Â ESLint + TypeScript (both workspaces)
  Ã¢â€â€š (~30s)            Ã¢â€â€š
  Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ
          Ã¢â€â€š pass
          Ã¢â€“Â¼
  Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
  Ã¢â€â€š Unit Tests        Ã¢â€â€š  Ã¢â€ Â Jest (API) + Vitest (Web)
  Ã¢â€â€š (~2min)           Ã¢â€â€š
  Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ
          Ã¢â€â€š pass
          Ã¢â€“Â¼
  Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
  Ã¢â€â€š Integration Tests Ã¢â€â€š  Ã¢â€ Â Supertest + real DB (API only)
  Ã¢â€â€š (~3min)           Ã¢â€â€š
  Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ
          Ã¢â€â€š pass
          Ã¢â€“Â¼
  Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
  Ã¢â€â€š E2E Tests         Ã¢â€â€š  Ã¢â€ Â Playwright (Chromium)
  Ã¢â€â€š (~4min)           Ã¢â€â€š
  Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ
          Ã¢â€â€š pass
          Ã¢â€“Â¼
  Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
  Ã¢â€â€š Security + Perf   Ã¢â€â€š  Ã¢â€ Â CodeQL, Lighthouse
  Ã¢â€â€š (~3min)           Ã¢â€â€š  Ã¢â€ Â (non-blocking initially)
  Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ
          Ã¢â€â€š all pass
          Ã¢â€“Â¼
     Ã¢Å“â€¦ MERGE READY
```

**Total target:** < 10 minutes for the full suite.

### CI Integration Flow

```mermaid
flowchart LR
    A[Commit / PR] --> B[Lint & TypeCheck]
    B -->|pass| C[Unit Tests]
    B -->|fail| A

    C -->|pass| D[Integration Tests]
    C -->|fail| A

    D -->|pass| E[E2E Tests]
    D -->|fail| A

    E -->|pass| F[Build]
    E -->|fail| A

    F -->|pass| G[Deploy]
    F -->|fail| A

    style A fill:#e3f2fd,stroke:#1565c0
    style G fill:#c8e6c9,stroke:#2e7d32
```

---

## 6. Test Naming & Organization

### 6.1 File Naming Conventions

| Test Type           | Pattern                            | Location                   | Example                       |
| ------------------- | ---------------------------------- | -------------------------- | ----------------------------- |
| API service unit    | `*.service.spec.ts`                | Alongside source file      | `skills.service.spec.ts`      |
| API controller unit | `*.controller.spec.ts`             | Alongside source file      | `projects.controller.spec.ts` |
| API integration     | `*.e2e-spec.ts` or `*.int-spec.ts` | `apps/api/test/`           | `app.e2e-spec.ts`             |
| Web component       | `*.test.tsx`                       | `src/test/__tests__/`      | `Button.test.tsx`             |
| Web hook            | `hooks.test.tsx`                   | `src/test/__tests__/`      | `hooks.test.tsx`              |
| Web utility         | `*.test.ts`                        | `src/test/__tests__/`      | `formatDate.test.ts`          |
| Playwright E2E      | `*.spec.ts`                        | `apps/web/e2e/`            | `homepage.spec.ts`            |
| Playwright visual   | `visual/*.spec.ts`                 | `apps/web/e2e/visual/`     | `homepage-visual.spec.ts`     |
| Playwright a11y     | `accessibility.spec.ts`            | `apps/web/e2e/`            | `accessibility.spec.ts`       |
| Performance (k6)    | `*.k6.ts`                          | `tests/performance/`       | `portfolio-load.k6.ts`        |
| Test factories      | `*.factory.ts`                     | `apps/api/test/factories/` | `project.factory.ts`          |
| Test helpers        | `*.helper.ts`                      | `apps/api/test/helpers/`   | `auth.helper.ts`              |
| Test setup          | `setup.tsx`                        | `apps/web/src/test/`       | `setup.tsx`                   |

### 6.2 Describe Block Naming

```
# Services Ã¢â‚¬â€ entity name
describe('SkillsService')
describe('ProjectsService')
describe('AuthService')

# HTTP Endpoints Ã¢â‚¬â€ method + path
describe('GET /api/portfolio/skills')
describe('POST /api/admin/projects')
describe('DELETE /api/admin/blog/:id')

# Components Ã¢â‚¬â€ component name
describe('Button')
describe('Navbar')
describe('ContactForm')

# Hooks Ã¢â‚¬â€ hook name
describe('useProjects')
describe('useAuth')

# E2E Ã¢â‚¬â€ user journey
describe('Homepage Ã¢â‚¬â€ section loading and navigation')
describe('Admin Ã¢â‚¬â€ project CRUD flow')
describe('Auth Ã¢â‚¬â€ login, token refresh, and logout')
```

### 6.3 Test Name Conventions

Test names should read as **sentences** that describe the scenario and expected outcome.

```
Ã¢ÂÅ’ Bad:    'should work'
Ã¢ÂÅ’ Bad:    'createProject test 1'
Ã¢Å“â€¦ Good:    'creates a project with valid data and returns the created entity'
Ã¢Å“â€¦ Good:    'returns 400 when creating a project with missing required fields'
Ã¢Å“â€¦ Good:    'returns 404 when requesting a nonexistent project'
Ã¢Å“â€¦ Good:    'throws NotFoundException when deleting a non-existent project'
Ã¢Å“â€¦ Good:    'filters projects by category and returns only matching results'
Ã¢Å“â€¦ Good:    'returns cached data on repeated requests within TTL'
```

### 6.4 Test File Structure

**API service test structure:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { SkillsService } from './skills.service';

describe('SkillsService', () => {
  let service: SkillsService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        { provide: PrismaService, useValue: mockDeep<PrismaClient>() },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get(SkillsService);
    prisma = module.get(PrismaService);
  });

  describe('findAll', () => {
    it('returns all skills ordered by proficiency', async () => { ... });
    it('filters skills by category when category param is provided', async () => { ... });
    it('returns empty array when no skills exist', async () => { ... });
  });

  describe('create', () => {
    it('creates a skill with valid DTO', async () => { ... });
    it('throws BadRequestException when name already exists', async () => { ... });
  });
});
```

**Web component test structure:**

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with children text', () => { ... });
  it('calls onClick handler when clicked', async () => { ... });
  it('does not call onClick when disabled', async () => { ... });
  it('shows loading spinner when loading prop is true', () => { ... });
  it('applies variant class correctly', () => { ... });
});
```

---

## 7. Mocking Strategy

### 7.1 Core Principles

| Principle                               | Rationale                                                                                                           | Practice                                                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Mock at your boundary**               | Mock the layer between your code and the external dependency                                                        | Mock `PrismaService` methods, not `pg.Pool` queries                                                  |
| **Never mock what you don't own**       | Third-party libraries should be tested as integrated, not mocked (except for their transport layer)                 | Don't mock `bcrypt` Ã¢â‚¬â€ test that password comparison works. Mock the HTTP call to external APIs |
| **Fakes > mocks > stubs**               | Prefer lightweight fakes (in-memory DB) over mocks when possible                                                    | Use factories for test data, not mocked return values                                                |
| **Verify behavior, not implementation** | Test that the right data is returned/action is taken, not that a specific mock method was called with specific args | Assert on service output, not on `prisma.create` call count                                          |
| **Keep mocks close to tests**           | Shared mocks create coupling. Mock setup should be in the test file or a co-located helper                          | Per-file mock setup, shared in `test/helpers/` only when truly reusable                              |

### 7.2 Prisma Mocking Strategy

**Do NOT use `mockPrismaClient` that mocks every method.** Instead, mock only the Prisma service methods that the tested service actually uses.

**Preferred approach:** Use `deepMock` from `jest-mock-extended` for Prisma models:

```typescript
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

// In test setup:
const prisma = mockDeep<PrismaClient>();

// In service test:
prisma.project.findMany.mockResolvedValue([mockProject]);
prisma.project.create.mockResolvedValue(mockProject);
prisma.project.findUnique.mockResolvedValue(null); // not found
```

**For NestJS providers, create a custom provider:**

```typescript
{
  provide: PrismaService,
  useValue: {
    client: prisma, // the mocked PrismaClient
    $on: jest.fn(),
  },
}
```

### 7.3 HTTP Mocking Strategy

**API tests (Supertest):** No mocking needed Ã¢â‚¬â€ Supertest sends real HTTP requests to the NestJS app. The app uses real services with either real or mocked database.

**Web tests (Vitest):** Mock `global.fetch` at the top level. The setup in `apps/web/src/test/setup.tsx` should provide a global `fetch` mock:

```typescript
// In each test file:
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Reset between tests:
beforeEach(() => {
  mockFetch.mockReset();
});

// Mock response:
mockFetch.mockResolvedValueOnce({
  ok: true,
  status: 200,
  json: () => Promise.resolve({ data: mockData }),
});
```

**Playwright E2E:** No mocking of API calls Ã¢â‚¬â€ test the full stack. For specific scenarios (error pages, loading states):

- Use Playwright's `page.route()` to intercept and mock specific API responses
- Use server-side test data seeding to set up known states

### 7.4 Browser API Mocking

Currently configured in `apps/web/src/test/setup.tsx`:

| Browser API                    | Mock Implementation                                                |
| ------------------------------ | ------------------------------------------------------------------ |
| `window.matchMedia`            | Returns `{ matches: false, addListener, removeListener, ... }`     |
| `IntersectionObserver`         | No-op class with `observe`, `unobserve`, `disconnect`              |
| `localStorage`                 | In-memory store with `getItem`, `setItem`, `removeItem`, `clear`   |
| `ResizeObserver`               | **Needed:** Mock class with observe/unobserve/disconnect           |
| `requestAnimationFrame`        | **Needed:** Use `vi.useFakeTimers` or mock with immediate callback |
| `scrollTo` / `scrollIntoView`  | **Needed:** No-op mocks                                            |
| `HTMLCanvasElement.getContext` | **Needed:** Return a minimal canvas mock for Three.js components   |

### 7.5 Next.js Mocking Strategy

Currently configured:

| Module            | Mock                                                                     |
| ----------------- | ------------------------------------------------------------------------ |
| `next/navigation` | `useRouter` Ã¢â€ â€™ push/replace/prefetch/back/forward/refresh/pathname |
| `next/link`       | Renders `<a>` tag with href                                              |
| `next/image`      | Renders `<img>` tag with src/alt                                         |

**Needed additions:**

- `next/headers` Ã¢â€ â€™ `cookies()`, `headers()` for server components
- `next/server` Ã¢â€ â€™ `NextRequest`, `NextResponse` for API route handlers

### 7.6 What NOT to Mock

| Item                       | Reason                                                               |
| -------------------------- | -------------------------------------------------------------------- |
| Zod schemas                | These ARE the validation logic Ã¢â‚¬â€ test them with real data      |
| NestJS pipes/guards        | Test them in integration with Supertest                              |
| Prisma schema types        | Generated code Ã¢â‚¬â€ TypeScript validates usage                    |
| Node.js built-in modules   | Only mock when they cause side effects (e.g., `fs.writeFile`)        |
| Third-party auth providers | Integration test against test credentials, don't mock the OAuth flow |

---

## 8. Test Data Strategy

### 8.1 Factory Pattern

Each entity gets a factory function that generates valid, unique test data. Factories are the single source of truth for test data shapes.

**Location:** `apps/api/test/factories/`

```typescript
// apps/api/test/factories/project.factory.ts
import { faker } from '@faker-js/faker';

export interface ProjectInput {
  title: string;
  slug: string;
  description: string;
  tech_stack: string[];
  is_featured: boolean;
  is_private: boolean;
  display_order: number;
  content: Record<string, unknown>;
  category?: string;
}

export function buildProject(overrides?: Partial<ProjectInput>): ProjectInput {
  const title = faker.company.name() + ' Project';
  return {
    title,
    slug: faker.helpers.slugify(title).toLowerCase(),
    description: faker.lorem.paragraph(),
    tech_stack: [faker.helpers.arrayElement(['TypeScript', 'React', 'Node.js', 'Python'])],
    is_featured: faker.datatype.boolean(),
    is_private: false,
    display_order: faker.number.int({ min: 0, max: 100 }),
    content: { overview: faker.lorem.sentences(3) },
    ...overrides,
  };
}

export function createTestProject(overrides?: Partial<ProjectInput>) {
  return buildProject({ ...overrides, title: `[TEST] ${buildProject().title}` });
}
```

**Factories to create:**

| Entity                    | Priority | Unique Fields | Relations    |
| ------------------------- | -------- | ------------- | ------------ |
| `project.factory.ts`      | P0       | slug          | Ã¢â‚¬â€      |
| `blog-post.factory.ts`    | P0       | slug, title   | categories   |
| `user.factory.ts`         | P0       | email         | roles        |
| `lead.factory.ts`         | P0       | email         | Ã¢â‚¬â€      |
| `skill.factory.ts`        | P1       | name          | category     |
| `section.factory.ts`      | P1       | name, slug    | Ã¢â‚¬â€      |
| `testimonial.factory.ts`  | P1       | Ã¢â‚¬â€       | Ã¢â‚¬â€      |
| `experience.factory.ts`   | P1       | Ã¢â‚¬â€       | Ã¢â‚¬â€      |
| `service.factory.ts`      | P1       | name          | Ã¢â‚¬â€      |
| `faq.factory.ts`          | P1       | Ã¢â‚¬â€       | Ã¢â‚¬â€      |
| `case-study.factory.ts`   | P1       | slug          | Ã¢â‚¬â€      |
| `media.factory.ts`        | P2       | filename      | Ã¢â‚¬â€      |
| `notification.factory.ts` | P2       | Ã¢â‚¬â€       | user         |
| `chat-message.factory.ts` | P2       | Ã¢â‚¬â€       | conversation |
| `api-key.factory.ts`      | P2       | key_hash      | user         |
| `feature-flag.factory.ts` | P2       | key           | Ã¢â‚¬â€      |

### 8.2 Seed Scripts

**Test seed script** (`apps/api/prisma/test-seed.ts`):

Creates a deterministic dataset for E2E and integration tests. Run before the test suite starts.

```typescript
export async function seedTestData(prisma: PrismaClient) {
  // Admin user
  const admin = await prisma.user.create({
    data: {
      email: 'test-admin@portfolio.local',
      password_hash: await hash('TestPass123!', 10),
      display_name: 'Test Admin',
      role: 'admin',
    },
  });

  // 5 projects (2 featured, 1 private)
  const projects = await Promise.all([
    prisma.project.create({ data: createTestProject({ is_featured: true, display_order: 1 }) }),
    prisma.project.create({ data: createTestProject({ is_featured: true, display_order: 2 }) }),
    prisma.project.create({ data: createTestProject({ display_order: 3 }) }),
    prisma.project.create({ data: createTestProject({ display_order: 4 }) }),
    prisma.project.create({ data: createTestProject({ is_private: true, display_order: 5 }) }),
  ]);

  // 3 blog posts (2 published, 1 draft)
  const posts = await Promise.all([
    prisma.blogPost.create({ data: createBlogPost({ is_published: true }) }),
    prisma.blogPost.create({ data: createBlogPost({ is_published: true }) }),
    prisma.blogPost.create({ data: createBlogPost({ is_published: false }) }),
  ]);

  // Skills across 3 categories
  const skills = await Promise.all([
    prisma.skill.create({ data: createSkill({ category: 'Frontend', proficiency: 95 }) }),
    prisma.skill.create({ data: createSkill({ category: 'Frontend', proficiency: 85 }) }),
    prisma.skill.create({ data: createSkill({ category: 'Backend', proficiency: 90 }) }),
    prisma.skill.create({ data: createSkill({ category: 'Backend', proficiency: 75 }) }),
    prisma.skill.create({ data: createSkill({ category: 'DevOps', proficiency: 70 }) }),
  ]);

  // 3 sections
  const sections = await Promise.all([
    prisma.section.create({ data: createSection({ name: 'Hero', display_order: 1 }) }),
    prisma.section.create({ data: createSection({ name: 'About', display_order: 2 }) }),
    prisma.section.create({ data: createSection({ name: 'Projects', display_order: 3 }) }),
  ]);

  // 2 testimonials (1 featured)
  await Promise.all([
    prisma.testimonial.create({ data: createTestimonial({ is_featured: true }) }),
    prisma.testimonial.create({ data: createTestimonial({ is_featured: false }) }),
  ]);

  return { admin, projects, posts, skills, sections };
}
```

### 8.3 Data Cleanup Strategy

**Between test runs (integration tests):**

```typescript
afterAll(async () => {
  // Clean up all test data (uses raw SQL for speed)
  const tablenames = await prisma.client.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      await prisma.client.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
    }
  }
});
```

**Between test files (E2E):**
Each E2E test that modifies data uses a unique identifier (e.g., `e2e-test-${Date.now()}`) to avoid collisions. The test seed is run once before the E2E suite and reset on failure.

### 8.4 Test Data Naming Convention

All test-created data should be clearly identifiable:

| Field      | Pattern                               | Example                             |
| ---------- | ------------------------------------- | ----------------------------------- |
| Title/Name | `[TEST] <descriptive name>`           | `[TEST] Featured Project for E2E`   |
| Email      | `test-<purpose>-<timestamp>@test.com` | `test-admin-1712345678@test.com`    |
| Slug       | `test-<entity>-<purpose>`             | `test-project-featured`             |
| Other text | Include `[E2E]` or `[TEST]` prefix    | `[E2E] This is a test lead message` |

This makes test data easy to identify and clean up in shared environments.

---

## 9. Quality Gates & Thresholds

### 9.1 Merge Gates

The following conditions must be met before a PR can be merged:

| Gate                        | Condition                                  | Enforced By              | Grace Period                     |
| --------------------------- | ------------------------------------------ | ------------------------ | -------------------------------- |
| **Static analysis**         | ESLint zero errors, TypeScript strict pass | GitHub branch protection | None                             |
| **Unit tests**              | All passing, coverage thresholds met       | CI job                   | None                             |
| **Integration tests**       | All passing                                | CI job                   | None                             |
| **E2E tests**               | All passing                                | CI job                   | Until E2E stabilization (Week 4) |
| **Code review**             | At least 1 approval                        | GitHub branch protection | None                             |
| **No pending dependencies** | `npm audit` high/critical zero             | CI job                   | None                             |

### 9.2 Coverage Thresholds (Ramped)

Coverage thresholds start reasonable and increase quarterly:

| Quarter                | Lines | Branches | Functions | Notes                           |
| ---------------------- | ----- | -------- | --------- | ------------------------------- |
| **Q3 2026 (Week 1-2)** | 40%   | 30%      | 40%       | Minimum baseline                |
| **Q3 2026 (Week 3-4)** | 55%   | 45%      | 55%       | After service + component tests |
| **Q3 2026 (Week 5-6)** | 70%   | 60%      | 70%       | After expanded coverage         |
| **Q4 2026**            | 80%   | 70%      | 80%       | Stable target                   |
| **Q1 2027**            | 90%   | 80%      | 90%       | Stretch target                  |

**Coverage change gate:** A PR that decreases overall coverage by more than 5 percentage points is blocked, even if still above the threshold.

### 9.3 New Code Coverage

For every PR that introduces new files or significantly modifies existing files:

- **New files** must have Ã¢â€°Â¥ 60% line coverage within the PR itself.
- **Modified files** must not decrease coverage by more than 5 percentage points.
- **Exception:** Configuration files, generated code, type definitions, and `dto/` files are excluded.

### 9.4 Weekly Reports

| Report                   | Owner   | Audience          | Content                                                                     |
| ------------------------ | ------- | ----------------- | --------------------------------------------------------------------------- |
| **Flaky test report**    | QA Lead | Engineering team  | List of flaky tests, failure rate, root cause, owner, ETA for fix           |
| **Slowest tests report** | QA Lead | Engineering team  | Top 20 slowest tests, optimization opportunities, execution time trends     |
| **Coverage trend**       | QA Lead | Engineering leads | Coverage % by module, week-over-week change, modules below threshold        |
| **Test debt analysis**   | QA Lead | Engineering leads | Untested services/components, test quality issues, automation opportunities |

### 9.5 Monthly Review

| Agenda Item                 | Participants                    | Duration |
| --------------------------- | ------------------------------- | -------- |
| Coverage trend review       | QA Lead + Engineering leads     | 15 min   |
| Flaky test retrospective    | QA Lead + Engineering team      | 15 min   |
| Test infrastructure health  | QA Lead + DevOps                | 10 min   |
| Roadmap progress            | QA Lead + Product + Engineering | 10 min   |
| Action items for next month | All                             | 10 min   |

### 9.6 Test Debt Classification

| Class                   | Definition                                        | Action                       | Example                                         |
| ----------------------- | ------------------------------------------------- | ---------------------------- | ----------------------------------------------- |
| **P0 Ã¢â‚¬â€ Critical** | No tests for a critical path used in every deploy | Must fix before next release | Auth flow, contact form, project CRUD           |
| **P1 Ã¢â‚¬â€ High**     | No tests for core business logic                  | Fix within 1 sprint          | Blog service, skill service, section ordering   |
| **P2 Ã¢â‚¬â€ Medium**   | No tests for secondary features                   | Fix within 2 sprints         | Achievements, press features, guest appearances |
| **P3 Ã¢â‚¬â€ Low**      | No tests for edge cases, admin-only features      | Fix when touching the code   | Feature flags, system settings, API keys        |

---

## 10. Tools & Configuration

### 10.1 Exact Tool Versions

| Tool                            | Version Range | Purpose                          | Configuration File              |
| ------------------------------- | ------------- | -------------------------------- | ------------------------------- |
| **Node.js**                     | 22.x          | Runtime                          | `.nvmrc`, CI config             |
| **TypeScript**                  | 5.x           | Static analysis                  | `tsconfig.json`                 |
| **ESLint**                      | 8.x / 9.x     | Linting                          | `.eslintrc.js`                  |
| **Prettier**                    | 3.x           | Formatting                       | `.prettierrc`                   |
| **Jest**                        | 29.x          | API testing (unit + integration) | `apps/api/jest.config.ts`       |
| **ts-jest**                     | 29.x          | TypeScript transform for Jest    | `apps/api/jest.config.ts`       |
| **Vitest**                      | 1.x           | Web testing (unit + component)   | `apps/web/vitest.config.ts`     |
| **@testing-library/react**      | 14.x          | React component testing          | `apps/web/package.json`         |
| **@testing-library/user-event** | 14.x          | User interaction simulation      | `apps/web/package.json`         |
| **@testing-library/jest-dom**   | 6.x           | Custom DOM matchers              | `apps/web/src/test/setup.tsx`   |
| **Playwright**                  | 1.40+         | E2E testing                      | `apps/web/playwright.config.ts` |
| **@axe-core/playwright**        | 4.x           | Accessibility testing            | `apps/web/package.json`         |
| **jest-mock-extended**          | 3.x           | Deep mocking for Prisma          | `apps/api/package.json`         |
| **@faker-js/faker**             | 8.x           | Test data generation             | `apps/api/package.json`         |
| **supertest**                   | 6.x           | HTTP assertion for NestJS        | `apps/api/package.json`         |
| **Lighthouse CI**               | 11.x          | Performance budgets              | CI config                       |
| **k6**                          | 0.50+         | Load testing                     | `tests/performance/`            |
| **CodeQL**                      | Latest        | Security analysis                | `.github/workflows/codeql.yml`  |

### 10.2 Package.json Scripts

**API** (`apps/api/package.json`):

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --config jest.integration.config.ts",
    "test:e2e": "jest --config jest.e2e.config.ts",
    "test:unit": "jest --testPathIgnorePatterns='/test/'",
    "test:verbose": "jest --verbose",
    "test:ci": "jest --coverage --ci --reporters=default --reporters=jest-junit",
    "prisma:generate": "prisma generate",
    "prisma:migrate:deploy": "prisma migrate deploy",
    "prisma:seed:test": "ts-node prisma/test-seed.ts"
  }
}
```

**Web** (`apps/web/package.json`):

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:ci": "vitest run --coverage --reporter=junit --outputFile=junit.xml",
    "test:component": "vitest run --reporter=verbose"
  }
}
```

### 10.3 Local Test Commands Cheat Sheet

| Scenario                    | Command                                                                | Notes                        |
| --------------------------- | ---------------------------------------------------------------------- | ---------------------------- |
| Run all API tests           | `cd apps/api && npm test`                                              | Unit + integration           |
| Run all API tests (watch)   | `cd apps/api && npm run test:watch`                                    | Best for TDD                 |
| Run single API test file    | `cd apps/api && npm test -- src/modules/skills/skills.service.spec.ts` | Exact path                   |
| Run API tests matching name | `cd apps/api && npm test -- -t "creates a skill"`                      | Pattern match                |
| Run API coverage            | `cd apps/api && npm run test:coverage`                                 | HTML report in `coverage/`   |
| Run all web tests           | `cd apps/web && npm test`                                              | Vitest runner                |
| Run web tests (watch)       | `cd apps/web && npm run test:watch`                                    | Best for TDD                 |
| Run single web test file    | `cd apps/web && npm test -- src/test/__tests__/Button.test.tsx`        | Exact path                   |
| Run web component coverage  | `cd apps/web && npm run test:coverage`                                 | V8 coverage                  |
| Run E2E tests               | `cd apps/web && npm run test:e2e`                                      | Must have dev server running |
| Run E2E (headed)            | `cd apps/web && npx playwright test --headed`                          | See browser                  |
| Run E2E (debug)             | `cd apps/web && npx playwright test --debug`                           | Step through                 |
| Run E2E single file         | `cd apps/web && npx playwright test e2e/homepage.spec.ts`              |                              |
| Run all (root)              | `npm run test`                                                         | Workspace-aware via Turbo    |

### 10.4 Debugging Tests

**Jest (API) debugging:**

```bash
# Node inspector
cd apps/api && node --inspect-brk node_modules/.bin/jest --runInBand

# In Chrome: chrome://inspect Ã¢â€ â€™ Open dedicated DevTools for Node
# Set breakpoints in test files and step through

# Verbose output for test failures
cd apps/api && npm run test:verbose

# Isolate a single test with .only
it.only('should find the bug', async () => { ... });
```

**Vitest (Web) debugging:**

```bash
# Vitest UI (interactive debugger)
cd apps/web && npx vitest --ui

# Node inspector
cd apps/web && node --inspect-brk node_modules/.bin/vitest --run

# Verbose output
cd apps/web && npm run test:verbose
```

**Playwright debugging:**

```bash
# Playwright Inspector (Pause on each step)
cd apps/web && npx playwright test --debug

# Trace viewer (after test run with trace)
cd apps/web && npx playwright show-trace test-results/**/trace.zip

# Slow motion (1000ms between actions)
cd apps/web && npx playwright test --headed --slowmo=1000

# VS Code extension: Playwright Test for VSCode
# Right-click on a test Ã¢â€ â€™ "Debug Test"
```

### 10.5 VS Code Configuration

`.vscode/settings.json`:

```json
{
  "testing.automaticallyOpenPeekView": "failure",
  "vitest.enable": true,
  "vitest.nodeEnv": "test",
  "jest.autoRun": {
    "watch": false,
    "onSave": "test-file"
  },
  "playwright.env": {
    "PWDEBUG": "console"
  },
  "files.exclude": {
    "**/coverage": true
  }
}
```

Recommended VS Code extensions:

- **Vitest** (Zixuan Chen) Ã¢â‚¬â€ Run/debug Vitest tests in-editor
- **Jest** (Orta) Ã¢â‚¬â€ Run/debug Jest tests in-editor
- **Playwright Test for VSCode** (Microsoft) Ã¢â‚¬â€ Run/debug Playwright tests
- **Error Lens** (Alexander) Ã¢â‚¬â€ Inline test errors
- **Test Explorer UI** (hbenl) Ã¢â‚¬â€ Unified test view

---

## 11. Roadmap

### 11.1 Week 1: Foundation & CI Infrastructure

**Goal:** Make tests run reliably in CI with a test database and quality gates.

| Task                                                | Owner    | Outcome                           | Dependencies     |
| --------------------------------------------------- | -------- | --------------------------------- | ---------------- |
| Add Postgres service container to CI                | DevOps   | Tests have a real database        | CI config access |
| Remove `continue-on-error: true` for web tests      | DevOps   | Web tests block merge             | Test DB setup    |
| Add `test` task to `turbo.json`                     | Backend  | Turbo orchestration works         | Ã¢â‚¬â€          |
| Set up test database migration in CI                | Backend  | DB is migrated before tests       | Postgres service |
| Configure Jest coverage thresholds (40%/30%)        | Backend  | Coverage gates in CI              | Ã¢â‚¬â€          |
| Configure Vitest coverage thresholds (40%/30%)      | Frontend | Coverage gates in CI              | Ã¢â‚¬â€          |
| Add coverage artifact upload to CI                  | DevOps   | Reports available on PR           | Ã¢â‚¬â€          |
| Create `test/factories/` directory with 3 factories | Backend  | Project, User, BlogPost factories | Ã¢â‚¬â€          |
| Create `test/test-seed.ts`                          | Backend  | Deterministic test data           | Factories        |
| Add `@faker-js/faker` and `jest-mock-extended`      | Backend  | Mocking + data generation         | Ã¢â‚¬â€          |

**Definition of done:**

- CI pipeline runs with Postgres service container
- Unit tests for API and web pass in CI
- Coverage reports are uploaded as artifacts
- `turbo.json` includes `test` task
- Factories exist for 3 core entities

---

### 11.2 Week 2: API Service Tests

**Goal:** Achieve 40%+ line coverage on the API by testing all P0 and P1 services.

| Task                                           | Owner   | Outcome                        | Dependencies |
| ---------------------------------------------- | ------- | ------------------------------ | ------------ |
| Write `projects.service.spec.ts` (12 tests)    | Backend | CRUD + filter + pagination     | Factories    |
| Write `sections.service.spec.ts` (8 tests)     | Backend | CRUD + ordering + filters      | Factories    |
| Write `skills.service.spec.ts` (8 tests)       | Backend | CRUD + category grouping       | Factories    |
| Write `testimonials.service.spec.ts` (8 tests) | Backend | CRUD + featured filter         | Factories    |
| Write `experiences.service.spec.ts` (8 tests)  | Backend | CRUD + date ordering           | Factories    |
| Write `services.service.spec.ts` (8 tests)     | Backend | CRUD                           | Factories    |
| Write `faqs.service.spec.ts` (8 tests)         | Backend | CRUD                           | Factories    |
| Write `case-studies.service.spec.ts` (8 tests) | Backend | CRUD + slug lookup             | Factories    |
| Expand `auth.service.spec.ts`                  | Backend | Complete auth coverage         | Ã¢â‚¬â€      |
| Expand `leads.service.spec.ts`                 | Backend | Rate limiting + spam detection | Ã¢â‚¬â€      |
| Write `media.service.spec.ts` (8 tests)        | Backend | File validation + upload       | Factories    |
| Write `chat.service.spec.ts` (8 tests)         | Backend | Message sending + history      | Factories    |

**Definition of done:**

- 12+ service test files (up from 3)
- ~100+ new service tests
- API line coverage Ã¢â€°Â¥ 40%
- All P0/P1 services have CRUD tests

---

### 11.3 Week 3: Component & Hook Tests

**Goal:** Achieve 55%+ line coverage on the web app by testing UI components and hooks.

| Task                                    | Owner    | Outcome                                       | Dependencies |
| --------------------------------------- | -------- | --------------------------------------------- | ------------ |
| Write `Button.test.tsx` (5 tests)       | Frontend | Variants, disabled, loading, click, keyboard  | Setup        |
| Write `Card.test.tsx` (4 tests)         | Frontend | Render, children, with/without image          | Setup        |
| Write `Input.test.tsx` (5 tests)        | Frontend | Value, placeholder, disabled, error, onChange | Setup        |
| Write `Navbar.test.tsx` (4 tests)       | Frontend | Render, mobile, active, keyboard              | Setup        |
| Write `Footer.test.tsx` (3 tests)       | Frontend | Render, links, responsive                     | Setup        |
| Write `ThemeToggle.test.tsx` (3 tests)  | Frontend | Toggle, initial, persistence                  | Setup        |
| Write `Tooltip.test.tsx` (4 tests)      | Frontend | Hover, leave, focus, position                 | Setup        |
| Write `CopyButton.test.tsx` (3 tests)   | Frontend | Copy, feedback, fallback                      | Setup        |
| Write `Contact.test.tsx` (4 tests)      | Frontend | Form, validation, submit, success             | Setup        |
| Write `BlogPreview.test.tsx` (3 tests)  | Frontend | Cards, images, tags                           | Setup        |
| Write `Hero.test.tsx` (3 tests)         | Frontend | Content, no content, responsive               | Setup        |
| Write hooks tests for 10 untested hooks | Frontend | Loading/success/error for each                | Ã¢â‚¬â€      |
| Add ResizeObserver mock to setup        | Frontend | Fix component rendering                       | Ã¢â‚¬â€      |
| Add Three.js canvas mock to setup       | Frontend | Fix 3D component tests                        | Ã¢â‚¬â€      |

**Definition of done:**

- 12+ component test files
- 10+ hook files tested (loading/success/error each)
- Web line coverage Ã¢â€°Â¥ 55%
- All P0 UI components have tests

---

### 11.4 Week 4: E2E & Integration Expansion

**Goal:** Reliable E2E coverage for all critical user journeys.

| Task                                        | Owner    | Outcome                          | Dependencies |
| ------------------------------------------- | -------- | -------------------------------- | ------------ |
| Write `login.spec.ts`                       | Frontend | Login/register/logout flows      | Test DB      |
| Write `admin-projects.spec.ts`              | Frontend | Admin project CRUD               | Test DB      |
| Write `admin-blog.spec.ts`                  | Frontend | Admin blog post CRUD             | Test DB      |
| Write `contact-form.spec.ts`                | Frontend | Contact form submit + validation | Test DB      |
| Write `blog-listing.spec.ts`                | Frontend | Blog pagination + filters        | Test DB      |
| Write `project-listing.spec.ts`             | Frontend | Project grid + filters           | Test DB      |
| Write `responsive.spec.ts`                  | Frontend | Mobile/tablet/desktop layouts    | Week 3 tests |
| Add Firefox to Playwright projects          | Frontend | Cross-browser coverage           | Week 3 tests |
| Set up E2E GitHub Actions job               | DevOps   | E2E runs in CI                   | Test DB      |
| Configure E2E artifact upload               | DevOps   | Reports available on PR          | Ã¢â‚¬â€      |
| Write integration tests for admin endpoints | Backend  | 20+ API contract tests           | Test DB      |

**Definition of done:**

- 6+ new E2E spec files (up from 2)
- Admin CRUD flows fully covered
- E2E runs in CI and blocks merge
- Firefox browser covered
- Integration tests for admin endpoints complete

---

### 11.5 Week 5: Accessibility & Visual Regression

**Goal:** Accessibility scanning on all page templates + pixel-level visual diffing.

| Task                                                | Owner    | Outcome                       | Dependencies |
| --------------------------------------------------- | -------- | ----------------------------- | ------------ |
| Extend `accessibility.spec.ts` (all page templates) | Frontend | Full a11y coverage            | E2E infra    |
| Add `@axe-core/playwright` as dependency            | Frontend | Tool available                | Ã¢â‚¬â€      |
| Configure axe rules (WCAG 2.2 AA)                   | Frontend | Rule set matches requirements | Ã¢â‚¬â€      |
| Write visual regression tests (10 screens)          | Frontend | Baseline screenshots          | E2E infra    |
| Set up visual diff threshold (0.1%)                 | Frontend | Tolerable change limit        | Ã¢â‚¬â€      |
| Add a11y CI to GitHub Actions                       | DevOps   | a11y blocks PRs               | E2E infra    |
| Create visual regression review process             | QA Lead  | Process documented            | Ã¢â‚¬â€      |
| Fix WCAG AA violations found by scanning            | Frontend | 0 violations baseline         | Scanning     |

**Definition of done:**

- All 8+ page templates scanned for a11y
- 0 WCAG 2.2 AA violations on critical pages
- 10+ baseline screenshots captured
- Visual regression CI job runs on every PR
- Visual diff review process documented

---

### 11.6 Week 6: Performance & Hardening

**Goal:** Performance budgets enforced in CI, remaining services covered, test debt tracked.

| Task                                          | Owner    | Outcome                      | Dependencies  |
| --------------------------------------------- | -------- | ---------------------------- | ------------- |
| Add Lighthouse CI to pipeline                 | DevOps   | Performance budgets enforced | CI access     |
| Configure Lighthouse budgets                  | Frontend | Budgets match targets        | Baseline data |
| Write remaining 10 service tests              | Backend  | All 27 services tested       | Factories     |
| Write remaining 10 component tests            | Frontend | All P1 components tested     | Ã¢â‚¬â€       |
| Write remaining 12 hooks tests                | Frontend | All 27 hooks tested          | Ã¢â‚¬â€       |
| Set up flaky test tracker                     | QA Lead  | Dashboard for flaky rate     | Ã¢â‚¬â€       |
| Write test debt backlog                       | QA Lead  | All gaps documented          | Ã¢â‚¬â€       |
| Run full test suite Ã¢â€ â€™ measure < 10 min | DevOps   | Performance target met       | Optimization  |
| Document all test commands in CONTRIBUTING.md | QA Lead  | Onboarding ready             | Ã¢â‚¬â€       |

**Definition of done:**

- Lighthouse CI in pipeline with budgets
- All 27 API services have tests
- All 27 web hooks have tests
- All P0/P1 UI components have tests
- Test suite completes in < 10 minutes
- Flaky test tracker operational
- Test debt backlog documented

---

### 11.7 Quarter 3 & Beyond

| Initiative                               | Target                           | Timeline              |
| ---------------------------------------- | -------------------------------- | --------------------- |
| Coverage threshold increase (70% lines)  | Hard gate                        | Q3 2026 (post Week 6) |
| Mutation testing with Stryker            | Additional quality signal        | Q3 2026               |
| k6 load testing                          | Performance regression detection | Q3 2026               |
| Security scanning (OWASP ZAP)            | Full DAST coverage               | Q3 2026               |
| Storybook integration for visual testing | Improved component visual tests  | Q4 2026               |
| AI-generated test suggestions            | Developer productivity           | Q4 2026               |
| Self-healing flaky tests (AI-assisted)   | Test maintenance reduction       | Q1 2027               |
| Visual diff per PR (auto-review)         | Zero manual visual review        | Q1 2027               |

---

## Appendix A: Current Test Inventory

### A.1 API Test Files (Current)

| File                                      | Type            | Tests   | Status           |
| ----------------------------------------- | --------------- | ------- | ---------------- |
| `src/modules/auth/auth.service.spec.ts`   | Unit            | ~15     | Ã¢Å“â€¦ Existing |
| `src/modules/blog/blog.service.spec.ts`   | Unit            | ~8      | Ã¢Å“â€¦ Existing |
| `src/modules/leads/leads.service.spec.ts` | Unit            | ~10     | Ã¢Å“â€¦ Existing |
| `test/app.e2e-spec.ts`                    | Integration/E2E | ~40     | Ã¢Å“â€¦ Existing |
| **Total**                                 |                 | **~73** |                  |

### A.2 Web Test Files (Current)

| File                                | Type            | Tests   | Status           |
| ----------------------------------- | --------------- | ------- | ---------------- |
| `src/test/__tests__/hooks.test.tsx` | Hook unit       | ~8      | Ã¢Å“â€¦ Existing |
| `src/test/__tests__/api.test.ts`    | API client unit | ~6      | Ã¢Å“â€¦ Existing |
| `e2e/homepage.spec.ts`              | E2E             | ~4      | Ã¢Å“â€¦ Existing |
| `e2e/accessibility.spec.ts`         | E2E/a11y        | ~4      | Ã¢Å“â€¦ Existing |
| **Total**                           |                 | **~22** |                  |

### A.3 Untested API Services (27 total, 24 untested)

- [ ] `modules/users/users.service.ts`
- [ ] `modules/testimonials/testimonials.service.ts`
- [ ] `modules/experiences/experiences.service.ts`
- [ ] `modules/skills/skills.service.ts`
- [ ] `modules/sections/sections.service.ts`
- [ ] `modules/services/services.service.ts`
- [ ] `modules/projects/projects.service.ts`
- [ ] `modules/case-studies/case-studies.service.ts`
- [ ] `modules/faqs/faqs.service.ts`
- [ ] `modules/media/media.service.ts`
- [ ] `modules/chat/chat.service.ts`
- [ ] `modules/notifications/notifications.service.ts`
- [ ] `modules/analytics/analytics.service.ts`
- [ ] `modules/achievements/achievements.service.ts`
- [ ] `modules/press-features/press-features.service.ts`
- [ ] `modules/guest-appearances/guest-appearances.service.ts`
- [ ] `modules/reading-list-items/reading-list-items.service.ts`
- [ ] `modules/availability-status/availability-status.service.ts`
- [ ] `modules/system-settings/system-settings.service.ts`
- [ ] `modules/feature-flags/feature-flags.service.ts`
- [ ] `modules/api-keys/api-keys.service.ts`
- [ ] `modules/activities/activities.service.ts`
- [ ] `common/export/csv.service.ts`
- [ ] `common/cleanup/cleanup.service.ts`

### A.4 Untested Web Hooks (27 total, 25 untested)

- [ ] `useUsers`, `useTestimonials`, `useSettings`, `useSkills`, `useServices`, `useSections`
- [ ] `useReadingList`, `usePublicData`, `usePressFeatures`, `useNotifications`, `useMedia`
- [ ] `useLeads`, `useGuestAppearances`, `useFeatureFlags`, `useFAQs`, `useExperiences`
- [ ] `useChatAdmin`, `useChat`, `useCaseStudies`, `useAvailability`, `useAuth`
- [ ] `useApiKeys`, `useAnalytics`, `useActivities`, `useAchievements`

---

## Appendix B: CI YAML Template (Target State)

See section [5.2 Target CI Pipeline](#52-target-ci-pipeline) for the full CI configuration.

---

## Appendix C: Glossary

| Term                  | Definition                                                                                |
| --------------------- | ----------------------------------------------------------------------------------------- |
| **Static Analysis**   | Analysis of code without executing it (TypeScript, ESLint)                                |
| **Unit Test**         | Tests a single unit of code in isolation (function, method)                               |
| **Integration Test**  | Tests multiple units working together (service + DB, controller + service)                |
| **E2E Test**          | Tests a complete user workflow in a browser or via API                                    |
| **Visual Regression** | Pixel-level comparison of screenshots to detect UI changes                                |
| **Flaky Test**        | A test that passes and fails non-deterministically                                        |
| **Coverage**          | Percentage of code lines/branches executed during tests                                   |
| **Mutation Testing**  | Tests the quality of tests by introducing code mutations and checking if tests catch them |
| **Test Debt**         | The accumulated cost of missing or inadequate tests                                       |
| **Quality Gate**      | A condition that must be met before code can proceed to the next stage                    |
| **Service Container** | A Docker container providing a dependency (e.g., Postgres) in CI                          |
| **Factory**           | A function that generates test data with sensible defaults                                |
| **Seed**              | A script that populates the database with predetermined test data                         |

---

## Appendix D: References

| Document                                       | Purpose                                        |
| ---------------------------------------------- | ---------------------------------------------- |
| `docs/35-quality/TestingArchitecture.md`       | Enterprise testing architecture (aspirational) |
| `docs/35-quality/30-QA.md`                     | QA process, release gates, bug severity        |
| `docs/21-operations/25-CICD.md`                | CI/CD pipeline configuration                   |
| `docs/05-architecture/SystemArchitecture.md`   | System architecture for test context           |
| `docs/35-quality/PerformanceArchitecture.md`   | Performance testing strategy                   |
| `docs/35-quality/AccessibilityArchitecture.md` | Accessibility testing strategy                 |
| `CONTRIBUTING.md`                              | Developer onboarding and test commands         |
| `apps/api/jest.config.ts`                      | Jest configuration                             |
| `apps/web/vitest.config.ts`                    | Vitest configuration                           |
| `apps/web/playwright.config.ts`                | Playwright configuration                       |
| `.github/workflows/ci.yml`                     | CI workflow definition                         |

---

_This document is a living strategy guide. It should be reviewed monthly by the QA Lead and updated as the testing infrastructure evolves. All dates and targets are ambitious but achievable Ã¢â‚¬â€ adjust based on actual velocity, not aspiration._

## Cross-References

- [TESTING-ARCHITECTURE.md](./TESTING-ARCHITECTURE.md) — Canonical testing architecture document
- [QA-OVERVIEW.md](./QA-OVERVIEW.md) — QA processes, release gates, bug severity
- [TESTING-IMPLEMENTATION.md](./TESTING-IMPLEMENTATION.md) — Implementation-level test patterns
- [TEST-PLAN.md](./TEST-PLAN.md) — Master test plan template
- [../MASTER-INDEX.md](../MASTER-INDEX.md) — Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) — Cross-reference system
