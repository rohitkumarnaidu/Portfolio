'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLeads, getLead, updateLead } from '@/lib/api';
import type { Lead } from '@portfolio/shared';

export function useLeads(params?: {
  page?: number;
  per_page?: number;
  status?: string;
  source?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => getLeads(params),
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => getLead(id),
    enabled: !!id,
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) => updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead'] });
    },
  });
}
