'use client';

import React from 'react';
import { cn } from './cn';

/**
 * Avatar — Profile image with fallback initials.
 *
 * @see docs/DesignSystem.md §2.9 (Avatar Specification)
 *
 * Sizes: sm (32px), md (40px), lg (48px), xl (64px)
 * Falls back to initials when no image is provided.
 */

const avatarSizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
} as const;

type AvatarSize = keyof typeof avatarSizes;

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image URL */
  src?: string;
  /** Alt text for the image */
  alt?: string;
  /** Fallback initials (max 2 characters) */
  initials?: string;
  /** Size variant */
  size?: AvatarSize;
}

export function Avatar({
  className,
  src,
  alt = '',
  initials = '?',
  size = 'md',
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);
  const showFallback = !src || hasError;

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full shrink-0 overflow-hidden',
        'bg-accent-100 dark:bg-accent-800',
        avatarSizes[size],
        className,
      )}
      {...props}
    >
      {showFallback ? (
        <span
          className="font-semibold text-accent-700 dark:text-accent-300 select-none"
          aria-hidden="true"
        >
          {initials.slice(0, 2).toUpperCase()}
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
