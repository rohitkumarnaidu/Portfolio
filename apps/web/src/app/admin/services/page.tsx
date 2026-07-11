'use client';

import { useState, useMemo } from 'react';
import { useAdminServices, useCreateAdminService, useUpdateAdminService, useDeleteAdminService } from '@/lib/hooks/useServices';
import type { Service } from '@portfolio/shared';
import { Button, Input, Card, useToast } from '@portfolio/ui';
import { DataTable } from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';

interface ServiceForm { title: string; description: string; icon: string; features: string; is_highlighted: boolean; }
const emptyForm: ServiceForm = { title: '', description: '', icon: 'code', features: '', is_highlighted: false };

export default function ServicesPage() {
  const { data: services, isLoading } = useAdminServices();
  const createService = useCreateAdminService();
  const updateService = useUpdateAdminService();
  const deleteService = useDeleteAdminService();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const { addToast } = useToast();

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const handleEdit = (s: Service) => {
    setForm({ title: s.title, description: s.description, icon: s.icon, features: s.features.join(', '), is_highlighted: s.is_highlighted });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, features: form.features.split(',').map(t => t.trim()).filter(Boolean) };
      if (editingId) {
        await updateService.mutateAsync({ id: editingId, data: payload });
        addToast({ variant: 'success', title: 'Service updated' });
      } else {
        await createService.mutateAsync(payload);
        addToast({ variant: 'success', title: 'Service created' });
      }
      resetForm();
    } catch { addToast({ variant: 'error', title: 'Failed to save service' }); }
  };

  const handleDelete = async (s: Service) => {
    await deleteService.mutateAsync(s.id);
  };

  const columns: Column<Service>[] = useMemo(() => [
    {
      key: 'title',
      label: 'Title',
      grow: true,
      sortable: true,
      render: (svc) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">{svc.icon} {svc.title}</span>
          {svc.is_highlighted && <span className="text-xs px-1.5 py-0.5 rounded bg-accent-500/10 text-accent-500">Highlighted</span>}
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      grow: true,
      sortable: true,
      render: (svc) => <p className="text-xs text-text-tertiary truncate">{svc.description}</p>,
    },
    {
      key: 'features',
      label: 'Features',
      width: '80px',
      render: (svc) => <span className="text-xs text-text-tertiary">{svc.features.length}</span>,
    },
    {
      key: 'created_at',
      label: 'Date',
      width: '90px',
      sortable: true,
      render: (svc) => <span className="text-xs text-text-tertiary">{new Date(svc.created_at).toLocaleDateString()}</span>,
    },
  ], []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Services</h1>
          <p className="text-body-sm text-text-secondary mt-1">Manage service offerings</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>{showForm ? 'Cancel' : 'Add Service'}</Button>
      </div>

      {showForm && (
        <Card variant="elevated" className="mb-8">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h3 className="font-display text-h4 text-text-primary">{editingId ? 'Edit Service' : 'New Service'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              <Input label="Icon (emoji or name)" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Description *</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} required className="w-full rounded-xl border border-border-primary bg-surface-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/50 resize-none" />
            </div>
            <Input label="Features (comma-separated)" value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} placeholder="Responsive design, API integration, SEO" />
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input type="checkbox" checked={form.is_highlighted} onChange={e => setForm(f => ({ ...f, is_highlighted: e.target.checked }))} className="rounded border-border-primary" />
              Highlighted
            </label>
            <div className="flex gap-3 pt-2">
              <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
              <Button variant="ghost" type="button" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <DataTable
        data={services ?? []}
        columns={columns}
        keyExtractor={(s) => s.id}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search services..."
        pageSize={10}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
