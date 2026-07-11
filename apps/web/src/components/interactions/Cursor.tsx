'use client';

import { useEffect, useRef } from 'react';
import { useCursorState } from '@/hooks/useCursorState';
import { useDevicePointer } from '@/hooks/useDevicePointer';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { CursorState } from '@/hooks/useCursorState';

const STATE_CONFIG: Record<CursorState, { size: number; borderWidth: number; color: string }> = {
  default: { size: 6, borderWidth: 1.5, color: '#6366f1' },
  pointer: { size: 8, borderWidth: 2, color: '#818cf8' },
  text: { size: 2, borderWidth: 0, color: '#6366f1' },
  hidden: { size: 0, borderWidth: 0, color: 'transparent' },
  loading: { size: 16, borderWidth: 2.5, color: '#6366f1' },
  grabbing: { size: 10, borderWidth: 2, color: '#818cf8' },
};

export const Cursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);
  const pointerType = useDevicePointer();
  const reducedMotion = useReducedMotion();
  const { state, position, visible } = useCursorState();

  useEffect(() => {
    if (pointerType !== 'fine' || reducedMotion) return;

    const config = STATE_CONFIG[state];

    const animate = () => {
      if (!dotRef.current || !ringRef.current) return;

      const spring = 0.12;
      posRef.current.x += (position.x - posRef.current.x) * spring;
      posRef.current.y += (position.y - posRef.current.y) * spring;

      dotRef.current.style.transform = `translate(${posRef.current.x - config.size / 2}px, ${posRef.current.y - config.size / 2}px)`;
      ringRef.current.style.transform = `translate(${posRef.current.x - config.size / 2 - 4}px, ${posRef.current.y - config.size / 2 - 4}px)`;
      ringRef.current.style.width = `${config.size + 8}px`;
      ringRef.current.style.height = `${config.size + 8}px`;

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [pointerType, reducedMotion, position, state]);

  if (pointerType !== 'fine' || reducedMotion) return null;

  const config = STATE_CONFIG[state];

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          width: config.size,
          height: config.size,
          backgroundColor: config.color,
          borderRadius: '50%',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease, background-color 0.2s ease',
        }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full"
        style={{
          border: `${config.borderWidth}px solid ${config.color}`,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease, border-color 0.2s ease',
        }}
      />
    </>
  );
};
