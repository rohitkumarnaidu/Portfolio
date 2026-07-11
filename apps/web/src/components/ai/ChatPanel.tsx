'use client';

import { MessageBubble } from './MessageBubble';
import { PromptInput } from './PromptInput';
import { AIBreathingRing } from './AIBreathingRing';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status: 'sending' | 'streaming' | 'complete' | 'error';
  timestamp: number;
}

interface ChatPanelProps {
  messages: Message[];
  onSend: (content: string) => void;
  onRegenerate?: () => void;
  onClear?: () => void;
  isStreaming: boolean;
  className?: string;
}

export const ChatPanel = ({
  messages,
  onSend,
  onRegenerate,
  onClear,
  isStreaming,
  className,
}: ChatPanelProps) => {
  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {onClear && (
        <div className="flex justify-end px-4 pt-2">
          <button
            onClick={onClear}
            className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
          >
            Clear conversation
          </button>
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-text-tertiary">
              Send a message to start the conversation.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            status={msg.status}
            onRegenerate={
              msg.role === 'assistant' &&
              msg.status === 'complete' &&
              onRegenerate
                ? onRegenerate
                : undefined
            }
          />
        ))}
      </div>

      <div className="border-t border-border-accent p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <PromptInput onSend={onSend} disabled={isStreaming} />
          </div>
          <AIBreathingRing isThinking={isStreaming} />
        </div>
      </div>
    </div>
  );
};
