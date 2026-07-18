'use client';

import React from 'react';
import { cn } from './cn';

/**
 * Timeline — Vertical timeline with default and alternate layouts.
 *
 * @see docs/FRONTEND-IMPLEMENTATION-PLAN.md §4 (Component Library)
 */

export type TimelineStatus = 'completed' | 'active' | 'future';

export interface TimelineItem {
  /** Title of the event */
  title: React.ReactNode;
  /** Optional description */
  description?: React.ReactNode;
  /** Optional timestamp / meta */
  time?: React.ReactNode;
  /** Item status — drives marker color */
  status?: TimelineStatus;
  /** Optional custom icon */
  icon?: React.ReactNode;
}

export interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  /** Timeline items */
  items: TimelineItem[];
  /** Alternate left/right layout */
  alternate?: boolean;
}

const dotStyles: Record<TimelineStatus, string> = {
  completed: 'bg-accent-500 border-accent-500',
  active: 'bg-accent-500 border-accent-500 ring-4 ring-accent-500/20',
  future: 'bg-surface-primary border-border-primary',
};

function Marker({ item }: { item: TimelineItem }) {
  const status = item.status ?? 'future';
  if (item.icon) {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border-primary bg-surface-secondary text-text-secondary">
        {item.icon}
      </span>
    );
  }
  return (
    <span
      className={cn('block h-3.5 w-3.5 rounded-full border-2', dotStyles[status])}
      aria-hidden="true"
    />
  );
}

export function Timeline({ items, alternate = false, className, ...props }: TimelineProps) {
  return (
    <ol
      className={cn('relative flex flex-col', className)}
      {...props}
    >
      {items.map((item, i) => {
        const status = item.status ?? 'future';
        const isLast = i === items.length - 1;
        const statusLabel =
          status === 'completed' ? 'completed' : status === 'active' ? 'current' : 'upcoming';
        return (
          <li
            key={i}
            className={cn(
              'relative flex gap-4',
              alternate ? 'even:flex-row-reverse' : '',
              !isLast && 'pb-6',
            )}
          >
            {/* Connector line */}
            {!isLast && (
              <span
                className="absolute left-4 top-8 h-[calc(100%-1rem)] w-px -translate-x-1/2 bg-border-primary"
                aria-hidden="true"
              />
            )}
            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center">
              <Marker item={item} />
            </div>
            <div className={cn('flex-1', alternate && 'text-right')}>
              <div className="flex items-center gap-2" aria-label={statusLabel}>
                <p className="text-sm font-medium text-text-primary">{item.title}</p>
                {item.time && (
                  <span className="text-xs text-text-tertiary">{item.time}</span>
                )}
              </div>
              {item.description && (
                <p className="mt-0.5 text-sm text-text-secondary">{item.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
