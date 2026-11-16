# PROGRESS.md

> **Status:** GROUNDWORK (branch `chore/groundwork-cleanup`) — spec ✅ approved · Phase 0 not started
> **Updated:** 2026-11-16

**File rules:** never delete a completed item — strike it through (`~~text~~`). Update the status line, phase table, and add a session-log entry at the **end of every work session**. Newest log entries first.

---

## Phase status

| Phase                      | Status         | Notes                                                                                                                                     |
| -------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Research (askA–askL)       | ✅ done        | 12 grounded passes; Skin 3 token system locked (`#C1662E` copper / `#2F5FD1` cobalt / graphite)                                           |
| Spec                       | ✅ approved    | `docs/superpowers/specs/2026-11-13-portfolio-themes-design.md` + §11 audit amendments                                                     |
| Groundwork                 | 🔨 in progress | repo cleanup + agent setup, branch `chore/groundwork-cleanup`                                                                             |
| Micro-decisions (askM)     | 🔨 in progress | Q3/Q5/Q7/Q8 **locked** (spec §12); Q1/Q2/Q4/Q6 re-research pass running (sharper framing)                                                 |
| Phase 0 · Foundation       | ⬜ not started | tokens.json + generator · no-flash dual attrs (`data-scheme`×`data-skin`) · AA contrast checks · <8KB skin-CSS budget · theme provider    |
| Phase 1 · Content path     | ⬜ not started | Default view funnel (hero-lite → case studies → capabilities → principles → contact) · machine layer · contact security verify-then-align |
| Phase 2 · Signature        | ⬜ not started | 3D instrument hero · fallbacks · AI-state trace binding                                                                                   |
| Phase 3 · Skins & switcher | ⬜ not started | Skin 1/2 token blocks · switcher · archive posture                                                                                        |
| Phase 4 · Machine extras   | ⬜ not started | MCP server · AI console chat (pgvector audit first) · GitHub activity                                                                     |

---

## Session log

### 2026-11-16 — groundwork session

- Full repo audit (explore agent): code healthy (real CI, 38 api specs, 6 web test files, 4 e2e specs); docs tree 208 files mostly aspirational.
- **Decisions:** docs → archive + fix (subagent running); ~40 merged stale remote branches → prune after commits; 4 spec amendments applied (A1 hand-rolled dual-attribute theming, A2 Phase 0 = refactor existing tokens, A3 contact verify-then-align, A4 keep no-RAG + audit pgvector chat plumbing).
- **Cleanup done:** spec approved + §11 appended · `packages/shared/src/env.ts` deleted (unused, validated removed vars) · `docs/superpowers/` tracked · `.gitignore` pruned (Python/Supabase/scratch entries; `.opencode` skills trackable) · `fonts.ts` doc pointers fixed · both `.env.example` files cleaned (Supabase removed, dead refs removed, `AI_API_URL`/`OPENAI_API_KEY` annotated legacy) · dead deps `next-themes` + `@supabase/supabase-js` uninstall (in flight).
- **Agent setup done:** `AGENTS.md` rewritten (4 false path claims fixed, working rules added) · `DESIGN.md` created · this file created.
- **Pending:** docs-archive subagent report → docs commit · typecheck/lint sanity · remote-branch prune · OpenCode skill mechanism verify + 3 lean skills · askM research batch.

<!--
Older sessions will be appended above this comment. Keep entries concise: date, what happened, what's open.
-->
