# Iconography System

> **Version:** 2.0 | **Status:** ✅ Active | **Library:** lucide-react v1.24 | **Stroke:** 1.5px

## 1. Overview
Single icon library: **Lucide React v1.24**. No second library permitted. Custom SVG icons only when Lucide lacks the glyph. This ensures consistent rendering, eliminates bundle duplication, and reduces design decisions.

## 2. Icon Style
| Property | Spec | Rationale |
|----------|------|-----------|
| Style | Outline (line-based) | Matches minimal technical brand |
| Grid | 24×24px | Industry standard |
| Stroke | 1.5px (default) | Refined, slightly thinner than 2px default |
| Caps/Joins | Round | Softens UI, matches Inter terminals |
| Fill | None | Solid fills only for active nav states |

## 3. Sizing Scale
| Token | Size | Usage |
|-------|------|-------|
| `icon-xs` | 16×16px | Badges, tooltips, table cells |
| `icon-sm` | 20×20px | Dropdown items, chevrons, breadcrumbs |
| `icon-md` | 24×24px | Default — buttons, nav, forms |
| `icon-lg` | 32×32px | Section headers, feature cards, empty states |
| `icon-xl` | 48×48px | Hero sections, large CTAs |

**Stroke by size:** 16px → 1.5px, 24px → 1.5px, 32px → 2px, 48px → 2.5px.

## 4. Color Usage
| Context | Token | Example |
|---------|-------|---------|
| Default / Inactive | `text-secondary` | Muted gray |
| Hover (interactive) | `text-primary` | White |
| Active / Selected | `accent-primary` | Blue tabs, nav |
| Danger | `status-error` | Delete buttons |
| Success | `status-success` | Checks, toasts |
| Warning | `status-warning` | Caution alerts |
| AI Actions | `status-ai` | Violet for AI features |
| Disabled | `text-secondary opacity-50` | Non-interactive |

Interactive icons get a subtle glow on hover: `filter: drop-shadow(0 0 6px var(--color-accent-glow))`.

## 5. Accessibility
**Decorative** (icon + adjacent text label): `aria-hidden="true"`.  
**Informative** (standalone icon): `aria-label` + `role="img"`.

```tsx
// Decorative
<button><Settings aria-hidden="true" /> Settings</button>
// Informative
<button aria-label="Delete"><Trash2 role="img" className="text-status-error" /></button>
```

**Focus:** Interactive icon wrappers must show `outline: 2px solid accent-primary; outline-offset: 2px`.  
**Touch targets:** Standalone icon buttons ≥ 44×44px via padding.

## 6. Custom Icons
**When:** Lucide lacks the glyph, unique product feature (AI Chat, Neural Network), 3D interaction icons not in Lucide.

**Workflow:** Verify Lucide → Design 24×24px grid, 1px padding → 1.5px stroke, round caps/joins → Export SVG → SVGO optimize → Create React component with `size`, `color`, `className` props.

**Inventory:**
| Icon | File | Used In |
|------|------|---------|
| `NeuralNode` | `components/icons/neural-node.tsx` | Hero, AI badge |
| `DataFlow` | `components/icons/data-flow.tsx` | Project cards |
| `CubeGrid` | `components/icons/cube-grid.tsx` | Loading states |
| `AIAssistant` | `components/icons/ai-assistant.tsx` | Chat FAB |

## 7. Audit Checklist
- [ ] Icon from lucide-react (no second library)
- [ ] Size matches scale token (xs/sm/md/lg/xl)
- [ ] Color inherits from text unless semantic override needed
- [ ] `aria-hidden="true"` if decorative; `aria-label` if standalone informative
- [ ] Touch target ≥ 44×44px for standalone icon buttons
- [ ] Custom icons don't duplicate existing Lucide icons
- [ ] Focus-visible ring on interactive wrappers

## 8. Commonly Used Icons
| Context | Icon | Size | Color |
|---------|------|------|-------|
| Theme toggle | `Sun`/`Moon` | 20px | `text-primary` |
| Mobile menu | `Menu` | 24px | `text-primary` |
| AI FAB | `MessageSquareMore` | 24px | `status-ai` |
| External link | `ExternalLink` | 16px | `accent-primary` |
| GitHub | `Github` | 24px | `text-secondary` |
| Search | `Search` | 20px | `text-secondary` |
| Close | `X` | 20px | `text-primary` |
| Chevron | `ChevronDown` | 20px | `text-secondary` |
| Filter | `SlidersHorizontal` | 20px | `text-secondary` |
| Copy | `Copy` | 16px | `text-secondary` |
