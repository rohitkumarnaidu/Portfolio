'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from '@/lib/api';
import type { FAQ } from '@portfolio/shared';

export function useFAQs() {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: () => getFAQs(),
  });
}

export function useCreateFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<FAQ>) => createFAQ(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
}

export function useUpdateFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FAQ> }) =>
      updateFAQ(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
}

export function useDeleteFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFAQ(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
}
