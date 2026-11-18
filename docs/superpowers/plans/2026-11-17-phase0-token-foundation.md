# Phase 0 — Token Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make `tokens.json` the single source of truth for all color/motion design values, delivered as generated CSS behind a no-flash dual-attribute theme provider, with automated WCAG AA contrast and <8KB skin-CSS budget checks.

**Architecture:** A new `packages/tokens` workspace holds the DTCG-shaped `tokens.json` (primitives → semantic) plus a hand-rolled generator emitting `dist/theme-tokens.css` with `--pf-*` custom properties keyed on `[data-scheme][data-skin]`. The web app imports that CSS; a legacy alias block in `globals.css` re-points the existing var names at the new tokens so today's admin UI re-dresses to Skin 3 with zero component edits. `public.css` stays untouched (its hex is Phase 1's demolition site). An inline pre-paint script writes `data-scheme` + `data-skin` (+ `data-theme` mirror) before first paint.

**Tech Stack:** Node ≥24 (built-in `node:test`, zero new deps for the token package), Next.js 15 CSS imports, Tailwind 3 (existing), Vitest + Playwright (existing suites).

**Spec:** `docs/superpowers/specs/2026-11-13-portfolio-themes-design.md` — §2.2, §3 (all), §8 Phase 0 row, §3.7 acceptance criteria. DESIGN contract: root `DESIGN.md`.

## Global Constraints

- Palette values are **locked** from spec §3.2 (copied verbatim below in Task 2). No invented colors except where a contrast failure forces a documented amendment (Task 7 rule).
- All generated CSS custom properties are prefixed `--pf-` (prevents collision with legacy names like `--text-primary`; see Task 5 alias table).
- Components never reference primitives or hex — semantic roles only (spec §3.1). Enforced by DESIGN.md + review checklist.
- Per-skin CSS block **< 8192 bytes raw** (spec §3.7), checked in CI.
- Every declared text/background pair ≥ WCAG AA in **both schemes**, automated (spec §3.7).
- No-flash: attributes applied by inline script before first paint; SSR default = `data-scheme="dark"` `data-skin="3"` on `<html>` (spec §2.2 graphite identity is dark-first; default scheme decision is revertible one-liner).
- Skins 1–2 are **out of scope** (Phase 3); the generator is skin-agnostic from day one.
- Component-layer tokens are **out of scope** (Phase 1 introduces them per-section); Phase 0 delivers primitives + semantic + motion.
- `next-themes` stays removed; the hand-rolled system is the provider (spec §2.1).
- Root `package.json` version stays `2.0.0` until release; commits use conventional prefixes (`feat:`/`fix:`/`chore:`/`docs:`).

## Review Focus

Five inputs the spec implies but no single task test fully exercises — each pinned by a test in its owning task:

1. **First paint with empty storage** — must render dark/skin-3 with zero flash and both attributes present immediately. → e2e `theme-no-flash.spec.ts` (Task 5).
2. **OS `prefers-color-scheme: light` user with no stored preference** — resolves to light, not dark. → unit test on resolve chain (Task 5).
3. **Legacy `localStorage.theme = "dark"`** — migrated into the new key, never lost, never re-prompted. → unit test (Task 5).
4. **`prefers-reduced-motion: reduce`** — all motion collapses to 120ms opacity fades (spec §3.6). → CSS media block asserted in generated output (Task 3) + globals reduced-motion block (Task 6).
5. **A failing pair declared AA_NORMAL (e.g. muted-on-base)** — checker must **fail the build**, not silently pass. → checker test with a seeded failing pair (Task 7).

**Known spec-prose hazard:** spec §3.2 claims "base copper on `#0A0C10` ≈ 3.8:1 = AA fail". Hand-computed WCAG math gives **≈4.9:1 (pass)**. The checker is the authority, not prose — where checker output contradicts a spec ⚠️ note, fix the spec in the §14 amendment table (Task 7), never hard-code a prose ratio into a test.

---

