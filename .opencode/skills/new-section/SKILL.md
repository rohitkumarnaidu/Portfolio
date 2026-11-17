---
name: New Public Section
description: Workflow for adding or rebuilding a public portfolio section (hero, flagship work, capabilities, principles, contact) in apps/web. Enforces funnel order, content-source rules, token discipline, a11y, and tests.
---

## Before building

1. Read `DESIGN.md` (root) and spec §5: section order is **build order AND reading order** — hero-lite → flagship work → capabilities → principles → contact. Don't reorder or add sections.
2. Content comes from `apps/web/src/lib/public-content.ts` (curated fallback); API-published content overrides when present. Never hardcode new facts into components.

## Workflow

1. Component goes in `src/components/public/` following the existing pattern; page wiring in `src/app/(public)/`.
2. Tokens only — no raw hex. Respect 70-20-10; the one signature element (copper trace) does real work.
3. **Every element must work with 3D disabled** — the Default view is the site.
4. A11y: skip-link targets, ARIA landmarks, `focus-visible`, `prefers-reduced-motion` (120ms opacity fades only).
5. Tests: Vitest unit test for the component; extend the matching Playwright spec in `apps/web/e2e/` (homepage / projects / contact / accessibility).
6. Run the `design-system-check` skill before finishing.
7. Update `PROGRESS.md` (strike-through completed items, add a session-log line).
