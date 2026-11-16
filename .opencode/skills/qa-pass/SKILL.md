---
name: QA Pass
description: Pre-ship quality gate for this monorepo — typecheck, lint, API (Jest) and web (Vitest/Playwright) tests, build, and the anti-generic checklist. Run before pushing or declaring work done.
---

## Workflow (run from repo root unless noted)

1. `npm run typecheck` and `npm run lint` — zero errors.
2. API tests: from `apps/api`, `npm run test:coverage` (global coverage threshold is 40% — it is the real gate).
3. Web tests: from `apps/web`, `npm run test:coverage` (Vitest floors are deliberately low — raise them when adding tests, never lower them).
4. e2e (when UI changed): from `apps/web`, `npm run test:e2e` (chromium).
5. Build: `npm run build` (Turbo, `^build` order).
6. UI changed? Run the `design-system-check` skill and attach its table.
7. Update `PROGRESS.md`: strike through completed items (never delete), add a session-log line with what passed and what's open.
8. Do **not** push without user confirmation — work lands on a named branch, never direct to `main`.
