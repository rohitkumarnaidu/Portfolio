'use client';

import { useEffect, useRef, useState } from 'react';
import { SectionWrapper } from '@/components/layout/SectionWrapper';
import type { Section } from '@portfolio/shared';
import { SECTION_IDS } from '@/lib/constants';

function AnimatedCounter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !counted.current) {
          counted.current = true;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <div ref={ref} className="text-center">
      <span className="font-display text-h1 text-accent-500">
        {count}{suffix}
      </span>
    </div>
  );
}

const defaultStats = [
  { value: 8, suffix: '+', label: 'Years Experience' },
  { value: 50, suffix: '+', label: 'Projects Delivered' },
  { value: 30, suffix: '+', label: 'Technologies' },
  { value: 100, suffix: '%', label: 'Client Satisfaction' },
];

interface AboutContent {
  title?: string;
  subtitle?: string;
  bio?: string;
  stats?: Array<{ value: number; suffix: string; label: string }>;
  what_i_do?: string[];
  my_approach?: string[];
}

export function About({ data }: { data?: Section }) {
  const content = (data?.content ?? {}) as AboutContent;
  const stats = content.stats || defaultStats;
  const bio = content.bio || "I'm a full-stack developer with over 8 years of experience building enterprise-grade web applications. I specialize in React, Next.js, NestJS, and TypeScript, and I'm passionate about creating fast, accessible, and beautiful digital experiences.";

  return (
    <SectionWrapper
      id={SECTION_IDS.ABOUT}
      heading={content.title || "About Me"}
      subtitle={content.subtitle || "Passionate about building products that make a difference"}
    >
      <div className="max-w-3xl mx-auto mb-16 text-center">
        <p className="text-body-lg text-text-secondary text-pretty">
          {bio}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid mb-16">
        {stats.map((stat: { value: number; suffix: string; label: string }) => (
          <div
            key={stat.label}
            className="glass-subtle rounded-2xl p-8 text-center transition-all duration-700 opacity-100"
          >
            <AnimatedCounter end={stat.value} suffix={stat.suffix} />
            <p className="text-body-sm text-text-secondary mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Bio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4 transition-all duration-700 delay-100 opacity-100">
          <h3 className="font-display text-h4 text-text-primary">What I Do</h3>
          <ul className="space-y-3">
            {(content.what_i_do || [
              'Full-stack web application development with React & Next.js',
              'RESTful API design with NestJS & TypeScript',
              'Database architecture with PostgreSQL & Supabase',
              'Cloud infrastructure & DevOps with Docker & Vercel',
              'Performance optimization & accessibility auditing',
            ]).map((item: string) => (
              <li key={item} className="flex items-start gap-3 text-body text-text-secondary">
                <svg className="w-5 h-5 text-accent-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4 transition-all duration-700 delay-200 opacity-100">
          <h3 className="font-display text-h4 text-text-primary">My Approach</h3>
          <ul className="space-y-3">
            {(content.my_approach || [
              'Write clean, maintainable, and well-tested code',
              'Prioritize user experience and accessibility from day one',
              'Choose the right tool for the job — no over-engineering',
              'Ship fast, iterate, and measure everything',
              'Open-source contributor and continuous learner',
            ]).map((item: string) => (
              <li key={item} className="flex items-start gap-3 text-body text-text-secondary">
                <svg className="w-5 h-5 text-accent-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionWrapper>
  );
}
