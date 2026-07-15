'use client';

import { cn } from '@/lib/cn';

interface MeshGradientProps {
  variant?: 1 | 2;
  animated?: boolean;
  className?: string;
}

export const MeshGradient = ({ variant = 1, animated = false, className }: MeshGradientProps) => {
  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none',
        variant === 1 ? 'bg-mesh-1' : 'bg-mesh-2',
        animated && 'animate-mesh-shift',
        className,
      )}
      aria-hidden="true"
    />
  );
};
