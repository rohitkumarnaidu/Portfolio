'use client';

import { useState, useMemo } from 'react';
import { useFAQs, useCreateFAQ, useUpdateFAQ, useDeleteFAQ } from '@/lib/hooks/useFAQs';
import type { FAQ } from '@portfolio/shared';
import { Button, Input, Card, useToast } from '@portfolio/ui';
import { DataTable } from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';

interface FAQForm {
  question: string;
  answer: string;
  category: string;
  is_visible: boolean;
  display_order: number;
}
const emptyForm: FAQForm = {
  question: '',
  answer: '',
  category: '',
  is_visible: true,
  display_order: 0,
};

export default function FAQsPage() {
  const { data: faqs, isLoading } = useFAQs();
  const createFAQ = useCreateFAQ();
  const updateFAQ = useUpdateFAQ();
  const deleteFAQ = useDeleteFAQ();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FAQForm>(emptyForm);
  const { addToast } = useToast();

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (faq: FAQ) => {
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
      is_visible: faq.is_visible,
      display_order: faq.display_order,
    });
    setEditingId(faq.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, category: form.category || undefined };
      if (editingId) {
        await updateFAQ.mutateAsync({ id: editingId, data: payload });
        addToast({ variant: 'success', title: 'FAQ updated' });
      } else {
        await createFAQ.mutateAsync(payload);
        addToast({ variant: 'success', title: 'FAQ created' });
      }
      resetForm();
    } catch {
      addToast({ variant: 'error', title: 'Failed to save FAQ' });
    }
  };

  const handleDelete = async (faq: FAQ) => {
    await deleteFAQ.mutateAsync(faq.id);
  };

  const columns: Column<FAQ>[] = useMemo(
    () => [
      {
        key: 'question',
        label: 'Question',
        sortable: true,
        grow: true,
        render: (faq) => (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-primary">{faq.question}</span>
            {!faq.is_visible && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-surface-elevated text-text-tertiary">
                Hidden
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
        render: (faq) =>
          faq.category ? (
            <span className="text-xs text-text-secondary capitalize">{faq.category}</span>
          ) : null,
      },
      {
        key: 'display_order',
        label: 'Order',
        width: '60px',
        sortable: true,
        render: (faq) => <span className="text-xs text-text-tertiary">{faq.display_order}</span>,
      },
      {
        key: 'created_at',
        label: 'Date',
        width: '90px',
        sortable: true,
        render: (faq) => (
          <span className="text-xs text-text-tertiary">
            {new Date(faq.created_at).toLocaleDateString()}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">FAQs</h1>
          <p className="text-body-sm text-text-secondary mt-1">Manage frequently asked questions</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancel' : 'Add FAQ'}
        </Button>
      </div>

      {showForm && (
        <Card variant="elevated" className="mb-8">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h3 className="font-display text-h4 text-text-primary">
              {editingId ? 'Edit FAQ' : 'New FAQ'}
            </h3>
            <Input
              label="Question *"
              value={form.question}
              onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
              required
            />
            <Input
              label="Category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="general, pricing, process, technical"
            />
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Answer *</label>
              <textarea
                value={form.answer}
                onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                rows={4}
                required
                className="w-full rounded-xl border border-border-primary bg-surface-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/50 resize-none"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={form.is_visible}
                onChange={(e) => setForm((f) => ({ ...f, is_visible: e.target.checked }))}
                className="rounded border-border-primary"
              />
              Visible on portfolio
            </label>
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
        data={faqs ?? []}
        columns={columns}
        keyExtractor={(faq) => faq.id}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search questions & answers..."
        pageSize={10}
        onEdit={handleEdit}
        onDelete={handleDelete}
        bulkActions={[
          {
            label: 'Bulk Delete',
            action: async (ids) => {
              await Promise.all(ids.map((id) => deleteFAQ.mutateAsync(id)));
            },
            variant: 'danger',
            confirmTitle: 'Bulk Delete FAQs',
            confirmMessage: (count) => `Are you sure you want to delete ${count} FAQs?`,
          },
          {
            label: 'Bulk Show',
            action: async (ids) => {
              await Promise.all(
                ids.map((id) => updateFAQ.mutateAsync({ id, data: { is_visible: true } })),
              );
            },
            confirmTitle: 'Bulk Show FAQs',
            confirmMessage: (count) => `Make ${count} FAQs visible?`,
          },
          {
            label: 'Bulk Hide',
            action: async (ids) => {
              await Promise.all(
                ids.map((id) => updateFAQ.mutateAsync({ id, data: { is_visible: false } })),
              );
            },
            confirmTitle: 'Bulk Hide FAQs',
            confirmMessage: (count) => `Hide ${count} FAQs?`,
          },
        ]}
      />
    </div>
  );
}
