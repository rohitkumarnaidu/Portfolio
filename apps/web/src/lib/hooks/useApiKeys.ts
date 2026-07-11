'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getApiKeys,
  getApiKey,
  createApiKey,
  revokeApiKey,
  deleteApiKey,
} from '@/lib/api';
import type { ApiKey } from '@/lib/api';

export function useApiKeys(params?: { page?: number; perPage?: number }) {
  return useQuery({
    queryKey: ['apiKeys', params],
    queryFn: () => getApiKeys(params),
  });
}

export function useApiKey(id: string) {
  return useQuery({
    queryKey: ['apiKey', id],
    queryFn: () => getApiKey(id),
    enabled: !!id,
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; permissions?: string }) => createApiKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => revokeApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });
}
