'use client';

import { useQuery } from '@tanstack/react-query';
import { getPressFeatures } from '@/lib/api';

export default function PressPage() {
  const { data: pressFeatures, isLoading } = useQuery({
    queryKey: ['publicPressFeatures'],
    queryFn: () => getPressFeatures(),
  });

  return (
    <div className="min-h-dvh bg-surface-primary">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="mb-12">
          <h1 className="font-display text-h1 text-text-primary mb-3">Press</h1>
          <p className="text-body text-text-secondary max-w-2xl">
            Media coverage, interviews, and press mentions.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-surface-secondary border border-border-primary p-6 animate-pulse h-24"
              />
            ))}
          </div>
        ) : !pressFeatures?.length ? (
          <div className="text-center py-16">
            <p className="text-body text-text-secondary">No press features yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pressFeatures.map((p) => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 rounded-2xl bg-surface-secondary border border-border-primary hover:border-border-accent hover:bg-surface-elevated transition-all group hover:no-underline"
              >
                {p.logoUrl ? (
                  <img
                    src={p.logoUrl}
                    alt={p.publication}
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
                        d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
                      />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary group-hover:text-accent-500 transition-colors">
                    {p.publication}
                  </p>
                  <p className="text-sm text-text-secondary mt-0.5">{p.title}</p>
                  {p.description && (
                    <p className="text-xs text-text-tertiary mt-1">{p.description}</p>
                  )}
                </div>
                <svg
                  className="w-5 h-5 text-text-tertiary group-hover:text-accent-500 shrink-0 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
