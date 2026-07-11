# Circadian Theme Engine — Time-of-Day Adaptive Design System

> **Document:** `features/Circadian-Theme-Engine.md` | **Version:** 1.0 | **Phase:** 4
> **Status:** 🏗️ In Design | **Owner:** System Architect
> **Core Concept:** A 4-theme × 2-mode (light/dark) adaptive theme system that mirrors the emotional arc of a day — from fresh dawn energy to deep nighttime creativity.

---

## 1. Executive Summary

The Circadian Theme Engine replaces the traditional binary "light/dark" toggle with a **time-of-day adaptive design system** that emotionally evolves through four distinct phases of the day. Each phase carries its own curated color palette, ambient animation layer, and micro-interaction personality. Every phase supports both a **Light** and **Dark** sub-mode, giving us **8 total visual identities**.

By default, the system **auto-switches based on the user's local time**, but users can manually lock any theme via the interactive Theme Switcher. The system uses CSS Custom Properties (`data-theme` + `data-mode`) for instant, zero-flicker switching with smooth `0.4s` cross-fade transitions.

---

## 2. The Four Themes — Emotional Design Philosophy

### 🌅 Theme 1: **Dawn** (5:00 AM – 9:00 AM)
> *"A new day. Everything feels fresh, optimistic, and full of possibility."*

| Attribute | Description |
|-----------|-------------|
| **Emotion** | Fresh, optimistic, energetic, hopeful |
| **Color Family** | Soft peach, warm gold, blush pink, pale sky blue |
| **Typography Feel** | Light font weights, generous letter-spacing — airy and open |
| **Interactive Personality** | Gentle spring animations, elements appear like they're "waking up" |
| **Ambient Background** | Soft golden light rays slowly drifting from the bottom-left, simulating the first light of day |

#### Dawn Light Mode
| Token | Value | Purpose |
|-------|-------|---------|
| `--surface-primary` | `#FFF8F0` | Warm cream base — like early morning light on paper |
| `--surface-secondary` | `#FFFFFF` | Clean card surfaces |
| `--surface-elevated` | `#FFF1E6` | Elevated panels with a peachy tint |
| `--accent-400` | `#F59E0B` | Amber gold — morning sun |
| `--accent-500` | `#EA580C` | Warm orange — sunrise glow |
| `--accent-600` | `#DC2626` | Deep coral — horizon line |
| `--accent-800` | `#9A3412` | Burnt sienna — grounding warmth |
| `--text-primary` | `#1C1917` | Warm black |
| `--text-secondary` | `#57534E` | Stone gray |
| `--text-link` | `#EA580C` | Warm orange link |
| `--border-primary` | `#FED7AA` | Peach border |
| `--gradient-hero` | `linear-gradient(135deg, #FBBF24, #F97316, #EF4444)` | Golden sunrise gradient |
| `--gradient-text-hero` | `linear-gradient(to right, #F59E0B, #EA580C)` | Gradient text (amber → orange) |

#### Dawn Dark Mode
| Token | Value | Purpose |
|-------|-------|---------|
| `--surface-primary` | `#0C0A09` | Warm dark stone |
| `--surface-secondary` | `#1C1917` | Deep espresso |
| `--surface-elevated` | `#292524` | Warm charcoal |
| `--accent-400` | `#FBBF24` | Bright gold glow |
| `--accent-500` | `#F97316` | Vivid orange |
| `--accent-600` | `#EA580C` | Deep orange |
| `--accent-800` | `#EF4444` | Red ember |
| `--text-primary` | `#FAFAF9` | Warm white |
| `--text-secondary` | `#A8A29E` | Stone gray |
| `--text-link` | `#FBBF24` | Bright gold link |
| `--border-primary` | `rgba(251, 191, 36, 0.15)` | Subtle golden border |
| `--gradient-hero` | `linear-gradient(135deg, #FBBF24, #F97316, #B91C1C)` | Dark sunrise |
| `--shadow-accent-hover` | `0 8px 30px rgba(251, 191, 36, 0.3)` | Golden glow on hover |

