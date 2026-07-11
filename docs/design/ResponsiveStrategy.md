# Responsive Strategy

> **Version:** 2.0 | **Status:** ✅ Active | **Grid:** Tailwind 12-column fluid | **Owner:** UX Lead

## 1. Breakpoint System
| Breakpoint | Width | Device | What Changes |
|------------|-------|--------|--------------|
| `xs` | 0px | Phone | Single-column, bottom nav, no 3D |
| `sm` | 640px | Large phone | Larger type, more padding |
| `md` | 768px | Tablet | 2-column grids, hamburger menu |
| `lg` | 1024px | Laptop | Sidebar docks, 3D hero activates |
| `xl` | 1280px | Desktop | Full layout, expanded whitespace |
| `2xl` | 1536px | Large monitor | Content capped at 1440px, centered |

## 2. Layout Grid
12-column fluid grid via Tailwind `grid-cols-{n}`. Gap 24px (`gap-6`). Max width 1440px. Horizontal padding: 16px mobile → 32px tablet → 64px desktop. Section vertical spacing: `py-12 md:py-24`.

**Columns by breakpoint:**
| Layout | xs | md | lg | xl |
|--------|----|----|----|----|
| Projects | 1 | 2 | 3 | 4 |
| Blog | 1 | 2 | 2 | 3 |
| Features | 1 | 2 | 3 | 3 |
| Admin sidebar | Hidden | Hamburger | Docked icon | Docked full |

## 3. Fluid Typography
CSS `clamp()` eliminates mid-breakpoint type jumps:

| Token | clamp() | Mobile | Desktop |
|-------|---------|--------|---------|
| Display XL | `clamp(2.5rem, 6vw, 6rem)` | 40px | 96px |
| H1 | `clamp(1.75rem, 4vw, 3.5rem)` | 28px | 56px |
| H2 | `clamp(1.5rem, 3vw, 2.25rem)` | 24px | 36px |
| H3 | `clamp(1.25rem, 2vw, 1.75rem)` | 20px | 28px |
| Body | `clamp(0.938rem, 1vw, 1rem)` | 15px | 16px |

Line height: paragraphs 1.5 (tightens to 1.4 on mobile), headings 1.1.

## 4. Responsive Images
All images use `next/image` with auto-generated srcSet:
```tsx
sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
```

**Art direction:** `<picture>` element for different crops per viewport (e.g., hero-mobile.webp vs hero-desktop.webp).

## 5. Component-Level Responsive Patterns
| Component | Mobile (< 768px) | Desktop (≥ 1024px) |
|-----------|-----------------|-------------------|
| Project Card | Stacked (image above text) | Side-by-side |
| Feature Grid | Single column, centered | Multi-column |
| Navigation | Bottom bar + hamburger | Top bar or docked sidebar |
| Hero | Reduced height, no 3D | Full screen with 3D |
| CTA | Full-width button | Inline with text |
| Blog Post | Full-width | Max-width 768px reading area |
| Admin Table | Horizontal scroll wrapper | Full table, sticky header |
| AI Chat | Full-screen bottom sheet | Floating draggable modal |

**Stack → Side pattern:** `flex flex-col md:flex-row md:items-center gap-4 md:gap-8`.

## 6. Hide/Show Strategies
| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Bottom nav | Visible | Visible | `lg:hidden` |
| Sidebar | Hidden | Hidden | `hidden lg:flex` |
| 3D hero | Hidden | Reduced | `hidden md:block` |
| Table scroll | `overflow-x-auto` | Conditional | Hidden |

Desktop hover effects are no-op on touch devices.

## 7. Responsive Data Tables
- **≥ 1024px:** Full table with sticky header
- **768–1023px:** Horizontal scroll, frozen first column
- **< 768px:** Card layout — each row becomes a labeled card

## 8. Testing (Playwright)
Every PR tested at 3 widths:
| Viewport | Width | Key Checks |
|----------|-------|------------|
| Mobile | 375px (iPhone 14 Pro Max) | Touch targets, single column, no overflow |
| Tablet | 834px (iPad Pro 11") | 2-column grids, hamburger menu |
| Desktop | 1440px (MacBook Pro 16") | Full nav, 3D, multi-column |

**Checks:** No horizontal overflow, ≥ 44px touch targets, text doesn't overflow containers, images not pixelated, navigation fully functional, 3D degrades gracefully, forms single-column.
