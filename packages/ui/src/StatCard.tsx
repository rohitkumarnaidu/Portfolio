'use client';

import React from 'react';
import { cn } from './cn';

/**
 * StatCard — Metric display with trend indicator and loading/error states.
 *
 * @see docs/FRONTEND-IMPLEMENTATION-PLAN.md §4 (Component Library)
 */

type Trend = 'up' | 'down' | 'neutral';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Metric label */
  label: string;
  /** Primary value */
  value?: React.ReactNode;
  /** Previous/comparison value for delta */
  previousValue?: React.ReactNode;
  /** Trend direction */
  trend?: Trend;
  /** Delta string (e.g. "+12%") */
  delta?: string;
  /** Loading state — shows skeleton */
  isLoading?: boolean;
  /** Error state */
  error?: string;
  /** Optional leading icon */
  icon?: React.ReactNode;
  /** Optional footer/extra content */
  footer?: React.ReactNode;
}

const trendStyles: Record<Trend, string> = {
  up: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
  down: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
  neutral: 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800',
};

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === 'neutral') return null;
  return (
    <svg
      className={cn('h-3.5 w-3.5', trend === 'down' && 'rotate-180')}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  previousValue,
  trend = 'neutral',
  delta,
  isLoading = false,
  error,
  icon,
  footer,
  className,
  ...props
}: StatCardProps) {
  const trendLabel =
    trend === 'up' ? 'trending up' : trend === 'down' ? 'trending down' : 'no change';

  return (
    <div
      className={cn(
        'rounded-xl border border-border-primary bg-surface-secondary p-5 shadow-sm',
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        {icon && (
          <span className="text-text-tertiary" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>

      {error ? (
        <p className="mt-2 text-sm text-red-500 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : isLoading ? (
        <div className="mt-2 space-y-2" aria-hidden="true">
          <div className="h-8 w-24 animate-pulse rounded bg-surface-elevated" />
          <div className="h-3 w-16 animate-pulse rounded bg-surface-elevated" />
        </div>
      ) : (
        <>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-text-primary">{value}</span>
          </div>
          {(delta || previousValue) && (
            <div className="mt-1 flex items-center gap-2">
              {delta && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium',
                    trendStyles[trend],
                  )}
                  aria-label={`${delta}, ${trendLabel}`}
                >
                  <TrendIcon trend={trend} />
                  {delta}
                </span>
              )}
              {previousValue && (
                <span className="text-xs text-text-tertiary">vs {previousValue}</span>
              )}
            </div>
          )}
        </>
      )}

      {footer && <div className="mt-3 border-t border-border-primary pt-3 text-xs text-text-tertiary">{footer}</div>}
    </div>
  );
}
