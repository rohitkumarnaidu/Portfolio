# Portfolio Redesign — Multi-Theme 3D Architecture · Design Spec

**Status:** ✅ APPROVED by user (2026-11-16); Phase 0 COMPLETE (2026-11-18, §3.7 5/5) — next: Phase 1. Amended §11, §12, §13, §14, §15.
**Date:** 2026-11-15 (research started 2026-11-13)
**Evidence base:** Research report `research_report_20261113_portfolio_career_strategy.md` (61 sources, S01–S61) + 12 grounded NotebookLM passes (askA–askL) + production precedents (nickvirden.com, hire-me-mcp)
**Verdict lineage:** research → brainstorm → user decisions (all closed) → **this spec** → writing-plans → build

---

## 0 · The Verdict (one paragraph)

Rebuild the public portfolio as **one committed identity with few expressions**: 1 Signature 3D view + 1 fast Default view + 3 token-driven skins, on one shared token foundation — plus a machine-readable layer for AI agents. The Signature hero is **INSTRUMENT + live signal-trace**: a graphite schematic whose single live diagnostic trace pulses with the AI assistant's thinking/streaming states. Skin 3's signature accent is **Ember Copper `#C1662E`** (primary) with **Signal Cobalt `#2F5FD1`** (secondary) on a 9-step cool graphite scale. The whole system is governed by a DTCG 3-layer token contract that also drives the 3D scene — semantic token discipline across 2D & 3D is the documented #1 flop-preventer.

---

## 1 · Goals & Non-Goals

### Goals

1. **Distinctive in 50ms** — no AI tells, no SaaS wallpaper; "machined precision" register.
2. **Hiring-effective in 10–30s** — fast, scannable, unmissable contact path; site never blocks substance.
3. **Skin switching without re-theming code** — tokens only; skins are data, not forks.
4. **AI-agent readable** — llms.txt, JSON-LD ProfilePage, `.md` mirrors, MCP server (the rarest differentiator on the list).
5. **WCAG 2.2 AA in every skin × scheme** — verified per token pair, not eyeballed.
6. **Core Web Vitals budgets enforced by build, not by hope.**
7. **Solo-maintainable** — <8KB skin CSS, one hero engine, no per-theme component forks.

### Non-Goals (explicitly out, with reasons)

| Excluded                                                               | Reason                                                                                                                                       |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 8 theme universes / per-theme 3D scenes                                | Triple-anchored rejection: Nov report + user's own AXIS doc + nickvirden.com precedent. Every time the count hit 8, a doc corrected it down. |
| Public sandbox IDE                                                     | Megabytes JS, COOP/COEP conflicts, mobile-unusable. Stays admin-only at `/admin/sandbox` (user decision).                                    |
| Full visitor-role modes (Recruiter/Client/Developer routing)           | Zero portfolio precedent; SaaS conversion stats don't transfer; overengineering rejection trigger. Light-touch CTA instead (user decision).  |
| i18n in v1                                                             | Scope discipline (user decision). Architecture stays locale-ready.                                                                           |
| Vector RAG for the AI chat                                             | Rate-limited curated-prompt endpoint is enough; RAG plumbing is weeks for marginal gain.                                                     |
| Real-time PBR / EffectComposer / compute-particle spectacle / UI sound | Documented over-engineering flags; EffectComposer is dead on WebGPU.                                                                         |

---

## 2 · Site Architecture

### 2.1 Views (two, behind one switcher)

- **Signature view** — the 3D instrument hero experience. Loaded **on interaction**, never the critical path.
- **Default view** — fast, content-first editorial that **carries the entire funnel alone** (must be fully usable if 3D never loads). 3D presence extends across public sections as a tiered enhancement layer (§13) — the funnel never depends on it.
- Switcher persisted (localStorage + cookie mirror) via the repo's proven hand-rolled no-flash script, extended to write both attributes before first paint. `next-themes` is NOT used (groundwork audit: installed with zero imports — the hand-rolled system won; dead dep removed).
- **Archive posture:** superseded visual expressions live on as sub-paths (e.g. `/archive/<name>`) rather than being deleted — the honest path to "more" over the site's lifetime.

### 2.2 Skins × Schemes (dual attributes on `<html>`)

`data-scheme="light|dark"` × `data-skin="1|2|3"`

| Skin                     | Identity                                   | Palette soul                                                                                | Scheme character                                                                 |
| ------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **1 · Light Editorial**  | "Oatmeal & Ink" — high-grade tactile paper | Oatmeal `#F3EDE2` · Textured Gray `#D8D1C7` · Ink `#2B2B2B`                                 | Light-first; crisp hairline dividers; no pure white                              |
| **2 · Dark Editorial**   | Tinted graphite, machined                  | Graphite scale `#0A0C10 → #1B1F27`                                                          | Dark-first; elevation-by-lightening; **no drop shadows**                         |
| **3 · Signature Accent** | The one committed identity                 | Graphite scale + **Ember Copper `#C1662E`** primary + **Signal Cobalt `#2F5FD1`** secondary | Full light **and** dark renderings (accent changes _behavior_ per scheme, below) |

