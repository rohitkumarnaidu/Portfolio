'use client';

import { useEffect, useState, useRef } from 'react';
import { usePublicSkills } from '@/lib/hooks/usePublicData';
import type { Section } from '@portfolio/shared';
import { SectionWrapper } from '@/components/layout/SectionWrapper';

function SkillBar({ name, proficiency, delay = 0 }: { name: string; proficiency: number; delay: number }) {
  const [width, setWidth] = useState(0);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          setTimeout(() => setWidth(proficiency), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [proficiency, delay]);

  const getBarColor = (value: number) => {
    if (value >= 90) return 'bg-accent-500';
    if (value >= 75) return 'bg-accent-400';
    if (value >= 60) return 'bg-accent-300';
    return 'bg-accent-200';
  };

  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">{name}</span>
        <span className={`text-xs font-mono text-text-tertiary transition-opacity duration-300 ${inView ? 'opacity-100' : 'opacity-0'}`}>
          {proficiency}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-surface-elevated overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarColor(proficiency)}`}
          style={{
            width: `${inView ? width : 0}%`,
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

export function Skills({ data }: { data?: Section }) {
  const { data: skills, isLoading } = usePublicSkills();

  const grouped = (skills ?? []).reduce<Record<string, typeof skills>>((acc, skill) => {
    const cat = skill.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat]!.push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  const categoryOrder = ['Languages', 'Frontend', 'Backend', 'DevOps'];
  const sortedCategories = Object.keys(grouped).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b),
  );

  if (isLoading || !skills) {
    return (
      <SectionWrapper id="skills" variant="alt">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-48 bg-surface-elevated rounded-lg mx-auto mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4 p-6 glass-subtle rounded-2xl">
                <div className="h-5 w-24 bg-surface-elevated rounded" />
                {[1, 2, 3].map((j) => (
                  <div key={j} className="space-y-1.5">
                    <div className="h-4 w-20 bg-surface-elevated rounded" />
                    <div className="h-2 bg-surface-elevated rounded-full" />
                  </div>
                ))}
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
      id="skills"
      variant="alt"
      heading={content.title || "Technologies I work with"}
      subtitle={content.subtitle || "A curated selection of technologies I use daily. From frontend to backend to infrastructure — I believe in mastering the tools that matter."}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedCategories.map((category) => (
          <div
            key={category}
            className="glass-medium rounded-2xl p-6 relative group hover:shadow-accent-hover neu-transition"
          >
            <h3 className="font-display text-h4 text-text-primary mb-6">{category}</h3>
            <div className="space-y-4">
              {(grouped[category] ?? [])
                .sort((a, b) => b.proficiency - a.proficiency)
                .map((skill, skillIdx) => (
                  <SkillBar
                    key={skill.id}
                    name={skill.name}
                    proficiency={skill.proficiency}
                    delay={skillIdx * 100}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
