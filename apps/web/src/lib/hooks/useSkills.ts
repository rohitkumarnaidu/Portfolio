'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSkills, createSkill, updateSkill, deleteSkill } from '@/lib/api';
import type { Skill } from '@portfolio/shared';

export function useSkills(category?: string) {
  return useQuery({
    queryKey: ['skills', category],
    queryFn: () => getSkills(category),
  });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Skill>) => createSkill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Skill> }) =>
      updateSkill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSkill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
}
