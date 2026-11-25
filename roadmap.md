# ROADMAP

> **What this is:** the phase-level map of the portfolio redesign — where we are, what ships next, and where each phase is written down. Phase-gate granularity, not session-level: day-to-day history lives in `PROGRESS.md` (session log), design truth in the [spec](docs/superpowers/specs/2026-11-13-portfolio-themes-design.md), per-phase build order in `docs/superpowers/plans/`.
>
> **Division of labor:** spec = design source of truth · plans = execution source of truth · `PROGRESS.md` = session log · this file only _navigates_. If this file and the spec disagree, fix this file.
>
> **Completion percentages are estimates, not promises.** Phase 0 is measured against its exit checklist and Phase 1 against its 2026-11-25 gate; Phases 2–4 come from the 2026-11-18 static audit (code read, not features exercised), effort-weighted by the spec's delivery size. Re-measure at each phase gate.

**Updated:** 2026-11-25

---

## At a glance

| Phase                      | Status                       | Completion | Spec                                                | Delivers                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------- | ---------------------------- | ---------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Research (askA–askL)       | ✅ done                      | 100%       | evidence base (§ header)                            | 12 grounded passes; Skin 3 locked — Ember Copper `#C1662E` · Signal Cobalt `#2F5FD1` · 9-step graphite                                                                                                                                                                                                                                                                      |
| Spec                       | ✅ approved                  | 100%       | `2026-11-13-portfolio-themes-design.md` (+ §11–§15) | binding design contract; all decisions closed (§10)                                                                                                                                                                                                                                                                                                                         |
| Groundwork                 | ✅ done                      | 100%       | §11 audit                                           | repo cleanup · docs archive · agent setup · tree repair (`chore/groundwork-cleanup`)                                                                                                                                                                                                                                                                                        |
| Micro-decisions (askM)     | ✅ done                      | 100%       | §12, §12.1                                          | 8/8 resolved — fonts locked (IBM Plex), OG static, public switcher + MCP deferred                                                                                                                                                                                                                                                                                           |
| **Phase 0 · Foundation**   | ✅ done · PR #140 merged     | **100%**   | §3 (exit: §3.7 — 5/5)                               | `tokens.json` DTCG source · deterministic CSS generator · no-flash dual-attribute provider · legacy alias bridge · AA contrast checks · <8KB skin-CSS budget · raw-hex CI guard · docs                                                                                                                                                                                      |
| Phase 1 · Content path     | ✅ done                      | **100%**   | §5, §6, §6.9                                        | Default-view funnel (hero → flagship case studies → capabilities → principles → contact) · `/resume` + committed print PDF · machine layer (static `llms.txt` + ProfilePage JSON-LD **only**, per Q3; robots allow; static OG) · contact verify-then-align (A3 + Q7: drop reCAPTCHA, honeypot + 3/hr/IP) · availability endpoint + badge · cookieless lazy PostHog + `?ref` |
| Phase 2 · Signature        | ⬜ next                      | **≈7%**    | §4, §13                                             | 3D instrument hero (TSL/WebGPU, load-on-interaction) · AI-state trace binding (§4.3) · fallback tiers (§4.4, SVG tier is a deliverable) · perf pass                                                                                                                                                                                                                         |
| Phase 3 · Skins & switcher | ⬜ blocked on Phase 2        | **≈10%**   | §2.2, §8                                            | Skin 1/2 token blocks (skins are data, not forks) · archive posture (§2.1) · public switcher ships only when skin 2 is fully realized (Q4)                                                                                                                                                                                                                                  |
| Phase 4 · Machine extras   | ⬜ blocked on pgvector audit | **≈12%**   | §6.2–§6.5                                           | AI console chat (**pgvector audit first**, A4) · GitHub activity feed · MCP endpoint **deferred post-stability** (Q6)                                                                                                                                                                                                                                                       |
| **Whole redesign**         | in flight                    | **≈52%**   | —                                                   | effort-weighted: P0 27/27 · P1 21/21 · P2 29 · P3 11 · P4 11 (Phases 2–4 still static-audit estimates)                                                                                                                                                                                                                                                                      |

---

## Hard sequencing rules

