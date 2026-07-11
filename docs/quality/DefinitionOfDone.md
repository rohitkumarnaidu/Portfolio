# Definition of Done (DoD) — FAANG Enterprise Quality Standard

> **Document:** `DefinitionOfDone.md` | **Version:** 5.0 (Enterprise Upgrade) | **Last Updated:** July 2026  
> **Status:** ✅ Active | **Owner:** Principal QA Lead | **Review Cadence:** Quarterly

## 1. Executive Summary
The Definition of Done ensures that all features, bug fixes, and infrastructure changes deployed to production meet rigorous FAANG-level enterprise standards. A ticket is not "Done" until every condition below is satisfied. DoD is enforced at the PR merge gate and verified during release sign-off.

## 2. Universal Requirements (All Work Types)
- [ ] Code is peer-reviewed and approved by at least 1 domain expert. Architecture changes require 2 approvals.
- [ ] All code conforms to [Coding Standards](../docs/governance/CodingStandards.md) and passes static analysis (`npm run lint`, `npm run typecheck`).
- [ ] No new technical debt has been introduced without explicit documentation in the project backlog.
- [ ] All automated CI checks pass (lint, typecheck, unit tests, integration tests, security scan).
- [ ] Branch is up to date with `main` and has no merge conflicts.
- [ ] Secrets and credentials are not hardcoded (verified by pre-commit hooks).
- [ ] Corresponding documentation in `/docs` is updated.

## 3. Feature Work
- [ ] **Code reviewed:** PR approved by at least 1 domain expert.
- [ ] **Unit tests:** All new business logic has unit tests with ≥ 90% branch coverage.
- [ ] **Integration tests:** New API endpoints or service methods have integration tests against a real/staged database.
- [ ] **E2E tests:** Critical user journeys for the feature are covered by Playwright E2E tests.
- [ ] **No regressions:** Existing test suite passes with no regressions.
- [ ] **Accessibility:** Feature passes automated a11y checks (axe-core in CI). Keyboard navigation and screen reader flow verified.
- [ ] **Performance:** Lighthouse scores remain ≥ 90 for all categories. No bundle size regression > 5%.
- [ ] **Feature flag:** High-risk features are behind a feature flag for staged rollout.
- [ ] **Responsive design:** Feature works correctly on mobile (375px), tablet (768px), and desktop (1440px) viewports.
- [ ] **Error states:** Loading, empty, error, and edge-case states are implemented and tested.
- [ ] **API documentation:** New/updated endpoints are reflected in Swagger docs (NestJS auto-docs).
- [ ] **Shared types:** API contracts are updated in `packages/shared` Zod schemas.

## 4. Bug Fix
- [ ] **Root cause identified:** The root cause is documented in the PR description or ticket comments.
- [ ] **Regression test:** A test is added that reproduces the bug to prevent re-introduction.
- [ ] **Verified on staging:** Fix is deployed to staging and confirmed working with the same steps that reproduced the bug.
- [ ] **Impact analysis:** Assessed whether the same bug pattern exists elsewhere in the codebase.
- [ ] **Logging added:** If the bug was hard to diagnose, additional structured logging is added to aid future debugging.
- [ ] **SEV-1/SEV-2:** Critical/high bugs have a post-mortem within 48 hours.

## 5. Refactor / Technical Debt
- [ ] **Behavior preserved:** No observable behavior changes. All existing tests pass without modification (except where tests reflected buggy behavior).
- [ ] **No new warnings:** No new lint, type, or compiler warnings introduced.
- [ ] **Migration guide:** If the refactor changes public APIs (service methods, component props, Zod schemas), a migration guide is provided.
- [ ] **Deprecation notices:** Deprecated APIs are marked with `@deprecated` JSDoc and a removal timeline.
- [ ] **Performance baseline:** Verify the refactor does not degrade performance (run relevant benchmarks).
- [ ] **Cleanup:** Temporary code, debug logs, and migration shims are removed.

## 6. Documentation Change
- [ ] **Reviewed for accuracy:** Content is fact-checked against the current codebase behavior.
- [ ] **Cross-references validated:** All internal links (`../`) resolve correctly. All code examples compile or run.
- [ ] **Examples working:** CLI commands, API requests, and code snippets are tested.
- [ ] **Spelling & grammar:** Passes spell-check. Tone matches the project documentation style.
- [ ] **Version stamps:** Document version and last-updated date are incremented.

## 7. Infrastructure / DevOps
- [ ] **Infrastructure as Code:** All provisioning changes are reflected in Terraform/config files, not manual console changes.
- [ ] **Rollback plan:** Changes are reversible. A rollback procedure is documented.
- [ ] **Monitoring:** New components/services have health check endpoints and are added to the monitoring dashboard.
- [ ] **Alerting:** Relevant alerts are configured for failure modes of the new infrastructure.
- [ ] **Secret rotation:** Any new secrets are added to the vault (Doppler/Vercel) and rotated per policy.

## 8. Release Sign-Off Gates
| Gate | Criteria | Signatory |
|------|----------|-----------|
| Code Complete | All code merged to main, all DoD items checked | Tech Lead |
| Test Pass | All automated tests pass on CI, coverage ≥ 90% | QA Lead |
| Staging Verification | Feature verified on staging, smoke tests pass | Product Owner |
| Security Scan | SAST + dependency scan pass, no new critical findings | Security Lead |
| Production Deploy | Release deployed, post-deploy smoke tests pass | DevOps Lead |

## 9. DoD Exceptions
- Exceptions to DoD must be documented in the PR description with a justification.
- DoD exceptions require approval from both the Tech Lead and QA Lead.
- Exceptions automatically expire and must be resolved within 2 sprints.
