# Iconography System

> **Version:** 2.0 | **Status:** Ã¢Å“â€¦ Active | **Library:** lucide-react v1.24 | **Stroke:** 1.5px

## 1. Overview

Single icon library: **Lucide React v1.24**. No second library permitted. Custom SVG icons only when Lucide lacks a glyph. This ensures consistent rendering, eliminates bundle duplication, and reduces design decisions. Total icon weight must stay < 15KB gzipped (lucide-react is fully tree-shakeable via named ESM exports).

## 2. Icon Style

| Property   | Spec                 | Rationale                              |
| ---------- | -------------------- | -------------------------------------- |
| Style      | Outline (line-based) | Matches minimal technical brand        |
| Grid       | 24Ãƒâ€”24px              | Industry standard                      |
| Stroke     | 1.5px (default)      | Refined, thinner than 2px default      |
| Caps/Joins | Round                | Matches Inter's rounded terminals      |
| Fill       | None                 | Solid fills only for active nav states |

**Design principle:** Icons reinforce meaning, never replace it. Must be legible at 16px.

## 3. Sizing Scale

| Token     | Size    | Usage                                        |
| --------- | ------- | -------------------------------------------- |
| `icon-xs` | 16Ãƒâ€”16px | Badges, tooltips, table cells                |
| `icon-sm` | 20Ãƒâ€”20px | Dropdown items, chevrons, breadcrumbs        |
| `icon-md` | 24Ãƒâ€”24px | **Default** Ã¢â‚¬â€ buttons, nav, forms            |
| `icon-lg` | 32Ãƒâ€”32px | Section headers, feature cards, empty states |
| `icon-xl` | 48Ãƒâ€”48px | Hero sections, large CTAs, 404/500 pages     |

**Stroke by size:** 16px Ã¢â€ â€™ 1.5px, 20px Ã¢â€ â€™ 1.5px, 24px Ã¢â€ â€™ 1.5px, 32px Ã¢â€ â€™ 2px, 48px Ã¢â€ â€™ 2.5px.

## 4. Color Usage

| Context             | Token                       | Example                                |
| ------------------- | --------------------------- | -------------------------------------- |
| Default / Inactive  | `text-secondary`            | Muted gray Ã¢â‚¬â€ most icons                |
| Hover (interactive) | `text-primary`              | White on dark                          |
| Active / Selected   | `accent-primary`            | Blue Ã¢â‚¬â€ nav tabs, filters               |
| Danger              | `status-error`              | Delete, destructive actions            |
| Success             | `status-success`            | Checks, confirmation toasts            |
| Warning             | `status-warning`            | Caution alerts                         |
| AI Actions          | `status-ai`                 | Violet Ã¢â‚¬â€ AI assistant, neural features |
| Disabled            | `text-secondary opacity-50` | Non-interactive                        |

Interactive icons get a hover glow: `filter: drop-shadow(0 0 6px var(--color-accent-glow))`. Never on decorative icons.

## 5. Accessibility

**Decorative** (icon + adjacent text label): `aria-hidden="true"`, no `role`.  
**Informative** (standalone icon): `aria-label` + `role="img"`.

```tsx
// Decorative
<button><Settings aria-hidden="true" /> <span>Settings</span></button>
// Informative
<button aria-label="Delete project"><Trash2 role="img" className="text-status-error" /></button>
```

**Focus:** Interactive icon wrappers need `outline: 2px solid accent-primary; outline-offset: 2px` on `:focus-visible`.  
**Touch:** Standalone icon buttons must be Ã¢â€°Â¥ 44Ãƒâ€”44px hit area via padding.  
**Animation:** No continuous animation on icons. Animated icons respect `prefers-reduced-motion: reduce`.

## 6. Custom Icons

Create custom icons only when: Lucide lacks the glyph, unique product feature (neural net, AI chat), or brand-specific symbol. Always verify Lucide catalog first Ã¢â‚¬â€ search synonyms before building custom.

