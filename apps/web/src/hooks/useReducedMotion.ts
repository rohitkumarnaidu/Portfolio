/**
 * @module useReducedMotion
 * @description Detects user's motion preference (prefers-reduced-motion).
 * All animated components MUST check this before applying transitions.
 *
 * WCAG 2.2 AA Compliance:
 * - SC 2.3.3: Motion from interaction can be disabled
 * - globals.css already handles CSS-level reduction
 * - This hook provides JS-level awareness for Framer Motion / GSAP
 *
 * @see docs/28-ACCESSIBILITY.md §3.4 — Motion Preferences
 * @see docs/08-DESIGN-SYSTEM.md §1.5 — Animation Tokens
 */

'use client';

import { useMediaQuery } from './useMediaQuery';

/**
 * Returns `true` if the user prefers reduced motion.
 *
 * @returns Whether the `prefers-reduced-motion: reduce` media query matches
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 *
 * return (
 *   <motion.div
 *     initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
 *     animate={{ opacity: 1, y: 0 }}
 *     transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6 }}
 *   />
 * );
 * ```
 */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
