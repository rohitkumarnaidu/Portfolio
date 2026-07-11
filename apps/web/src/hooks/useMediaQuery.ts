/**
 * @module useMediaQuery
 * @description SSR-safe media query hook that tracks a CSS media query match.
 * Handles hydration safely by returning `false` during SSR and
 * synchronizing on client mount.
 *
 * @see docs/08-DESIGN-SYSTEM.md §1.5 — prefers-reduced-motion
 * @see docs/28-ACCESSIBILITY.md — Motion preferences
 */

'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * Track whether a CSS media query matches.
 *
 * @param query - CSS media query string (e.g., '(min-width: 768px)')
 * @returns `true` if the media query matches, `false` otherwise (or during SSR)
 *
 * @example
 * ```tsx
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 * const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  const handleChange = useCallback((event: MediaQueryListEvent) => {
    setMatches(event.matches);
  }, []);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    // Set initial value on mount
    setMatches(mediaQueryList.matches);

    // Listen for changes
    mediaQueryList.addEventListener('change', handleChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query, handleChange]);

  return matches;
}
