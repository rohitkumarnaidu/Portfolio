# Design System � Enterprise Component Library & Token Reference

> **File:** DesignSystem.md | **Version:** 5.0 | **Last Updated:** June 2026  
> **Status:** ? Active | **Framework:** React 18 + TypeScript 5 + Tailwind CSS 3.4  
> **Owner:** Design Systems Lead | **Review Cadence:** Monthly  
> **Components Documented:** 72+ across 9 categories | **Design Tokens:** 280+  
> **Theme Modes:** 3 (Light, Dark, High Contrast) | **WCAG:** 2.2 AA+ (AAA where feasible)

---

## Executive Summary

DESIGN-SYSTEM-EXTENDED.md defines the enterprise-grade component library and design token reference for the portfolio platform — covering 72+ components across 9 categories (Foundation, Navigation, Input, Feedback, Data Display, AI, Admin, Charts, Dashboard), 280+ design tokens organized in a 6-tier semantic hierarchy (color, typography, spacing, shadow, radius, motion), 3 theme modes (Light, Dark, WCAG AAA High Contrast), and compliance with WCAG 2.2 AA+ standards (AAA targeted in High Contrast mode). The system enforces strict governance through a Component Lifecycle (9-phase, proposal→retirement), a 14-point mandatory review checklist, breaking change protocol with 2-release deprecation window, and a performance budget (initial CSS < 20KB gzip, per-component JS < 2KB for primitives). Every component follows a standardized API pattern (variant + size props, `forwardRef`, `cn()` class merging, controlled/uncontrolled support) and is tested across 6 tiers (unit, interaction, a11y, visual, E2E, performance). The component ecosystem spans from primitives (Button, Card, Input, Toggle, Badge, Avatar, Tooltip) through navigation (Navbar, Tabs, Breadcrumbs) and feedback (Toast, Modal, Alert, Progress, Spinner) to advanced AI components (Chat, Suggestion, Status Indicator, Model Selector) and dashboard widgets (Grid, KPI Cards, Activity Feed).

```mermaid
flowchart TD
    subgraph Tokens["280+ Design Tokens"]
        C[Color - 150+] T[Typography - 40+]
        S[Spacing - 20+] SH[Shadow - 12]
        R[Radius - 8] M[Motion - 50+]
    end
    subgraph Themes["3 Theme Modes"]
        LT[Light] DT[Dark]
        HC[High Contrast - WCAG AAA]
    end
    subgraph Components["72+ Components - 9 Categories"]
        F[Foundation] N[Navigation] I[Input]
        FB[Feedback] DD[Data Display] AI[AI Components]
        AD[Admin] CH[Charts] DB[Dashboard]
    end
    subgraph Gov["Enterprise Governance"]
        L[Lifecycle] R[Review Checklist]
        V[Versioning] B[Performance Budget]
    end
    Tokens --> Themes
    Themes --> Components
    Components --> Gov
```

---

## Executive Summary

This design system is the single source of truth for all visual components, design tokens, interaction patterns, and accessibility requirements across the portfolio platform. It implements the visual identity defined in docs/04-design/DesignTokens.md as concrete, reusable React components and CSS custom properties. Every component targets WCAG 2.2 AA compliance, supports light, dark, and high-contrast themes, and follows the 4px/8px spacing system with 4px base unit.

**Key Stats:**
- **Components:** 72+ cataloged across 9 categories (Foundation, Navigation, Input, Feedback, Data Display, AI, Admin, Charts, Dashboard)
- **Design Tokens:** 280+ (color, typography, spacing, sizing, elevation, radius, shadow, animation, motion, 3D, responsive, accessibility)
- **Theme Modes:** 3 (Light + Dark + High Contrast via CSS custom properties)
- **WCAG Compliance:** AA (all 35 applicable criteria), AAA targeted for 18/25 feasible criteria
- **File Size Budget:** &lt; 20KB initial CSS, &lt; 80KB total JS for all foundational components
- **Testing:** 100% component coverage (unit + interaction + a11y + visual regression)

---
## 1. Design Principles

### 1.1 The 10 Enterprise Design Principles

| # | Principle | Definition | Design Decision | Verification |
|---|-----------|------------|-----------------|--------------|
| **1** | **Purposeful Elegance** | Every design decision serves a functional purpose. No decorative-only elements exist. | All components define explicit states; all animations have a communication goal. | PR reviews reject decorative additions without functional justification. |
| **2** | **Clarity Over Cleverness** | Clear communication trumps creative gimmicks. Users never guess how to interact. | Simple navigation, readable typography, descriptive labels, standard interaction patterns. | Usability tests must show 100% task completion for first-time users. |
| **3** | **Performance Is Design** | Fast load times and smooth interactions are UX features, not technical concerns. | ISR for content, optimized images, minimal JS bundles, skeleton loading. | Lighthouse performance = 95, LCP &lt; 1.5s, TBT &lt; 100ms. |
| **4** | **Accessibility Is Default** | Accessible design is not optional � it is the baseline. No user receives a degraded experience. | WCAG 2.2 AA is mandatory; semantic HTML is foundational; ARIA is progressive enhancement. | CI pipeline gates on axe violations; zero violations allowed in production. |
| **5** | **Consistency Creates Trust** | Predictable patterns build user confidence. The same component behaves identically everywhere. | One component, one implementation, one set of behaviors across all pages and contexts. | Component library is the single source of truth; no duplicated patterns allowed. |
| **6** | **Whitespace Is Content** | Empty space communicates importance and creates visual breathing room. | Generous section spacing, clean layouts, minimum 16px gutters on mobile. | Design reviews check spacing rhythm; no element touches another without defined gap. |
| **7** | **Motion Must Matter** | Animations guide attention, provide feedback, and establish hierarchy � never distract. | Every animation serves one of three purposes: guide, feedback, hierarchy. | Reduced motion preference disables all non-essential animation. |
| **8** | **Mobile Is Not Secondary** | The mobile experience is equal in quality to desktop � not a degraded version. | Mobile-first breakpoints, touch targets = 44x44px, no horizontal scroll at 320px. | All screens tested at 320px, 768px, 1280px before release. |
| **9** | **Progressive Enhancement** | Core content and functionality work without JavaScript. JS enhances, never enables. | Static HTML rendering, semantic elements, JS-free navigation. All animations are additive. | Every page renders meaningful content with JS disabled. |
| **10** | **Personality Over Template** | The design reflects a real person with unique taste, not a generic template. | Custom typefaces (Cabinet Grotesk), indigo accent signature, glassmorphism cards, subtle noise texture. | Brand audit quarterly ensures design remains distinctive. |

### 1.2 Principle Weighting Matrix

| Principle | Weight | Violation Severity | Enforced By |
|-----------|--------|-------------------|-------------|
| Purposeful Elegance | Critical | Blocks release | Design review |
| Clarity Over Cleverness | Critical | Blocks release | UX review |
| Performance Is Design | High | PR blocked | Lighthouse CI |
| Accessibility Is Default | Critical | Blocks release | axe CI gate |
| Consistency Creates Trust | High | PR blocked | Component audit |
| Whitespace Is Content | Medium | Design review flag | Design review |
| Motion Must Matter | Medium | Design review flag | Animation audit |
| Mobile Is Not Secondary | High | PR blocked | Playwright tests |
| Progressive Enhancement | High | PR blocked | E2E tests (JS-off) |
| Personality Over Template | Medium | Design review flag | Brand audit |

---
## 2. Design Tokens

### 2.1 Color System

#### 2.1.1 Architecture

All colors are exposed as CSS custom properties and Tailwind theme extensions. Tokens automatically swap between themes via data-theme attribute on &lt;html>. No raw hex values are used in component code.

#### 2.1.2 Accent Palette

| Token | CSS Variable | Light Hex | Dark Hex | HC Hex | Usage | Contrast (AA) |
|-------|-------------|-----------|----------|--------|-------|---------------|
| accent-50 | --accent-50 | #EEF2FF | #1E1B4B | #E0E0E0 | Background tint | ? |
| accent-100 | --accent-100 | #E0E7FF | #312E81 | #C0C0C0 | Hover background | ? |
| accent-200 | --accent-200 | #C7D2FE | #3730A3 | #A0A0A0 | Active background | ? |
| accent-300 | --accent-300 | #A5B4FC | #4338CA | #8080FF | Border accent | ? |
| accent-400 | --accent-400 | #818CF8 | #4F46E5 | #6060FF | Soft accent | ? |
| **accent-500** | --accent-500 | **#6366F1** | **#6366F1** | **#4040FF** | **Primary accent, CTAs** | ? 4.8:1+ |
| accent-600 | --accent-600 | #4F46E5 | #818CF8 | #2020FF | Hover on accent | ? |
| accent-700 | --accent-700 | #4338CA | #A5B4FC | #0000DD | Active on accent | ? |
| accent-800 | --accent-800 | #3730A3 | #C7D2FE | #0000AA | Pressed accent | ? |

#### 2.1.3 Neutral Palette (Surface + Text)

| Token | CSS Variable | Light Hex | Dark Hex | HC Hex | Usage | Contrast Ratio |
|-------|-------------|-----------|----------|--------|-------|----------------|
| surface-primary | --surface-primary | #FAFAFA | #09090B | #FFFFFF | Page background | � |
| surface-secondary | --surface-secondary | #FFFFFF | #18181B | #F0F0F0 | Card background | � |
| surface-elevated | --surface-elevated | #F4F4F5 | #27272A | #E0E0E0 | Elevated card, dropdown | � |
| surface-overlay | --surface-overlay | gba(0,0,0,0.5) | gba(0,0,0,0.7) | gba(0,0,0,0.85) | Modal backdrop | � |
| border-primary | --border-primary | #E4E4E7 | #3F3F46 | #000000 | Subtle borders | � |
| border-accent | --border-accent | #D4D4D8 | #52525B | #000000 | Emphasized borders | � |
| text-primary | --text-primary | #18181B | #FAFAFA | #000000 | Main body | 15.3:1 |
| text-secondary | --text-secondary | #52525B | #A1A1AA | #1A1A1A | Secondary text | 7.2:1 |
| text-tertiary | --text-tertiary | #71717A | #71717A | #333333 | Caption, placeholder | 4.8:1 |
| text-inverse | --text-inverse | #FAFAFA | #18181B | #FFFFFF | Text on inverted | � |
| text-link | --text-link | #4F46E5 | #818CF8 | #0000FF | Link text | 4.9:1+ |
| text-success | --text-success | #166534 | #22C55E | #006600 | Success text | 4.5:1+ |
| text-error | --text-error | #991B1B | #EF4444 | #CC0000 | Error text | 4.5:1+ |

#### 2.1.4 Semantic Palette

| Token | CSS Variable | Hex (Light/Dark) | HC Hex | Usage | WCAG |
|-------|-------------|-------------------|--------|-------|------|
| success | --semantic-success | #22C55E | #008800 | Success states | AA |
| success-bg | --semantic-success-bg | #F0FDF4 / #052E16 | #CCFFCC | Success background | � |
| warning | --semantic-warning | #F59E0B | #AA6600 | Warning states | AA |
| warning-bg | --semantic-warning-bg | #FFFBEB / #451A03 | #FFEEBB | Warning background | � |
| error | --semantic-error | #EF4444 | #CC0000 | Error states | AA |
| error-bg | --semantic-error-bg | #FEF2F2 / #450A0A | #FFCCCC | Error background | � |
| info | --semantic-info | #3B82F6 | #0044CC | Info states | AA |
| info-bg | --semantic-info-bg | #EFF6FF / #0C1929 | #CCDDFF | Info background | � |

#### 2.1.5 Gradient Tokens

