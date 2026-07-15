'use client';

import { useState, useMemo } from 'react';
import {
  useChatConversations,
  useChatConversationMessages,
  useDeleteChatConversation,
} from '@/lib/hooks/useChatAdmin';
import { Modal, useToast } from '@portfolio/ui';
import { DataTable } from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';
import type { ChatConversation, ChatMessage } from '@/lib/api';

export default function ChatAdminPage() {
  const { data: conversations, isLoading } = useChatConversations();
  const deleteMutation = useDeleteChatConversation();
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleDelete = async (c: ChatConversation) => {
    try {
      await deleteMutation.mutateAsync(c.id);
      addToast({ variant: 'success', title: 'Conversation deleted' });
    } catch {
      addToast({ variant: 'error', title: 'Failed to delete' });
    }
  };

  const columns: Column<ChatConversation>[] = useMemo(
    () => [
      {
        key: 'sessionId',
        label: 'Session ID',
        sortable: true,
        grow: true,
        render: (c) => <code className="text-xs font-mono text-text-primary">{c.sessionId}</code>,
      },
      {
        key: 'createdAt',
        label: 'Started',
        width: '140px',
        sortable: true,
        render: (c) => (
          <span className="text-xs text-text-tertiary">
            {new Date(c.createdAt).toLocaleString()}
          </span>
        ),
      },
      {
        key: 'messages',
        label: 'Messages',
        width: '70px',
        render: (c) => (
          <span className="text-xs text-text-secondary">{c._count?.messages ?? '-'}</span>
        ),
      },
    ],
    [],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Chat Conversations</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            View and manage visitor chat conversations
          </p>
        </div>
      </div>
      <DataTable
        data={conversations ?? []}
        columns={columns}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        pageSize={10}
        onDelete={handleDelete}
        onView={(c) => setSelectedConv(c.id)}
      />

      <Modal
        isOpen={!!selectedConv}
        onClose={() => setSelectedConv(null)}
        title="Conversation Messages"
        size="lg"
      >
        {selectedConv && <ConversationMessages conversationId={selectedConv} />}
      </Modal>
    </div>
  );
}

function ConversationMessages({ conversationId }: { conversationId: string }) {
  const { data: messages, isLoading } = useChatConversationMessages(conversationId);

  if (isLoading)
    return <div className="text-sm text-text-tertiary py-8 text-center">Loading messages...</div>;
  if (!messages?.length)
    return (
      <div className="text-sm text-text-tertiary py-8 text-center">
        No messages in this conversation.
      </div>
    );

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {messages.map((msg: ChatMessage) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] p-3 rounded-xl text-sm ${
              msg.role === 'user'
                ? 'bg-accent-500/10 text-text-primary rounded-br-none'
                : 'bg-surface-elevated text-text-secondary rounded-bl-none'
            }`}
          >
            <div className="text-[10px] font-medium text-text-tertiary mb-1 uppercase tracking-wider">
              {msg.role}
            </div>
            <div className="whitespace-pre-wrap">{msg.content}</div>
            <div className="text-[10px] text-text-tertiary mt-1">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
