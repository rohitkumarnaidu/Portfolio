# Visual Experience System

> **Version:** 2.0 | **Status:** ✅ Active | **Owner:** Principal Design Lead

## 1. System Overview
Defines how visual depth, layers, shadows, blur, and motion create a cohesive spatial interface. Bridges immersive 3D elements with pragmatic 2D UI.

**Principles:** Kinetic Depth (R3F + Framer Motion for spatial feel), Intelligent Minimalism (UI recedes when not needed), Dark-First Elegance (dark mode designed primarily, light as secondary).

## 2. Visual Layer System
| Layer | z-index | Contents | Blur |
|-------|---------|----------|------|
| 0 — Background | `z-0` | Mesh gradients, dot grid, particles | None |
| 1 — Content | `z-10` to `z-30` | Cards, text, images, grids, nav | None |
| 2 — Foreground | `z-40` to `z-50` | 3D objects, interactive decorations | None |
| 3 — Sticky | `z-50` | Sticky headers, bottom nav | Optional `backdrop-blur` |
| 4 — Overlay | `z-60` to `z-80` | Modals, tooltips, dropdowns, command palette | `backdrop-blur-md` |
| 5 — Priority | `z-90` | Toasts, notifications, spinners | None |
| 6 — Debug | `z-100` | Dev tools (never in production) | None |

**Rules:** Overlays render via React portal. One modal at a time. Tooltips auto-dismiss on scroll.

## 3. z-index Scale
| Token | Value | Used By |
|-------|-------|---------|
| `z-base` | 0 | Background, canvas |
| `z-content` | 10 | Cards, text, images |
| `z-content-elevated` | 20 | Hovered cards |
| `z-sticky` | 50 | Header, bottom nav |
| `z-dropdown` | 60 | Dropdowns, select options |
| `z-tooltip` | 70 | Tooltips, popovers |
| `z-modal-backdrop` | 75 | Modal backdrop |
| `z-modal` | 80 | Modals, panels |
| `z-toast` | 90 | Notifications |
| `z-debug` | 100 | Dev tools only |

**Rule:** Never use raw z-index values. Always use defined tokens.

## 4. Shadow System
| Token | Elevation | CSS Value | Usage |
|-------|-----------|-----------|-------|
| `shadow-xs` | Content | `0 1px 2px rgba(0,0,0,0.3)` | Card separation |
| `shadow-sm` | Elevated | `0 1px 3px rgba(0,0,0,0.4)` | Card hover |
| `shadow-md` | Sticky | `0 4px 6px rgba(0,0,0,0.4)` | Bottom nav, header |
| `shadow-lg` | Dropdown | `0 10px 15px rgba(0,0,0,0.4)` | Dropdowns, popovers |
| `shadow-xl` | Modal | `0 20px 25px rgba(0,0,0,0.5)` | Modals, panels |
| `shadow-2xl` | Toast | `0 25px 50px rgba(0,0,0,0.6)` | Toasts |

**Accent glow** on interactive elements: `box-shadow: 0 0 20px rgba(59,130,246,0.3)`.

## 5. Blur & Glassmorphism
| Token | Blur | Usage |
|-------|------|-------|
| `blur-sm` | 4px | Sticky headers |
| `blur-md` | 12px | Modal backdrops, panels |
| `blur-lg` | 24px | Command palette |
| `blur-none` | 0px | Default all surfaces |

**Glass header recipe:** `bg-[#121217]/80 backdrop-blur-md border-b border-white/10`.  
**Modal overlay:** `bg-black/70 backdrop-blur-sm`.  
**Limit:** ≤ 3 active `backdrop-filter` elements at any time. Disable on low-end mobile.

## 6. Motion Hierarchy
| Tier | Duration | Easing | Examples |
|------|----------|--------|----------|
| Micro-interactions | 100–200ms | `ease-out` | Button hover, toggle, icon rotation |
| Transitions | 200–400ms | Spring (300/25) | Card hover lift, dropdown, modal fade |
| Page-level | 400–800ms | Spring (200/20) | Route transitions, hero entrance |

**Staggered entrances:** `staggerChildren: 0.08` with `opacity: 0, y: 20` → `opacity: 1, y: 0` (400ms easeOut).  
**Page transitions:** Exit (fade + scale down, 200ms) → Enter (fade + scale up, 400ms).

## 7. Reduced Motion
```tsx
const shouldReduceMotion = useReducedMotion();
// When true: 0ms transitions, no parallax, no auto-rotation, no particles, native scroll
```

CSS fallback:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Changes:** Instant page swaps (no animation), all elements enter simultaneously, static camera (no 3D rotation), no hover scales, Lenis disabled.

## 8. Visual Hierarchy Audit
- [ ] Layers used consistently (no z-index overlaps)
- [ ] Shadows match elevation layer
- [ ] Blur only on overlay elements
- [ ] Motion tier matches interaction importance
- [ ] Staggered delays ≤ 800ms total
- [ ] Reduced motion = fully static (no half-measures)
- [ ] No conflicting z-index stacking contexts
- [ ] ≤ 3 active backdrop-filter elements
- [ ] Animations don't block interaction