| Token | CSS Variable | Value | Usage |
|-------|-------------|-------|-------|
| gradient-hero | --gradient-hero | linear-gradient(135deg, var(--accent-500), #06B6D4) | Hero heading text |
| gradient-cta | --gradient-cta | linear-gradient(135deg, var(--accent-500), var(--accent-600)) | Primary CTA background |
| gradient-glass | --gradient-glass | linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05)) | Glass card overlay |
| gradient-success | --gradient-success | linear-gradient(135deg, #22C55E, #16A34A) | Success banner |
| gradient-error | --gradient-error | linear-gradient(135deg, #EF4444, #DC2626) | Error banner |

#### 2.1.6 Overlay/Scrim Tokens

| Token | CSS Variable | Value | Usage |
|-------|-------------|-------|-------|
| scrim-light | --scrim-light | gba(0,0,0,0.3) | Light overlay (images) |
| scrim-medium | --scrim-medium | gba(0,0,0,0.5) | Modal backdrop |
| scrim-heavy | --scrim-heavy | gba(0,0,0,0.7) | Loading overlay |
| scrim-glass | --scrim-glass | gba(255,255,255,0.05) | Glass base layer |

#### 2.1.7 Color Usage Rules

| Rule | Implementation | Rationale |
|------|---------------|-----------|
| Accent is the only brand color | All interactive elements use accent-500 | Consistent brand identity |
| Never use accent for body text | Accent reserved for CTAs, links, indicators | Poor readability at small sizes (&lt; 4.5:1) |
| Semantic colors need icons | Never rely on color alone for meaning | WCAG 1.4.1 |
| No raw hex in components | Always use CSS custom property tokens | Enables theme switching |
| Color pairs verified at token level | Each foreground/background pair = 4.5:1 | Zero contrast failures |
| Dark mode = desaturated tones | Dark theme uses muted variants | Reduces eye strain |

### 2.2 Typography System

#### 2.2.1 Font Families

| Token | CSS Variable | Font Stack | Weight Range | Usage | Source |
|-------|-------------|------------|-------------|-------|--------|
| font-display | --font-display | 'Cabinet Grotesk', system-ui, sans-serif | 400-700 | Display, H1, H2 | Fontshare |
| font-body | --font-body | 'Inter', system-ui, sans-serif | 300-700 | Body text, H3-H4, buttons | Google Fonts |
| font-mono | --font-mono | 'JetBrains Mono', monospace | 400-700 | Code blocks, inline code | Google Fonts |

#### 2.2.2 Type Scale

| Level | Token | Desktop | Tablet | Mobile | Weight | Line Ht | Letter Spacing | Usage |
|-------|-------|---------|--------|--------|--------|---------|----------------|-------|
| display | --text-display | 72px (4.5rem) | 54px (3.375rem) | 48px (3rem) | 700 | 1.1 | -0.02em | Hero heading only |
| h1 | --text-h1 | 60px (3.75rem) | 44px (2.75rem) | 36px (2.25rem) | 700 | 1.15 | -0.01em | Page title |
| h2 | --text-h2 | 36px (2.25rem) | 30px (1.875rem) | 28px (1.75rem) | 600 | 1.2 | normal | Section heading |
| h3 | --text-h3 | 28px (1.75rem) | 24px (1.5rem) | 22px (1.375rem) | 600 | 1.25 | normal | Sub-section heading |
| h4 | --text-h4 | 22px (1.375rem) | 20px (1.25rem) | 18px (1.125rem) | 600 | 1.3 | normal | Card title |
| body-lg | --text-body-lg | 18px (1.125rem) | 17px (1.063rem) | 16px (1rem) | 400 | 1.6 | normal | Lead paragraphs |
| body | --text-body | 16px (1rem) | 15.5px (0.969rem) | 15px (0.938rem) | 400 | 1.6 | normal | Main content |
| body-sm | --text-body-sm | 14px (0.875rem) | 13.5px (0.844rem) | 13px (0.813rem) | 400 | 1.5 | normal | Metadata |
| caption | --text-caption | 12px (0.75rem) | 12px (0.75rem) | 12px (0.75rem) | 400 | 1.4 | +0.01em | Labels, timestamps |
| code | --text-code | 14px (0.875rem) | 13.5px (0.844rem) | 13px (0.813rem) | 400 | 1.5 | normal | Code blocks |
| button | --text-button | 14px (0.875rem) | 14px (0.875rem) | 14px (0.875rem) | 500 | 1 | +0.01em | Default button |
| overline | --text-overline | 11px (0.688rem) | 11px (0.688rem) | 11px (0.688rem) | 600 | 1.2 | +0.05em | Section overline |
| stat | --text-stat | 48px (3rem) | 40px (2.5rem) | 36px (2.25rem) | 700 | 1 | -0.02em | Stat counter |

#### 2.2.3 Typography Rules

| Rule | Value | Rationale |
|------|-------|-----------|
| Body size minimum | 16px desktop, 15px mobile | Prevents iOS zoom, WCAG recommendation |
| Line height (body) | 1.6 (1.5 minimum per WCAG 1.4.12) | Readability across languages |
| Line length (body) | 65ch maximum | Readability research (60-75 chars) |
| Heading line height | 1.1 (display) - 1.3 (H4) | Tighter for hierarchy |
| Modular scale | 1.25 (major third) | Natural musical ratio |
| No justified text | Always left-aligned | Prevents uneven word spacing |
| No widows/orphans | 	ext-wrap: balance on headings | Clean typography |
| Text resizable to 200% | Use rem/em units exclusively | WCAG 1.4.4 |

### 2.3 Spacing System

#### 2.3.1 Spacing Scale (Base: 4px, Major: 8px)

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| space-0.25 | 1px | � | Hairline borders |
| space-0.5 | 2px | p-0.5 | Hairline spacing |
| space-1 | 4px | p-1 | Base unit, icon padding |
| space-1.5 | 6px | � | Compact input padding |
| space-2 | 8px | p-2 | Icon padding, badge padding |
| space-3 | 12px | p-3 | Input padding, small buttons |
| space-4 | 16px | p-4 | Card padding (mobile), section margin |
| space-5 | 20px | p-5 | Avatar margins, medium gaps |
| space-6 | 24px | p-6 | Card padding (desktop), grid gap |
| space-8 | 32px | p-8 | Section spacing (mobile), form gap |
| space-10 | 40px | p-10 | Section spacing (tablet), modal padding |
| space-12 | 48px | p-12 | Section spacing (desktop), hero margin |
| space-16 | 64px | p-16 | Major section separation |
| space-20 | 80px | � | Page section spacing (tablet) |
| space-24 | 96px | p-24 | Page section spacing (desktop) |
| space-32 | 128px | � | Full viewport section |

#### 2.3.2 Spacing Rules

| Rule | Value | Usage |
|------|-------|-------|
| Base unit | 4px | All spacing derived from this |
| Major increment | 8px (2x base) | Primary spacing decisions |
| Card padding | 16px mobile, 24px desktop | Responsive card gutters |
| Section padding Y | 64px mobile, 80px tablet, 96px desktop | Vertical rhythm |
| Grid gap | 16px mobile, 24px tablet, 32px desktop | Responsive grid spacing |
| Content max-width | 1280px | Page container |
| Readable max-width | 65ch (~720px) | Body text |
| Touch target gap | = 8px between interactive elements | Prevents mis-taps |
| Stack spacing | 16px between related, 32px between unrelated | Visual grouping |

### 2.4 Sizing System

#### 2.4.1 Component Sizing Scale

| Token | Value | Usage |
|-------|-------|-------|
| size-xs | 20px | Micro badge, dot indicator |
| size-sm | 24px | Small icon, tag |
| size-md | 32px | Default icon, small avatar |
| size-lg | 40px | Large icon, default button height |
| size-xl | 48px | Large button, medium avatar |
| size-2xl | 56px | Extra large button, hero icon |
| size-3xl | 64px | Hero avatar, logo |
| size-4xl | 80px | Large avatar, feature icon |
| size-5xl | 96px | Section hero image |
| size-6xl | 128px | Profile photo, hero element |

#### 2.4.2 Component Height Scale

| Component | Height (sm) | Height (md) | Height (lg) | Height (xl) |
|-----------|-------------|-------------|-------------|-------------|
| Button | 32px | 40px | 48px | 56px |
| Input | 36px | 40px | 48px | � |
| Select | 36px | 40px | 48px | � |
| Badge | 20px | 24px | 28px | � |
| Avatar | 32px | 40px | 56px | 80px |
| Toggle | 20px | 24px | 28px | � |
| Tab | � | 40px | 48px | � |

#### 2.4.3 Width Scale

| Token | Value | Usage |
|-------|-------|-------|
| w-xs | 240px | Small card, sidebar collapsed |
| w-sm | 320px | Medium card, tooltip |
| w-md | 400px | Modal small, form column |
| w-lg | 560px | Modal medium, content max |
| w-xl | 720px | Modal large, article width |
| w-2xl | 960px | Modal xl, admin panel |
| w-3xl | 1280px | Page max width |

### 2.5 Elevation & Shadow System

#### 2.5.1 Shadow Tokens

| Token | Light | Dark | High Contrast | Name | Usage |
|-------|-------|------|---------------|------|-------|
| shadow-sm |   1px 2px rgba(0,0,0,0.05) |   1px 2px rgba(0,0,0,0.3) |   0 0 2px #000 | Small | Card border substitute, subtle separation |
| shadow-md |   4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04) |   4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -1px rgba(0,0,0,0.2) |   0 0 2px #000 | Medium | Default card elevation |
| shadow-lg |   10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04) |   10px 15px -3px rgba(0,0,0,0.5), 0 4px 6px -2px rgba(0,0,0,0.2) |   0 0 3px #000, 0 0 0 6px #FFF | Large | Dropdown, popover |
| shadow-xl |   20px 25px -5px rgba(0,0,0,0.09), 0 10px 10px -5px rgba(0,0,0,0.04) |   20px 25px -5px rgba(0,0,0,0.6), 0 10px 10px -5px rgba(0,0,0,0.2) |   0 0 4px #000, 0 0 0 8px #FFF | Extra Large | Modal, drawer |
| shadow-2xl |   25px 50px -12px rgba(0,0,0,0.25) |   25px 50px -12px rgba(0,0,0,0.8) |   0 0 5px #000, 0 0 0 10px #FFF | 2XL | Toast, notification |
| shadow-inner | inset 0 2px 4px rgba(0,0,0,0.06) | inset 0 2px 4px rgba(0,0,0,0.3) | inset 0 0 0 1px #000 | Inner | Input focus, inset |
| shadow-accent-focus | 0 0 0 3px rgba(99,102,241,0.35) | 0 0 0 3px rgba(129,140,248,0.5) | 0 0 0 3px #4040FF | Accent Focus | Focus ring on interactive elements (replaces glow) |
| shadow-accent-active | inset 0 0 0 2px rgba(99,102,241,0.2) | inset 0 0 0 2px rgba(129,140,248,0.3) | inset 0 0 0 2px #4040FF | Accent Active | Active/pressed accent state |
| shadow-accent-hover | 0 4px 14px rgba(99,102,241,0.25) | 0 4px 14px rgba(129,140,248,0.35) | 0 0 3px #4040FF | Accent Hover | Hover state on primary CTA buttons |
| shadow-none |
one | 
one | 
one | None | Flat surfaces |

#### 2.5.2 Shadow Rules

| Rule | Rationale |
|------|-----------|
| Maximum 5 shadow layers in any composition | Prevents visual noise |
| Shadows increase with z-index | Logical depth perception |
| HC mode uses border-style shadows (no opacity) | WCAG 1.4.11, visible on any background |
| Accent shadows only on focus/active/hover states | Enterprise glow policy � no neon/bloom in UI; accent focus shadow replaces glow |
| No shadows on text (use text-shadow only for headings) | Readability |
| Neumorphism shadows use twin pairs (light + dark) | Extruded depth effect � see [`08n-NEUMORPHISM.md`](./08n-NEUMORPHISM.md) |

### 2.5.3 Neumorphism Shadow Tokens

> **Full specification:** See [`08n-NEUMORPHISM.md`](./08n-NEUMORPHISM.md) �2 (Elevation Levels) and �6 (Implementation).

