'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getExperiences,
  getTestimonials,
  getAdminServices,
  getBlogPosts,
  getFAQs,
  getSkills,
  getProjects,
} from '@/lib/api';

export function usePublicExperiences() {
  return useQuery({
    queryKey: ['public', 'experiences'],
    queryFn: () => getExperiences(),
    staleTime: 120_000,
  });
}

export function usePublicTestimonials() {
  return useQuery({
    queryKey: ['public', 'testimonials'],
    queryFn: () => getTestimonials(),
    staleTime: 120_000,
  });
}

export function usePublicServices() {
  return useQuery({
    queryKey: ['public', 'services'],
    queryFn: () => getAdminServices(),
    staleTime: 120_000,
  });
}

export function usePublicBlogPosts() {
  return useQuery({
    queryKey: ['public', 'blogPosts'],
    queryFn: () => getBlogPosts(),
    staleTime: 120_000,
  });
}

export function usePublicFAQs() {
  return useQuery({
    queryKey: ['public', 'faqs'],
    queryFn: () => getFAQs(),
    staleTime: 120_000,
  });
}

export function usePublicSkills(category?: string) {
  return useQuery({
    queryKey: ['public', 'skills', category],
    queryFn: () => getSkills(category),
    staleTime: 120_000,
  });
}

export function usePublicProjects(params?: {
  category?: string;
  featured?: boolean;
  per_page?: number;
}) {
  return useQuery({
    queryKey: ['public', 'projects', params],
    queryFn: () => getProjects(params),
    staleTime: 120_000,
  });
}
