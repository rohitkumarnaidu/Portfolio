# Visual Experience System

> **Version:** 2.0 | **Status:** ✅ Active | **Owner:** Principal Design Lead

## 1. System Overview

Defines how visual depth, layers, shadows, blur, and motion create a cohesive spatial interface bridging immersive 3D with pragmatic 2D UI.

**Principles:** Kinetic Depth (R3F + Framer Motion for spatial feel), Intelligent Minimalism (UI recedes when not needed), Dark-First Elegance (dark mode primary, light secondary), Cohesion Over Novelty (every effect serves the brand).

## 2. Visual Layer System

| Layer          | z-index          | Contents                                     | Blur               | Portal      |
| -------------- | ---------------- | -------------------------------------------- | ------------------ | ----------- |
| 0 — Background | `z-0`            | Mesh gradients, dot grid, particles          | None               | No          |
| 1 — Content    | `z-10` to `z-30` | Cards, text, images, grids                   | None               | No          |
| 2 — Foreground | `z-40` to `z-50` | 3D objects, decorative overlays              | None               | No          |
| 3 — Sticky     | `z-50`           | Headers, bottom nav, FAB                     | `backdrop-blur-sm` | No          |
| 4 — Overlay    | `z-60` to `z-80` | Modals, tooltips, dropdowns, command palette | `backdrop-blur-md` | Yes         |
| 5 — Priority   | `z-90`           | Toasts, notifications, spinners              | None               | Yes         |
| 6 — Debug      | `z-100`          | Dev tools only (never in production)         | None               | Conditional |

**Rules:** Overlays (4+) render via React portal to `document.body`. One modal at a time. Tooltips auto-dismiss on scroll/resize. Layer 0–2 elements must not have `position: fixed` or `sticky`. Background layer uses `pointer-events: none`.

## 3. z-index Scale

All z-index values are CSS custom properties — never use raw integers:

| Token                  | Value | Used By                      |
| ---------------------- | ----- | ---------------------------- |
| `--z-base`             | 0     | Background canvas, particles |
| `--z-content`          | 10    | Cards, text, images          |
| `--z-content-elevated` | 20    | Hovered/focused cards        |
| `--z-sticky`           | 50    | Header, bottom nav, FAB      |
| `--z-dropdown`         | 60    | Dropdowns, select options    |
| `--z-tooltip`          | 70    | Tooltips, popovers           |
| `--z-modal-backdrop`   | 75    | Modal backdrop               |
| `--z-modal`            | 80    | Modals, slide-in panels      |
| `--z-toast`            | 90    | Notifications                |
| `--z-debug`            | 100   | Dev tools only               |

## 4. Shadow System

| Token        | Elevation | CSS Value                     | Usage               |
| ------------ | --------- | ----------------------------- | ------------------- |
| `shadow-xs`  | Content   | `0 1px 2px rgba(0,0,0,0.3)`   | Card separation     |
| `shadow-sm`  | Elevated  | `0 1px 3px rgba(0,0,0,0.4)`   | Card hover lift     |
| `shadow-md`  | Sticky    | `0 4px 6px rgba(0,0,0,0.4)`   | Bottom nav, header  |
| `shadow-lg`  | Dropdown  | `0 10px 15px rgba(0,0,0,0.4)` | Dropdowns, popovers |
| `shadow-xl`  | Modal     | `0 20px 25px rgba(0,0,0,0.5)` | Modals, panels      |
| `shadow-2xl` | Toast     | `0 25px 50px rgba(0,0,0,0.6)` | Notifications       |

**Accent glow:** `box-shadow: 0 0 20px rgba(59,130,246,0.3)` on hover/focus only — never permanent.

**Light mode:** Reduce shadow opacity by 50% (use `rgba(0,0,0,0.1)` through `rgba(0,0,0,0.3)`).

## 5. Blur & Glassmorphism

| Token       | blur() | Usage                                     |
| ----------- | ------ | ----------------------------------------- |
| `blur-sm`   | 4px    | Sticky headers — subtle frosted glass     |
| `blur-md`   | 12px   | Modal backdrops — content distinguishable |
| `blur-lg`   | 24px   | Command palette — heavy blur, abstracted  |
| `blur-none` | 0px    | Default                                   |

**Recipes:**

- Glass header: `bg-[#121217]/80 backdrop-blur-sm border-b border-white/10`
- Modal overlay: `bg-black/70 backdrop-blur-md`

**Constraints:** Max 3 active `backdrop-filter` elements. Disable on low-end mobile (Tier 3 GPU). Never apply to animated/scrolling containers. Always include `-webkit-backdrop-filter` for Safari.

## 6. Motion Hierarchy

| Tier               | Duration  | Easing / Spring | Examples                              |
| ------------------ | --------- | --------------- | ------------------------------------- |
| Micro-interactions | 100–200ms | `ease-out`      | Button hover, toggle, icon rotation   |
| Transitions        | 200–400ms | Spring (300/25) | Card hover lift, dropdown, modal fade |
| Page-level         | 400–800ms | Spring (200/20) | Route transitions, hero entrance      |

**Staggered entrances:** `staggerChildren: 0.08`, `delayChildren: 0.1`. Total stagger ≤ 800ms. Each child: `opacity: 0, y: 20` → `opacity: 1, y: 0` at 400ms easeOut.

**Animation rule:** Never animate `width`, `height`, `top`, `left` — animate `transform` and `opacity` only.

**Page transitions:** Exit (fade + scale 0.95, 200ms easeIn) → Enter (fade + scale 0.95→1, 400ms easeOut). Via Framer Motion `AnimatePresence`.

## 7. Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

| Feature             | Normal               | Reduced Motion    |
| ------------------- | -------------------- | ----------------- |
| Page transitions    | Fade + scale         | Instant swap      |
| Staggered entrances | 80ms delay each      | All simultaneous  |
| 3D scene rotation   | Auto-rotate          | Static camera     |
| Card hover          | Lift + scale(1.02)   | Color change only |
| Parallax            | Scroll-driven offset | Static position   |
| Particles           | Animated float       | Static/hidden     |
| Lenis scroll        | Inertia              | Native scroll     |

**Reduced motion = fully static.** No half-measures.

## 8. Visual Hierarchy Audit

- [ ] Layers consistent — no z-index overlaps
- [ ] Shadows match elevation layer
- [ ] Blur only on overlay elements
- [ ] Motion tier matches interaction importance
- [ ] Staggered delays total ≤ 800ms
- [ ] Reduced motion = fully static (no half-measures)
- [ ] No conflicting z-index stacking contexts from `transform`/`opacity`
- [ ] Max 3 active `backdrop-filter` elements
- [ ] Animations use `transform` and `opacity` only — no layout-triggering properties
- [ ] Light mode shadows adjusted (50% opacity reduction)

---

## Cross-References

| Reference | Description |
|-----------|-------------|
| [MASTER-INDEX.md](../MASTER-INDEX.md) | Documentation master index |
| [CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) | Cross-reference mapping |
| [FRONTEND-ARCHITECTURE.md](FRONTEND-ARCHITECTURE.md) | Frontend architecture overview |
| [3D-ARCHITECTURE.md](3D-ARCHITECTURE.md) | 3D architecture implementation |
| [MOTION-SYSTEM.md](MOTION-SYSTEM.md) | Motion system reference |
| [NEUMORPHISM.md](NEUMORPHISM.md) | Neumorphism design language |
| [VisualExperienceSystem.md](../04-design/VISUAL-EXPERIENCE-SYSTEM.md) | Visual experience system (design category) |