---

### ☀️ Theme 2: **Zenith** (9:00 AM – 3:00 PM)
> *"Peak energy. Full clarity. The world is bright, vivid, and buzzing with creative power."*

| Attribute | Description |
|-----------|-------------|
| **Emotion** | Energetic, vibrant, confident, creative |
| **Color Family** | Electric blue, vivid cyan, bright white, energetic violet |
| **Typography Feel** | Medium weights, tight tracking — crisp and confident |
| **Interactive Personality** | Snappy, elastic animations. Buttons and cards feel like they have real mass |
| **Ambient Background** | Subtle floating energy particles — tiny bright dots slowly drifting upward, like light motes in a sunbeam |

#### Zenith Light Mode
| Token | Value | Purpose |
|-------|-------|---------|
| `--surface-primary` | `#FAFAFA` | Bright, clean white |
| `--surface-secondary` | `#FFFFFF` | Pure card surfaces |
| `--surface-elevated` | `#F0F4FF` | Blue-tinted elevation |
| `--accent-400` | `#38BDF8` | Sky blue |
| `--accent-500` | `#3B82F6` | Royal blue — full clarity |
| `--accent-600` | `#2563EB` | Deep blue |
| `--accent-800` | `#7C3AED` | Violet accent |
| `--text-primary` | `#0F172A` | Slate black |
| `--text-secondary` | `#475569` | Slate gray |
| `--text-link` | `#2563EB` | Blue link |
| `--border-primary` | `#E2E8F0` | Cool gray border |
| `--gradient-hero` | `linear-gradient(135deg, #3B82F6, #8B5CF6, #06B6D4)` | Electric blue → violet |
| `--gradient-text-hero` | `linear-gradient(to right, #3B82F6, #8B5CF6)` | Blue → violet text |

#### Zenith Dark Mode
| Token | Value | Purpose |
|-------|-------|---------|
| `--surface-primary` | `#030712` | Deep space black |
| `--surface-secondary` | `#0F172A` | Midnight blue |
| `--surface-elevated` | `#1E293B` | Elevated slate |
| `--accent-400` | `#38BDF8` | Bright sky blue |
| `--accent-500` | `#3B82F6` | Electric blue |
| `--accent-600` | `#818CF8` | Indigo |
| `--accent-800` | `#A855F7` | Violet glow |
| `--text-primary` | `#F8FAFC` | Cool white |
| `--text-secondary` | `#94A3B8` | Slate gray |
| `--text-link` | `#38BDF8` | Bright blue link |
| `--border-primary` | `rgba(56, 189, 248, 0.12)` | Subtle blue border |
| `--gradient-hero` | `linear-gradient(135deg, #3B82F6, #A855F7, #06B6D4)` | Neon electric |
| `--shadow-accent-hover` | `0 8px 30px rgba(59, 130, 246, 0.35), 0 0 40px rgba(139, 92, 246, 0.15)` | Blue+violet glow |

---

### 🌇 Theme 3: **Golden** (3:00 PM – 7:00 PM)
> *"The golden hour. Everything slows down. Warm, pleasant, and deeply satisfying."*

| Attribute | Description |
|-----------|-------------|
| **Emotion** | Pleasant, warm, reflective, satisfying |
| **Color Family** | Deep coral, terracotta, sunset purple, warm rose |
| **Typography Feel** | Slightly heavier weights — grounded and contemplative |
| **Interactive Personality** | Slower, more deliberate spring physics. Hover effects linger. Transitions feel like a gentle exhale |
| **Ambient Background** | Warm gradient mesh slowly shifting through coral → purple → gold, like the sky at golden hour |

