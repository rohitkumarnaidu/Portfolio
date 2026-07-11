import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Maximize2, Minimize2 } from 'lucide-react';
import { useChatStream } from '@/hooks/useChatStream';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';

export function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { messages, isTyping, error, sendMessage, stopGeneration } = useChatStream('/api/ai/chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-accent-500 text-white rounded-full shadow-xl hover:scale-105 transition-transform z-50 flex items-center justify-center group"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-surface-elevated text-text-primary px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg border border-border-primary">
          Chat with AI
        </span>
      </button>
    );
  }

  return (
    <div 
      className={`fixed z-50 flex flex-col bg-surface-primary border border-border-primary shadow-2xl transition-all duration-300 ${
        isExpanded 
          ? 'inset-4 md:inset-10 rounded-2xl' 
          : 'bottom-6 right-6 w-[380px] h-[600px] max-h-[calc(100vh-48px)] max-w-[calc(100vw-48px)] rounded-2xl'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-primary bg-surface-secondary/50 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center text-white">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">AI Assistant</h3>
            <p className="text-xs text-text-tertiary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-semantic-success"></span> Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors hidden md:block"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-surface-elevated">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-surface-elevated flex items-center justify-center text-accent-500">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-text-primary font-medium">How can I help you?</p>
              <p className="text-text-tertiary text-sm max-w-[250px] mt-1">Ask me anything about my portfolio, experience, or projects.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isTyping && (
              <div className="mb-4">
                <TypingIndicator />
              </div>
            )}
            {error && (
              <div className="p-3 mb-4 rounded-xl bg-semantic-error-bg border border-semantic-error/20 text-semantic-error text-xs">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="rounded-b-2xl overflow-hidden">
        <ChatInput 
          onSend={sendMessage} 
          disabled={isTyping} 
        />
        {isTyping && (
          <div className="px-4 py-2 bg-surface-secondary border-t border-border-primary flex justify-center">
            <button 
              onClick={stopGeneration}
              className="text-[10px] uppercase tracking-wider font-medium text-text-tertiary hover:text-text-primary px-3 py-1 rounded-full bg-surface-elevated border border-border-primary transition-colors"
            >
              Stop generating
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
