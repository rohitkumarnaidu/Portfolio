# PROGRESS.md

> **Status:** GROUNDWORK COMPLETE (branch `chore/groundwork-cleanup`, 7 commits, not pushed) — spec ✅ approved · micro-decisions ✅ resolved · next: writing-plans → Phase 0
> **Updated:** 2026-11-16

**File rules:** never delete a completed item — strike it through (`~~text~~`). Update the status line, phase table, and add a session-log entry at the **end of every work session**. Newest log entries first.

---

## Phase status

| Phase                      | Status         | Notes                                                                                                                                     |
| -------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Research (askA–askL)       | ✅ done        | 12 grounded passes; Skin 3 token system locked (`#C1662E` copper / `#2F5FD1` cobalt / graphite)                                           |
| Spec                       | ✅ approved    | `docs/superpowers/specs/2026-11-13-portfolio-themes-design.md` + §11 audit amendments                                                     |
| Groundwork                 | ✅ done        | repo cleanup + docs archive + agent setup + tree repair, branch `chore/groundwork-cleanup`                                                |
| Micro-decisions (askM)     | ✅ done        | 8/8 resolved (spec §12): 4 locked pass 1; fonts confirmed + OG/switcher/MCP **reversed to defer-or-static** in second pass                |
| Phase 0 · Foundation       | ⬜ not started | tokens.json + generator · no-flash dual attrs (`data-scheme`×`data-skin`) · AA contrast checks · <8KB skin-CSS budget · theme provider    |
| Phase 1 · Content path     | ⬜ not started | Default view funnel (hero-lite → case studies → capabilities → principles → contact) · machine layer · contact security verify-then-align |
| Phase 2 · Signature        | ⬜ not started | 3D instrument hero · fallbacks · AI-state trace binding                                                                                   |
| Phase 3 · Skins & switcher | ⬜ not started | Skin 1/2 token blocks · archive posture · _public switcher UI deferred until a second skin ships (askM Q4)_                               |
| Phase 4 · Machine extras   | ⬜ not started | AI console chat (pgvector audit first) · GitHub activity · _MCP endpoint deferred to post-stability (askM Q6)_                            |

---

## Session log

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
