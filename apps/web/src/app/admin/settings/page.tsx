'use client';

import { useState, useMemo } from 'react';
import { useSettings, useUpsertSetting, useDeleteSetting } from '@/lib/hooks/useSettings';
import type { SystemSetting } from '@/lib/api';
import { Button, Input, Card, Modal, useToast } from '@portfolio/ui';

interface SettingForm { settingKey: string; settingValue: string; settingGroup: string; settingType: 'string' | 'number' | 'boolean' | 'json'; description: string; }
const emptyForm: SettingForm = { settingKey: '', settingValue: '', settingGroup: 'general', settingType: 'string', description: '' };

const GROUPS = ['general', 'seo', 'social', 'contact', 'appearance', 'analytics'];

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const upsertSetting = useUpsertSetting();
  const deleteSetting = useDeleteSetting();
  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [form, setForm] = useState<SettingForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const { addToast } = useToast();

  const grouped = useMemo(() => {
    const groups: Record<string, SystemSetting[]> = {};
    for (const g of GROUPS) groups[g] = [];
    if (settings) {
      for (const s of settings) {
        const group = s.settingGroup || 'general';
        if (!groups[group]) groups[group] = [];
        groups[group].push(s);
      }
    }
    return groups;
  }, [settings]);

  const resetForm = () => { setForm(emptyForm); setEditingKey(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const key = editingKey || form.settingKey;
      if (!key.trim()) { addToast({ variant: 'error', title: 'Setting key is required' }); return; }
      await upsertSetting.mutateAsync({ key, data: form as unknown as Partial<SystemSetting> });
      addToast({ variant: 'success', title: editingKey ? 'Setting updated' : 'Setting created' });
      resetForm();
    } catch { addToast({ variant: 'error', title: 'Failed to save setting' }); }
  };

  const handleInlineSave = async (key: string, value: string) => {
    try {
      await upsertSetting.mutateAsync({ key, data: { settingValue: value } as Partial<SystemSetting> });
      addToast({ variant: 'success', title: 'Setting updated' });
      setEditingValues(prev => { const next = { ...prev }; delete next[key]; return next; });
    } catch { addToast({ variant: 'error', title: 'Failed to update setting' }); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSetting.mutateAsync(deleteTarget);
      addToast({ variant: 'success', title: 'Setting deleted' });
      setDeleteTarget(null);
    } catch { addToast({ variant: 'error', title: 'Failed to delete setting' }); }
  };

  if (isLoading) {
    return <div className="space-y-4 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-32 rounded-xl bg-surface-secondary border border-border-primary" />)}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Settings</h1>
          <p className="text-body-sm text-text-secondary mt-1">Manage system configuration settings</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>{showForm ? 'Cancel' : 'Add Setting'}</Button>
      </div>

      {showForm && (
        <Card variant="elevated" className="mb-8">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h3 className="font-display text-h4 text-text-primary">{editingKey ? 'Edit Setting' : 'New Setting'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Setting Key *" value={form.settingKey} onChange={e => setForm(f => ({ ...f, settingKey: e.target.value }))} required disabled={!!editingKey} />
              <Input label="Setting Value *" value={form.settingValue} onChange={e => setForm(f => ({ ...f, settingValue: e.target.value }))} required />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-primary">Group</label>
                <select value={form.settingGroup} onChange={e => setForm(f => ({ ...f, settingGroup: e.target.value }))} className="w-full rounded-xl border border-border-primary bg-surface-secondary px-4 py-2.5 text-sm text-text-primary">
                  {GROUPS.map(g => <option key={g} value={g} className="capitalize">{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-primary">Type</label>
                <select value={form.settingType} onChange={e => setForm(f => ({ ...f, settingType: e.target.value as SettingForm['settingType'] }))} className="w-full rounded-xl border border-border-primary bg-surface-secondary px-4 py-2.5 text-sm text-text-primary">
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>
            <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <div className="flex gap-3 pt-2">
              <Button type="submit">{editingKey ? 'Update' : 'Create'}</Button>
              <Button variant="ghost" type="button" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-8">
        {GROUPS.map(group => {
          const items = grouped[group] || [];
          if (items.length === 0 && !showForm) return null;
          return (
            <div key={group}>
              <h3 className="font-display text-h4 text-text-primary mb-4 capitalize">{group}</h3>
              <div className="space-y-2">
                {items.length === 0 ? (
                  <p className="text-sm text-text-tertiary py-4 text-center">No settings in this group.</p>
                ) : (
                  items.map(setting => {
                    const isEditing = editingValues[setting.settingKey] !== undefined;
                    const currentValue = isEditing ? (editingValues[setting.settingKey] ?? '') : setting.settingValue;

                    return (
                      <div key={setting.settingKey} className="flex items-center gap-4 p-4 rounded-xl bg-surface-secondary border border-border-primary hover:border-border-accent transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text-primary">{setting.settingKey}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-surface-elevated text-text-tertiary font-mono">{setting.settingType}</span>
                          </div>
                          {setting.description && <p className="text-xs text-text-tertiary mt-0.5">{setting.description}</p>}
                          <div className="mt-2 max-w-md">
                            {isEditing ? (
                              <div className="flex gap-2">
                                <input
                                  type={setting.settingType === 'number' ? 'number' : 'text'}
                                  value={currentValue}
                                  onChange={e => setEditingValues(prev => ({ ...prev, [setting.settingKey]: e.target.value }))}
                                  className="flex-1 rounded-lg border border-border-primary bg-surface-primary px-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent-500"
                                />
                                <button onClick={() => handleInlineSave(String(setting.settingKey), currentValue)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-500 text-white hover:bg-accent-600 transition-colors">Save</button>
                                <button onClick={() => setEditingValues(prev => { const n = { ...prev }; delete n[String(setting.settingKey)]; return n; })} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors">Cancel</button>
                              </div>
                            ) : (
                              <p className="text-sm text-text-secondary font-mono truncate">{setting.settingValue}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => setEditingValues(prev => ({ ...prev, [setting.settingKey]: setting.settingValue }))} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors" aria-label="Edit">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => setDeleteTarget(setting.settingKey ?? null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-semantic-error hover:bg-semantic-error-bg transition-colors" aria-label="Delete">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Setting" size="sm">
        <p className="text-sm text-text-secondary">Are you sure you want to delete setting &ldquo;{deleteTarget}&rdquo;?</p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
