'use client';

import React from 'react';
import { cn } from './cn';

/**
 * Pagination — Numbered page navigation with prev/next and ellipsis.
 *
 * @see docs/FRONTEND-IMPLEMENTATION-PLAN.md §4 (Component Library)
 */

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Total number of pages */
  totalPages: number;
  /** Current active page (1-based) */
  currentPage: number;
  /** Page change callback */
  onPageChange?: (page: number) => void;
  /** How many sibling pages to show around current */
  siblingCount?: number;
  /** Disable the whole control */
  disabled?: boolean;
}

type PageToken = number | 'ellipsis';

function getRange(current: number, total: number, sibling: number): PageToken[] {
  const totalNumbers = sibling * 2 + 5;
  if (total <= totalNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const left = Math.max(current - sibling, 1);
  const right = Math.min(current + sibling, total);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < total - 1;

  const tokens: PageToken[] = [1];
  if (showLeftEllipsis) tokens.push('ellipsis');
  for (let i = left; i <= right; i++) {
    if (i !== 1 && i !== total) tokens.push(i);
  }
  if (showRightEllipsis) tokens.push('ellipsis');
  tokens.push(total);
  return tokens;
}

export function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  siblingCount = 1,
  disabled = false,
  className,
  ...props
}: PaginationProps) {
  const pages = getRange(currentPage, totalPages, siblingCount);
  const go = (p: number) => {
    if (disabled || p < 1 || p > totalPages || p === currentPage) return;
    onPageChange?.(p);
  };

  const baseBtn =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ' +
    'disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <nav aria-label="Pagination" className={cn('flex items-center gap-1', className)} {...props}>
      <button
        type="button"
        className={cn(baseBtn, 'text-text-secondary hover:bg-surface-elevated')}
        onClick={() => go(currentPage - 1)}
        disabled={disabled || currentPage <= 1}
        aria-label="Previous page"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e-${i}`} className="inline-flex h-9 min-w-9 items-center justify-center px-1 text-text-tertiary" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === currentPage ? 'page' : undefined}
            className={cn(
              baseBtn,
              p === currentPage
                ? 'bg-accent-500 text-white shadow-sm'
                : 'text-text-secondary hover:bg-surface-elevated',
            )}
            onClick={() => go(p)}
            disabled={disabled}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        className={cn(baseBtn, 'text-text-secondary hover:bg-surface-elevated')}
        onClick={() => go(currentPage + 1)}
        disabled={disabled || currentPage >= totalPages}
        aria-label="Next page"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}
