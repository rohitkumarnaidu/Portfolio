'use client';

import { useState } from 'react';
import { getAchievements } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

const categories = ['', 'certification', 'award', 'recognition'] as const;

export default function AchievementsPage() {
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: achievements, isLoading } = useQuery({
    queryKey: ['publicAchievements', categoryFilter],
    queryFn: () => getAchievements({ category: categoryFilter || undefined }),
  });

  return (
    <div className="min-h-dvh bg-surface-primary">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="mb-12">
          <h1 className="font-display text-h1 text-text-primary mb-3">Achievements</h1>
          <p className="text-body text-text-secondary max-w-2xl">
            Certifications, awards, and professional recognitions.
          </p>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                categoryFilter === c
                  ? 'bg-accent-500 text-white'
                  : 'bg-surface-elevated text-text-secondary hover:text-text-primary'
              }`}
            >
              {c || 'All'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-surface-secondary border border-border-primary p-6 animate-pulse h-48"
              />
            ))}
          </div>
        ) : !achievements?.length ? (
          <div className="text-center py-16">
            <p className="text-body text-text-secondary">No achievements found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl bg-surface-secondary border border-border-primary p-6 hover:border-border-accent transition-colors group"
              >
                <div className="flex items-start gap-4">
                  {a.badgeImageUrl ? (
                    <img
                      src={a.badgeImageUrl}
                      alt=""
                      className="w-12 h-12 rounded-xl object-contain bg-surface-elevated shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center text-accent-500 shrink-0">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.896m0 0a6.03 6.03 0 01-3 0m0 0a6.022 6.022 0 01-2.77-.896"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-h4 text-text-primary group-hover:text-accent-500 transition-colors">
                      {a.title}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">{a.issuer}</p>
                    {a.category && (
                      <span className="inline-block text-xs px-2 py-0.5 rounded bg-surface-elevated text-text-tertiary mt-2 capitalize">
                        {a.category}
                      </span>
                    )}
                  </div>
                </div>
                {a.description && (
                  <p className="text-sm text-text-tertiary mt-3">{a.description}</p>
                )}
                <div className="flex items-center gap-3 mt-4 text-xs text-text-tertiary">
                  {a.achievedDate && <span>{a.achievedDate}</span>}
                  {a.credentialUrl && (
                    <a
                      href={a.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-500 hover:underline ml-auto"
                    >
                      View credential
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
