import type { Tier } from '../types';

const FRAME_BUDGETS: Record<Tier, number> = {
  high: 1000 / 60,
  mid: 1000 / 30,
  low: 1000 / 15,
  off: Infinity,
};

export const getFrameBudget = (tier: Tier): number => FRAME_BUDGETS[tier];

export const capFramerate = (tier: Tier, callback: (timestamp: number) => void): (() => void) => {
  if (tier === 'off') return () => {};

  const budget = FRAME_BUDGETS[tier];
  let lastTick = 0;
  let rafId: number;

  const loop = (timestamp: number) => {
    rafId = requestAnimationFrame(loop);
    const delta = timestamp - lastTick;
    if (delta >= budget) {
      lastTick = timestamp - (delta % budget);
      callback(timestamp);
    }
  };

  rafId = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(rafId);
};
