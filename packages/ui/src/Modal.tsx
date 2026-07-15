'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from './cn';

const modalSizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
} as const;

type ModalSize = keyof typeof modalSizes;

export interface ModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  size?: ModalSize;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  closeOnBackdrop?: boolean;
}

export function Modal({
  open,
  isOpen,
  onClose,
  size = 'md',
  title,
  description,
  children,
  footer,
  className,
  closeOnBackdrop = true,
}: ModalProps) {
  const isActuallyOpen = open ?? isOpen ?? false;
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (isActuallyOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      setIsMounted(true);
      requestAnimationFrame(() => setIsVisible(true));
      return;
    }
    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsMounted(false);
      previousActiveElement.current?.focus();
    }, 200);
    return () => clearTimeout(timer);
  }, [isActuallyOpen]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isActuallyOpen) return;
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isActuallyOpen, handleEscape]);

  useEffect(() => {
    if (isActuallyOpen && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length > 0) {
        focusable[0]?.focus();
      }
    }
  }, [isActuallyOpen]);

  const handleBackdrop = useCallback(() => {
    if (closeOnBackdrop) onClose();
  }, [closeOnBackdrop, onClose]);

  if (!isMounted) return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[80] flex items-center justify-center p-4',
        'transition-all duration-200',
        isVisible ? 'opacity-100' : 'opacity-0',
      )}
      role="presentation"
    >
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-sm',
          'transition-all duration-200',
          isVisible ? 'opacity-100' : 'opacity-0',
        )}
        onClick={handleBackdrop}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          'relative w-full rounded-xl bg-surface-primary border border-border-primary shadow-2xl',
          'transition-all duration-200',
          isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-2 opacity-0',
          modalSizes[size],
          className,
        )}
      >
        <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-4 border-b border-border-primary">
          <div className="min-w-0 flex-1">
            {title && (
              <h2 id={titleId} className="text-lg font-semibold text-text-primary">
                {title}
              </h2>
            )}
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-text-secondary">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-text-tertiary hover:bg-surface-elevated hover:text-text-primary transition-colors"
            aria-label="Close dialog"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children && <div className="px-6 py-4">{children}</div>}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-4 border-t border-border-primary">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export interface ModalHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function ModalHeader({ className, children }: ModalHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-6 pt-6 pb-4 border-b border-border-primary',
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface ModalBodyProps {
  className?: string;
  children: React.ReactNode;
}

export function ModalBody({ className, children }: ModalBodyProps) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>;
}

export interface ModalFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function ModalFooter({ className, children }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 px-6 pb-6 pt-4 border-t border-border-primary',
        className,
      )}
    >
      {children}
    </div>
  );
}
