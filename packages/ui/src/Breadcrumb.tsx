'use client';

import React from 'react';
import { cn } from './cn';

/**
 * Breadcrumb — Navigation trail that collapses when more than 4 items.
 *
 * @see docs/FRONTEND-IMPLEMENTATION-PLAN.md §4 (Component Library)
 */

export interface BreadcrumbItem {
  /** Label text */
  label: React.ReactNode;
  /** Link href (omit for current page) */
  href?: string;
  /** Render as current/active (no link) */
  current?: boolean;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /** Breadcrumb items in order */
  items: BreadcrumbItem[];
  /** Max visible items before collapsing (default 4) */
  maxItems?: number;
  /** Accessible label for the nav */
  'aria-label'?: string;
}

function Separator() {
  return (
    <span className="mx-2 text-text-tertiary" aria-hidden="true">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </span>
  );
}

export function Breadcrumb({
  items,
  maxItems = 4,
  className,
  'aria-label': ariaLabel = 'Breadcrumb',
  ...props
}: BreadcrumbProps) {
  if (items.length === 0) return null;
  const collapse = items.length > maxItems;
  const first = items[0]!;
  const last = items[items.length - 1]!;
  const middle = collapse ? items.slice(1, -1) : items.slice(1);

  const renderItem = (item: BreadcrumbItem, isLast: boolean) => {
    const isCurrent = item.current || isLast;
    return (
      <li className="flex items-center">
        {item.href && !isCurrent ? (
          <a
            href={item.href}
            className="text-sm text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded"
          >
            {item.label}
          </a>
        ) : (
          <span
            className={cn('text-sm', isCurrent ? 'font-medium text-text-primary' : 'text-text-secondary')}
            aria-current={isCurrent ? 'page' : undefined}
          >
            {item.label}
          </span>
        )}
      </li>
    );
  };

  return (
    <nav aria-label={ariaLabel} className={cn('flex items-center', className)} {...props}>
      <ol className="flex items-center">
        {renderItem(first, false)}
        {collapse && (
          <>
            <Separator />
            <li className="flex items-center" aria-hidden="true">
              <span className="text-sm text-text-tertiary">…</span>
            </li>
          </>
        )}
        {middle.map((item, i) => (
          <React.Fragment key={i}>
            <Separator />
            {renderItem(item, false)}
          </React.Fragment>
        ))}
        {!collapse && middle.length > 0 && <Separator />}
        {collapse && (
          <>
            <Separator />
            {renderItem(last, true)}
          </>
        )}
        {!collapse && last !== first && renderItem(last, true)}
      </ol>
    </nav>
  );
}
