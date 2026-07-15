'use client';

import { cn } from './cn';
import type { ReactNode, HTMLAttributes } from 'react';

export interface NeuCardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: 'flat' | 'raised';
  variant?: 'soft' | 'hard';
  hoverable?: boolean;
  children: ReactNode;
}

export const NeuCard = ({
  elevation = 'raised',
  variant = 'soft',
  hoverable = false,
  className,
  children,
  ...props
}: NeuCardProps) => {
  return (
    <div
      className={cn(
        'rounded-xl p-4 md:p-6',
        elevation === 'flat' ? 'neu-flat' : 'neu-raised',
        variant === 'hard' && elevation === 'raised' && 'neu-raised-hard',
        hoverable && 'neu-transition hover:neu-raised-hover cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
