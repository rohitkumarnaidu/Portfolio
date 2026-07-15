'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UsePullToRefreshOptions {
  containerRef: React.RefObject<HTMLElement>;
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPull?: number;
  enabled?: boolean;
}

interface UsePullToRefreshReturn {
  pullProgress: number;
  isRefreshing: boolean;
}

export function usePullToRefresh({
  containerRef,
  onRefresh,
  threshold = 80,
  maxPull = 120,
  enabled = true,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const [pullProgress, setPullProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const pullingRef = useRef(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullProgress(0);
    }
  }, [onRefresh]);

  useEffect(() => {
    if (!enabled) return;

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 0) return;
      startYRef.current = e.touches[0]!.clientY;
      pullingRef.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pullingRef.current || isRefreshing) return;
      const dy = e.touches[0]!.clientY - startYRef.current;
      if (dy <= 0) {
        setPullProgress(0);
        return;
      }
      const progress = Math.min(dy / threshold, 1);
      const easedProgress =
        progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      setPullProgress(Math.min((easedProgress * maxPull) / threshold, 1));
    };

    const onTouchEnd = () => {
      if (!pullingRef.current || isRefreshing) return;
      pullingRef.current = false;
      if (pullProgress >= 1) {
        handleRefresh();
      } else {
        setPullProgress(0);
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [enabled, isRefreshing, pullProgress, threshold, maxPull, handleRefresh, containerRef]);

  return { pullProgress, isRefreshing };
}
