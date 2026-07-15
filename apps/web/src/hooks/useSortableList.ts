'use client';

import { useState, useRef, useCallback } from 'react';

interface DragProps {
  draggable: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  'data-index': number;
}

interface UseSortableListOptions<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  handleSelector?: string;
  animationDuration?: number;
}

export function useSortableList<T extends { id: string | number }>(
  options: UseSortableListOptions<T>,
) {
  const { items, onReorder } = options;
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  const getDragProps = useCallback(
    (index: number): DragProps => ({
      draggable: true,
      'data-index': index,
      onDragStart: (e: React.DragEvent) => {
        setIsDragging(true);
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
      },
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        dragOverIndex.current = index;
      },
      onDragEnd: () => {
        const from = draggedIndex;
        const to = dragOverIndex.current;

        if (from !== null && to !== null && from !== to) {
          const reordered = [...items];
          const [moved] = reordered.splice(from, 1);
          if (moved === undefined) return;
          reordered.splice(to, 0, moved);
          onReorder(reordered);
        }

        setIsDragging(false);
        setDraggedIndex(null);
        dragOverIndex.current = null;
      },
    }),
    [items, draggedIndex, onReorder],
  );

  return {
    items,
    getDragProps,
    isDragging,
    draggedIndex,
  };
}
