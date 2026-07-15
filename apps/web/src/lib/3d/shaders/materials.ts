import { ShaderMaterial, Color } from 'three';
import type { Tier } from '../types';
import { particleWarp, particleColor } from './shaders';

const THEME_COLORS = {
  light: new Color('#6366f1'),
  dark: new Color('#818cf8'),
};

interface ParticleMaterialOptions {
  tier: Tier;
  scene?: 'hero' | 'notFound';
  theme: 'light' | 'dark';
  glowIntensity?: number;
}

export const createParticleMaterial = (options: ParticleMaterialOptions): ShaderMaterial => {
  const glowIntensity = options.glowIntensity ?? (options.tier === 'high' ? 0.5 : 0);

  return new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSpeed: { value: options.tier === 'high' ? 1.0 : options.tier === 'mid' ? 0.5 : 0.3 },
      uBreath: { value: 1.0 },
      uMouse: { value: [0, 0] },
      uIdle: { value: 0 },
      uTier: { value: options.tier === 'high' ? 1.0 : options.tier === 'mid' ? 0.6 : 0.3 },
      uLightColor: { value: THEME_COLORS.light },
      uDarkColor: { value: THEME_COLORS.dark },
      uMixFactor: { value: options.theme === 'dark' ? 1.0 : 0.0 },
      uGlowIntensity: { value: glowIntensity },
    },
    vertexShader: particleWarp,
    fragmentShader: particleColor,
    transparent: true,
    depthWrite: false,
    blending: 2,
  });
};
