'use client';

import { useEffect, useRef } from 'react';

interface PinchEvent {
  scale: number;
  initialDistance: number;
  currentDistance: number;
  center: { x: number; y: number };
}

interface UsePinchOptions {
  threshold?: number;
  ref?: React.RefObject<HTMLElement>;
}

export function usePinch(
  onPinch: (event: PinchEvent) => void,
  options: UsePinchOptions = {}
): void {
  const { threshold = 0.1 } = options;
  const pinchRef = useRef<{
    initialDistance: number;
    lastScale: number;
  } | null>(null);

  const getDistance = (t1: Touch, t2: Touch): number => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCenter = (t1: Touch, t2: Touch): { x: number; y: number } => ({
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  });

  useEffect(() => {
    const el = options.ref?.current || window;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const t0 = e.touches[0]!;
        const t1 = e.touches[1]!;
        const distance = getDistance(t0, t1);
        pinchRef.current = { initialDistance: distance, lastScale: 1 };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        const t0 = e.touches[0]!;
        const t1 = e.touches[1]!;
        const currentDistance = getDistance(t0, t1);
        const scale = currentDistance / pinchRef.current.initialDistance;
        const scaleDelta = Math.abs(scale - pinchRef.current.lastScale);

        if (scaleDelta >= threshold) {
          pinchRef.current.lastScale = scale;
          onPinch({
            scale,
            initialDistance: pinchRef.current.initialDistance,
            currentDistance,
            center: getCenter(t0, t1),
          });
        }
      }
    };

    const onTouchEnd = () => {
      pinchRef.current = null;
    };

    el.addEventListener('touchstart', onTouchStart as EventListener, { passive: true });
    el.addEventListener('touchmove', onTouchMove as EventListener, { passive: true });
    el.addEventListener('touchend', onTouchEnd as EventListener, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart as EventListener);
      el.removeEventListener('touchmove', onTouchMove as EventListener);
      el.removeEventListener('touchend', onTouchEnd as EventListener);
    };
  }, [onPinch, threshold, options.ref]);
}
