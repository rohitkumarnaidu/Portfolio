'use client';

import { cn } from './cn';
import { useState, useCallback, type KeyboardEvent } from 'react';

export interface NeuToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const NeuToggle = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  className,
}: NeuToggleProps) => {
  const [internalChecked, setInternalChecked] = useState(checked);
  const isChecked = onChange ? checked : internalChecked;

  const handleToggle = useCallback(() => {
    if (disabled) return;
    const next = !isChecked;
    onChange?.(next);
    if (!onChange) setInternalChecked(next);
  }, [disabled, isChecked, onChange]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggle();
      }
    },
    [handleToggle]
  );

  return (
    <label
      className={cn(
        'inline-flex items-center gap-3',
        disabled && 'opacity-40 cursor-not-allowed',
        !disabled && 'cursor-pointer',
        className
      )}
    >
      <div
        role="switch"
        aria-checked={isChecked}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onClick={handleToggle}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 rounded-full neu-pressed transition-colors duration-fast',
          isChecked && 'bg-accent-500',
          !isChecked && 'bg-surface-elevated',
          'focus-visible:shadow-accent-focus focus-visible:outline-none'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-surface-secondary neu-raised transition-transform duration-fast',
            isChecked && 'translate-x-5'
          )}
          aria-hidden="true"
        />
      </div>
      {label && (
        <span className="text-body-sm text-text-primary select-none">{label}</span>
      )}
    </label>
  );
};
