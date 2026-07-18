'use client';

import React from 'react';
import { cn } from './cn';

/**
 * ProgressBar — Determinate and indeterminate progress indicator.
 *
 * @see docs/FRONTEND-IMPLEMENTATION-PLAN.md §4 (Component Library)
 */

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Progress value 0-100 (omit for indeterminate) */
  value?: number;
  /** Visual variant */
  variant?: 'default' | 'success' | 'warning' | 'error';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Indeterminate animation (ignores value) */
  indeterminate?: boolean;
  /** Show value label */
  showLabel?: boolean;
  /** Accessible label */
  'aria-label'?: string;
}

const variantBar = {
  default: 'bg-accent-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
} as const;

const variantSizes = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
} as const;

export function ProgressBar({
  value,
  variant = 'default',
  size = 'md',
  indeterminate = false,
  showLabel = false,
  className,
  'aria-label': ariaLabel = 'Progress',
  ...props
}: ProgressBarProps) {
  const pct = indeterminate ? undefined : Math.min(100, Math.max(0, value ?? 0));

  return (
    <div className={cn('w-full', className)} {...props}>
      <div
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : 100}
        aria-valuenow={pct}
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-surface-elevated',
          variantSizes[size],
        )}
      >
        {indeterminate ? (
          <div
            className={cn(
              'absolute inset-y-0 left-0 w-1/3 rounded-full',
              variantBar[variant],
              'animate-progress-indeterminate motion-reduce:animate-[progress-indeterminate_2s_ease-in-out_infinite]',
            )}
          />
        ) : (
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-normal ease-out',
              variantBar[variant],
            )}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
      {showLabel && !indeterminate && (
        <p className="mt-1 text-xs text-text-secondary">{pct}%</p>
      )}
    </div>
  );
}
