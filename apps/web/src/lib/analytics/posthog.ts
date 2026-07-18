import type posthogDefault from 'posthog-js';

type PostHogClient = typeof posthogDefault;

let client: PostHogClient | null = null;
let initializing: Promise<PostHogClient | null> | null = null;

export function isPostHogConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
}

export function getPostHog(): PostHogClient | null {
  return client;
}

/**
 * Lazily import and initialize posthog-js. Safe to call multiple times — it
 * only initializes once. Returns null (without throwing) when no key is
 * configured or when running on the server, so callers can degrade gracefully.
 */
export async function initPostHog(): Promise<PostHogClient | null> {
  if (typeof window === 'undefined') return null;
  if (client) return client;
  if (!isPostHogConfigured()) return null;
  if (initializing) return initializing;

  initializing = import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        // We handle pageviews manually on route change.
        capture_pageview: false,
        capture_pageleave: true,
        autocapture: true,
        persistence: 'localStorage+cookie',
      });
      client = posthog;
      return posthog;
    })
    .catch(() => null);

  return initializing;
}

/**
 * Tear down PostHog when consent is withdrawn: opt the user out and stop
 * further capture. The underlying client instance may linger, so we also flip
 * our reference so `capture` calls become no-ops.
 */
export function shutdownPostHog() {
  if (client) {
    try {
      client.opt_out_capturing?.();
    } catch {
      /* ignore */
    }
  }
  client = null;
  initializing = null;
}
