'use client';

import React from 'react';
import { cn } from './cn';

/**
 * Button — Primary interactive element with 5 variants and 4 sizes.
 *
 * @see docs/DesignSystem.md §2.1 (Button Specification)
 *
 * Variants:
 * - primary: Solid accent background — main CTA
 * - secondary: Outlined with border — secondary actions
 * - ghost: Text-only — tertiary actions
 * - danger: Red solid — destructive actions
 * - link: Inline text link style — navigation-style buttons
 */

const buttonVariants = {
  variant: {
    primary:
      'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 shadow-lg shadow-accent-500/20',
    secondary:
      'bg-transparent text-text-primary border border-border-primary hover:bg-surface-elevated active:bg-surface-elevated',
    ghost:
      'bg-transparent text-text-primary hover:bg-surface-elevated active:bg-surface-elevated',
    danger:
      'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 dark:bg-red-500 dark:hover:bg-red-600 shadow-lg shadow-red-600/20',
    link:
      'bg-transparent text-text-link hover:underline active:underline p-0 h-auto shadow-none',
  },
  size: {
    sm: 'h-8 px-3 py-1.5 text-[13px] gap-1.5',
    md: 'h-10 px-4 py-2.5 text-sm gap-2',
    lg: 'h-12 px-6 py-3 text-base gap-2.5',
    xl: 'h-14 px-8 py-4 text-base gap-3',
  },
} as const;

type Variant = keyof typeof buttonVariants.variant;
type Size = keyof typeof buttonVariants.size;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: Variant;
  /** Size */
  size?: Size;
  /** Shows loading spinner, disables button */
  isLoading?: boolean;
  /** Disables button */
  isDisabled?: boolean;
  /** Icon rendered before children */
  leftIcon?: React.ReactNode;
  /** Icon rendered after children */
  rightIcon?: React.ReactNode;
  /** Makes button full width */
  fullWidth?: boolean;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const isInactive = disabled || isDisabled || isLoading;

  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-fast',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-primary',
        'disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
        'active:scale-[0.97]',
        buttonVariants.variant[variant],
        variant !== 'link' && buttonVariants.size[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={isInactive}
      type={type}
      aria-busy={isLoading || undefined}
      aria-disabled={isInactive || undefined}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : leftIcon ? (
        <span className="shrink-0" aria-hidden="true">{leftIcon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {rightIcon && !isLoading && (
        <span className="shrink-0" aria-hidden="true">{rightIcon}</span>
      )}
    </button>
  );
}
