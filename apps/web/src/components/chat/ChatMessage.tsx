import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage as ChatMessageType } from '@/hooks/useChatStream';

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl p-4 ${
          isUser
            ? 'bg-accent-500 text-white rounded-tr-none'
            : 'bg-surface-elevated text-text-primary border border-border-primary rounded-tl-none'
        }`}
      >
        <div
          className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'dark:prose-invert'}`}
        >
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>

      {message.sources && message.sources.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 max-w-[85%]">
          {message.sources.map((source, idx) => (
            <a
              key={idx}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] flex items-center gap-1 bg-surface-elevated border border-border-primary px-2 py-1 rounded-full text-text-tertiary hover:text-accent-500 hover:border-accent-500 transition-colors"
            >
              <span>{source.title}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
