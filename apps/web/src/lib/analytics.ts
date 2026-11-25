import type { PostHog } from 'posthog-js';

const REF_PATTERN = /^[a-z0-9_-]{1,32}$/i;
const QUEUE_LIMIT = 20;

let client: PostHog | null = null;
let initStarted = false;
let ref: string | null | undefined;
const queue: Array<{ event: string; properties: Record<string, unknown> }> = [];

export function getRef(): string | null {
  if (ref !== undefined) return ref;
  if (typeof window === 'undefined') return (ref = null);
  const value = new URLSearchParams(window.location.search).get('ref')?.trim().toLowerCase() ?? '';
  return (ref = REF_PATTERN.test(value) ? value : null);
}

export function initAnalytics(): Promise<void> {
  if (initStarted || typeof window === 'undefined') return Promise.resolve();
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return Promise.resolve();
  initStarted = true;
  return import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(key, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        persistence: 'memory',
        autocapture: false,
        capture_pageview: true,
        disable_session_recording: true,
        person_profiles: 'never',
        respect_dnt: true,
      });
      client = posthog;
      for (const item of queue.splice(0)) posthog.capture(item.event, item.properties);
    })
    .catch(() => {
      // Analytics must never break the page.
    });
}

/**
 * Records one cookieless event. Callers must pass analytics-safe scalar
 * properties only: the object is forwarded to PostHog verbatim, so never pass
 * user content, secrets, or nested/oversized payloads.
 */
export function track(event: string, properties: Record<string, unknown> = {}): void {
  const payload = { ...properties, ref: getRef() ?? 'direct' };
  if (client) {
    client.capture(event, payload);
    return;
  }
  if (initStarted && queue.length < QUEUE_LIMIT) {
    queue.push({ event, properties: payload });
  }
}

export function resetAnalyticsForTests(): void {
  client = null;
  initStarted = false;
  ref = undefined;
  queue.length = 0;
}
