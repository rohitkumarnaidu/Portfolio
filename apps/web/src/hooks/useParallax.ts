'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface UseParallaxOptions {
  speed?: number;
  direction?: 'up' | 'down';
  clamp?: boolean;
}

export function useParallax(options: UseParallaxOptions = {}) {
  const { speed = 0.3, direction = 'up', clamp = true } = options;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersContrast = window.matchMedia('(prefers-contrast: more)').matches;
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    const isNarrow = window.innerWidth < 768;

    if (prefersReduced || prefersContrast || isMobile || isNarrow) {
      return;
    }

    const intensity = clamp ? Math.min(Math.abs(speed), 0.5) : Math.abs(speed);

    const movement = direction === 'up' ? -1 : 1;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        element,
        { y: 0 },
        {
          y: () => movement * element.offsetHeight * intensity * 0.5,
          ease: 'none',
          scrollTrigger: {
            trigger: element.parentElement || element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    });

    return () => {
      ctx.revert();
    };
  }, [speed, direction, clamp]);

  return ref;
}
