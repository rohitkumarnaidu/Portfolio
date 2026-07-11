'use client';

import { useState, useMemo } from 'react';
import { useAdminGuestAppearances, useCreateGuestAppearance, useUpdateGuestAppearance, useDeleteGuestAppearance, useBulkDeleteGuestAppearances } from '@/lib/hooks/useGuestAppearances';
import type { GuestAppearance } from '@/lib/api';
import { Button, Input, Card, useToast } from '@portfolio/ui';
import { DataTable } from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';

interface GuestAppearanceForm {
  type: string; title: string; host: string; url: string;
  coverImageUrl: string; description: string; appearanceDate: string; displayOrder: number;
}
const emptyForm: GuestAppearanceForm = {
  type: 'podcast', title: '', host: '', url: '',
  coverImageUrl: '', description: '', appearanceDate: '', displayOrder: 0,
};

export default function GuestAppearancesPage() {
  const { data: appearances, isLoading } = useAdminGuestAppearances();
  const createMutation = useCreateGuestAppearance();
  const updateMutation = useUpdateGuestAppearance();
  const deleteMutation = useDeleteGuestAppearance();
  const bulkDeleteMutation = useBulkDeleteGuestAppearances();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GuestAppearanceForm>(emptyForm);
  const { addToast } = useToast();

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const handleEdit = (a: GuestAppearance) => {
    setForm({
      type: a.type, title: a.title, host: a.host,
      url: a.url || '', coverImageUrl: a.coverImageUrl || '',
      description: a.description || '', appearanceDate: a.appearanceDate || '',
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
        url: form.url || undefined,
        coverImageUrl: form.coverImageUrl || undefined,
        description: form.description || undefined,
        appearanceDate: form.appearanceDate || undefined,
      };
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        addToast({ variant: 'success', title: 'Guest appearance updated' });
      } else {
        await createMutation.mutateAsync(payload);
        addToast({ variant: 'success', title: 'Guest appearance created' });
      }
      resetForm();
    } catch { addToast({ variant: 'error', title: 'Failed to save' }); }
  };

  const handleDelete = async (a: GuestAppearance) => { await deleteMutation.mutateAsync(a.id); };

  const columns: Column<GuestAppearance>[] = useMemo(() => [
    { key: 'title', label: 'Title', sortable: true, grow: true, render: (a) => <span className="text-sm font-medium text-text-primary">{a.title}</span> },
    { key: 'type', label: 'Type', width: '80px', sortable: true, render: (a) => <span className="text-xs text-text-secondary capitalize">{a.type}</span> },
    { key: 'host', label: 'Host', sortable: true, width: '120px', render: (a) => <span className="text-xs text-text-secondary">{a.host}</span> },
    { key: 'appearanceDate', label: 'Date', width: '90px', sortable: true, render: (a) => a.appearanceDate ? <span className="text-xs text-text-tertiary">{a.appearanceDate}</span> : null },
    { key: 'displayOrder', label: 'Order', width: '60px', sortable: true, render: (a) => <span className="text-xs text-text-tertiary">{a.displayOrder}</span> },
  ], []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Guest Appearances</h1>
          <p className="text-body-sm text-text-secondary mt-1">Manage podcasts, talks, interviews, and webinars</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>{showForm ? 'Cancel' : 'Add Appearance'}</Button>
      </div>
      {showForm && (
        <Card variant="elevated" className="mb-8">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h3 className="font-display text-h4 text-text-primary">{editingId ? 'Edit Appearance' : 'New Appearance'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full rounded-xl border border-border-primary bg-surface-secondary px-4 py-2.5 text-sm text-text-primary">
                <option value="podcast">Podcast</option><option value="talk">Talk</option><option value="interview">Interview</option><option value="webinar">Webinar</option>
              </select>
              <Input label="Host *" value={form.host} onChange={e => setForm(f => ({ ...f, host: e.target.value }))} required />
              <Input label="URL" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." />
              <Input label="Cover Image URL" value={form.coverImageUrl} onChange={e => setForm(f => ({ ...f, coverImageUrl: e.target.value }))} placeholder="https://..." />
              <Input label="Appearance Date" type="date" value={form.appearanceDate} onChange={e => setForm(f => ({ ...f, appearanceDate: e.target.value }))} />
              <Input label="Display Order" type="number" value={String(form.displayOrder)} onChange={e => setForm(f => ({ ...f, displayOrder: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full rounded-xl border border-border-primary bg-surface-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/50 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
              <Button variant="ghost" type="button" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}
      <DataTable
        data={appearances ?? []}
        columns={columns}
        keyExtractor={(a) => a.id}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search appearances..."
        pageSize={10}
        onEdit={handleEdit}
        onDelete={handleDelete}
        bulkActions={[{
          label: 'Bulk Delete',
          action: async (ids) => { await bulkDeleteMutation.mutateAsync(ids); },
          variant: 'danger',
        }]}
      />
    </div>
  );
}
