import { useState, useCallback, useRef, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url: string }>;
  timestamp: Date;
}

export function useChatStream(apiEndpoint: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef<string>(Math.random().toString(36).substring(2, 15));

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 15),
        role: 'user',
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);
      setError(null);

      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content, sessionId: sessionIdRef.current }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) throw new Error('Failed to send message');
        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const assistantMessageId = Math.random().toString(36).substring(2, 15);

        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
          },
        ]);

        let done = false;
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;

          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter((line) => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  setIsTyping(false);
                  break;
                }
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessageId
                          ? { ...msg, content: msg.content + parsed.content }
                          : msg,
                      ),
                    );
                  }
                  if (parsed.sources) {
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessageId ? { ...msg, sources: parsed.sources } : msg,
                      ),
                    );
                  }
                } catch (e) {
                  // Ignore parse errors on incomplete chunks
                }
              }
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message || 'An error occurred');
          setIsTyping(false);
        }
      } finally {
        setIsTyping(false);
      }
    },
    [apiEndpoint],
  );

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsTyping(false);
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    messages,
    isTyping,
    error,
    sendMessage,
    stopGeneration,
  };
}
