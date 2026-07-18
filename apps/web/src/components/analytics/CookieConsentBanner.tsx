'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@portfolio/ui';
import { cn } from '@/lib/utils';
import { useConsent } from '@/lib/analytics/consent';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function CookieConsentBanner() {
  const { consent, ready, grant, deny } = useConsent();
  const [reopened, setReopened] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Show the dialog on first visit, or when the visitor re-opens settings.
  const open = ready && (consent === undefined || reopened);

  const close = useCallback(() => {
    setReopened(false);
  }, []);

  // Focus management: trap focus inside the dialog while open, restore on close.
  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const node = dialogRef.current;
    const first = node?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        // ESC declines only when a choice hasn't been made yet; otherwise it
        // simply closes the re-opened settings panel.
        if (consent === undefined) {
          deny();
        } else {
          close();
        }
        return;
      }

      if (e.key !== 'Tab' || !node) return;
      const focusable = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (!firstEl || !lastEl) return;

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [open, consent, deny, close]);

  const handleAccept = () => {
    grant();
    close();
  };

  const handleDecline = () => {
    deny();
    close();
  };

  // Small floating button to re-open preferences after a decision was made.
  if (ready && consent !== undefined && !reopened) {
    return (
      <button
        type="button"
        onClick={() => setReopened(true)}
        className={cn(
          'fixed bottom-4 left-4 z-40 rounded-full p-2.5 shadow-lg',
          'glass-subtle border border-border-primary text-text-secondary',
          'hover:text-accent-500 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
        )}
        aria-label="Manage cookie preferences"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 008 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H2a2 2 0 110-4h.09A1.65 1.65 0 004.6 8a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V2a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H22a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"
          />
        </svg>
      </button>
    );
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 motion-safe:animate-fade-in-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
    >
      <div
        ref={dialogRef}
        className={cn(
          'w-full max-w-2xl rounded-2xl p-6 shadow-2xl',
          'glass-subtle border border-border-primary bg-surface-primary/95 backdrop-blur',
        )}
      >
        <h2 id="cookie-consent-title" className="text-lg font-medium text-text-primary">
          Cookie & analytics preferences
        </h2>
        <p id="cookie-consent-desc" className="mt-2 text-body-sm text-text-secondary">
          We use privacy-friendly analytics to understand how visitors use this site and improve it.
          You can accept, decline, or change your choice at any time. Declining keeps essential
          functionality only — no analytics cookies are set.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={handleDecline}>
            Decline
          </Button>
          <Button variant="secondary" onClick={handleAccept}>
            Analytics only
          </Button>
          <Button variant="primary" onClick={handleAccept}>
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