#### Golden Light Mode
| Token | Value | Purpose |
|-------|-------|---------|
| `--surface-primary` | `#FFFBF5` | Warm parchment |
| `--surface-secondary` | `#FFFFFF` | Clean cards |
| `--surface-elevated` | `#FFF0E5` | Apricot-tinted elevation |
| `--accent-400` | `#FB923C` | Soft orange |
| `--accent-500` | `#E11D48` | Rose red |
| `--accent-600` | `#BE185D` | Deep rose |
| `--accent-800` | `#7C2D12` | Burnt umber |
| `--text-primary` | `#1C1917` | Warm black |
| `--text-secondary` | `#78716C` | Warm gray |
| `--text-link` | `#E11D48` | Rose link |
| `--border-primary` | `#FECDD3` | Rose border |
| `--gradient-hero` | `linear-gradient(135deg, #F97316, #E11D48, #7C3AED)` | Sunset spectrum |
| `--gradient-text-hero` | `linear-gradient(to right, #F97316, #E11D48)` | Orange → rose |

#### Golden Dark Mode
| Token | Value | Purpose |
|-------|-------|---------|
| `--surface-primary` | `#0C0A09` | Deep warm black |
| `--surface-secondary` | `#1C1917` | Espresso |
| `--surface-elevated` | `#292524` | Warm charcoal |
| `--accent-400` | `#FB923C` | Soft orange glow |
| `--accent-500` | `#F43F5E` | Vivid rose |
| `--accent-600` | `#E11D48` | Deep rose |
| `--accent-800` | `#A855F7` | Twilight purple |
| `--text-primary` | `#FFF7ED` | Cream white |
| `--text-secondary` | `#A8A29E` | Stone gray |
| `--text-link` | `#FB923C` | Orange glow link |
| `--border-primary` | `rgba(244, 63, 94, 0.15)` | Rose glow border |
| `--gradient-hero` | `linear-gradient(135deg, #F97316, #F43F5E, #A855F7)` | Dark sunset |
| `--shadow-accent-hover` | `0 8px 30px rgba(244, 63, 94, 0.3), 0 0 40px rgba(168, 85, 247, 0.15)` | Rose+purple glow |

---

### 🌙 Theme 4: **Lunar** (7:00 PM – 5:00 AM)
> *"Deep night. The world is quiet. Focus is sharp. Creativity flows without distraction."*

| Attribute | Description |
|-----------|-------------|
| **Emotion** | Peaceful, creative, focused, intimate |
| **Color Family** | Deep indigo, cool cyan, moonlight silver, soft emerald |
| **Typography Feel** | Regular weights, slightly wider line-height — relaxed and readable |
| **Interactive Personality** | Very smooth, fluid transitions. Elements glide rather than bounce. Hover states emit soft glow |
| **Ambient Background** | Subtle twinkling particles (stars) with a faint, slowly pulsing aurora effect across the top |

#### Lunar Light Mode
| Token | Value | Purpose |
|-------|-------|---------|
| `--surface-primary` | `#F5F5F7` | Cool moonlit gray |
| `--surface-secondary` | `#FFFFFF` | Clean cards |
| `--surface-elevated` | `#EEF2FF` | Indigo-tinted elevation |
| `--accent-400` | `#A5B4FC` | Soft indigo |
| `--accent-500` | `#6366F1` | Deep indigo |
| `--accent-600` | `#4F46E5` | Rich indigo |
| `--accent-800` | `#10B981` | Emerald accent |
| `--text-primary` | `#1E1B4B` | Deep navy text |
| `--text-secondary` | `#6B7280` | Cool gray |
| `--text-link` | `#6366F1` | Indigo link |
| `--border-primary` | `#C7D2FE` | Lavender border |
| `--gradient-hero` | `linear-gradient(135deg, #6366F1, #06B6D4, #10B981)` | Night sky → emerald |
| `--gradient-text-hero` | `linear-gradient(to right, #6366F1, #06B6D4)` | Indigo → cyan |

