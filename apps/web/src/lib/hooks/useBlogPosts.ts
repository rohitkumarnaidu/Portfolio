'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from '@/lib/api';
import type { BlogPost } from '@portfolio/shared';

export function useBlogPosts() {
  return useQuery<BlogPost[]>({
    queryKey: ['blogPosts'],
    queryFn: () => getBlogPosts(),
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<BlogPost>) => createBlogPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BlogPost> }) =>
      updateBlogPost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBlogPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    },
  });
}
