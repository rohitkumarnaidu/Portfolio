'use client';

import { usePublicFAQs } from '@/lib/hooks/usePublicData';
import { useInView } from '@/hooks/useInView';
import { SECTION_IDS, ANIMATION } from '@/lib/constants';
import { SectionWrapper } from '@/components/layout/SectionWrapper';

// ── Types ───────────────────────────────────────────────────

interface FAQItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

// ── Sub-components ──────────────────────────────────────────

function FAQAccordionItem({
  item,
  index,
  inView,
}: {
  item: FAQItem;
  index: number;
  inView: boolean;
}) {
  return (
    <details
      className={`group border-b border-border-primary transition-all duration-700 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * ANIMATION.STAGGER_DELAY + 200}ms` }}
    >
      <summary className="flex items-center justify-between py-5 md:py-6 cursor-pointer text-body-lg font-medium text-text-primary hover:text-accent-500 transition-colors duration-200 list-none [&::-webkit-details-marker]:hidden">
        <span className="pr-4">{item.question}</span>
        {/* Chevron icon — rotates on open */}
        <svg
          className="w-5 h-5 text-text-tertiary shrink-0 transition-transform duration-300 group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>

      <div className="pb-5 md:pb-6 pr-12">
        <p className="text-body text-text-secondary leading-relaxed">
          {item.answer}
        </p>
      </div>
    </details>
  );
}

// ── Main Component ──────────────────────────────────────────

import type { Section } from '@portfolio/shared';

interface FAQSectionContent {
  title?: string;
  subtitle?: string;
  faqs?: FAQItem[];
}

export function FAQ({ data }: { data?: Section }) {
  const { data: apiFAQs, isLoading } = usePublicFAQs();
  const { ref, inView } = useInView<HTMLDivElement>(ANIMATION.REVEAL_THRESHOLD);

  const content = (data?.content ?? {}) as FAQSectionContent;

  const apiItems: FAQItem[] = apiFAQs
    ? apiFAQs.map((faq) => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
      }))
    : [];

  const items: readonly FAQItem[] = content.faqs || apiItems;

  if (isLoading) {
    return (
      <SectionWrapper
        id={SECTION_IDS.FAQ}
        heading={content.title || "Frequently asked questions"}
        subtitle={content.subtitle || "Common questions about my services, process, and availability."}
        variant="alt"
        animate={false}
        className="max-w-3xl"
      >
        <div className="animate-pulse divide-y-0 border-t border-border-primary">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border-b border-border-primary py-5 md:py-6 flex items-center justify-between">
              <div className="h-5 w-3/4 bg-surface-elevated rounded" />
              <div className="w-5 h-5 bg-surface-elevated rounded" />
            </div>
          ))}
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      id={SECTION_IDS.FAQ}
      heading={content.title || "Frequently asked questions"}
      subtitle={content.subtitle || "Common questions about my services, process, and availability."}
      variant="alt"
      animate={false}
      className="max-w-3xl"
    >
      <div ref={ref}>
        {/* Accordion */}
        {items.length > 0 ? (
          <div className="divide-y-0 border-t border-border-primary">
            {items.map((item, index) => (
              <FAQAccordionItem
                key={item.id}
                item={item}
                index={index}
                inView={inView}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-t border-border-primary">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-elevated flex items-center justify-center">
              <svg className="w-8 h-8 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-body text-text-secondary">No FAQs yet.</p>
          </div>
        )}

        {/* CTA */}
        <div
          className={`text-center mt-12 transition-all duration-700 delay-500 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-body text-text-secondary mb-4">
            Have a different question?
          </p>
          <a
            href={`#${SECTION_IDS.CONTACT}`}
            className="inline-flex items-center px-6 py-3 rounded-xl text-button font-medium bg-accent-500 text-white hover:bg-accent-600 transition-all duration-200 active:scale-[0.97] hover:no-underline"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </SectionWrapper>
  );
}
