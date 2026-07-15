'use client';

import { cn } from '@/lib/cn';
import { CopyButton } from '@/components/ui/CopyButton';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  status: 'sending' | 'streaming' | 'complete' | 'error';
  onRegenerate?: () => void;
}

export const MessageBubble = ({ role, content, status, onRegenerate }: MessageBubbleProps) => {
  const isUser = role === 'user';
  const isStreaming = status === 'streaming';
  const isError = status === 'error';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-accent-500 text-white rounded-br-md'
            : 'bg-surface-elevated text-text-primary rounded-bl-md',
          isError && 'border border-semantic-error',
        )}
        role="article"
        aria-label={`${isUser ? 'Your' : 'AI'} message`}
      >
        <div className="text-sm whitespace-pre-wrap">
          {content}
          {isStreaming && <span className="inline-block w-2 h-4 ml-0.5 bg-current animate-pulse" />}
        </div>

        <div
          className={cn('flex items-center gap-2 mt-2', isUser ? 'justify-end' : 'justify-start')}
        >
          {!isUser && status === 'complete' && <CopyButton text={content} />}

          {!isUser && status === 'complete' && onRegenerate && (
            <button
              onClick={onRegenerate}
              className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
              aria-label="Regenerate response"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}

          {isError && (
            <button
              onClick={onRegenerate}
              className="text-xs text-semantic-error hover:text-semantic-error/80 transition-colors"
              aria-label="Retry"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
