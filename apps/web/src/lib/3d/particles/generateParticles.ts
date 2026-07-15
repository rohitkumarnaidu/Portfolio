import type { Tier } from '../types';

export interface ParticleField {
  positions: Float32Array;
  phases: Float32Array;
  speeds: Float32Array;
  sizes: Float32Array;
}

export const generateParticleField = (count: number, tier: Tier): ParticleField => {
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);
  const sizes = new Float32Array(count);

  const radius = tier === 'high' ? 4 : 3;

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * Math.cbrt(Math.random());

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi) * 0.5;

    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.5 + Math.random() * 0.5;

    if (tier === 'high') {
      sizes[i] = 15 + Math.random() * 10;
    } else if (tier === 'mid') {
      sizes[i] = 10 + Math.random() * 8;
    } else {
      sizes[i] = 5 + Math.random() * 5;
    }
  }

  return { positions, phases, speeds, sizes };
};
