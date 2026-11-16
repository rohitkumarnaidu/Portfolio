# Portfolio Redesign — Multi-Theme 3D Architecture · Design Spec

**Status:** ✅ APPROVED by user (2026-11-16) — next step: writing-plans → Phase 0 build. Amended §11 (2026-11-16 groundwork audit).
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
| Excluded | Reason |
|---|---|
| 8 theme universes / per-theme 3D scenes | Triple-anchored rejection: Nov report + user's own AXIS doc + nickvirden.com precedent. Every time the count hit 8, a doc corrected it down. |
| Public sandbox IDE | Megabytes JS, COOP/COEP conflicts, mobile-unusable. Stays admin-only at `/admin/sandbox` (user decision). |
| Full visitor-role modes (Recruiter/Client/Developer routing) | Zero portfolio precedent; SaaS conversion stats don't transfer; overengineering rejection trigger. Light-touch CTA instead (user decision). |
| i18n in v1 | Scope discipline (user decision). Architecture stays locale-ready. |
| Vector RAG for the AI chat | Rate-limited curated-prompt endpoint is enough; RAG plumbing is weeks for marginal gain. |
| Real-time PBR / EffectComposer / compute-particle spectacle / UI sound | Documented over-engineering flags; EffectComposer is dead on WebGPU. |

---

## 2 · Site Architecture

### 2.1 Views (two, behind one switcher)
- **Signature view** — the 3D instrument hero experience. Loaded **on interaction**, never the critical path.
- **Default view** — fast, content-first editorial that **carries the entire funnel alone** (must be fully usable if 3D never loads).
- Switcher persisted (localStorage + cookie mirror) via the repo's proven hand-rolled no-flash script, extended to write both attributes before first paint. `next-themes` is NOT used (groundwork audit: installed with zero imports — the hand-rolled system won; dead dep removed).
- **Archive posture:** superseded visual expressions live on as sub-paths (e.g. `/archive/<name>`) rather than being deleted — the honest path to "more" over the site's lifetime.

### 2.2 Skins × Schemes (dual attributes on `<html>`)
`data-scheme="light|dark"` × `data-skin="1|2|3"`

