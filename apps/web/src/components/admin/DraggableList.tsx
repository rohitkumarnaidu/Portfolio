'use client';

import { cn } from '@/lib/cn';
import { useSortableList } from '@/hooks/useSortableList';

interface DraggableItem {
  id: string | number;
  [key: string]: unknown;
}

interface DraggableListProps<T extends DraggableItem> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function DraggableList<T extends DraggableItem>({
  items,
  onReorder,
  renderItem,
  className,
}: DraggableListProps<T>) {
  const { getDragProps, isDragging, draggedIndex } = useSortableList({
    items,
    onReorder,
  });

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item, index) => {
        const dragProps = getDragProps(index);

        return (
          <div
            key={item.id}
            {...dragProps}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border border-border-accent',
              'bg-surface-primary transition-all duration-200',
              'hover:border-accent-500/50',
              isDragging && draggedIndex === index && 'opacity-50 scale-[1.02] shadow-lg',
              isDragging && draggedIndex !== index && 'border-accent-500/30',
            )}
          >
            <div
              className="cursor-grab active:cursor-grabbing text-text-tertiary hover:text-text-secondary"
              aria-label="Drag to reorder"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zm-6 5h2v2H8v-2zm6 0h2v2h-2v-2z" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">{renderItem(item, index)}</div>

            <div className="flex gap-1">
              <button
                onClick={() => {
                  if (index > 0) {
                    const reordered = [...items];
                    [reordered[index - 1], reordered[index]] = [
                      reordered[index],
                      reordered[index - 1],
                    ] as [T, T];
                    onReorder(reordered);
                  }
                }}
                disabled={index === 0}
                className="p-1 text-text-tertiary hover:text-text-secondary disabled:opacity-30"
                aria-label="Move up"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                onClick={() => {
                  if (index < items.length - 1) {
                    const reordered = [...items];
                    [reordered[index], reordered[index + 1]] = [
                      reordered[index + 1],
                      reordered[index],
                    ] as [T, T];
                    onReorder(reordered);
                  }
                }}
                disabled={index === items.length - 1}
                className="p-1 text-text-tertiary hover:text-text-secondary disabled:opacity-30"
                aria-label="Move down"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
