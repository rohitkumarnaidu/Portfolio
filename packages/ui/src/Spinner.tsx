'use client';

import React from 'react';
import { cn } from './cn';

/**
 * Spinner — Indeterminate loading indicator with three sizes.
 *
 * @see docs/FRONTEND-IMPLEMENTATION-PLAN.md §4 (Component Library)
 */

const spinnerSizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
} as const;

type SpinnerSize = keyof typeof spinnerSizes;

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size of the spinner */
  size?: SpinnerSize;
  /** Accessible label for screen readers */
  label?: string;
}

export function Spinner({
  size = 'md',
  label = 'Loading',
  className,
  ...props
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      <span className="sr-only">{label}</span>
      <span
        className={cn(
          'inline-block animate-spin rounded-full border-current border-t-transparent',
          'motion-reduce:animate-[spin_1.5s_linear_infinite]',
          spinnerSizes[size],
        )}
        aria-hidden="true"
      />
    </span>
  );
}
