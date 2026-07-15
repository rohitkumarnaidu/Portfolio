'use client';

import { useState, useCallback } from 'react';

export interface Command {
  id: string;
  label: string;
  description?: string;
  category: 'navigation' | 'actions' | 'admin' | 'ai';
  keywords: string[];
  icon?: string;
  shortcut?: string;
  action: () => void | Promise<void>;
  predicate?: () => boolean;
}

class CommandRegistryClass {
  private commands: Map<string, Command> = new Map();

  register(command: Command): () => void {
    this.commands.set(command.id, command);
    return () => this.commands.delete(command.id);
  }

  unregister(id: string): void {
    this.commands.delete(id);
  }

  search(query: string): Command[] {
    if (!query.trim()) {
      return this.getAll().slice(0, 10);
    }

    const lower = query.toLowerCase();
    const scored = this.getAll().map((cmd) => {
      let score = 0;
      if (cmd.label.toLowerCase().includes(lower)) score += 10;
      if (cmd.label.toLowerCase().startsWith(lower)) score += 5;
      if (cmd.keywords.some((k) => k.toLowerCase().includes(lower))) score += 3;
      if (cmd.description?.toLowerCase().includes(lower)) score += 1;
      return { cmd, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((s) => s.cmd);
  }

  getAll(): Command[] {
    return Array.from(this.commands.values()).filter((cmd) => !cmd.predicate || cmd.predicate());
  }

  getByCategory(category: string): Command[] {
    return this.getAll().filter((cmd) => cmd.category === category);
  }
}

export const commandRegistry = new CommandRegistryClass();

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
    if (open) setQuery('');
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  return { open, setOpen, query, setQuery, toggle, close };
}

export const DEFAULT_COMMANDS: Omit<Command, 'action'>[] = [
  {
    id: 'nav-home',
    label: 'Go to Home',
    category: 'navigation',
    keywords: ['home', 'start', 'main'],
    shortcut: '',
  },
  {
    id: 'nav-projects',
    label: 'Go to Projects',
    category: 'navigation',
    keywords: ['projects', 'work', 'portfolio'],
    shortcut: '',
  },
  {
    id: 'nav-blog',
    label: 'Go to Blog',
    category: 'navigation',
    keywords: ['blog', 'articles', 'posts'],
    shortcut: '',
  },
  {
    id: 'nav-contact',
    label: 'Go to Contact',
    category: 'navigation',
    keywords: ['contact', 'email', 'message'],
    shortcut: '',
  },
  {
    id: 'action-theme',
    label: 'Toggle Theme',
    category: 'actions',
    keywords: ['theme', 'dark', 'light', 'mode'],
    shortcut: '',
  },
  {
    id: 'action-chat',
    label: 'Open AI Chat',
    category: 'actions',
    keywords: ['chat', 'ai', 'assistant'],
    shortcut: '',
  },
  {
    id: 'admin-dashboard',
    label: 'Admin Dashboard',
    category: 'admin',
    keywords: ['admin', 'dashboard', 'settings'],
    shortcut: '',
  },
  {
    id: 'admin-sections',
    label: 'Admin Sections',
    category: 'admin',
    keywords: ['sections', 'cms', 'content'],
    shortcut: '',
  },
];
