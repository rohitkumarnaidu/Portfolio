'use client';

import { useState, useEffect } from 'react';
import {
  useAdminAvailabilityStatus,
  useUpdateAvailabilityStatus,
} from '@/lib/hooks/useAvailability';
import { Button, Card, Input, useToast } from '@portfolio/ui';

const CONTACT_OPTIONS = ['email', 'linkedin', 'calendar', 'form'];

export default function AvailabilityPage() {
  const { data: status, isLoading } = useAdminAvailabilityStatus();
  const updateMutation = useUpdateAvailabilityStatus();
  const { addToast } = useToast();
  const [isAvailable, setIsAvailable] = useState(true);
  const [statusLabel, setStatusLabel] = useState('');
  const [availableUntil, setAvailableUntil] = useState('');
  const [preferredContact, setPreferredContact] = useState('email');

  useEffect(() => {
    if (status) {
      setIsAvailable(status.isAvailable ?? true);
      setStatusLabel(status.statusLabel ?? '');
      setAvailableUntil(status.availableUntil ?? '');
      setPreferredContact(status.preferredContact ?? 'email');
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        isAvailable,
        statusLabel,
        availableUntil: availableUntil || undefined,
        preferredContact,
      });
      addToast({ variant: 'success', title: 'Availability status updated' });
    } catch {
      addToast({ variant: 'error', title: 'Failed to update' });
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-text-secondary text-sm">Loading...</span>
      </div>
    );

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-h2 text-text-primary">Availability Status</h1>
        <p className="text-body-sm text-text-secondary mt-1">
          Manage your availability for new projects
        </p>
      </div>
      <Card variant="elevated">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Status</label>
            <div className="flex gap-3">
              {[
                { value: true, label: 'Available' },
                { value: false, label: 'Unavailable' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setIsAvailable(opt.value)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all border ${
                    isAvailable === opt.value
                      ? opt.value
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400'
                      : 'border-border-primary text-text-secondary hover:bg-surface-elevated'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Status Label *"
            value={statusLabel}
            onChange={(e) => setStatusLabel(e.target.value)}
            required
            placeholder="Available for new projects"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                className="block text-sm font-medium text-text-primary"
                htmlFor="availableUntil"
              >
                Available Until
              </label>
              <input
                id="availableUntil"
                type="date"
                value={availableUntil}
                onChange={(e) => setAvailableUntil(e.target.value)}
                className="w-full rounded-xl border border-border-primary bg-surface-secondary px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="block text-sm font-medium text-text-primary"
                htmlFor="preferredContact"
              >
                Preferred Contact
              </label>
              <select
                id="preferredContact"
                value={preferredContact}
                onChange={(e) => setPreferredContact(e.target.value)}
                className="w-full rounded-xl border border-border-primary bg-surface-secondary px-4 py-2.5 text-sm text-text-primary capitalize"
              >
                {CONTACT_OPTIONS.map((option) => (
                  <option key={option} value={option} className="capitalize">
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={updateMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
