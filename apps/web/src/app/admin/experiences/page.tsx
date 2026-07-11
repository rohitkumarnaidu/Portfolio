'use client';

import { useState, useMemo } from 'react';
import { useExperiences, useCreateExperience, useUpdateExperience, useDeleteExperience } from '@/lib/hooks/useExperiences';
import type { Experience } from '@portfolio/shared';
import { Button, Card, useToast } from '@portfolio/ui';
import { DataTable } from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';
import { ExperienceForm } from '@/components/admin/ExperienceForm';

export default function ExperiencesPage() {
  const { data: experiences, isLoading } = useExperiences();
  const createExperience = useCreateExperience();
  const updateExperience = useUpdateExperience();
  const deleteExperience = useDeleteExperience();
  const [showForm, setShowForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const { addToast } = useToast();

  const resetForm = () => { setEditingExperience(null); setShowForm(false); };

  const handleEdit = (e: Experience) => {
    setEditingExperience(e);
    setShowForm(true);
  };

  const handleSubmit = async (payload: Partial<Experience>) => {
    try {
      if (editingExperience) {
        await updateExperience.mutateAsync({ id: editingExperience.id, data: payload });
        addToast({ variant: 'success', title: 'Experience updated successfully' });
      } else {
        await createExperience.mutateAsync(payload);
        addToast({ variant: 'success', title: 'Experience created successfully' });
      }
      resetForm();
    } catch {
      addToast({ variant: 'error', title: 'Failed to save experience' });
    }
  };

  const handleDelete = async (exp: Experience) => {
    try {
      await deleteExperience.mutateAsync(exp.id);
      addToast({ variant: 'success', title: 'Experience deleted' });
    } catch {
      addToast({ variant: 'error', title: 'Failed to delete experience' });
    }
  };

  const columns: Column<Experience>[] = useMemo(() => [
    {
      key: 'company',
      label: 'Company',
      grow: true,
      sortable: true,
      render: (exp) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">{exp.role}</span>
          <span className="text-xs text-text-tertiary">@</span>
          <span className="text-sm text-text-secondary">{exp.company}</span>
          {!exp.is_visible && <span className="text-xs px-1.5 py-0.5 rounded bg-surface-elevated text-text-tertiary">Hidden</span>}
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      width: '120px',
      sortable: true,
      render: (exp) => <span className="text-xs text-text-tertiary">{exp.role}</span>,
    },
    {
      key: 'location',
      label: 'Location',
      width: '100px',
      sortable: true,
      render: (exp) => <span className="text-xs text-text-tertiary">{exp.location}</span>,
    },
    {
      key: 'start_date',
      label: 'Start',
      width: '80px',
      sortable: true,
      render: (exp) => <span className="text-xs text-text-tertiary">{exp.start_date}</span>,
    },
    {
      key: 'end_date',
      label: 'End',
      width: '80px',
      sortable: true,
      render: (exp) => <span className="text-xs text-text-tertiary">{exp.end_date || 'Present'}</span>,
    },
  ], []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Experience</h1>
          <p className="text-body-sm text-text-secondary mt-1">Manage work experience entries</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>Add Experience</Button>
        )}
      </div>

      {showForm && (
        <Card variant="elevated" className="mb-8 p-6">
          <ExperienceForm 
            initialData={editingExperience} 
            onSubmit={handleSubmit} 
            onCancel={resetForm} 
            isLoading={createExperience.isPending || updateExperience.isPending}
          />
        </Card>
      )}

      <DataTable
        data={experiences ?? []}
        columns={columns}
        keyExtractor={(exp) => exp.id}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search experiences..."
        pageSize={10}
        onEdit={handleEdit}
        onDelete={handleDelete}
        bulkActions={[
          {
            label: 'Bulk Delete',
            action: async (ids) => { await Promise.all(ids.map(id => deleteExperience.mutateAsync(id))); },
            variant: 'danger',
            confirmTitle: 'Bulk Delete Experiences',
            confirmMessage: (count) => `Are you sure you want to delete ${count} experiences?`,
          },
          {
            label: 'Bulk Show',
            action: async (ids) => { await Promise.all(ids.map(id => updateExperience.mutateAsync({ id, data: { is_visible: true } }))); },
            confirmTitle: 'Bulk Show Experiences',
            confirmMessage: (count) => `Make ${count} experiences visible?`,
          },
          {
            label: 'Bulk Hide',
            action: async (ids) => { await Promise.all(ids.map(id => updateExperience.mutateAsync({ id, data: { is_visible: false } }))); },
            confirmTitle: 'Bulk Hide Experiences',
            confirmMessage: (count) => `Hide ${count} experiences?`,
          },
        ]}
      />
    </div>
  );
}
