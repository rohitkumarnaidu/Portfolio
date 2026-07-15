'use client';

import { useState } from 'react';
import { useCaseStudies } from '@/lib/hooks/useCaseStudies';
import { useProjects } from '@/lib/hooks/useProjects';
import { createCaseStudy, updateCaseStudy, deleteCaseStudy } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import type { CaseStudy } from '@/lib/api';
import { Button, Card, Modal, useToast } from '@portfolio/ui';

interface CSForm {
  projectId: string;
  challenge: string;
  approach: string;
  solution: string;
  impact: string;
  architectureDiagrams: string;
  codeSnippets: string;
}

const emptyForm: CSForm = {
  projectId: '',
  challenge: '',
  approach: '',
  solution: '',
  impact: '',
  architectureDiagrams: '',
  codeSnippets: '',
};

export default function AdminCaseStudiesPage() {
  const { data: caseStudies, isLoading } = useCaseStudies();
  const { data: projects } = useProjects({ per_page: 100 });
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CSForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<CaseStudy | null>(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (cs: CaseStudy) => {
    setForm({
      projectId: cs.projectId,
      challenge: cs.challenge || '',
      approach: cs.approach || '',
      solution: cs.solution || '',
      impact: cs.impact || '',
      architectureDiagrams: (cs.architectureDiagrams || []).join('\n'),
      codeSnippets: (cs.codeSnippets || []).join('\n'),
    });
    setEditingId(cs.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        architectureDiagrams: form.architectureDiagrams.split('\n').filter(Boolean),
        codeSnippets: form.codeSnippets.split('\n').filter(Boolean),
      };
      if (editingId) {
        await updateCaseStudy(editingId, payload);
        addToast({ variant: 'success', title: 'Case study updated' });
      } else {
        await createCaseStudy(payload);
        addToast({ variant: 'success', title: 'Case study created' });
      }
      queryClient.invalidateQueries({ queryKey: ['caseStudies'] });
      resetForm();
    } catch {
      addToast({ variant: 'error', title: 'Failed to save case study' });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCaseStudy(deleteTarget.id);
      queryClient.invalidateQueries({ queryKey: ['caseStudies'] });
      addToast({ variant: 'success', title: 'Case study deleted' });
      setDeleteTarget(null);
    } catch {
      addToast({ variant: 'error', title: 'Failed to delete case study' });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Case Studies</h1>
          <p className="text-body-sm text-text-secondary mt-1">Deep-dive project analyses</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          disabled={showForm}
        >
          New Case Study
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Project *</label>
              <select
                value={form.projectId}
                onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
                className="w-full rounded-xl bg-surface-primary border border-border-primary px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-500"
                required
              >
                <option value="">Select a project...</option>
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            {(['challenge', 'approach', 'solution', 'impact'] as const).map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-text-primary mb-1 capitalize">
                  {field}
                </label>
                <textarea
                  value={form[field]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  className="w-full rounded-xl bg-surface-primary border border-border-primary px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[80px]"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Architecture Diagrams (one URL per line)
              </label>
              <textarea
                value={form.architectureDiagrams}
                onChange={(e) => setForm((f) => ({ ...f, architectureDiagrams: e.target.value }))}
                className="w-full rounded-xl bg-surface-primary border border-border-primary px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[60px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Code Snippets (one URL per line)
              </label>
              <textarea
                value={form.codeSnippets}
                onChange={(e) => setForm((f) => ({ ...f, codeSnippets: e.target.value }))}
                className="w-full rounded-xl bg-surface-primary border border-border-primary px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[60px]"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={!form.projectId || saving}>
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </Button>
              <Button variant="secondary" type="button" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-surface-elevated rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !caseStudies?.length ? (
        <div className="text-center py-16">
          <p className="text-body text-text-secondary">No case studies yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {caseStudies.map((cs) => {
            const project = projects?.find((p) => p.id === cs.projectId);
            return (
              <Card key={cs.id} padding="md" className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary">
                    {project?.title || 'Unknown Project'}
                  </p>
                  <p className="text-sm text-text-tertiary mt-0.5">
                    {cs.challenge ? `${cs.challenge.slice(0, 80)}...` : 'No challenge description'}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="secondary" size="sm" onClick={() => handleEdit(cs)}>
                    Edit
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(cs)}>
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-display text-text-primary">Delete Case Study</h3>
          <p className="text-sm text-text-secondary">
            Are you sure you want to delete the case study for &quot;
            {deleteTarget && projects?.find((p) => p.id === deleteTarget.projectId)?.title}&quot;?
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button onClick={confirmDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
