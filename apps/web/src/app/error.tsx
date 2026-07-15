'use client';

import React, { useEffect } from 'react';
import { Button } from '@portfolio/ui';

/**
 * Root Error Boundary
 * Catches any unhandled errors in server or client components.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry (Phase 11)
    console.error('Unhandled Root Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-[70vh] items-center justify-center px-4 text-center">
      <div className="max-w-md w-full space-y-6 bg-surface-secondary p-8 rounded-2xl border border-border-primary shadow-xl">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-text-primary">Something went wrong</h2>

        <p className="text-text-secondary text-sm">
          An unexpected error occurred while rendering this page. The issue has been logged.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="primary" onClick={() => reset()} fullWidth>
            Try again
          </Button>
          <Button variant="secondary" onClick={() => (window.location.href = '/')} fullWidth>
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
