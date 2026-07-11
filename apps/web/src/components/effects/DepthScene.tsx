'use client';

import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

interface DepthSceneProps {
  className?: string;
  children: ReactNode;
}

export const DepthScene = ({
  className,
  children,
}: DepthSceneProps) => {
  return (
    <div className={cn('depth-container', className)}>
      {children}
    </div>
  );
};
