# DESIGN.md — Design Contract

**Status:** active · **Created:** 2026-11-16 · **Source of truth for exact values:** [`docs/superpowers/specs/2026-11-13-portfolio-themes-design.md`](docs/superpowers/specs/2026-11-13-portfolio-themes-design.md) §3 (locked)

This file is the drift shield for every AI tool and human working on this repo. **Read it before any visual/UI change.** It states the rules; the spec states the exact locked values.

---

## 1 · Identity (the one committed identity, few expressions)

- Register: **machined precision** — instrument-panel, editorial, restrained. Distinctive in 50ms; substance first.
- **No AI tells**: no near-black navy `#060D1F` + neon accent, no warm-cream + serif + terracotta combo, no decorative hairlines, no bouncy easing, no interchangeable copy, no bento over-decoration, no hidden nav.
- **One signature element** — the copper live signal-trace (hero, terminal cursor, active-section divider). It does real work. There is no second 3D scene anywhere.

## 2 · Current reality (what ships today)

- **Token pipeline:** `packages/tokens/tokens.json` (DTCG) is the single source of truth → `packages/tokens/src/build.mjs` validates it and deterministically emits the committed `packages/tokens/dist/theme-tokens.css` → `apps/web/src/app/layout.tsx` imports it as `@portfolio/tokens/theme.css`. Generated custom properties are `--pf-*`: motion at `:root`, Skin 3 semantic/status/viz under `[data-scheme='light'][data-skin='3']` and `[data-scheme='dark'][data-skin='3']`, plus a `prefers-reduced-motion` override. Scheme-independent roles also emit at `:root`: `publicSurface` (`--pf-public-*`, the editorial paper/ink palette), `sandboxSurface` (`--pf-sandbox-*`, IDE chrome), `legacyPalette` (`--pf-legacy-palette-*`, the pre-DTCG stop colors) and `scene.chart` (`--pf-scene-chart-*`, Tailwind mesh gradients). Skin 3 is the only skin emitted today; skins 1–2 are Phase 3. **Regenerate with `npm run tokens:build` and commit `dist/`** — CI rebuilds and fails if the committed output is stale or a generated file is missing.
- **Literal-value bridge:** `apps/web/src/lib/design-tokens.ts` re-exports the token values that cannot be CSS custom properties — Three.js materials, SVG chart props, `themeColor` metadata and the Google brand mark. It imports `@portfolio/tokens/tokens.json`; it never defines a color of its own. Add values to `tokens.json` first, then consume them here.
- **Legacy alias bridge:** `apps/web/src/styles/globals.css` maps the component-facing names (`--accent-*`, `--surface-*`, `--border-primary`, `--text-*`, `--semantic-*`, most `--duration-*`/`--ease-*`) onto the generated `--pf-*` tokens, so existing admin/UI components re-dress with zero edits. Its gradient stops now reference `--pf-legacy-palette-*`; the three timing names `--duration-instant`, `--ease-in`, `--ease-smooth` remain hand-authored literals until Phase 1 removes them. Shadows, glass, blur, scrim and ambient-pattern values are still hand-authored in that file. **The aliases are Phase 0 scaffolding** — deleted in Phase 1 with the per-section rebuild, when components consume the DTCG semantic/component layer directly.
- **Component-layer deferral:** the DTCG `component` layer does not exist yet (Phase 1+). Until then components consume the existing semantic variables through the alias bridge; no component reads primitives or `--pf-*` directly.
- **Public palette:** `apps/web/src/styles/public.css` — `.site`-namespaced editorial paper palette (oatmeal `#F4F0E7`, ink, ember-red accent `#C2401F`). The values live in `tokens.json` under `publicSurface` and are emitted at `:root`; `public.css` references them, so it carries no hex. This is the seed of Skin 1.
- **Fonts:** `apps/web/src/lib/fonts.ts` via `next/font/google` — IBM Plex Sans in the display (600/700) and body (300–700) roles, IBM Plex Mono (400/500/700) for the technical alphabet. The serif role was removed with the swap; an interim `:root { --font-serif: var(--font-body) }` alias in `globals.css` keeps `public.css` resolving until the Phase 1 restyle. **Family decision is locked** (spec §12 Q1) — not an open micro-decision.
- **Theming:** `<html>` carries `data-scheme="light|dark"` × `data-skin="1|2|3"`. A hand-rolled vanilla inline script (`apps/web/src/lib/theme-script.ts`, injected in `layout.tsx`'s `<head>`) resolves `localStorage.pf.theme` → legacy `theme` key (adopted + migrated) → OS `prefers-color-scheme` → defaults (dark / skin 3) and applies both attributes **before first paint** (no flash). `data-theme` is kept as a **deprecated mirror** of `data-scheme` for the Tailwind `darkMode: ['selector', '[data-theme="dark"]']` config; it is deleted in Phase 1 together with the aliases. Runtime helpers live in `apps/web/src/lib/theme.ts`; `ThemeToggle.tsx` toggles the scheme and persists to localStorage + the `pf_theme` cookie. `next-themes` is **not** used.

## 3 · Destination (locked — Phase 0 onward)

- **DTCG 3-layer tokens** (W3C format): `primitive` → `semantic` → `component`. **Components consume only the semantic/component layer.** No raw hex, no primitive names in component code — ever.
- **Dual attributes on `<html>`:** `data-scheme="light|dark"` × `data-skin="1|2|3"`, applied by the no-flash script before first paint, persisted localStorage + cookie mirror.
- **Skin 3 (flagship) palette:** Ember Copper `#C1662E` (primary) + Signal Cobalt `#2F5FD1` (secondary) on a 9-step cool graphite scale. Exact semantic token table (light/dark values, AA-checked): spec §3.2 as amended by §14.
- **Accent behavior:** light scheme → copper is a **solid machined fill** (CTAs, badges); dark scheme → copper is an **illuminated signal** (glowing 1px trace; link text steps to ember-400 `#D68A54` for contrast). **70-20-10 discipline:** ≤10% copper, never an expansive background fill.
- **Statuses are constant colors, never brand-colored:** success `#2E9E6D` · warning `#C98A2C` · danger `#C64545` · info `#2F5FD1`.
- **Type:** one family across optical roles (locked: IBM Plex Sans, spec §12 Q1); mono for the technical alphabet (hero data, terminal, metadata).
- **Space/radius/borders:** spacing `4·8·12·16·24·32·48·64·96`; radius `4/8/16px`, no pills; 1px hairlines; shadows light-scheme-only; dark = elevation-by-lightening.
- **Motion:** mechanical, critically damped — taps 50–150ms · transitions 150–260ms · reveals 260–500ms · springs stiffness ~350 / damping ~25 / **zero bounce**; `prefers-reduced-motion` → 120ms opacity fades only.

## 4 · Hard rules (checked on every PR)

1. **No raw hex in components** (token drift = #1 maintenance killer). Enforced by `packages/tokens/src/check-no-hex.mjs` in CI — `apps/web/src`, `packages/ui/src`, `packages/shared/src` and `apps/web/tailwind.config.ts` may only reference custom properties or `design-tokens.ts`.
2. **Statuses never brand-colored**; color never carries meaning alone.
3. **WCAG 2.2 AA per token pair, in both schemes** — verified, not eyeballed.
4. **Performance budgets:** LCP ≤2.5s (target <1.5s Default view) · CLS <0.1 · INP <200ms · per-skin CSS **<8KB** · <100 draw calls in the Signature view.
5. **Anti-generic checklist (spec §7) passes** — it is review criteria, not advice.
6. **Accessibility:** skip-link, ARIA landmarks, `focus-visible` everywhere, screen-reader pass per skin.

## 5 · Where things live

| Thing                                     | Path                                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------------- |
| Exact locked token values                 | `docs/superpowers/specs/2026-11-13-portfolio-themes-design.md` §3.2 as amended by §14 |
| Token source (DTCG)                       | `packages/tokens/tokens.json`                                                         |
| Generator (`npm run tokens:build`)        | `packages/tokens/src/build.mjs`                                                       |
| Generated token CSS (committed)           | `packages/tokens/dist/theme-tokens.css` (`@portfolio/tokens/theme.css`)               |
| Literal-value bridge (WebGL/charts/meta)  | `apps/web/src/lib/design-tokens.ts`                                                   |
| Raw-hex guard (CI)                        | `packages/tokens/src/check-no-hex.mjs`                                                |
| Legacy alias bridge (Phase 0 scaffolding) | `apps/web/src/styles/globals.css`                                                     |
| Public palette                            | `apps/web/src/styles/public.css`                                                      |
| Tailwind bridge                           | `apps/web/tailwind.config.ts`                                                         |
| Fonts                                     | `apps/web/src/lib/fonts.ts`                                                           |
| Theme runtime + pre-paint script          | `apps/web/src/lib/theme.ts` · `apps/web/src/lib/theme-script.ts`                      |
| Progress                                  | `PROGRESS.md` (root)                                                                  |
