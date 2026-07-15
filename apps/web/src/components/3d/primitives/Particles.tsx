'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Tier } from '@/lib/3d/types';
import { generateParticleField } from '@/lib/3d/particles/generateParticles';
import { createParticleMaterial } from '@/lib/3d/shaders/materials';

interface ParticlesProps {
  count: number;
  tier: Tier;
  theme: 'light' | 'dark';
  reducedMotion: boolean;
}

export const Particles = ({ count, tier, theme, reducedMotion }: ParticlesProps) => {
  const meshRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const idleRef = useRef(false);
  const { clock } = useThree();

  const { positions, phases, speeds, sizes } = useMemo(
    () => generateParticleField(count, tier),
    [count, tier],
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, phases, speeds, sizes]);

  const material = useMemo(
    () => createParticleMaterial({ tier, scene: 'hero', theme }),
    [tier, theme],
  );

  useFrame(() => {
    if (!material || reducedMotion) return;
    const elapsed = clock.getElapsedTime();
    const breath = 0.5 + 0.5 * Math.sin(elapsed * 0.2);

    material.uniforms.uTime!.value = elapsed;
    material.uniforms.uBreath!.value = breath;
    material.uniforms.uIdle!.value = idleRef.current ? 1.0 : 0.0;

    const spring = 0.08;
    const dx = mouseRef.current.targetX - mouseRef.current.x;
    const dy = mouseRef.current.targetY - mouseRef.current.y;
    mouseRef.current.x += dx * spring;
    mouseRef.current.y += dy * spring;

    material.uniforms.uMouse!.value = [mouseRef.current.x * 0.5, mouseRef.current.y * 0.3];
  });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
      idleRef.current = false;
    };

    let idleTimer: ReturnType<typeof setTimeout>;
    const resetIdle = () => {
      clearTimeout(idleTimer);
      idleRef.current = false;
      idleTimer = setTimeout(() => {
        idleRef.current = true;
      }, 30000);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', resetIdle, { passive: true });
    resetIdle();

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', resetIdle);
      clearTimeout(idleTimer);
    };
  }, []);

  useEffect(() => {
    if (material) {
      material.uniforms.uMixFactor!.value = theme === 'dark' ? 1.0 : 0.0;
    }
  }, [theme, material]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  if (reducedMotion || tier === 'off') return null;

  return <points ref={meshRef} geometry={geometry} material={material} />;
};
