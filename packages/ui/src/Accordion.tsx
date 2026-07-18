'use client';

import React, { useState, useId } from 'react';
import { cn } from './cn';

/**
 * Accordion — Collapsible content sections with single or multiple expansion.
 *
 * @see docs/FRONTEND-IMPLEMENTATION-PLAN.md §4 (Component Library)
 *
 * Follows WAI-ARIA Accordion pattern: arrow keys navigate between headers,
 * Enter/Space toggle, Home/End jump to first/last.
 */

export interface AccordionItem {
  /** Unique value identifying the item */
  value: string;
  /** Visible header text */
  title: React.ReactNode;
  /** Collapsible content */
  content: React.ReactNode;
  /** Disable this item */
  disabled?: boolean;
}

export interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Accordion items */
  items: AccordionItem[];
  /** Allow multiple items open at once */
  type?: 'single' | 'multiple';
  /** Controlled: open values */
  value?: string[];
  /** Uncontrolled: default open values */
  defaultValue?: string[];
  /** Change callback */
  onChange?: (values: string[]) => void;
  /** Additional classes for each trigger */
  triggerClassName?: string;
}

export function Accordion({
  items,
  type = 'single',
  value,
  defaultValue = [],
  onChange,
  className,
  triggerClassName,
  ...props
}: AccordionProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string[]>(defaultValue);
  const openValues = isControlled ? value! : internal;
  const baseId = useId();

  const toggle = (val: string, disabled?: boolean) => {
    if (disabled) return;
    const isOpen = openValues.includes(val);
    let next: string[];
    if (type === 'single') {
      next = isOpen ? [] : [val];
    } else {
      next = isOpen ? openValues.filter((v) => v !== val) : [...openValues, val];
    }
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  const onKeyDown = (e: React.KeyboardEvent, _index: number, item: AccordionItem) => {
    const triggers = items.filter((i) => !i.disabled);
    const currentPos = triggers.findIndex((i) => i.value === item.value);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      document.getElementById(`${baseId}-trigger-${triggers[(currentPos + 1) % triggers.length]?.value}`)?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (currentPos - 1 + triggers.length) % triggers.length;
      document.getElementById(`${baseId}-trigger-${triggers[prev]?.value}`)?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      document.getElementById(`${baseId}-trigger-${triggers[0]?.value}`)?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      document.getElementById(`${baseId}-trigger-${triggers[triggers.length - 1]?.value}`)?.focus();
    }
  };

  return (
    <div
      className={cn('divide-y divide-border-primary rounded-lg border border-border-primary', className)}
      {...props}
    >
      {items.map((item) => {
        const isOpen = openValues.includes(item.value);
        const panelId = `${baseId}-panel-${item.value}`;
        const triggerId = `${baseId}-trigger-${item.value}`;
        return (
          <div key={item.value}>
            <h3 className="m-0">
              <button
                id={triggerId}
                type="button"
                className={cn(
                  'flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-text-primary',
                  'transition-colors hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
                  item.disabled && 'cursor-not-allowed opacity-50',
                  triggerClassName,
                )}
                aria-expanded={isOpen}
                aria-controls={panelId}
                disabled={item.disabled}
                onClick={() => toggle(item.value, item.disabled)}
                onKeyDown={(e) => onKeyDown(e, items.indexOf(item), item)}
              >
                <span>{item.title}</span>
                <svg
                  className={cn(
                    'h-4 w-4 shrink-0 text-text-tertiary transition-transform duration-fast',
                    isOpen && 'rotate-180',
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              hidden={!isOpen}
              className="px-4 pb-4 text-sm text-text-secondary"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
