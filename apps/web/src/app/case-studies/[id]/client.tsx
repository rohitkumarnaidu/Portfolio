'use client';

import Link from 'next/link';
import { Badge, Button } from '@portfolio/ui';
import { useCaseStudyWithProject } from '@/lib/hooks/useCaseStudies';

export function CaseStudyDetailClient({ id }: { id: string }) {
  const { caseStudy, project, isLoading, error } = useCaseStudyWithProject(id);

  if (isLoading) {
    return (
      <div className="pt-32 pb-24 section-container">
        <div className="animate-pulse space-y-6 max-w-4xl">
          <div className="h-4 w-32 bg-surface-elevated rounded" />
          <div className="h-10 w-3/4 bg-surface-elevated rounded" />
          <div className="h-48 bg-surface-elevated rounded-xl" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-surface-elevated rounded" />
            <div className="h-4 w-5/6 bg-surface-elevated rounded" />
            <div className="h-4 w-4/6 bg-surface-elevated rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !caseStudy || !project) {
    return (
      <div className="pt-32 pb-24 section-container text-center">
        <h1 className="text-h2 font-display text-text-primary mb-4">Case Study not found</h1>
        <p className="text-body text-text-secondary mb-6">This case study doesn&apos;t exist or has been removed.</p>
        <Link href="/case-studies" className="text-accent-500 hover:text-accent-600">← Back to Case Studies</Link>
      </div>
    );
  }

  const sections: { title: string; content: string | undefined }[] = [
    { title: 'The Challenge', content: caseStudy.challenge },
    { title: 'Our Approach', content: caseStudy.approach },
    { title: 'The Solution', content: caseStudy.solution },
    { title: 'Impact & Results', content: caseStudy.impact },
  ].filter(s => s.content);

  const csMetrics = caseStudy.metrics && typeof caseStudy.metrics === 'object'
    ? Object.entries(caseStudy.metrics)
    : [];

  return (
    <article className="pt-32 pb-24">
      <div className="section-container mb-8">
        <Link
          href="/case-studies"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-8 transition-colors"
          aria-label="Back to case studies"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Case Studies
        </Link>

        <div className="max-w-4xl">
          <div className="flex flex-wrap gap-2 mb-6" role="list" aria-label="Technologies">
            <Badge variant="info">Case Study</Badge>
            {project.tech_stack?.slice(0, 6).map(tech => (
              <Badge key={tech} variant="default">{tech}</Badge>
            ))}
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1 className="text-display font-display text-text-primary mb-4">{project.title}</h1>
              <p className="text-body-lg text-text-secondary max-w-2xl">{project.description}</p>
            </div>
            <div className="flex gap-3 shrink-0">
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noopener noreferrer" aria-label={`View live demo of ${project.title}`}>
                  <Button>Live Demo</Button>
                </a>
              )}
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer" aria-label={`View source code of ${project.title}`}>
                  <Button variant="secondary">Source</Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {project.cover_image && (
        <div className="w-full aspect-[21/9] max-h-[500px] bg-surface-elevated mb-16 border-y border-border-primary overflow-hidden">
          <img src={project.cover_image} alt={`${project.title} cover`} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="section-container max-w-3xl space-y-16">
        {sections.map(s => (
          <section key={s.title} className="prose prose-zinc dark:prose-invert max-w-none">
            <h2 className="text-h2 font-display text-text-primary">{s.title}</h2>
            <div
              className="text-body text-text-secondary leading-relaxed mt-4"
              dangerouslySetInnerHTML={{ __html: s.content || '' }}
            />
          </section>
        ))}

        {csMetrics.length > 0 && (
          <section>
            <h2 className="text-h2 font-display text-text-primary mb-6">Key Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="list">
              {csMetrics.map(([key, value]) => (
                <div key={key} className="p-6 rounded-xl bg-surface-secondary border border-border-primary text-center" role="listitem">
                  <p className="text-h2 font-display text-accent-500">{String(value)}</p>
                  <p className="text-xs text-text-tertiary mt-1 capitalize">{key.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {caseStudy.architectureDiagrams && caseStudy.architectureDiagrams.length > 0 && (
          <section>
            <h2 className="text-h2 font-display text-text-primary mb-6">Architecture</h2>
            <div className="space-y-6" role="list" aria-label="Architecture diagrams">
              {caseStudy.architectureDiagrams.map((url, i) => (
                <div key={i} className="rounded-xl bg-surface-secondary border border-border-primary p-4" role="listitem">
                  <img src={url} alt={`Architecture diagram ${i + 1}`} className="w-full rounded-lg" loading="lazy" />
                </div>
              ))}
            </div>
          </section>
        )}

        {caseStudy.codeSnippets && caseStudy.codeSnippets.length > 0 && (
          <section>
            <h2 className="text-h2 font-display text-text-primary mb-6">Code Samples</h2>
            <div className="space-y-4" role="list" aria-label="Code snippets">
              {caseStudy.codeSnippets.map((url, i) => (
                <div key={i} className="rounded-xl bg-surface-elevated border border-border-primary p-4 overflow-x-auto" role="listitem">
                  <img src={url} alt={`Code snippet ${i + 1}`} className="w-full rounded" loading="lazy" />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="pt-8 border-t border-border-primary">
          <Link href={`/projects/${project.slug}`} className="inline-flex items-center gap-2 text-accent-500 hover:text-accent-600 font-medium transition-colors">
            View full project details
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