| Skin | Identity | Palette soul | Scheme character |
|---|---|---|---|
| **1 · Light Editorial** | "Oatmeal & Ink" — high-grade tactile paper | Oatmeal `#F3EDE2` · Textured Gray `#D8D1C7` · Ink `#2B2B2B` | Light-first; crisp hairline dividers; no pure white |
| **2 · Dark Editorial** | Tinted graphite, machined | Graphite scale `#0A0C10 → #1B1F27` | Dark-first; elevation-by-lightening; **no drop shadows** |
| **3 · Signature Accent** | The one committed identity | Graphite scale + **Ember Copper `#C1662E`** primary + **Signal Cobalt `#2F5FD1`** secondary | Full light **and** dark renderings (accent changes *behavior* per scheme, below) |

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
| Semantic token | Light | Dark | Role / notes |
|---|---|---|---|
| `surface.base` | `#F4F5F7` | `#0A0C10` | never `#000000` (OLED halation) |
| `surface.panel` | `#FFFFFF` | `#1B1F27` | cards, code panels |
| `surface.elevated` | `#E4E7EC` | `#12151B` | modals, popovers |
| `border.hairline` | `#A6ADBB` | `#262B35` | 1px structural boundaries |
| `border.accent` | `rgba(193,102,46,.30)` | `rgba(224,137,90,.15)` | active card perimeter, active tab |
| `text.primary` | `#0A0C10` | `#F4F5F7` | softened on dark, never pure white |
| `text.secondary` | `#565E6D` | `#A6ADBB` | |
| `text.muted` | `#A6ADBB` | `#565E6D` | placeholders, labels |
| `accent.primary` | `#C1662E` | `#C1662E` | solid fill (light) / signal (dark) |
| `accent.link` | `#C1662E` | `#D68A54` ⚠️ | **dark links MUST step to ember-400** (base copper on `#0A0C10` ≈ 3.8:1 = AA fail) |
| `accent.trace` | `#C1662E` | `#D68A54` (+ soft `#E3A87C` halo) | hero live signal-trace |
| `accent.hover` | `#9A4E22` | `#D68A54` + glow halo | |
| `accent.active` | `#7A3C18` + `scale(.98)` | `#9A4E22` | |
| `accent.tint` | `#E3A87C` | `rgba(193,102,46,.15)` | selection `rgba(193,102,46,.20)`, badges |
| `accent.focus` | `#C1662E` | `#D68A54` | 2px outline, offset 2px, never color-only |
| `accent-secondary.base` | `#2F5FD1` | `#2F5FD1` | code highlights, terminal, metadata |
| `accent-secondary.link` | `#2F5FD1` | `#5C82E0` ⚠️ | signal-400 on dark |
| `status.success` | `#2E9E6D` (constant) | | "Available for work" |
| `status.warning` | `#C98A2C` (constant) | | |
| `status.danger` | `#C64545` (constant) | | never the brand accent |
| `status.info` | `#2F5FD1` (constant) | | |
| `viz.1–8` | `#2F5FD1 #C1662E #2E9E6D #6B5CA5 #2E8C8C #A34D74 #C98A2C #565E6D` | | instrument-panel chart set; series 1–2 = the brand accents; color never alone (dash/labels) |

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
| Band | Range | Use |
|---|---|---|
| taps | 50–150ms | direct manipulation, hover/press |
| transitions | 150–260ms | menus, panels |
| reveals | 260–500ms | section entrance |
| springs | stiffness ~350, damping ~25, **zero bounce** | interactive elements |
| reduced-motion | → 120ms opacity fades only | all of the above collapse |

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
| Assistant state | Trace behavior |
|---|---|
| idle | static trace, instrument calm |
| thinking | oscilloscope scan-sweep across the schematic |
| streaming | trace pulses / data-packet flow at read speed |
| error | semantic `status.danger` flicker (never brand copper) |

### 4.4 Fallback tiers (non-negotiable)
| Condition | Render |
|---|---|
| viewport <768px | **SVG vector schematic** (the specimen hero is the seed) — instant, LCP-safe |
| `prefers-reduced-motion` | static schematic, 120ms fades only |
| no WebGPU | WebGL2 (same TSL path) |
| no WebGL | SVG tier |
| JS disabled | static SVG + full content |

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
- [ ] hairline-rule broadsheet as *decoration*
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

| Phase | Deliverable | Exit criteria |
|---|---|---|
| **0 · Foundation** | tokens.json + generator, theme provider (no-flash, dual attrs, persistence), contrast checks, skin-CSS budget check, DESIGN.md | §3.7 all checked |
| **1 · Content path (Default view)** | hero-lite → flagship case studies → capabilities → principles → contact + security; machine layer (§6.1); SEO/OG; analytics; availability badge | funnel complete with 3D disabled; CWV green |
| **2 · Signature** | 3D instrument hero (§4), fallbacks, AI-state binding | scorecard criteria met on mid-range mobile; Safari verified |
| **3 · Skins & switcher** | Skin 1/2 token blocks, switcher, archive posture | switch verified in both schemes, no-flash, <8KB each |
| **4 · Machine extras** | MCP server, AI console chat, GitHub activity | rate-limits + injection tests pass |

**Phase 1 ships before Phase 2** — content before spectacle (evidence: sites flip decisions on substance; beauty rarely flips alone).

---

## 9 · Risks & Honest Tradeoffs

| Risk | Mitigation |
|---|---|
| Copper reads "retro" | 10% discipline + cool-slate neutrals (muddy-brown contamination guard) + no copper backgrounds |
| Cobalt blends into SaaS median | Cobalt is *secondary only*, framed as terminal/code context, never the CTA color |
| Hero scope creep | 2-week budget, blueprint fixed, SVG tier is a *deliverable* not a fallback afterthought |
| Skin switch under-delivers | Skins 1–2 exist precisely to prove token switching is real — they ship in Phase 3 |
| Token drift via AI tools | DESIGN.md + review checklist + CI budget checks |
| 25-section temptation from March plans | Not in this spec; funnel is 5 sections + feature layer |

