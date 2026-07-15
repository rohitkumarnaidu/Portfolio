'use client';

import React from 'react';
import { cn } from './cn';

/**
 * Badge — Small label for status indication, tags, and categorization.
 *
 * @see docs/DesignSystem.md §2.4 (Badge Specification)
 *
 * Variants:
 * - default: Accent-tinted background for tech tags, categories
 * - success: Green for active, published, available states
 * - warning: Yellow for pending, in-progress states
 * - error: Red for expired, failed, urgent states
 * - info: Blue for new, updated, draft states
 * - neutral: Gray for generic labels, metadata
 */

const badgeVariants = {
  variant: {
    default: 'bg-accent-100 text-accent-700 dark:bg-accent-800 dark:text-accent-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    neutral: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  },
  size: {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-xs',
  },
} as const;

type BadgeVariant = keyof typeof badgeVariants.variant;
type BadgeSize = keyof typeof badgeVariants.size;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Visual variant */
  variant?: BadgeVariant;
  /** Size */
  size?: BadgeSize;
  /** Show dismiss X button */
  isDismissible?: boolean;
  /** Callback when dismiss is clicked */
  onDismiss?: () => void;
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  isDismissible = false,
  onDismiss,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-md whitespace-nowrap',
        badgeVariants.variant[variant],
        badgeVariants.size[size],
        className,
      )}
      {...props}
    >
      {children}
      {isDismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-1 -mr-0.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <svg
            className="w-2.5 h-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
