/**
 * @module Experience
 * @description Interactive timeline section displaying professional experience.
 * Renders an ordered list of career positions with animated scroll reveals.
 *
 * Architecture Reference: docs/09-ARCHITECTURE.md §2.4 (Component Tree)
 * Component Spec: docs/08b-COMPONENT-LIBRARY.md §2.4 (Experience)
 * Accessibility: docs/28-ACCESSIBILITY.md — Semantic HTML, <time> element
 *
 * Rendering Strategy: Client Component (data fetching)
 * Data Source: usePublicExperiences hook (TanStack Query)
 */

'use client';

import { useInView } from '@/hooks/useInView';
import { SECTION_IDS, ANIMATION } from '@/lib/constants';
import { SectionWrapper } from '@/components/layout/SectionWrapper';
import { usePublicExperiences } from '@/lib/hooks/usePublicData';
import type { Section, Experience } from '@portfolio/shared';

// ── Types ───────────────────────────────────────────────────

interface ExperienceItem {
  readonly id: string;
  readonly role: string;
  readonly company: string;
  readonly companyUrl?: string;
  readonly location: string;
  readonly startDate: string;
  readonly endDate: string | 'Present';
  readonly description: string;
  readonly achievements: readonly string[];
  readonly technologies: readonly string[];
}

interface ExperienceSectionContent {
  title?: string;
  subtitle?: string;
}

// ── Helper ──────────────────────────────────────────────────

function formatDateRange(startDate: string, endDate: string | 'Present'): string {
  const start = new Date(startDate + '-01');
  const startFormatted = start.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  if (endDate === 'Present') {
    return `${startFormatted} — Present`;
  }

  const end = new Date(endDate + '-01');
  const endFormatted = end.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return `${startFormatted} — ${endFormatted}`;
}

function mapExperience(exp: Experience): ExperienceItem {
  return {
    id: exp.id,
    role: exp.role,
    company: exp.company,
    companyUrl: exp.company_url,
    location: exp.location,
    startDate: exp.start_date,
    endDate: exp.end_date,
    description: exp.description,
    achievements: exp.achievements,
    technologies: exp.technologies,
  };
}

// ── Sub-components ──────────────────────────────────────────

function TimelineNode({ isFirst }: { isFirst: boolean }) {
  return (
    <div className="relative flex flex-col items-center" aria-hidden="true">
      {!isFirst && (
        <div className="w-px h-8 bg-border-primary" />
      )}
      <div className="w-3 h-3 rounded-full bg-accent-500 ring-4 ring-accent-500/20 shrink-0" />
      <div className="w-px flex-1 bg-border-primary" />
    </div>
  );
}

function TechBadge({ tech }: { tech: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-caption font-medium bg-accent-50 text-accent-700 dark:bg-accent-50 dark:text-accent-300 [html[data-theme='dark']_&]:bg-accent-50 [html[data-theme='dark']_&]:text-accent-300">
      {tech}
    </span>
  );
}

function ExperienceCard({
  item,
  index,
  inView,
}: {
  item: ExperienceItem;
  index: number;
  inView: boolean;
}) {
  const dateRange = formatDateRange(item.startDate, item.endDate);

  return (
    <article
      className={`transition-all duration-700 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * ANIMATION.STAGGER_DELAY + 100}ms` }}
    >
      <time
        dateTime={item.startDate}
        className="block text-caption font-medium text-accent-500 uppercase tracking-widest mb-2 md:hidden"
      >
        {dateRange}
      </time>

      <div className="glass-subtle rounded-2xl p-6 md:p-8 hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-4">
          <div>
            <h3 className="font-display text-h4 text-text-primary">{item.role}</h3>
            <p className="text-body text-text-secondary">
              {item.companyUrl ? (
                <a
                  href={item.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-link hover:underline"
                >
                  {item.company}
                </a>
              ) : (
                item.company
              )}
              <span className="mx-2 text-text-tertiary" aria-hidden="true">·</span>
              <span className="text-text-tertiary">{item.location}</span>
            </p>
          </div>

          <time
            dateTime={item.startDate}
            className="hidden md:block text-body-sm font-medium text-text-tertiary whitespace-nowrap"
          >
            {dateRange}
          </time>
        </div>

        <p className="text-body text-text-secondary mb-4">
          {item.description}
        </p>

        <ul className="space-y-2 mb-6" aria-label={`Key achievements at ${item.company}`}>
          {item.achievements.map((achievement, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-body-sm text-text-secondary"
            >
              <svg
                className="w-4 h-4 text-semantic-success shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {achievement}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2" aria-label={`Technologies used at ${item.company}`}>
          {item.technologies.map((tech) => (
            <TechBadge key={tech} tech={tech} />
          ))}
        </div>
      </div>
    </article>
  );
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <article
      className="transition-all duration-700 opacity-100"
      style={{ transitionDelay: `${index * ANIMATION.STAGGER_DELAY + 100}ms` }}
    >
      <div className="glass-subtle rounded-2xl p-6 md:p-8 animate-pulse">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-4">
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-border-primary rounded w-3/4" />
            <div className="h-4 bg-border-primary rounded w-1/2" />
          </div>
          <div className="h-4 bg-border-primary rounded w-24 hidden md:block" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-border-primary rounded w-full" />
          <div className="h-4 bg-border-primary rounded w-5/6" />
        </div>
        <div className="space-y-2 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-border-primary rounded w-2/3" />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 bg-border-primary rounded w-16" />
          ))}
        </div>
      </div>
    </article>
  );
}

// ── Main Component ──────────────────────────────────────────

export function Experience({ data }: { data?: Section }) {
  const { ref, inView } = useInView<HTMLDivElement>(ANIMATION.REVEAL_THRESHOLD);
  const { data: apiExperiences, isLoading } = usePublicExperiences();

  const content = (data?.content ?? {}) as ExperienceSectionContent;
  const items: ExperienceItem[] = apiExperiences?.map(mapExperience) ?? [];

  return (
    <SectionWrapper
      id={SECTION_IDS.EXPERIENCE}
      heading={content.title || "Building products that scale"}
      subtitle={content.subtitle || "Over 8 years of professional experience building web applications for startups, agencies, and enterprise clients."}
      animate={false}
    >
      <div ref={ref}>
        <ol className="relative space-y-0" aria-label="Professional experience timeline">
          {isLoading ? (
            [1, 2, 3].map((_, index) => (
              <li key={index} className="flex gap-6 md:gap-8">
                <div className="hidden md:flex flex-col items-center">
                  <TimelineNode isFirst={index === 0} />
                </div>
                <div className="flex-1 pb-12 last:pb-0">
                  <SkeletonCard index={index} />
                </div>
              </li>
            ))
          ) : items.length === 0 ? (
            <li>
              <p className="text-center text-text-secondary py-12">
                No experience entries yet.
              </p>
            </li>
          ) : (
            items.map((item, index) => (
              <li key={item.id} className="flex gap-6 md:gap-8">
                <div className="hidden md:flex flex-col items-center">
                  <TimelineNode isFirst={index === 0} />
                </div>
                <div className="flex-1 pb-12 last:pb-0">
                  <ExperienceCard item={item} index={index} inView={inView} />
                </div>
              </li>
            ))
          )}
        </ol>
      </div>
    </SectionWrapper>
  );
}
