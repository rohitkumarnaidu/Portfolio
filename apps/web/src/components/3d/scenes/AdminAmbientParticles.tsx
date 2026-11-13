'use client';

import { useRef, useMemo, useEffect, useContext, createContext } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Tier, HealthState } from '@/lib/3d/types';
import { generateParticleField } from '@/lib/3d/particles/generateParticles';

const HEALTH_TARGETS: Record<HealthState, THREE.Color> = {
  normal: new THREE.Color('#06b6d4'),
  loading: new THREE.Color('#f59e0b'),
  error: new THREE.Color('#ef4444'),
};

export const AdminHealthContext = createContext<{
  health: HealthState;
  setHealth: (h: HealthState) => void;
}>({
  health: 'normal',
  setHealth: () => {},
});

const vertexShader = `
uniform float uTime;
uniform float uSpeed;
uniform float uBreath;

attribute float aPhase;
attribute float aSpeed;
attribute float aSize;

varying float vAlpha;

void main() {
  vec3 pos = position;

  float t = uTime * uSpeed * (0.5 + aSpeed * 0.5);
  float warpX = sin(t * 0.5 + aPhase) * 0.2 * uBreath;
  float warpY = cos(t * 0.4 + aPhase * 1.3) * 0.2 * uBreath;
  float warpZ = sin(t * 0.2 + aPhase * 0.7) * 0.15 * uBreath;

  pos.x += warpX;
  pos.y += warpY;
  pos.z += warpZ;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = aSize * 0.3 * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;

  vAlpha = 0.4 + 0.3 * sin(t * 0.3 + aPhase);
}
`;

const fragmentShader = `
uniform vec3 uColor;
uniform float uGlow;

varying float vAlpha;

void main() {
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);

  if (dist > 0.5) discard;

  float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
  alpha *= alpha * vAlpha;

  vec3 color = uColor * (1.0 + uGlow * 0.2);

  gl_FragColor = vec4(color, alpha);
}
`;

interface AdminAmbientParticlesProps {
  tier: Tier;
  theme: 'light' | 'dark';
  reducedMotion: boolean;
}

export const AdminAmbientParticles = ({
  tier,
  theme: _theme,
  reducedMotion,
}: AdminAmbientParticlesProps) => {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const { clock } = useThree();
  const { health } = useContext(AdminHealthContext);
  const currentColorRef = useRef(new THREE.Color('#06b6d4'));
  const glowRef = useRef(0);

  const count = tier === 'high' ? 30 : 20;

  const { positions, phases, speeds, sizes } = useMemo(
    () => generateParticleField(count, tier),
    [count, tier],
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute(
      'aSize',
      new THREE.BufferAttribute(
        sizes.map((s) => s * 0.3),
        1,
      ),
    );
    return geo;
  }, [positions, phases, speeds, sizes]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: tier === 'high' ? 0.5 : 0.3 },
        uBreath: { value: 1.0 },
        uColor: { value: new THREE.Color('#06b6d4') },
        uGlow: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [tier]);

  useEffect(() => {
    materialRef.current = material;
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame(() => {
    if (!material || reducedMotion) return;
    const elapsed = clock.getElapsedTime();
    const breath = 0.5 + 0.5 * Math.sin(elapsed * 0.15);

    material.uniforms.uTime!.value = elapsed;
    material.uniforms.uBreath!.value = breath;

    const target = HEALTH_TARGETS[health];
    currentColorRef.current.lerp(target, 0.03);
    material.uniforms.uColor!.value = currentColorRef.current;

    glowRef.current *= 0.95;
    material.uniforms.uGlow!.value = glowRef.current;
  });

  useEffect(() => {
    glowRef.current = 0.4;
  }, [health]);

  if (reducedMotion || tier === 'off') return null;

  return <points ref={meshRef} geometry={geometry} material={material} />;
};
