'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ReadingProgressProps {
  color?: string;
  height?: number;
  selective?: boolean;
}

export const ReadingProgress = ({ color, height = 3, selective = true }: ReadingProgressProps) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number>(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const article = document.querySelector('article');
    if (!article && selective) return;

    setVisible(true);

    const onScroll = () => {
      if (rafRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
        setProgress(pct);
        rafRef.current = 0;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion, selective]);

  if (!visible || reducedMotion) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className={cn('h-full transition-[width] duration-100 ease-linear')}
        style={{
          width: `${progress}%`,
          background: color || 'linear-gradient(90deg, #6366f1, #22d3ee)',
        }}
      />
    </div>
  );
};
