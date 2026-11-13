'use client';

import { useState, useMemo } from 'react';
import { Button, Modal, useToast } from '@portfolio/ui';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  grow?: boolean;
  render: (item: T, idx: number) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyState?: React.ReactNode;
  onEdit?: (item: T) => void;
  onView?: (item: T) => void;
  onDelete?: (item: T) => void;
  onSearch?: (query: string) => void;
  rowActions?: (item: T) => { label: string; onClick: () => void; variant?: string }[];
  bulkActions?: {
    label: string;
    action: (ids: string[]) => Promise<void> | void;
    variant?: 'danger' | 'secondary' | 'primary';
    confirmTitle?: string;
    confirmMessage?: (count: number) => string;
  }[];
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-secondary border border-border-primary animate-pulse">
      <div className="w-5 h-5 rounded bg-white/10" />
      <div className="flex-1 h-4 rounded bg-white/10" />
      <div className="w-20 h-4 rounded bg-white/10" />
      <div className="w-16 h-4 rounded bg-white/10" />
      <div className="w-16 h-8 rounded-lg bg-white/10" />
    </div>
  );
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  pageSize = 10,
  searchable = false,
  searchPlaceholder = 'Search...',
  emptyState,
  onEdit,
  onView,
  onDelete,
  onSearch,
  rowActions,
  bulkActions = [],
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState<{
    action: () => Promise<void> | void;
    title: string;
    message: string;
  } | null>(null);
  const { addToast } = useToast();

  const filtered = useMemo(() => {
    let result = data;
    if (search && searchable) {
      const q = search.toLowerCase();
      result = data.filter((item) => {
        const str = columns
          .map((c) => String(c.render(item, 0) ?? ''))
          .join(' ')
          .toLowerCase();
        return str.includes(q);
      });
    }
    if (sortField) {
      result = [...result].sort((a, b) => {
        const col = columns.find((c) => c.key === sortField);
        if (!col) return 0;
        const aVal = String(col.render(a, 0) ?? '');
        const bVal = String(col.render(b, 0) ?? '');
        const cmp = aVal.localeCompare(bVal);
        return sortOrder === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [data, search, sortField, sortOrder, columns, searchable]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const allSelected =
    paged.length > 0 && paged.every((item) => selectedIds.has(keyExtractor(item)));

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paged.map((item) => keyExtractor(item))));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (onDelete) await onDelete(deleteTarget);
      setDeleteTarget(null);
      addToast({ variant: 'success', title: 'Item deleted' });
    } catch {
      addToast({ variant: 'error', title: 'Failed to delete item' });
    }
  };

  const handleBulkAction = (ba: (typeof bulkActions)[0]) => {
    const ids = Array.from(selectedIds);
    const title = ba.confirmTitle || `Confirm ${ba.label}`;
    const message = ba.confirmMessage
      ? ba.confirmMessage(ids.length)
      : `Are you sure you want to ${ba.label.toLowerCase()} ${ids.length} items?`;
    setBulkConfirm({ action: () => ba.action(ids), title, message });
  };

  const executeBulkAction = async () => {
    if (!bulkConfirm) return;
    try {
      await bulkConfirm.action();
      addToast({ variant: 'success', title: 'Bulk action completed' });
      setSelectedIds(new Set());
      setBulkConfirm(null);
    } catch {
      addToast({ variant: 'error', title: 'Bulk action failed' });
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        {searchable && (
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
                onSearch?.(e.target.value);
              }}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-border-primary bg-surface-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/50 outline-none focus:border-accent-500 transition-colors"
            />
          </div>
        )}
      </div>

      {selectedIds.size > 0 && bulkActions.length > 0 && (
        <div className="sticky top-4 z-10 mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-500 text-white shadow-lg">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="h-4 w-px bg-white/20" />
          {bulkActions.map((ba, i) => (
            <button
              key={i}
              onClick={() => handleBulkAction(ba)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              {ba.label}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            Clear Selection
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : paged.length === 0 ? (
        <div className="text-center py-16">
          {emptyState || <p className="text-body text-text-secondary">No data found.</p>}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-4 px-4 py-2 mb-1">
            {(onEdit || onDelete || bulkActions.length > 0) && (
              <label className="flex items-center justify-center w-5 h-5 shrink-0">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-border-primary"
                />
              </label>
            )}
            {columns.map((col) => (
              <button
                key={col.key}
                onClick={() => col.sortable !== false && toggleSort(col.key)}
                className={`flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-text-tertiary hover:text-text-primary transition-colors ${col.sortable === false ? 'cursor-default' : 'cursor-pointer'} ${col.grow ? 'flex-1 min-w-0' : ''}`}
                style={{ width: col.width }}
              >
                {col.label}
                {col.sortable !== false && sortField === col.key && (
                  <svg
                    className="w-3 h-3 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    {sortOrder === 'asc' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    )}
                  </svg>
                )}
              </button>
            ))}
            {(onEdit || onDelete) && <div className="w-16 shrink-0" />}
          </div>
          <div className="space-y-2">
            {paged.map((item, idx) => {
              const id = keyExtractor(item);
              return (
                <div
                  key={id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-surface-secondary border border-border-primary hover:border-border-accent transition-colors"
                >
                  {(onEdit || onDelete || bulkActions.length > 0) && (
                    <label className="flex items-center justify-center w-5 h-5 shrink-0">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(id)}
                        onChange={() => toggleSelect(id)}
                        className="rounded border-border-primary"
                      />
                    </label>
                  )}
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      className={`${col.grow ? 'flex-1 min-w-0' : 'shrink-0'}`}
                      style={{ width: col.width }}
                    >
                      {col.render(item, idx)}
                    </div>
                  ))}
                  {(onEdit || onView || onDelete || rowActions) && (
                    <div className="flex items-center gap-1 shrink-0">
                      {onView && (
                        <button
                          onClick={() => onView(item)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                          aria-label="View"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                          aria-label="Edit"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      )}
                      {rowActions?.(item).map((action, ai) => (
                        <button
                          key={ai}
                          onClick={action.onClick}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                          aria-label={action.label}
                        >
                          <span className="text-xs font-medium">{action.label}</span>
                        </button>
                      ))}
                      {onDelete && (
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-semantic-error hover:bg-semantic-error-bg transition-colors"
                          aria-label="Delete"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-primary">
          <p className="text-sm text-text-tertiary">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Item"
        size="sm"
      >
        <p className="text-sm text-text-secondary">Are you sure you want to delete this item?</p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>

      <Modal
        open={!!bulkConfirm}
        onClose={() => setBulkConfirm(null)}
        title={bulkConfirm?.title || ''}
        size="sm"
      >
        <p className="text-sm text-text-secondary">{bulkConfirm?.message}</p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setBulkConfirm(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={executeBulkAction}>
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
}
