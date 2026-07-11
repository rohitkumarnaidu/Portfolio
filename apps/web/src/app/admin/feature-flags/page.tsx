'use client';

import { useState, useMemo } from 'react';
import { useFeatureFlags, useCreateFeatureFlag, useUpdateFeatureFlag, useDeleteFeatureFlag } from '@/lib/hooks/useFeatureFlags';
import type { FeatureFlag } from '@/lib/api';
import { Button, Input, Card, useToast } from '@portfolio/ui';
import { DataTable } from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';

interface FormData {
  flagKey: string; description: string; isEnabled: boolean; rolloutPercentage: number;
}
const emptyForm: FormData = { flagKey: '', description: '', isEnabled: false, rolloutPercentage: 0 };

export default function FeatureFlagsPage() {
  const { data: flags, isLoading } = useFeatureFlags();
  const createMutation = useCreateFeatureFlag();
  const updateMutation = useUpdateFeatureFlag();
  const deleteMutation = useDeleteFeatureFlag();
  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const { addToast } = useToast();

  const resetForm = () => { setForm(emptyForm); setEditingKey(null); setShowForm(false); };

  const handleEdit = (f: FeatureFlag) => {
    setForm({ flagKey: f.flagKey, description: f.description || '', isEnabled: f.isEnabled, rolloutPercentage: f.rolloutPercentage });
    setEditingKey(f.flagKey);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingKey) {
        await updateMutation.mutateAsync({ key: editingKey, data: { description: form.description || undefined, isEnabled: form.isEnabled, rolloutPercentage: form.rolloutPercentage } });
        addToast({ variant: 'success', title: 'Feature flag updated' });
      } else {
        await createMutation.mutateAsync({ flagKey: form.flagKey, description: form.description || undefined, isEnabled: form.isEnabled, rolloutPercentage: form.rolloutPercentage });
        addToast({ variant: 'success', title: 'Feature flag created' });
      }
      resetForm();
    } catch { addToast({ variant: 'error', title: 'Failed to save' }); }
  };

  const handleDelete = async (f: FeatureFlag) => { await deleteMutation.mutateAsync(f.flagKey); };

  const handleToggle = async (f: FeatureFlag) => {
    try {
      await updateMutation.mutateAsync({ key: f.flagKey, data: { isEnabled: !f.isEnabled } });
      addToast({ variant: 'success', title: `${f.flagKey} ${f.isEnabled ? 'disabled' : 'enabled'}` });
    } catch { addToast({ variant: 'error', title: 'Failed to toggle' }); }
  };

  const columns: Column<FeatureFlag>[] = useMemo(() => [
    { key: 'flagKey', label: 'Flag Key', sortable: true, grow: true, render: (f) => (
      <div>
        <span className="text-sm font-medium text-text-primary font-mono">{f.flagKey}</span>
        {f.description && <span className="text-xs text-text-tertiary block">{f.description}</span>}
      </div>
    )},
    { key: 'isEnabled', label: 'Status', width: '100px', sortable: true, render: (f) => (
      <button onClick={() => handleToggle(f)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${f.isEnabled ? 'bg-accent-500' : 'bg-surface-tertiary'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${f.isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    )},
    { key: 'rolloutPercentage', label: 'Rollout %', width: '80px', sortable: true, render: (f) => <span className="text-xs text-text-secondary">{f.rolloutPercentage}%</span> },
  ], []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Feature Flags</h1>
          <p className="text-body-sm text-text-secondary mt-1">Toggle features on/off without deployments</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>{showForm ? 'Cancel' : 'Create Flag'}</Button>
      </div>
      {showForm && (
        <Card variant="elevated" className="mb-8">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h3 className="font-display text-h4 text-text-primary">{editingKey ? 'Edit Flag' : 'New Feature Flag'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Flag Key *" value={form.flagKey} onChange={e => setForm(f => ({ ...f, flagKey: e.target.value }))} required placeholder="new-dashboard" disabled={!!editingKey} />
              <Input label="Rollout Percentage" type="number" min="0" max="100" value={String(form.rolloutPercentage)} onChange={e => setForm(f => ({ ...f, rolloutPercentage: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full rounded-xl border border-border-primary bg-surface-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/50 resize-none" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isEnabled} onChange={e => setForm(f => ({ ...f, isEnabled: e.target.checked }))} className="rounded border-border-primary text-accent-500 focus:ring-accent-500" />
              <span className="text-sm text-text-primary">Enable on creation</span>
            </label>
            <div className="flex gap-3 pt-2">
              <Button type="submit">{editingKey ? 'Update' : 'Create'}</Button>
              <Button variant="ghost" type="button" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}
      <DataTable
        data={flags ?? []}
        columns={columns}
        keyExtractor={(f) => f.flagKey}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search flags..."
        pageSize={10}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
