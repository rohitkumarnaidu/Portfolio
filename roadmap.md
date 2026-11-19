# ROADMAP

> **What this is:** the phase-level map of the portfolio redesign — where we are, what ships next, and where each phase is written down. Phase-gate granularity, not session-level: day-to-day history lives in `PROGRESS.md` (session log), design truth in the [spec](docs/superpowers/specs/2026-11-13-portfolio-themes-design.md), per-phase build order in `docs/superpowers/plans/`.
>
> **Division of labor:** spec = design source of truth · plans = execution source of truth · `PROGRESS.md` = session log · this file only _navigates_. If this file and the spec disagree, fix this file.
>
> **Completion percentages are estimates, not promises.** Phase 0 is measured against its exit checklist; Phases 1–4 come from the 2026-11-18 static audit (code read, not features exercised), effort-weighted by the spec's delivery size. Re-measure at each phase gate.

**Updated:** 2026-11-18

---

## At a glance

| Phase                      | Status                       | Completion | Spec                                                | Delivers                                                                                                                                                                                                                                                             |
| -------------------------- | ---------------------------- | ---------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Research (askA–askL)       | ✅ done                      | 100%       | evidence base (§ header)                            | 12 grounded passes; Skin 3 locked — Ember Copper `#C1662E` · Signal Cobalt `#2F5FD1` · 9-step graphite                                                                                                                                                               |
| Spec                       | ✅ approved                  | 100%       | `2026-11-13-portfolio-themes-design.md` (+ §11–§15) | binding design contract; all decisions closed (§10)                                                                                                                                                                                                                  |
| Groundwork                 | ✅ done                      | 100%       | §11 audit                                           | repo cleanup · docs archive · agent setup · tree repair (`chore/groundwork-cleanup`)                                                                                                                                                                                 |
| Micro-decisions (askM)     | ✅ done                      | 100%       | §12, §12.1                                          | 8/8 resolved — fonts locked (IBM Plex), OG static, public switcher + MCP deferred                                                                                                                                                                                    |
| **Phase 0 · Foundation**   | ✅ done · PR #140 open       | **100%**   | §3 (exit: §3.7 — 5/5)                               | `tokens.json` DTCG source · deterministic CSS generator · no-flash dual-attribute provider · legacy alias bridge · AA contrast checks · <8KB skin-CSS budget · raw-hex CI guard · docs                                                                               |
| Phase 1 · Content path     | ⬜ next                      | **≈33%**   | §5, §6, §6.9                                        | Default-view funnel (hero-lite → flagship case studies → capabilities → principles → contact) · machine layer (static `llms.txt` + JSON-LD **only**, per Q3) · contact verify-then-align (A3 + Q7: drop reCAPTCHA, honeypot + 3/hr/IP) · SEO/OG · availability badge |
| Phase 2 · Signature        | ⬜ blocked on Phase 1        | **≈7%**    | §4, §13                                             | 3D instrument hero (TSL/WebGPU, load-on-interaction) · AI-state trace binding (§4.3) · fallback tiers (§4.4, SVG tier is a deliverable) · perf pass                                                                                                                  |
| Phase 3 · Skins & switcher | ⬜ blocked on Phase 1–2      | **≈10%**   | §2.2, §8                                            | Skin 1/2 token blocks (skins are data, not forks) · archive posture (§2.1) · public switcher ships only when skin 2 is fully realized (Q4)                                                                                                                           |
| Phase 4 · Machine extras   | ⬜ blocked on pgvector audit | **≈12%**   | §6.2–§6.5                                           | AI console chat (**pgvector audit first**, A4) · GitHub activity feed · MCP endpoint **deferred post-stability** (Q6)                                                                                                                                                |
| **Whole redesign**         | in flight                    | **≈39%**   | —                                                   | effort-weighted: P0 27% · P1 21% · P2 29% · P3 11% · P4 11%                                                                                                                                                                                                          |

---

## Hard sequencing rules

1. **Foundation before everything.** Nothing in `apps/web` public surfaces rebuilds until Phase 0's alias bridge + provider are in.
2. **Phase 1 before Phase 2** — content before spectacle (spec §8). The Default view carries the entire funnel alone; 3D never gates substance.
3. **Hero before ambient 3D.** §13's T2 ambient elements (Projects/About/Contact) are scheduled one section at a time _after_ the hero ships, so "more 3D" can never cannibalize the hero. Blog stays T1 (no GPU); admin never gets ambient 3D.
4. **Every PR** passes the anti-generic checklist (spec §7) and the quality gates (`docs/35-quality/QUALITY-GATES.md`). Coverage floors only rise.
5. **Exit criteria live in spec §8's table.** A phase isn't done because its tasks ran — it's done when its exit row checks (Phase 0: §3.7 — 5/5, all criteria met).

