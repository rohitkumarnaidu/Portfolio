# Frontend Testing Strategy

> **Document:** `FrontendTestingStrategy.md` | **Version:** 2.0 | **Last Updated:** July 2026
> **Status:** ✅ Active | **Owner:** QA Lead

This document outlines the testing methodologies, tools, and CI/CD pipelines used to ensure the reliability of the Next.js frontend, Admin Dashboard, and 3D portfolio experiences.

## Testing Stack

| Layer                | Tool                           | Purpose                                   |
| -------------------- | ------------------------------ | ----------------------------------------- |
| Unit & Integration   | Vitest + React Testing Library | Component render, interaction, hook logic |
| E2E                  | Playwright                     | Critical user journeys                    |
| Visual Regression    | Playwright screenshot diff     | UI consistency                            |
| Accessibility        | axe-core (Vitest + Playwright) | WCAG 2.1 AA compliance                    |
| Type Checking        | TypeScript `tsc --noEmit`      | Static type safety                        |
| Linting & Formatting | ESLint + Prettier + Husky      | Code style enforcement                    |

## 1. Unit Testing (Vitest)

Unit tests isolate small, discrete pieces of logic.

### 1.1 Scope

- **Custom React hooks:** `useAISession`, `useProjectFilter`, `useDebounce`, `useMediaQuery`.
- **Zustand stores:** Reducers and actions tested independently of UI.
- **Utility functions:** Date formatting, URL parsing, math helpers for 3D, string manipulation.
- **Zod schemas:** Schema parsing and validation error messages.

### 1.2 What NOT to Test

- Next.js built-in routing logic (tested via E2E).
- CSS styling (unless testing conditional class logic).
- Third-party library internals.

### 1.3 Execution

```bash
npm test              # Run all tests (Vitest)
npm run test:watch    # Watch mode for TDD
npm test -- src/lib/hooks/useDebounce.test.ts  # Single file
```

## 2. Component Testing (RTL)

Components are tested based on user behavior, not implementation details.

### 2.1 What to Test

- **Render:** Does the component render with default props? With required props? With children?
- **Interaction:** Do buttons fire correct callbacks? Do forms validate on submit?
- **Accessibility:** Are ARIA attributes present? Can the component be navigated with keyboard?
- **Snapshots:** Small, targeted snapshots (individual component, not full page) to catch unintended changes.

### 2.2 Shared UI Components (`packages/ui`)

- Every primitive (Button, Input, Dialog, Select) has render + interaction + a11y tests.
- Radix UI wrapper behavior verified (open/close, focus trapping, escape key).

### 2.3 Admin Dashboard

- Form integration with React Hook Form + Zod validation.
- Error display for each field.
- Loading states during form submission.
- Success and error toast notifications.

### 2.4 Mocking Strategy

- **API calls:** Mock Service Worker (MSW) intercepts fetch requests. Handlers mirror the NestJS API contracts.
- **Router:** Mock `useRouter` and `useSearchParams` from `next/navigation`.
- **3D Canvas:** Mock `<Canvas>` from `@react-three/fiber` to prevent WebGL errors in JSDOM.

## 3. Hook Testing

### 3.1 Test Patterns per Hook

Every custom hook is tested for these states using `renderHook` from `@testing-library/react`:
| State | What to Verify |
|-------|----------------|
| Initial | Default return values, initial loading state |
| Loading | Loading flag is true during async operation |
| Success | Data returned correctly, loading flag is false |
| Error | Error state set, error message surfaced, loading flag is false |
| Edge cases | Empty array, null input, rapid re-renders, unmount before resolution |

### 3.2 Example Pattern

```typescript
describe('useProjects', () => {
  it('should return loading state initially');
  it('should return projects on success');
  it('should return error message on failure');
  it('should refetch when filter changes');
  it('should not set state after unmount');
});
```

## 4. Integration Testing (RTL)

Integration tests verify that multiple components work together correctly.

### 4.1 Component Composition

- Does the parent pass correct props to children?
- Do nested components share state correctly (Context, Zustand)?
- Does a form page wire up inputs, validation, submit button, and API call correctly?

