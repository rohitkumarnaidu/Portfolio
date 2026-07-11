import type { Tier } from '../types';

export const getDPR = (tier: Tier): [number, number] => {
  if (tier === 'off') return [1, 1];
  if (tier === 'low') return [1, 1];
  if (tier === 'mid') return [1, 1.5];
  return [1, Math.min(window.devicePixelRatio, 2)];
};

export const clampDPR = (dpr: number, tier: Tier): number => {
  const [, max] = getDPR(tier);
  return Math.min(dpr, max);
};
