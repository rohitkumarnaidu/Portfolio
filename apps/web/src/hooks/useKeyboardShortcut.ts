'use client';

import { useEffect, useCallback, useRef } from 'react';

interface KeyCombo {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
}

interface UseKeyboardShortcutOptions {
  ignoreInputs?: boolean;
  capture?: boolean;
  enabled?: boolean;
}

function matchCombo(e: KeyboardEvent, combo: KeyCombo): boolean {
  if (e.key.toLowerCase() !== combo.key.toLowerCase()) return false;
  if (combo.ctrl && !e.ctrlKey) return false;
  if (combo.meta && !e.metaKey) return false;
  if (combo.shift && !e.shiftKey) return false;
  if (combo.alt && !e.altKey) return false;
  if (!combo.ctrl && !combo.meta && (e.ctrlKey || e.metaKey)) return false;

  const modifierMatch = !!combo.ctrl === e.ctrlKey && !!combo.meta === e.metaKey;
  return modifierMatch;
}

function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
}

export function useKeyboardShortcut(
  combo: KeyCombo,
  handler: (e: KeyboardEvent) => void,
  options: UseKeyboardShortcutOptions = {}
): void {
  const { ignoreInputs = true, capture = false, enabled = true } = options;
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;
      if (ignoreInputs && isInputElement(e.target)) return;
      if (!matchCombo(e, combo)) return;

      e.preventDefault();
      handlerRef.current(e);
    },
    [combo, ignoreInputs, enabled]
  );

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown, { capture });
    return () => document.removeEventListener('keydown', onKeyDown, { capture });
  }, [onKeyDown, capture]);
}
