'use client';

import { useEffect } from 'react';
import { initAnalytics } from '@/lib/analytics';

/**
 * Client-only bootstrap for cookieless PostHog. Renders nothing; it exists so
 * the public layout can stay a server component while analytics initialises
 * once after hydration.
 */
export function AnalyticsProvider() {
  useEffect(() => {
    void initAnalytics();
  }, []);

  return null;
}
