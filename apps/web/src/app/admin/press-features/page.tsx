'use client';

import { useState, useMemo } from 'react';
import {
  useAdminPressFeatures,
  useCreatePressFeature,
  useUpdatePressFeature,
  useDeletePressFeature,
  useBulkDeletePressFeatures,
} from '@/lib/hooks/usePressFeatures';
import type { PressFeature } from '@/lib/api';
import { Button, Input, Card, useToast } from '@portfolio/ui';
import { DataTable } from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';

interface PressFeatureForm {
  publication: string;
  title: string;
  url: string;
  logoUrl: string;
  description: string;
  featuredDate: string;
  displayOrder: number;
}
const emptyForm: PressFeatureForm = {
  publication: '',
  title: '',
  url: '',
  logoUrl: '',
  description: '',
  featuredDate: '',
  displayOrder: 0,
};

export default function PressFeaturesPage() {
  const { data: pressFeatures, isLoading } = useAdminPressFeatures();
  const createPressFeature = useCreatePressFeature();
  const updatePressFeature = useUpdatePressFeature();
  const deletePressFeature = useDeletePressFeature();
  const bulkDeletePressFeatures = useBulkDeletePressFeatures();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PressFeatureForm>(emptyForm);
  const { addToast } = useToast();

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (p: PressFeature) => {
    setForm({
      publication: p.publication,
      title: p.title,
      url: p.url,
      logoUrl: p.logoUrl || '',
      description: p.description || '',
      featuredDate: p.featuredDate || '',
      displayOrder: p.displayOrder,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        logoUrl: form.logoUrl || undefined,
        description: form.description || undefined,
        featuredDate: form.featuredDate || undefined,
      };
      if (editingId) {
        await updatePressFeature.mutateAsync({ id: editingId, data: payload });
        addToast({ variant: 'success', title: 'Press feature updated' });
      } else {
        await createPressFeature.mutateAsync(payload);
        addToast({ variant: 'success', title: 'Press feature created' });
      }
      resetForm();
    } catch {
      addToast({ variant: 'error', title: 'Failed to save press feature' });
    }
  };

  const handleDelete = async (p: PressFeature) => {
    await deletePressFeature.mutateAsync(p.id);
  };

  const columns: Column<PressFeature>[] = useMemo(
    () => [
      {
        key: 'publication',
        label: 'Publication',
        sortable: true,
        grow: true,
        render: (p) => (
          <div className="flex items-center gap-2">
            {p.logoUrl && <img src={p.logoUrl} alt="" className="w-5 h-5 rounded object-contain" />}
            <span className="text-sm font-medium text-text-primary">{p.publication}</span>
          </div>
        ),
      },
      {
        key: 'title',
        label: 'Title',
        sortable: true,
        grow: true,
        render: (p) => (
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent-500 hover:underline truncate block"
          >
            {p.title}
          </a>
        ),
      },
      {
        key: 'featuredDate',
        label: 'Date',
        width: '90px',
        sortable: true,
        render: (p) =>
          p.featuredDate ? (
            <span className="text-xs text-text-tertiary">{p.featuredDate}</span>
          ) : null,
      },
      {
        key: 'displayOrder',
        label: 'Order',
        width: '60px',
        sortable: true,
        render: (p) => <span className="text-xs text-text-tertiary">{p.displayOrder}</span>,
      },
    ],
    [],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Press Features</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Manage press mentions and media coverage
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancel' : 'Add Press Feature'}
        </Button>
      </div>

      {showForm && (
        <Card variant="elevated" className="mb-8">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h3 className="font-display text-h4 text-text-primary">
              {editingId ? 'Edit Press Feature' : 'New Press Feature'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Publication *"
                value={form.publication}
                onChange={(e) => setForm((f) => ({ ...f, publication: e.target.value }))}
                required
              />
              <Input
                label="Title *"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
              <Input
                label="URL *"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                required
                placeholder="https://..."
              />
              <Input
                label="Logo URL"
                value={form.logoUrl}
                onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                placeholder="https://..."
              />
              <Input
                label="Featured Date"
                type="date"
                value={form.featuredDate}
                onChange={(e) => setForm((f) => ({ ...f, featuredDate: e.target.value }))}
              />
              <Input
                label="Display Order"
                type="number"
                value={String(form.displayOrder)}
                onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))}
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
        data={pressFeatures ?? []}
        columns={columns}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search press features..."
        pageSize={10}
        onEdit={handleEdit}
        onDelete={handleDelete}
        bulkActions={[
          {
            label: 'Bulk Delete',
            action: async (ids) => {
              await bulkDeletePressFeatures.mutateAsync(ids);
            },
            variant: 'danger',
            confirmTitle: 'Bulk Delete Press Features',
            confirmMessage: (count) => `Are you sure you want to delete ${count} press features?`,
          },
        ]}
      />
    </div>
  );
}
