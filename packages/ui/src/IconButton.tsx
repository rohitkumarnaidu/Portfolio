'use client';

import React from 'react';
import { cn } from './cn';

/**
 * IconButton — Square button for icon-only actions with 3 sizes.
 *
 * @see docs/FRONTEND-IMPLEMENTATION-PLAN.md §4 (Component Library)
 */

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon node */
  icon: React.ReactNode;
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Accessible label (required for icon-only buttons) */
  'aria-label': string;
  /** Disabled state */
  isDisabled?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-[13px]',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
} as const;

const variantClasses = {
  primary:
    'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700',
  secondary:
    'border border-border-primary text-text-primary hover:bg-surface-elevated active:bg-surface-elevated',
  ghost: 'text-text-primary hover:bg-surface-elevated active:bg-surface-elevated',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 dark:bg-red-500 dark:hover:bg-red-600',
} as const;

export function IconButton({
  icon,
  size = 'md',
  variant = 'ghost',
  className,
  isDisabled = false,
  disabled,
  type = 'button',
  ...props
}: IconButtonProps) {
  const inactive = disabled || isDisabled;
  return (
    <button
      type={type}
      disabled={inactive}
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-all duration-fast',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-primary',
        'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      <span className="shrink-0" aria-hidden="true">
        {icon}
      </span>
    </button>
  );
}
