import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import posthog from 'posthog-js';
import { getRef, initAnalytics, resetAnalyticsForTests, track } from '@/lib/analytics';

/**
 * Pins the cookieless analytics contract: no key means no init, the init
 * options keep PostHog in memory only, `?ref` is a validated/stateless
 * attribution value, and events never fire before init. PostHog itself is
 * dynamically imported, so init is async and track() queues briefly while the
 * chunk loads.
 */

vi.mock('posthog-js', () => ({ default: { init: vi.fn(), capture: vi.fn() } }));

const initMock = vi.mocked(posthog.init);
const captureMock = vi.mocked(posthog.capture);

const KEY_ENV = 'NEXT_PUBLIC_POSTHOG_KEY';
const HOST_ENV = 'NEXT_PUBLIC_POSTHOG_HOST';
const originalKey = process.env[KEY_ENV];
const originalHost = process.env[HOST_ENV];

function setQuery(refValue?: string) {
  const url = refValue === undefined ? '/' : `/?ref=${encodeURIComponent(refValue)}`;
  window.history.replaceState({}, '', url);
}

beforeEach(() => {
  // The module caches `ref` after the first read, so every case starts clean.
  resetAnalyticsForTests();
  vi.clearAllMocks();
  delete process.env[KEY_ENV];
  delete process.env[HOST_ENV];
  setQuery();
});

afterAll(() => {
  if (originalKey === undefined) delete process.env[KEY_ENV];
  else process.env[KEY_ENV] = originalKey;
  if (originalHost === undefined) delete process.env[HOST_ENV];
  else process.env[HOST_ENV] = originalHost;
});

describe('initAnalytics', () => {
  it('does not initialise PostHog without a key', async () => {
    await initAnalytics();

    expect(initMock).not.toHaveBeenCalled();
  });

  it('initialises once with the cookieless config and the default host', async () => {
    process.env[KEY_ENV] = 'phc_test_key';

    await initAnalytics();
    await initAnalytics();

    expect(initMock).toHaveBeenCalledTimes(1);
    expect(initMock).toHaveBeenCalledWith(
      'phc_test_key',
      expect.objectContaining({
        api_host: 'https://us.i.posthog.com',
        persistence: 'memory',
        autocapture: false,
        capture_pageview: true,
        disable_session_recording: true,
        person_profiles: 'never',
        respect_dnt: true,
      }),
    );
  });

  it('uses the host from the environment when one is set', async () => {
    process.env[KEY_ENV] = 'phc_test_key';
    process.env[HOST_ENV] = 'https://eu.i.posthog.com';

    await initAnalytics();

    expect(initMock).toHaveBeenCalledWith(
      'phc_test_key',
      expect.objectContaining({ api_host: 'https://eu.i.posthog.com' }),
    );
  });

  it('does not touch posthog until the dynamic import settles', async () => {
    process.env[KEY_ENV] = 'phc_test_key';

    const pending = initAnalytics();
    expect(initMock).not.toHaveBeenCalled();

    await pending;
    expect(initMock).toHaveBeenCalledTimes(1);
  });
});

describe('getRef', () => {
  it('lowercases the ?ref value', () => {
    setQuery('LinkedIn');

    expect(getRef()).toBe('linkedin');
  });

  it('returns null when ?ref is missing', () => {
    expect(getRef()).toBeNull();
  });

  it('rejects values outside the slug pattern', () => {
    setQuery('<script>');

    expect(getRef()).toBeNull();
  });

  it('rejects values longer than 32 characters', () => {
    setQuery('a'.repeat(33));

    expect(getRef()).toBeNull();
  });

  it('accepts a value of exactly 32 characters', () => {
    const value = 'b'.repeat(32);
    setQuery(value);

    expect(getRef()).toBe(value);
  });

  it('caches the first read until the test reset clears it', () => {
    setQuery('linkedin');
    expect(getRef()).toBe('linkedin');

    setQuery('newsletter');
    expect(getRef()).toBe('linkedin');

    resetAnalyticsForTests();
    expect(getRef()).toBe('newsletter');
  });
});

describe('track', () => {
  it('is a no-op before init', () => {
    track('resume_download', { format: 'pdf' });

    expect(captureMock).not.toHaveBeenCalled();
  });

  it('forwards the event, its properties, and ref: direct when no ?ref is present', async () => {
    process.env[KEY_ENV] = 'phc_test_key';
    await initAnalytics();

    track('resume_download', { format: 'pdf' });

    expect(captureMock).toHaveBeenCalledTimes(1);
    expect(captureMock).toHaveBeenCalledWith('resume_download', {
      format: 'pdf',
      ref: 'direct',
    });
  });

  it('attributes the event to ?ref when one is present', async () => {
    setQuery('linkedin');
    process.env[KEY_ENV] = 'phc_test_key';
    await initAnalytics();

    track('demo_click', { project: 'scholarform' });

    expect(captureMock).toHaveBeenCalledWith('demo_click', {
      project: 'scholarform',
      ref: 'linkedin',
    });
  });

  it('delivers an event tracked while the dynamic import is in flight', async () => {
    process.env[KEY_ENV] = 'phc_test_key';

    const pending = initAnalytics();
    track('resume_download', { format: 'pdf' });
    await pending;

    expect(captureMock).toHaveBeenCalledTimes(1);
    expect(captureMock).toHaveBeenCalledWith('resume_download', {
      format: 'pdf',
      ref: 'direct',
    });
  });

  it('does not queue events tracked before init is ever called', async () => {
    process.env[KEY_ENV] = 'phc_test_key';

    track('resume_download', { format: 'pdf' });
    await initAnalytics();

    expect(captureMock).not.toHaveBeenCalled();
  });
});
