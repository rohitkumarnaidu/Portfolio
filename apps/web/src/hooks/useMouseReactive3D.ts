'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import type { Tier } from '@/lib/3d/types';

export const useMouseReactive3D = (tier: Tier) => {
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const { size } = useThree();

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      mouse.current.targetX = (e.clientX / size.width) * 2 - 1;
      mouse.current.targetY = -(e.clientY / size.height) * 2 + 1;
    },
    [size]
  );

  useEffect(() => {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () =>
      window.removeEventListener('pointermove', onPointerMove);
  }, [onPointerMove]);

  useFrame(() => {
    if (tier === 'off') return;

    const spring = 0.08;
    const dx = mouse.current.targetX - mouse.current.x;
    const dy = mouse.current.targetY - mouse.current.y;

    mouse.current.x += dx * spring;
    mouse.current.y += dy * spring;
  });

  return mouse;
};