| Token | Light Theme | Dark Theme | Elevation | Usage |
|-------|-------------|------------|-----------|-------|
| `--neu-light-raised-light` | `-4px -4px 8px rgba(255,255,255,0.8)` | `-4px -4px 8px rgba(255,255,255,0.05)` | Raised (soft) | Default card, button, toggle (extruded) |
| `--neu-light-raised-dark` | `4px 4px 8px rgba(0,0,0,0.08)` | `4px 4px 8px rgba(0,0,0,0.5)` | Raised (soft) | Default card, button, toggle (extruded) |
| `--neu-light-pressed-light` | `inset -4px -4px 8px rgba(255,255,255,0.8)` | `inset -4px -4px 8px rgba(255,255,255,0.05)` | Pressed (soft) | Active button, toggle on, slider track |
| `--neu-light-pressed-dark` | `inset 4px 4px 8px rgba(0,0,0,0.08)` | `inset 4px 4px 8px rgba(0,0,0,0.5)` | Pressed (soft) | Active button, toggle on, slider track |
| `--neu-light-flat-light` | `inset 2px 2px 4px rgba(0,0,0,0.06)` | `inset 2px 2px 4px rgba(255,255,255,0.04)` | Flat (soft) | Default stat card, surface panel |
| `--neu-light-flat-dark` | `inset -2px -2px 4px rgba(255,255,255,0.8)` | `inset -2px -2px 4px rgba(0,0,0,0.5)` | Flat (soft) | Default stat card, surface panel |
| `--neu-light-raised-hover-light` | `-6px -6px 12px rgba(255,255,255,0.85)` | `-6px -6px 12px rgba(255,255,255,0.05)` | Raised hover | Card hover state |
| `--neu-light-raised-hover-dark` | `6px 6px 12px rgba(0,0,0,0.1)` | `6px 6px 12px rgba(0,0,0,0.55)` | Raised hover | Card hover state |

**Implementation Rules:**
- Hard variant: multiply blur radius and shadow opacity by 1.5�
- Neumorphism requires parent-child luminance difference = 1.3%
- Never on `--surface-primary` � no depth reference
- High contrast mode: remove all neumorphism shadows, replace with `1px solid border`

### 2.6 Radius System

#### 2.6.1 Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| radius-none | 0px | Sharp edges, admin panels |
| radius-sm | 4px (0.25rem) | Inputs, selects, small components |
| radius-md | 6px (0.375rem) | Buttons, cards, dropdowns |
| radius-lg | 8px (0.5rem) | Modals, panels |
| radius-xl | 12px (0.75rem) | Cards (default), popovers |
| radius-2xl | 16px (1rem) | Hero sections, large cards |
| radius-3xl | 24px (1.5rem) | Exclusive hero elements |
| radius-full | 9999px | Badges, pills, avatars, toggles |

#### 2.6.2 Radius Rules

| Rule | Value | Rationale |
|------|-------|-----------|
| Default card radius | 12px (xl) | Balanced modern look |
| Button radius | 6px (md) | Subtle but distinct |
| Input radius | 4px (sm) | Professional appearance |
| Interactive radius | = 8px | Fitts law � larger targets easier |
| Consistent group radius | Use same radius on parent | Nested radius must match or be smaller |

### 2.7 Animation & Motion System

#### 2.7.1 Duration Tokens

| Token | Value | Usage |
|-------|-------|-------|
| duration-instant | 0ms | No animation |
| duration-fastest | 100ms | Micro-interactions (hover, tap) |
| duration-fast | 200ms | State changes (focus, active) |
| duration-normal | 300ms | Transitions (accordion, collapse) |
| duration-slow | 400ms | Entrance animations |
| duration-slower | 500ms | Page transitions |
| duration-slowest | 700ms | Hero animations, loader |

#### 2.7.2 Easing Tokens

| Token | Cubic Bezier | Usage |
|-------|-------------|-------|
| ease-default | cubic-bezier(0.4, 0, 0.2, 1) | All standard transitions |
| ease-in | cubic-bezier(0.4, 0, 1, 1) | Elements entering (rare) |
| ease-out | cubic-bezier(0, 0, 0.2, 1) | Elements exiting |
| ease-spring | cubic-bezier(0.34, 1.56, 0.64, 1) | Spring-like bounce on micro-interactions |
| ease-smooth | cubic-bezier(0.65, 0, 0.35, 1) | Smooth scroll, page transitions |

#### 2.7.3 Keyframe Animations

| Name | Property | Duration | Purpose |
|------|----------|----------|---------|
| ade-in | opacity | 300ms | Content entrance |
| ade-in-up | opacity, translateY | 400ms | Cards entering viewport |
| ade-in-down | opacity, translateY | 300ms | Dropdowns |
| slide-in-left | translateX | 300ms | Sidebar navigation |
| slide-in-right | translateX | 300ms | Drawers, notifications |
| scale-in | opacity, scale | 200ms | Modal, tooltip |
| spin | rotate | 1s (infinite) | Loading spinner |
| pulse | opacity | 2s (infinite) | Skeleton loading |
| shimmer | background-position | 1.5s (infinite) | Skeleton shimmer |
| ounce | translateY | 0.5s | Micro-interaction feedback |
| skeleton-loading | background-position | 1.5s (infinite) | Content placeholder |
| ccordion-open | max-height, opacity | 300ms | Accordion expand |
| counter-increment | transform | 400ms | Stat counter animation |
| progress-fill | width | 1s | Progress bar fill |
| gradient-shift | background-position | 3s (infinite) | Gradient hero text |
| loat | translateY | 2s (infinite) | Floating indicator |

#### 2.7.4 Reduced Motion Rules

| Rule | Implementation | Reason |
|------|---------------|--------|
| Disable all non-essential animations | @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } } | WCAG 2.3.3 |
| Essential animations continue | Loading spinner, skeleton, progress bar | These communicate system state |
| Parallax disabled in reduced motion | Scroll effects fall back to static | Prevents vestibular issues |
| No auto-scrolling | scroll-behavior: auto in reduced motion | User control |
| Hover animations reduced | Scale/transform effects disabled | Motion sensitivity |

### 2.8 3D & Interactive Tokens

#### 2.8.1 3D Effect Tokens

| Token | CSS Variable | Value | Usage |
|-------|-------------|-------|-------|
| perspective-3d | --perspective-3d | 1000px | Card tilt perspective |
| rotate-3d-hover | --rotate-3d-hover | otateX(2deg) rotateY(-2deg) | Card 3D hover |
| rotate-3d-active | --rotate-3d-active | otateX(4deg) rotateY(-4deg) | Card 3D press |
| glow-intensity | --glow-intensity |  .35 | Glow opacity on 3D hover |
| glass-blur | --glass-blur | 12px | Backdrop blur on glass |
| glass-saturate | --glass-saturate | 1.8 | Saturation boost on glass |

#### 2.8.2 Glass Morphism Tokens

| Token | CSS Variable | Value |
|-------|-------------|-------|
| glass-bg | --glass-bg | gba(255, 255, 255, 0.05) |
| glass-border | --glass-border | gba(255, 255, 255, 0.1) |
| glass-shadow | --glass-shadow |   8px 32px rgba(0, 0, 0, 0.1) |
| glass-blur | --glass-blur | 12px |
| glass-saturate | --glass-saturate | 1.8 |

### 2.9 Responsive Breakpoints

| Name | Width | Target | CSS Media |
|------|-------|--------|-----------|
| xs | 320px+ | Small phones | @media (min-width: 320px) |
| sm | 640px+ | Large phones | @media (min-width: 640px) |
| md | 768px+ | Tablets | @media (min-width: 768px) |
| lg | 1024px+ | Small laptops | @media (min-width: 1024px) |
| xl | 1280px+ | Desktops | @media (min-width: 1280px) |
| 2xl | 1536px+ | Wide screens | @media (min-width: 1536px) |

### 2.10 Accessibility Tokens

| Token | CSS Variable | Value | Usage |
|-------|-------------|-------|-------|
| focus-ring | --focus-ring |   0 0 2px var(--surface-primary), 0 0 0 4px var(--accent-500) | Visible focus indicator |
| focus-ring-offset | --focus-ring-offset | 2px | Gap between element and ring |
| motion-factor | --motion-factor | 1 (reduced:  ) | Multiplier for all animation durations |
| contrast-factor | --contrast-factor | 1 (HC: 1.5) | Multiplier for icon contrast |
| touch-target | --touch-target | 44px | Minimum touch target size |
| scrollbar-width | --scrollbar-width | 	hin | OS scrollbar preference |

## 3. Theme System

### 3.1 Theme Architecture

`
&lt;html data-theme="light" | "dark" | "high-contrast">
  +-- CSS Custom Properties (--accent-*, --surface-*, --text-*, etc.)
       +-- Tailwind Extensions (theme.extend.colors, etc.)
            +-- Component Props (variant="primary" maps to accent-500)
`

Themes are applied via the data-theme attribute on &lt;html>. Default theme is light. Initial theme detection uses prefers-color-scheme and prefers-contrast: more via a blocking script in &lt;head> to prevent flash.

### 3.2 Theme Detection & Initialization

`	ypescript
// Theme initialization (runs in <head>, no flash)
function initTheme(): Theme {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark' || stored === 'high-contrast') return stored;

  if (window.matchMedia('(prefers-contrast: more)').matches) return 'high-contrast';
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}
`

### 3.3 Theme Mode Details

