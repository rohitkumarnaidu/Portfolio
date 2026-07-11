'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminPressFeatures,
  createPressFeature,
  updatePressFeature,
  deletePressFeature,
  bulkDeletePressFeatures,
} from '@/lib/api';
import type { PressFeature } from '@/lib/api';

export function useAdminPressFeatures() {
  return useQuery({
    queryKey: ['adminPressFeatures'],
    queryFn: () => getAdminPressFeatures(),
  });
}

export function useCreatePressFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PressFeature>) => createPressFeature(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPressFeatures'] });
    },
  });
}

export function useUpdatePressFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PressFeature> }) =>
      updatePressFeature(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPressFeatures'] });
    },
  });
}

export function useDeletePressFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePressFeature(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPressFeatures'] });
    },
  });
}

export function useBulkDeletePressFeatures() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeletePressFeatures(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPressFeatures'] });
    },
  });
}
