'use client';

import { useMemo } from 'react';
import type { Tier } from '@/lib/3d/types';
import { getLightColor } from '@/lib/3d/lighting/themeColors';

interface LightingSystemProps {
  tier: Tier;
  theme: 'light' | 'dark';
}

export const LightingSystem = ({ tier, theme }: LightingSystemProps) => {
  const colors = useMemo(
    () => ({
      primary: getLightColor(theme, 'primary'),
      ambient: getLightColor(theme, 'ambient'),
      accent: getLightColor(theme, 'accent'),
    }),
    [theme]
  );

  if (tier === 'off') return null;

  return (
    <>
      <ambientLight
        intensity={tier === 'high' ? 0.4 : 0.2}
        color={colors.ambient}
      />
      <directionalLight
        position={[5, 5, 5]}
        intensity={tier === 'high' ? 0.8 : tier === 'mid' ? 0.5 : 0.3}
        color={colors.primary}
      />
      <directionalLight
        position={[-3, 2, -2]}
        intensity={tier === 'high' ? 0.4 : 0.2}
        color={colors.accent}
      />
      <pointLight
        position={[0, 3, 2]}
        intensity={tier === 'high' ? 0.3 : 0.1}
        color={colors.accent}
      />
    </>
  );
};
