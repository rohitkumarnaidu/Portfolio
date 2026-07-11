'use client';

import { useQuery } from '@tanstack/react-query';
import { getCaseStudies, getCaseStudy, getProject } from '@/lib/api';

export function useCaseStudies(projectId?: string) {
  return useQuery({
    queryKey: ['caseStudies', projectId],
    queryFn: () => getCaseStudies(projectId),
    staleTime: 120_000,
  });
}

export function useCaseStudy(id: string) {
  return useQuery({
    queryKey: ['caseStudy', id],
    queryFn: () => getCaseStudy(id),
    enabled: !!id,
  });
}

export function useCaseStudyWithProject(id: string) {
  const csQuery = useQuery({
    queryKey: ['caseStudy', id],
    queryFn: () => getCaseStudy(id),
    enabled: !!id,
  });

  const projectQuery = useQuery({
    queryKey: ['project', csQuery.data?.projectId],
    queryFn: () => getProject(csQuery.data!.projectId),
    enabled: !!csQuery.data?.projectId,
  });

  return {
    caseStudy: csQuery.data,
    project: projectQuery.data,
    isLoading: csQuery.isLoading || projectQuery.isLoading,
    error: csQuery.error || projectQuery.error,
  };
}