1. **Foundation before everything.** Nothing in `apps/web` public surfaces rebuilds until Phase 0's alias bridge + provider are in.
2. **Phase 1 before Phase 2** — content before spectacle (spec §8). The Default view carries the entire funnel alone; 3D never gates substance.
3. **Hero before ambient 3D.** §13's T2 ambient elements (Projects/About/Contact) are scheduled one section at a time _after_ the hero ships, so "more 3D" can never cannibalize the hero. Blog stays T1 (no GPU); admin never gets ambient 3D.
4. **Every PR** passes the anti-generic checklist (spec §7) and the quality gates (`docs/35-quality/QUALITY-GATES.md`). Coverage floors only rise.
5. **Exit criteria live in spec §8's table.** A phase isn't done because its tasks ran — it's done when its exit row checks (Phase 0: §3.7 — 5/5, all criteria met).

---

## Right now — Phase 1 complete, Phase 2 next

- Phase 1 ran all 10 plan tasks on `phase1-content-path` and passed its gate + CWV evidence (LCP 1.075 s / CLS 0.000, Lighthouse lab, mobile). Closure numbers live in the plan's closure block; session history in `PROGRESS.md`.
- Next: the whole-branch review, then Phase 2 — Signature (blocked on the TSL/WebGPU verdict and a trace signal source; see prerequisites).
- Phase status lives in `PROGRESS.md`; per-task detail lives in the plan.

---

## Phase detail — what exists vs what the exit needs

### Phase 0 · Foundation — 100%

Exit §3.7: `tokens.json` single source · generated CSS · no-flash dual-attribute provider · AA both schemes · <8KB per skin · `DESIGN.md` current. All five check out; evidence in `PROGRESS.md`. Deferred hardening is listed under carried-forward items.

### Phase 1 · Content path — 100% (13/13 points)

**Plan:** [2026-11-23-phase1-content-path.md](docs/superpowers/plans/2026-11-23-phase1-content-path.md) — 10 tasks, all executed 2026-11-23 → 2026-11-25; keeps the alias bridge (demolition is Phase 3) and carries the Phase 0 hardening items the 2026-11-18 audit did not list.

**Shipped:** the locked five-section funnel on `/` (`hero → work → capabilities → principles → contact`, extracted into `components/public/sections/`); `/resume` + committed print PDF; the shared contact section; contact hardening (honeypot, Zod validation, 3/hr/IP, reCAPTCHA gone); public availability endpoint + hero badge; machine layer (`llms.txt` 1,620 B, `ProfilePage` JSON-LD, robots **allow** for GPTBot/CCBot/anthropic-ai/ClaudeBot/PerplexityBot, static OG 44,629 B); cookieless PostHog behind a dynamic import (initial JS on `/` 952.0 KB → 599.7 KB) + stateless `?ref`.

**Gate evidence (all real):** typecheck+lint 9/9 (forced) · API 39 suites / 466 tests · web 14 files / 106 tests · tokens 30/30 pair-scheme + budget 1,845 B · build 3/3 (forced) · Playwright e2e **26/26** (the 12 pre-existing base failures are fixed by the rewritten specs) · CWV **LCP 1.075 s / CLS 0.000 / TBT 113 ms** (median of 5; INP not measured in lab). Windows-only Next font-preload caveat recorded in the plan's closure block — re-measure on Linux before treating a Windows CWV number as a regression.

**Still open (carried, none blocking):** `.reveal` 850 ms vs the 260–500 ms motion contract (Phase 3); `e2e/` outside `tsc`/lint; `next start` vs `output: 'standalone'`; the accepted minors listed in the per-task reviews.

### Phase 2 · Signature — ≈7% (1.3/18 points)

**Exists:** R3F scaffolding (CanvasWrapper, Scene3D, SceneRegistry, scenes, fallbacks), Three.js dependency, admin-only 3D.

**Missing for exit:** public site mounts no 3D; `lib/3d/renderer.ts` is `WebGLRenderer` (no TSL/WebGPU); `EffectComposer` is used in `components/3d/effects/*` although spec §4.2 bans it; no schematic geometry, plotter draw-in, SVG hero tier or JS-off path; no draw-call/Safari/mobile perf evidence. The AI-state trace has no signal source (chat is admin-only and orphaned — see Phase 4), so Phase 2 needs a local trace stub or must re-sequence.