### Task 1: `packages/tokens` scaffold + WCAG math module (TDD)

**Files:**

- Create: `packages/tokens/package.json`
- Create: `packages/tokens/src/wcag.mjs`
- Test: `packages/tokens/test/wcag.test.mjs`
- Modify: `apps/web/package.json` (add dep), root `package.json` (add `tokens:build` script)

**Interfaces:**

- Consumes: nothing (leaf package).
- Produces: `hexToRgb(hex) → {r,g,b}` (throws on invalid), `relativeLuminance(hex) → number`, `contrastRatio(fgHex, bgHex) → number`, `REQUIRED = { AA_NORMAL: 4.5, AA_LARGE: 3.0, NONE: 0 }` — all consumed by Task 7's checker.

- [x] **Step 1: Write the failing test** — WCAG math with published anchor values:

```js
// packages/tokens/test/wcag.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hexToRgb, relativeLuminance, contrastRatio, REQUIRED } from '../src/wcag.mjs';

test('white vs black = 21:1 (WCAG definition)', () => {
  assert.equal(contrastRatio('#FFFFFF', '#000000'), 21);
});
test('relativeLuminance of #FFFFFF is 1, #000000 is 0', () => {
  assert.equal(relativeLuminance('#FFFFFF'), 1);
  assert.equal(relativeLuminance('#000000'), 0);
});
test('hexToRgb parses and rejects', () => {
  assert.deepEqual(hexToRgb('#0A0C10'), { r: 10, g: 12, b: 16 });
  assert.throws(() => hexToRgb('#GGG'));
});
test('REQUIRED levels', () => {
  assert.equal(REQUIRED.AA_NORMAL, 4.5);
  assert.equal(REQUIRED.AA_LARGE, 3.0);
});
```

- [x] **Step 2: Run to verify failure** — `node --test packages/tokens/test/` → FAIL (module not found).
- [x] **Step 3: Implement `wcag.mjs`** — WCAG 2.x relative luminance: linearize `c/12.92` if `c ≤ 0.03928` else `((c+0.055)/1.055)^2.4`; `L = 0.2126R + 0.7152G + 0.0722B`; ratio = `(Llight + 0.05)/(Ldark + 0.05)`, lighter first.
- [x] **Step 4: Run to verify pass** — `node --test packages/tokens/test/` → PASS.
- [x] **Step 5: Scaffold package + wiring:**

```json
// packages/tokens/package.json
{
  "name": "@portfolio/tokens",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "exports": { "./theme.css": "./dist/theme-tokens.css" },
  "scripts": {
    "build": "node src/build.mjs",
    "test": "node --test test/",
    "check": "node src/check-contrast.mjs && node src/check-budget.mjs"
  }
}
```

Add `"@portfolio/tokens": "2.0.0"` to `apps/web/package.json` dependencies; add `"tokens:build": "node packages/tokens/src/build.mjs"` to root scripts (build script itself lands in Task 3 — create an empty `src/build.mjs` stub now so the script resolves). Run `npm install` so the lockfile records the workspace link (expect zero external packages added).

- [x] **Step 6: Commit** — `feat(tokens): package scaffold with WCAG math module`

### Task 2: `tokens.json` — primitives + Skin 3 semantic + motion + contrastPairs

**Files:**

- Create: `packages/tokens/tokens.json`
- Create: `packages/tokens/src/validate.mjs` (schema assertions, consumed by Task 3 generator)
- Test: `packages/tokens/test/tokens.test.mjs`

**Interfaces:**

- Produces (data contract, consumed by Tasks 3/7): top-level keys `primitives`, `status`, `viz`, `motion`, `skins["3"]`, `contrastPairs`. Semantic tokens carry `{ "light": "<hex|rgba>", "dark": "<hex|rgba>" }`; primitives carry DTCG `{ "$type": "color", "$value": "<hex>" }`. `contrastPairs` entries: `{ "fg": "<semantic.path>", "bg": "<semantic.path>", "level": "AA_NORMAL|AA_LARGE|NONE" }` — pair checked in **both** schemes unless `"schemes": ["dark"]` is given.

