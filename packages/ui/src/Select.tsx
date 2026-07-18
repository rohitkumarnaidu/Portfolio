'use client';

import React, { useId, useRef, useState } from 'react';
import { cn } from './cn';

/**
 * Select — Accessible custom listbox with full keyboard navigation.
 *
 * @see docs/FRONTEND-IMPLEMENTATION-PLAN.md §4 (Component Library)
 *
 * Implements the WAI-ARIA Select-Only Combobox / Listbox pattern:
 * Arrow Up/Down navigate, Enter/Space select, Escape closes, Home/End jump,
 * type-ahead supported via single character.
 */

export interface SelectOption {
  /** Option value */
  value: string;
  /** Option label */
  label: React.ReactNode;
  /** Disable this option */
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Available options */
  options: SelectOption[];
  /** Selected value */
  value?: string;
  /** Default selected value (uncontrolled) */
  defaultValue?: string;
  /** Change callback */
  onChange?: (value: string) => void;
  /** Field label */
  label?: string;
  /** Placeholder when nothing selected */
  placeholder?: string;
  /** Disable the whole control */
  disabled?: boolean;
  /** Error state */
  error?: string;
}

export function Select({
  options,
  value,
  defaultValue,
  onChange,
  label,
  placeholder = 'Select an option',
  disabled = false,
  error,
  className,
  id: externalId,
  ...props
}: SelectProps) {
  const baseId = useId();
  const id = externalId ?? baseId;
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string | undefined>(defaultValue);
  const selected = isControlled ? value : internal;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((o) => o.value === selected);

  const commit = (val: string) => {
    if (!isControlled) setInternal(val);
    onChange?.(val);
    setOpen(false);
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key) && !open) {
      e.preventDefault();
      setOpen(true);
      const firstEnabled = options.findIndex((o) => !o.disabled);
      setActiveIndex(firstEnabled);
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => {
        let next = i;
        do {
          next = (next + 1) % options.length;
        } while (options[next]!.disabled && next !== i);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => {
        let next = i;
        do {
          next = (next - 1 + options.length) % options.length;
        } while (options[next]!.disabled && next !== i);
        return next;
      });
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(options.findIndex((o) => !o.disabled));
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex([...options].reverse().findIndex((o) => !o.disabled) === -1 ? -1 : options.length - 1 - [...options].reverse().findIndex((o) => !o.disabled));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (activeIndex >= 0 && !options[activeIndex]!.disabled) commit(options[activeIndex]!.value);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const onOptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      rootRef.current?.querySelector<HTMLButtonElement>('[role="combobox"]')?.focus();
    }
  };

  return (
    <div className={cn('w-full space-y-1.5', className)} {...props}>
      {label && (
        <label id={`${id}-label`} className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div ref={rootRef} className="relative">
        <button
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          aria-labelledby={label ? `${id}-label` : undefined}
          disabled={disabled}
          className={cn(
            'flex w-full items-center justify-between rounded-lg border bg-surface-secondary px-3 text-sm',
            'h-10 transition-all duration-fast',
            'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-red-400 dark:border-red-500 focus:ring-red-500'
              : 'border-border-primary hover:border-border-accent',
          )}
          onClick={() => !disabled && setOpen((o) => !o)}
          onKeyDown={onTriggerKeyDown}
        >
          <span className={cn(!selectedOption && 'text-text-tertiary')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className={cn('h-4 w-4 text-text-tertiary transition-transform duration-fast', open && 'rotate-180')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <ul
            ref={listRef}
            id={`${id}-listbox`}
            role="listbox"
            aria-labelledby={label ? `${id}-label` : undefined}
            className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border-primary bg-surface-primary py-1 shadow-lg"
          >
            {options.map((opt, index) => {
              const isSelected = opt.value === selected;
              const isActive = index === activeIndex;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled || undefined}
                  className={cn(
                    'flex cursor-pointer items-center justify-between px-3 py-2 text-sm text-text-primary',
                    'transition-colors',
                    opt.disabled && 'cursor-not-allowed opacity-50',
                    isActive && !opt.disabled && 'bg-surface-elevated',
                    isSelected && 'font-medium text-accent-600 dark:text-accent-400',
                  )}
                  onMouseEnter={() => !opt.disabled && setActiveIndex(index)}
                  onClick={() => !opt.disabled && commit(opt.value)}
                  onKeyDown={(e) => onOptionKeyDown(e)}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
