'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useDevicePointer } from '@/hooks/useDevicePointer';

interface ScrollProviderProps {
  children: React.ReactNode;
  smooth?: boolean;
}

interface LenisInstance {
  raf: (time: number) => void;
  destroy: () => void;
}

let globalLenis: LenisInstance | null = null;

export function getLenis(): LenisInstance | null {
  return globalLenis;
}

export const ScrollProvider = ({ children, smooth = true }: ScrollProviderProps) => {
  const [LenisConstructor, setLenisConstructor] = useState<{
    new (options: Record<string, unknown>): LenisInstance;
  } | null>(null);
  const lenisRef = useRef<LenisInstance | null>(null);
  const rafRef = useRef<number>(0);
  const reducedMotion = useReducedMotion();
  const pointerType = useDevicePointer();
  const shouldSmooth = smooth && !reducedMotion && pointerType === 'fine';

  useEffect(() => {
    if (!shouldSmooth) return;

    let mounted = true;

    const loadLenis = async () => {
      try {
        const Lenis = (await import('lenis')).default;
        if (!mounted) return;

        setLenisConstructor(() => Lenis);
      } catch {
        // Lenis failed to load — native scroll is fine
      }
    };

    loadLenis();

    return () => {
      mounted = false;
    };
  }, [shouldSmooth]);

  useEffect(() => {
    if (!LenisConstructor || !shouldSmooth) return;

    const lenis = new LenisConstructor({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 2,
      wheelMultiplier: 1,
    });

    lenisRef.current = lenis;
    globalLenis = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      lenisRef.current = null;
      globalLenis = null;
    };
  }, [LenisConstructor, shouldSmooth]);

  return <>{children}</>;
};
