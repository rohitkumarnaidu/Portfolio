'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { useDevicePointer } from '@/hooks/useDevicePointer';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  side?: 'top' | 'bottom' | 'left' | 'right';
  showOnFocus?: boolean;
  className?: string;
}

export const Tooltip = ({
  content,
  children,
  delay = 300,
  side = 'top',
  showOnFocus = true,
  className,
}: TooltipProps) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const pointerType = useDevicePointer();
  const reducedMotion = useReducedMotion();

  const show = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  if (pointerType === 'coarse') {
    return <>{children}</>;
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={showOnFocus ? show : undefined}
      onBlur={showOnFocus ? hide : undefined}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 px-2 py-1 text-xs rounded-md whitespace-nowrap',
            'bg-surface-elevated text-text-secondary border border-border-accent',
            'shadow-lg pointer-events-none',
            reducedMotion ? 'opacity-100' : 'animate-fade-in',
            positionClasses[side],
            className
          )}
          style={reducedMotion ? undefined : { animationDuration: '100ms' }}
        >
          {content}
        </div>
      )}
    </div>
  );
};