- [x] **Step 1: Write the failing test** — validator must accept the real file and reject a fixture missing a `dark` value:

```js
import { validateTokens } from '../src/validate.mjs';
import tokens from '../tokens.json' with { type: 'json' };
test('tokens.json is valid', () => assert.doesNotThrow(() => validateTokens(tokens)));
test('rejects semantic token missing a scheme', () => {
  const bad = structuredClone(tokens);
  delete bad.skins['3'].semantic.surface.base.dark;
  assert.throws(() => validateTokens(bad));
});
test('every contrastPair references a known semantic token', () => {
  /* validateTokens covers this; assert no throw + count > 8 */
});
```

- [x] **Step 2: Run to verify failure** — FAIL (no such files).
- [x] **Step 3: Write `tokens.json`** — exact locked values (spec §3.2):

  - **primitives.graphite (9):** `0: #FFFFFF`, `50: #F4F5F7`, `100: #E4E7EC`, `300: #A6ADBB`, `500: #565E6D`, `800: #262B35`, `850: #1B1F27`, `900: #12151B`, `950: #0A0C10`
  - **primitives.ember (5):** `300: #E3A87C`, `400: #D68A54`, `500: #C1662E`, `600: #9A4E22`, `700: #7A3C18`
  - **primitives.signal (2):** `400: #5C82E0`, `500: #2F5FD1`
  - **status (4, constant across schemes):** success `#2E9E6D`, warning `#C98A2C`, danger `#C64545`, info `#2F5FD1`
  - **viz (8):** `#2F5FD1 #C1662E #2E9E6D #6B5CA5 #2E8C8C #A34D74 #C98A2C #565E6D`
  - **skins["3"].semantic** — token → `{light, dark}`:
    - `surface.base #F4F5F7 / #0A0C10` · `surface.panel #FFFFFF / #1B1F27` · `surface.elevated #E4E7EC / #12151B`
    - `border.hairline #A6ADBB / #262B35` · `border.accent rgba(193,102,46,.30) / rgba(224,137,90,.15)`
    - `text.primary #0A0C10 / #F4F5F7` · `text.secondary #565E6D / #A6ADBB` · `text.muted #A6ADBB / #565E6D`
    - `accent.primary #C1662E / #C1662E` · `accent.link #C1662E / #D68A54` · `accent.trace #C1662E / #D68A54` · `accent.traceHalo — / #E3A87C` (dark-only, light value `null`)
    - `accent.hover #9A4E22 / #D68A54` · `accent.active #7A3C18 / #9A4E22` · `accent.tint #E3A87C / rgba(193,102,46,.15)` · `accent.focus #C1662E / #D68A54`
    - `accentSecondary.base #2F5FD1 / #2F5FD1` · `accentSecondary.link #2F5FD1 / #5C82E0`
  - **motion:** `dur.tap 120ms`, `dur.transition 200ms`, `dur.reveal 350ms`, `ease.out cubic-bezier(0.2, 0, 0, 1)`, `ease.spring cubic-bezier(0.35, 0, 0.1, 1)` (zero bounce — spec §3.6), `reducedMotion.fade 120ms`
  - **contrastPairs (initial matrix):** text.primary/base, text.primary/panel, text.secondary/base, text.secondary/panel, text.muted/base, accent.link/base, accentSecondary.link/base — all `AA_NORMAL`; accent.primary/base, accent.focus/base — `AA_LARGE`; border.hairline/base — `NONE` (decorative hairline; WCAG 1.4.11 applies only to essential boundaries).

- [x] **Step 4: Implement `validate.mjs`** — checks: every semantic token has both `light` and `dark` keys (`null` allowed only for `accent.traceHalo.light`); every `contrastPair.fg/bg` resolves; `$value` is a valid hex via `hexToRgb` (import from `wcag.mjs`).
- [x] **Step 5: Run to verify pass** — `node --test packages/tokens/test/` → PASS.
- [x] **Step 6: Commit** — `feat(tokens): skin 3 semantic map, motion tokens, contrast pair matrix`

