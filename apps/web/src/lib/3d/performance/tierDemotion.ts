'use client';

import { useState, useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import type { Tier } from '../types';

export const useTierDemotion = (initialTier: Tier) => {
  const [currentTier, setCurrentTier] = useState<Tier>(initialTier);
  const frameTimes = useRef<number[]>([]);
  const { performance } = useThree();

  const checkDemotion = useCallback(() => {
    frameTimes.current.push(performance.current);

    if (frameTimes.current.length >= 60) {
      const avgFPS =
        frameTimes.current.reduce((a, b) => a + b, 0) / 60;
      frameTimes.current = [];

      if (avgFPS < 20 && currentTier === 'high') {
        setCurrentTier('mid');
      } else if (avgFPS < 15 && currentTier === 'mid') {
        setCurrentTier('low');
      } else if (avgFPS < 10 && currentTier === 'low') {
        setCurrentTier('off');
      }
    }
  }, [currentTier, performance]);

  return { currentTier, checkDemotion };
};
