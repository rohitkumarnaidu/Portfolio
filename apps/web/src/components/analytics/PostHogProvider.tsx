'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useConsent } from '@/lib/analytics/consent';
import {
  getPostHog,
  initPostHog,
  isPostHogConfigured,
  shutdownPostHog,
} from '@/lib/analytics/posthog';

/**
 * Initializes PostHog only after consent is granted and captures a `$pageview`
 * on every App Router navigation. Renders nothing.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { consent, ready } = useConsent();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);

  // Initialize / tear down based on consent.
  useEffect(() => {
    if (!ready) return;

    if (consent === 'granted' && isPostHogConfigured()) {
      void initPostHog().then((ph) => {
        if (ph) initializedRef.current = true;
      });
    } else if (consent === 'denied') {
      shutdownPostHog();
      initializedRef.current = false;
    }
  }, [consent, ready]);

  // Capture pageviews on route change (consent-gated).
  useEffect(() => {
    if (consent !== 'granted') return;
    if (typeof window === 'undefined') return;

    const ph = getPostHog();
    if (!ph) return;

    const search = searchParams?.toString();
    const url = search ? `${pathname}?${search}` : pathname;
    try {
      ph.capture('$pageview', { $current_url: window.location.origin + url });
    } catch {
      /* ignore */
    }
  }, [pathname, searchParams, consent]);

  return <>{children}</>;
}
