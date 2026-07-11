'use client';

import { useRef } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface FocusTrapProps {
  active: boolean;
  children: React.ReactNode;
  initialFocus?: 'first' | 'last' | React.RefObject<HTMLElement>;
  onEscape?: () => void;
  className?: string;
}

export const FocusTrap = ({
  active,
  children,
  initialFocus = 'first',
  onEscape,
  className,
}: FocusTrapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useFocusTrap({
    containerRef: containerRef as React.RefObject<HTMLElement>,
    active,
    initialFocus,
    onEscape,
  });

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};
