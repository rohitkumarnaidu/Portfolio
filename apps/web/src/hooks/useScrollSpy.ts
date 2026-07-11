/**
 * @module useScrollSpy
 * @description Tracks which section is currently visible in the viewport.
 * Used by the Navbar to highlight the active navigation link.
 *
 * Implementation:
 * - Uses IntersectionObserver for efficient, non-blocking scroll tracking
 * - Returns the ID of the section with the highest intersection ratio
 * - SSR-safe: returns null on server
 *
 * @see docs/08b-COMPONENT-LIBRARY.md §1.1 — Navbar active link detection
 * @see docs/09-ARCHITECTURE.md §2.4 — Component Tree
 */

'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * Observe multiple section elements and return the ID of the one
 * most visible in the viewport.
 *
 * @param sectionIds - Array of section element IDs to observe
 * @param options - IntersectionObserver options
 * @returns The ID of the currently active section, or null
 *
 * @example
 * ```tsx
 * const activeSection = useScrollSpy(
 *   [SECTION_IDS.HERO, SECTION_IDS.ABOUT, SECTION_IDS.SKILLS],
 *   { rootMargin: '-80px 0px 0px 0px' } // offset for sticky nav
 * );
 * ```
 */
export function useScrollSpy(
  sectionIds: readonly string[],
  options: IntersectionObserverInit = {},
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const ratioMap = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const ratio = ratioMap.current;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratio.set(entry.target.id, entry.intersectionRatio);
        }

        // Find the section with the highest intersection ratio
        let maxRatio = 0;
        let maxId: string | null = null;

        ratio.forEach((r, id) => {
          if (r > maxRatio) {
            maxRatio = r;
            maxId = id;
          }
        });

        if (maxId !== null && maxRatio > 0) {
          setActiveId(maxId);
        }
      },
      {
        // Default: account for sticky navbar height (64px)
        rootMargin: '-80px 0px -40% 0px',
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        ...options,
      },
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      ratio.clear();
    };
  }, [sectionIds, options]);

  return activeId;
}