### Task 3: Generator → `dist/theme-tokens.css` (deterministic, committed)

**Files:**

- Create: `packages/tokens/src/build.mjs` (replaces Task 1 stub)
- Create: `packages/tokens/dist/theme-tokens.css` (generated, **committed**)
- Test: `packages/tokens/test/build.test.mjs`

**Interfaces:**

- Consumes: `tokens.json` + `validate.mjs` (Task 2).
- Produces: `dist/theme-tokens.css`, exported as `@portfolio/tokens/theme.css` (Task 5 imports it). CSS contract: every semantic token as `--pf-<dotted-path-to-kebab>` (e.g. `accentSecondary.link` → `--pf-accent-secondary-link`), emitted under combined selectors `[data-scheme='light'][data-skin='3'] { … }` and `[data-scheme='dark'][data-skin='3'] { … }`; motion tokens under `:root`; a `@media (prefers-reduced-motion: reduce)` block zeroing durations to 120ms; status/viz constants emitted in both scheme blocks (they are constant, but selectors need them resolved).

- [x] **Step 1: Write the failing test** — generate into a temp dir, assert structure:

```js
test('emits both scheme blocks with locked values', () => {
  const css = build({ outDir: tmp });
  assert.match(css, /\[data-scheme='dark'\]\[data-skin='3'\]/);
  assert.match(css, /--pf-surface-base:\s*#0A0C10/); // dark surface.base
  assert.match(css, /--pf-accent-link:\s*#D68A54/); // dark link steps to ember-400
  assert.match(css, /--pf-dur-tap:\s*120ms/);
  assert.match(css, /prefers-reduced-motion/);
});
test('output is byte-deterministic', () => {
  assert.equal(build({ outDir: a }), build({ outDir: b })); // two runs, identical bytes
});
```

- [x] **Step 2: Run to verify failure** — FAIL (build is a stub).
- [x] **Step 3: Implement `build.mjs`** — read + validate `tokens.json`, kebab-case the paths (`/[A-Z]/ → -$&lower`), emit blocks in fixed key order, write file with trailing newline. No minification needed (budget check is raw bytes).
- [x] **Step 4: Run to verify pass** + regenerate the committed file — `node packages/tokens/src/build.mjs && node --test packages/tokens/test/` → PASS.
- [x] **Step 5: Commit** — `feat(tokens): deterministic CSS generator with committed dist output`

### Task 4: IBM Plex font swap (`next/font`)

**Files:**

- Modify: `apps/web/src/lib/fonts.ts` (full rewrite of exports)
- Test: covered by build + typecheck; visual smoke in Task 6.

**Interfaces:**

- Produces (unchanged var names, new values): `--font-display` (Plex Sans, 600/700 weight styling), `--font-body` (Plex Sans), `--font-mono` (Plex Mono), `--font-serif` (aliased to `var(--font-body)` — interim; `public.css` references `--font-serif` and would break to browser-default if left undefined, because an undefined `var()` invalidates the whole `font-family` declaration). Q1 spec §12: Plex Sans + Plex Mono **only**.

- [x] **Step 1: Rewrite `fonts.ts`** — `Plex_Sans({ subsets: ['latin'], display: 'swap' })` + `Plex_Mono({ subsets: ['latin'], display: 'swap' })` from `next/font/google`; keep the exported `fontVariables` composition shape so `layout.tsx` keeps working; delete `Plus_Jakarta_Sans`, `Instrument_Serif`, `Inter`, `JetBrains_Mono`; map `--font-serif` to the sans variable with a `// Phase 1: public surface restyle removes serif role` comment.
- [x] **Step 2: Verify** — `npm run typecheck && npm run build` (from repo root) → PASS; grep confirms no other file imports the deleted exports (`grep -r "Instrument_Serif\|Plus_Jakarta\|JetBrains_Mono" apps/web/src packages/ui/src` → no matches; adjust any hit you find).
- [x] **Step 3: Commit** — `feat(web): swap font stack to IBM Plex Sans + Plex Mono (spec Q1)`

