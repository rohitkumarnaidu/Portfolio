# @portfolio/tokens

Single source of truth for color and motion values. `tokens.json` is DTCG-shaped; `src/build.mjs` validates it and emits the committed `dist/theme-tokens.css`.

## Commands

Run from the repo root:

| Command                                       | What it does                                           |
| --------------------------------------------- | ------------------------------------------------------ |
| `node packages/tokens/src/build.mjs`          | Regenerate `dist/theme-tokens.css` (deterministic)     |
| `node --test` (from this directory)           | Token, build, contrast, budget and hex-guard tests     |
| `node packages/tokens/src/check-contrast.mjs` | WCAG AA check for every declared pair, both schemes    |
| `node packages/tokens/src/check-budget.mjs`   | Fail if a skin's light+dark CSS block is ≥ 8,192 bytes |
| `node packages/tokens/src/check-no-hex.mjs`   | Fail if component code contains a raw hex color        |

`npm run tokens:build` from the repo root is the shorthand for the build step.

## Structure

- `primitives` — raw scales (graphite, ember, cobalt, status, viz).
- `publicSurface` — scheme-independent paper/ink roles for the editorial public site.
- `sandboxSurface` — fixed IDE chrome (always dark, independent of admin theme).
- `legacyPalette` — the pre-DTCG stop colors, kept as tokens so gradients stop carrying hex.
- `brand.google` — third-party mark colors; literal by definition.
- `scene` — WebGL/Three.js colors and fallbacks. `scene.chart` is DTCG (emitted to CSS); the rest is raw values consumed by `apps/web/src/lib/design-tokens.ts`.
- `skins` — per-skin semantic maps; skin 3 is the only one emitted today.
- `contrastPairs` — the declared WCAG matrix.

Generated custom properties are named `--pf-` + dotted-path-to-kebab. Motion lives at `:root`; skin semantics live under `[data-scheme][data-skin]`.

## Rules

- Add or change a value here first. Never add a color to component code.
- Regenerate and commit `dist/` with every `tokens.json` change; CI fails on stale output.
- Do not add a skin without adding its block and its contrast pairs.
- The web app imports the CSS via `@portfolio/tokens/theme.css`; literal consumers import `@portfolio/tokens/tokens.json` through `apps/web/src/lib/design-tokens.ts`.
