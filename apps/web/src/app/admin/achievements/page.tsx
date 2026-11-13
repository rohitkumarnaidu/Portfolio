'use client';

import { useState, useMemo } from 'react';
import {
  useAdminAchievements,
  useCreateAchievement,
  useUpdateAchievement,
  useDeleteAchievement,
  useBulkDeleteAchievements,
} from '@/lib/hooks/useAchievements';
import type { Achievement } from '@/lib/api';
import { Button, Input, Card, useToast } from '@portfolio/ui';
import { DataTable } from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';

interface AchievementForm {
  title: string;
  issuer: string;
  description: string;
  badgeImageUrl: string;
  category: string;
  achievedDate: string;
  credentialUrl: string;
  displayOrder: number;
}
const emptyForm: AchievementForm = {
  title: '',
  issuer: '',
  description: '',
  badgeImageUrl: '',
  category: '',
  achievedDate: '',
  credentialUrl: '',
  displayOrder: 0,
};

export default function AchievementsPage() {
  const { data: achievements, isLoading } = useAdminAchievements();
  const createAchievement = useCreateAchievement();
  const updateAchievement = useUpdateAchievement();
  const deleteAchievement = useDeleteAchievement();
  const bulkDeleteAchievements = useBulkDeleteAchievements();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AchievementForm>(emptyForm);
  const { addToast } = useToast();

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (a: Achievement) => {
    setForm({
      title: a.title,
      issuer: a.issuer,
      description: a.description,
      badgeImageUrl: a.badgeImageUrl || '',
      category: a.category || '',
      achievedDate: a.achievedDate || '',
      credentialUrl: a.credentialUrl || '',
      displayOrder: a.displayOrder,
    });
    setEditingId(a.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        badgeImageUrl: form.badgeImageUrl || undefined,
        credentialUrl: form.credentialUrl || undefined,
        category: form.category || undefined,
        achievedDate: form.achievedDate || undefined,
      };
      if (editingId) {
        await updateAchievement.mutateAsync({ id: editingId, data: payload });
        addToast({ variant: 'success', title: 'Achievement updated' });
      } else {
        await createAchievement.mutateAsync(payload);
        addToast({ variant: 'success', title: 'Achievement created' });
      }
      resetForm();
    } catch {
      addToast({ variant: 'error', title: 'Failed to save achievement' });
    }
  };

  const handleDelete = async (a: Achievement) => {
    await deleteAchievement.mutateAsync(a.id);
  };

  const columns: Column<Achievement>[] = useMemo(
    () => [
      {
        key: 'title',
        label: 'Title',
        sortable: true,
        grow: true,
        render: (a) => (
          <div className="flex items-center gap-2">
            {a.badgeImageUrl && (
              <img src={a.badgeImageUrl} alt="" className="w-5 h-5 rounded object-contain" />
            )}
            <span className="text-sm font-medium text-text-primary">{a.title}</span>
          </div>
        ),
      },
      {
        key: 'issuer',
        label: 'Issuer',
        width: '120px',
        sortable: true,
        render: (a) => <span className="text-xs text-text-secondary">{a.issuer}</span>,
      },
      {
        key: 'category',
        label: 'Category',
        width: '100px',
        sortable: true,
        render: (a) =>
          a.category ? (
            <span className="text-xs text-text-tertiary capitalize">{a.category}</span>
          ) : null,
      },
      {
        key: 'achievedDate',
        label: 'Date',
        width: '90px',
        sortable: true,
        render: (a) =>
          a.achievedDate ? (
            <span className="text-xs text-text-tertiary">{a.achievedDate}</span>
          ) : null,
      },
      {
        key: 'displayOrder',
        label: 'Order',
        width: '60px',
        sortable: true,
        render: (a) => <span className="text-xs text-text-tertiary">{a.displayOrder}</span>,
      },
    ],
    [],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Achievements</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Manage certifications and achievements
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancel' : 'Add Achievement'}
        </Button>
      </div>

      {showForm && (
        <Card variant="elevated" className="mb-8">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h3 className="font-display text-h4 text-text-primary">
              {editingId ? 'Edit Achievement' : 'New Achievement'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Title *"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
              <Input
                label="Issuer *"
                value={form.issuer}
                onChange={(e) => setForm((f) => ({ ...f, issuer: e.target.value }))}
                required
              />
              <Input
                label="Category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="certification, award, recognition"
              />
              <Input
                label="Achieved Date"
                type="date"
                value={form.achievedDate}
                onChange={(e) => setForm((f) => ({ ...f, achievedDate: e.target.value }))}
              />
              <Input
                label="Badge Image URL"
                value={form.badgeImageUrl}
                onChange={(e) => setForm((f) => ({ ...f, badgeImageUrl: e.target.value }))}
                placeholder="https://..."
              />
              <Input
                label="Credential URL"
                value={form.credentialUrl}
                onChange={(e) => setForm((f) => ({ ...f, credentialUrl: e.target.value }))}
                placeholder="https://..."
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
        data={achievements ?? []}
        columns={columns}
        keyExtractor={(a) => a.id}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search achievements..."
        pageSize={10}
        onEdit={handleEdit}
        onDelete={handleDelete}
        bulkActions={[
          {
            label: 'Bulk Delete',
            action: async (ids) => {
              await bulkDeleteAchievements.mutateAsync(ids);
            },
            variant: 'danger',
            confirmTitle: 'Bulk Delete Achievements',
            confirmMessage: (count) => `Are you sure you want to delete ${count} achievements?`,
          },
        ]}
      />
    </div>
  );
}
