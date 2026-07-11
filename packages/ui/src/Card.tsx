'use client';

import React from 'react';
import { cn } from './cn';

/**
 * Card — Composable container with 5 variants and sub-components.
 *
 * @see docs/DesignSystem.md §2.2 (Card Specification)
 *
 * Variants:
 * - default: Standard content card with border and subtle shadow
 * - glass: Glassmorphism effect — dark theme accent
 * - elevated: Prominent shadow, no border — stat cards
 * - bordered: Border-only, no fill — settings sections
 * - interactive: Clickable with hover lift — project cards
 */

const cardVariants = {
  default:
    'bg-surface-secondary border border-border-primary shadow-sm',
  elevated:
    'bg-surface-primary shadow-md',
  glass:
    'bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg',
  bordered:
    'bg-transparent border border-border-primary',
  interactive:
    'bg-surface-secondary border border-border-primary shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-border-accent',
} as const;

type CardVariant = keyof typeof cardVariants;

const cardPadding = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
} as const;

type CardPadding = keyof typeof cardPadding;

export interface CardProps {
  /** Visual variant */
  variant?: CardVariant;
  /** Padding size */
  padding?: CardPadding;
  /** Makes card a clickable element */
  onClick?: () => void;
  /** Makes card a link (renders as anchor wrapper) */
  href?: string;
  /** Additional CSS classes */
  className?: string;
  /** Card content */
  children: React.ReactNode;
}

export function Card({
  variant = 'default',
  padding = 'md',
  onClick,
  href,
  className,
  children,
}: CardProps) {
  const baseClasses = cn(
    'rounded-xl transition-all duration-normal',
    cardVariants[variant],
    cardPadding[padding],
    onClick && variant !== 'interactive' && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
    className,
  );

  if (href) {
    return (
      <a href={href} className={cn(baseClasses, 'block no-underline')}>
        {children}
      </a>
    );
  }

  return (
    <div
      className={baseClasses}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

/* Sub-components */

export interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 pb-4 border-b border-border-primary',
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface CardBodyProps {
  className?: string;
  children: React.ReactNode;
}

export function CardBody({ className, children }: CardBodyProps) {
  return <div className={cn('py-4', className)}>{children}</div>;
}

export interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 pt-4 border-t border-border-primary',
        className,
      )}
    >
      {children}
    </div>
  );
}
