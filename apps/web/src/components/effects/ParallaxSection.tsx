'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

interface ParallaxSectionProps {
  backgroundSpeed?: number;
  foregroundSpeed?: number;
  background?: ReactNode;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}

export const ParallaxSection = ({
  backgroundSpeed = 0.15,
  foregroundSpeed = 0.5,
  background,
  children,
  className,
  containerClassName,
}: ParallaxSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersContrast = window.matchMedia('(prefers-contrast: more)').matches;
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    const isNarrow = window.innerWidth < 768;

    if (prefersReduced || prefersContrast || isMobile || isNarrow) return;

    let ctx: { revert: () => void } | null = null;

    const initGsap = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        if (bgRef.current && backgroundSpeed > 0) {
          gsap.fromTo(
            bgRef.current,
            { y: 0 },
            {
              y: () => -(bgRef.current?.offsetHeight ?? 0) * backgroundSpeed * 0.5,
              ease: 'none',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        }

        if (fgRef.current && foregroundSpeed > 0) {
          gsap.fromTo(
            fgRef.current,
            { y: 0 },
            {
              y: () => (fgRef.current?.offsetHeight ?? 0) * foregroundSpeed * 0.4,
              ease: 'none',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        }
      });
    };

    initGsap();

    return () => ctx?.revert();
  }, [backgroundSpeed, foregroundSpeed]);

  return (
    <section ref={sectionRef} className={cn('relative overflow-hidden', className)}>
      {background && (
        <div ref={bgRef} className="absolute inset-0 will-change-transform" aria-hidden="true">
          {background}
        </div>
      )}

      <div ref={fgRef} className={cn('relative will-change-transform', containerClassName)}>
        {children}
      </div>
    </section>
  );
};