### Phase 3 · Skins & switcher — ≈10% (0.7/7 points)

**Exists:** `theme.ts` models skins 1–3; no-flash provider and persistence; Skin 3 tokens shipped.

**Missing for exit:** only `skins['3']` exists and `validate.mjs`/`build.mjs` hard-code it — generalize before adding skin 1. `publicSurface` oatmeal is a seed, not Skin 1 (paper `#F4F0E7` vs spec `#F3EDE2`; §15 records the reconciliation). Header has no toggle; public switcher is deferred by Q4 until skin 2 is realized. No `/archive/<name>` posture.

### Phase 4 · Machine extras — ≈12% (0.9/7 points)

**Exists:** chat data model and admin list/delete UI; admin `activities` audit log.

**Missing for exit:** `chat.service.ts` still proxies the removed FastAPI service via `AI_API_URL`; `DocumentChunk`/`EmbeddingCache` have no vector column (pgvector audit A4 unwritten); no public chat endpoint, no 10/day/IP limit, no injection tests; `activities` is not a GitHub feed; MCP correctly deferred (not counted).

---

## Prerequisites by phase

| Phase | Must be true before starting                                                                                                                  | State (latest 2026-11-25)                                                                                                                            |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Phase 0 merged; Q7 contact decision recorded (drop reCAPTCHA → honeypot + 3/hr/IP); availability needs a public read path                     | Phase 0 merged as PR #140; decisions recorded in spec §12                                                                                            |
| 2     | Phase 1 exit green (funnel complete, CWV green); TSL/WebGPU + Safari verdict; a trace signal source (or a deliberate stub)                    | Phase 1 exit green 2026-11-25 (CWV LCP 1.075 s / CLS 0.000); TSL/WebGPU verdict + trace source still open; EffectComposer ban must be resolved first |
| 3     | Skins 1–2 values reconciled (§15 Skin 1 note); generator generalized off the hard-coded `'3'`; skin CSS budget per skin                       | Open                                                                                                                                                 |
| 4     | A4 pgvector audit written; decision on the AI backend (FastAPI service was removed); public chat auth + rate design before any endpoint ships | Blocked on A4; `chat.service.ts` currently points at a dead service                                                                                  |

---

## Application readiness snapshot (2026-11-18 audit)

Static inspection only — no feature was exercised for this table.

| Surface            | Score  | Status                                                                                                        |
| ------------------ | ------ | ------------------------------------------------------------------------------------------------------------- |
| Public site        | 8/10   | Production-capable brochure: 7 pages, real leads, real blog/projects, SEO/RSS/sitemap                         |
| Admin dashboard    | 6.5/10 | 30 pages, 21 with real CRUD; 9 inert/empty                                                                    |
| API modules        | 8/10   | 29 modules, ~180 routes, guards + roles + audit on mutations                                                  |
| Auth               | 8/10   | JWT cookie + rotating hashed refresh sessions; unsafe dev-secret and cookie-secure defaults                   |
| Data / persistence | 6/10   | 38 models; 4 unused, 7 write-only or read-only; seed is roles + one admin                                     |
| Integrations       | 3/10   | Analytics has no ingest, queue has no producer, webhooks/notifications/flags have no callers                  |
| Tests              | 4/10   | 38 API suites / 460 tests; web coverage floor 1%; Playwright specs target removed DOM                         |
| Ops / CI           | 6/10   | Lint/typecheck/test/build/tokens enforced; no e2e or Lighthouse job; deploy references a removed `ai` service |

**Six disconnected capabilities** are the gap between "demo" and "platform": analytics ingest, chat/AI, media serving, notifications, feature flags/settings, API keys. Wire or hide each before calling the admin a platform.

---

## Carried-forward items