#### Lunar Dark Mode
| Token | Value | Purpose |
|-------|-------|---------|
| `--surface-primary` | `#020617` | Deepest space |
| `--surface-secondary` | `#0F172A` | Midnight |
| `--surface-elevated` | `#1E293B` | Dark steel |
| `--accent-400` | `#818CF8` | Soft indigo glow |
| `--accent-500` | `#06B6D4` | Cyan moonlight |
| `--accent-600` | `#6366F1` | Deep indigo |
| `--accent-800` | `#10B981` | Emerald aurora |
| `--text-primary` | `#E2E8F0` | Silver white |
| `--text-secondary` | `#64748B` | Slate gray |
| `--text-link` | `#06B6D4` | Cyan glow link |
| `--border-primary` | `rgba(6, 182, 212, 0.12)` | Cyan glow border |
| `--gradient-hero` | `linear-gradient(135deg, #6366F1, #06B6D4, #10B981)` | Aurora gradient |
| `--shadow-accent-hover` | `0 8px 30px rgba(6, 182, 212, 0.3), 0 0 40px rgba(99, 102, 241, 0.2)` | Cyan+indigo glow |

---

## 3. Ambient Background Animations

Each theme has a unique, GPU-accelerated ambient background that makes the interface feel alive. All animations run via CSS on the `transform` and `opacity` properties ONLY (GPU-composited layers) — no layout thrashing, no jank.

| Theme | Effect | Tech | Performance |
|-------|--------|------|-------------|
| **Dawn** | Soft golden light rays drifting from bottom-left | CSS `radial-gradient` + `@keyframes` on `transform: translate()` | ✅ GPU-only, < 1% CPU |
| **Zenith** | Floating bright particles drifting upward | CSS `@keyframes` with 6-8 pseudo-elements animating `transform` + `opacity` | ✅ GPU-only, < 1% CPU |
| **Golden** | Warm gradient mesh slowly morphing | CSS `background-size` animation on multi-stop `radial-gradient` | ✅ GPU-only, < 1% CPU |
| **Lunar** | Twinkling stars + faint aurora pulse | CSS `@keyframes` on `opacity` for stars; `radial-gradient` shift for aurora | ✅ GPU-only, < 1% CPU |

> [!IMPORTANT]
> We are deliberately NOT using WebGL, Three.js, or `<canvas>` for the ambient effects. Pure CSS animations composited on the GPU are sufficient for subtle ambient effects, consume near-zero CPU, and don't conflict with the existing Three.js Hero scene on the homepage. The Three.js/GSAP stack is reserved for the interactive 3D hero section.

### Accessibility & Reduced Motion
- All ambient effects are disabled when `prefers-reduced-motion: reduce` is active (already handled in `globals.css`).
- A "Disable Animations" toggle will also be available in the theme switcher for manual control.

---

## 4. Auto-Switching Logic

The system detects the user's local time and automatically applies the matching theme:

```
Hour Range    → Theme
─────────────────────
05:00 – 08:59 → dawn
09:00 – 14:59 → zenith
15:00 – 18:59 → golden
19:00 – 04:59 → lunar
```

The auto-switch runs:
1. On initial page load (in the `<head>` script to prevent flash).
2. On a 15-minute interval (`setInterval`) to catch transitions while the user is browsing.
3. Can be overridden by the user via the Theme Switcher (stored in `localStorage` as `theme-locked: true`).

---

## 5. Theme Switcher Component

A Framer Motion powered interactive pill component rendered in the Navbar:

```
┌────────────────────────────────────────────────────┐
│  🌅 Dawn  │  ☀️ Zenith  │  🌇 Golden  │  🌙 Lunar  │
│  ═══════  │             │             │             │  ← animated highlight
├────────────────────────────────────────────────────┤
│                 ☀ Light  │  🌙 Dark                │  ← sub-mode toggle
└────────────────────────────────────────────────────┘
```

- Uses `layoutId` for the sliding highlight indicator.
- Each icon has a subtle `whileHover={{ scale: 1.15, rotate: 5 }}` spring.
- Switching themes triggers a `0.4s ease-out` CSS transition on `background-color`, `color`, and `border-color` across the entire page.

