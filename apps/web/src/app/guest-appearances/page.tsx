'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGuestAppearances } from '@/lib/api';

const types = [
  { value: '', label: 'All' },
  { value: 'podcast', label: 'Podcasts' },
  { value: 'talk', label: 'Talks' },
  { value: 'interview', label: 'Interviews' },
  { value: 'webinar', label: 'Webinars' },
];

const typeIcons: Record<string, React.ReactNode> = {
  podcast: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
  ),
  talk: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  interview: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  webinar: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
    </svg>
  ),
};

export default function GuestAppearancesPage() {
  const [typeFilter, setTypeFilter] = useState('');

  const { data: appearances, isLoading } = useQuery({
    queryKey: ['guestAppearances', typeFilter],
    queryFn: () => getGuestAppearances({ type: typeFilter || undefined }),
  });

  return (
    <div className="min-h-dvh bg-surface-primary">
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="mb-12">
          <h1 className="font-display text-h1 text-text-primary mb-3">Guest Appearances</h1>
          <p className="text-body text-text-secondary max-w-2xl">Podcasts, talks, interviews, and webinars I&apos;ve been featured on.</p>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {types.map(t => (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                typeFilter === t.value
                  ? 'bg-accent-500 text-white'
                  : 'bg-surface-elevated text-text-secondary hover:text-text-primary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="rounded-2xl bg-surface-secondary border border-border-primary p-6 animate-pulse h-24" />)}
          </div>
        ) : !appearances?.length ? (
          <div className="text-center py-16">
            <p className="text-body text-text-secondary">No guest appearances yet.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border-primary" />
            <div className="space-y-8">
              {appearances.map(a => (
                <div key={a.id} className="relative pl-16">
                  <div className="absolute left-4 w-4 h-4 rounded-full bg-accent-500 border-2 border-surface-primary -translate-x-1/2 mt-1.5" />
                  <div className="rounded-2xl bg-surface-secondary border border-border-primary p-5 hover:border-border-accent transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center text-accent-500 shrink-0">
                        {typeIcons[a.type] || typeIcons.podcast}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-surface-elevated text-text-tertiary capitalize">{a.type}</span>
                          {a.date && <span className="text-xs text-text-tertiary">{a.date}</span>}
                        </div>
                        <h3 className="font-display text-h4 text-text-primary">{a.title}</h3>
                        <p className="text-sm text-text-secondary mt-1">with {a.host}</p>
                        {a.description && <p className="text-sm text-text-tertiary mt-2">{a.description}</p>}
                        <div className="flex items-center gap-3 mt-3">
                          {a.url && (
                            <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-500 hover:underline flex items-center gap-1">
                              Listen/watch
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                            </a>
                          )}
                          {a.duration && <span className="text-xs text-text-tertiary">{a.duration}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
