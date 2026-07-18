'use client';

import React, { useId, useState } from 'react';
import { cn } from './cn';

/**
 * SearchBar — Search input with default and expanded states.
 *
 * @see docs/FRONTEND-IMPLEMENTATION-PLAN.md §4 (Component Library)
 *
 * States: empty / typing / results. Supports an optional results dropdown.
 */

export interface SearchResult {
  /** Result value */
  value: string;
  /** Result label */
  label: React.ReactNode;
}

export interface SearchBarProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'results'> {
  /** Controlled input value */
  value?: string;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Input change callback */
  onChange?: (value: string) => void;
  /** Submit callback (Enter) */
  onSearch?: (value: string) => void;
  /** Suggestions / results to show in dropdown */
  results?: SearchResult[];
  /** Result selection callback */
  onResultSelect?: (result: SearchResult) => void;
  /** Size variant */
  size?: 'md' | 'lg';
  /** Expanded layout (full-width with stronger shadow) */
  expanded?: boolean;
  /** Loading state for results */
  isLoading?: boolean;
  /** Accessible label */
  'aria-label'?: string;
  /** Additional classes for the outer wrapper */
  containerClassName?: string;
}

export function SearchBar({
  value,
  defaultValue = '',
  onChange,
  onSearch,
  results,
  onResultSelect,
  size = 'md',
  expanded = false,
  isLoading = false,
  className,
  containerClassName,
  disabled,
  id: externalId,
  'aria-label': ariaLabel = 'Search',
  ...props
}: SearchBarProps) {
  const baseId = useId();
  const id = externalId ?? baseId;
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const query = isControlled ? value! : internal;
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const showResults = focused && results && results.length > 0;

  const update = (v: string) => {
    if (!isControlled) setInternal(v);
    onChange?.(v);
    setActiveIndex(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (showResults) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results!.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        onResultSelect?.(results![activeIndex]!);
        setFocused(false);
      } else if (e.key === 'Escape') {
        setFocused(false);
      }
    } else if (e.key === 'Enter') {
      onSearch?.(query);
    }
  };

  const sizeClasses = {
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  return (
    <div className={cn('relative w-full', containerClassName)}>
      <div
        className={cn(
          'relative flex items-center rounded-lg border bg-surface-secondary transition-all duration-fast',
          expanded ? 'shadow-md' : 'shadow-sm',
          'focus-within:ring-2 focus-within:ring-accent-500 focus-within:border-transparent',
          'border-border-primary',
          disabled && 'opacity-50',
          className,
        )}
      >
        <span className="absolute inset-y-0 left-3 flex items-center text-text-tertiary" aria-hidden="true">
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" />
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </span>
        <input
          id={id}
          type="search"
          disabled={disabled}
          value={query}
          aria-label={ariaLabel}
          aria-expanded={showResults}
          aria-controls={showResults ? `${id}-listbox` : undefined}
          aria-activedescendant={activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined}
          className={cn(
            'w-full bg-transparent pl-10 pr-3 text-text-primary placeholder:text-text-tertiary',
            'focus:outline-none disabled:cursor-not-allowed',
            sizeClasses[size],
          )}
          onChange={(e) => update(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={onKeyDown}
          {...props}
        />
      </div>

      {showResults && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border-primary bg-surface-primary py-1 shadow-lg"
        >
          {results!.map((r, i) => (
            <li
              key={r.value}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              className={cn(
                'cursor-pointer px-3 py-2 text-sm text-text-primary transition-colors',
                i === activeIndex ? 'bg-surface-elevated' : 'hover:bg-surface-elevated',
              )}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                onResultSelect?.(r);
                setFocused(false);
              }}
            >
              {r.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