| Property  | Requirement                                                           |
| --------- | --------------------------------------------------------------------- |
| Grid      | 24Ãƒâ€”24px, 1px padding (live 22Ãƒâ€”22px)                                   |
| Stroke    | 1.5px, round caps and joins                                           |
| Export    | SVGO-optimized SVG                                                    |
| Component | React with `size`, `color`, `className` props, typed as `LucideProps` |

### Custom Icon Inventory

| Icon          | File                                | Used In                    |
| ------------- | ----------------------------------- | -------------------------- |
| `NeuralNode`  | `components/icons/neural-node.tsx`  | Hero, AI badge             |
| `DataFlow`    | `components/icons/data-flow.tsx`    | Project cards              |
| `CubeGrid`    | `components/icons/cube-grid.tsx`    | Loading states, 3D headers |
| `AIAssistant` | `components/icons/ai-assistant.tsx` | Chat FAB, AI header        |

## 7. Icon Audit Checklist

- [ ] Icon from `lucide-react` (no second icon library)
- [ ] Size matches scale token (xs through xl)
- [ ] Color inherits from text unless semantic override needed
- [ ] `aria-hidden="true"` if decorative; `aria-label` if informative standalone
- [ ] Touch target Ã¢â€°Â¥ 44Ãƒâ€”44px for standalone icon buttons (Playwright check)
- [ ] Custom icons verified Ã¢â‚¬â€ no duplicate of existing Lucide icon
- [ ] `focus-visible` ring on all interactive icon wrappers
- [ ] No continuous animation on icons

## 8. Commonly Used Icons

| Context       | Icon                | Size | Color            |
| ------------- | ------------------- | ---- | ---------------- |
| Theme toggle  | `Sun` / `Moon`      | 20px | `text-primary`   |
| Mobile menu   | `Menu`              | 24px | `text-primary`   |
| AI FAB        | `MessageSquareMore` | 24px | `status-ai`      |
| External link | `ExternalLink`      | 16px | `accent-primary` |
| GitHub        | `Github`            | 24px | `text-secondary` |
| Search        | `Search`            | 20px | `text-secondary` |
| Close         | `X`                 | 20px | `text-primary`   |
| Expand        | `ChevronDown`       | 20px | `text-secondary` |
| Filters       | `SlidersHorizontal` | 20px | `text-secondary` |
| Copy          | `Copy`              | 16px | `text-secondary` |
| Loading       | `Loader2`           | 24px | `accent-primary` |

## 10. Icon Sizing Decision Tree

```mermaid
flowchart LR
    A[Icon Context] --> B{Where is it used?}
    B -- Badge/Tooltip --> C[xs - 16px]
    B -- Dropdown/Breadcrumb --> D[sm - 20px]
    B -- Button/Nav --> E[md - 24px]
    B -- Section Header --> F[lg - 32px]
    B -- Hero/CTA --> G[xl - 48px]
    C --> H{Style}
    D --> H
    E --> H
    F --> H
    G --> H
    H -- Outline --> I[Stroke: 1.5-2.5px]
    H -- Fill --> J[Active state only]
    I --> K{Color}
    J --> K
    K -- Default --> L[text-secondary]
    K -- Active --> M[accent-primary]
    K -- Danger --> N[status-error]
```

## 9. Icon Usage Patterns

| Pattern          | Approach                                        |
| ---------------- | ----------------------------------------------- |
| Button with icon | Icon left of text, 8px gap                      |
| Icon-only button | Informative Ã¢â‚¬â€ `aria-label` required, Ã¢â€°Â¥ 44Ãƒâ€”44px  |
| Navigation item  | Icon + text (decorative) or icon-only collapsed |
| Alert / Toast    | Leading icon with semantic color                |
| Empty state      | Large icon (lg/xl) centered above text          |
| Input leading    | Prefix icon absolute-positioned inside input    |

## Cross-References
- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system