### 4.2 Data Flow

- **Page-level:** Renders a page with mocked API data. Verify that data flows from page component to section component to card component.
- **Filter/Sort:** Does changing a filter update the displayed list? Does clearing filters reset to all items?
- **Pagination:** Does clicking "next page" fetch and display the next set of items?

### 4.3 Event Handling

- Form submission triggers correct API call with correct payload.
- Toast/notification fires on success/error.
- Navigation occurs after form submit (redirect to detail page).

## 5. End-to-End Testing (Playwright)

See [E2EStrategy.md](E2EStrategy.md) for full details.

### 5.1 Critical Paths

- Admin auth: Login, JWT persistence, protected route access, logout.
- Content management: CRUD for projects, blog posts, media.
- AI Chat: Submit prompt, stream response, verify chat history.
- Portfolio navigation: Home to Projects to Detail, Blog to Post, Contact form submit.

### 5.2 Execution

- Every PR: Chromium only, critical paths.
- Nightly: Chromium + Firefox + WebKit, full suite.
- Pre-deployment: Full suite against staging environment.

## 6. Visual Regression Testing

### 6.1 Approach

- Playwright's `toHaveScreenshot()` for key pages and components.
- Snapshots stored in `e2e/snapshots/` alongside test files.
- CI compares PR snapshots against `main` baseline.
- 3D canvases use relaxed thresholds due to WebGL non-determinism.

### 6.2 When to Update Baselines

- Intentional UI changes (component redesign, layout shift).
- After a major dependency update that changes styling.
- Baselines are re-generated by deleting old snapshots and running with `--update-snapshots`.

## 7. Accessibility Testing (axe-core)

### 7.1 Automated (CI)

- **Unit level:** jest-axe runs on every component test. Verifies no auto-detected violations.
- **E2E level:** Playwright a11y scan on every page. Full page audit for WCAG 2.1 AA compliance.
- **Threshold:** Zero violations allowed in CI.

### 7.2 Manual (Pre-Release)

- Keyboard navigation audit: Tab through all interactive elements, verify focus order.
- Screen reader audit: NVDA (Windows) and VoiceOver (macOS) for dynamic content.
- Color contrast: Verify against design tokens, not just minimum ratio.

## 8. 3D & WebGL Testing Strategies

Testing React Three Fiber is notoriously difficult. We adopt a pragmatic approach:

- **Isolate logic:** Extract complex math and state out of `useFrame` into pure functions. Unit test those.
- **Component mocking:** Mock `<Canvas>` in RTL tests to prevent WebGL context errors in JSDOM.
- **Visual regression:** Playwright screenshots with animation paused and camera locked. Deterministic state for comparison.
- **Performance monitoring:** Stats.js in dev mode to track draw calls and FPS during manual QA.

## 9. Coverage Targets

| Category                 | Target              | Method                               |
| ------------------------ | ------------------- | ------------------------------------ |
| Components (packages/ui) | 70%                 | Vitest + RTL, line coverage          |
| Hooks                    | 80%                 | Vitest + renderHook, branch coverage |
| Utilities                | 90%                 | Vitest, branch coverage              |
| Integration (page-level) | 60%                 | Vitest + MSW, line coverage          |
| E2E (critical paths)     | 100% of P0 journeys | Playwright                           |
| E2E (admin flows)        | 50% of P1 journeys  | Playwright                           |

## 10. CI/CD Pipeline Integration

All tests run via GitHub Actions:

1. **Pull Request (every push):**
   - `npm run lint` (5 min)
   - `npm run typecheck` (3 min)
   - `npm test` (Vitest, unit + integration, 10 min)
   - `npx playwright test --project=chromium` (15 min)

2. **Merge to Main (post-merge):**
   - Full `npm test` suite
   - Visual regression baseline update
   - Accessibility full-page audit

3. **Pre-Deployment (nightly):**
   - Cross-browser E2E (Chromium + Firefox + WebKit)
   - Visual regression on staging
   - Full a11y scan
