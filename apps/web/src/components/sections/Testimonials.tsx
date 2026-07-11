/**
 * @module Testimonials
 * @description Horizontal carousel of client/colleague testimonials with
 * auto-advance, star ratings, and full keyboard navigation.
 *
 * Architecture Reference: docs/09-ARCHITECTURE.md §2.4 (Component Tree)
 * Component Spec: docs/08b-COMPONENT-LIBRARY.md §2.5 (Testimonials)
 * Accessibility: WAI-ARIA Carousel Pattern
 *
 * Rendering Strategy: Client Component (interactive carousel)
 * Data Source: usePublicTestimonials hook (TanStack Query)
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useInView } from '@/hooks/useInView';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SECTION_IDS, ANIMATION } from '@/lib/constants';
import { SectionWrapper } from '@/components/layout/SectionWrapper';
import { usePublicTestimonials } from '@/lib/hooks/usePublicData';
import type { Section, Testimonial } from '@portfolio/shared';

// ── Types ───────────────────────────────────────────────────

interface TestimonialItem {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly company: string;
  readonly avatarInitials: string;
  readonly content: string;
  readonly rating: number;
}

interface TestimonialsSectionContent {
  title?: string;
  subtitle?: string;
}

// ── Helper ──────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function mapTestimonial(t: Testimonial): TestimonialItem {
  return {
    id: t.id,
    name: t.name,
    role: t.role,
    company: t.company,
    avatarInitials: getInitials(t.name),
    content: t.content,
    rating: t.rating,
  };
}

// ── Auto-advance interval ───────────────────────────────────

const AUTO_ADVANCE_MS = 6000;

// ── Sub-components ──────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${
            i < rating ? 'text-yellow-400' : 'text-border-primary'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div
      className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center shrink-0"
      aria-hidden="true"
    >
      <span className="text-body-sm font-semibold text-accent-700">
        {initials}
      </span>
    </div>
  );
}

function TestimonialCard({
  testimonial,
  isActive,
}: {
  testimonial: TestimonialItem;
  isActive: boolean;
}) {
  return (
    <article
      className={`glass-subtle rounded-2xl p-6 md:p-8 transition-all duration-500 ${
        isActive
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-95 absolute inset-0 pointer-events-none'
      }`}
      role="tabpanel"
      id={`testimonial-panel-${testimonial.id}`}
      aria-labelledby={`testimonial-tab-${testimonial.id}`}
      aria-hidden={!isActive}
    >
      <StarRating rating={testimonial.rating} />

      <blockquote className="mt-4 mb-6">
        <p className="text-body-lg text-text-primary leading-relaxed">
          &ldquo;{testimonial.content}&rdquo;
        </p>
      </blockquote>

      <footer className="flex items-center gap-3">
        <Avatar initials={testimonial.avatarInitials} />
        <div>
          <cite className="not-italic font-medium text-body text-text-primary block">
            {testimonial.name}
          </cite>
          <span className="text-body-sm text-text-secondary">
            {testimonial.role}, {testimonial.company}
          </span>
        </div>
      </footer>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-subtle rounded-2xl p-6 md:p-8 animate-pulse">
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="w-4 h-4 rounded bg-border-primary" />
        ))}
      </div>
      <div className="space-y-2 mb-6">
        <div className="h-4 bg-border-primary rounded w-full" />
        <div className="h-4 bg-border-primary rounded w-5/6" />
        <div className="h-4 bg-border-primary rounded w-4/6" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-border-primary" />
        <div className="space-y-1.5">
          <div className="h-4 bg-border-primary rounded w-24" />
          <div className="h-3 bg-border-primary rounded w-36" />
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────

export function Testimonials({ data }: { data?: Section }) {
  const { ref, inView } = useInView<HTMLDivElement>(ANIMATION.REVEAL_THRESHOLD);
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { data: apiTestimonials, isLoading } = usePublicTestimonials();

  const content = (data?.content ?? {}) as TestimonialsSectionContent;
  const items: TestimonialItem[] = apiTestimonials?.map(mapTestimonial) ?? [];
  const totalSlides = items.length;

  const goToSlide = useCallback(
    (index: number) => {
      setActiveIndex((index + totalSlides) % totalSlides);
    },
    [totalSlides],
  );

  const goNext = useCallback(() => goToSlide(activeIndex + 1), [activeIndex, goToSlide]);
  const goPrev = useCallback(() => goToSlide(activeIndex - 1), [activeIndex, goToSlide]);

  // Auto-advance
  useEffect(() => {
    if (isPaused || prefersReducedMotion || !inView) return;

    intervalRef.current = setInterval(goNext, AUTO_ADVANCE_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [goNext, isPaused, prefersReducedMotion, inView]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goPrev();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goNext();
          break;
      }
    },
    [goNext, goPrev],
  );

  return (
    <SectionWrapper
      id={SECTION_IDS.TESTIMONIALS}
      heading={content.title || "What people say"}
      subtitle={content.subtitle || "Feedback from colleagues, clients, and managers I've had the pleasure of working with."}
      variant="alt"
      animate={false}
    >
      <div ref={ref}>
        <div
          className={`max-w-3xl mx-auto transition-all duration-700 delay-200 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          role="region"
          aria-roledescription="carousel"
          aria-label="Client testimonials"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          onKeyDown={handleKeyDown}
        >
          <div className="relative min-h-[280px] md:min-h-[240px]">
            {isLoading ? (
              Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className={i === 0 ? '' : 'absolute inset-0 pointer-events-none'}
                  style={i !== 0 ? { opacity: 0 } : undefined}
                >
                  <SkeletonCard />
                </div>
              ))
            ) : items.length === 0 ? (
              <p className="text-center text-text-secondary py-12">
                No testimonials yet.
              </p>
            ) : (
              items.map((testimonial, index) => (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  isActive={index === activeIndex}
                />
              ))
            )}
          </div>

          {!isLoading && items.length > 0 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={goPrev}
                className="p-2 rounded-full border border-border-primary text-text-secondary hover:text-text-primary hover:border-border-accent transition-colors duration-200"
                aria-label="Previous testimonial"
                type="button"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex gap-2" role="tablist" aria-label="Testimonial slides">
                {items.map((testimonial, index) => (
                  <button
                    key={testimonial.id}
                    onClick={() => goToSlide(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? 'bg-accent-500 scale-125'
                        : 'bg-border-accent hover:bg-text-tertiary'
                    }`}
                    role="tab"
                    id={`testimonial-tab-${testimonial.id}`}
                    aria-selected={index === activeIndex}
                    aria-controls={`testimonial-panel-${testimonial.id}`}
                    aria-label={`Testimonial from ${testimonial.name}`}
                    type="button"
                  />
                ))}
              </div>

              <button
                onClick={goNext}
                className="p-2 rounded-full border border-border-primary text-text-secondary hover:text-text-primary hover:border-border-accent transition-colors duration-200"
                aria-label="Next testimonial"
                type="button"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {!isLoading && items.length > 0 && (
              <>Showing testimonial {activeIndex + 1} of {totalSlides}: from {items[activeIndex]?.name}</>
            )}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
