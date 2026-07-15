'use client';

import { useState } from 'react';
import { useFocusVisible } from '@/hooks/useFocusVisible';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { ScrollProvider } from '@/components/layout/ScrollProvider';
import { ReadingProgress } from '@/components/layout/ReadingProgress';
import { Cursor } from '@/components/interactions/Cursor';
import { CommandPalette } from '@/components/interactions/CommandPalette';

interface ClientShellProps {
  children: React.ReactNode;
}

export const ClientShell = ({ children }: ClientShellProps) => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useFocusVisible();

  useKeyboardShortcut({ key: 'k', meta: true }, () => setCommandPaletteOpen(true), {
    enabled: !commandPaletteOpen,
  });

  return (
    <>
      <ReadingProgress />
      <Cursor />
      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      <ScrollProvider>{children}</ScrollProvider>
    </>
  );
};
