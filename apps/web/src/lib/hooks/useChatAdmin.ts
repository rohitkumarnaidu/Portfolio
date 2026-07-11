'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getChatConversations,
  getChatConversationMessages,
  deleteChatConversation,
} from '@/lib/api';

export function useChatConversations(params?: { page?: number; perPage?: number }) {
  return useQuery({
    queryKey: ['chatConversations', params],
    queryFn: () => getChatConversations(params),
  });
}

export function useChatConversationMessages(id: string, params?: { page?: number; perPage?: number }) {
  return useQuery({
    queryKey: ['chatConversationMessages', id, params],
    queryFn: () => getChatConversationMessages(id, params),
    enabled: !!id,
  });
}

export function useDeleteChatConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteChatConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatConversations'] });
    },
  });
}
