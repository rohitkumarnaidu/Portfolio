---
name: Design System Check
description: Verify UI changes follow the portfolio design contract — token discipline, anti-generic checklist (spec §7), WCAG AA contrast pairs, and performance budgets. Use before finishing any UI PR or after editing styles, themes, skins, or components.
---

## When to run

Any change to styles, theming, skins, or public/admin components. Run **before** claiming UI work is done.

## Workflow

1. Read `DESIGN.md` (repo root) — the contract. Exact locked values: `docs/superpowers/specs/2026-11-13-portfolio-themes-design.md` §3.
2. **Token discipline:** grep the diff for raw hex (`#rgb`/`#rrggbb`) and primitive color names outside the token files. Components use semantic tokens only — CSS variables from `src/styles/globals.css` (today) or the DTCG semantic/component layers (after Phase 0). Statuses come from the constant status tokens, never the brand accent.
3. **Anti-generic checklist (spec §7):** walk every banned + required item and record pass/fail with evidence.
4. **Contrast:** every new/changed text/background pair ≥ WCAG AA in **both** light and dark. Check each skin × scheme the change touches.
5. **Budgets:** LCP ≤2.5s (target <1.5s Default view) · CLS <0.1 · INP <200ms · per-skin CSS <8KB · <100 draw calls in the Signature view.
6. **One signature element:** the copper trace does real work; no second 3D scene was introduced.
7. Report as a table — check / result / evidence. Failures block the change.
