'use client';

import { useState, useCallback, useRef } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status: 'sending' | 'streaming' | 'complete' | 'error';
  timestamp: number;
}

interface UseAIChatOptions {
  conversationId?: string;
  onError?: (error: Error) => void;
}

interface UseAIChatReturn {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  regenerate: () => Promise<void>;
  clearConversation: () => void;
  isStreaming: boolean;
  error: string | null;
}

let messageCounter = 0;
const generateId = () => `msg_${++messageCounter}_${Date.now()}`;

export function useAIChat(options: UseAIChatOptions = {}): UseAIChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming || !content.trim()) return;

      setError(null);
      setIsStreaming(true);

      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content,
        status: 'complete',
        timestamp: Date.now(),
      };

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: '',
        status: 'streaming',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      abortRef.current = new AbortController();

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            conversationId: options.conversationId,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.token) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id
                        ? { ...msg, content: msg.content + parsed.token }
                        : msg,
                    ),
                  );
                }
              } catch {
                // Skip malformed JSON lines
              }
            }
          }
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id ? { ...msg, status: 'complete' } : msg,
          ),
        );
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;

        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        options.onError?.(new Error(errorMessage));

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, status: 'error', content: msg.content || errorMessage }
              : msg,
          ),
        );
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, options],
  );

  const regenerate = useCallback(async () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      setMessages((prev) => prev.slice(0, -1));
      await sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    sendMessage,
    regenerate,
    clearConversation,
    isStreaming,
    error,
  };
}
