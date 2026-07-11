import React from 'react';

export function TypingIndicator() {
  return (
    <div className="flex space-x-1.5 p-4 rounded-2xl bg-surface-elevated max-w-fit rounded-tl-none border border-border-primary">
      <div className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce"></div>
    </div>
  );
}
