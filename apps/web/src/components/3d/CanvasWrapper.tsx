'use client';

import { Canvas } from '@react-three/fiber';
import type { Tier } from '@/lib/3d/types';
import { getDPR } from '@/lib/3d/performance/dprManager';

interface CanvasWrapperProps {
  tier: Tier;
  children: React.ReactNode;
}

export const CanvasWrapper = ({ tier, children }: CanvasWrapperProps) => {
  const dpr: [number, number] = tier === 'off' ? [1, 1] : getDPR(tier);

  return (
    <Canvas
      dpr={dpr}
      gl={{
        antialias: tier === 'high',
        alpha: true,
        powerPreference: tier === 'high' ? 'high-performance' : 'low-power',
        stencil: false,
        depth: true,
        preserveDrawingBuffer: false,
      }}
      camera={{ position: [0, 0, 5], fov: 60, near: 0.1, far: 100 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {children}
    </Canvas>
  );
};
