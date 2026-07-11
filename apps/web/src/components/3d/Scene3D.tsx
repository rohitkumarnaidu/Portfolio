'use client';

import { Suspense, useState } from 'react';
import { SceneErrorBoundary } from './SceneErrorBoundary';
import { CanvasWrapper } from './CanvasWrapper';
import { SceneRegistry } from './SceneRegistry';
import { GradientFallback } from './fallbacks/GradientFallback';
import type { SceneType, Tier } from '@/lib/3d/types';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Scene3DProps {
  scene: SceneType;
  theme: 'light' | 'dark';
  initialTier?: Tier;
  onTierChange?: (tier: Tier) => void;
}

export const Scene3D = ({ scene, theme, initialTier = 'high', onTierChange }: Scene3DProps) => {
  const [tier, setTier] = useState<Tier>(initialTier);
  const reducedMotion = useReducedMotion();

  const handleDemote = (newTier: Tier) => {
    setTier(newTier);
    onTierChange?.(newTier);
  };

  const show3D = tier !== 'off' && !reducedMotion;

  return (
    <>
      {!show3D && <GradientFallback theme={theme} />}

      {show3D && (
        <SceneErrorBoundary initialTier={tier} onDemote={handleDemote}>
          <CanvasWrapper tier={tier}>
            <Suspense fallback={null}>
              <SceneRegistry
                scene={scene}
                tier={tier}
                theme={theme}
                reducedMotion={reducedMotion}
              />
            </Suspense>
          </CanvasWrapper>
        </SceneErrorBoundary>
      )}
    </>
  );
};
