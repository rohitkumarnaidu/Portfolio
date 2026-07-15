'use client';

import { useEffect, useRef, useCallback } from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface SwipeEvent {
  direction: SwipeDirection;
  distance: number;
  velocity: number;
  target: EventTarget;
}

interface UseSwipeOptions {
  threshold?: number;
  directions?: SwipeDirection[];
  preventScroll?: boolean;
  ref?: React.RefObject<HTMLElement>;
}

export function useSwipe(
  onSwipe: (event: SwipeEvent) => void,
  options: UseSwipeOptions = {},
): void {
  const { threshold = 50, directions, preventScroll } = options;
  const startRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const getDirection = useCallback(
    (dx: number, dy: number): SwipeDirection | null => {
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      let dir: SwipeDirection;
      if (absDx > absDy) {
        dir = dx > 0 ? 'right' : 'left';
      } else {
        dir = dy > 0 ? 'down' : 'up';
      }

      if (directions && !directions.includes(dir)) return null;
      return dir;
    },
    [directions],
  );

  useEffect(() => {
    const el = options.ref?.current || window;

    const onTouchStart = (e: TouchEvent) => {
      if (preventScroll && options.ref?.current) {
        (options.ref.current as HTMLElement).style.touchAction = 'none';
      }
      const touch = e.touches[0]!;
      startRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!startRef.current) return;

      if (preventScroll && options.ref?.current) {
        (options.ref.current as HTMLElement).style.touchAction = '';
      }

      const touch = e.changedTouches[0]!;
      const dx = touch.clientX - startRef.current.x;
      const dy = touch.clientY - startRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const dt = Date.now() - startRef.current.time;
      const velocity = dt > 0 ? distance / dt : 0;

      if (distance < threshold) {
        startRef.current = null;
        return;
      }

      const direction = getDirection(dx, dy);
      if (!direction) {
        startRef.current = null;
        return;
      }

      startRef.current = null;
      onSwipe({ direction, distance, velocity, target: e.target! });
    };

    el.addEventListener('touchstart', onTouchStart as EventListener, { passive: true });
    el.addEventListener('touchend', onTouchEnd as EventListener, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart as EventListener);
      el.removeEventListener('touchend', onTouchEnd as EventListener);
    };
  }, [onSwipe, threshold, getDirection, options.ref, preventScroll]);
}
