'use client';

import { useState, useEffect, useRef } from 'react';

interface FocusVisibleState {
  isFocusVisible: boolean;
}

const KEYBOARD_KEYS = ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '];

export function useFocusVisible(): FocusVisibleState {
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (KEYBOARD_KEYS.includes(e.key)) {
        setIsFocusVisible(true);
        document.documentElement.classList.add('focus-visible-ring');
      }
    };

    const handlePointerDown = () => {
      setIsFocusVisible(false);
      document.documentElement.classList.remove('focus-visible-ring');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.documentElement.classList.remove('focus-visible-ring');
    };
  }, []);

  return { isFocusVisible };
}
