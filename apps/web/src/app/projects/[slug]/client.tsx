'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Badge, Button } from '@portfolio/ui';
import { useProject } from '@/lib/hooks/useProjects';
import { usePublicProjects } from '@/lib/hooks/usePublicData';
import { ProjectDetailSkeleton } from '@/components/skeletons/ProjectDetailSkeleton';

export function ProjectDetailClient({ slug }: { slug: string }) {
  const { data: project, isLoading, error } = useProject(slug);
  const { data: allProjects } = usePublicProjects({ per_page: 100 });

  const relatedProjects = useMemo(() => {
    if (!project || !allProjects) return [];
    return allProjects
      .filter(p => p.id !== project.id && (p.category === project.category || p.tech_stack?.some(t => project.tech_stack?.includes(t))))
      .slice(0, 3);
  }, [project, allProjects]);

  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (error || !project) {
    return (
      <div className="pt-32 pb-24 section-container text-center">
        <h1 className="text-h2 font-display text-text-primary mb-4">Project not found</h1>
        <p className="text-body text-text-secondary mb-6">The project you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/projects" className="text-accent-500 hover:text-accent-600">← Back to Projects</Link>
      </div>
    );
  }

  return (
    <article className="pt-32 pb-24">
      <div className="section-container mb-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-8 transition-colors"
          aria-label="Back to projects listing"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Projects
        </Link>

        <div className="max-w-4xl">
          <div className="flex flex-wrap gap-2 mb-6" role="list" aria-label="Technologies and category">
            {project.tech_stack?.slice(0, 6).map(tech => (
              <Badge key={tech} variant="default">{tech}</Badge>
            ))}
            {project.category && <Badge variant="info">{project.category}</Badge>}
          </div>

          <h1 className="text-display font-display text-text-primary mb-6">{project.title}</h1>
          <p className="text-body-lg text-text-secondary max-w-3xl">{project.description}</p>

          <div className="flex flex-wrap gap-4 mt-8">
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noopener noreferrer" aria-label={`View live demo of ${project.title}`}>
                <Button>View Live Demo</Button>
              </a>
            )}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" aria-label={`View source code of ${project.title}`}>
                <Button variant="secondary">View Source</Button>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="w-full aspect-[21/9] max-h-[600px] bg-surface-elevated mb-16 flex items-center justify-center border-y border-border-primary relative overflow-hidden">
        {project.cover_image ? (
          <img src={project.cover_image} alt={`Cover image for ${project.title}`} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <span className="text-text-tertiary font-display text-h2" aria-hidden="true">{project.title.charAt(0)}</span>
        )}
      </div>

      <div className="section-container max-w-3xl">
        {project.content && typeof project.content === 'object' && Object.keys(project.content).length > 0 ? (
          <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8" role="article" aria-label="Project details">
            {Object.entries(project.content).map(([key, value]) => (
              typeof value === 'string' && (
                <section key={key}>
                  <h2 className="text-h2 font-display text-text-primary mb-4 capitalize">{key.replace(/_/g, ' ')}</h2>
                  <div className="text-body text-text-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: value }} />
                </section>
              )
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="text-h2 font-display text-text-primary mb-4">Tech Stack</h2>
              <div className="flex flex-wrap gap-2" role="list" aria-label="Technologies used">
                {project.tech_stack?.map(tech => (
                  <span key={tech} className="px-3 py-1.5 text-sm font-mono rounded-lg bg-surface-elevated text-text-secondary border border-border-primary" role="listitem">{tech}</span>
                ))}
              </div>
            </section>
            <section>
              <h2 className="text-h2 font-display text-text-primary mb-4">Category</h2>
              <p className="text-body text-text-secondary capitalize">{project.category || 'General'}</p>
            </section>
          </div>
        )}

        {project.metrics && typeof project.metrics === 'object' && Object.keys(project.metrics).length > 0 && (
          <section className="mt-12 pt-8 border-t border-border-primary" aria-labelledby="metrics-heading">
            <h2 id="metrics-heading" className="text-h2 font-display text-text-primary mb-6">Metrics &amp; Impact</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="list">
              {Object.entries(project.metrics).map(([key, value]) => (
                <div key={key} className="p-4 rounded-xl bg-surface-secondary border border-border-primary text-center" role="listitem">
                  <p className="text-h3 font-display text-accent-500">{String(value)}</p>
                  <p className="text-xs text-text-tertiary mt-1 capitalize">{key.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {relatedProjects.length > 0 && (
          <section className="mt-16 pt-8 border-t border-border-primary" aria-labelledby="related-projects-heading">
            <h2 id="related-projects-heading" className="text-h2 font-display text-text-primary mb-6">Related Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="list">
              {relatedProjects.map(rp => (
                <Link key={rp.id} href={`/projects/${rp.slug}`} className="group hover:no-underline" role="listitem">
                  <div className="p-4 rounded-xl bg-surface-secondary border border-border-primary hover:border-border-accent transition-all">
                    <div className="flex gap-2 mb-2 flex-wrap" role="list" aria-label="Technologies">
                      {rp.tech_stack?.slice(0, 2).map(t => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded bg-surface-elevated text-text-tertiary">{t}</span>
                      ))}
                    </div>
                    <h3 className="text-sm font-medium text-text-primary group-hover:text-accent-500 transition-colors">{rp.title}</h3>
                    <p className="text-xs text-text-tertiary mt-1 line-clamp-1">{rp.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
