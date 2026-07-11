'use client';

import { useRef, useCallback, useEffect, useState } from 'react';

interface UseSwipeToCloseOptions {
  panelRef: React.RefObject<HTMLElement>;
  onClose: () => void;
  direction?: 'down' | 'left' | 'right';
  threshold?: number;
  springBack?: boolean;
}

export function useSwipeToClose({
  panelRef,
  onClose,
  direction = 'down',
  threshold = 0.3,
  springBack = true,
}: UseSwipeToCloseOptions) {
  const [offset, setOffset] = useState(0);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const currentRef = useRef(0);

  const handleTransitionEnd = useCallback(() => {
    if (currentRef.current >= threshold) {
      onClose();
    } else if (springBack) {
      setOffset(0);
    }
  }, [onClose, springBack, threshold]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]!;
      startRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!startRef.current) return;
      const touch = e.touches[0]!;
      const dx = touch.clientX - startRef.current.x;
      const dy = touch.clientY - startRef.current.y;

      const value = direction === 'down' ? dy : direction === 'left' ? -dx : dx;
      const maxDim = direction === 'down' ? window.innerHeight : window.innerWidth;
      currentRef.current = Math.max(0, value) / maxDim;
      setOffset(Math.max(0, value));
    };

    const onTouchEnd = () => {
      startRef.current = null;
      if (currentRef.current >= threshold) {
        onClose();
      } else if (springBack) {
        setOffset(0);
      }
      currentRef.current = 0;
    };

    panel.addEventListener('touchstart', onTouchStart, { passive: true });
    panel.addEventListener('touchmove', onTouchMove, { passive: true });
    panel.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      panel.removeEventListener('touchstart', onTouchStart);
      panel.removeEventListener('touchmove', onTouchMove);
      panel.removeEventListener('touchend', onTouchEnd);
    };
  }, [panelRef, direction, threshold, springBack, onClose]);

  const transform =
    direction === 'down'
      ? `translateY(${offset}px)`
      : `translateX(${direction === 'left' ? -offset : offset}px)`;

  return { offset, transform, handleTransitionEnd };
}
