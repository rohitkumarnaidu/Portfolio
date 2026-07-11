'use client';

import { EffectComposer, Bloom } from '@react-three/postprocessing';
import type { Tier } from '@/lib/3d/types';

interface BloomEffectProps {
  tier: Tier;
}

export const BloomEffect = ({ tier }: BloomEffectProps) => {
  if (tier !== 'high') return null;

  return (
    <EffectComposer>
      <Bloom
        intensity={0.3}
        luminanceThreshold={0.6}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
    </EffectComposer>
  );
};
