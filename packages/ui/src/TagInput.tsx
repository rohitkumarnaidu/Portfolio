'use client';

import React, { useState, useRef, useId } from 'react';
import { cn } from './cn';

/**
 * TagInput — Multi-value input with default and creatable modes.
 *
 * @see docs/FRONTEND-IMPLEMENTATION-PLAN.md §4 (Component Library)
 *
 * States: empty / hasTags / maxReached. Keyboard: Enter or comma adds a tag,
 * Backspace on empty input removes the last tag.
 */

export interface TagInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Controlled tags */
  value?: string[];
  /** Default tags (uncontrolled) */
  defaultValue?: string[];
  /** Change callback */
  onChange?: (tags: string[]) => void;
  /** Placeholder for the text field */
  placeholder?: string;
  /** Allow creating new tags by typing */
  creatable?: boolean;
  /** Max number of tags (disables input when reached) */
  maxTags?: number;
  /** Disable the control */
  disabled?: boolean;
  /** Field label */
  label?: string;
  /** Separator keys for committing a tag */
  separator?: string[];
}

export function TagInput({
  value,
  defaultValue = [],
  onChange,
  placeholder = 'Add a tag…',
  creatable = true,
  maxTags,
  disabled = false,
  label,
  separator = [',', 'Enter'],
  className,
  id: externalId,
  ...props
}: TagInputProps) {
  const baseId = useId();
  const id = externalId ?? baseId;
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string[]>(defaultValue);
  const tags = isControlled ? value! : internal;
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const maxReached = maxTags !== undefined && tags.length >= maxTags;

  const commit = (raw: string) => {
    const t = raw.trim();
    if (!t || !creatable) return;
    if (tags.includes(t)) {
      setDraft('');
      return;
    }
    const next = [...tags, t];
    if (!isControlled) setInternal(next);
    onChange?.(next);
    setDraft('');
  };

  const remove = (tag: string) => {
    const next = tags.filter((t) => t !== tag);
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (separator.includes(e.key) && draft.trim()) {
      e.preventDefault();
      commit(draft);
    } else if (e.key === 'Backspace' && !draft && tags.length > 0) {
      remove(tags[tags.length - 1]!);
    }
  };

  return (
    <div className={cn('w-full space-y-1.5', className)} {...props}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex flex-wrap items-center gap-1.5 rounded-lg border border-border-primary bg-surface-secondary px-2 py-1.5',
          'transition-all duration-fast focus-within:ring-2 focus-within:ring-accent-500 focus-within:border-transparent',
          disabled && 'opacity-50',
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-accent-100 px-2 py-0.5 text-xs font-medium text-accent-700 dark:bg-accent-800 dark:text-accent-300"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(tag);
                }}
                className="rounded-full hover:bg-black/10 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                aria-label={`Remove ${tag}`}
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </span>
        ))}
        {!maxReached && !disabled && (
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={draft}
            placeholder={tags.length === 0 ? placeholder : ''}
            disabled={disabled}
            className="min-w-[6rem] flex-1 bg-transparent py-0.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none disabled:cursor-not-allowed"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => draft.trim() && commit(draft)}
            aria-describedby={maxTags !== undefined ? `${id}-meta` : undefined}
          />
        )}
      </div>
      {maxTags !== undefined && (
        <p id={`${id}-meta`} className="text-xs text-text-tertiary">
          {tags.length}/{maxTags} tags
        </p>
      )}
    </div>
  );
}
