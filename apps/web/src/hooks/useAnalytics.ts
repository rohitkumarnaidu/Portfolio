'use client';

import { useCallback } from 'react';
import { trackAnalyticsEvent } from '@/lib/api';
import { useConsent } from '@/lib/analytics/consent';
import { getPostHog } from '@/lib/analytics/posthog';
import { getSessionId, getVisitorId } from '@/lib/analytics/visitor';
import type { AnalyticsEventName, AnalyticsEventProps } from '@/lib/analytics/events';

type TrackArgs<E extends AnalyticsEventName> =
  Record<string, never> extends AnalyticsEventProps<E>
    ? [event: E, props?: AnalyticsEventProps<E>]
    : [event: E, props: AnalyticsEventProps<E>];

/**
 * Type-safe analytics facade.
 *
 * `track` fans out to two sinks:
 *  1. PostHog (only when initialized + consent granted), and
 *  2. the backend analytics endpoint (always, for first-party capture).
 *
 * Both sinks are fire-and-forget and never throw into the caller.
 */
export function useAnalytics() {
  const { consent } = useConsent();

  const track = useCallback(
    <E extends AnalyticsEventName>(...args: TrackArgs<E>) => {
      const [event, props] = args;
      const properties = (props ?? {}) as Record<string, unknown>;

      if (typeof window === 'undefined') return;

      // (a) PostHog — consent-gated.
      if (consent === 'granted') {
        try {
          getPostHog()?.capture(event, properties);
        } catch {
          /* never break the UI on analytics failure */
        }
      }

      // (b) First-party backend endpoint — always send.
      const pageUrl = window.location.pathname;
      void trackAnalyticsEvent({
        eventName: event,
        pageUrl,
        sessionId: getSessionId(),
        visitorId: getVisitorId(),
        userAgent: navigator.userAgent?.slice(0, 500),
        properties,
      }).catch(() => {
        /* swallow — backend analytics is best-effort */
      });
    },
    [consent],
  );

  return { track };
}
