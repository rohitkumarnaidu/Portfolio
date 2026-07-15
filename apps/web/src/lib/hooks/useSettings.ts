'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, getSetting, upsertSetting, deleteSetting } from '@/lib/api';
import type { SystemSetting } from '@/lib/api';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => getSettings(),
  });
}

export function useSetting(key: string) {
  return useQuery({
    queryKey: ['setting', key],
    queryFn: () => getSetting(key),
    enabled: !!key,
  });
}

export function useUpsertSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: Partial<SystemSetting> }) =>
      upsertSetting(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['setting'] });
    },
  });
}

export function useDeleteSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => deleteSetting(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
