# Mobile Experience Strategy

> **Version:** 2.0 | **Status:** ✅ Active | **Framework:** Tailwind CSS (mobile-first)

## 1. Mobile-First Approach
All UI designed mobile-first using Tailwind breakpoints. Functionality must be flawless on small viewports (320–639px) before scaling up. Desktop is an enhancement layer, not the primary target.

## 2. Breakpoint Strategy
| Range | Width | Device |
|-------|-------|--------|
| `xs` (default) | 0–639px | Phones — all features must work |
| `sm` | 640px+ | Large phones — minor layout improvements |
| `md` | 768px+ | Tablets — 2-column grids |
| `lg` | 1024px+ | Laptops — sidebar docks, 3D enabled |
| `xl` | 1280px+ | Desktops — full layout |
| `2xl` | 1536px+ | Large monitors — max-width containers |

## 3. Navigation
- **Mobile < 768px:** Fixed bottom bar (5 tabs: Home, Projects, Blog, About, Contact). Active tab = accent-primary + filled icon. Respects `safe-area-inset-bottom`. Hides on scroll down, shows on scroll up.
- **Tablet < 1024px:** Hamburger menu sliding from right with `backdrop-blur-md`. Body scroll locked when open.
- **Desktop ≥ 1024px:** Docked sidebar, collapsible to 64px icon-only mode (preference persisted to localStorage).

## 4. Touch Interaction
**Minimum targets:** Primary buttons 48×48px, icon-only 44×44px, nav items 48×44px, form controls 48px height.

**Gestures:** Swipe left (dismiss notification via Framer Motion `drag="x"`), tap (standard), pinch-to-zoom (image lightbox via `@use-gesture/react`), pull-to-refresh (blog listing).

**Scroll:** Lenis smooth scroll on desktop only (`smoothTouch: false`). Native browser scroll on mobile.

## 5. 3D Performance on Mobile
**Adaptive quality via `useDetectGPU()`:**
| Tier | DPR | Shadows | Post-processing | Polygon Budget |
|------|-----|---------|-----------------|----------------|
| High | [1, 2] | 2048 map | Bloom, DOF, AA | 100k tris |
| Mid | [1, 1.5] | Disabled | Optional bloom | 30k tris |
| Low | [1, 1] | Disabled | Disabled | 15k tris |
| No WebGL | N/A | N/A | CSS fallback | N/A |

```tsx
const { tier } = useDetectGPU();
const dpr = tier === "low" ? [1, 1] : tier === "mid" ? [1, 1.5] : [1, 2];
```

## 6. Form Inputs
| Input | `inputmode` | `autocomplete` |
|-------|-------------|----------------|
| Email | `email` | `email` |
| URL | `url` | `url` |
| Phone | `tel` | `tel` |
| Search | `search` | `off` |
| OTP | `numeric` | `one-time-code` |
| Number | `numeric` | `off` |

All forms stack single-column on mobile. Labels top-aligned (not placeholder-only). Submit button full-width.

## 7. Performance Budgets
| Metric | Target |
|--------|--------|
| Initial JS (mobile) | ≤ 200KB |
| Initial CSS | ≤ 150KB |
| LCP | ≤ 2.5s |
| FID | ≤ 100ms |
| TTI | ≤ 3.5s |
| Hero image payload | ≤ 100KB |
| Total page weight | ≤ 1MB |
| 3D scene load (lazy) | ≤ 500KB |

PRs exceeding budgets fail CI. Budgets in `apps/web/lighthouse-budgets.json`.

## 8. Offline
- Service worker (Workbox) caches static assets Cache First
- 3D scenes: Network First, 3s timeout → static image
- AI chat: optimistic UI + "Offline" indicator
- Form data saved to localStorage on blur for recovery
