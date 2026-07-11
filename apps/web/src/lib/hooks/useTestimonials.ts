'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '@/lib/api';
import type { Testimonial } from '@portfolio/shared';

export function useTestimonials() {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: () => getTestimonials(),
  });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Testimonial>) => createTestimonial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
}

export function useUpdateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Testimonial> }) =>
      updateTestimonial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTestimonial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
}
