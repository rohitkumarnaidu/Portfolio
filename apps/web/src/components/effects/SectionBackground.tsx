'use client';

import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

export type BgVariant = 'none' | 'solid' | 'gradient-hero' | 'gradient-cta' | 'glass' | 'noise' | 'dots' | 'mesh-1' | 'mesh-2' | 'scrim-light' | 'scrim-dark';

interface SectionBackgroundProps {
  variant?: BgVariant;
  className?: string;
  children?: ReactNode;
}

const bgClasses: Record<BgVariant, string> = {
  'none': '',
  'solid': 'bg-surface-secondary',
  'gradient-hero': 'bg-gradient-hero',
  'gradient-cta': 'bg-gradient-cta',
  'glass': 'glass-subtle',
  'noise': '',
  'dots': 'bg-dots',
  'mesh-1': 'bg-mesh-1',
  'mesh-2': 'bg-mesh-2',
  'scrim-light': '',
  'scrim-dark': '',
};

const noiseVariants: BgVariant[] = ['noise', 'gradient-hero', 'gradient-cta', 'mesh-1', 'mesh-2'];
const scrimVariants: BgVariant[] = ['scrim-light', 'scrim-dark'];

export const SectionBackground = ({
  variant = 'none',
  className,
  children,
}: SectionBackgroundProps) => {
  const showNoise = noiseVariants.includes(variant) && variant !== 'noise';
  const isNoiseOnly = variant === 'noise';
  const isScrim = scrimVariants.includes(variant);

  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none',
        bgClasses[variant],
        isNoiseOnly && 'noise-overlay',
        isScrim && variant === 'scrim-light' && 'scrim-light',
        isScrim && variant === 'scrim-dark' && 'scrim-dark',
        className
      )}
      aria-hidden="true"
    >
      {showNoise && (
        <div className="absolute inset-0 noise-overlay" aria-hidden="true" />
      )}
      {children}
    </div>
  );
};
