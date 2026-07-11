# Code Review Checklist — FAANG Enterprise Standard

> **Document:** `CodeReviewChecklist.md` | **Version:** 5.0 (Enterprise Upgrade) | **Last Updated:** July 2026  
> **Status:** ✅ Active | **Owner:** Principal Staff Engineer | **Review Cadence:** Quarterly

## 1. Executive Summary
This document enforces the rigorous FAANG-level code review process used across all repositories in the monorepo. It serves as a mandate for reviewers to ensure high code quality, security, performance, and adherence to architecture guidelines.

## 2. Reviewer Mindset
- **Empathy:** Be respectful and constructive. Assume good intent.
- **Rigor:** Do not compromise on architectural boundaries, type safety, or test coverage.
- **Velocity:** Review within 4 business hours for small PRs (<100 lines), 24 hours for large PRs.
- **Ownership:** Every reviewer is accountable for the code they approve.

## 3. Functionality Checklist
- [ ] **Edge cases:** Are empty states, null inputs, and boundary values handled? Test string max length, array bounds, file size limits.
- [ ] **Error handling:** Are try/catch blocks present around fallible operations? Are errors logged with sufficient context?
- [ ] **Input validation:** Does the code validate all external inputs (API params, form fields, URL query params) via Zod schemas?
- [ ] **Null safety:** Are null/undefined checks in place before accessing nested properties? Avoid `?.` chains without fallback.
- [ ] **State transitions:** Are loading, success, empty, and error states all handled in UI components?
- [ ] **Race conditions:** Are there any async race conditions (stale closures, outdated API responses) that could corrupt state?
- [ ] **Idempotency:** Can the operation be safely retried without side effects?
- [ ] **Data integrity:** Are database transactions used for multi-step mutations? Are foreign key constraints respected?
- [ ] **Type guards:** Are runtime type checks (Zod parse, instanceof) used at API boundaries to catch malformed data?

## 4. Security Checklist
- [ ] **Authentication:** Are all admin routes guarded by `@UseGuards(JwtAuthGuard, RolesGuard)`? Is `@Public()` explicitly applied to public routes?
- [ ] **Authorization:** Do role checks (`@Roles('admin')`) match the least-privilege principle? Can a viewer escalate to admin via API manipulation?
- [ ] **XSS prevention:** Is user-generated content sanitized before rendering (React dangerouslySetInnerHTML avoided)?
- [ ] **SQL injection:** Are all database queries using parameterized Prisma queries? Raw queries must use bind parameters.
- [ ] **Rate limiting:** Are public endpoints protected by `ThrottlerGuard`? Are auth endpoints throttled more aggressively?
- [ ] **Secrets:** Are API keys, tokens, and connection strings loaded from environment variables (never hardcoded)?
- [ ] **CORS:** Does the CORS origin whitelist (`CORS_ORIGIN`) match the deployed domains only?
- [ ] **CSRF:** Are state-changing requests protected? For cookie-based auth, are SameSite and CSRF tokens used?
- [ ] **Dependency supply chain:** Is the new dependency vetted for maintenance status, known vulnerabilities, and license compatibility?
- [ ] **Logging sensitivity:** Are passwords, tokens, and PII excluded from log output?

## 5. Performance Checklist
- [ ] **Bundle size:** Did the PR add a new dependency? Could tree-shaking be affected? Check `@next/bundle-analyzer` output.
- [ ] **Memoization:** Are expensive computations wrapped in `useMemo` or `useCallback`? Is `React.memo` applied to heavy components?
- [ ] **Lazy loading:** Are route segments and heavy components (3D scenes, chart libraries) lazy-loaded with `next/dynamic`?
- [ ] **Re-renders:** Are unnecessary re-renders avoided? Check that callbacks and object props are stable (no inline arrow functions in render).
- [ ] **N+1 queries:** Are Prisma queries using `include` or `select` efficiently? Is there any loop-based querying that should use `findMany` with `where`?
- [ ] **Image optimization:** Are images using `next/image` with proper `sizes` and `loading="lazy"`?
- [ ] **Cache strategy:** Are API responses cached at the NestJS controller layer with `@CacheTTL`? Are static pages using ISR?
- [ ] **Database indexing:** Do new query patterns have the appropriate database indexes?

## 6. Testing Checklist
- [ ] **Unit tests:** Are new functions covered by unit tests? Are they testing behavior, not implementation?
- [ ] **Edge cases in tests:** Do tests cover empty/null inputs, error responses, boundary values, and loading states?
- [ ] **Integration tests:** Do tests verify the interaction between components/services, not just isolated units?
- [ ] **Test readability:** Are test names descriptive (`should return 404 when project id does not exist`)? Are tests using Arrange-Act-Assert pattern?
- [ ] **Mocking discipline:** Are mocks scoped to the test? Are external services (APIs, LLMs) mocked at the boundary?
- [ ] **Snapshot scope:** Are snapshots as small as possible (specific UI fragment, not entire page)?

## 7. Style & Maintainability Checklist
- [ ] **Naming:** Do variable, function, and component names clearly convey intent? Are abbreviations avoided unless universally understood?
- [ ] **Formatting:** Does the code pass `npm run format` (Prettier) and `npm run lint` (ESLint)?
- [ ] **Dead code:** Are there commented-out code blocks, unused imports, or unreachable branches?
- [ ] **Console.log:** Are debug log statements removed? Is there any client-side console.log in production code?
- [ ] **File size:** Is the file under 300 lines? If not, consider splitting into smaller modules.
- [ ] **Complexity:** Is cyclomatic complexity reasonable? Consider extracting deeply nested conditionals into helper functions.
- [ ] **Consistency:** Does the code follow the same patterns as adjacent modules (same error handling, same import style)?

## 8. Documentation Checklist
- [ ] **JSDoc/TSDoc:** Are public APIs, complex algorithms, and non-obvious logic documented with JSDoc?
- [ ] **README updates:** If the PR changes setup steps, environment variables, or architecture, is the README updated?
- [ ] **Changelog:** Does the PR description include a changelog entry? For significant changes, is the changelog file updated?
- [ ] **Decision Log:** If the PR introduces a new architectural pattern or tool, is a decision recorded in `DecisionLog.md`?
- [ ] **Cross-references:** Are links to related docs, ADRs, and design specs included in the PR description?

## 9. PR Description Requirements
Every PR description MUST include:
- **What:** Summary of the change (2-3 sentences)
- **Why:** Business or technical rationale
- **How:** Approach taken, key implementation details
- **Test Plan:** Steps to verify the change locally
- **Screenshots/GIFs:** For UI changes, include before/after visuals
- **Checklist:** Links to related issues, docs, and dependency PRs

## 10. Domain-Specific Checks
- **Frontend:** WCAG 2.1 AA accessibility, mobile responsiveness, Lighthouse score impact, animation performance (60 FPS).
- **Backend:** Transactional integrity, caching strategies, rate limiting, connection pool management.
- **AI/LLM:** Prompt injection defenses, fallback mechanisms, hallucination checks, cost analysis for new LLM calls.
- **Database:** Migration safety (no destructive changes without review), query plan analysis for new joins.
