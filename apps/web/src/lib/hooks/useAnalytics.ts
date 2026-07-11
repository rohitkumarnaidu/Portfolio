'use client';

import { useQuery } from '@tanstack/react-query';
import { getAnalyticsSummary, getAnalyticsSessions } from '@/lib/api';

export function useAnalyticsSummary(period?: string) {
  return useQuery({
    queryKey: ['analyticsSummary', period],
    queryFn: () => getAnalyticsSummary(period),
  });
}

export function useAnalyticsSessions(params?: {
  page?: number;
  per_page?: number;
  from?: string;
}) {
  return useQuery({
    queryKey: ['analyticsSessions', params],
    queryFn: () => getAnalyticsSessions(params),
  });
}
