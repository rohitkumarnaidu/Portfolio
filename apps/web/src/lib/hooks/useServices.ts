'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminServices,
  createAdminService,
  updateAdminService,
  deleteAdminService,
} from '@/lib/api';
import type { Service } from '@portfolio/shared';

export function useAdminServices() {
  return useQuery({
    queryKey: ['adminServices'],
    queryFn: () => getAdminServices(),
  });
}

export function useCreateAdminService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Service>) => createAdminService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminServices'] });
    },
  });
}

export function useUpdateAdminService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Service> }) =>
      updateAdminService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminServices'] });
    },
  });
}

export function useDeleteAdminService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAdminService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminServices'] });
    },
  });
}
