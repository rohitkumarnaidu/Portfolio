'use client';

import { useState, useMemo } from 'react';
import { useSkills, useCreateSkill, useUpdateSkill, useDeleteSkill } from '@/lib/hooks/useSkills';
import type { Skill } from '@portfolio/shared';
import { Button, Input, Modal, useToast } from '@portfolio/ui';
import { DataTable } from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';
import { SkillForm } from '@/components/admin/SkillForm';

export default function SkillsPage() {
  const { data: skills, isLoading } = useSkills();
  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const { addToast } = useToast();

  const filtered = useMemo(() => {
    if (!search || !skills) return skills ?? [];
    const q = search.toLowerCase();
    return skills.filter(
      (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q),
    );
  }, [skills, search]);

  const grouped = useMemo(
    () =>
      filtered.reduce<Record<string, Skill[]>>((acc, s) => {
        const cat = s.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(s);
        return acc;
      }, {}),
    [filtered],
  );

  const resetForm = () => {
    setEditingSkill(null);
    setShowForm(false);
  };

  const handleEdit = (s: Skill) => {
    setEditingSkill(s);
    setShowForm(true);
  };

  const handleSubmit = async (payload: Partial<Skill>) => {
    try {
      if (editingSkill) {
        await updateSkill.mutateAsync({ id: editingSkill.id, data: payload });
        addToast({ variant: 'success', title: 'Skill updated successfully' });
      } else {
        await createSkill.mutateAsync(payload);
        addToast({ variant: 'success', title: 'Skill created successfully' });
      }
      resetForm();
    } catch {
      addToast({ variant: 'error', title: 'Failed to save skill' });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSkill.mutateAsync(deleteTarget.id);
      addToast({ variant: 'success', title: 'Skill deleted' });
      setDeleteTarget(null);
    } catch {
      addToast({ variant: 'error', title: 'Failed to delete skill' });
    }
  };

  const handleTableDelete = async (s: Skill) => {
    await deleteSkill.mutateAsync(s.id);
  };

  const tableColumns: Column<Skill>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        grow: true,
        render: (s) => (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-primary">{s.name}</span>
            {s.is_featured && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-accent-500/10 text-accent-500">
                Featured
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'category',
        label: 'Category',
        width: '100px',
        sortable: true,
        render: (s) => <span className="text-xs text-text-secondary capitalize">{s.category}</span>,
      },
      {
        key: 'proficiency',
        label: 'Proficiency',
        width: '120px',
        sortable: true,
        render: (s) => (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full bg-surface-elevated">
              <div
                className="h-full rounded-full bg-accent-500 transition-all"
                style={{ width: `${s.proficiency}%` }}
              />
            </div>
            <span className="text-xs text-text-tertiary">{s.proficiency}%</span>
          </div>
        ),
      },
      {
        key: 'created_at',
        label: 'Date',
        width: '90px',
        sortable: true,
        render: (s) => (
          <span className="text-xs text-text-tertiary">
            {new Date(s.created_at).toLocaleDateString()}
          </span>
        ),
      },
    ],
    [],
  );

  if (isLoading && !skills) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-surface-secondary border border-border-primary"
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Skills</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Manage technical skills and proficiencies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode((v) => (v === 'grid' ? 'table' : 'grid'))}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors"
            aria-label={viewMode === 'grid' ? 'Table view' : 'Grid view'}
          >
            {viewMode === 'grid' ? (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                />
              </svg>
            )}
          </button>
          {!showForm && <Button onClick={() => setShowForm(true)}>Add Skill</Button>}
        </div>
      </div>

      {showForm && (
        <div className="rounded-2xl bg-surface-secondary border border-border-primary p-6 mb-8">
          <SkillForm
            initialData={editingSkill}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            isLoading={createSkill.isPending || updateSkill.isPending}
          />
        </div>
      )}

      <div className="mb-6 max-w-xs">
        <Input
          placeholder="Search skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {viewMode === 'grid' ? (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h3 className="font-display text-h4 text-text-primary mb-3 capitalize">{category}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-secondary border border-border-primary hover:border-border-accent transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{skill.name}</span>
                      {skill.is_featured && (
                        <span className="text-xs px-1 py-0.5 rounded bg-accent-500/10 text-accent-500">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-elevated mt-1.5">
                      <div
                        className="h-full rounded-full bg-accent-500 transition-all"
                        style={{ width: `${skill.proficiency}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => handleEdit(skill)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                      aria-label="Edit"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(skill)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-semantic-error hover:bg-semantic-error-bg transition-colors"
                      aria-label="Delete"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <DataTable
          data={filtered}
          columns={tableColumns}
          keyExtractor={(s) => s.id}
          isLoading={isLoading}
          searchable={false}
          pageSize={15}
          onEdit={handleEdit}
          onDelete={handleTableDelete}
          bulkActions={[
            {
              label: 'Bulk Delete',
              action: async (ids) => {
                await Promise.all(ids.map((id) => deleteSkill.mutateAsync(id)));
              },
              variant: 'danger',
              confirmTitle: 'Bulk Delete Skills',
              confirmMessage: (count) => `Are you sure you want to delete ${count} skills?`,
            },
          ]}
        />
      )}

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Skill"
        size="sm"
      >
        <p className="text-sm text-text-secondary">
          Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;?
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
