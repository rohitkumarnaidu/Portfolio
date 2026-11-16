# DESIGN.md — Design Contract

**Status:** active · **Created:** 2026-11-16 · **Source of truth for exact values:** [`docs/superpowers/specs/2026-11-13-portfolio-themes-design.md`](docs/superpowers/specs/2026-11-13-portfolio-themes-design.md) §3 (locked)

This file is the drift shield for every AI tool and human working on this repo. **Read it before any visual/UI change.** It states the rules; the spec states the exact locked values.

---

## 1 · Identity (the one committed identity, few expressions)

- Register: **machined precision** — instrument-panel, editorial, restrained. Distinctive in 50ms; substance first.
- **No AI tells**: no near-black navy `#060D1F` + neon accent, no warm-cream + serif + terracotta combo, no decorative hairlines, no bouncy easing, no interchangeable copy, no bento over-decoration, no hidden nav.
- **One signature element** — the copper live signal-trace (hero, terminal cursor, active-section divider). It does real work. There is no second 3D scene anywhere.

## 2 · Current reality (what ships today)

- **Tokens:** `apps/web/src/styles/globals.css` — full CSS-variable token set (accent scale, surfaces, borders, text, semantic, shadows, durations/easings) with **light + dark** themes under `[data-theme]`. Bridged to Tailwind utilities in `apps/web/tailwind.config.ts` (`darkMode: ['selector', '[data-theme="dark"]']`).
- **Public palette:** `apps/web/src/styles/public.css` — `.site`-namespaced editorial paper palette (oatmeal `#F4F0E7`, ink, ember-red accent `#C2401F`). This is the seed of Skin 1.
- **Fonts:** `apps/web/src/lib/fonts.ts` via `next/font/google` — Plus Jakarta Sans (display/admin), Instrument Serif (public editorial serif), Inter (body), JetBrains Mono (mono). *(Final family decision is an open micro-decision — see PROGRESS.md.)*
- **Theming:** hand-rolled no-flash inline script in `src/app/layout.tsx` + localStorage + `ThemeToggle.tsx` writing `data-theme`. `next-themes` is **not** used (removed 2026-11-16).

## 3 · Destination (locked — Phase 0 onward)

- **DTCG 3-layer tokens** (W3C format): `primitive` → `semantic` → `component`. **Components consume only the semantic/component layer.** No raw hex, no primitive names in component code — ever.
- **Dual attributes on `<html>`:** `data-scheme="light|dark"` × `data-skin="1|2|3"`, applied by the no-flash script before first paint, persisted localStorage + cookie mirror.
- **Skin 3 (flagship) palette:** Ember Copper `#C1662E` (primary) + Signal Cobalt `#2F5FD1` (secondary) on a 9-step cool graphite scale. Exact semantic token table (light/dark values, AA-checked): spec §3.2.
- **Accent behavior:** light scheme → copper is a **solid machined fill** (CTAs, badges); dark scheme → copper is an **illuminated signal** (glowing 1px trace; link text steps to ember-400 `#D68A54` for contrast). **70-20-10 discipline:** ≤10% copper, never an expansive background fill.
- **Statuses are constant colors, never brand-colored:** success `#2E9E6D` · warning `#C98A2C` · danger `#C64545` · info `#2F5FD1`.
- **Type:** one family across optical roles (final call pending askM); mono for the technical alphabet (hero data, terminal, metadata).
- **Space/radius/borders:** spacing `4·8·12·16·24·32·48·64·96`; radius `4/8/16px`, no pills; 1px hairlines; shadows light-scheme-only; dark = elevation-by-lightening.
- **Motion:** mechanical, critically damped — taps 50–150ms · transitions 150–260ms · reveals 260–500ms · springs stiffness ~350 / damping ~25 / **zero bounce**; `prefers-reduced-motion` → 120ms opacity fades only.

## 4 · Hard rules (checked on every PR)

1. **No raw hex in components** (token drift = #1 maintenance killer).
2. **Statuses never brand-colored**; color never carries meaning alone.
3. **WCAG 2.2 AA per token pair, in both schemes** — verified, not eyeballed.
4. **Performance budgets:** LCP ≤2.5s (target <1.5s Default view) · CLS <0.1 · INP <200ms · per-skin CSS **<8KB** · <100 draw calls in the Signature view.
5. **Anti-generic checklist (spec §7) passes** — it is review criteria, not advice.
6. **Accessibility:** skip-link, ARIA landmarks, `focus-visible` everywhere, screen-reader pass per skin.

## 5 · Where things live

| Thing | Path |
|---|---|
| Exact locked token values | `docs/superpowers/specs/2026-11-13-portfolio-themes-design.md` §3.2 |
| Tokens today | `apps/web/src/styles/globals.css` → (Phase 0) `tokens.json` + generator |
| Public palette | `apps/web/src/styles/public.css` |
| Tailwind bridge | `apps/web/tailwind.config.ts` |
| Fonts | `apps/web/src/lib/fonts.ts` |
| Progress | `PROGRESS.md` (root) |
