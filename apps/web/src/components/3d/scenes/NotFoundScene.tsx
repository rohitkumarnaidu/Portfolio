'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import type { Tier } from '@/lib/3d/types';

interface NotFoundSceneProps {
  tier: Tier;
  theme: 'light' | 'dark';
  reducedMotion: boolean;
}

export const NotFoundScene = ({ tier, theme, reducedMotion }: NotFoundSceneProps) => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (reducedMotion || tier === 'off' || !meshRef.current) return;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
  });

  if (reducedMotion || tier === 'off') return null;

  return (
    <group>
      <ambientLight intensity={0.2} />
      <pointLight
        position={[2, 2, 2]}
        intensity={0.5}
        color={theme === 'dark' ? '#f87171' : '#ef4444'}
      />
      <mesh ref={meshRef}>
        <torusGeometry args={[1, 0.3, 16, 32]} />
        <meshStandardMaterial
          color={theme === 'dark' ? '#f87171' : '#ef4444'}
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
};
