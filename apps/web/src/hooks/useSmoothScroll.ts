'use client';

import { useRef, useCallback } from 'react';

export function useSmoothScroll() {
  const rafRef = useRef<number>(0);
  const targetRef = useRef(0);

  const scrollTo = useCallback(
    (target: number, duration = 600) => {
      const start = window.scrollY;
      const distance = target - start;
      const startTime = performance.now();

      targetRef.current = target;

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        window.scrollTo(0, start + distance * eased);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(animate);
    },
    []
  );

  const scrollIntoView = useCallback(
    (element: HTMLElement, offset = 0, duration = 600) => {
      const rect = element.getBoundingClientRect();
      const target = window.scrollY + rect.top - offset;
      scrollTo(target, duration);
    },
    [scrollTo]
  );

  return { scrollTo, scrollIntoView };
}
