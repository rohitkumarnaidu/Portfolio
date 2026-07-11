'use client';

import { useQuery } from '@tanstack/react-query';
import { getActivities, getActivity } from '@/lib/api';

export function useActivities(params?: { page?: number; per_page?: number }) {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: () => getActivities(params),
  });
}

export function useActivity(id: string) {
  return useQuery({
    queryKey: ['activity', id],
    queryFn: () => getActivity(id),
    enabled: !!id,
  });
}
