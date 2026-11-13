'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminReadingListItems,
  createReadingListItem,
  updateReadingListItem,
  deleteReadingListItem,
  bulkDeleteReadingListItems,
} from '@/lib/api';
import type { ReadingListItem } from '@/lib/api';

export function useAdminReadingListItems() {
  return useQuery({
    queryKey: ['adminReadingListItems'],
    queryFn: () => getAdminReadingListItems(),
  });
}

export function useCreateReadingListItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ReadingListItem>) => createReadingListItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReadingListItems'] });
    },
  });
}

export function useUpdateReadingListItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ReadingListItem> }) =>
      updateReadingListItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReadingListItems'] });
    },
  });
}

export function useDeleteReadingListItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteReadingListItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReadingListItems'] });
    },
  });
}

export function useBulkDeleteReadingListItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteReadingListItems(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReadingListItems'] });
    },
  });
}
