'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminGuestAppearances,
  createGuestAppearance,
  updateGuestAppearance,
  deleteGuestAppearance,
  bulkDeleteGuestAppearances,
} from '@/lib/api';
import type { GuestAppearance } from '@/lib/api';

export function useAdminGuestAppearances() {
  return useQuery({
    queryKey: ['adminGuestAppearances'],
    queryFn: () => getAdminGuestAppearances(),
  });
}

export function useCreateGuestAppearance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<GuestAppearance>) => createGuestAppearance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGuestAppearances'] });
    },
  });
}

export function useUpdateGuestAppearance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GuestAppearance> }) =>
      updateGuestAppearance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGuestAppearances'] });
    },
  });
}

export function useDeleteGuestAppearance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGuestAppearance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGuestAppearances'] });
    },
  });
}

export function useBulkDeleteGuestAppearances() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteGuestAppearances(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGuestAppearances'] });
    },
  });
}
