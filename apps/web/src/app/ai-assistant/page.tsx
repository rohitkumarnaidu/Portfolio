'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useChat } from '@/lib/hooks/useChat';
import { cn } from '@/lib/cn';

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AIAssistantPage() {
  const { messages, isLoading, isSending, error, streamingContent, sendMessage, clearChat } =
    useChat();
  const [input, setInput] = useState('');
  const [suggestions] = useState([
    'What technologies do you work with?',
    'Tell me about your experience',
    'What projects have you built?',
    'How can I contact you?',
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    sendMessage(input.trim(), window.location.pathname);
    setInput('');
  };

  const allMessages = useMemo(() => {
    const result = [...messages];
    if (streamingContent) {
      const lastMsg = result[result.length - 1];
      if (lastMsg?.role === 'assistant') {
        result[result.length - 1] = { ...lastMsg, content: streamingContent };
      } else {
        result.push({
          id: 'streaming',
          conversationId: '',
          role: 'assistant',
          content: streamingContent,
          createdAt: new Date().toISOString(),
        });
      }
    }
    return result;
  }, [messages, streamingContent]);

  return (
    <div className="pt-24 pb-16 min-h-dvh flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-4 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-h2 font-display text-text-primary">AI Assistant</h1>
            <p className="text-body-sm text-text-secondary mt-1">
              Ask me anything about my work, experience, or skills
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-xs text-text-tertiary hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg border border-border-primary hover:border-border-accent"
              aria-label="Clear conversation"
            >
              Clear
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-6 min-h-[400px] max-h-[600px] pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-2 text-text-tertiary text-sm">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Loading conversation...
              </div>
            </div>
          ) : allMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-accent-500/10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-accent-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-h4 font-display text-text-primary mb-2">How can I help you?</h2>
                <p className="text-body-sm text-text-secondary max-w-md">
                  Ask about my projects, skills, experience, or anything else you&apos;d like to
                  know.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s, window.location.pathname)}
                    className="px-4 py-2 text-sm rounded-xl border border-border-primary text-text-secondary hover:text-text-primary hover:border-border-accent bg-surface-secondary hover:bg-surface-elevated transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            allMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-3 max-w-[85%]',
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : '',
                )}
                role="listitem"
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm',
                    msg.role === 'user'
                      ? 'bg-accent-500 text-white'
                      : 'bg-surface-elevated text-text-secondary',
                  )}
                  aria-hidden="true"
                >
                  {msg.role === 'user' ? 'U' : 'AI'}
                </div>
                <div
                  className={cn(
                    'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-accent-500 text-white'
                      : 'bg-surface-secondary border border-border-primary text-text-primary',
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={cn(
                      'text-[10px] mt-1.5',
                      msg.role === 'user' ? 'text-white/60' : 'text-text-tertiary',
                    )}
                  >
                    {formatTime(msg.createdAt)}
                    {msg.id === 'streaming' && (
                      <span className="inline-flex ml-1">
                        <span className="animate-pulse">▊</span>
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl bg-semantic-error-bg border border-semantic-error text-sm text-semantic-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your message..."
              rows={1}
              className="w-full rounded-2xl bg-surface-secondary border border-border-primary px-4 py-3 pr-12 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none min-h-[48px] max-h-[120px]"
              aria-label="Chat message input"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="w-12 h-12 rounded-2xl bg-accent-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-600 transition-colors shrink-0"
            aria-label="Send message"
          >
            {isSending ? (
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
