'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMediaAssets, uploadMediaAsset, deleteMediaAsset } from '@/lib/api';

export function useMediaAssets(params?: { page?: number; per_page?: number }) {
  return useQuery({
    queryKey: ['mediaAssets', params],
    queryFn: () => getMediaAssets(params),
  });
}

export function useUploadMediaAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, altText }: { file: File; altText?: string }) => uploadMediaAsset(file, altText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaAssets'] });
    },
  });
}

export function useDeleteMediaAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMediaAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaAssets'] });
    },
  });
}