Skin 3 is the flagship; skins 1–2 ship as the token-proves-itself layer (they demonstrate the switch is real, at near-zero marginal cost).

### 2.3 Content source of truth

`apps/web/src/lib/public-content.ts` (SITE, WORK, CAPABILITIES, PRINCIPLES — Forgevena, DRAXELYRA, ScholarFormAI) is the curated fallback; API-published content (NestJS + admin `is_live` toggles) overrides when present. Case studies read like magazine features: problem → constraints → decisions → measured outcome.

---

## 3 · The Token Foundation (Phase 0 — built first)

### 3.1 DTCG 3-layer architecture (W3C v2025.10)

```
Primitive     graphite-950: #0A0C10, ember-500: #C1662E, …   (raw values only)
   ↓ alias
Semantic      surface.base, surface.panel, border.hairline,
              text.primary/secondary/muted,
              accent.primary/link/trace/hover/active/tint/focus,
              accent-secondary.base/link, status.*, viz.1–8
   ↓ alias
Component     card.bg, cta.bg, badge.bg, code-block.fg, …   (components consume ONLY this layer)
```

**Hard rule:** components (and AI-assisted code, enforced via `DESIGN.md` + review checklist) never reference primitives or raw hex — semantic roles only. Token drift is the documented #1 maintenance killer.

### 3.2 Skin 3 semantic token map (exact values — locked)

| Semantic token          | Light                                                             | Dark                              | Role / notes                                                                                |
| ----------------------- | ----------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------- |
| `surface.base`          | `#F4F5F7`                                                         | `#0A0C10`                         | never `#000000` (OLED halation)                                                             |
| `surface.panel`         | `#FFFFFF`                                                         | `#1B1F27`                         | cards, code panels                                                                          |
| `surface.elevated`      | `#E4E7EC`                                                         | `#12151B`                         | modals, popovers                                                                            |
| `border.hairline`       | `#A6ADBB`                                                         | `#262B35`                         | 1px structural boundaries                                                                   |
| `border.accent`         | `rgba(193,102,46,.30)`                                            | `rgba(224,137,90,.15)`            | active card perimeter, active tab                                                           |
| `text.primary`          | `#0A0C10`                                                         | `#F4F5F7`                         | softened on dark, never pure white                                                          |
| `text.secondary`        | `#565E6D`                                                         | `#A6ADBB`                         |                                                                                             |
| `text.muted`            | `#A6ADBB`                                                         | `#565E6D`                         | placeholders, labels                                                                        |
| `accent.primary`        | `#C1662E`                                                         | `#C1662E`                         | solid fill (light) / signal (dark)                                                          |
| `accent.link`           | `#C1662E`                                                         | `#D68A54` ⚠️                      | **dark links MUST step to ember-400** (base copper on `#0A0C10` ≈ 3.8:1 = AA fail)          |
| `accent.trace`          | `#C1662E`                                                         | `#D68A54` (+ soft `#E3A87C` halo) | hero live signal-trace                                                                      |
| `accent.hover`          | `#9A4E22`                                                         | `#D68A54` + glow halo             |                                                                                             |
| `accent.active`         | `#7A3C18` + `scale(.98)`                                          | `#9A4E22`                         |                                                                                             |
| `accent.tint`           | `#E3A87C`                                                         | `rgba(193,102,46,.15)`            | selection `rgba(193,102,46,.20)`, badges                                                    |
| `accent.focus`          | `#C1662E`                                                         | `#D68A54`                         | 2px outline, offset 2px, never color-only                                                   |
| `accent-secondary.base` | `#2F5FD1`                                                         | `#2F5FD1`                         | code highlights, terminal, metadata                                                         |
| `accent-secondary.link` | `#2F5FD1`                                                         | `#5C82E0` ⚠️                      | signal-400 on dark                                                                          |
| `status.success`        | `#2E9E6D` (constant)                                              |                                   | "Available for work"                                                                        |
| `status.warning`        | `#C98A2C` (constant)                                              |                                   |                                                                                             |
| `status.danger`         | `#C64545` (constant)                                              |                                   | never the brand accent                                                                      |
| `status.info`           | `#2F5FD1` (constant)                                              |                                   |                                                                                             |
| `viz.1–8`               | `#2F5FD1 #C1662E #2E9E6D #6B5CA5 #2E8C8C #A34D74 #C98A2C #565E6D` |                                   | instrument-panel chart set; series 1–2 = the brand accents; color never alone (dash/labels) |

