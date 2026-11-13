'use client';

import { useState } from 'react';
import { Button } from '@portfolio/ui';

interface PreviewPaneProps {
  url: string;
}

export function PreviewPane({ url }: PreviewPaneProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  if (!url) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black/10">
        <p className="text-sm text-text-tertiary">Waiting for development server...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f5f5f5] dark:bg-[#1a1a1a]">
      {/* Toolbar */}
      <div className="flex items-center justify-center p-2 border-b border-border-primary bg-surface-secondary gap-2">
        <Button
          variant={device === 'desktop' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setDevice('desktop')}
        >
          Desktop
        </Button>
        <Button
          variant={device === 'mobile' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setDevice('mobile')}
        >
          Mobile
        </Button>
      </div>

      {/* Iframe Container */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        <div
          className={`bg-white rounded-md shadow-2xl overflow-hidden transition-all duration-300 ${
            device === 'mobile' ? 'w-[375px] h-[812px]' : 'w-full h-full max-w-[1440px]'
          }`}
        >
          <iframe
            src={url}
            className="w-full h-full border-0"
            title="Live Preview"
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            allow="cross-origin-isolated"
          />
        </div>
      </div>
    </div>
  );
}
