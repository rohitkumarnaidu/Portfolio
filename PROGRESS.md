# PROGRESS.md

> **Status:** PHASE 0 · FOUNDATION COMPLETE on branch `feat/phase0-tokens` (9 tasks; PR pending user review — **not merged**) · next: Phase 1 · Content path
> **Updated:** 2026-11-18

**File rules:** never delete a completed item — strike it through (`~~text~~`). Update the status line, phase table, and add a session-log entry at the **end of every work session**. Newest log entries first.

---

## Phase status

| Phase                      | Status         | Notes                                                                                                                                                                           |
| -------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Research (askA–askL)       | ✅ done        | 12 grounded passes; Skin 3 token system locked (`#C1662E` copper / `#2F5FD1` cobalt / graphite)                                                                                 |
| Spec                       | ✅ approved    | `docs/superpowers/specs/2026-11-13-portfolio-themes-design.md` + §11 audit amendments                                                                                           |
| Groundwork                 | ✅ done        | repo cleanup + docs archive + agent setup + tree repair, branch `chore/groundwork-cleanup`                                                                                      |
| Micro-decisions (askM)     | ✅ done        | 8/8 resolved (spec §12): 4 locked pass 1; fonts confirmed + OG/switcher/MCP **reversed to defer-or-static** in second pass                                                      |
| Phase 0 · Foundation       | ✅ done        | 9/9 tasks on `feat/phase0-tokens` · 49 token tests · 20/20 contrast pair-scheme checks · skin 3 = 1,845 B < 8,192 · CI `tokens` job (build/test/contrast/budget/dist freshness) |
| Phase 1 · Content path     | ⬜ not started | Default view funnel (hero-lite → case studies → capabilities → principles → contact) · machine layer · contact security verify-then-align                                       |
| Phase 2 · Signature        | ⬜ not started | 3D instrument hero · fallbacks · AI-state trace binding                                                                                                                         |
| Phase 3 · Skins & switcher | ⬜ not started | Skin 1/2 token blocks · archive posture · _public switcher UI deferred until a second skin ships (askM Q4)_                                                                     |
| Phase 4 · Machine extras   | ⬜ not started | AI console chat (pgvector audit first) · GitHub activity · _MCP endpoint deferred to post-stability (askM Q6)_                                                                  |

### Phase 0 acceptance (spec §3.7)

