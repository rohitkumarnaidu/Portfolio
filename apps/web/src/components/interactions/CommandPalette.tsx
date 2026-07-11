'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { commandRegistry, DEFAULT_COMMANDS } from '@/lib/interactions/commandRegistry';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  scopedCommands?: Array<{ id: string; label: string; action: () => void }>;
}

export const CommandPalette = ({ open, onClose, scopedCommands }: CommandPaletteProps) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useFocusTrap({
    containerRef: containerRef as React.RefObject<HTMLElement>,
    active: open,
    initialFocus: 'first',
    onEscape: onClose,
  });

  useKeyboardShortcut(
    { key: 'k', meta: true },
    onClose,
    { enabled: open, ignoreInputs: false }
  );

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filteredCommands = useMemo(() => {
    const queryLower = query.toLowerCase().trim();

    const allCommands = DEFAULT_COMMANDS.map((cmd) => ({
      ...cmd,
      action: () => {
        switch (cmd.id) {
          case 'nav-home':
            window.location.href = '/';
            break;
          case 'nav-projects':
            window.location.href = '/projects';
            break;
          case 'nav-blog':
            window.location.href = '/blog';
            break;
          case 'nav-contact':
            window.location.href = '/contact';
            break;
          case 'action-chat':
            document.dispatchEvent(new CustomEvent('toggle-chat'));
            break;
          case 'admin-dashboard':
            window.location.href = '/admin';
            break;
          case 'admin-sections':
            window.location.href = '/admin/sections';
            break;
        }
        onClose();
      },
    }));

    if (scopedCommands) {
      allCommands.push(
        ...scopedCommands.map((cmd) => ({
          id: cmd.id,
          label: cmd.label,
          description: '',
          category: 'actions' as const,
          keywords: [cmd.label.toLowerCase()],
          icon: '',
          shortcut: '',
          action: () => {
            cmd.action();
            onClose();
          },
          predicate: undefined,
        }))
      );
    }

    return commandRegistry.search(queryLower).length > 0
      ? commandRegistry.search(queryLower)
      : allCommands.filter((cmd) => {
          if (!queryLower) return true;
          return (
            cmd.label.toLowerCase().includes(queryLower) ||
            cmd.keywords.some((k) => k.includes(queryLower))
          );
        });
  }, [query, scopedCommands, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
      }
    },
    [filteredCommands, selectedIndex]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className={cn(
          'relative w-full max-w-lg rounded-xl shadow-2xl overflow-hidden',
          'bg-surface-primary border border-border-accent',
          reducedMotion ? '' : 'animate-fade-in'
        )}
        style={reducedMotion ? undefined : { animationDuration: '150ms' }}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-accent">
          <svg className="w-4 h-4 text-text-tertiary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-tertiary outline-none"
            aria-label="Search commands"
          />
          <kbd className="hidden sm:inline-flex text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-tertiary border border-border-accent">
            ESC
          </kbd>
        </div>

        <div className="max-h-72 overflow-y-auto p-2">
          {filteredCommands.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-text-tertiary">
              No results found for &quot;{query}&quot;
            </div>
          )}

          {filteredCommands.length > 0 && (
            <div className="space-y-0.5">
              {filteredCommands.map((cmd, index) => (
                <button
                  key={cmd.id}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                    'text-sm text-text-primary',
                    index === selectedIndex
                      ? 'bg-accent-500/10 text-accent-500'
                      : 'hover:bg-surface-elevated'
                  )}
                >
                  <span className="flex-1 truncate">{cmd.label}</span>
                  {cmd.shortcut && (
                    <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-tertiary">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 px-4 py-2 border-t border-border-accent bg-surface-elevated/50">
          <span className="text-[10px] text-text-tertiary">
            <kbd className="px-1 rounded bg-surface-elevated">↑↓</kbd> Navigate
          </span>
          <span className="text-[10px] text-text-tertiary">
            <kbd className="px-1 rounded bg-surface-elevated">↵</kbd> Select
          </span>
          <span className="text-[10px] text-text-tertiary">
            <kbd className="px-1 rounded bg-surface-elevated">Esc</kbd> Close
          </span>
        </div>
      </div>
    </div>
  );
};
