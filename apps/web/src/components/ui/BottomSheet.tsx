'use client';

import { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useSwipeToClose } from '@/hooks/useSwipeToClose';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[];
  initialSnap?: number;
  dragHandle?: boolean;
  className?: string;
}

export const BottomSheet = ({
  open,
  onClose,
  children,
  snapPoints = [25, 50, 85],
  initialSnap = 0,
  dragHandle = true,
  className,
}: BottomSheetProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [currentSnap] = useState(initialSnap);
  const reducedMotion = useReducedMotion();

  useFocusTrap({
    containerRef: panelRef as React.RefObject<HTMLElement>,
    active: open,
    onEscape: onClose,
  });

  const { transform: _transform, handleTransitionEnd } = useSwipeToClose({
    panelRef: panelRef as React.RefObject<HTMLElement>,
    onClose,
    direction: 'down',
    threshold: 0.4,
    springBack: !reducedMotion,
  });

  const height = snapPoints[currentSnap];

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Bottom sheet"
        className={cn(
          'relative w-full bg-surface-primary rounded-t-xl shadow-xl',
          'flex flex-col',
          reducedMotion ? '' : 'transition-transform duration-300 ease-out',
          className
        )}
        style={{
          height: `${height}vh`,
          transform: open ? 'translateY(0)' : undefined,
          ...(reducedMotion ? {} : { transition: 'transform 0.3s ease-out' }),
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {dragHandle && (
          <div className="flex justify-center pt-2 pb-4">
            <div className="w-10 h-1.5 rounded-full bg-border-accent" />
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
};
