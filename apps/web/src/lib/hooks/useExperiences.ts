'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExperiences, createExperience, updateExperience, deleteExperience } from '@/lib/api';
import type { Experience } from '@portfolio/shared';

export function useExperiences() {
  return useQuery({
    queryKey: ['experiences'],
    queryFn: () => getExperiences(),
  });
}

export function useCreateExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Experience>) => createExperience(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}

export function useUpdateExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Experience> }) =>
      updateExperience(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}

export function useDeleteExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}
