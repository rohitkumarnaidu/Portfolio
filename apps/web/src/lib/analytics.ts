import posthog from 'posthog-js';

const REF_PATTERN = /^[a-z0-9_-]{1,32}$/i;
let initialized = false;
let ref: string | null | undefined;

export function getRef(): string | null {
  if (ref !== undefined) return ref;
  if (typeof window === 'undefined') return (ref = null);
  const value = new URLSearchParams(window.location.search).get('ref')?.trim().toLowerCase() ?? '';
  return (ref = REF_PATTERN.test(value) ? value : null);
}

export function initAnalytics(): void {
  if (initialized || typeof window === 'undefined') return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    persistence: 'memory',
    autocapture: false,
    capture_pageview: true,
    disable_session_recording: true,
    person_profiles: 'never',
    respect_dnt: true,
  });
  initialized = true;
}

export function track(event: string, properties: Record<string, unknown> = {}): void {
  if (!initialized) return;
  posthog.capture(event, { ...properties, ref: getRef() ?? 'direct' });
}

export function resetAnalyticsForTests(): void {
  initialized = false;
  ref = undefined;
}
