'use client';

import React from 'react';
import { cn } from './cn';

/**
 * Skeleton — Loading placeholder with shimmer animation.
 *
 * @see docs/DesignSystem.md §2.10 (Skeleton Specification)
 *
 * Variants:
 * - text: Inline text-height skeleton
 * - circle: Circular avatar placeholder
 * - rectangle: Rectangular image/card placeholder
 */

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Shape variant */
  variant?: 'text' | 'circle' | 'rectangle';
  /** Width (CSS value) */
  width?: string | number;
  /** Height (CSS value) */
  height?: string | number;
  /** Number of text lines to render */
  lines?: number;
}

export function Skeleton({
  className,
  variant = 'rectangle',
  width,
  height,
  lines = 1,
  ...props
}: SkeletonProps) {
  const baseClasses =
    'animate-shimmer bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative';

  const shimmerOverlay =
    'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent dark:before:via-white/5';

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)} role="status" aria-label="Loading" {...props}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              shimmerOverlay,
              'h-4 rounded-md',
              i === lines - 1 && 'w-3/4', // Last line shorter
            )}
            style={{ width: i === lines - 1 ? '75%' : width }}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div
        className={cn(baseClasses, shimmerOverlay, 'rounded-full', className)}
        style={{
          width: width ?? 40,
          height: height ?? width ?? 40,
        }}
        role="status"
        aria-label="Loading"
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, shimmerOverlay, 'rounded-lg', className)}
      style={{ width, height }}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
