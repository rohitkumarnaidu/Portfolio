'use client';

import { useState, useEffect } from 'react';

export type PointerType = 'fine' | 'coarse' | 'none';

export function useDevicePointer(): PointerType {
  const [pointerType, setPointerType] = useState<PointerType>('fine');

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;

    if (fine) setPointerType('fine');
    else if (coarse) setPointerType('coarse');
    else setPointerType('none');
  }, []);

  return pointerType;
}

export function useHoverSupported(): boolean {
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(window.matchMedia('(hover: hover)').matches);
  }, []);

  return supported;
}
