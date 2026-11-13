'use client';

import { useState, useMemo } from 'react';
import {
  useAdminReadingListItems,
  useCreateReadingListItem,
  useUpdateReadingListItem,
  useDeleteReadingListItem,
  useBulkDeleteReadingListItems,
} from '@/lib/hooks/useReadingList';
import type { ReadingListItem } from '@/lib/api';
import { Button, Input, Card, useToast } from '@portfolio/ui';
import { DataTable } from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';

interface FormData {
  title: string;
  author: string;
  category: string;
  coverUrl: string;
  url: string;
  description: string;
  completedDate: string;
}
const emptyForm: FormData = {
  title: '',
  author: '',
  category: 'currently_reading',
  coverUrl: '',
  url: '',
  description: '',
  completedDate: '',
};

export default function ReadingListPage() {
  const { data: items, isLoading } = useAdminReadingListItems();
  const createMutation = useCreateReadingListItem();
  const updateMutation = useUpdateReadingListItem();
  const deleteMutation = useDeleteReadingListItem();
  const bulkDeleteMutation = useBulkDeleteReadingListItems();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const { addToast } = useToast();

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item: ReadingListItem) => {
    setForm({
      title: item.title,
      author: item.author,
      category: item.category,
      coverUrl: item.coverUrl || '',
      url: item.url || '',
      description: item.description || '',
      completedDate: item.completedDate || '',
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<ReadingListItem> = {
        ...form,
        category: form.category as ReadingListItem['category'],
        coverUrl: form.coverUrl || undefined,
        url: form.url || undefined,
        description: form.description || undefined,
        completedDate: form.completedDate || undefined,
      };
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        addToast({ variant: 'success', title: 'Reading item updated' });
      } else {
        await createMutation.mutateAsync(payload as Record<string, unknown>);
        addToast({ variant: 'success', title: 'Reading item created' });
      }
      resetForm();
    } catch {
      addToast({ variant: 'error', title: 'Failed to save' });
    }
  };

  const handleDelete = async (item: ReadingListItem) => {
    await deleteMutation.mutateAsync(item.id);
  };

  const columns: Column<ReadingListItem>[] = useMemo(
    () => [
      {
        key: 'title',
        label: 'Title',
        sortable: true,
        grow: true,
        render: (r) => (
          <div className="flex items-center gap-2">
            {r.coverUrl && <img src={r.coverUrl} alt="" className="w-6 h-8 rounded object-cover" />}
            <span className="text-sm font-medium text-text-primary">{r.title}</span>
          </div>
        ),
      },
      {
        key: 'author',
        label: 'Author',
        sortable: true,
        width: '120px',
        render: (r) => <span className="text-xs text-text-secondary">{r.author}</span>,
      },
      {
        key: 'category',
        label: 'Category',
        width: '120px',
        sortable: true,
        render: (r) => (
          <span className="text-xs text-text-tertiary capitalize">
            {r.category.replace(/_/g, ' ')}
          </span>
        ),
      },
      {
        key: 'completedDate',
        label: 'Completed',
        width: '90px',
        sortable: true,
        render: (r) =>
          r.completedDate ? (
            <span className="text-xs text-text-tertiary">{r.completedDate}</span>
          ) : null,
      },
    ],
    [],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Reading List</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Manage books, articles, and recommendations
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancel' : 'Add Item'}
        </Button>
      </div>
      {showForm && (
        <Card variant="elevated" className="mb-8">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h3 className="font-display text-h4 text-text-primary">
              {editingId ? 'Edit Item' : 'New Item'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Title *"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
              <Input
                label="Author"
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              />
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-xl border border-border-primary bg-surface-secondary px-4 py-2.5 text-sm text-text-primary"
              >
                <option value="currently_reading">Currently Reading</option>
                <option value="books">Books</option>
                <option value="articles">Articles</option>
                <option value="recommendations">Recommendations</option>
              </select>
              <Input
                label="Cover URL"
                value={form.coverUrl}
                onChange={(e) => setForm((f) => ({ ...f, coverUrl: e.target.value }))}
                placeholder="https://..."
              />
              <Input
                label="URL"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://..."
              />
              <Input
                label="Completed Date"
                type="date"
                value={form.completedDate}
                onChange={(e) => setForm((f) => ({ ...f, completedDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-border-primary bg-surface-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/50 resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
              <Button variant="ghost" type="button" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
      <DataTable
        data={items ?? []}
        columns={columns}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search reading list..."
        pageSize={10}
        onEdit={handleEdit}
        onDelete={handleDelete}
        bulkActions={[
          {
            label: 'Bulk Delete',
            action: async (ids) => {
              await bulkDeleteMutation.mutateAsync(ids);
            },
            variant: 'danger',
          },
        ]}
      />
    </div>
  );
}