**Primitive inventory:** 9 graphite + 5 ember (300 `#E3A87C` · 400 `#D68A54` · 500 `#C1662E` · 600 `#9A4E22` · 700 `#7A3C18`) + 2 signal (400 `#5C82E0` · 500 `#2F5FD1`) + 4 status + 8 viz + Skin 1/2 primitives ≈ **28 raw colors total** (3 shared). Within documented discipline.

### 3.3 Accent behavior shift (the system's signature mechanic)

- **Light scheme:** copper is a **solid machined fill** — CTAs, badges, solid trace.
- **Dark scheme:** copper is an **illuminated signal** — glowing 1px trace, luminous rings; text elements step to ember-400.
- **70-20-10 enforced:** 70% graphite canvas · 20% structure/cards/borders · ≤10% high-energy copper (CTAs, trace, terminal cursor, active indicators). Copper is **never** an expansive background fill.

### 3.4 Typography

IBM Plex family (open source, self-hosted via `next/font`): **Plex Sans** for UI/body, **Plex Mono** for the technical alphabet (hero data, terminal, metadata, code). One family across optical roles — the documented "technical alphabet" premium signal.

### 3.5 Spacing · Radius · Borders

- Spacing scale: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`
- Radius: `sm 4px` (inputs/badges) · `md 8px` (buttons/cards) · `lg 16px` (containers). No pills.
- Borders: 1px hairlines only; shadows light-scheme-only (`0 1px 2px rgba(10,12,16,.08)` / `0 4px 16px rgba(10,12,16,.16)`); dark = elevation-by-lightening + accent-tinted borders.

### 3.6 Motion tokens (mechanical, critically damped)

| Band           | Range                                        | Use                              |
| -------------- | -------------------------------------------- | -------------------------------- |
| taps           | 50–150ms                                     | direct manipulation, hover/press |
| transitions    | 150–260ms                                    | menus, panels                    |
| reveals        | 260–500ms                                    | section entrance                 |
| springs        | stiffness ~350, damping ~25, **zero bounce** | interactive elements             |
| reduced-motion | → 120ms opacity fades only                   | all of the above collapse        |

### 3.7 Foundation acceptance criteria

- [ ] `tokens.json` (DTCG) is the single source; CSS custom properties generated from it; no hex in component CSS.
- [ ] No-flash: inline pre-paint script applies persisted `data-scheme`+`data-skin`.
- [ ] Per-skin CSS block **< 8KB**, verified in CI.
- [ ] Every semantic text/background pair ≥ WCAG AA in both schemes (automated contrast check on the token matrix).
- [ ] `DESIGN.md` written (this spec's §3 condensed) — the AI-tool drift shield.

---

## 4 · Signature View — INSTRUMENT + live signal-trace

### 4.1 Concept

Graphite instrument/schematic as the base (near-zero ambient animation, mouse parallax) + **one live diagnostic trace** bound to the AI assistant. Scorecard winner (66.0/70): 50ms anti-slop 9.5 · procedural 9.5 · mobile fallback 10 · token re-dress 9.5 · solo risk 9 · narrative binding 9 · recruiter legibility 9.5. The trace is **the one signature element**, mirrored in 2D (terminal cursor write-head, active-section divider) per the "one signature anchor" rule.

### 4.2 Technical contract (locked)

- **TSL single code path** on `WebGPURenderer` (three r171+), async init via R3F `gl={async () => {…}}`; automatic WebGL2 fallback; **no EffectComposer** — TSL `RenderPipeline` for grading/vignette.
- **Token-driven scene:** TSL `uniform()` nodes read the semantic token values (from generated tokens module); post-processing samples `surface.base` / `accent.trace`; skin/scheme switch re-dresses the scene with **zero scene-code changes**.
- **PBR calibration:** graphite chassis = low metalness / high roughness (matches matte UI panels); copper trace = high emissive + specular sheen (matches focus rings / CTA).
- **Performance:** load-on-interaction (dynamic import, off critical path) · `frameloop="demand"` · DPR ≤2 · <100 draw calls (procedural geometry, **no multi-MB assets**) · explicit `.dispose()` on unmount (WebGPU doesn't GC GPU resources) · `mediump` on mobile.
- **Draw-in:** plotter-style stroke reveal on entry (500ms band), then near-static; parallax only.

### 4.3 AI-state binding (the narrative core)

| Assistant state | Trace behavior                                        |
| --------------- | ----------------------------------------------------- |
| idle            | static trace, instrument calm                         |
| thinking        | oscilloscope scan-sweep across the schematic          |
| streaming       | trace pulses / data-packet flow at read speed         |
| error           | semantic `status.danger` flicker (never brand copper) |

### 4.4 Fallback tiers (non-negotiable)

| Condition                | Render                                                                       |
| ------------------------ | ---------------------------------------------------------------------------- |
| viewport <768px          | **SVG vector schematic** (the specimen hero is the seed) — instant, LCP-safe |
| `prefers-reduced-motion` | static schematic, 120ms fades only                                           |
| no WebGPU                | WebGL2 (same TSL path)                                                       |
| no WebGL                 | SVG tier                                                                     |
| JS disabled              | static SVG + full content                                                    |

### 4.5 Two-week build blueprint

- **W1:** schematic geometry + plotter draw-in + parallax + token/uniform binding + fallback SVG tier.
- **W2:** AI-state binding + perf pass (draw calls, DPR, frameloop) + iOS Safari early test + WebGL2 fallback verification.

---

## 5 · Default View — the funnel carrier

Section order (build order AND reading order):

1. **Hero-lite** — static SVG schematic + name + availability badge + 2 CTAs (View case studies / Resume PDF)
2. **Flagship work** — 3–6 case studies, **strongest first**, magazine-feature format
3. **Capabilities / stack** — compact, scannable, no progress bars
4. **Principles / how I work** — brief
5. **Contact** — unmissable; secured (§6.5); states current availability explicitly

Every element of the funnel is present with 3D disabled — the Default view is the site.

---

## 6 · Feature Layer (evidence-ranked verdicts, all decided)

### 6.1 BUILD — Machine layer (zero bundle cost, hours of work)

- `/llms.txt` + `/llms-full.txt` (static, generated from public content)
- Per-page **JSON-LD `ProfilePage`** + dynamic sitemap + per-page OG images (`next/og`)
- `robots.txt`: AI crawlers **allowed**; `/admin/*` blocked
- **`.md` mirrors** of every public page (`/path.md` rewrite → markdown)

### 6.2 BUILD — Availability badge + GitHub activity

- Live availability from API (`status.success` semantics), cached/ISR
- GitHub contribution feed via cached endpoint (never client-fetched raw)

### 6.3 BUILD — MCP server over NestJS (`hire-me-mcp` pattern)

Tools: `evaluate_fit(role_requirements)` · `list_projects()` · `get_skills()` · `get_availability()`. Read-only, rate-limited. Publicized on the site (agents and humans both see it).

### 6.4 BUILD-LITE — Light-touch visitor adaptation

`?ref=linkedin|github|naukri|resume|client` → **CTA emphasis / scroll-to only**. Stateless, no cookies, no layout reordering, everything accessible to everyone. Attribution loop preserved (resume QR carries `?ref=resume`).

### 6.5 BUILD-LITE — AI assistant (terminal console)

- NestJS endpoint, rate-limited (e.g. 10/day/IP), system prompt over curated content — **no vector RAG**
- UI: terminal-console readout (Plex Mono), thinking state drives the hero trace (§4.3)
- Prompt-injection hardened: system prompt fixed server-side, content facts sanitized

### 6.6 BUILD-LITE — Admin visibility

Existing dashboard stays; add `is_live` section toggles (solves content freshness without manual edits). The dashboard itself becomes a case study.

### 6.7 Contact security (thin → solid)

Rate-limit 3/hr/IP · Zod schema validation · DOMPurify on any rendered content · honeypot field · no PII in logs · RLS/scope checks on leads storage.

### 6.8 Measurement (cookieless, consent-first)

Umami (or PostHog cookieless): events = resume download, demo click, contact submit, sliced by `?ref`. Benchmark: **~10% contact rate** on qualified visits. "No tracking cookies" is a stated trust signal.

### 6.9 SEO/OG/a11y gap-fill

Dynamic sitemap · OG defaults + per-page images · `metadata` per route · skip-link, ARIA landmarks, focus-visible everywhere · screen-reader pass per skin.

---

## 7 · Anti-Generic Checklist (review criteria for EVERY PR)

**Banned (documented AI tells + failure modes):**

- [ ] near-black navy `#060D1F` + single neon accent (mint/cyan)
- [ ] warm cream + serif + terracotta
- [ ] hairline-rule broadsheet as _decoration_
- [ ] bento over-decoration; interchangeable copy
- [ ] bouncy/playful easing; sound design
- [ ] hardcoded hex / primitive names in components (token drift)
- [ ] a second 3D scene anywhere
- [ ] hidden or unconventional navigation (prototypicality guard)

**Required:**

- [ ] one signature element (the copper trace) doing real work
- [ ] statuses constant, never brand-colored
- [ ] 70-20-10 respected
- [ ] LCP ≤2.5s (target <1.5s Default view) · CLS <0.1 · INP <200ms
- [ ] skin CSS <8KB · <100 draw calls in Signature

---

## 8 · Build Order (foundation first, then sections one by one)

| Phase                               | Deliverable                                                                                                                                     | Exit criteria                                               |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **0 · Foundation**                  | tokens.json + generator, theme provider (no-flash, dual attrs, persistence), contrast checks, skin-CSS budget check, DESIGN.md                  | §3.7 all checked                                            |
| **1 · Content path (Default view)** | hero-lite → flagship case studies → capabilities → principles → contact + security; machine layer (§6.1); SEO/OG; analytics; availability badge | funnel complete with 3D disabled; CWV green                 |
| **2 · Signature**                   | 3D instrument hero (§4), fallbacks, AI-state binding                                                                                            | scorecard criteria met on mid-range mobile; Safari verified |
| **3 · Skins & switcher**            | Skin 1/2 token blocks, switcher, archive posture                                                                                                | switch verified in both schemes, no-flash, <8KB each        |
| **4 · Machine extras**              | MCP server, AI console chat, GitHub activity                                                                                                    | rate-limits + injection tests pass                          |

**Phase 1 ships before Phase 2** — content before spectacle (evidence: sites flip decisions on substance; beauty rarely flips alone).

---

## 9 · Risks & Honest Tradeoffs

| Risk                                   | Mitigation                                                                                                                        |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Copper reads "retro"                   | 10% discipline + cool-slate neutrals (muddy-brown contamination guard) + no copper backgrounds                                    |
| Cobalt blends into SaaS median         | Cobalt is _secondary only_, framed as terminal/code context, never the CTA color                                                  |
| Hero scope creep                       | 2-week budget, blueprint fixed, SVG tier is a _deliverable_ not a fallback afterthought                                           |
| Skin switch under-delivers             | Skins 1–2 exist precisely to prove token switching is real — they ship in Phase 3                                                 |
| Token drift via AI tools               | DESIGN.md + review checklist + CI budget checks                                                                                   |
| 25-section temptation from March plans | Not in this spec; funnel is 5 sections + feature layer                                                                            |
| 3D-everywhere scope creep              | §13 tiered intensity — ambient T2 elements only outside the hero, ≤2 canvases/page, lazy chunks, designed static tier per section |

---

## 10 · Decisions Log (closed)

| #   | Decision         | Choice                                                                                                                 |
| --- | ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| D1  | Views            | 1 Signature + 1 Default + 3 skins + archive                                                                            |
| D2  | Signature hero   | Instrument + live signal-trace (scorecard 66.0)                                                                        |
| D3  | Visitor modes    | Light-touch `?ref=` CTA only                                                                                           |
| D4  | Sandbox          | Admin-only at `/admin/sandbox`                                                                                         |
| D5  | i18n             | Skip v1 (locale-ready)                                                                                                 |
| D6  | Skin 3 accent    | **Ember Copper `#C1662E`** primary · Signal Cobalt `#2F5FD1` secondary · full token system + design disciplines locked |
| D7  | Feature verdicts | BUILD: machine layer, badge+GitHub, MCP · LITE: CTA adaptation, admin toggles, AI console chat · SKIP: public sandbox  |
| D8  | WebGPU/TSL       | Adopt with constraints (TSL-only, no EffectComposer, dispose discipline, mobile SVG tier)                              |

**Open items: none.**

---

_Review gate: nothing in `apps/web` or `apps/api` changes until this spec is approved. On approval → writing-plans → Phase 0 build._

---

## 11 · Groundwork Audit Amendments (2026-11-16)

Four amendments approved by the user on 2026-11-16 after a full repo audit (audit report in the ground-work session log). Destination unchanged — these record the _real path_, so the plan doesn't mislead the builder.

| #      | Amendment              | Decision                                                                                                                                                                                                                                                                                                                                               |
| ------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A1** | Theming implementation | Extend the repo's proven hand-rolled no-flash system (inline pre-paint script + localStorage + `ThemeToggle`) to dual attributes `data-scheme` × `data-skin`. `next-themes` is NOT adopted (audit: installed with zero imports — the hand-rolled system won; dead dep removed). The `data-theme` → `data-scheme` rename lands in Phase 0, not cleanup. |
| **A2** | Phase 0 path           | Refactor the **existing** `globals.css` token system + `public.css` editorial palette into the DTCG 3-layer contract (§3), not greenfield. Destination unchanged: `tokens.json` as single source, exact locked values (§3.2).                                                                                                                          |
| **A3** | Contact security       | **Verify-then-align** task: audit what is actually wired on `POST /api/portfolio/leads` (reCAPTCHA v3 installed but wiring unconfirmed; DOMPurify; honeypot), then align to §6.7 (3/hr/IP; today it is throttled 10 per 15min ≈ 40/hr). Throttle looseness is decided after verification, not before.                                                  |
| **A4** | RAG posture            | D7 stands (no vector RAG; curated-prompt console). Add a 30-min audit of the existing pgvector chat plumbing before Phase 4 design: `DocumentChunk` + `EmbeddingCache` models exist, and `chat.service.ts` still calls the **removed** FastAPI service via `AI_API_URL`. Build RAG-optional only if the infra proves real.                             |

**Audit reality notes (grounding for the plan):**

- Repo is healthy: real CI (quality matrix, Prisma validation, docker build), 38 API specs, 6 web test files, 4 Playwright e2e specs.
- The contact funnel already exists (`leads` module + admin UI + Zod schemas in `@portfolio/shared`) — §6.5/§6.7 is partially built, not greenfield.
- The existing token system is mature: full CSS-variable set under `[data-theme]` bridged to Tailwind; `public.css` oatmeal/ink/ember-red palette is a head start for Skin 1.
- Fonts currently shipped: Plus Jakarta Sans + Instrument Serif + Inter + JetBrains Mono (§3.4 names IBM Plex — final call is an open micro-decision, tracked as askM).
- `posthog-js` is installed and in use (§6.8's Umami alternative may be redundant — askM).

**Open micro-decisions (bounded, askM batch):** fonts · OG image style · llms.txt / `.md`-mirror format · skin-switcher UX · trace animation feel · MCP tool surface/transport · captcha-vs-honeypot evidence · analytics PostHog-vs-Umami.

---

## 12 · Micro-decision verdicts (askM) — 2026-11-16

All eight micro-decisions were researched in two grounded NotebookLM passes. User decision (2026-11-16): **lock the high-confidence verdicts now; re-research the medium-confidence ones with sharper framing** (second pass → §12.1).

| #      | Topic            | Verdict                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Status    |
| ------ | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| **Q3** | Machine layer    | **JSON-LD ProfilePage + static `/llms.txt` (<2KB) only. No `.md` mirrors, no `llms-full.txt`** — no evidence agents consume them (supersedes §8's mirror commitment).                                                                                                                                                                                                                                                                                                        | ✅ locked |
| **Q5** | Trace feel       | **"Thinking" = oscilloscope scan-sweep** (1px hairline, translateX, 1000ms linear, once per second). **"Streaming" = monospace + blinking block cursor at the write head** (kept separate — don't conflate latency with text emission). Reduced-motion → static line + 120ms crossfade.                                                                                                                                                                                      | ✅ locked |
| **Q7** | Contact security | **Drop reCAPTCHA v3 entirely** (undermines the privacy trust position; fails behind corporate proxies; unnecessary for low-traffic). Stack: honeypot + Zod + DOMPurify + **throttle 3/hr/IP**. A3's verify-then-align becomes: verify current wiring, then remove v3 and tighten the throttle.                                                                                                                                                                               | ✅ locked |
| **Q8** | Analytics        | **PostHog cookieless only** (`persistence: 'memory'`, `autocapture: false`); events: resume download, demo click, contact submit, sliced by `?ref`. No Umami (never installed; cookieless PostHog delivers the no-cookies trust claim + funnel slicing).                                                                                                                                                                                                                     | ✅ locked |
| **Q1** | Fonts            | **Full IBM Plex swap (Plex Sans + Plex Mono only, `next/font/google`).** Second pass confirms: Inter/Plus-Jakarta/Space-Grotesk is documented as the AI-template median; the swap is a net performance saving (~60–80KB vs 140–200KB+ across four families); no data ties typeface to hiring outcomes, but evaluators report rejecting sites that read templated or overengineered. 35% evidence / 65% taste — locked as the committed aesthetic bet.                        | ✅ locked |
| **Q2** | OG images        | **One static branded OG image (copper trace motif on graphite) for all pages** — _reversed_ from the first pass's per-page `next/og`. No empirical CTR data exists for professional link shares; ~5-page differentiation adds no informational value; dynamic OG adds Satori/Wasm build fragility to a static site. The funnel is won on the live page, not the thumbnail. 20% evidence / 80% pragmatism.                                                                    | ✅ locked |
| **Q4** | Switcher UX      | **Defer the public skin switcher for v1** — ship one curated public skin (the flagship graphite/copper identity) + a standard light/dark scheme toggle in the header. Exemplar portfolios commit to one identity; exposing multi-skin reads as indecision; segmented controls carry real WCAG touch-target/focus traps; overengineering is a documented rejection reason. Switcher UI ships when a second skin is fully realized (Phase 3 still builds skins as token data). | ✅ locked |
| **Q6** | MCP surface      | **Defer the MCP server; ship llms.txt + JSON-LD now; evaluate an endpoint only after the human-facing site is stable** — _reversed_ from the first pass. No evidence recruiter-side agents call remote MCP endpoints on personal sites in 2026 (agentic screening = search-and-fetch over HTML/JSON-LD/static feeds); a hosted endpoint adds operational surface a solo developer must babysit. 80% evidence / 20% taste. Phase 4 downgrades MCP to post-stability.          | ✅ locked |

### 12.1 · Second research pass (2026-11-16 — done)

Sharper framing produced two reversals, both conservative (build-more → cheapest-correct-path), consistent with the committed-identity philosophy. Provenance: `askM3` grounded pass (source IDs + taste/evidence splits per verdict). If the user later prefers the first-pass options (per-page OG; MCP v1), revert in this table.

---

## 13 · Scope amendment — 3D presence across the site (2026-11-17, user decision)

**Decision:** 3D is not confined to the Signature hero. The user opted to extend 3D presence **across more of the site**. This amends the §2.1 posture: the Default view keeps its hard guarantee (**fully usable if 3D never loads**), and public sections receive an **ambient 3D enhancement layer** on top of that guarantee.

### 13.1 Tiered intensity — how "more 3D" stays shippable

| Tier                      | Where                        | What                                                                                                                        | Tech                                                            |
| ------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **T3 — full instrument**  | Signature hero view          | The §4 experience: live signal-trace, AI-state binding, postprocessing                                                      | r3f canvas, postprocessing, GSAP                                |
| **T2 — ambient element**  | Projects, About, Contact     | One lightweight 3D element per section (low-poly mesh / shader plane / parallax depth), visually subordinate to the content | r3f (shared canvas per page where possible), GSAP ScrollTrigger |
| **T1 — depth, no canvas** | Blog, footer, neutral chrome | CSS 3D transforms / tilt / layered parallax — zero WebGL cost                                                               | CSS transforms                                                  |

Blog stays T1: long-form reading pages don't earn GPU time. Admin never gets ambient 3D.

### 13.2 Hard constraints (non-negotiable, per section)

- **≤2 active canvases per page**, `frameloop="demand"` when offscreen, assets lazy-loaded and Draco/KTX2 compressed.
- **First-load JS budget unchanged:** 3D chunks are lazy; the no-3D First Load JS stays the reference number.
- **Fallback tier per section is a deliverable:** each T2 element has a designed static state (SVG/CSS) — identical layout, no canvas — used for `prefers-reduced-motion` and as the render guarantee.
- **CLS 0:** canvas mounts into reserved space.
- **Mid-tier mobile target:** ambient animations hold ≥50fps on a reference mid-tier phone; 3D assets ≤1.5MB per page compressed.

### 13.3 Relationship to the hero budget

The hero blueprint (§4.5) is unchanged. Ambient T2 elements are separate, smaller units of work scheduled **after** the hero ships, one section at a time per §8's build order — so "more 3D" cannot cannibalize the hero deadline.

## 14 · Contrast reconciliation amendments (Phase 0)

Task 7 made §3.7's automated AA criterion real: `packages/tokens/src/check-contrast.mjs` resolves every declared `contrastPairs` entry in both schemes and compares full-precision WCAG contrast ratios against the pair's required level (`AA_NORMAL` 4.5, `AA_LARGE` 3.0, `NONE` none) — no rounding in comparisons, displayed ratios rounded to 2dp only. The checker is the authority over §3.2's ⚠️ prose. §3.2's values stay locked; the amendments below supersede the matching §3.2 cells, and every amended value stays within its primitive family (graphite for text, ember for accent).

**Before reconciliation** the checker measured **17/20 pair-scheme checks passing**, with exactly three failures, all `AA_NORMAL`: `text.muted.light` 2.07:1, `text.muted.dark` 3.00:1, `accent.link.light` 3.70:1. **After reconciliation: 20/20 pass** — `node packages/tokens/src/check-contrast.mjs` exits 0 (CI wiring is Task 9).

| token            | scheme | was       | now                                        | pair                                    | ratio |
| ---------------- | ------ | --------- | ------------------------------------------ | --------------------------------------- | ----- |
| `text.muted`     | light  | `#A6ADBB` | `#565E6D`                                  | text.muted × surface.base               | 5.98  |
| `text.secondary` | light  | `#565E6D` | `#262B35`                                  | text.secondary × surface.base           | 13.01 |
| `text.muted`     | dark   | `#565E6D` | `#A6ADBB`                                  | text.muted × surface.base               | 8.68  |
| `text.secondary` | dark   | `#A6ADBB` | `#E4E7EC`                                  | text.secondary × surface.base           | 15.79 |
| `accent.link`    | light  | `#C1662E` | `#9A4E22`                                  | accent.link × surface.base              | 5.52  |
| `accent.link`    | dark   | `#D68A54` | `#D68A54` _(unchanged — prose correction)_ | accent.link × surface.base              | 7.10  |
| `status.success` | light  | `#2E9E6D` | `#2E9E6D` _(unchanged — deferred)_         | _(informational — not a declared pair)_ | 3.09  |

**Rows 1–4 — the separation pattern.** Each scheme is one linked pair of moves: the failing `text.muted` takes the nearest same-family primitive that passes (graphite-500 light, graphite-300 dark), and `text.secondary` then shifts one graphite step toward **more prominence** (darker in light, lighter in dark) so muted ≠ secondary and the primary > secondary > muted hierarchy holds in both schemes. The graphite scale is sparse (300/500/800 on the light end, 100/300/500 on the dark end), so "one step" lands on graphite-800 (light) and graphite-100 (dark); no intermediate step exists and none was invented. `text.secondary` also holds its second declared pair: 14.20:1 on `surface.panel` light, 13.32:1 dark.

**Row 5.** `accent.link.light` steps from ember-500 to ember-600, the nearest passing ember primitive (5.52:1). It now equals `accent.hover.light` (`#9A4E22`) — the same link == hover pattern that already exists on dark (both `#D68A54`).

**Row 6 — prose correction, not a value change.** §3.2's `accent.link` row claims "base copper on `#0A0C10` ≈ 3.8:1 = AA fail". Measured: `#C1662E` on `#0A0C10` is 4.85:1 — a **pass**. The shipped dark value `#D68A54` measures 7.10:1. `accent.link.dark` therefore stays `#D68A54` (§3.3's "dark = illuminated signal" independently justifies ember-400 for links on dark); the ⚠️ note is superseded by this row and §3.2 is not edited.

**Row 7 — informational, outside the declared matrix.** `status.success.light` (`#2E9E6D`) measures 3.09:1 on `surface.base` — below `AA_NORMAL`, but `status.*` is scheme-constant and no `contrastPairs` entry declares it, so Phase 0's gate does not apply. Its only planned consumer (the "Available for work" badge) is Phase 1 work; the resolution — darken within the status family, same-hue luminance shifts only, never hue changes — is **deferred to Phase 1**. Value unchanged in Phase 0.

**Reconciliation rule (for future audits):** a failing token moves to the nearest primitive **of the same family** that passes; if that collides with a sibling in the hierarchy, the sibling shifts one step toward more prominence — and both moves get separate rows here. `status.*` may never change hue; luminance within the same hue only.

---

## 15 · Token-source closure amendments (2026-11-18, Phase 0)

**User ruling:** §3.7 criterion 1's hex ban is Phase 0 scope. It is not deferred to Phase 1; the destination contract (§3.1) simply arrives earlier than the rest of the component layer.

**What changed**

| #   | Amendment                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A5  | `tokens.json` gained scheme-independent groups that previously existed only as literals or CSS: `publicSurface` (12 paper/ink roles), `sandboxSurface` (5 IDE chrome roles), `legacyPalette` (7 pre-DTCG stop colors), `brand.google` (4 mark colors, literal by definition) and `scene` (hero light/ambient/accent, backdrop, fallback stops, shape colors, 404, admin particle states, chart colors). `scene.chart` stays DTCG so the generator can emit it; the rest of `scene` is raw values consumed by TypeScript. |
| A6  | `build.mjs` emits `--pf-public-*`, `--pf-sandbox-*`, `--pf-legacy-palette-*` and `--pf-scene-chart-*` at `:root`. Skin blocks are unchanged; `:root` is shared overhead under the budget rule, so the per-skin <8KB result is unaffected (1,845 B).                                                                                                                                                                                                                                                                      |
| A7  | `apps/web/src/lib/design-tokens.ts` is the literal-value bridge: it re-exports `@portfolio/tokens/tokens.json` for Three.js materials, SVG chart props, `themeColor` metadata and the Google mark. It defines no colors.                                                                                                                                                                                                                                                                                                 |
| A8  | `packages/tokens/src/check-no-hex.mjs` scans `apps/web/src`, `packages/ui/src`, `packages/shared/src` and `apps/web/tailwind.config.ts`; the `tokens` CI job fails on any raw hex. `tokens.json` and generated `dist/` remain the only places a hex literal may live.                                                                                                                                                                                                                                                    |
| A9  | Values preserve the shipped rendered colors exactly — this is a source migration, not a visual redesign. One documented delta: the sandbox header used `#18181b/80`; Tailwind v3 cannot apply an alpha modifier to a `var()` color, so it renders solid `--pf-sandbox-panel` (≈2 RGB points darker over the base).                                                                                                                                                                                                       |

**Skin 1 value note:** §3.2's Skin 1 destination paper is `#F3EDE2`; the shipped `publicSurface.paper` is `#F4F0E7` (the value already live in `public.css`). `publicSurface` is the current public palette, **not** a finished Skin 1. Phase 3 must reconcile the two values when Skin 1 becomes a real skin; do not silently treat one as the other.

**Evidence (Phase 0 close):** token tests 60/60, contrast 20/20, skin 3 budget 1,845 B, hex guard zero violations, `next build` 52 pages, typecheck/lint clean.
