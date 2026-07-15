'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export type CursorState = 'default' | 'pointer' | 'text' | 'hidden' | 'loading' | 'grabbing';

const CLASSIFICATION_SELECTORS = {
  pointer:
    'a, button, [role="button"], [role="tab"], [role="menuitem"], input[type="submit"], input[type="button"]',
  text: 'input[type="text"], input[type="email"], input[type="search"], textarea, [contenteditable]',
  disabled: '[disabled], [aria-disabled="true"]',
  loading: '[aria-busy="true"]',
};

function classifyElement(el: Element | null): CursorState {
  if (!el) return 'default';
  if (el.matches(CLASSIFICATION_SELECTORS.loading)) return 'loading';
  if (el.matches(CLASSIFICATION_SELECTORS.disabled)) return 'default';
  if (el.closest(CLASSIFICATION_SELECTORS.text)) return 'text';
  if (el.closest(CLASSIFICATION_SELECTORS.pointer)) return 'pointer';
  return 'default';
}

export function useCursorState() {
  const [state, setState] = useState<CursorState>('default');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(true);
  const idleRef = useRef<ReturnType<typeof setTimeout>>();
  const posRef = useRef({ x: 0, y: 0 });

  const onMouseMove = useCallback((e: MouseEvent) => {
    posRef.current = { x: e.clientX, y: e.clientY };
    setPosition({ x: e.clientX, y: e.clientY });
    setVisible(true);

    clearTimeout(idleRef.current);
    idleRef.current = setTimeout(() => setVisible(false), 5000);

    setState(classifyElement(e.target as Element));
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseenter', () => setVisible(true));
    document.addEventListener('mouseleave', () => setVisible(false));

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseenter', () => setVisible(true));
      document.removeEventListener('mouseleave', () => setVisible(false));
      clearTimeout(idleRef.current);
    };
  }, [onMouseMove]);

  const setOverrideState = useCallback((s: CursorState) => {
    setState(s);
  }, []);

  return { state, position, visible, setOverrideState };
}
