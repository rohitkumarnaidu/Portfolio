import { getGPUTier } from 'detect-gpu';
import type { Tier } from '../types';

export const get3DTier = async (): Promise<Tier> => {
  // Always return 'off' for SSR
  if (typeof window === 'undefined') return 'off';

  try {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return 'off';

    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (conn?.saveData || conn?.effectiveType === 'slow-2g') return 'off';

    const gpu = await getGPUTier();
    const cores = navigator.hardwareConcurrency || 2;

    if (cores >= 8 && gpu.tier >= 2) return 'high';
    if (cores >= 4 && gpu.tier >= 1) return 'mid';
    
    // Safely assume mid if we have good cores but GPU detection failed or was low
    // Wait, let's stick to the specs in 08j
    if (cores >= 4 && gpu.tier === 0) return 'low';
    
    return 'low';
  } catch (error) {
    console.error('Failed to detect device capabilities', error);
    return 'low'; // Fallback to safe low tier on error
  }
};
