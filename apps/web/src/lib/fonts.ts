/**
 * @module fonts
 * @description Font system using next/font for automatic optimization.
 * Replaces manual @font-face declarations with zero-FOIT, zero-CLS font loading.
 *
 * Architecture Reference: docs/08-DESIGN-SYSTEM.md §1.2 (Typography Tokens)
 * ADR Reference: docs/adr/ADR-010-tailwind-css.md
 *
 * Font Stack:
 * - Display: Plus Jakarta Sans (admin / legacy surface)
 * - Serif: Instrument Serif (public editorial surface)
 * - Body: Inter
 * - Mono: JetBrains Mono
 */

import { Plus_Jakarta_Sans, Instrument_Serif, Inter, JetBrains_Mono } from 'next/font/google';

/**
 * Display font — Used for H1, H2, hero headings, and display text.
 * Plus Jakarta Sans is a geometric sans-serif that closely matches
 * Cabinet Grotesk's characteristics while being freely available.
 *
 * @see docs/08-DESIGN-SYSTEM.md §1.2 — font-display token
 */
export const fontDisplay = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  fallback: ['system-ui', 'sans-serif'],
});

/**
 * Editorial serif — Used for the public site's display typography.
 * Instrument Serif carries the contrast and personality that a generic
 * sans-serif display face cannot, while staying readable at small sizes.
 */
export const fontSerif = Instrument_Serif({
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

/**
 * Body font — Used for body text, H3-H4, buttons, and UI elements.
 *
 * @see docs/08-DESIGN-SYSTEM.md §1.2 — font-body token
 */
export const fontBody = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  fallback: ['system-ui', 'sans-serif'],
});

/**
 * Monospace font — Used for code blocks, inline code, and technical content.
 *
 * @see docs/08-DESIGN-SYSTEM.md §1.2 — font-mono token
 */
export const fontMono = JetBrains_Mono({
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
export const fontVariables = [
  fontDisplay.variable,
  fontSerif.variable,
  fontBody.variable,
  fontMono.variable,
].join(' ');
