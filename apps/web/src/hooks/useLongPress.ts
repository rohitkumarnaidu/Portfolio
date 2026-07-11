'use client';

import { useRef, useCallback } from 'react';

interface UseLongPressOptions {
  threshold?: number;
  moveTolerance?: number;
  preventDefault?: boolean;
}

export function useLongPress(
  onLongPress: (event: PointerEvent) => void,
  options: UseLongPressOptions = {}
) {
  const { threshold = 500, moveTolerance = 10, preventDefault = false } = options;
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const firedRef = useRef(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (preventDefault) e.preventDefault();
      firedRef.current = false;
      startRef.current = { x: e.clientX, y: e.clientY };

      timerRef.current = setTimeout(() => {
        firedRef.current = true;
        onLongPress(e.nativeEvent);
      }, threshold);
    },
    [onLongPress, threshold, preventDefault]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startRef.current || firedRef.current) return;
      const dx = Math.abs(e.clientX - startRef.current.x);
      const dy = Math.abs(e.clientY - startRef.current.y);

      if (dx > moveTolerance || dy > moveTolerance) {
        clearTimeout(timerRef.current);
        startRef.current = null;
      }
    },
    [moveTolerance]
  );

  const onPointerUp = useCallback(() => {
    clearTimeout(timerRef.current);
    startRef.current = null;
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp };
}
