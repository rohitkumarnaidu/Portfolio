import React from 'react';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/cn';
import { SectionBackground, type BgVariant } from '@/components/effects/SectionBackground';

export interface SectionWrapperProps {
  id: string;
  heading?: string;
  headingLevel?: 'h2' | 'h3';
  subtitle?: string;
  variant?: 'default' | 'alt' | 'accent' | 'glass';
  background?:
    | 'none'
    | 'gradient'
    | 'noise'
    | 'dots'
    | 'mesh-1'
    | 'mesh-2'
    | 'gradient-hero'
    | 'gradient-cta';
  paddingTop?: 'none' | 'compact' | 'default' | 'generous';
  paddingBottom?: 'none' | 'compact' | 'default' | 'generous';
  animate?: boolean;
  animateDirection?: 'up' | 'down' | 'left' | 'right' | 'fade';
  className?: string;
  children: React.ReactNode;
}

export function SectionWrapper({
  id,
  heading,
  headingLevel = 'h2',
  subtitle,
  variant = 'default',
  background = 'none',
  paddingTop = 'default',
  paddingBottom = 'default',
  animate = true,
  animateDirection = 'up',
  className,
  children,
}: SectionWrapperProps) {
  const { ref: sectionRef, inView: isInView } = useInView<HTMLElement>(0.2);

  const HeadingTag = headingLevel;

  const bgStyles = {
    default: 'bg-transparent',
    alt: 'bg-surface-elevated',
    accent: 'bg-accent-50',
    glass: 'glass-medium',
  };

  const ptStyles = {
    none: 'pt-0',
    compact: 'pt-8 md:pt-12',
    default: 'pt-16 md:pt-20 lg:pt-24',
    generous: 'pt-24 md:pt-32',
  };

  const pbStyles = {
    none: 'pb-0',
    compact: 'pb-8 md:pb-12',
    default: 'pb-16 md:pb-20 lg:pb-24',
    generous: 'pb-24 md:pb-32',
  };

  const animationClasses = animate
    ? cn(
        'transition-all duration-700 ease-out',
        !isInView && animateDirection === 'up' && 'opacity-0 translate-y-12',
        !isInView && animateDirection === 'down' && 'opacity-0 -translate-y-12',
        !isInView && animateDirection === 'left' && 'opacity-0 translate-x-12',
        !isInView && animateDirection === 'right' && 'opacity-0 -translate-x-12',
        !isInView && animateDirection === 'fade' && 'opacity-0',
        isInView && 'opacity-100 translate-y-0 translate-x-0',
      )
    : '';

  const bgVariantMap: Record<string, string> = {
    gradient: 'gradient-cta',
    'mesh-1': 'mesh-1',
    'mesh-2': 'mesh-2',
    'gradient-hero': 'gradient-hero',
    'gradient-cta': 'gradient-cta',
    noise: 'noise',
    dots: 'dots',
    none: 'none',
  };

  return (
    <section
      ref={sectionRef}
      id={id}
      aria-labelledby={heading ? `heading-${id}` : undefined}
      className={cn(
        'relative w-full overflow-hidden',
        bgStyles[variant],
        ptStyles[paddingTop],
        pbStyles[paddingBottom],
        className,
      )}
    >
      <SectionBackground variant={bgVariantMap[background] as BgVariant} />

      <div className={cn('section-container relative z-10', animationClasses)}>
        {heading && (
          <div className="mb-12 text-center md:mb-16">
            <HeadingTag
              id={`heading-${id}`}
              className="font-display text-h2 font-bold tracking-tight text-text-primary"
            >
              {heading}
            </HeadingTag>
            {subtitle && (
              <p className="mt-4 text-body-lg text-text-secondary max-w-2xl mx-auto text-balance">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
