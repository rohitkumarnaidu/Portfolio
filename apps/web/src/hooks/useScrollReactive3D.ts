'use client';

import { useRef, useCallback, useEffect } from 'react';

export const useScrollReactive3D = () => {
  const scrollProgress = useRef(0);
  const targetScroll = useRef(0);

  const onScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    targetScroll.current = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  const getScrollProgress = useCallback(() => {
    const spring = 0.05;
    scrollProgress.current += (targetScroll.current - scrollProgress.current) * spring;
    return scrollProgress.current;
  }, []);

  return { getScrollProgress, scrollProgress };
};