---

## 6. Data Attribute Schema

The theme system uses two `data-*` attributes on the `<html>` element:

```html
<html data-theme="dawn" data-mode="light">
```

CSS selectors:
```css
[data-theme='dawn'][data-mode='light'] { /* Dawn Light tokens */ }
[data-theme='dawn'][data-mode='dark']  { /* Dawn Dark tokens */ }
[data-theme='zenith'][data-mode='light'] { /* Zenith Light tokens */ }
/* ... etc */
```

This dual-attribute pattern keeps the light/dark toggle independent of the theme selection, so users can be on "Golden Dark" or "Golden Light" independently.

---

## 7. Files to Create / Modify

| Action | File | Purpose |
|--------|------|---------|
| MODIFY | `apps/web/src/styles/globals.css` | Add 8 new `[data-theme][data-mode]` CSS blocks with all tokens |
| MODIFY | `apps/web/src/components/layout/ThemeProvider.tsx` | Expand `Theme` type; add auto-switching logic; add `mode` state |
| CREATE | `apps/web/src/components/layout/ThemeSwitcher.tsx` | The animated pill component |
| MODIFY | `apps/web/src/components/layout/Navbar.tsx` | Embed the `ThemeSwitcher` |
| MODIFY | `apps/web/src/app/layout.tsx` | Update the `<head>` inline script for initial theme detection |
| CREATE | `apps/web/src/styles/themes/dawn.css` | Dawn ambient animation keyframes |
| CREATE | `apps/web/src/styles/themes/zenith.css` | Zenith ambient animation keyframes |
| CREATE | `apps/web/src/styles/themes/golden.css` | Golden ambient animation keyframes |
| CREATE | `apps/web/src/styles/themes/lunar.css` | Lunar ambient animation keyframes |

---

## 8. Performance Budget

| Metric | Target |
|--------|--------|
| Theme switch latency | < 16ms (one frame) |
| Ambient animation CPU | < 1% (GPU-composited only) |
| CSS bundle size increase | < 8KB (all 8 theme blocks) |
| No CLS (Cumulative Layout Shift) | 0 — themes only change colors, never layout |
| `prefers-reduced-motion` compliance | ✅ All ambient effects disabled |

---

## 9. Acceptance Criteria

- [ ] 4 themes × 2 modes = 8 visual identities render correctly.
- [ ] Auto-switching activates based on local time (Dawn at 5 AM, Zenith at 9 AM, Golden at 3 PM, Lunar at 7 PM).
- [ ] User can manually lock a theme; preference persists across sessions via `localStorage`.
- [ ] Theme transitions use a smooth `0.4s` cross-fade with no layout shifts.
- [ ] All 8 theme variants pass WCAG 2.2 AA contrast ratios for text.
- [ ] Ambient animations run at 60fps with < 1% CPU usage.
- [ ] `prefers-reduced-motion: reduce` disables all ambient effects.
- [ ] The Theme Switcher pill renders in the Navbar with Framer Motion `layoutId` animated highlight.

---

## 10. Decision Log

| ID | Decision | Rationale |
|----|----------|-----------|
| CT-D001 | Use `data-theme` + `data-mode` dual attributes | Keeps theme (time-of-day) and mode (light/dark) independent. Users can combine any theme with any mode |
| CT-D002 | CSS-only ambient backgrounds (no WebGL/Canvas) | Avoids GPU contention with the existing Three.js hero; pure CSS `transform` + `opacity` animations are sufficient and near-zero cost |
| CT-D003 | 15-minute auto-switch interval | Balances responsiveness with minimal JS overhead. Catches natural transitions without constant polling |
| CT-D004 | `0.4s ease-out` transition on theme swap | Long enough to feel intentional and smooth; short enough to not feel sluggish |

---

## Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Jul 2026 | Initial Circadian Theme Engine specification with 8 visual identities | System Architect |

*Document Version: 1.0 — Circadian Theme Engine*