---

## 10 · Decisions Log (closed)

| # | Decision | Choice |
|---|---|---|
| D1 | Views | 1 Signature + 1 Default + 3 skins + archive |
| D2 | Signature hero | Instrument + live signal-trace (scorecard 66.0) |
| D3 | Visitor modes | Light-touch `?ref=` CTA only |
| D4 | Sandbox | Admin-only at `/admin/sandbox` |
| D5 | i18n | Skip v1 (locale-ready) |
| D6 | Skin 3 accent | **Ember Copper `#C1662E`** primary · Signal Cobalt `#2F5FD1` secondary · full token system + design disciplines locked |
| D7 | Feature verdicts | BUILD: machine layer, badge+GitHub, MCP · LITE: CTA adaptation, admin toggles, AI console chat · SKIP: public sandbox |
| D8 | WebGPU/TSL | Adopt with constraints (TSL-only, no EffectComposer, dispose discipline, mobile SVG tier) |

**Open items: none.**

---

*Review gate: nothing in `apps/web` or `apps/api` changes until this spec is approved. On approval → writing-plans → Phase 0 build.*

---

## 11 · Groundwork Audit Amendments (2026-11-16)

Four amendments approved by the user on 2026-11-16 after a full repo audit (audit report in the ground-work session log). Destination unchanged — these record the *real path*, so the plan doesn't mislead the builder.

| # | Amendment | Decision |
|---|---|---|
| **A1** | Theming implementation | Extend the repo's proven hand-rolled no-flash system (inline pre-paint script + localStorage + `ThemeToggle`) to dual attributes `data-scheme` × `data-skin`. `next-themes` is NOT adopted (audit: installed with zero imports — the hand-rolled system won; dead dep removed). The `data-theme` → `data-scheme` rename lands in Phase 0, not cleanup. |
| **A2** | Phase 0 path | Refactor the **existing** `globals.css` token system + `public.css` editorial palette into the DTCG 3-layer contract (§3), not greenfield. Destination unchanged: `tokens.json` as single source, exact locked values (§3.2). |
| **A3** | Contact security | **Verify-then-align** task: audit what is actually wired on `POST /api/portfolio/leads` (reCAPTCHA v3 installed but wiring unconfirmed; DOMPurify; honeypot), then align to §6.7 (3/hr/IP; today it is throttled 10 per 15min ≈ 40/hr). Throttle looseness is decided after verification, not before. |
| **A4** | RAG posture | D7 stands (no vector RAG; curated-prompt console). Add a 30-min audit of the existing pgvector chat plumbing before Phase 4 design: `DocumentChunk` + `EmbeddingCache` models exist, and `chat.service.ts` still calls the **removed** FastAPI service via `AI_API_URL`. Build RAG-optional only if the infra proves real. |

**Audit reality notes (grounding for the plan):**
- Repo is healthy: real CI (quality matrix, Prisma validation, docker build), 38 API specs, 6 web test files, 4 Playwright e2e specs.
- The contact funnel already exists (`leads` module + admin UI + Zod schemas in `@portfolio/shared`) — §6.5/§6.7 is partially built, not greenfield.
- The existing token system is mature: full CSS-variable set under `[data-theme]` bridged to Tailwind; `public.css` oatmeal/ink/ember-red palette is a head start for Skin 1.
- Fonts currently shipped: Plus Jakarta Sans + Instrument Serif + Inter + JetBrains Mono (§3.4 names IBM Plex — final call is an open micro-decision, tracked as askM).
- `posthog-js` is installed and in use (§6.8's Umami alternative may be redundant — askM).

**Open micro-decisions (bounded, askM batch):** fonts · OG image style · llms.txt / `.md`-mirror format · skin-switcher UX · trace animation feel · MCP tool surface/transport · captcha-vs-honeypot evidence · analytics PostHog-vs-Umami.
