'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { cn } from './cn';

/**
 * Toast — Non-blocking notification system with provider pattern.
 *
 * @see docs/DesignSystem.md §2.6 (Toast Specification)
 *
 * - 4 variants: success, error, warning, info
 * - Auto-dismiss with configurable duration
 * - Hover pauses auto-dismiss timer
 * - Slide-in from right animation
 * - Accessible: role="status" (success/info), role="alert" (error/warning)
 */

/* ────── Types ────── */

export interface ToastData {
  id: string;
  variant: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  isDismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

type AddToastInput = Omit<ToastData, 'id'>;

interface ToastContextValue {
  addToast: (toast: AddToastInput) => void;
  removeToast: (id: string) => void;
}

/* ────── Context ────── */

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}

/* ────── Icons ────── */

const toastIcons: Record<ToastData['variant'], React.ReactNode> = {
  success: (
    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const toastStyles: Record<ToastData['variant'], string> = {
  success: 'border-green-500/30 bg-green-950/50 dark:bg-green-950/30',
  error: 'border-red-500/30 bg-red-950/50 dark:bg-red-950/30',
  warning: 'border-yellow-500/30 bg-yellow-950/50 dark:bg-yellow-950/30',
  info: 'border-blue-500/30 bg-blue-950/50 dark:bg-blue-950/30',
};

/* ────── Single Toast ────── */

interface ToastItemProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const duration = toast.duration ?? 5000;
  const role = toast.variant === 'error' || toast.variant === 'warning' ? 'alert' : 'status';

  const startDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  }, [onDismiss, toast.id]);

  const startTimer = useCallback(() => {
    if (duration > 0) {
      timerRef.current = setTimeout(startDismiss, duration);
    }
  }, [duration, startDismiss]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startTimer();
    return () => pauseTimer();
  }, [startTimer, pauseTimer]);

  return (
    <div
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
      className={cn(
        'pointer-events-auto w-full max-w-sm rounded-xl border p-4 shadow-lg',
        'transition-all duration-300',
        toastStyles[toast.variant],
        isExiting
          ? 'translate-x-full opacity-0'
          : 'motion-safe:animate-in motion-safe:slide-in-from-right motion-safe:duration-300 translate-x-0 opacity-100',
      )}
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0 mt-0.5">{toastIcons[toast.variant]}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary">{toast.title}</p>
          {toast.description && (
            <p className="mt-1 text-sm text-text-secondary">{toast.description}</p>
          )}
          {toast.action && (
            <button
              type="button"
              onClick={toast.action.onClick}
              className="mt-2 text-sm font-medium text-accent-500 hover:text-accent-400 transition-colors"
              aria-label={toast.action.label}
            >
              {toast.action.label}
            </button>
          )}
        </div>
        {(toast.isDismissible ?? true) && (
          <button
            type="button"
            onClick={() => startDismiss()}
            className="shrink-0 rounded-lg p-1 text-text-tertiary hover:text-text-primary transition-colors"
            aria-label="Dismiss notification"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/* ────── Provider ────── */

export interface ToastProviderProps {
  children: React.ReactNode;
  /** Maximum number of visible toasts */
  maxToasts?: number;
}

let toastCounter = 0;

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback(
    (input: AddToastInput) => {
      const id = `toast-${++toastCounter}-${Date.now()}`;
      setToasts((prev) => [...prev.slice(-(maxToasts - 1)), { ...input, id }]);
    },
    [maxToasts],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Toast container — top-right */}
      <div
        aria-label="Notifications"
        className="fixed top-4 right-4 z-[70] flex flex-col gap-3 pointer-events-none"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
