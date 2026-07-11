'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminAvailabilityStatus,
  updateAvailabilityStatus,
} from '@/lib/api';
import type { AvailabilityStatus } from '@/lib/api';

export function useAdminAvailabilityStatus() {
  return useQuery({
    queryKey: ['adminAvailabilityStatus'],
    queryFn: () => getAdminAvailabilityStatus(),
  });
}

export function useUpdateAvailabilityStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AvailabilityStatus>) => updateAvailabilityStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAvailabilityStatus'] });
    },
  });
}
