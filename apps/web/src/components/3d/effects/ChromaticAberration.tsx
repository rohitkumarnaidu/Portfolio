'use client';

import { EffectComposer, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';
import type { Tier } from '@/lib/3d/types';

interface ChromaticAberrationEffectProps {
  tier: Tier;
}

export const ChromaticAberrationEffect = ({ tier }: ChromaticAberrationEffectProps) => {
  if (tier !== 'high') return null;

  return (
    <EffectComposer>
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new Vector2(0.002, 0.001)}
        radialModulation={false}
        modulationOffset={0}
      />
    </EffectComposer>
  );
};