- [x] **`tokens.json` (DTCG) is the single source; CSS custom properties generated from it; no hex in component CSS.** — `packages/tokens/tokens.json` → `build.mjs` → committed `dist/theme-tokens.css`; components consume semantic roles through the `globals.css` alias bridge (legacy hex remains only in `public.css` + older 3D/admin code — Phase 1/2 demolition sites per the plan).
- [x] **No-flash: inline pre-paint script applies persisted `data-scheme` + `data-skin`.** — `apps/web/src/lib/theme-script.ts`, injected in `layout.tsx`'s `<head>`, resolves storage → OS → defaults and writes both attributes before paint; `e2e/theme-no-flash.spec.ts` covers it (not re-run in this gate — e2e has 12 pre-existing base failures, out of scope).
- [x] **Per-skin CSS block < 8KB, verified in CI.** — `node packages/tokens/src/check-budget.mjs`: skin 3 = 899 B light + 946 B dark = **1,845 B** < 8,192 B, exit 0; enforced by the new `tokens` CI job.
- [x] **Every semantic text/background pair ≥ WCAG AA in both schemes (automated).** — `node packages/tokens/src/check-contrast.mjs`: **20/20** pair-scheme checks pass (14 `AA_NORMAL`, 4 `AA_LARGE`, 2 `NONE`), exit 0; enforced by CI.
- [x] **`DESIGN.md` written (this spec's §3 condensed) — the AI-tool drift shield.** — root `DESIGN.md` §2 rewritten to the shipped pipeline, dual-attribute contract, IBM Plex fonts and alias-bridge/Phase 1 deletion plan.

---

## Session log

### 2026-11-18 — Phase 0 foundation

- **Shipped:** Phase 0 complete on `feat/phase0-tokens` (9/9 tasks; PR pending user review — **not merged**): `@portfolio/tokens` package (`tokens.json` DTCG source, WCAG math, deterministic `build.mjs` + committed `dist/theme-tokens.css`), IBM Plex Sans/Mono swap (serif role removed), no-flash dual-attribute theme provider (`data-scheme` × `data-skin`, legacy `data-theme` mirror + migration), `globals.css` legacy alias bridge, AA contrast checker + spec §14 reconciliation, per-skin CSS budget checker, and a CI `tokens` job enforcing build/test/contrast/budget/dist freshness (no `npm ci` — the package has zero dependencies).
- **Evidence (this session):** token tests 49/49 · contrast 20/20 pair-scheme checks · skin 3 = 1,845 B (899 B light + 946 B dark) < 8,192 B · dist byte-identical after rebuild (`git diff --exit-code` clean). Full gate: `typecheck` 4/4 workspaces · `lint` 4/4 · API 38 suites / 460 tests · web 7 files / 63 tests · `build` 3/3 — all exit 0.
- **Caveats:** (1) 12 pre-existing e2e failures remain — title/content drift + specs needing an API the e2e webServer doesn't start; proven on the base commit, out of Phase 0 scope, and e2e is not part of `npm test`. (2) Deferred minors from task reviews stay in the SDD ledger (unit-test breadth, parser hardening, symlink CLI guard). (3) `packages/tokens` has no `lint` script and lint-staged's globs don't match `.mjs`, so root lint skips the token sources — enforcement is `node --test` + the CI `tokens` job. (4) API Jest prints a pre-existing "worker process failed to exit gracefully" warning but exits 0. (5) Legacy raw hex remains in `public.css` and older 3D/admin components — Phase 1/2 demolition, not introduced here.

### 2026-11-16 — groundwork session

- Full repo audit (explore agent): code healthy (real CI, 38 api specs, 6 web test files, 4 e2e specs); docs tree 208 files mostly aspirational.
- **Decisions:** docs → archive + fix (subagent running); ~40 merged stale remote branches → prune after commits; 4 spec amendments applied (A1 hand-rolled dual-attribute theming, A2 Phase 0 = refactor existing tokens, A3 contact verify-then-align, A4 keep no-RAG + audit pgvector chat plumbing).
- **Cleanup done:** spec approved + §11 appended · `packages/shared/src/env.ts` deleted (unused, validated removed vars) · `docs/superpowers/` tracked · `.gitignore` pruned (Python/Supabase/scratch entries; `.opencode` skills trackable) · `fonts.ts` doc pointers fixed · both `.env.example` files cleaned (Supabase removed, dead refs removed, `AI_API_URL`/`OPENAI_API_KEY` annotated legacy) · dead deps `next-themes` + `@supabase/supabase-js` uninstalled (commit `beb2d47`).
- **Agent setup done:** `AGENTS.md` rewritten (4 false path claims fixed, working rules added) · `DESIGN.md` created · this file created · 3 project skills live in `.opencode/skills/` (`design-system-check`, `new-section`, `qa-pass`) — mechanism verified.
- **Docs archived & fixed:** 23 aspirational docs → `docs/archive/` (+ README) · TECHSTACK mojibake actually repaired (earlier pass never wrote the file) + FastAPI/Supabase removed from current state · QUALITY-GATES corrected to real thresholds · api README Redis→Postgres · 2 placeholder READMEs deleted · MASTER-INDEX regenerated (commit `8d9f052`).
- **Branch hygiene:** remote was already clean (GitHub auto-deletes merged heads); the "~40 stale branches" were stale local tracking refs — fixed with `git fetch --prune`. 6 open dependabot branches kept (live PRs).
- **Tree repaired:** Windows npm churn had damaged extraction in 6 packages (`class-transformer`, `framer-motion`, `lucide-react`, `@hookform/resolvers`, `motion-dom`, `motion-utils`) — all restored by delete + re-extract; **`npm run typecheck` green on all 5 workspaces**.
- **Micro-decisions resolved:** Q3/Q5/Q7/Q8 locked in first pass; second pass confirmed Q1 (fonts) and reversed Q2/Q4/Q6 to defer-or-static (spec §12, commit `944a8d3` + §12 update).
- **Groundwork closed.** Next session: writing-plans → implementation plan → Phase 0 build.

<!--
Older sessions will be appended above this comment. Keep entries concise: date, what happened, what's open.
-->
