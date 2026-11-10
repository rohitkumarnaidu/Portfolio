'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminSections,
  getSection,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
} from '@/lib/api';
import type { Section } from '@portfolio/shared';

export function useSections(isLive?: boolean, type?: string) {
  return useQuery({
    queryKey: ['sections', { isLive, type }],
    queryFn: () => getAdminSections(),
  });
}

export function useSection(idOrKey: string) {
  return useQuery({
    queryKey: ['section', idOrKey],
    queryFn: () => getSection(idOrKey),
    enabled: !!idOrKey,
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Section>) => createSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Section> }) => updateSection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      queryClient.invalidateQueries({ queryKey: ['section'] });
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
  });
}

export function useReorderSections() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (order: Array<{ id: string; display_order: number }>) => reorderSections(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
  });
}
