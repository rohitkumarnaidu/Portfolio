'use client';

import { useParallax } from '@/hooks/useParallax';
import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

interface ParallaxLayerProps {
  speed?: number;
  direction?: 'up' | 'down';
  className?: string;
  children: ReactNode;
}

export const ParallaxLayer = ({
  speed = 0.3,
  direction = 'up',
  className,
  children,
}: ParallaxLayerProps) => {
  const ref = useParallax({ speed, direction });

  return (
    <div ref={ref} className={cn('will-change-transform', className)}>
      {children}
    </div>
  );
};
