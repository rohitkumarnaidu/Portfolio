/**
 * @module fonts
 * @description Font system using next/font for automatic optimization.
 * Replaces manual @font-face declarations with zero-FOIT, zero-CLS font loading.
 *
 * Architecture Reference: DESIGN.md (repo root) §Typography
 * ADR Reference: docs/27-decisions/ADR-010-tailwind-css.md
 *
 * Font Stack (spec §12 Q1 — locked full IBM Plex swap):
 * - Display: IBM Plex Sans (600/700 subset) — headings and display text
 * - Body: IBM Plex Sans (300–700) — body text and UI elements
 * - Mono: IBM Plex Mono — code blocks, inline code, technical content
 *
 * The serif role was removed with this swap. The public stylesheet
 * (apps/web/src/styles/public.css) still resolves its --serif chain through
 * --font-serif, so an interim :root alias in apps/web/src/styles/globals.css
 * maps --font-serif to var(--font-body). next/font cannot emit that alias
 * without instantiating Plex Sans a second time (duplicate @font-face
 * output), which is why it lives in CSS. Phase 1: public surface restyle
 * removes serif role.
 */

import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';

/**
 * Display font — Used for H1, H2, hero headings, and display text.
 * IBM Plex Sans serves both the display and body roles in the locked stack
 * (spec §12 Q1: one family across optical roles), differing here only by
 * its 600/700 weight subset.
 *
 * @see DESIGN.md (repo root) §Typography — font-display token
 */
export const fontDisplay = IBM_Plex_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['600', '700'],
  variable: '--font-display',
  fallback: ['system-ui', 'sans-serif'],
});

/**
 * Body font — Used for body text, H3-H4, buttons, and UI elements.
 * Same family as the display face (IBM Plex Sans) per the locked Q1 stack,
 * carrying the full 300–700 weight coverage the body role needs. The
 * interim --font-serif alias (apps/web/src/styles/globals.css) resolves
 * through this variable until the serif role is removed in Phase 1.
 *
 * @see DESIGN.md (repo root) §Typography — font-body token
 */
export const fontBody = IBM_Plex_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  fallback: ['system-ui', 'sans-serif'],
});

/**
 * Monospace font — Used for code blocks, inline code, and technical content.
 * IBM Plex Mono carries the "technical alphabet" role from the locked
 * Q1 stack.
 *
 * @see DESIGN.md (repo root) §Typography — font-mono token
 */
export const fontMono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  fallback: ['monospace'],
});

/**
 * Combined CSS variable class string for applying to the <html> element.
 * This injects all three font CSS variables into the cascade.
 *
 * Usage in layout.tsx:
 * ```tsx
 * <html className={fontVariables}>
 * ```
 */
export const fontVariables = [fontDisplay.variable, fontBody.variable, fontMono.variable].join(' ');
