'use client';

import { useEffect, useRef } from 'react';

interface UseFocusOnMountOptions {
  ref: React.RefObject<HTMLElement>;
  fallbackSelector?: string;
  skip?: boolean;
}

export function useFocusOnMount({
  ref,
  fallbackSelector,
  skip = false,
}: UseFocusOnMountOptions): void {
  const mounted = useRef(false);

  useEffect(() => {
    if (skip || mounted.current) return;
    mounted.current = true;

    const target = ref.current || document.querySelector(fallbackSelector ?? '');
    if (target instanceof HTMLElement) {
      target.focus();
    }
  }, [ref, fallbackSelector, skip]);
}
