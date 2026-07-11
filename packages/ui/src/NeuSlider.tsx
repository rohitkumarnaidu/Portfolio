'use client';

import { cn } from './cn';
import { useState, useCallback, useRef, type KeyboardEvent } from 'react';

export interface NeuSliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  className?: string;
}

export const NeuSlider = ({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  orientation = 'horizontal',
  label,
  className,
}: NeuSliderProps) => {
  const [internalValue, setInternalValue] = useState(value ?? min);
  const trackRef = useRef<HTMLDivElement>(null);
  const isVertical = orientation === 'vertical';
  const currentValue = onChange ? value ?? min : internalValue;
  const percentage = ((currentValue - min) / (max - min)) * 100;

  const updateValue = useCallback(
    (clientPos: number) => {
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      let raw: number;

      if (isVertical) {
        raw = (rect.bottom - clientPos) / rect.height;
      } else {
        raw = (clientPos - rect.left) / rect.width;
      }

      const clamped = Math.min(Math.max(raw, 0), 1);
      const stepped = Math.round((min + clamped * (max - min)) / step) * step;
      const final = Math.min(Math.max(stepped, min), max);

      onChange?.(final);
      if (!onChange) setInternalValue(final);
    },
    [min, max, step, onChange, isVertical]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updateValue(e.clientX ?? e.clientY);

      const handleMove = (e: PointerEvent) => updateValue(e.clientX ?? e.clientY);
      const handleUp = () => {
        document.removeEventListener('pointermove', handleMove);
        document.removeEventListener('pointerup', handleUp);
      };

      document.addEventListener('pointermove', handleMove);
      document.addEventListener('pointerup', handleUp);
    },
    [updateValue]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      let newValue = currentValue;
      const delta = e.shiftKey ? step * 10 : step;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          newValue = Math.min(currentValue + delta, max);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          newValue = Math.max(currentValue - delta, min);
          break;
        case 'Home':
          e.preventDefault();
          newValue = min;
          break;
        case 'End':
          e.preventDefault();
          newValue = max;
          break;
        default:
          return;
      }

      onChange?.(newValue);
      if (!onChange) setInternalValue(newValue);
    },
    [currentValue, min, max, step, onChange]
  );

  return (
    <div
      className={cn(
        'inline-flex gap-3',
        isVertical ? 'flex-row items-center' : 'flex-col',
        className
      )}
    >
      {label && (
        <span className="text-body-sm text-text-secondary">{label}</span>
      )}

      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={label ?? 'Slider'}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={currentValue}
        aria-orientation={orientation}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative rounded-full bg-surface-elevated neu-pressed',
          'focus-visible:shadow-accent-focus focus-visible:outline-none',
          isVertical ? 'w-2 h-40' : 'h-2 w-40'
        )}
      >
        <div
          className="absolute rounded-full bg-accent-500"
          style={
            isVertical
              ? { bottom: 0, left: 0, width: '100%', height: `${percentage}%` }
              : { left: 0, top: 0, height: '100%', width: `${percentage}%` }
          }
        />

        <div
          className={cn(
            'absolute rounded-full bg-surface-secondary neu-raised',
            'w-5 h-5 -translate-x-1/2 -translate-y-1/2 pointer-events-none',
            isVertical ? 'left-1/2' : 'top-1/2'
          )}
          style={
            isVertical
              ? { bottom: `${percentage}%`, left: '50%' }
              : { left: `${percentage}%`, top: '50%' }
          }
        />
      </div>
    </div>
  );
};
