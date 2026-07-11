# Responsive Strategy

> **Version:** 2.0 | **Status:** ✅ Active | **Grid:** Tailwind 12-column fluid | **Owner:** UX Lead

## 1. Breakpoint System

| Breakpoint | Width   | Device        | What Changes                                   |
| ---------- | ------- | ------------- | ---------------------------------------------- |
| `xs`       | 0–639px | Phone         | Single-column, bottom nav, no 3D               |
| `sm`       | 640px+  | Large phone   | Larger type, increased padding                 |
| `md`       | 768px+  | Tablet        | 2-column grids, hamburger menu, reduced 3D     |
| `lg`       | 1024px+ | Laptop        | Sidebar docks, 3D hero activates, multi-column |
| `xl`       | 1280px+ | Desktop       | Full expanded layout, sticky sidebars          |
| `2xl`      | 1536px+ | Large monitor | Content capped at 1440px, centered             |

**Principle:** Each breakpoint re-structures layout (column count, navigation, component arrangement) — not just spacing.

## 2. Layout Grid

12-column fluid grid using Tailwind's `grid-cols-{n}` utilities.

| Property        | xs             | md             | xl             |
| --------------- | -------------- | -------------- | -------------- |
| Columns         | 1              | 2              | 3–4            |
| Gap             | 16px (`gap-4`) | 24px (`gap-6`) | 24px (`gap-6`) |
| H padding       | `px-4` (16px)  | `px-8` (32px)  | `px-16` (64px) |
| Section spacing | `py-12`        | `py-16`        | `py-24`        |
| Max width       | Full bleed     | 1280px         | 1440px         |

### Columns by Page

| Section       | xs     | md        | lg          | xl           |
| ------------- | ------ | --------- | ----------- | ------------ |
| Projects      | 1      | 2         | 3           | 4            |
| Blog          | 1      | 2         | 2           | 3            |
| Features      | 1      | 2         | 3           | 3            |
| Admin sidebar | Hidden | Hamburger | Docked 64px | Docked 240px |

## 3. Fluid Typography

CSS `clamp()` eliminates mid-breakpoint type jumps:

| Token      | clamp()                            | Mobile (375px) | Desktop (1440px) |
| ---------- | ---------------------------------- | -------------- | ---------------- |
| Display XL | `clamp(2.5rem, 6vw, 6rem)`         | 40px           | 96px             |
| H1         | `clamp(1.75rem, 4vw, 3.5rem)`      | 28px           | 56px             |
| H2         | `clamp(1.5rem, 3vw, 2.25rem)`      | 24px           | 36px             |
| H3         | `clamp(1.25rem, 2vw, 1.75rem)`     | 20px           | 28px             |
| H4         | `clamp(1.125rem, 1.5vw, 1.375rem)` | 18px           | 22px             |
| Body       | `clamp(0.938rem, 1vw, 1rem)`       | 15px           | 16px             |
| Small      | `0.875rem`                         | 14px           | 14px             |
| Caption    | `0.75rem`                          | 12px           | 12px             |

**Line height:** Body paragraphs 1.5 (1.4 on mobile), headings 1.1–1.2, display 0.95.

## 4. Responsive Images

All images use `next/image` with auto-generated `srcSet`:

```tsx
sizes = '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw';
```

**Art direction:** `<picture>` element for different crops per viewport (hero-mobile.webp vs hero-desktop.webp).

**Quality presets:** Hero 85 WebP, project cards 80 WebP, blog thumbs 75 WebP, avatar 90 WebP, OG cards 95 JPEG.

## 5. Component-Level Responsive Patterns

| Component    | Mobile (< 768px)           | Desktop (≥ 1024px)           |
| ------------ | -------------------------- | ---------------------------- |
| Project Card | Stacked (image above text) | Side-by-side                 |
| Feature Grid | Single column, centered    | Multi-column (`grid-cols-3`) |
| Navigation   | Bottom bar + hamburger     | Docked sidebar               |
| Hero         | 60vh, no 3D, simple text   | Full height with 3D          |
| CTA          | Full-width, stacked        | Inline with text             |
| Blog Post    | Full-width                 | Max 768px reading area       |
| Admin Table  | Horizontal scroll          | Full table, sticky header    |
| AI Chat      | Full-screen bottom sheet   | Floating panel (300×500px)   |
| Modals       | 95% width                  | Centered, max-width          |

**Stack → side pattern:** `flex flex-col md:flex-row md:items-center gap-4 md:gap-8`.

## 6. Hide/Show Strategies

| Element      | Mobile            | Tablet                      | Desktop            |
| ------------ | ----------------- | --------------------------- | ------------------ |
| Bottom nav   | `flex`            | `flex`                      | `lg:hidden`        |
| Sidebar      | `hidden`          | `hidden`                    | `hidden lg:flex`   |
| 3D hero      | `hidden`          | `hidden md:block` (reduced) | `block`            |
| Table scroll | `overflow-x-auto` | `overflow-x-auto`           | `overflow-visible` |
| Hamburger    | `flex`            | `flex`                      | `lg:hidden`        |

Desktop hover effects are no-op on touch devices (browsers handle `:hover` natively on touch).

## 7. Responsive Data Tables

- **≥ 1024px:** Full HTML table with sticky `<thead>`, column sorting
- **768–1023px:** Horizontal scroll container, frozen first column
- **< 768px:** Card layout — each row becomes a labeled card with dt/dd pattern

## 8. Testing (Playwright)

Every PR tested at 3 viewports:
| Viewport | Width | Key Checks |
|----------|-------|------------|
| Mobile | 375px (iPhone 14 Pro Max) | Touch targets ≥ 44px, single column, no overflow, bottom nav |
| Tablet | 834px (iPad Pro 11") | 2-column grids, hamburger menu, scroll tables |
| Desktop | 1440px (MacBook Pro 16") | Full nav, 3D loaded, multi-column, sidebar |

**Checks:** No horizontal overflow, text doesn't overflow containers, images not pixelated, 3D degrades gracefully on mobile, forms single-column. Run from `apps/web` via `npm run test:e2e`.
