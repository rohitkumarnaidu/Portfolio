import type { PointerType } from '@/hooks/useDevicePointer';

interface DeviceCapabilities {
  pointerType: PointerType;
  reducedMotion: boolean;
  reducedTransparency: boolean;
  contrastPreference: 'more' | 'less' | 'no-preference';
  touchSupported: boolean;
  hoverSupported: boolean;
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

export function getDeviceCapabilities(): DeviceCapabilities {
  if (typeof window === 'undefined') {
    return {
      pointerType: 'fine',
      reducedMotion: false,
      reducedTransparency: false,
      contrastPreference: 'no-preference',
      touchSupported: false,
      hoverSupported: true,
    };
  }

  const fine = window.matchMedia('(pointer: fine)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;

  return {
    pointerType: fine ? 'fine' : coarse ? 'coarse' : 'none',
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    reducedTransparency: window.matchMedia('(prefers-reduced-transparency: reduce)').matches,
    contrastPreference: window.matchMedia('(prefers-contrast: more)').matches
      ? 'more'
      : window.matchMedia('(prefers-contrast: less)').matches
        ? 'less'
        : 'no-preference',
    touchSupported: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    hoverSupported: window.matchMedia('(hover: hover)').matches,
    deviceMemory: (navigator as unknown as Record<string, unknown>).deviceMemory as
      | number
      | undefined,
    hardwareConcurrency: navigator.hardwareConcurrency,
  };
}

export const TOUCH_TARGET = {
  MIN_SIZE: 44,
  MIN_SPACING: 8,
  EXPAND_BY: 8,
} as const;
