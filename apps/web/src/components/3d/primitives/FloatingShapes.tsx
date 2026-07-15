'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import type { Tier } from '@/lib/3d/types';

interface FloatingShapesProps {
  tier: Tier;
  theme: 'light' | 'dark';
  reducedMotion: boolean;
}

const SHAPES = [
  { type: 'box' as const, position: [-2, 1, -1] as [number, number, number], color: '#6366f1' },
  {
    type: 'sphere' as const,
    position: [2.5, -0.5, -2] as [number, number, number],
    color: '#22d3ee',
  },
  {
    type: 'torus' as const,
    position: [-1.5, -1.5, -3] as [number, number, number],
    color: '#a78bfa',
  },
  {
    type: 'octahedron' as const,
    position: [1.8, 1.8, -1.5] as [number, number, number],
    color: '#67e8f9',
  },
];

export const FloatingShapes = ({ tier, theme, reducedMotion }: FloatingShapesProps) => {
  if (reducedMotion || tier !== 'high') return null;

  return (
    <group>
      {SHAPES.map((shape, index) => (
        <FloatingShape
          key={index}
          type={shape.type}
          position={shape.position}
          color={theme === 'dark' ? shape.color : shape.color}
          speed={0.5 + index * 0.2}
        />
      ))}
    </group>
  );
};

interface FloatingShapeProps {
  type: 'box' | 'sphere' | 'torus' | 'octahedron';
  position: [number, number, number];
  color: string;
  speed: number;
}

const FloatingShape = ({ type, position, color, speed }: FloatingShapeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    switch (type) {
      case 'box':
        return new THREE.BoxGeometry(0.4, 0.4, 0.4);
      case 'sphere':
        return new THREE.SphereGeometry(0.3, 16, 16);
      case 'torus':
        return new THREE.TorusGeometry(0.25, 0.1, 8, 16);
      case 'octahedron':
        return new THREE.OctahedronGeometry(0.35);
    }
  }, [type]);

  useFrame((_state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += 0.005 * speed;
    meshRef.current.rotation.y += 0.01 * speed;
  });

  return (
    <Float speed={speed} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position} geometry={geometry}>
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.4}
          roughness={0.2}
          metalness={0.8}
          envMapIntensity={0.5}
        />
      </mesh>
    </Float>
  );
};
