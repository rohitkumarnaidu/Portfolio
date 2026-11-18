# ROADMAP

> **What this is:** the phase-level map of the portfolio redesign — where we are, what ships next, and where each phase is written down. Phase-gate granularity, not session-level: day-to-day history lives in `PROGRESS.md` (session log), design truth in the [spec](docs/superpowers/specs/2026-11-13-portfolio-themes-design.md), per-phase build order in `docs/superpowers/plans/`.
>
> **Division of labor:** spec = design source of truth · plans = execution source of truth · `PROGRESS.md` = session log · this file only _navigates_. If this file and the spec disagree, fix this file.

**Updated:** 2026-11-18

---

## At a glance

| Phase                      | Status                               | Spec                                                       | Delivers                                                                                                                                                                                                                                                             |
| -------------------------- | ------------------------------------ | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Research (askA–askL)       | ✅ done                              | evidence base (§ header)                                   | 12 grounded passes; Skin 3 locked — Ember Copper `#C1662E` · Signal Cobalt `#2F5FD1` · 9-step graphite                                                                                                                                                               |
| Spec                       | ✅ approved                          | `2026-11-13-portfolio-themes-design.md` (+ §11 amendments) | binding design contract; all decisions closed (§10)                                                                                                                                                                                                                  |
| Groundwork                 | ✅ done                              | §11 audit                                                  | repo cleanup · docs archive · agent setup · tree repair (`chore/groundwork-cleanup`)                                                                                                                                                                                 |
| Micro-decisions (askM)     | ✅ done                              | §12, §12.1                                                 | 8/8 resolved — fonts locked (IBM Plex), OG static, public switcher + MCP deferred                                                                                                                                                                                    |
| **Phase 0 · Foundation**   | 🔨 tasks 9/9 · §3.7 4/5 · PR pending | §3 (exit: §3.7)                                            | `tokens.json` DTCG source · deterministic CSS generator · no-flash dual-attribute provider · legacy alias bridge · AA contrast checks · <8KB skin-CSS budget · CI gate · docs                                                                                        |
| Phase 1 · Content path     | ⬜                                   | §5, §6, §6.9                                               | Default-view funnel (hero-lite → flagship case studies → capabilities → principles → contact) · machine layer (static `llms.txt` + JSON-LD **only**, per Q3) · contact verify-then-align (A3 + Q7: drop reCAPTCHA, honeypot + 3/hr/IP) · SEO/OG · availability badge |
| Phase 2 · Signature        | ⬜                                   | §4, §13                                                    | 3D instrument hero (TSL/WebGPU, load-on-interaction) · AI-state trace binding (§4.3) · fallback tiers (§4.4, SVG tier is a deliverable) · perf pass                                                                                                                  |
| Phase 3 · Skins & switcher | ⬜                                   | §2.2, §8                                                   | Skin 1/2 token blocks (skins are data, not forks) · archive posture (§2.1) · public switcher ships only when skin 2 is fully realized (Q4)                                                                                                                           |
| Phase 4 · Machine extras   | ⬜                                   | §6.2–§6.5                                                  | AI console chat (**pgvector audit first**, A4) · GitHub activity feed · MCP endpoint **deferred post-stability** (Q6)                                                                                                                                                |

---

## Hard sequencing rules

1. **Foundation before everything.** Nothing in `apps/web` public surfaces rebuilds until Phase 0's alias bridge + provider are in.
2. **Phase 1 before Phase 2** — content before spectacle (spec §8). The Default view carries the entire funnel alone; 3D never gates substance.
3. **Hero before ambient 3D.** §13's T2 ambient elements (Projects/About/Contact) are scheduled one section at a time _after_ the hero ships, so "more 3D" can never cannibalize the hero. Blog stays T1 (no GPU); admin never gets ambient 3D.
4. **Every PR** passes the anti-generic checklist (spec §7) and the quality gates (`docs/35-quality/QUALITY-GATES.md`). Coverage floors only rise.
5. **Exit criteria live in spec §8's table.** A phase isn't done because its tasks ran — it's done when its exit row checks (Phase 0: §3.7 — 4/5 fully met; criterion 1's hex ban is partial by design and closes in Phase 1).

---

## Right now — Phase 0 (token foundation)

- Branch `feat/phase0-tokens`, executing the 9-task plan `docs/superpowers/plans/2026-11-17-phase0-token-foundation.md`.
- All 9 tasks committed and review-clean; whole-branch final review: code merge-ready — PR pending user review (**not merged**).
- §3.7 acceptance: 4/5 criteria fully met; criterion 1 (no hex in component CSS) is partial by design — legacy hex in `globals.css`, `public.css` and older 3D/admin code closes in Phase 1.
- Phase status lives in `PROGRESS.md`; per-task detail lives in the plan.

---

## Carried-forward items

- **Phase 1 hardening list (carried from Phase 0, none merge-blocking):** alias-drift test for the `--pf-*` bridge; validator non-empty-string guard; gate failure-path coverage (build CLI vacuity, contrast failure exit, token test isolation); skin validation narrowed to `'3'` until skin CSS exists; SSR `data-theme` mirror; removal of the three leftover timing literals (`--duration-instant`, `--ease-in`, `--ease-smooth`).
- **12 pre-existing e2e failures** — proven present on the base commit (title/content drift + specs requiring an API the e2e webServer doesn't start); triage is its own task, independent of any phase.

---

_Maintenance: update this file at phase gates (status flips), when exit criteria or phase scope change, and whenever the spec is amended. Never per-session — that's `PROGRESS.md`'s job._
