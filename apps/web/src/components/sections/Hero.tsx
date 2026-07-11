'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@portfolio/ui';
import { useInView } from '@/hooks/useInView';
import { GradientFallback } from '@/components/3d/fallbacks/GradientFallback';
import { get3DTier } from '@/lib/3d/performance/deviceCapabilities';
import type { Tier } from '@/lib/3d/types';
import { useTheme } from 'next-themes';

const Scene3D = dynamic(() => import('@/components/3d/Scene3D').then((mod) => mod.Scene3D), {
  ssr: false,
  loading: () => <GradientFallback theme="dark" />,
});

import type { Section } from '@portfolio/shared';
import { SECTION_IDS } from '@/lib/constants';

export function Hero({ data }: { data?: Section }) {
  const { ref, inView } = useInView(0.1);
  const [tier, setTier] = useState<Tier>('off');
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let mounted = true;
    get3DTier().then((detectedTier) => {
      if (mounted) setTier(detectedTier);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const isLight = resolvedTheme !== 'dark';

  // Fallback content if API fails
  const content = data?.content ?? {};
  const safe = content as Record<string, string | undefined>;
  const title = safe.title || 'Full-stack developer crafting enterprise-grade digital experiences';
  const subtitle = safe.subtitle || 'I build full-stack web applications with React, Next.js, NestJS, and TypeScript. Focused on performance, accessibility, and clean architecture.';

  return (
    <section id={SECTION_IDS.HERO} className="relative min-h-dvh flex items-center justify-center overflow-hidden pt-16 bg-surface-primary">
      {/* Background Layer: 3D Scene or Fallback */}
      <div className="absolute inset-0 z-0">
        {tier === 'off' ? (
          <GradientFallback theme={isLight ? 'light' : 'dark'} />
        ) : (
          <Scene3D scene="hero" initialTier={tier} theme={isLight ? 'light' : 'dark'} />
        )}
      </div>

      {/* Content Layer */}
      <div
        ref={ref}
        className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-24 md:py-32 text-center pointer-events-none"
      >
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-semantic-success-bg border border-semantic-success/20 mb-8 transition-all duration-700 pointer-events-auto ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-semantic-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-semantic-success" />
          </span>
          <span className="text-xs font-medium text-semantic-success">
            {safe.status || 'Available for new opportunities'}
          </span>
        </div>

        <h1
          className={`font-display text-display text-text-primary mb-6 text-balance max-w-5xl mx-auto transition-all duration-700 delay-100 pointer-events-auto ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          dangerouslySetInnerHTML={{ __html: title.replace('enterprise-grade', '<span class="text-transparent bg-clip-text bg-[image:var(--gradient-text-hero)] font-bold animate-pulse-dot">enterprise-grade</span>') }}
        />

        <p
          className={`text-body-lg text-text-secondary max-w-2xl mx-auto mb-12 text-balance transition-all duration-700 delay-200 pointer-events-auto ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {subtitle}
        </p>

        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-300 pointer-events-auto ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Button
            size="lg"
            onClick={() => {
              document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {safe.primary_cta || 'View My Work'}
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {safe.secondary_cta || 'Get in Touch'}
          </Button>
        </div>

        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 delay-500 pointer-events-auto ${
            inView ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex flex-col items-center gap-2 text-text-tertiary">
            <span className="text-caption">Scroll to explore</span>
            <div className="w-5 h-8 rounded-full border-2 border-border-accent flex justify-center pt-1.5">
              <div className="w-1 h-2 rounded-full bg-accent-500 animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

