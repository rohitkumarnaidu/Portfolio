'use client';

import { cn } from '@/lib/cn';

interface DotGridProps {
  spacing?: number;
  dotSize?: number;
  opacity?: number;
  className?: string;
}

export const DotGrid = ({ spacing = 20, dotSize = 1, opacity = 0.5, className }: DotGridProps) => {
  return (
    <div
      className={cn('absolute inset-0 pointer-events-none bg-dots', className)}
      style={{
        ['--dot-spacing' as string]: `${spacing}px`,
        ['--dot-size' as string]: `${dotSize}px`,
        opacity,
      }}
      aria-hidden="true"
    />
  );
};
