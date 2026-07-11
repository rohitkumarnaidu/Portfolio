'use client';

import { useState, useEffect } from 'react';
import { useAdminAvailabilityStatus, useUpdateAvailabilityStatus } from '@/lib/hooks/useAvailability';
import { Button, Card, Input, useToast } from '@portfolio/ui';

export default function AvailabilityPage() {
  const { data: status, isLoading } = useAdminAvailabilityStatus();
  const updateMutation = useUpdateAvailabilityStatus();
  const { addToast } = useToast();
  const [statusValue, setStatusValue] = useState('available');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (status) {
      setStatusValue(status.status || 'available');
      setLabel(status.label || '');
      setDescription(status.description || '');
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({ status: statusValue as 'available' | 'limited' | 'unavailable', label, description });
      addToast({ variant: 'success', title: 'Availability status updated' });
    } catch { addToast({ variant: 'error', title: 'Failed to update' }); }
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><span className="text-text-secondary text-sm">Loading...</span></div>;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-h2 text-text-primary">Availability Status</h1>
        <p className="text-body-sm text-text-secondary mt-1">Manage your availability for new projects</p>
      </div>
      <Card variant="elevated">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Status</label>
            <div className="flex gap-3">
              {['available', 'limited', 'unavailable'].map(opt => (
                <button key={opt} type="button" onClick={() => setStatusValue(opt)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all border ${
                    statusValue === opt
                      ? opt === 'available' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : opt === 'limited' ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                        : 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400'
                      : 'border-border-primary text-text-secondary hover:bg-surface-elevated'
                  }`}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <Input label="Label *" value={label} onChange={e => setLabel(e.target.value)} required placeholder="Available for new projects" />
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-xl border border-border-primary bg-surface-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/50 resize-none" placeholder="Brief description of your availability..." />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={updateMutation.isPending}>Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