### Task 5: No-flash dual-attribute provider + scheme toggle

**Files:**

- Create: `apps/web/src/lib/theme.ts` (pure logic)
- Create: `apps/web/src/lib/theme-script.ts` (inline script string, single source)
- Modify: `apps/web/src/app/layout.tsx` (script swap, `<html data-scheme="dark" data-skin="3">`)
- Modify: `apps/web/src/components/ThemeToggle.tsx` (scheme-only, uses `theme.ts`)
- Test: `apps/web/src/test/__tests__/theme.test.ts` (Vitest, jsdom) + `apps/web/e2e/theme-no-flash.spec.ts` (Playwright; confirm `testDir` from `playwright.config.ts` first)

**Interfaces:**

- Consumes: nothing (browser APIs only).
- Produces (consumed by ThemeToggle + future Phase 3 switcher):
  - `type Scheme = 'light' | 'dark'`; `type Skin = '1' | '2' | '3'`
  - `SCHEME_KEY = 'pf.theme'` (JSON `{scheme, skin}`), `LEGACY_KEY = 'theme'` (read-only migration)
  - `DEFAULT_SCHEME = 'dark'`, `DEFAULT_SKIN = '3'`
  - `resolveStored(): { scheme: Scheme; skin: Skin }` — chain: `pf.theme` → legacy `theme` (string, adopted + migrated) → `matchMedia('(prefers-color-scheme: dark)')` → defaults
  - `persist(scheme, skin): void` — localStorage `pf.theme` + cookie `pf_theme=<scheme>.<skin>; Max-Age=31536000; SameSite=Lax`
  - `applyToDocument(scheme, skin): void` — sets `data-scheme`, `data-skin`, **and `data-theme = scheme`** (legacy mirror so the existing Tailwind `darkMode: ['selector', '[data-theme="dark"]']` keeps working unchanged in Phase 0; mirror is deleted in Phase 1 with the aliases)
  - `THEME_SCRIPT: string` — vanilla pre-paint mirror of `resolveStored`+`applyToDocument`, wrapped in try/catch, no dependencies

