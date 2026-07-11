'use client';

import React, { useId } from 'react';
import { cn } from './cn';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isSuccess?: boolean;
  containerClassName?: string;
}

export function Textarea({
  className,
  containerClassName,
  label,
  error,
  helperText,
  isSuccess = false,
  id: externalId,
  disabled,
  rows = 4,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

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
        <textarea
          id={id}
          disabled={disabled}
          rows={rows}
          className={cn(
            'w-full rounded-lg border bg-surface-secondary text-text-primary placeholder:text-text-tertiary',
            'transition-all duration-fast p-3 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-0 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50 resize-y min-h-[80px]',
            error
              ? 'border-red-400 dark:border-red-500 focus:ring-red-500'
              : isSuccess
              ? 'border-green-400 dark:border-green-500 focus:ring-green-500'
              : 'border-border-primary hover:border-border-accent',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          {...props}
        />
      </div>

      {error && (
        <p id={errorId} className="text-sm text-red-500 dark:text-red-400">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={helperId} className="text-sm text-text-tertiary">
          {helperText}
        </p>
      )}
    </div>
  );
}
