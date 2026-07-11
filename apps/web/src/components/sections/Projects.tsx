'use client';

import { useState } from 'react';
import Image from 'next/image';
import { usePublicProjects } from '@/lib/hooks/usePublicData';
import type { Project, Section } from '@portfolio/shared';
import { Card, CardBody } from '@portfolio/ui';
import { useInView } from '@/hooks/useInView';
import { SectionWrapper } from '@/components/layout/SectionWrapper';

const categories = [
  { value: '', label: 'All' },
  { value: 'web', label: 'Web' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'ai', label: 'AI' },
  { value: 'devops', label: 'DevOps' },
  { value: 'design', label: 'Design' },
];

function ProjectCard({ project, index, inView }: { project: Project; index: number; inView: boolean }) {
  return (
    <div
      className={`transition-all duration-700 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100 + 200}ms` }}
    >
      <Card variant="elevated" className="h-full flex flex-col glass-medium relative group hover:shadow-accent-hover neu-transition">
        {/* Project Image */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-elevated mb-4 -mx-6 -mt-6">
          {project.cover_image ? (
            <Image
              src={project.cover_image}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-text-tertiary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Featured Badge */}
          {project.is_featured && (
            <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-lg bg-accent-500 text-white shadow-lg">
              Featured
            </span>
          )}
        </div>

        <CardBody className="flex-1 flex flex-col">
          {/* Category Tag */}
          {project.category && (
            <span className="inline-flex self-start px-2.5 py-0.5 text-xs font-medium rounded-full bg-accent-500/10 text-accent-500 mb-2">
              {project.category}
            </span>
          )}

          <h3 className="font-display text-h4 text-text-primary mb-2">{project.title}</h3>
          {project.description && (
            <p className="text-body-sm text-text-secondary mb-4 line-clamp-2">{project.description}</p>
          )}

          {/* Tech Stack */}
          {project.tech_stack && project.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-auto">
              {project.tech_stack.slice(0, 6).map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 text-xs font-mono rounded-md bg-surface-elevated text-text-tertiary"
                >
                  {tech}
                </span>
              ))}
              {project.tech_stack.length > 6 && (
                <span className="px-2 py-0.5 text-xs font-mono rounded-md bg-surface-elevated text-text-tertiary">
                  +{project.tech_stack.length - 6}
                </span>
              )}
            </div>
          )}

          {/* Links */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border-primary">
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-500 hover:text-accent-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Live Demo
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Source
              </a>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export function Projects({ data }: { data?: Section }) {
  const [activeCategory, setActiveCategory] = useState('');
  const { ref, inView } = useInView<HTMLDivElement>(0.05);
  const { data: projects, isLoading } = usePublicProjects({
    featured: activeCategory === '' ? true : undefined,
    category: activeCategory || undefined,
    per_page: 100,
  });

  if (isLoading || !projects) {
    return (
      <SectionWrapper id="projects">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-48 bg-surface-elevated rounded-lg mx-auto mb-12" />
          <div className="flex gap-2 justify-center mb-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-20 bg-surface-elevated rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-surface-secondary border border-border-primary p-6 space-y-4">
                <div className="aspect-video bg-surface-elevated rounded-xl" />
                <div className="h-4 w-16 bg-surface-elevated rounded" />
                <div className="h-5 w-3/4 bg-surface-elevated rounded" />
                <div className="h-4 w-full bg-surface-elevated rounded" />
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-5 w-14 bg-surface-elevated rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>
    );
  }

  const content = (data?.content ?? {}) as Record<string, string | undefined>;

  return (
    <SectionWrapper
      id="projects"
      heading={content.title || "Featured work"}
      subtitle={content.subtitle || "A selection of projects I've built. Each one presented unique challenges and taught me something new."}
      animate={false}
    >
      <div ref={ref}>
        {/* Category Filters */}
        <div className={`flex flex-wrap gap-2 mb-10 transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                activeCategory === cat.value
                  ? 'bg-accent-600 text-white shadow-lg shadow-accent-600/25'
                  : 'bg-surface-elevated text-text-secondary hover:text-text-primary hover:bg-surface-secondary border border-border-primary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} inView={inView} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-elevated flex items-center justify-center">
              <svg className="w-8 h-8 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-body text-text-secondary">No projects found for this category.</p>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
