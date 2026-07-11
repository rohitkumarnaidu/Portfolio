'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@portfolio/ui';
import { useCaseStudies } from '@/lib/hooks/useCaseStudies';
import { useProjects } from '@/lib/hooks/useProjects';

export default function CaseStudiesPage() {
  const { data: caseStudies, isLoading } = useCaseStudies();
  const { data: projects } = useProjects({ per_page: 100 });

  const enriched = useMemo(() => {
    if (!caseStudies) return [];
    return caseStudies.map(cs => {
      const project = projects?.find(p => p.id === cs.projectId);
      return { ...cs, project };
    }).filter(cs => cs.project);
  }, [caseStudies, projects]);

  if (isLoading) {
    return (
      <div className="pt-32 pb-24 section-container">
        <div className="space-y-4 mb-12">
          <div className="h-10 w-48 bg-surface-elevated rounded animate-pulse" />
          <div className="h-6 w-96 bg-surface-elevated rounded animate-pulse" />
        </div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-surface-secondary border border-border-primary p-6 space-y-4 animate-pulse">
              <div className="h-6 w-3/4 bg-surface-elevated rounded" />
              <div className="h-4 w-full bg-surface-elevated rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 section-container">
      <div className="space-y-4 mb-12">
        <h1 className="text-h1 font-display text-text-primary">Case Studies</h1>
        <p className="text-body-lg text-text-secondary max-w-2xl">
          Deep dives into architecture, challenges, and solutions behind my most impactful projects.
        </p>
      </div>

      {enriched.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-body-lg text-text-secondary">No case studies published yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {enriched.map(cs => (
            <Link key={cs.id} href={`/case-studies/${cs.id}`} className="block group hover:no-underline">
              <article className="rounded-2xl bg-surface-secondary border border-border-primary hover:border-border-accent transition-all overflow-hidden">
                <div className="md:flex">
                  {cs.project?.cover_image && (
                    <div className="md:w-80 shrink-0">
                      <img
                        src={cs.project.cover_image}
                        alt={`${cs.project.title} case study`}
                        className="w-full h-48 md:h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="info">Case Study</Badge>
                      {cs.project?.category && <Badge variant="neutral">{cs.project.category}</Badge>}
                    </div>
                    <h2 className="text-h3 font-display text-text-primary mb-3 group-hover:text-accent-500 transition-colors">
                      {cs.project?.title}
                    </h2>
                    <p className="text-body text-text-secondary line-clamp-2 mb-4">
                      {cs.challenge || cs.approach || cs.project?.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {cs.project?.tech_stack?.slice(0, 4).map(t => (
                        <span key={t} className="px-2.5 py-1 text-xs font-medium rounded-full bg-surface-elevated text-text-tertiary border border-border-accent">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
