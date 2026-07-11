'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseFocusTrapOptions {
  containerRef: React.RefObject<HTMLElement>;
  active: boolean;
  initialFocus?: 'first' | 'last' | React.RefObject<HTMLElement>;
  onEscape?: () => void;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]',
].join(', ');

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

export function useFocusTrap({
  containerRef,
  active,
  initialFocus = 'first',
  onEscape,
}: UseFocusTrapOptions): void {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const getInitialElement = useCallback(
    (focusable: HTMLElement[]): HTMLElement | null => {
      if (initialFocus === 'first') return focusable[0] ?? null;
      if (initialFocus === 'last') return focusable[focusable.length - 1] ?? null;
      return initialFocus.current;
    },
    [initialFocus]
  );

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    previousFocusRef.current = document.activeElement as HTMLElement;

    const focusable = getFocusableElements(container);
    const target = getInitialElement(focusable);
    target?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }

      if (e.key !== 'Tab') return;

      const currentFocusable = getFocusableElements(container);
      if (currentFocusable.length === 0) return;

      const first = currentFocusable[0]!;
      const last = currentFocusable[currentFocusable.length - 1]!;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [active, containerRef, getInitialElement, onEscape]);
}
