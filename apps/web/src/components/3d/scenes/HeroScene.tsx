'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Tier } from '@/lib/3d/types';
import { FloatingShapes } from '../primitives/FloatingShapes';
import { Particles } from '../primitives/Particles';

interface HeroSceneProps {
  tier: Tier;
  theme: 'light' | 'dark';
  reducedMotion: boolean;
}

export const HeroScene = ({ tier, theme, reducedMotion }: HeroSceneProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const clockRef = useRef(new THREE.Clock());

  useFrame(() => {
    if (reducedMotion || tier === 'off' || !groupRef.current) return;
    const elapsed = clockRef.current.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(elapsed * 0.05) * 0.1;
    groupRef.current.position.y = Math.sin(elapsed * 0.1) * 0.05;
  });

  useEffect(() => {
    if (reducedMotion || tier === 'off') return;
    const clock = clockRef.current;
    clock.start();
    return () => clock.stop();
  }, [reducedMotion, tier]);

  if (reducedMotion || tier === 'off') return null;

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={theme === 'dark' ? 0.8 : 0.5}
        color={theme === 'dark' ? '#818cf8' : '#6366f1'}
      />
      <FloatingShapes tier={tier} theme={theme} reducedMotion={reducedMotion} />
      <Particles count={tier === 'high' ? 2000 : 500} tier={tier} theme={theme} reducedMotion={reducedMotion} />
    </group>
  );
};