- ~~**Phase 1 hardening list (carried from Phase 0, none merge-blocking):** alias-drift test for the `--pf-*` bridge; validator non-empty-string guard; gate failure-path coverage (build CLI vacuity, contrast failure exit, token test isolation); skin validation narrowed to `'3'` until skin CSS exists; SSR `data-theme` mirror; removal of the three leftover timing literals (`--duration-instant`, `--ease-in`, `--ease-smooth`); a `lint` script for `packages/tokens` and `.mjs` in lint-staged (today the CI token job is the only enforcement).~~ **Shipped in Phase 1 Task 9 (2026-11-24, `da5b507`)** — all seven items landed; `check` now runs 30/30 with the build vacuity guard at >3,000 measured chars.
- **Application gaps** (from the readiness snapshot): analytics ingest; public CTAs for the 10+ admin-only entities; media file serving; integration producers (queue, webhooks, notifications, flags); preview/revalidation coverage beyond projects/blog/case-studies; auth defaults (`env.config.ts` dev secret, `ADMIN_PASSWORD`, `COOKIE_SECURE` off, JWT-only role resolution); live availability.
- ~~**12 pre-existing e2e failures** — proven present on the base commit (title/content drift + specs requiring an API the e2e webServer doesn't start); triage is its own task, independent of any phase.~~ **Fixed in Phase 1 Task 10 (2026-11-25)** — the four stale specs were rewritten against the real DOM and two new specs added; the suite is now **26/26** and expected `ECONNREFUSED` noise on the contact-submit test is the only API absence signal.
- **Next 15.5.x Windows font-preload defect** (found during the Phase 1 CWV pass): `NextFontManifestPlugin` matches the loader with a forward-slash literal, so Windows builds emit no font preloads and LCP measures 2.65–2.92 s instead of 1.07 s. Production (Linux) is unaffected. File an upstream issue; re-measure CWV on Linux before trusting a Windows number.

---

## Documentation debt — resolved 2026-11-19

The 2026-11-18 audit measured 213 Markdown files: 11 live, 16 mixed, 157 stale, 24 in
`docs/archive/`, with **561** broken relative links (the earlier 492 figure was an
approximation), six U+FFFD-damaged files, and five overlapping duplicate clusters.

The cleanup consolidated the tree instead of rewriting 157 aspirational documents:

- **Archive.** Every stale category moved under `docs/archive/<same path>` (171 files),
  preserving the old layout so links between archived documents still resolve. The live set
  is now `AGENTS.md`, `DESIGN.md`, `PROGRESS.md`, `roadmap.md`, `README.md`, `CHANGELOG.md`,
  `docs/MASTER-INDEX.md`, `docs/05-architecture/TECHSTACK.md`,
  `docs/35-quality/QUALITY-GATES.md`, `docs/27-decisions/` and `docs/superpowers/`.
- **Links.** 693 relative links were rewritten to their new locations; 218 links that used
  pre-restructure names were re-pointed to the current filename
  (e.g. `SecurityArchitecture.md` → `SECURITY-ARCHITECTURE.md`); 166 references to documents
  that never existed in this repository were reduced to plain text. The whole tree now
  reports **0 broken relative links** across 214 files and 876 links.
- **Encoding.** 85 files of double-encoded UTF-8 were round-tripped back to the intended
  characters; the six U+FFFD files were reconstructed from context (section signs, em dashes,
  one degree sign) and carry an archive note. No U+FFFD or mojibake remains.
- **Duplicates.** Each cluster got a canonical file plus "Superseded" banners, and
  `docs/archive/README.md` maps all nine topics.
- **False references and phantom tooling.** The Supabase/FastAPI-era reference docs,
  `DOC-OPS-PLAN.md` and the invented tooling claims are archived with the rest; nothing in
  the live set depends on them.
- **Enforcement.** `scripts/check-docs-links.mjs` runs in CI and covers the whole tree,
  archive included; `docs/MASTER-INDEX.md` is generated from the tree.

`docs/archive/` stays frozen: it is history, not documentation. New material belongs in the
live set, and the archive is never cited as a source of truth.

---

## Future work beyond the five phases

Deferred by decision, not forgotten: public skin switcher (Q4 — gated on skin 2), MCP endpoint (Q6 — post-stability), `llms-full` / `.md` mirrors (Q3 — static `llms.txt` only), GitHub activity feed (Phase 4), AI console chat (Phase 4 after pgvector audit), OG image generation (static asset chosen in §12.1), and the admin-platform capabilities listed under carried-forward items.

---

_Maintenance: update this file at phase gates (status flips), when exit criteria or phase scope change, and whenever the spec is amended. Never per-session — that's `PROGRESS.md`'s job._
