import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  maxLength?: number;
}

export function ChatInput({ onSend, disabled, maxLength = 500 }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className="flex flex-col gap-2 p-3 bg-surface-secondary border-t border-border-primary">
      <div className="relative flex items-end gap-2 bg-surface-primary border border-border-primary rounded-2xl p-2 focus-within:border-accent-500 transition-colors">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          disabled={disabled}
          maxLength={maxLength}
          rows={1}
          className="flex-1 max-h-[120px] bg-transparent resize-none outline-none text-sm text-text-primary placeholder:text-text-tertiary p-2 scrollbar-none"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="p-2 mb-1 mr-1 rounded-xl bg-accent-500 text-white disabled:opacity-50 disabled:bg-surface-elevated disabled:text-text-tertiary hover:opacity-90 transition-all flex items-center justify-center"
        >
          {disabled ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
      <div className="flex justify-between items-center px-2">
        <span className="text-[10px] text-text-tertiary">
          Press{' '}
          <kbd className="font-sans px-1 py-0.5 rounded bg-surface-elevated border border-border-primary">
            Enter
          </kbd>{' '}
          to send
        </span>
        <span
          className={`text-[10px] ${input.length >= maxLength ? 'text-semantic-error' : 'text-text-tertiary'}`}
        >
          {input.length}/{maxLength}
        </span>
      </div>
    </div>
  );
}
