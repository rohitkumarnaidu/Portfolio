'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  bulkDeleteAchievements,
} from '@/lib/api';
import type { Achievement } from '@/lib/api';

export function useAdminAchievements() {
  return useQuery({
    queryKey: ['adminAchievements'],
    queryFn: () => getAdminAchievements(),
  });
}

export function useCreateAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Achievement>) => createAchievement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAchievements'] });
    },
  });
}

export function useUpdateAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Achievement> }) =>
      updateAchievement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAchievements'] });
    },
  });
}

export function useDeleteAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAchievement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAchievements'] });
    },
  });
}

export function useBulkDeleteAchievements() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteAchievements(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAchievements'] });
    },
  });
}
