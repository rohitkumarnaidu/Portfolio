/**
 * @module Services
 * @description Service offerings grid with pricing-style cards.
 * Each card has an icon, title, description, feature list, and CTA.
 *
 * Architecture Reference: docs/09-ARCHITECTURE.md §2.4 (Component Tree)
 * Component Spec: docs/08b-COMPONENT-LIBRARY.md §2.6 (Services)
 *
 * Rendering Strategy: Client Component (data fetching)
 * Data Source: usePublicServices hook (TanStack Query)
 */

'use client';

import { useInView } from '@/hooks/useInView';
import { SECTION_IDS, ANIMATION } from '@/lib/constants';
import { SectionWrapper } from '@/components/layout/SectionWrapper';
import { usePublicServices } from '@/lib/hooks/usePublicData';
import type { Section, Service } from '@portfolio/shared';

// ── Types ───────────────────────────────────────────────────

interface ServiceItem {
  readonly id: string;
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly features: readonly string[];
  readonly highlighted?: boolean;
}

interface ServicesSectionContent {
  title?: string;
  subtitle?: string;
}

function mapService(svc: Service): ServiceItem {
  return {
    id: svc.id,
    icon: svc.icon,
    title: svc.title,
    description: svc.description,
    features: svc.features,
    highlighted: svc.is_highlighted,
  };
}

// ── Sub-components ──────────────────────────────────────────

function FeatureCheckmark() {
  return (
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
  );
}

function ServiceCard({
  service,
  index,
  inView,
}: {
  service: ServiceItem;
  index: number;
  inView: boolean;
}) {
  return (
    <article
      className={`relative rounded-2xl p-6 md:p-8 transition-all duration-700 ${
        service.highlighted
          ? 'bg-accent-500 text-white ring-2 ring-accent-500 shadow-xl'
          : 'glass-subtle hover:shadow-md'
      } ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${index * ANIMATION.STAGGER_DELAY + 200}ms` }}
    >
      {service.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-caption font-semibold bg-white text-accent-600 shadow-sm">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-3xl mb-4" aria-hidden="true">
        {service.icon}
      </div>

      <h3
        className={`font-display text-h4 mb-3 ${
          service.highlighted ? 'text-white' : 'text-text-primary'
        }`}
      >
        {service.title}
      </h3>

      <p
        className={`text-body mb-6 ${
          service.highlighted ? 'text-white/80' : 'text-text-secondary'
        }`}
      >
        {service.description}
      </p>

      <ul className="space-y-3 mb-8" aria-label={`Features of ${service.title}`}>
        {service.features.map((feature, i) => (
          <li
            key={i}
            className={`flex items-start gap-2.5 text-body-sm ${
              service.highlighted ? 'text-white/90' : 'text-text-secondary'
            }`}
          >
            {service.highlighted ? (
              <svg
                className="w-4 h-4 text-white shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <FeatureCheckmark />
            )}
            {feature}
          </li>
        ))}
      </ul>

      <a
        href={`#${SECTION_IDS.CONTACT}`}
        className={`inline-flex items-center justify-center w-full px-6 py-3 rounded-xl text-button font-medium transition-all duration-200 active:scale-[0.97] hover:no-underline ${
          service.highlighted
            ? 'bg-white text-accent-600 hover:bg-white/90 shadow-lg'
            : 'bg-accent-500 text-white hover:bg-accent-600'
        }`}
      >
        Get Started
      </a>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-subtle rounded-2xl p-6 md:p-8 animate-pulse">
      <div className="w-10 h-10 bg-border-primary rounded-lg mb-4" />
      <div className="h-6 bg-border-primary rounded w-3/4 mb-3" />
      <div className="space-y-2 mb-6">
        <div className="h-4 bg-border-primary rounded w-full" />
        <div className="h-4 bg-border-primary rounded w-4/5" />
      </div>
      <div className="space-y-2 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 bg-border-primary rounded w-2/3" />
        ))}
      </div>
      <div className="h-10 bg-border-primary rounded-xl w-full" />
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────

export function Services({ data }: { data?: Section }) {
  const { ref, inView } = useInView<HTMLDivElement>(ANIMATION.REVEAL_THRESHOLD);
  const { data: apiServices, isLoading } = usePublicServices();

  const content = (data?.content ?? {}) as ServicesSectionContent;
  const items: ServiceItem[] = apiServices?.map(mapService) ?? [];

  return (
    <SectionWrapper
      id={SECTION_IDS.SERVICES}
      heading={content.title || "How I can help"}
      subtitle={content.subtitle || "From design to deployment, I offer end-to-end development services tailored to your needs."}
      animate={false}
    >
      <div ref={ref}>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
            {[1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="transition-all duration-700"
                style={{ transitionDelay: `${index * ANIMATION.STAGGER_DELAY + 200}ms` }}
              >
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-text-secondary py-12">
            No services yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
            {items.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={index}
                inView={inView}
              />
            ))}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