---

## Right now — Phase 0 complete (PR #140), Phase 1 next

- Branch `feat/phase0-tokens`, PR #140. All 9 plan tasks plus the §3.7 criterion-1 closure (tokenized CSS/3D/charts, raw-hex CI guard). Exit checklist 5/5.
- Nothing in Phase 1 should start until this merges — the alias bridge and `--pf-*` contract are what Phase 1 rebuilds on top of.
- Phase status lives in `PROGRESS.md`; per-task detail lives in the plan.

---

## Phase detail — what exists vs what the exit needs

### Phase 0 · Foundation — 100%

Exit §3.7: `tokens.json` single source · generated CSS · no-flash dual-attribute provider · AA both schemes · <8KB per skin · `DESIGN.md` current. All five check out; evidence in `PROGRESS.md`. Deferred hardening is listed under carried-forward items.

### Phase 1 · Content path — ≈33% (4.4/13 points)

**Exists:** public routes `/`, `/about`, `/projects`, `/projects/[slug]`, `/blog`, `/blog/[slug]`, `/contact`; contact creates real leads against `POST /portfolio/leads`; metadata helper, JSON-LD (Person/WebSite), sitemap, RSS, robots; curated content fallback in `lib/public-content.ts`; section order precursor (hero, work, statement, capabilities, about) already renders.

**Missing for exit:**

- The locked five-section funnel order and a contact section on `/`; no resume route.
- Contact is spec-violating today: `react-google-recaptcha-v3` installed but unwired, throttle 10/15 min (~40/hr vs spec 3/hr/IP), no honeypot. Sanitization exists.
- Availability is a hard-coded string; the module has no public controller.
- Machine layer is inverted: `robots.ts` **blocks** GPTBot/CCBot/anthropic-ai; no `llms.txt`, no `ProfilePage`, no OG image.
- PostHog installed with zero imports; no `?ref` handling.
- Public `ThemeToggle` exists but is never mounted.

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

| Phase | Must be true before starting                                                                                                                  | State (2026-11-18)                                                  |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1     | Phase 0 merged; Q7 contact decision recorded (drop reCAPTCHA → honeypot + 3/hr/IP); availability needs a public read path                     | Phase 0 PR #140 open; decisions recorded in spec §12                |
| 2     | Phase 1 exit green (funnel complete, CWV green); TSL/WebGPU + Safari verdict; a trace signal source (or a deliberate stub)                    | Blocked on Phase 1; EffectComposer ban must be resolved first       |
| 3     | Skins 1–2 values reconciled (§15 Skin 1 note); generator generalized off the hard-coded `'3'`; skin CSS budget per skin                       | Open                                                                |
| 4     | A4 pgvector audit written; decision on the AI backend (FastAPI service was removed); public chat auth + rate design before any endpoint ships | Blocked on A4; `chat.service.ts` currently points at a dead service |

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

- **Phase 1 hardening list (carried from Phase 0, none merge-blocking):** alias-drift test for the `--pf-*` bridge; validator non-empty-string guard; gate failure-path coverage (build CLI vacuity, contrast failure exit, token test isolation); skin validation narrowed to `'3'` until skin CSS exists; SSR `data-theme` mirror; removal of the three leftover timing literals (`--duration-instant`, `--ease-in`, `--ease-smooth`); a `lint` script for `packages/tokens` and `.mjs` in lint-staged (today the CI token job is the only enforcement).
- **Application gaps** (from the readiness snapshot): analytics ingest; public CTAs for the 10+ admin-only entities; media file serving; integration producers (queue, webhooks, notifications, flags); preview/revalidation coverage beyond projects/blog/case-studies; auth defaults (`env.config.ts` dev secret, `ADMIN_PASSWORD`, `COOKIE_SECURE` off, JWT-only role resolution); live availability.
- **12 pre-existing e2e failures** — proven present on the base commit (title/content drift + specs requiring an API the e2e webServer doesn't start); triage is its own task, independent of any phase.

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
