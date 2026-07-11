'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from './cn';

/**
 * Tabs — Horizontal tabs with keyboard navigation and animated indicator.
 *
 * @see docs/DesignSystem.md §2.8 (Tabs Specification)
 *
 * - Keyboard: Left/Right arrow to navigate, Enter/Space to select
 * - Animated underline indicator
 * - ARIA: tablist/tab/tabpanel roles
 * - Reduced motion: instant indicator transition
 */

/* ────── Types ────── */

export interface TabItem {
  /** Unique key for the tab */
  key: string;
  /** Tab label */
  label: string;
  /** Optional icon before label */
  icon?: React.ReactNode;
  /** Whether the tab is disabled */
  disabled?: boolean;
  /** Tab panel content */
  content: React.ReactNode;
}

export interface TabsProps {
  /** Tab definitions */
  items: TabItem[];
  /** Currently active tab key */
  activeKey?: string;
  /** Default active tab key (uncontrolled) */
  defaultActiveKey?: string;
  /** Callback when active tab changes */
  onChange?: (key: string) => void;
  /** Visual variant */
  variant?: 'default' | 'pills' | 'bordered';
  /** Full width tabs */
  fullWidth?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/* ────── Component ────── */

export function Tabs({
  items,
  activeKey: controlledActiveKey,
  defaultActiveKey,
  onChange,
  variant = 'default',
  fullWidth = false,
  className,
}: TabsProps) {
  const [internalActiveKey, setInternalActiveKey] = useState(
    defaultActiveKey ?? items[0]?.key ?? '',
  );
  const activeKey = controlledActiveKey ?? internalActiveKey;

  const tabsRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const handleTabChange = useCallback(
    (key: string) => {
      if (!controlledActiveKey) {
        setInternalActiveKey(key);
      }
      onChange?.(key);
    },
    [controlledActiveKey, onChange],
  );

  // Update indicator position
  useEffect(() => {
    if (variant !== 'default' || !indicatorRef.current) return;

    const activeTab = tabRefs.current.get(activeKey);
    if (!activeTab || !tabsRef.current) return;

    const tabsRect = tabsRef.current.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();

    indicatorRef.current.style.width = `${tabRect.width}px`;
    indicatorRef.current.style.left = `${tabRect.left - tabsRect.left}px`;
  }, [activeKey, variant]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const enabledItems = items.filter((item) => !item.disabled);
      const currentIndex = enabledItems.findIndex((item) => item.key === activeKey);

      let nextIndex = currentIndex;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % enabledItems.length;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + enabledItems.length) % enabledItems.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = enabledItems.length - 1;
      } else {
        return;
      }

      const nextItem = enabledItems[nextIndex];
      if (nextItem) {
        handleTabChange(nextItem.key);
        tabRefs.current.get(nextItem.key)?.focus();
      }
    },
    [items, activeKey, handleTabChange],
  );

  const activeContent = items.find((item) => item.key === activeKey)?.content;

  const variantStyles = {
    default: 'border-b border-border-primary',
    pills: 'bg-surface-elevated rounded-lg p-1 gap-1',
    bordered: 'border border-border-primary rounded-lg p-1 gap-1',
  };

  const tabVariantStyles = {
    default: (isActive: boolean) =>
      cn(
        'relative px-4 py-2.5 text-sm font-medium transition-colors duration-fast',
        isActive
          ? 'text-accent-500'
          : 'text-text-secondary hover:text-text-primary',
      ),
    pills: (isActive: boolean) =>
      cn(
        'px-4 py-2 text-sm font-medium rounded-md transition-all duration-fast',
        isActive
          ? 'bg-surface-secondary text-text-primary shadow-sm'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50',
      ),
    bordered: (isActive: boolean) =>
      cn(
        'px-4 py-2 text-sm font-medium rounded-md transition-all duration-fast',
        isActive
          ? 'bg-accent-500 text-white shadow-sm'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated',
      ),
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Tab list */}
      <div
        ref={tabsRef}
        role="tablist"
        aria-orientation="horizontal"
        className={cn(
          'relative flex',
          fullWidth && 'w-full',
          variantStyles[variant],
        )}
        onKeyDown={handleKeyDown}
      >
        {items.map((item) => {
          const isActive = item.key === activeKey;

          return (
            <button
              key={item.key}
              ref={(el) => {
                if (el) tabRefs.current.set(item.key, el);
              }}
              role="tab"
              type="button"
              id={`tab-${item.key}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${item.key}`}
              aria-disabled={item.disabled || undefined}
              tabIndex={isActive ? 0 : -1}
              disabled={item.disabled}
              onClick={() => !item.disabled && handleTabChange(item.key)}
              className={cn(
                tabVariantStyles[variant](isActive),
                fullWidth && 'flex-1',
                item.disabled && 'opacity-50 cursor-not-allowed',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2',
              )}
            >
              <span className="inline-flex items-center gap-2">
                {item.icon && <span className="shrink-0" aria-hidden="true">{item.icon}</span>}
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Animated underline indicator (default variant only) */}
        {variant === 'default' && (
          <div
            ref={indicatorRef}
            className="absolute bottom-0 h-0.5 bg-accent-500 transition-all motion-safe:duration-300 motion-reduce:duration-0"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Tab panels */}
      {items.map((item) => (
        <div
          key={item.key}
          id={`tabpanel-${item.key}`}
          role="tabpanel"
          aria-labelledby={`tab-${item.key}`}
          tabIndex={0}
          hidden={item.key !== activeKey}
          className={cn(
            'mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-lg',
            item.key === activeKey && 'motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200',
          )}
        >
          {item.key === activeKey && activeContent}
        </div>
      ))}
    </div>
  );
}
