'use client';

import React from 'react';
import { cn } from './cn';

/**
 * StatusBadge — Semantic status indicator with color-coded variants.
 *
 * @see docs/FRONTEND-IMPLEMENTATION-PLAN.md §4 (Component Library)
 */

export type StatusKind = 'active' | 'archived' | 'draft' | 'published';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Status kind */
  status?: StatusKind;
  /** Custom label override */
  label?: React.ReactNode;
  /** Size */
  size?: 'sm' | 'md' | 'lg';
}

const statusStyles: Record<StatusKind, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400',
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  published: 'bg-accent-100 text-accent-700 dark:bg-accent-800 dark:text-accent-300',
};

const statusLabel: Record<StatusKind, string> = {
  active: 'Active',
  archived: 'Archived',
  draft: 'Draft',
  published: 'Published',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-xs',
} as const;

export function StatusBadge({
  status = 'active',
  label,
  size = 'md',
  className,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md font-medium whitespace-nowrap',
        statusStyles[status],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          status === 'active' || status === 'published'
            ? 'bg-current'
            : status === 'draft'
              ? 'bg-current'
              : 'bg-current opacity-60',
        )}
        aria-hidden="true"
      />
      {label ?? statusLabel[status]}
    </span>
  );
}
