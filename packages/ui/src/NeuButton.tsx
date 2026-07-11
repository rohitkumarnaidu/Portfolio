'use client';

import { cn } from './cn';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface NeuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'soft' | 'hard';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
}

const sizeClasses = {
  sm: 'px-2 py-1.5 text-button min-h-[32px]',
  md: 'px-3 py-2 text-button min-h-[40px]',
  lg: 'px-4 py-3 text-button min-h-[48px]',
  xl: 'px-6 py-4 text-button min-h-[56px]',
};

export const NeuButton = ({
  _variant = 'soft',
  size = 'md',
  className,
  disabled,
  children,
  ...props
}: NeuButtonProps) => {
  return (
    <button
      className={cn(
        'neu-raised neu-transition rounded-lg bg-surface-elevated text-text-primary font-medium',
        'active:neu-pressed active:scale-[0.97]',
        'focus-visible:shadow-accent-focus focus-visible:outline-none',
        'disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed disabled:active:scale-100',
        sizeClasses[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