| Feature | Light | Dark | High Contrast | Implementation |
|---------|-------|------|---------------|----------------|
| Surface | White (#FAFAFA) | Near-black (#09090B) | Pure white (#FFF) | --surface-primary |
| Text | Near-black (#18181B) | Near-white (#FAFAFA) | Pure black (#000) | --text-primary |
| Accent | Indigo (#6366F1) | Indigo-400 (#818CF8) | Blue (#4040FF) | --accent-500 |
| Shadows | Subtle dark | Prominent dark | Border-based, no opacity | --shadow-* |
| Transparency | 5-50% | 5-70% | 0% (solid only) | WCAG 1.4.11 |
| Glow effects (UI) | `shadow-accent-focus` (0.35) | `shadow-accent-focus` (0.5) | 3px solid accent border | `--shadow-accent-focus` |
| Glass blur | 12px blur | 12px blur | Disabled, solid bg | --glass-blur |
| Skeleton shimmer | Light gray | Dark gray | Animated stripes | --skeleton-base |
| Scrollbar | Thin, gray | Thin, dark | Standard, visible | --scrollbar-width |

### 3.4 Theme Persistence

- Theme selection is persisted in localStorage key 	heme
- Theme toggle triggers equestAnimationFrame for class swap (no flash)
- System theme changes (prefers-color-scheme) are listened to via matchMedia listener
- If no localStorage value, system preference is respected

### 3.5 Theme Transition

`css
/* Prevent flash on initial load � no transition */
html.disable-transition * {
  transition: none !important;
}

/* Smooth theme transition after paint */
html.theme-ready {
  transition: background-color 300ms ease, color 300ms ease;
}
html.theme-ready * {
  transition: background-color 200ms ease, color 200ms ease, border-color 200ms ease;
}
`

### 3.6 High Contrast Mode Details

High contrast mode transforms the visual system to meet WCAG AAA where possible:

| Transformation | Token Change | Rationale |
|---------------|-------------|-----------|
| All shadows ? solid borders | --shadow-* ?   0 0 2px #000 | WCAG 1.4.11, no opacity |
| Transparency removed | All gba() ? solid colors | WCAG 1.4.1 |
| Accent ? Blue | #6366F1 ? #4040FF | Blue is universally recognized |
| Glass blur disabled | ackdrop-filter: none | Prevent rendering artifacts |
| Focus ring ? high contrast | Double ring (black + white) | WCAG 2.4.13 |
| All text ? minimum 7:1 | Adjusts from 4.5:1 ? 7:1 | WCAG AAA text |
| All icons ? minimum 3:1 | Removes low-contrast decorative | WCAG 1.4.11 |
| Underline all links | Always visible, not just on hover | WCAG 1.4.1 |
| Borders on all cards | Cards always have visible border | Distinguishable |

## 4. Component Library

### 4.1 Foundation Components

---

#### 4.1.1 Button

**Purpose:** Primary action trigger. Used for form submission, navigation, and call-to-actions throughout the application.

**Variants:**

| Variant | Purpose | Token | Icon Support | Gradient? |
|---------|---------|-------|-------------|-----------|
| primary | Primary CTA, most important action | accent-500 fill, white text | ? | ? optional --gradient-cta |
| secondary | Secondary actions, alternatives | transparent, accent border | ? | ? |
| outline | Tertiary actions, ghost-like | transparent, border-primary | ? | ? |
| ghost | Lowest emphasis, toolbar, icon buttons | transparent, no border | ? | ? |
| danger | Destructive actions (delete, remove) | semantic-error fill | ? | ? |

**Sizes:**

| Size | Height | Padding X | Font Size | Icon Size | Gap |
|------|--------|-----------|-----------|-----------|-----|
| sm | 32px | 12px | 13px | 16px | 6px |
| md (default) | 40px | 16px | 14px | 18px | 8px |
| lg | 48px | 24px | 15px | 20px | 10px |
| xl | 56px | 32px | 16px | 22px | 12px |

**States:**

| State | Primary | Secondary | Outline | Ghost | Danger |
|-------|---------|-----------|---------|-------|--------|
| Default | accent-500 bg, white text | transparent, accent-500 text + border | transparent, text-primary, border-primary | transparent, text-secondary | error bg, white text |
| Hover | accent-600 | accent-50 bg | accent-50 bg, accent-500 border | accent-50 bg | error-600 |
| Active | accent-700 | accent-100 bg | accent-100 bg, accent-600 border | accent-100 bg | error-700 |
| Focus | --focus-ring | --focus-ring | --focus-ring | --focus-ring | --focus-ring (error color) |
| Disabled | opacity-50, cursor-not-allowed | opacity-50 | opacity-50 | opacity-30 | opacity-50 |
| Loading | Replace icon with Spinner | Replace icon with Spinner | Replace icon with Spinner | Replace icon with Spinner | Replace icon with Spinner |

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| Role | <button> always � never <div> styled as button |
| Focus | Visible focus ring via --focus-ring, :focus-visible only (not :focus) |
| Label | Icon-only buttons MUST have ria-label or ria-labelledby |
| State | ria-disabled="true" for disabled buttons (not just CSS), ria-busy="true" for loading |
| Description | ria-describedby for buttons with additional context |
| Screen reader | Loading state announces "Loading" via ria-live="polite" |

**Interactions:**

| Action | Behavior | Duration | Rationale |
|--------|----------|----------|-----------|
| Click | Execute action immediately | instant | No delay � immediate feedback |
| Hover | Scale 1.02 + shadow increase | 200ms | Feedback, transforms feel tactile |
| Active | Scale 0.98 | 100ms | Press feel |
| Focus | Show --focus-ring | 150ms | Visible keyboard navigation |
| Loading | Disable, show spinner, maintain width | � | Prevents double-submit, layout shift |
| Reduced motion | No scale transform, only color change | 0.01ms | Respects user preference |

**Animations:**

| Animation | Trigger | Duration | Easing |
|-----------|---------|----------|--------|
| Background color | hover, active | 200ms | ease-default |
| Scale transform | hover (1.02), active (0.98) | 200ms | ease-spring |
| Shadow | hover | 200ms | ease-default |
| Spinner | loading | 1s loop, linear | ease-default |

**Usage Rules:**

| Rule | Explanation |
|------|-------------|
| One primary per page/section | Only one ariant="primary" per viewport section |
| Button text always describes action | "Save", "Delete", "Submit" � never "Click Here" |
| No disabled tooltips | Disabled buttons explain why via adjacent text or ria-describedby |
| Max one icon per button | Icons to left of text (or only icon for icon buttons) |
| Danger requires confirmation | ariant="danger" MUST trigger a confirm dialog before executing |
| Loading width maintained | Preserve original button width during loading to prevent layout shift |
| No inline styles for variants | Always use variant prop |

**Anti-Patterns:**

| Anti-Pattern | Why |
|--------------|-----|
| Multiple primary buttons on one page | Dilutes CTA hierarchy |
| Button as link | Use <a> for navigation, <button> for actions |
| Disabled button without explanation | Users don't know why it's disabled |
| Icon-only button without aria-label | Invisible to screen readers |
| Loading state without width preservation | Layout shift, CLS impact |
| Using Button for toggle behavior | Use Toggle component instead |

---

#### 4.1.2 Card

**Purpose:** Content container for grouping related information. Foundation for the glassmorphism visual style.

**Variants:**

| Variant | Background | Border | Shadow | Glass Effect | Usage |
|---------|-----------|--------|--------|-------------|-------|
| default | surface-secondary | border-primary | shadow-md | ? | Standard cards |
| elevated | surface-secondary | border-primary | shadow-lg | ? | Featured cards |
| glass | glass-bg | glass-border | glass-shadow | ? backdrop-blur | Hero sections, overlays |
| outline | transparent | border-primary | none | ? | Settings panels |
| lat | surface-primary | none | none | ? | Nested content |

**Sub-components:**

| Sub-component | Tag | Purpose |
|--------------|-----|---------|
| Card.Header | <div> | Title, subtitle, action icon |
| Card.Content | <div> | Primary content area |
| Card.Footer | <div> | Actions, metadata, CTAs |

**States:**

| State | Default | Elevated | Glass | Outline | Flat |
|-------|---------|----------|-------|---------|------|
| Default | surface-secondary, border-primary | surface-secondary, shadow-lg | glass-bg, glass-border | transparent, border-primary | surface-primary |
| Hover (interactive) | shadow-lg, border-accent | shadow-xl, border-accent | glass-bg lighter, glass-border lighter | border-accent | surface-secondary |
| Interactive | Cursor pointer, entire card clickable | Same | Same | Same | Same |

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| Heading | Card Header uses <h2>-<h4> in proper hierarchy |
| Interactive card | ole="button" + 	abindex="0" + onKeyDown for Enter/Space |
| ARIA | ria-label for action buttons within card |
| Color | Cards pass 3:1 border contrast (non-interactive), 4.5:1 text contrast |
| Focus | Focus ring on interactive cards only |

**Interactions:**

| Action | Behavior | Duration |
|--------|----------|----------|
| Hover | Slight translateY(-2px), shadow-lg ? shadow-xl | 300ms |
| Click | translateY(-1px) | 100ms |
| Focus | Visible ring if interactive | 200ms |
| Touch | No hover on touch devices | � |

**Animations:**

| Animation | Trigger | Duration | Easing |
|-----------|---------|----------|--------|
| Elevation change | hover | 300ms | ease-default |
| Border color | hover | 200ms | ease-default |
| Stagger entrance | viewport entry (each card delayed by 80ms) | 400ms | ease-out |
| Glass blur intensification | hover | 300ms | ease-default |

**Usage Rules:**

| Rule | Explanation |
|------|-------------|
| Cards are not clickable by default | Add interactive prop to enable hover/click |
| Consistent height in grid | Use grid rows with equal height or min-height |
| Content never overflows | All content stays within card bounds |
| Max one CTA per card | Primary action only; secondary links go to footer |
| Card padding: 24px desktop, 16px mobile | Responsive gutters |
| Glass cards on light backgrounds only | Glass effect requires ~80px of surface-1 behind it |

**Anti-Patterns:**

| Anti-Pattern | Why |
|--------------|-----|
| Card inside card | Visual nesting confusion; use flat variant instead |
| Glass card with no background behind | Glass becomes invisible |
| Multiple interactive elements without clear hierarchy | Users confused about primary action |
| Card without heading | No semantic structure, poor scannability |
| Truncated content without "Read more" | Content hidden without affordance |

#### 4.1.3 Input

**Purpose:** Text input for forms, search, and data entry. Foundation for all text-based form controls.

**Variants:**

| Variant | Purpose | Border | Background | Label Position |
|---------|---------|--------|------------|----------------|
| default | Standard form input | border-primary | surface-primary | Top (default) |
| illed | Dense UI, toolbars | none | surface-elevated | Floating |
| glass | Hero sections | glass-border | glass-bg | Top |
| underline | Inline editing | bottom border only | transparent | Left or none |

**Sizes:**

| Size | Height | Padding X | Font Size | Gap to Label |
|------|--------|-----------|-----------|-------------|
| sm | 36px | 12px | 13px | 4px |
| md (default) | 40px | 14px | 14px | 6px |
| lg | 48px | 16px | 15px | 8px |

**States:**

| State | Border | Background | Label | Icon |
|-------|--------|------------|-------|------|
| Default | border-primary | surface-primary | text-secondary | text-tertiary |
| Hover | border-accent | surface-elevated | text-primary | text-secondary |
| Focus | accent-500 (2px) | surface-secondary | accent-500 | accent-500 |
| Filled | border-accent | surface-primary | text-primary | text-secondary |
| Error | semantic-error (2px) | error-bg | semantic-error | semantic-error |
| Disabled | border-primary (50% opacity) | surface-primary (50% opacity) | text-tertiary | text-tertiary |
| Read-only | border-primary (dashed) | transparent | text-secondary | text-tertiary |
| Success | semantic-success (2px) | success-bg | semantic-success | semantic-success |

**Sub-components:**

| Sub-component | Tag | Purpose |
|--------------|-----|---------|
| Input.Label | <label> | Input label (for/id linking) |
| Input.IconLeft | <div> | Left icon (search, currency) |
| Input.IconRight | <button> | Right icon (password toggle, clear) |
| Input.HelperText | <p> | Helper text below input |
| Input.ErrorText | <p> | Error message below input |
| Input.Counter | <p> | Character counter |

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| Label | <label> with htmlFor connecting to <input id> |
| Error | ria-invalid="true" + ria-describedby linking to error message |
| Required | equired attribute + ria-required="true" |
| Description | ria-describedby for helper text |
| Autocomplete | utocomplete attribute for passwords, email, etc. |
| Programmatic focus | utoFocus prop with useEffect ref |
| Screen reader | Error announces via ole="alert" or ria-live="polite" |
| Touch target | Label is clickable and extends tap area |

**Interactions:**

| Action | Behavior | Duration |
|--------|----------|----------|
| Focus | Border transitions to accent-500, shadow-accent-focus appears | 200ms |
| Blur (valid) | Returns to default state | 200ms |
| Blur (invalid) | Transitions to error state | 200ms |
| Clear (type="search") | Clear button appears when value present | 100ms |
| Password toggle | Icon changes eye/eye-off | 100ms |
| Character counter | Updates as user types | instant |

**Animations:**

| Animation | Trigger | Duration | Easing |
|-----------|---------|----------|--------|
| Border color + width | focus/blur | 200ms | ease-default |
| Label float (filled) | focus/value | 200ms | ease-default |
| Error shake | validation fail | 300ms | ease-spring |
| Helper text swap | validation | 150ms | ease-default |

**Usage Rules:**

| Rule | Explanation |
|------|-------------|
| Always label inputs | Placeholder is not a label (WCAG 2.4.6) |
| Show error inline | Error message appears below the input, not in a toast |
| Max length with counter | Show counter when maxLength is set |
| Input mode for number | Use inputMode="decimal" not 	ype="number" for numeric |
| Autofill style supported | :-webkit-autofill styled with accent background |
| Search input has clear | 	ype="search" always includes clear button |
| Password has toggle | Users must be able to see password |

**Anti-Patterns:**

| Anti-Pattern | Why |
|--------------|-----|
| Placeholder as label | Disappears on input, fails WCAG |
| Error on blur only | Not all users tab through fields |
| Multiple errors shown at once | Overwhelming; show first error |
| Input without visible border | Confusing for keyboard users |
| Disabled input without explanation | Users don't know why it's disabled |
| Using value as label | Label must be static and always visible |

---

#### 4.1.4 Toggle (Switch)

**Purpose:** Binary on/off control for settings. Preferred over checkbox for settings UI.

**Variants:**

| Variant | Purpose |
|---------|---------|
| default | Standard toggle |
| with-label | Toggle with left/right label |
| colorful | Toggle with branded fill when on |

**Sizes:**

| Size | Width | Height | Knob Size |
|------|-------|--------|-----------|
| sm | 36px | 20px | 16px |
| md (default) | 44px | 24px | 20px |
| lg | 52px | 28px | 24px |

**States:**

| State | Track (On) | Track (Off) | Knob | Label |
|-------|-----------|-------------|------|-------|
| Default | accent-500 | surface-elevated | white | text-primary |
| Hover | accent-600 | border-accent | white | text-primary |
| Focus | accent-500 + shadow-accent-focus | border-accent + focus-ring | white | text-primary |
| Disabled | accent-300 | surface-elevated | gray-300 | text-tertiary |
| Loading | accent-500 (pulsing) | surface-elevated | white (pulsing) | text-secondary |

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| Role | ole="switch" with ria-checked |
| Label | ria-labelledby or <label> wrapping |
| Keyboard | Space to toggle, Enter to toggle |
| Screen reader | Announces "On/Off" state change |
| Touch target | Minimum 44x44px active area |

**Interactions:**

| Action | Behavior | Duration |
|--------|----------|----------|
| Click | Toggle state with knob animation | 200ms |
| Keyboard (Space/Enter) | Toggle state | 200ms |
| Drag (touch) | Knob follows finger, snaps to closest | 200ms |

**Animations:**

| Animation | Trigger | Duration | Easing |
|-----------|---------|----------|--------|
| Knob slide | toggle | 200ms | ease-spring |
| Track color | toggle | 200ms | ease-default |
| Pulse (loading) | isloading | 1s loop | ease-in-out |

#### 4.1.5 Badge

**Purpose:** Small label for counts, status indicators, and categorization tags.

**Variants:**

| Variant | Background | Text Color | Border | Usage |
|---------|-----------|-----------|--------|-------|
| default | accent-100 | accent-700 | none | General count |
| success | success-bg | semantic-success | none | "Active", "Completed" |
| warning | warning-bg | semantic-warning | none | "Pending", "In review" |
| error | error-bg | semantic-error | none | "Failed", "Rejected" |
| info | info-bg | semantic-info | none | "New", "Updated" |
| 
eutral | surface-elevated | text-secondary | none | Generic labels |
| outline | transparent | text-primary | border-primary | Tags, categories |

**Sizes:**

| Size | Height | Padding | Font Size | Dot Size |
|------|--------|---------|-----------|----------|
| sm | 20px | 6px 8px | 11px | 6px |
| md (default) | 24px | 8px 10px | 12px | 8px |
| lg | 28px | 10px 12px | 13px | 10px |

**States:**

| State | Change |
|-------|--------|
| Default | As described in variants |
| Dismissible | Shows ? icon, onClick dismisses |
| Interactive | Hover: opacity-80, cursor pointer |

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| Screen reader | ria-label for dismissible; semantic color not sole label |
| Count badges | ria-label="3 unread notifications" |
| Status badges | Text label identifies status, not just color |

**Usage Rules:**

| Rule | Explanation |
|------|-------------|
| Dot badge for presence | dot prop shows small colored dot |
| Max character count | "99+" for counts; no truncation for labels |
| Dismissible only for interactive | Static badges cannot be dismissed |
| Color not sole indicator | Always include text (WCAG 1.4.1) |

#### 4.1.6 Avatar

**Purpose:** User profile photo or initials placeholder.

**Variants:**

| Variant | Display | Source |
|---------|---------|--------|
| image | <img> | src prop |
| initials | Text initials | irstName + lastName |
| icon | Icon | icon prop (fallback) |
| placeholder | Generic icon | No data provided |

**Sizes:**

| Size | Dimension | Font Size | Icon Size |
|------|-----------|-----------|-----------|
| xs | 24px | 10px | 14px |
| sm | 32px | 12px | 16px |
| md (default) | 40px | 14px | 20px |
| lg | 56px | 18px | 28px |
| xl | 80px | 24px | 36px |

**States:**

| State | Behavior |
|-------|----------|
| Default | Shows image, initials, or placeholder |
| Hover (interactive) | Opacity-90, cursor pointer |
| Active | Scale 0.95 |
| Image error | Falls back to initials, then to placeholder |
| Loading | Skeleton pulse while image loads |

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| ALT text | lt="User name" for image avatars |
| Role | ole="img" with ria-label |
| Group | Avatars in list use <li> with <ul> |

#### 4.1.7 Skeleton

**Purpose:** Content placeholder during loading. Shows structure before content arrives.

**Variants:**

| Variant | Shape | Width | Height |
|---------|-------|-------|--------|
| 	ext | Block | 100% | 16px (line height) |
| 	itle | Block | 60% | 28px |
| circle | Circle | 40px (or size) | Same as width |
| card | Card frame | 100% | 200px |
| custom | Custom | As defined | As defined |

**States:**

| State | Animation |
|-------|-----------|
| Loading | Shimmer animation (base ? highlight ? base) |
| Loaded | Fade out with 200ms transition |
| Error | Replace with error state component |
| Empty | Replace with empty state component |

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| ARIA | ria-busy="true" on parent container |
| Reduced motion | Pulsing shimmer becomes opacity-only flash |
| Content hidden | Use ria-hidden="true" on skeleton elements |

**Usage Rules:**

| Rule | Explanation |
|------|-------------|
| Match content shape | Skeleton dimensions should mirror final content |
| Animate entrance | Fade in skeleton when data fetching starts |
| Never show for cached data | Use isPlaceholderData to determine visibility |
| Group related skeletons | Use layout delay for staggered entrance |

#### 4.1.8 Tooltip

**Purpose:** Contextual label on hover or focus. Provides additional info without cluttering UI.

**Variants:**

| Variant | Position | Purpose |
|---------|----------|---------|
| 	op | Above element | Default |
| ottom | Below element | Space constraints |
| left | Left of element | Space constraints |
| ight | Right of element | Space constraints |

**States:**

| State | Behavior |
|-------|----------|
| Idle | Hidden |
| Hover | Show after 500ms delay (desktop only) |
| Focus | Show immediately (keyboard users) |
| Touch | Show on first tap (mobile) |
| Visible | Auto-hide after 3 seconds |

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| ARIA | ria-describedby on trigger element |
| Dismiss | Press Escape to dismiss |
| Screen reader | Announce on show via ole="tooltip" |
| Keyboard | Focus on trigger shows tooltip |
| Touch | Tap outside or second tap to dismiss |

**Usage Rules:**

| Rule | Explanation |
|------|-------------|
| Tooltip for description only | Not for critical information |
| Max 2 lines | Long content goes in a popover or help text |
| No interactive tooltips | Tooltips are read-only; use Popover for interaction |
| Delay on hover | 500ms delay prevents flicker |
| Trigger always focusable | Tooltip triggers must be keyboard accessible |

### 4.2 Navigation Components

---

#### 4.2.1 Navbar

**Purpose:** Top-level site navigation with responsive mobile menu.

**Variants:**

| Variant | Background | Position | Blur | Usage |
|---------|-----------|----------|------|-------|
| default | surface-primary | static | none | Standard pages |
| sticky | surface-primary | sticky top-0 | none | Content pages |
| glass | glass-bg | fixed top-0 | --glass-blur | Hero sections |
| 	ransparent | transparent | absolute top-0 | none | Over hero |

**Breakpoints:**

| State | Desktop (=1024px) | Mobile (<1024px) |
|-------|-------------------|-------------------|
| Layout | Horizontal links | Hamburger menu |
| Logo | Full logo | Icon logo |
| Nav items | Visible inline | Slide-in drawer |
| CTAs | Visible inline | In drawer top |

**Sub-components:**

| Sub-component | Purpose |
|--------------|---------|
| Navbar.Logo | Site logo, links to / |
| Navbar.Nav | Navigation link list |
| Navbar.Link | Individual nav link |
| Navbar.Actions | CTA buttons, theme toggle |
| Navbar.MobileMenu | Slide-in drawer |

**States:**

| State | Desktop | Mobile |
|-------|---------|--------|
| Active link | accent-500 text, underline | accent background |
| Hover | opacity-80 | N/A |
| Scrolled (sticky) | shadow-sm added | shadow-sm added |
| Menu open | N/A | Drawer slides in |
| Over hero | transparent ? sticky on scroll | Same |

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| Semantic | <nav> with ria-label="Main navigation" |
| Mobile | Hamburger has ria-expanded, ria-controls |
| Skip link | First focusable element: skip to main content |
| Current page | ria-current="page" on active link |
| Focus trap | Mobile menu traps focus when open |

**Animations:**

| Animation | Trigger | Duration | Easing |
|-----------|---------|----------|--------|
| Background opacity | scroll | � | linear |
| Mobile menu slide | toggle | 300ms | ease-out |
| Link underline | hover (desktop) | 200ms | ease-default |

---

#### 4.2.2 Tabs

**Purpose:** Content organization in panels. Switches between views without page navigation.

**Variants:**

| Variant | Style | Indicator | Usage |
|---------|-------|-----------|-------|
| underline | Text only | Bottom border | Section navigation |
| pills | Background | Filled bg | Filter-style tabs |
| segmented | Button group | Active fill | Toggle between 2-4 options |

**Sizes:**

| Size | Height | Font Size | Padding |
|------|--------|-----------|---------|
| sm | 32px | 13px | 8px 12px |
| md (default) | 40px | 14px | 12px 16px |
| lg | 48px | 15px | 16px 20px |

**States:**

| State | Underline | Pills | Segmented |
|-------|-----------|-------|-----------|
| Active | accent-500 border, accent text | accent-500 bg, white text | accent-500 bg, white text |
| Inactive | transparent border, text-secondary | transparent, text-secondary | transparent, text-secondary |
| Hover (inactive) | border-accent, text-primary | accent-50 bg, accent-600 text | accent-50 bg, accent-600 text |
| Disabled | text-tertiary, cursor-not-allowed | text-tertiary | text-tertiary |

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| Role | ole="tablist" ? ole="tab" ? ole="tabpanel" |
| Keyboard | Left/Right arrow navigation, Home/End |
| ARIA | ria-selected, ria-controls, ria-labelledby |
| Focus | Focus ring on active tab only |

**Animations:**

| Animation | Trigger | Duration | Easing |
|-----------|---------|----------|--------|
| Indicator slide (underline) | tab change | 300ms | ease-default |
| Content fade | tab change | 200ms | ease-default |
| Pill color | tab change | 200ms | ease-default |

---

#### 4.2.3 Breadcrumbs

**Purpose:** Secondary navigation showing page hierarchy.

**Variants:**

| Variant | Separator | Collapse | Usage |
|---------|-----------|----------|-------|
| default | / | Never | Standard |
| collapsed | � | At 4+ items | Deep nesting |
| icon | � | Never | With icons |

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| Role | 
av with ria-label="Breadcrumbs" |
| Structure | <ol> with <li> items |
| Current | ria-current="page" on last item |
| Screen reader | Visually hidden "Back to " prefix for screen readers |

### 4.3 Input Components

---

#### 4.3.1 Select

**Purpose:** Dropdown menu for selecting from multiple options.

**Variants:**

| Variant | Style | Usage |
|---------|-------|-------|
| default | Standard dropdown | Single select |
| 
ative | Browser native <select> | Large option lists (50+) |
| multi | Checkbox list | Multiple select |

**States:** Same as Input component (default, hover, focus, error, disabled).

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| Combobox | ole="combobox" with ria-expanded |
| Listbox | ole="listbox" with ria-multiselectable |
| Search | Type to filter in large option sets |
| Selected | ria-selected="true" on option |

#### 4.3.2 Checkbox

**Purpose:** Binary selection, multi-select in forms.

**Variants:**

| Variant | Visual | Usage |
|---------|--------|-------|
| default | Square box | Forms |
| card | Card-style | Selection lists |
| switch | Toggle-like | Settings (use Toggle instead) |

**States:**

| State | Box | Check | Label |
|-------|-----|-------|-------|
| Unchecked | border-primary | � | text-primary |
| Checked | accent-500 bg | White check | text-primary |
| Indeterminate | accent-500 bg | White dash | text-primary |
| Error unchecked | semantic-error border | � | semantic-error |
| Disabled | opacity-50 | opacity-40 | text-tertiary |

#### 4.3.3 Radio Group

**Purpose:** Single selection from mutually exclusive options.

**States:** Default, selected, hover, focus, error, disabled.

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| Role | ole="radiogroup" with ria-labelledby |
| Radio | ole="radio" with ria-checked |
| Keyboard | Up/Down to navigate, Space to select |

#### 4.3.4 Textarea

**Purpose:** Multi-line text input. Extends Input patterns with auto-resize.

**Variants:** default, illed, glass (matching Input).

**Sizes:** sm (3 rows), md (5 rows, default), lg (8 rows).

**States:** Same as Input + character counter, resize handle.

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| Label | <label> with htmlFor |
| Resize | esize: vertical only (maintains layout) |
| Auto-resize | JS-driven height change up to max 400px |

#### 4.3.5 Date Picker

**Purpose:** Date selection with calendar UI.

**States:** Default, hover, selected, range, disabled, today, focused.

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| Role | ole="dialog" with ria-label="Date picker" |
| Grid | ole="grid" for calendar days |
| Keyboard | Arrow keys, Enter to select, Escape to close |
| Screen reader | Announced selected date in full format |

#### 4.3.6 File Upload / Dropzone

**Purpose:** File selection with drag-and-drop support.

**States:**

| State | Visual | Behavior |
|-------|--------|----------|
| Empty | Dashed border, upload icon | Click or drag files |
| Drag over | accent-500 border, accent-50 bg | visual feedback |
| Uploading | Progress bar | Disable interaction |
| Success | File icon + name + size | Show remove button |
| Error | Red border + error message | Allow retry |
| Too many files | Red border + max count message | Blocked |

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| Input | Hidden <input type="file"> triggered by button |
| Keyboard | Enter/Space to activate file dialog |
| Drop zone | ria-label="File upload area" |
| Progress | ole="progressbar" with ria-valuenow |
| Error | ole="alert" for upload failures |

### 4.4 Feedback Components

---

#### 4.4.1 Toast / Notification

**Purpose:** Non-blocking feedback for operations. Disappears automatically.

**Variants:**

| Variant | Icon | Background | Border | Duration | Usage |
|---------|------|-----------|--------|----------|-------|
| success | CheckCircle | success-bg | semantic-success | 4s | Operation complete |
| error | XCircle | error-bg | semantic-error | 8s | Operation failed |
| warning | AlertTriangle | warning-bg | semantic-warning | 6s | Warning |
| info | Info | info-bg | semantic-info | 5s | Information |
| loading | Spinner | surface-elevated | border-primary | Until done | In-progress |

**Positions:**

| Position | CSS | Usage |
|----------|-----|-------|
| 	op-right (default) | top-4 right-4 | Desktop default |
| 	op-left | top-4 left-4 | Alternative |
| ottom-right | bottom-4 right-4 | Mobile default |
| ottom-center | bottom-4 left-1/2 -translate-x-1/2 | Mobile alternative |

**Sub-components:**

| Sub-component | Purpose |
|--------------|---------|
| Toast.Icon | Semantic icon |
| Toast.Title | Bold title (optional) |
| Toast.Description | Body text |
| Toast.Close | Dismiss button |
| Toast.Action | CTA (optional, max 1) |

**States:**

| State | Behavior |
|-------|----------|
| Enter | Slide in from edge + fade in |
| Visible | Countdown timer, pause on hover |
| Dismiss | Fade out + slide out |
| Stack | Max 5 visible, older toasts pushed up |
| Action | Click action executes, toast remains (if needed) |

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| Live region | ole="status" with ria-live="polite" |
| Error | ole="alert" for error toasts |
| Dismiss | Escape key, close button, or timeout |
| Focus | Does NOT steal focus (role="status" vs "alertdialog") |
| Screen reader | Announces title + description |

---

#### 4.4.2 Modal / Dialog

**Purpose:** Blocking interaction requiring user attention or decision.

**Variants:**

| Variant | Size | Backdrop | Dismiss | Usage |
|---------|------|----------|---------|-------|
| lert | 400px | scrim-medium | No (button required) | Confirm, warning |
| dialog | 560px | scrim-medium | Yes (X + Escape) | Forms, details |
| ullscreen | 100vw x 100vh | none | Yes | Images, video |
| sheet | 400px (side) | scrim-medium | Yes (swipe + Escape) | Drawer actions |

**Sub-components:**

| Sub-component | Purpose |
|--------------|---------|
| Modal.Backdrop | Scrim overlay |
| Modal.Header | Title + close button |
| Modal.Body | Content area (scrollable) |
| Modal.Footer | Action buttons |
| Modal.Close | Close button (x) |

**States:**

| State | Behavior |
|-------|----------|
| Open | scale-in animation, backdrop fades in |
| Focus | Focus trapped inside modal (first focusable element) |
| Close | Scale-out, Escape key, backdrop click (if dismissable) |
| Long content | Body scrolls, backdrop stays fixed |

**Sizes:**

| Size | Width | Top Margin | Border Radius |
|------|-------|-----------|---------------|
| sm (alert) | 400px | 20vh | radius-xl |
| md (dialog) | 560px | 12vh | radius-xl |
| lg | 720px | 8vh | radius-lg |
| xl | 960px | 4vh | radius-lg |

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| Role | ole="dialog" with ria-modal="true" |
| Label | ria-labelledby on header |
| Description | ria-describedby on body |
| Focus trap | 	abindex cycle � Tab cycles within modal |
| Keyboard | Escape to close (if dismissable) |
| Body scroll | overflow: hidden on <body> when open |

---

#### 4.4.3 Alert / Banner

**Purpose:** Inline feedback at page or section level. Persistent until dismissed.

**Variants:** info, success, warning, error (matching semantic colors).

**States:**

| State | Behavior |
|-------|----------|
| Visible | Shows with icon, message, optional close button |
| Dismissed | Slides up, removed from DOM |
| Collapsible | Can be minimized to single line |
| Dismissible | Has close button |

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| Role | ole="alert" for error, ole="status" for others |
| Icon | Decorative (alt="") � text is the message |
| Dismiss | Focus moves to next logical element after dismiss |

---

#### 4.4.4 Progress Bar

**Purpose:** Shows completion progress for operations.

**Variants:**

| Variant | Style | Usage |
|---------|-------|-------|
| determinate | Filled bar | Known percentage |
| indeterminate | Animated stripe | Unknown duration |
| segmented | Multi-section | Multi-step process |

**States:**

| State | Visual |
|-------|--------|
| 0% | Empty track |
| In progress | Bar animates to percentage |
| Complete | 100% filled, optional checkmark |
| Error | Bar turns red at current position |
| Loading (indeterminate) | Stripe animates across track |

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| Role | ole="progressbar" with ria-valuenow, ria-valuemin="0", ria-valuemax="100" |
| Label | ria-label describing what is progressing |

#### 4.4.5 Spinner

**Purpose:** Indicates loading state for operations.

**Variants:**

| Variant | Visual | Usage |
|---------|--------|-------|
| circle | Rotating circle | General loading |
| dots | Bouncing dots | Content loading |
| pulse | Pulsing circle | Background operations |

**Sizes:** sm (16px), md (24px), lg (36px), xl (48px)

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| ARIA | ria-label="Loading" with ole="status" |
| Announce | ria-live="polite" with "Loading complete" on finish |
| Reduced motion | Slowed rotation speed (2s instead of 1s) |

### 4.5 Data Display Components

---

#### 4.5.1 Table

**Purpose:** Structured data display with sort, filter, pagination.

**Variants:**

| Variant | Style | Usage |
|---------|-------|-------|
| default | Bordered | Standard data |
| striped | Alternating row colors | Readability for wide tables |
| compact | Narrow padding | Dense data display |
| card | Card-style rows | Mobile-friendly |

**Sub-components:**

| Sub-component | Purpose |
|--------------|---------|
| Table.Header | Column headers |
| Table.Body | Data rows |
| Table.Row | Single data row |
| Table.Cell | Data cell |
| Table.SortHeader | Sortable column header |
| Table.Pagination | Page controls |

**States:**

| State | Visual |
|-------|--------|
| Default | Alternating or solid rows |
| Hover (row) | accent-50 bg |
| Selected (row) | accent-100 bg, accent-500 left border |
| Sorted column | accent-500 header, sort icon |
| Empty | Centered "No data" state |
| Loading | Skeleton rows |
| Expanded | Detail row below |

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| Semantic | <table>, <thead>, <tbody>, <tr>, <th>, <td> |
| Scope | <th scope="col"> for columns, <th scope="row"> for rows |
| Sort | ria-sort="ascending" / "descending" / "none" |
| Caption | <caption> for table description |
| Scroll | Horizontal scroll on overflow (not horizontal overflow hidden) |
| Row selection | ria-selected on selected rows |

#### 4.5.2 List

**Purpose:** Vertical list of items with optional icons, avatars, actions.

**Variants:** default, ordered (numbered), card (card-style items), compact.

**Sub-components:**

| Sub-component | Purpose |
|--------------|---------|
| List.Item | Single list item |
| List.Icon | Leading icon/avatar |
| List.Content | Title + description |
| List.Action | Trailing action (button, link) |

#### 4.5.3 Accordion

**Purpose:** Collapsible content sections. Saves vertical space.

**Variants:** default (single expand), multiple (multiple open), ordered (visible borders).

**States:**

| State | Header | Content |
|-------|--------|---------|
| Collapsed | text-primary, chevron right | max-height 0, hidden |
| Expanded | text-primary, chevron down | max-height auto, visible |
| Hover | accent-50 bg | N/A |
| Disabled | text-tertiary, no arrow | Always collapsed |

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| Role | ole="heading" on header |
| Button | <button> with ria-expanded, ria-controls |
| Panel | ole="region" with ria-labelledby linking to button |

#### 4.5.4 Tag / Chip

**Purpose:** Compact label for metadata, filtering, and categorization.

**Variants:** default, emovable, clickable, disabled.

**States:**

| State | Visual |
|-------|--------|
| Default | surface-elevated bg, text-secondary |
| Hover (clickable) | accent-50 bg |
| Selected | accent-100 bg, accent-600 text |
| Removable | Shows ? icon |
| Removable hover | ? icon becomes accent color |

#### 4.5.5 Carousel

**Purpose:** Horizontal scrolling content showcase.

**Variants:** cards (card snap), hero (full-width), 	estimonials (center-peek).

**States:**

| State | Behavior |
|-------|----------|
| Idle | Auto-play (configurable interval) |
| Dragging | Snap disabled, free scroll |
| Snapped | Centered on nearest item |
| Edge | First/last item shows gradient fade |
| Paused | On hover, focus, or reduced motion |
| Keyboard | Arrow keys to navigate |
| Touch | Swipe to navigate |

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| ARIA | ria-roledescription="carousel", ria-label |
| Live | ria-live="polite" updates slide number |
| Controls | ria-controls on prev/next buttons |
| Pause | Pause on focus/hover, ria-live on pause state |
| Items | ole="group" with ria-roledescription="slide", ria-label="Slide X of Y" |

#### 4.5.6 Timeline

**Purpose:** Chronological display of events.

**Variants:** default (vertical), horizontal (horizontal), compact.

**States:**

| State | Visual |
|-------|--------|
| Past | Filled dot, full opacity text |
| Present | Accent dot with glow |
| Future | Outline dot, muted text |
| Interactive | Clickable timeline entries |

#### 4.5.7 Stat Card

**Purpose:** Display a single metric with label and optional trend.

**Variants:** default, 	rending-up, 	rending-down, minimal.

**Sub-components:**

| Sub-component | Purpose |
|--------------|---------|
| StatCard.Value | Large numeric value |
| StatCard.Label | Metric label |
| StatCard.Icon | Leading icon |
| StatCard.Trend | Change indicator (+N%, -N%) |
| StatCard.Footer | Contextual text |

#### 4.5.8 Avatar Group

**Purpose:** Stacked avatars showing multiple users.

**Overlap:** Each avatar overlaps next by 25% (xs: 8px, md: 12px, lg: 16px).
**Count:** Max 5 visible, then "+N" overflow indicator.
**Tooltip:** Hover shows tooltip with full name.
**Animation:** Hover on group expands individual avatars.

### 4.6 AI Components

---

#### 4.6.1 AI Chat

**Purpose:** Conversational interface for AI assistant interactions.

**Variants:**

| Variant | Purpose | Input | Context |
|---------|---------|-------|---------|
| ull | Full chat page | Resizable textarea | Full history |
| inline | Contextual chat | Compact input | Current context only |
| overlay | Floating chat button | Slide-up panel | Current session |

**Sub-components:**

| Sub-component | Purpose |
|--------------|---------|
| Chat.Header | Assistant name, model info, clear |
| Chat.Messages | Scrollable message list |
| Chat.Message | Single message (user or AI) |
| Chat.Input | Text input with send button |
| Chat.Typing | "AI is typing..." indicator |
| Chat.Suggestions | Quick action chips |

**States:**

| State | User Message | AI Message |
|-------|-------------|------------|
| Sent | User avatar + bubble, right-aligned | � |
| Received | � | AI avatar + bubble, left-aligned |
| Typing | � | Bouncing dots animation |
| Error | � | Red bubble + retry button |
| Loading | Disabled input | Skeleton for response |

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| Live region | ria-live="polite" on message area |
| Input | <textarea> with Enter to send |
| Markdown | Rendered with ole="document" |
| Code blocks | ole="region" with ria-label="Code block" |
| Copy button | ria-label="Copy code" |

#### 4.6.2 AI Suggestion

**Purpose:** Contextual AI suggestions for content, code, or actions.

**Variants:** inline (appear in text), popover (suggestion list), sidebar (full suggestions panel).

**States:**

| State | Visual |
|-------|--------|
| Available | Accent ghost button "? Suggest" |
| Loading | Skeleton cards |
| Ready | Card with suggestion + Apply/Dismiss |
| Applied | Green check + "Applied" |
| Dismissed | Animation out |
| Error | Error state with retry |

#### 4.6.3 AI Status Indicator

**Purpose:** Shows AI system status (online, training, offline).

**Variants:** dot (small dot), adge (with text), ull (detail panel).

**States:** online (green), 	raining (yellow, pulsing), offline (red), error (red with icon).

#### 4.6.4 Model Selector

**Purpose:** Choose between available AI models.

**Variants:** dropdown (simple), card (detailed), 	abs (quick switch).

**States:** Checked (current model), hover (preview), disabled (unauthorized), loading (fetching models).

### 4.7 Admin Components

---

#### 4.7.1 Sidebar

**Purpose:** Persistent navigation panel for admin and dashboard views.

**Variants:**

| Variant | Width Open | Width Collapsed | Usage |
|---------|-----------|-----------------|-------|
| default | 280px | 64px | Standard admin |
| compact | 240px | 56px | Dense admin |
| loating | 280px | 0px (hidden) | Slide-over admin |

**Sub-components:**

| Sub-component | Purpose |
|--------------|---------|
| Sidebar.Header | Logo + app name |
| Sidebar.Nav | Navigation items |
| Sidebar.Item | Single nav item |
| Sidebar.Group | Group label + items |
| Sidebar.Footer | User menu, settings |

**States:**

| State | Behavior |
|-------|----------|
| Open | Full width, labels visible |
| Collapsed | Icons only, labels on hover tooltip |
| Hover (item) | accent-50 bg, accent-500 text |
| Active (item) | accent-100 bg, accent-600 text, left border |
| Expandable group | Chevron rotates, children slide down |
| Mobile overlay | Overlay scrim, close on backdrop click |

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| Navigation | <nav> with ria-label="Admin sidebar" |
| Collapsed | ria-expanded on toggle button |
| Current page | ria-current="page" on active item |
| Keyboard | Tab to navigate, Enter to activate |

#### 4.7.2 Data Table (Advanced)

**Purpose:** Enterprise-grade data table with all features.

**Features:** Sort multi-column, filter (column + global), search, pagination, row selection (single + multi), column resize, column reorder, row expand, inline edit, export (CSV/Excel), print.

**Sub-components:**

| Sub-component | Purpose |
|--------------|---------|
| DataTable.Toolbar | Search, filters, export, actions |
| DataTable.Filters | Active filter badges |
| DataTable.ColumnHeader | Sortable, resizable header |
| DataTable.Row | Selectable, expandable row |
| DataTable.Pagination | Page navigation + page size |

**States:** loading (skeleton), empty (no data), filtered (empty results), error (fetch failed), selected (rows selected).

#### 4.7.3 Empty State

**Purpose:** Shows when no data is available, with guidance.

**Sub-components:** Icon, Title, Description, Action Button.

**States:** no-data, no-results, error, onboarding.

#### 4.7.4 Activity Log

**Purpose:** Chronological audit trail of user actions.

**Variants:** 	imeline (visual), 	able (compact), eed (detailed).

**Features:** Filter by action type, date range, user; expand for details.

#### 4.7.5 User Menu

**Purpose:** Account and session management dropdown.

**Variants:** vatar (avatar trigger), 
ame (name trigger), ull (avatar + name).

**Items:** Profile, Settings, Billing, Theme, Help, Sign Out.

**States:** Open (dropdown visible), closed (hidden).

### 4.8 Charts & Visualization Components

---

#### 4.8.1 Chart Base

**Purpose:** Foundation for all chart variants.

**Variants:**

| Variant | Library | Usage |
|---------|---------|-------|
| rea | recharts | Trends over time |
| ar | recharts | Categorical comparison |
| line | recharts | Continuous data series |
| pie | recharts | Proportion composition |
| donut | recharts | Proportion with center value |
| adar | recharts | Multi-metric comparison |
| scatter | recharts | Distribution / correlation |

**States:**

| State | Implementation |
|-------|---------------|
| Loading | Skeleton chart frame |
| Empty | "No data" overlay |
| Error | Error state with retry |
| Interactive | Hover tooltip, click drill-down |
| Animated | Entry animation on first render |

**Accessibility:**

| Criterion | Implementation |
|-----------|---------------|
| Text fallback | Data represented in <table> below chart |
| Labels | ria-label on SVG with data summary |
| Patterns | Patterns + colors for differentiation (not color alone) |
| Focus | Interactive chart elements focusable |
| Reduced motion | Disable entry animations |

#### 4.8.2 Chart Components

| Component | Purpose |
|-----------|---------|
| Chart.Tooltip | Data point details on hover |
| Chart.Legend | Series labels with color indicators |
| Chart.Axis | Axis labels, ticks, grid lines |
| Chart.Grid | Reference grid lines |
| Chart.Annotation | Highlighted data point or region |
| Chart.Threshold | Goal line / target line |

#### 4.8.3 Mini Chart / Sparkline

**Purpose:** Compact trend visualization for cards and tables.

**Variants:** line (simple), rea (filled), ar (compact bars).
**Sizing:** 120x32px (default), 200x48px (lg).

#### 4.8.4 Gauge

**Purpose:** Progress toward a target / KPI visualization.

**Variants:** semicircle (180�), circle (360�), linear (horizontal bar).

**States:** below-target (red), near-target (yellow), at-target (green), exceeded (blue).

### 4.9 Dashboard Components

---

#### 4.9.1 Dashboard Grid

**Purpose:** Responsive grid layout for dashboard widgets.

**Features:** Drag-to-reorder, resize, add/remove widgets, persist layout.

**Breakpoints:**

| Viewport | Columns | Widget Min Width |
|----------|---------|------------------|
| < 768px | 1 | 100% |
| 768-1024px | 2 | 320px |
| 1024-1280px | 3 | 320px |
| > 1280px | 4 | 280px |

#### 4.9.2 Widget

**Purpose:** Single dashboard content block.

**Sub-components:** Widget.Header (title + actions), Widget.Body (content), Widget.Footer (metadata).

#### 4.9.3 Metric Comparison

**Purpose:** Side-by-side metric comparison.

**Features:** Current vs Previous, Absolute change, Percentage change, Trend indicator (up/down/flat).

**States:** loading, loaded, no-previous-data, error.

#### 4.9.4 Activity Feed

**Purpose:** Real-time update stream for dashboard.

**Variants:** compact (dot + text), detailed (avatar + text + timestamp), grouped (grouped by time).

**Features:** Auto-scroll to top on new item, "N new items" badge, pause on hover.

#### 4.9.5 Quick Actions

**Purpose:** Frequently-used actions accessible from dashboard.

**Features:** Icon + label grid, recent actions shown first, max 4-6 actions.

## 5. API & Integration Standards

### 5.1 Component API Pattern

Every component follows this TypeScript pattern:

`	ypescript
interface ComponentProps extends React.HTMLAttributes<HTMLElement> {
  /** Visual variant � maps to Tailwind variant classes */
  variant?: 'default' | 'primary' | 'secondary';
  /** Size scale � maps to Tailwind size classes */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes � merged via cn() utility */
  className?: string;
  /** Children content */
  children?: React.ReactNode;
}
`

### 5.2 Props Standard

| Rule | Description |
|------|-------------|
| **Semantic HTML** | Components extend native HTML attributes (Button ? <button>, Input ? <input>) |
| **forwardRef** | All interactive components forward ref to their root DOM element |
| **className merge** | Custom cn() utility merges Tailwind classes, resolving conflicts |
| **Variants** | String union types, never booleans for visual variants |
| **Sizes** | String union types, using the 'sm' | 'md' | 'lg' convention |
| **Children** | ReactNode for flexible content, or props for structured content |
| **Event handlers** | Standard onEventName naming (onClick, onChange, onSubmit) |
| **Controlled/Uncontrolled** | Components support both where applicable (Input, Toggle, Select) |

### 5.3 cn() Utility

`	ypescript
// packages/ui/src/utils/cn.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`

### 5.4 Export Architecture

`
packages/ui/src/
+-- index.ts              # Barrel exports
+-- utils/
�   +-- cn.ts             # Class merge utility
�   +-- variants.ts       # CVA variant definitions
+-- Button.tsx            # Individual component
+-- Card.tsx
+-- ...
`

### 5.5 File Organization

| Rule | Description |
|------|-------------|
| One component per file | Single source file per component |
| Named exports | export function Button(...) not export default |
| Co-located types | Props interface in same file, exported |
| Co-located sub-components | Card.Header in Card.tsx |
| Stories | .stories.tsx alongside component (future) |
| Tests | .test.tsx alongside component |

## 6. Accessibility Compliance Matrix

| WCAG Criterion | Level | Status | Implementation |
|---------------|-------|--------|----------------|
| 1.1.1 Non-text Content | A | ? | All icons have alt/aria-label; decorative ? ria-hidden |
| 1.3.1 Info and Relationships | A | ? | Semantic HTML, ARIA landmarks |
| 1.3.2 Meaningful Sequence | A | ? | DOM order matches visual order |
| 1.4.1 Use of Color | A | ? | Color never sole indicator; icons + text accompany |
| 1.4.3 Contrast (Text) | AA | ? | Minimum 4.5:1 body, 3:1 large text |
| 1.4.4 Resize Text | AA | ? | rem/em units, 200% zoom no overflow |
| 1.4.10 Reflow | AA | ? | No horizontal scroll at 320px |
| 1.4.11 Non-text Contrast | AA | ? | 3:1 minimum for UI components |
| 1.4.12 Text Spacing | AA | ? | Line height 1.5, paragraph 2x, letter 0.12em |
| 2.1.1 Keyboard | A | ? | All interactive elements keyboard accessible |
| 2.1.2 No Keyboard Trap | A | ? | Focus never trapped (exception: modals trap with Escape) |
| 2.4.3 Focus Order | A | ? | Logical tab order |
| 2.4.4 Link Purpose | A | ? | Descriptive link text |
| 2.4.6 Headings and Labels | AA | ? | Descriptive headings/labels |
| 2.4.7 Focus Visible | AA | ? | --focus-ring on all interactive elements |
| 2.4.11 Focus Not Obscured | AA | ? | Focus ring fully visible, no clipping |
| 2.5.3 Label in Name | AA | ? | Visible label matches accessible name |
| 2.5.8 Target Size | AA | ? | 44x44px minimum touch targets |
| 3.2.1 On Focus | A | ? | No context change on focus |
| 3.2.2 On Input | A | ? | No context change on input |
| 3.3.1 Error Identification | A | ? | Errors identified and described |
| 3.3.2 Labels or Instructions | A | ? | All inputs have labels |
| 3.3.3 Error Suggestion | AA | ? | Specific error messages |
| 4.1.2 Name, Role, Value | A | ? | ARIA attributes on custom components |
| 4.1.3 Status Messages | AA | ? | ria-live regions for dynamic content |
| 2.1.4 Character Key Shortcuts | A | ? | No single-key shortcuts |
| 2.3.3 Animation from Interactions | AAA | ? | prefers-reduced-motion respected |
| 1.4.10 Contrast (Enhanced) | AAA | ? Targeted | HC mode targets 7:1 |
| 2.4.11 Focus Appearance | AAA | ? Targeted | HC mode double-ring focus |

**Legend:** ? Pass | ? In Progress | ? Not Started | � N/A

## 7. Testing Strategy

### 7.1 Testing Tiers

| Tier | Tool | Coverage Target | Scope |
|------|------|----------------|-------|
| Unit | Vitest + React Testing Library | 100% | Component logic, state, rendering |
| Interaction | @testing-library/user-event | 100% of user paths | Click, type, keyboard navigation |
| A11y | axe-core (via vitest-axe) | 100% | WCAG violations, automated checks |
| Visual | Playwright + Percy | 100% of variants | Visual regression per variant |
| E2E | Playwright | Critical paths | Full user flows |
| Performance | Lighthouse CI | = 95 | Bundle, render, interaction |

### 7.2 Testing Patterns

`	ypescript
// Unit test pattern
describe('Button', () => {
  it('renders with variant classes', () => {
    render(<Button variant="primary">Click</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-accent-500');
  });

  it('shows loading state', async () => {
    render(<Button isLoading>Save</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Submit</Button>);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalled();
  });
});
`

### 7.3 A11y Testing Integration

`	ypescript
import { axe, toHaveNoViolations } from 'vitest-axe';
expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<Button>Accessible</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
`

## 8. Enterprise Governance

### 8.1 Component Lifecycle

| Phase | Criteria | Owner | Gate |
|-------|----------|-------|------|
| **Proposal** | Figma mockup + usage justification | Designer | Design lead approval |
| **Design Review** | Token audit + a11y check + responsive check | Design systems | Figma handoff sign-off |
| **Implementation** | React component + tests + stories | Engineer | PR created |
| **Code Review** | Variants, props, a11y, tokens, performance | Senior engineer | PR approved (2 reviewers) |
| **QA** | Visual regressions + a11y audit + responsive | QA | A11y passes + no visual diffs |
| **Release** | Changelog + version bump | Tech lead | Tagged release |
| **Retirement** | Migration guide + deprecation notice | Design systems | 2 release cycle deprecation |

### 8.2 Component Review Checklist

Every component PR must pass these checks (blocking):

- [ ] Uses only design tokens (no raw hex/px values)
- [ ] All variants, sizes, and states implemented
- [ ] All states have visible focus indicator
- [ ] Color is not sole indicator of state/meaning
- [ ] Keyboard accessible (Tab, Enter, Space, arrows)
- [ ] Screen reader tested (VoiceOver/NVDA)
- [ ] prefers-reduced-motion respected
- [ ] Touch targets = 44x44px
- [ ] cn() utility used for className merging
- [ ] orwardRef implemented
- [ ] TypeScript strict � no ny
- [ ] Unit tests cover all variants + states
- [ ] a11y tests pass (xe � zero violations)
- [ ] Stories cover all variants (future)

### 8.3 Versioning & Changelog

| Change Type | Version Bump | Changelog Entry | Example |
|-------------|-------------|----------------|---------|
| Breaking | Major (1.x ? 2.0) | ### Breaking Changes | Renamed prop, removed variant |
| Feature | Minor (1.0 ? 1.1) | ### Added | New variant, new sub-component |
| Fix | Patch (1.0.0 ? 1.0.1) | ### Fixed | Bug fix, styling correction |

### 8.4 Documentation Requirements

| Document | Location | Format | Update Cadence |
|----------|----------|--------|----------------|
| Design System (this file) | /DesignSystem.md | Markdown | Monthly |
| Component API docs | packages/ui/src/*.tsx | JSDoc | With PR |
| Token definitions | packages/ui/tailwind.config.ts | TypeScript | With token change |
| Theme variables | pps/web/src/styles/globals.css | CSS | With theme change |
| Accessibility audit | docs/35-quality/AccessibilityArchitecture.md | Markdown | Quarterly |
| Visual changelog | docs/changelog/ | Markdown | With release |

### 8.5 Breaking Change Protocol

1. **Proposal:** RFC document with rationale + migration guide
2. **Deprecation window:** 2 minor releases with deprecation warning
3. **Migration path:** Codemod when possible, migration guide always
4. **Communication:** #design-systems Slack channel + email to all engineers
5. **Timing:** Never introduce breaking changes during code freeze or holiday period

### 8.6 Performance Budget

| Metric | Budget | Enforcement |
|--------|--------|-------------|
| Initial CSS | < 20KB (gzip) | Lighthouse, bundle analyzer |
| All component JS | < 80KB (gzip) per view | Bundle analyzer |
| Button component | < 2KB (gzip) | CI bundle check |
| Modal component | < 5KB (gzip) | CI bundle check |
| Chart library | < 40KB (gzip, dynamic import) | Lazy load audit |
| Animation FPS | 60fps on mid-range device | Chrome DevTools |

---

## Decision Log

| ID | Decision | Rationale | Alternatives Considered | Date | Approver |
|----|----------|-----------|------------------------|------|----------|
| D-001 | Tailwind CSS 3.4 as styling engine | Utility-first workflow with JIT compilation, first-class dark mode, and `tailwind-merge` for class conflict resolution | Styled Components (runtime cost), CSS Modules (no design token integration) | 2026-01 | Design Systems Lead |
| D-002 | Semantic token hierarchy (6 tiers: color, typography, spacing, shadow, radius, motion) | Enables systematic theming across 3 modes with clear separation of concerns; each tier maps to specific CSS custom properties | Flat token list (unmaintainable at scale), CSS-in-JS tokens (runtime overhead) | 2026-01 | Design Systems Lead |
| D-003 | Glassmorphism as primary visual style for hero/surface components | Modern aesthetic aligning with portfolio brand; achieved via `backdrop-blur` + semi-transparent fills with proper fallback for unsupported browsers | Flat design (too generic), neumorphism (reduced accessibility), skeuomorphism (dated) | 2026-02 | Visual Design Lead |
| D-004 | Recharts as charting library (not D3 or Chart.js) | React-native API with composable components, lightweight (40KB gzipped), tree-shakeable, built-in animation and responsive containers | D3 (steeper learning curve, no React integration), Chart.js (less composable, heavier) | 2026-02 | Engineering Lead |
| D-005 | 3-tier component lifecycle requiring design review + code review + a11y audit before release | Ensures consistent quality bar across 72+ components; every component passes 14-point checklist before merging | Laissez-faire (inconsistent quality), automated-only (misses design nuance) | 2026-03 | Design Systems Lead |

## Risk Register

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R-001 | Token proliferation — 280+ tokens become unmanageable as new components are added | Medium | Medium | Monthly token audit, enforce reuse guidelines, group tokens by semantic layer with deprecation warnings for unused tokens |
| R-002 | Glassmorphism backdrop-filter not supported in older browsers (Safari <14, Firefox <103) | Medium | Medium | Feature detection with `@supports (backdrop-filter: blur())`; graceful fallback to solid `surface-secondary` background |
| R-003 | Component API inconsistencies across 9 categories as team scales | Medium | High | Mandate standardized API pattern (variant + size props, `forwardRef`, `cn()`), enforce via ESLint rules and PR review checklist item |
| R-004 | Bundle size exceeds performance budget (20KB CSS, 80KB JS per view) as component library grows | Medium | High | Per-component bundle analysis in CI, tree-shaking verification, dynamic imports for heavy components (charts, date picker, AI chat) |
| R-005 | WCAG compliance drift — new components or variants may not meet 2.2 AA+ standards | Low | High | Automated aXe checks in CI (blocking on violations), quarterly manual accessibility audit, `vitest-axe` integration requiring zero violations per PR |

## Glossary

| Term | Definition |
|------|------------|
| **Design Token** | Named value (color, spacing, typography) stored as CSS custom property for cross-component consistency |
| **CVA** | Class Variance Authority — library for defining component variant classes with TypeScript safety |
| **JIT** | Just-In-Time compilation — Tailwind CSS engine that generates only used classes at build time |
| **cn()** | Utility function combining `clsx` and `tailwind-merge` for conflict-free className merging |
| **Glassmorphism** | Visual style using semi-transparent backgrounds with `backdrop-filter: blur()` for frosted glass effect |
| **WCAG** | Web Content Accessibility Guidelines — international standard for web accessibility |
| **aXe** | Automated accessibility testing engine integrated via `vitest-axe` for CI checks |
| **Recharts** | React-native charting library with composable components (Line, Bar, Pie, Area, Radar) |
| **RLS** | Row-Level Security — not applicable here; used elsewhere for database access control |
| **CLS** | Cumulative Layout Shift — Core Web Vital measuring visual stability during page load |
| **INP** | Interaction to Next Paint — Core Web Vital measuring responsiveness to user interactions |
| **LCP** | Largest Contentful Paint — Core Web Vital measuring perceived load speed |
| **Tree-shaking** | Build optimization removing unused exports from final JavaScript bundle |
| **CSS Custom Properties** | CSS variables (`--token-name`) enabling runtime theme switching without recompilation |
| **HSLA** | Hue-Saturation-Lightness-Alpha color notation used for token overrides in theme modes |
| **Semantic Token** | Token named by its purpose (e.g., `--color-accent-500`) rather than raw value (e.g., `--color-blue-500`) |

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 5.0 | 2026-06 | Design Systems Lead | Enterprise-grade component library: 72+ components across 9 categories, 280+ tokens in 6-tier semantic hierarchy, 3 theme modes (Light/Dark/HC), WCAG 2.2 AA+ compliance matrix, 6-tier testing strategy, enterprise governance (lifecycle, review checklist, versioning, breaking change protocol, performance budget) |
| 5.1 | 2026-06 | Design Systems Lead | Added Executive Summary with Mermaid architecture diagram, Decision Log (5 entries), Risk Register (5 entries), Glossary (16 terms)

---

## Cross-References

| Reference | Description |
|-----------|-------------|
| [MASTER-INDEX.md](../MASTER-INDEX.md) | Documentation master index |
| [CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) | Cross-reference mapping |
| [FRONTEND-ARCHITECTURE.md](FRONTEND-ARCHITECTURE.md) | Frontend architecture overview |
| [COMPONENT-LIBRARY.md](COMPONENT-LIBRARY.md) | Component library reference |
| [COMPONENT-STANDARDS.md](COMPONENT-STANDARDS.md) | Component design standards |
| [DesignSystem.md](../04-design/DESIGN-SYSTEM.md) | Core design system (design category) |
| [DesignTokens.md](../04-design/DESIGN-TOKENS.md) | Design tokens reference |
| [Storybook.md](../13-testing/STORYBOOK.md) | Storybook testing and documentation |
