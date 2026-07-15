'use client';

import { useEffect } from 'react';

type ShortcutHandler = (e: KeyboardEvent) => void;

interface RegisteredShortcut {
  combo: { key: string; ctrl?: boolean; meta?: boolean; shift?: boolean; alt?: boolean };
  handler: ShortcutHandler;
  description: string;
}

class KeyboardShortcutRegistry {
  private shortcuts: Map<string, RegisteredShortcut> = new Map();
  private handler: ((e: KeyboardEvent) => void) | null = null;

  private getKey(combo: RegisteredShortcut['combo']): string {
    const parts: string[] = [];
    if (combo.ctrl) parts.push('Ctrl');
    if (combo.meta) parts.push('Meta');
    if (combo.shift) parts.push('Shift');
    if (combo.alt) parts.push('Alt');
    parts.push(combo.key);
    return parts.join('+');
  }

  register(shortcut: RegisteredShortcut): () => void {
    const key = this.getKey(shortcut.combo);
    this.shortcuts.set(key, shortcut);

    if (!this.handler) {
      this.handler = (e: KeyboardEvent) => {
        for (const [, s] of this.shortcuts) {
          const combo = s.combo;
          let match = e.key.toLowerCase() === combo.key.toLowerCase();
          if (combo.ctrl) match = match && e.ctrlKey;
          if (combo.meta) match = match && e.metaKey;
          if (combo.shift) match = match && e.shiftKey;
          if (combo.alt) match = match && e.altKey;
          if (!combo.ctrl && !combo.meta) match = match && !e.ctrlKey && !e.metaKey;

          if (match) {
            e.preventDefault();
            s.handler(e);
            return;
          }
        }
      };
      document.addEventListener('keydown', this.handler);
    }

    return () => {
      this.shortcuts.delete(key);
      if (this.shortcuts.size === 0 && this.handler) {
        document.removeEventListener('keydown', this.handler);
        this.handler = null;
      }
    };
  }

  getAll(): RegisteredShortcut[] {
    return Array.from(this.shortcuts.values());
  }
}

export const shortcutRegistry = new KeyboardShortcutRegistry();

export const ADMIN_SHORTCUTS = {
  SAVE: { key: 's', meta: true },
  DUPLICATE: { key: 'd', meta: true },
  DELETE: { key: 'Backspace', meta: true },
  PALETTE: { key: 'k', meta: true },
  HELP: { key: '?', shift: true },
  SUBMIT: { key: 'Enter', meta: true },
} as const;

export function useAdminShortcuts(handlers: Partial<Record<string, ShortcutHandler>>) {
  useEffect(() => {
    const unregisters: (() => void)[] = [];

    for (const [action, handler] of Object.entries(handlers)) {
      const combo = (ADMIN_SHORTCUTS as Record<string, { key: string; meta?: boolean }>)[action];
      if (combo && handler) {
        unregisters.push(
          shortcutRegistry.register({
            combo,
            handler,
            description: `Admin: ${action}`,
          }),
        );
      }
    }

    return () => unregisters.forEach((u) => u());
  }, [handlers]);
}
