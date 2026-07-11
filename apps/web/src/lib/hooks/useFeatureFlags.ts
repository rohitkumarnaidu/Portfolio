'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFeatureFlags,
  getFeatureFlag,
  createFeatureFlag,
  updateFeatureFlag,
  deleteFeatureFlag,
} from '@/lib/api';
import type { FeatureFlag } from '@/lib/api';

export function useFeatureFlags() {
  return useQuery({
    queryKey: ['featureFlags'],
    queryFn: () => getFeatureFlags(),
  });
}

export function useFeatureFlag(key: string) {
  return useQuery({
    queryKey: ['featureFlag', key],
    queryFn: () => getFeatureFlag(key),
    enabled: !!key,
  });
}

export function useCreateFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<FeatureFlag>) => createFeatureFlag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featureFlags'] });
    },
  });
}

export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: Partial<FeatureFlag> }) =>
      updateFeatureFlag(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featureFlags'] });
    },
  });
}

export function useDeleteFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => deleteFeatureFlag(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featureFlags'] });
    },
  });
}
