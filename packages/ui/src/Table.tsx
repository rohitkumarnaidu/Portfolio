'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from './cn';

/**
 * Table — Data table with sortable columns, selection, and responsive card view.
 *
 * @see docs/DesignSystem.md §2.7 (Table Specification)
 *
 * Features:
 * - Sortable columns with visual indicators
 * - Row selection with checkbox
 * - Responsive: table on desktop, card stack on mobile
 * - Striped/bordered/clean variants
 */

/* ────── Types ────── */

export interface TableColumn<T> {
  /** Unique key for the column */
  key: string;
  /** Column header label */
  label: string;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Custom render function for cell content */
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  /** Column width (CSS value) */
  width?: string;
  /** Alignment */
  align?: 'left' | 'center' | 'right';
  /** Visible on mobile card view */
  mobileVisible?: boolean;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface TableProps<T extends Record<string, unknown>> {
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Row data */
  data: T[];
  /** Unique key field for each row */
  rowKey: keyof T;
  /** Visual variant */
  variant?: 'default' | 'striped' | 'bordered';
  /** Enable row selection */
  selectable?: boolean;
  /** Selected row keys */
  selectedKeys?: Set<string>;
  /** Callback when selection changes */
  onSelectionChange?: (keys: Set<string>) => void;
  /** Current sort state */
  sort?: SortState;
  /** Callback when sort changes */
  onSortChange?: (sort: SortState) => void;
  /** Show empty state */
  emptyMessage?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether table is in loading state */
  isLoading?: boolean;
}

/* ────── Sort Icon ────── */

function SortIcon({ direction }: { direction: SortDirection }) {
  return (
    <span className="inline-flex ml-1" aria-hidden="true">
      {direction === 'asc' ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      ) : direction === 'desc' ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      ) : (
        <svg className="h-4 w-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )}
    </span>
  );
}

/* ────── Component ────── */

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  variant = 'default',
  selectable = false,
  selectedKeys = new Set(),
  onSelectionChange,
  sort,
  onSortChange,
  emptyMessage = 'No data available',
  className,
  isLoading = false,
}: TableProps<T>) {
  const [internalSort, setInternalSort] = useState<SortState>({ key: '', direction: null });
  const currentSort = sort ?? internalSort;

  const handleSort = useCallback(
    (key: string) => {
      const nextDirection: SortDirection =
        currentSort.key === key
          ? currentSort.direction === 'asc'
            ? 'desc'
            : currentSort.direction === 'desc'
            ? null
            : 'asc'
          : 'asc';

      const nextSort = { key, direction: nextDirection };
      if (onSortChange) {
        onSortChange(nextSort);
      } else {
        setInternalSort(nextSort);
      }
    },
    [currentSort, onSortChange],
  );

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;
    const allKeys = data.map((row) => String(row[rowKey]));
    const allSelected = allKeys.every((k) => selectedKeys.has(k));
    onSelectionChange(allSelected ? new Set() : new Set(allKeys));
  }, [data, rowKey, selectedKeys, onSelectionChange]);

  const handleSelectRow = useCallback(
    (key: string) => {
      if (!onSelectionChange) return;
      const next = new Set(selectedKeys);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      onSelectionChange(next);
    },
    [selectedKeys, onSelectionChange],
  );

  const allSelected = useMemo(() => {
    if (data.length === 0) return false;
    return data.every((row) => selectedKeys.has(String(row[rowKey])));
  }, [data, rowKey, selectedKeys]);

  const variantClasses = {
    default: '',
    striped: '[&_tbody_tr:nth-child(even)]:bg-surface-elevated/50',
    bordered: '[&_td]:border [&_td]:border-border-primary [&_th]:border [&_th]:border-border-primary',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border border-border-primary', className)}>
      <table
        className={cn('w-full text-sm', variantClasses[variant])}
        role="table"
      >
        <thead>
          <tr className="border-b border-border-primary bg-surface-elevated">
            {selectable && (
              <th className="w-12 px-4 py-3" scope="col">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="rounded border-border-primary text-accent-500 focus:ring-accent-500"
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 font-semibold text-text-secondary',
                  alignClasses[col.align ?? 'left'],
                  col.sortable && 'cursor-pointer select-none hover:text-text-primary transition-colors',
                )}
                style={col.width ? { width: col.width } : undefined}
                scope="col"
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
                aria-sort={
                  currentSort.key === col.key
                    ? currentSort.direction === 'asc'
                      ? 'ascending'
                      : currentSort.direction === 'desc'
                      ? 'descending'
                      : 'none'
                    : undefined
                }
              >
                <span className="inline-flex items-center">
                  {col.label}
                  {col.sortable && (
                    <SortIcon direction={currentSort.key === col.key ? currentSort.direction : null} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="border-b border-border-primary">
                {selectable && <td className="px-4 py-3"><div className="h-4 w-4 rounded bg-surface-elevated animate-pulse" /></td>}
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 rounded bg-surface-elevated animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-12 text-center text-text-tertiary"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const key = String(row[rowKey]);
              const isSelected = selectedKeys.has(key);

              return (
                <tr
                  key={key}
                  className={cn(
                    'border-b border-border-primary transition-colors hover:bg-surface-elevated/50',
                    isSelected && 'bg-accent-50 dark:bg-accent-950/20',
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(key)}
                        className="rounded border-border-primary text-accent-500 focus:ring-accent-500"
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-text-primary',
                        alignClasses[col.align ?? 'left'],
                      )}
                    >
                      {col.render
                        ? col.render(row[col.key], row, rowIndex)
                        : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