- [x] **Step 1: Write the failing unit tests** — jsdom: empty storage + `matchMedia` mock `{matches: false}` → `resolveStored` returns light (OS preference respected — Review Focus #2); `{matches: true}` → dark. Legacy migration: seed `localStorage.theme = 'dark'` → resolves dark AND writes `pf.theme` (Review Focus #3). `applyToDocument` sets all three attributes. `THEME_SCRIPT` string contains `data-scheme`, `data-skin`, `data-theme`, and `prefers-color-scheme`.
- [x] **Step 2: Run to verify failure** — `npm test -- src/test/__tests__/theme.test.ts` (from `apps/web`) → FAIL.
- [x] **Step 3: Implement `theme.ts` + `theme-script.ts`** — script string is hand-written vanilla (it runs before React); the unit test asserts behavioral parity markers (attribute names + matchMedia + storage keys).
- [x] **Step 4: Update `layout.tsx`** — `<html lang="en" data-scheme="dark" data-skin="3" className={fontVariables} suppressHydrationWarning>`; replace the inline script body with `__html: THEME_SCRIPT`; keep the existing comment about the admin `data-theme` contract, updated to mention the mirror.
- [x] **Step 5: Rework `ThemeToggle.tsx`** — scheme-only toggle reading `resolveStored()` on mount, calling `persist` + `applyToDocument` on click; keep the sun/moon SVGs and the `mounted` guard; `aria-label` stays dynamic.
- [x] **Step 6: Write the failing e2e test, then run it** — `apps/web/e2e/theme-no-flash.spec.ts`:

```ts
test('applies persisted scheme+skin before paint', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('pf.theme', '{"scheme":"light","skin":"3"}'));
  await page.goto('/');
  const attrs = await page.evaluate(() => document.documentElement.dataset);
  expect(attrs['scheme']).toBe('light');
  expect(attrs['skin']).toBe('3');
});
test('resolves dark from OS preference with empty storage', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const attrs = await page.evaluate(() => document.documentElement.dataset);
  expect(attrs['scheme']).toBe('dark');
  expect(attrs['skin']).toBe('3');
});
test('resolves light from OS preference with empty storage', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const attrs = await page.evaluate(() => document.documentElement.dataset);
  expect(attrs['scheme']).toBe('light');
  expect(attrs['skin']).toBe('3');
});
```

Run `npm run test:e2e` (from `apps/web`) → PASS. (Review Focus #1 pinned here; the OS-light test pins Review Focus #2 end-to-end because Playwright's default emulation is light.)

- [x] **Step 7: Commit** — `feat(web): no-flash dual-attribute theme provider with legacy migration`

### Task 6: Legacy alias bridge in `globals.css` (admin re-dresses to Skin 3)

**Files:**

- Modify: `apps/web/src/app/layout.tsx` (add `import '@portfolio/tokens/theme.css';` above `globals.css`)
- Modify: `apps/web/src/styles/globals.css` (both `[data-theme]` blocks: colors → aliases; motion → aliases)

**Interfaces:**

- Consumes: `--pf-*` variables (Task 3), `THEME_SCRIPT` mirror attribute `data-theme` (Task 5).
- Produces: every legacy color/motion var resolves from generated tokens. Exact alias block (place inside **both** existing `[data-theme]` blocks, values are scheme-agnostic because the `--pf-` targets already resolve per-scheme):

```css
/* ── Legacy aliases → DTCG tokens (deleted in Phase 1 with per-section rebuild) ── */
--accent-50: var(--pf-accent-tint);
--accent-100: var(--pf-accent-tint);
--accent-200: var(--pf-accent-tint);
--accent-300: var(--pf-accent-trace-halo);
--accent-400: var(--pf-accent-trace);
--accent-500: var(--pf-accent-primary);
--accent-600: var(--pf-accent-hover);
--accent-700: var(--pf-accent-active);
--accent-800: var(--pf-accent-primary);
--surface-primary: var(--pf-surface-base);
--surface-secondary: var(--pf-surface-panel);
--surface-elevated: var(--pf-surface-elevated);
--border-primary: var(--pf-border-hairline);
--text-primary: var(--pf-text-primary);
--text-secondary: var(--pf-text-secondary);
--text-tertiary: var(--pf-text-muted);
--text-inverse: var(--pf-surface-base);
--text-link: var(--pf-accent-link);
--semantic-success: var(--pf-status-success);
--semantic-success-bg: color-mix(in srgb, var(--pf-status-success) 12%, transparent);
--semantic-warning: var(--pf-status-warning);
--semantic-warning-bg: color-mix(in srgb, var(--pf-status-warning) 12%, transparent);
--semantic-error: var(--pf-status-danger);
--semantic-error-bg: color-mix(in srgb, var(--pf-status-danger) 12%, transparent);
--semantic-info: var(--pf-status-info);
--semantic-info-bg: color-mix(in srgb, var(--pf-status-info) 12%, transparent);
--duration-micro: var(--pf-dur-tap);
--duration-fast: var(--pf-dur-transition);
--duration-normal: var(--pf-dur-reveal);
--duration-slow: var(--pf-dur-reveal);
--duration-reveal: var(--pf-dur-reveal);
--duration-emphasis: var(--pf-dur-reveal);
--ease-out: var(--pf-ease-out);
--ease-in-out: var(--pf-ease-out);
--ease-spring: var(--pf-ease-spring);
--ease-bounce: var(--pf-ease-spring); /* zero-bounce per spec §3.6 */
--shadow-accent-focus: 0 0 0 4px color-mix(in srgb, var(--pf-accent-primary) 20%, transparent);
```

Note: `--border-accent` keeps its existing per-scheme definition (it collides with no `--pf-` name); the glass/gradient/scrim/neu vars stay as-is — they are legacy visual residue deleted in Phase 1 (bento/glass are banned AI tells, spec §7).
Also update the existing `@media (prefers-reduced-motion: reduce)` block: replace the `0.01ms` nuclear option with **120ms opacity-only fades** per spec §3.6 (`transition-property: opacity` for the sweep; keep `scroll-behavior: auto`).

- [x] **Step 1: Apply the alias blocks + import** (single edit set as above).
- [x] **Step 2: Verify build + full web suite** — `npm run typecheck && npm run lint && npm run build` (root) → PASS; `npm test` (from `apps/web`) → PASS.
- [x] **Step 3: Visual smoke, both surfaces** — `npm run dev` (root), then check with the browser: `/admin/login`, `/admin`, one public page. Confirm: dark default renders graphite + copper (no blue/cyan remnants in chrome, buttons, focus rings); scheme toggle flips surfaces; no unstyled flash on hard reload. **Known interim states (acceptable, do not fix):** public pages still render the `.site` paper palette (Phase 1); admin glass/mesh gradient utilities render legacy visuals (Phase 1 deletes them); `public.css` serif role renders sans (Task 4 note).
- [x] **Step 4: Commit** — `feat(web): alias legacy tokens onto DTCG semantic layer (admin re-dresses to skin 3)`

### Task 7: Contrast checker + value reconciliation (spec §14 amendments)

**Files:**

- Create: `packages/tokens/src/check-contrast.mjs`
- Create: `packages/tokens/src/reconcile-notes.md` → **no** — reconciliation edits land in `tokens.json` + spec §14; no scratch notes.
- Modify: `packages/tokens/tokens.json` (only where a pair fails)
- Modify: `docs/superpowers/specs/2026-11-13-portfolio-themes-design.md` (new `## 14 · Contrast reconciliation amendments (Phase 0)`)
- Test: `packages/tokens/test/check-contrast.test.mjs`

**Interfaces:**

- Consumes: `wcag.mjs` (Task 1), `tokens.json` pair matrix (Task 2).
- Produces: exit code 0 = all pairs pass; non-zero with a table of `fg × bg × scheme: actual < required` failures. CI runs it (Task 9).

- [x] **Step 1: Write the failing test** — seeded failure: run the checker logic against a tokens fixture where `text.muted.light` is `#A6ADBB` on `#F4F5F7` (≈2.0:1 < 4.5) → must report failure, exit non-zero; and against the real `tokens.json` with `process.exitCode` stubbed → records current pass/fail set.
- [x] **Step 2: Implement `check-contrast.mjs`** — resolve each pair per scheme, compare against `REQUIRED[level]`, print a pass table + failure table, `process.exit(failures ? 1 : 0)`.
- [x] **Step 3: Run against the real tokens — expect failures** (`AA_NORMAL` suspects per spec values: `text.muted` light ≈2.0:1, `accent.link` light ≈3.7:1, `status.success` light ≈3.1:1; dark `text.muted` ≈3.0:1). **Reconciliation rule:** move the failing token to the nearest primitive of the same family that passes (e.g. `accent.link.light` → ember-600 `#9A4E22` ≈5.5:1; `text.muted.light` → graphite-500 `#565E6D` ≈5.9:1 — note this makes muted == secondary; if hierarchy demands separation, step `text.secondary.light` down one graphite step instead, and record which). Never touch `status.*` semantics by hue — only luminance within the same hue. Every change = one row in spec §14: `| token | scheme | was | now | pair | ratio |`.
- [x] **Step 4: Regenerate + rerun everything** — `node packages/tokens/src/build.mjs && node packages/tokens/src/check-contrast.mjs` → exit 0; `node --test packages/tokens/test/` → PASS.
- [x] **Step 5: Commit** — `fix(tokens): reconcile failing contrast pairs to WCAG AA; record §14 amendments`

### Task 8: Skin-CSS budget check (<8KB)

**Files:**

- Create: `packages/tokens/src/check-budget.mjs`
- Test: `packages/tokens/test/check-budget.test.mjs`

**Interfaces:**

- Consumes: `dist/theme-tokens.css`.
- Produces: exit 0 iff every skin block's raw bytes < 8192. Splits the file on `[data-scheme=` block boundaries and measures per skin (today: one skin; Phase 3 adds 1–2 automatically).

- [x] **Step 1: Write the failing test** — fixture CSS: one 8191-byte block (pass) + one 8193-byte block (fail).
- [x] **Step 2: Implement `check-budget.mjs`** — parse blocks by selector regex, byte-measure (`Buffer.byteLength`), report per-skin table, exit accordingly.
- [x] **Step 3: Run against real output** — `node packages/tokens/src/check-budget.mjs` → exit 0 (expected size ≈3–4KB; if over, minify the generator output instead of trimming tokens).
- [x] **Step 4: Commit** — `feat(tokens): per-skin CSS budget check (<8KB, spec §3.7)`

### Task 9: CI wiring + contract docs + full gate

**Files:**

- Modify: `.github/workflows/ci.yml` (new `tokens` job — read the existing job style below line 120 first)
- Modify: `DESIGN.md` (token pipeline section)
- Modify: `PROGRESS.md` (session log)

**Interfaces:**

- Consumes: all prior tasks.
- Produces: CI enforcement of Tasks 3/7/8.

- [x] **Step 1: Add the CI job** (no npm install needed — pure Node):

```yaml
tokens:
  name: Token checks
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v7
    - uses: actions/setup-node@v7
      with: { node-version: '24' }
    - run: node packages/tokens/src/build.mjs
    - run: node --test packages/tokens/test/
    - run: node packages/tokens/src/check-contrast.mjs
    - run: node packages/tokens/src/check-budget.mjs
    - run: git diff --exit-code -- packages/tokens/dist # committed output must be fresh
```

- [x] **Step 2: Update `DESIGN.md`** — add: pipeline (`tokens.json` → `build.mjs` → `dist/theme-tokens.css` → `--pf-*` → alias bridge), the regenerate command (`npm run tokens:build`), the dual-attribute contract (`data-scheme` × `data-skin`, `data-theme` = deprecated mirror), the component-layer deferral, and the alias-deletion note for Phase 1.
- [x] **Step 3: Full gate** — `npm run typecheck && npm run lint && npm test (api) && npm test (web) && npm run build` → all green; then `node packages/tokens/src/check-contrast.mjs && node packages/tokens/src/check-budget.mjs` → green.
- [x] **Step 4: Verify §3.7 acceptance criteria** — walk the checklist explicitly (tokens single source / no-flash / <8KB / AA both schemes / DESIGN.md) and tick them in `PROGRESS.md`.
- [x] **Step 5: Commit** — `chore(ci): token checks gate; docs: DESIGN.md pipeline + PROGRESS Phase 0 status`

---

## Post-plan closure — §3.7 criterion 1 (2026-11-18)

All nine tasks above are complete. After the Task 9 gate, the user ruled that §3.7 criterion 1's hex ban is Phase 0 scope, so closure landed as follow-up work:

- `tokens.json` gained `publicSurface`, `sandboxSurface`, `legacyPalette`, `brand.google` and `scene` groups; `build.mjs` emits their CSS at `:root` (spec §15, A5–A6).
- `apps/web/src/lib/design-tokens.ts` re-exports token values for WebGL, charts, metadata and the Google mark (A7).
- `globals.css`, `public.css`, `tailwind.config.ts`, sandbox chrome, admin charts and `layout.tsx` `themeColor` migrated to token references (A9).
- `packages/tokens/src/check-no-hex.mjs` plus five guard tests and a CI step enforce the ban (A8).
- Evidence: token tests 60/60 · contrast 20/20 · budget 1,845 B · hex guard zero violations · `next build` 52 pages · typecheck/lint clean.
