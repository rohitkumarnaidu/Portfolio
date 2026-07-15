'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { sendChatMessage, getChatMessages, type ChatMessage } from '@/lib/api';
import { API_CONFIG } from '@/lib/constants';

interface UseChatOptions {
  sessionId?: string;
}

const STORAGE_KEY = 'portfolio_chat_session';

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = sessionStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
    sessionStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export function useChat(opts: UseChatOptions = {}) {
  const sessionId = opts.sessionId || getOrCreateSessionId();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Load existing messages on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setIsLoading(true);
        const existing = await getChatMessages(sessionId);
        if (!cancelled) {
          setMessages(existing || []);
        }
      } catch {
        // No existing conversation is OK
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // Cleanup SSE on unmount
  useEffect(() => {
    const es = eventSourceRef.current;
    return () => {
      es?.close();
    };
  }, []);

  const sendMessage = useCallback(
    async (content: string, pageContext?: string) => {
      if (!content.trim() || isSending) return;
      setIsSending(true);
      setError(null);

      // Optimistically add user message
      const tempUserMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        conversationId: sessionId,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);

      try {
        // Send to API
        const result = await sendChatMessage(sessionId, content, pageContext);

        // Replace temp message with real one
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempUserMsg.id ? { ...result.message, id: result.message.id || m.id } : m,
          ),
        );

        // Try SSE for AI response
        const aiUrl = `${API_CONFIG.aiBaseUrl}/chat/stream`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        try {
          const response = await fetch(aiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id: sessionId,
              conversation_id: result.conversationId,
              message: content,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (response.ok && response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            const aiMsgId = `ai-${Date.now()}`;

            for (;;) {
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
                    const token = parsed.token || parsed.content || parsed.text || '';
                    setStreamingContent((prev) => (prev || '') + token);
                  } catch {
                    setStreamingContent((prev) => (prev || '') + data);
                  }
                }
              }
            }

            if (streamingContent) {
              const aiMessage: ChatMessage = {
                id: aiMsgId,
                conversationId: sessionId,
                role: 'assistant',
                content: streamingContent,
                createdAt: new Date().toISOString(),
              };
              setMessages((prev) => [...prev, aiMessage]);
              setStreamingContent(null);
            }
          } else {
            // Fallback: add a placeholder AI response
            const aiMessage: ChatMessage = {
              id: `ai-${Date.now()}`,
              conversationId: sessionId,
              role: 'assistant',
              content:
                "Thanks for your message! I'll get back to you shortly. In the meantime, feel free to explore my projects and case studies.",
              createdAt: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, aiMessage]);
          }
        } catch {
          // SSE failed - add fallback response
          const aiMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            conversationId: sessionId,
            role: 'assistant',
            content:
              "Thanks for reaching out! I've received your message. For immediate assistance, please contact me directly via the contact form.",
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, aiMessage]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
        // Remove temp message on failure
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
      } finally {
        setIsSending(false);
      }
    },
    [sessionId, isSending, streamingContent],
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setStreamingContent(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    messages,
    isLoading,
    isSending,
    error,
    streamingContent,
    sendMessage,
    clearChat,
    sessionId,
  };
}
