'use client';

import { useState, useMemo } from 'react';
import {
  useTestimonials,
  useCreateTestimonial,
  useUpdateTestimonial,
  useDeleteTestimonial,
} from '@/lib/hooks/useTestimonials';
import type { Testimonial } from '@portfolio/shared';
import { Button, Card, useToast } from '@portfolio/ui';
import { DataTable } from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';
import { TestimonialForm } from '@/components/admin/TestimonialForm';

export default function TestimonialsPage() {
  const { data: testimonials, isLoading } = useTestimonials();
  const createTestimonial = useCreateTestimonial();
  const updateTestimonial = useUpdateTestimonial();
  const deleteTestimonial = useDeleteTestimonial();
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const { addToast } = useToast();

  const resetForm = () => {
    setEditingTestimonial(null);
    setShowForm(false);
  };

  const handleEdit = (t: Testimonial) => {
    setEditingTestimonial(t);
    setShowForm(true);
  };

  const handleSubmit = async (payload: Partial<Testimonial>) => {
    try {
      if (editingTestimonial) {
        await updateTestimonial.mutateAsync({
          id: editingTestimonial.id,
          data: payload as unknown as Record<string, unknown>,
        });
        addToast({ variant: 'success', title: 'Testimonial updated successfully' });
      } else {
        await createTestimonial.mutateAsync(payload as unknown as Record<string, unknown>);
        addToast({ variant: 'success', title: 'Testimonial created successfully' });
      }
      resetForm();
    } catch {
      addToast({ variant: 'error', title: 'Failed to save testimonial' });
    }
  };

  const handleDelete = async (t: Testimonial) => {
    try {
      await deleteTestimonial.mutateAsync(t.id);
      addToast({ variant: 'success', title: 'Testimonial deleted' });
    } catch {
      addToast({ variant: 'error', title: 'Failed to delete testimonial' });
    }
  };

  const columns: Column<Testimonial>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        grow: true,
        render: (t) => (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-primary">{t.name}</span>
            <span className="text-xs text-text-tertiary">— {t.company}</span>
            {!t.isVisible && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-surface-elevated text-text-tertiary">
                Hidden
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'content',
        label: 'Content',
        sortable: true,
        grow: true,
        render: (t) => <p className="text-xs text-text-tertiary truncate max-w-xs">{t.content}</p>,
      },
      {
        key: 'rating',
        label: 'Rating',
        width: '80px',
        sortable: true,
        render: (t) => (
          <span className="text-xs text-text-secondary">
            {'★'.repeat(t.rating)}
            {'☆'.repeat(5 - t.rating)}
          </span>
        ),
      },
      {
        key: 'created_at',
        label: 'Date',
        width: '90px',
        sortable: true,
        render: (t) => (
          <span className="text-xs text-text-tertiary">
            {new Date(t.createdAt).toLocaleDateString()}
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
          <h1 className="font-display text-h2 text-text-primary">Testimonials</h1>
          <p className="text-body-sm text-text-secondary mt-1">Manage client testimonials</p>
        </div>
        {!showForm && <Button onClick={() => setShowForm(true)}>Add Testimonial</Button>}
      </div>

      {showForm && (
        <Card variant="elevated" className="mb-8 p-6">
          <TestimonialForm
            initialData={editingTestimonial}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            isLoading={createTestimonial.isPending || updateTestimonial.isPending}
          />
        </Card>
      )}

      <DataTable
        data={testimonials ?? []}
        columns={columns}
        keyExtractor={(t) => t.id}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search testimonials..."
        pageSize={10}
        onEdit={handleEdit}
        onDelete={handleDelete}
        bulkActions={[
          {
            label: 'Bulk Delete',
            action: async (ids) => {
              await Promise.all(ids.map((id) => deleteTestimonial.mutateAsync(id)));
            },
            variant: 'danger',
            confirmTitle: 'Bulk Delete Testimonials',
            confirmMessage: (count) => `Are you sure you want to delete ${count} testimonials?`,
          },
          {
            label: 'Bulk Verify',
            action: async (ids) => {
              await Promise.all(
                ids.map((id) => updateTestimonial.mutateAsync({ id, data: { isVisible: true } })),
              );
            },
            confirmTitle: 'Bulk Verify Testimonials',
            confirmMessage: (count) => `Make ${count} testimonials visible?`,
          },
        ]}
      />
    </div>
  );
}
