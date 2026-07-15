'use client';

import { useState, useCallback } from 'react';
import {
  useSections,
  useUpdateSection,
  useDeleteSection,
  useReorderSections,
} from '@/lib/hooks/useSections';
import type { Section } from '@portfolio/shared';
import { Button, Modal, useToast } from '@portfolio/ui';
import { DraggableList } from '@/components/admin/DraggableList';
import { AIAnalysisPanel } from '@/components/admin/AIAnalysisPanel';

type SectionItem = Section & { [key: string]: unknown };

export default function SectionsPage() {
  const { data: sections, isLoading } = useSections();
  const updateSection = useUpdateSection();
  const deleteSection = useDeleteSection();
  const reorderSections = useReorderSections();
  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);
  const { addToast } = useToast();

  const toggleLive = async (section: Section) => {
    try {
      await updateSection.mutateAsync({ id: section.id, data: { is_live: !section.is_live } });
      addToast({
        variant: 'success',
        title: section.is_live ? 'Section hidden' : 'Section published',
      });
    } catch {
      addToast({ variant: 'error', title: 'Failed to toggle section' });
    }
  };

  const handleReorder = useCallback(
    async (ordered: SectionItem[]) => {
      const order = ordered.map((s, idx) => ({ id: s.id, display_order: idx }));
      try {
        await reorderSections.mutateAsync(order);
        addToast({ variant: 'success', title: 'Sections reordered' });
      } catch {
        addToast({ variant: 'error', title: 'Failed to reorder sections' });
      }
    },
    [reorderSections, addToast],
  );

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSection.mutateAsync(deleteTarget.id);
      addToast({ variant: 'success', title: 'Section deleted' });
      setDeleteTarget(null);
    } catch {
      addToast({ variant: 'error', title: 'Failed to delete section' });
    }
  };

  const sorted = sections ? [...sections].sort((a, b) => a.display_order - b.display_order) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Sections</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Manage portfolio section visibility, order, and drag to reorder
          </p>
        </div>
      </div>
      <div className="mb-8">
        <AIAnalysisPanel
          content={sections ? sections.map((s) => s.section_label).join(', ') : ''}
          type="section"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-surface-secondary border border-border-primary"
            />
          ))}
        </div>
      ) : !sections?.length ? (
        <div className="text-center py-16">
          <p className="text-body text-text-secondary">No sections found.</p>
        </div>
      ) : (
        <DraggableList
          items={sorted as unknown as SectionItem[]}
          onReorder={handleReorder}
          renderItem={(item) => {
            const section = item as unknown as Section;
            return (
              <div className="flex items-center gap-4 w-full">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">
                      {section.section_label}
                    </span>
                    <span className="text-xs font-mono text-text-tertiary bg-surface-elevated px-1.5 py-0.5 rounded">
                      {section.section_key}
                    </span>
                    {section.is_always_visible && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-accent-500/10 text-accent-500">
                        Always visible
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {section.section_type} &bull; order {section.display_order}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleLive(section)}
                    className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${section.is_live ? 'bg-semantic-success' : 'bg-surface-elevated'}`}
                    aria-label={section.is_live ? 'Hide section' : 'Show section'}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${section.is_live ? 'translate-x-[18px]' : 'translate-x-0.5'}`}
                    />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(section)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-semantic-error hover:bg-semantic-error-bg transition-colors"
                    aria-label="Delete section"
                  >
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          }}
        />
      )}

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Section"
        size="sm"
      >
        <p className="text-sm text-text-secondary">
          Are you sure you want to delete the &ldquo;{deleteTarget?.section_label}&rdquo; section?
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
