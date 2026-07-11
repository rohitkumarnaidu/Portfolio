# Brand Guidelines

> **Version:** 2.0 | **Status:** ✅ Active | **Owner:** Principal Design Lead

## 1. Brand Identity
**Mission:** Showcase engineering excellence, design sensibility, and AI integration in a seamless digital experience.  
**Vision:** Transform a personal portfolio from static resume into an interactive, intelligent product.  
**Brand Essence:** "Modern craftsmanship meets technical precision."

## 2. Logo & Wordmark
**Versions:** Primary Wordmark (Clash Display uppercase, medium weight), Symbol Mark (abstract geometric node/cube), Combination Mark (symbol + wordmark stacked).

**Clear Space:** Minimum padding equal to the height of the wordmark on all sides.  
**Minimum Size:** 32px (favicon), 120px (digital), 1 inch (print).

**Don'ts:** Never recolor (no gradients/patterns), distort, rotate, add effects (bevels/glows/3D), rearrange symbol/wordmark positions, or place on low-contrast/busy backgrounds.

**File Formats:** SVG (primary digital), PNG @2x (social), ICO (favicon 16×16, 32×32), WebP (performance). All in `public/brand/`.

## 3. Color Palette
| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `bg-base` | `#0a0a0c` | `#fafafa` | Main canvas |
| `bg-surface` | `#121217` | `#f5f5f5` | Cards, panels |
| `bg-elevated` | `#1c1c22` | `#e5e5e5` | Flyouts, modals |
| `text-primary` | `#f3f4f6` | `#1a1a1a` | High-emphasis text |
| `text-secondary` | `#9ca3af` | `#525252` | Metadata |

**Accents:** `accent-primary` `#3b82f6` (actions/links), `accent-hover` `#2563eb`, `accent-glow` `rgba(59,130,246,0.5)`, `accent-secondary` `#8b5cf6`.

**Semantic:** `status-success` `#10b981`, `status-warning` `#f59e0b`, `status-error` `#ef4444`, `status-info` `#3b82f6`, `status-ai` `#8b5cf6` (violet reserved for AI).

## 4. Typography
| Role | Font | Fallback | Weights |
|------|------|----------|---------|
| Display | Clash Display | sans-serif | 400–700 |
| Body/UI | Inter | sans-serif | 300–700 |
| Code | JetBrains Mono | monospace | 400–600 |

**Scale:** Display XL `clamp(3rem, 6vw, 6rem)` / H1 `clamp(2rem, 4vw, 3.5rem)` / H2 `clamp(1.5rem, 3vw, 2.25rem)` / H3 `clamp(1.25rem, 2vw, 1.75rem)` / Body `1rem` / Small `0.875rem` / Caption `0.75rem` / Code `0.875rem`.

## 5. Tone of Voice
**Authoritative yet Approachable** — confident but accessible. **Precise** — exact technical terms, no fluff. **Forward-Looking** — momentum and innovation. **Concise** — bullet points over prose. **AI Persona** — helpful assistant, clearly demarcated from human.

**Do:** "Built with Next.js 14 and NestJS" / "Reduced query latency by 40%" / Use precise metrics.  
**Don't:** "Powered by cutting-edge technology" / "full-stack ninja" / "revolutionary AI brain" / Vague superlatives.

## 6. Imagery & Aesthetic
- **Abstract Data:** Generative art, node-graphs, data visualizations over stock photography
- **Code as Art:** Code snippets as blurred background graphics
- **Dark & Cinematic:** Deep shadows, neon accents, sharp contrasts
- **3D Renders:** React Three Fiber (interactive), Spline (static hero)
- **Gradients:** Mesh gradients with Gaussian blur preferred over flat fields
- **Photography:** Project case studies only (screenshots, mockups). No stock photos

## 7. Brand Assets Location
| Asset | Path |
|-------|------|
| Logo files | `public/brand/` |
| Social/OG images | `public/brand/social/` |
| Design tokens | `docs/design/DesignTokens.md` |
| UI components | `packages/ui/` |
| 3D scenes | `public/models/` |

## 8. Do/Don't Summary
| Aspect | Correct | Incorrect |
|--------|---------|-----------|
| Logo background | Dark solid, 4.5:1 contrast | Busy pattern, photograph |
| Accent usage | Actions, links, focus | Body text, backgrounds |
| Typography | Inter/Clash Display/JetBrains Mono | >3 families, display for body |
| Tone | Technical, precise, confident | Slang, self-deprecation, fluff |
| Imagery | Generative art, 3D renders | Stock photos, clip art, memes |
