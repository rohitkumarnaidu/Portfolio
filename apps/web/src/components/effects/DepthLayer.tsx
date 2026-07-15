'use client';

import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

interface DepthLayerProps {
  layer?: 'far' | 'mid' | 'near' | 'hover';
  className?: string;
  children: ReactNode;
}

export const DepthLayer = ({ layer = 'mid', className, children }: DepthLayerProps) => {
  const depthClass = {
    far: 'depth-far',
    mid: 'depth-mid',
    near: 'depth-near',
    hover: 'depth-hover',
  }[layer];

  return <div className={cn(depthClass, className)}>{children}</div>;
};
