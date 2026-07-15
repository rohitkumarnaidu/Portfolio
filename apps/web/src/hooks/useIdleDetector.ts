'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { IdleState } from '@/lib/3d/types';

export const useIdleDetector = (threshold = 30000): IdleState => {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (isIdle) setIsIdle(false);
    timerRef.current = setTimeout(() => setIsIdle(true), threshold);
  }, [threshold, isIdle]);

  useEffect(() => {
    const events = ['pointermove', 'pointerdown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  return { isIdle, lastActivity: Date.now() };
};
