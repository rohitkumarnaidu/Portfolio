'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/cn';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export const CopyButton = ({ text, label = 'Copy code', className }: CopyButtonProps) => {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle');

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setState('copied');
    }

    setTimeout(() => setState('idle'), 2000);
  }, [text]);

  return (
    <button
      onClick={copy}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-md transition-colors',
        'text-text-tertiary hover:text-text-secondary hover:bg-surface-elevated',
        state === 'copied' && 'text-semantic-success',
        state === 'error' && 'text-semantic-error',
        className
      )}
      aria-label={label}
      aria-live="polite"
    >
      {state === 'idle' && (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
      {state === 'copied' && (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {state === 'idle' ? 'Copy' : state === 'copied' ? 'Copied' : 'Failed'}
    </button>
  );
};
