'use client';

import React, { useId } from 'react';
import { cn } from './cn';

/**
 * Input — Form input with composable sub-components.
 *
 * @see docs/DesignSystem.md §2.3 (Input Specification)
 *
 * Supports label, error, helper text, icon slots, and success state.
 * Follows WCAG 3.3.2 (Labels) and 3.3.1 (Error Identification).
 */

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input label */
  label?: string;
  /** Error message — triggers error state */
  error?: string;
  /** Helper text below input */
  helperText?: string;
  /** Success state */
  isSuccess?: boolean;
  /** Icon rendered on left */
  leftIcon?: React.ReactNode;
  /** Icon rendered on right */
  rightIcon?: React.ReactNode;
  /** Size variant */
  size?: 'md' | 'lg';
  /** Additional classes for the outer wrapper */
  containerClassName?: string;
}

export function Input({
  className,
  containerClassName,
  label,
  error,
  helperText,
  isSuccess = false,
  leftIcon,
  rightIcon,
  size = 'md',
  id: externalId,
  type = 'text',
  disabled,
  ...props
}: InputProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  const sizeClasses = {
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  };

  return (
    <div className={cn('w-full space-y-1.5', containerClassName)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span
            className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-tertiary"
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}

        <input
          id={id}
          type={type}
          disabled={disabled}
          className={cn(
            'w-full rounded-lg border bg-surface-secondary text-text-primary placeholder:text-text-tertiary',
            'transition-all duration-fast',
            'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-0 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            sizeClasses[size],
            // State-based border
            error
              ? 'border-red-400 dark:border-red-500 focus:ring-red-500'
              : isSuccess
              ? 'border-green-400 dark:border-green-500 focus:ring-green-500'
              : 'border-border-primary hover:border-border-accent',
            // Icon padding
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className,
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          {...props}
        />

        {rightIcon && (
          <span
            className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-text-tertiary"
            aria-hidden="true"
          >
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <p id={errorId} className="text-sm text-red-500 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={helperId} className="text-sm text-text-secondary">
          {helperText}
        </p>
      )}
    </div>
  );
}
