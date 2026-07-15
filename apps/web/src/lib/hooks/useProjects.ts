'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjects, getProject, createProject, updateProject, deleteProject } from '@/lib/api';
import type { Project } from '@portfolio/shared';

export function useProjects(params?: {
  page?: number;
  per_page?: number;
  category?: string;
  tech?: string;
  featured?: boolean;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => getProjects(params),
  });
}

export function useProject(slugOrId: string) {
  return useQuery({
    queryKey: ['project', slugOrId],
    queryFn: () => getProject(slugOrId),
    enabled: !!slugOrId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Project>) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
