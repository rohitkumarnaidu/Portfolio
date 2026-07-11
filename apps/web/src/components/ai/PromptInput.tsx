'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/cn';

interface PromptInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const PromptInput = ({
  onSend,
  disabled = false,
  placeholder = 'Ask me anything...',
}: PromptInputProps) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div
      className={cn(
        'flex items-end gap-2 p-2 rounded-xl border transition-colors',
        'bg-surface-primary',
        focused ? 'border-accent-500' : 'border-border-accent',
        disabled && 'opacity-50'
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-tertiary resize-none outline-none max-h-[120px]"
        aria-label="Message input"
      />

      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className={cn(
          'shrink-0 p-2 rounded-lg transition-colors',
          'bg-accent-500 text-white hover:bg-accent-600',
          'disabled:opacity-30 disabled:cursor-not-allowed'
        )}
        aria-label="Send message"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};
