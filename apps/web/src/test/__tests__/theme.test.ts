import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  SCHEME_KEY,
  LEGACY_KEY,
  DEFAULT_SCHEME,
  DEFAULT_SKIN,
  resolveStored,
  persist,
  applyToDocument,
} from '@/lib/theme';
import { THEME_SCRIPT } from '@/lib/theme-script';

/**
 * Hermetic localStorage mock (same pattern as hooks.test.tsx) with a
 * file-local store that `beforeEach` wipes, so the resolve chain starts
 * from a known state in every test.
 */
const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
  }),
  clear: vi.fn(() => {
    Object.keys(store).forEach((k) => delete store[k]);
  }),
  key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  get length() {
    return Object.keys(store).length;
  },
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  configurable: true,
});

/** Install a `matchMedia` mock whose `(prefers-color-scheme: dark)` result is
 * controllable per test. Assignment (not defineProperty) so it composes with
 * the global setup mock, which is writable. Passing `null` removes the API
 * entirely to simulate a browser without matchMedia. */
function installMatchMedia(matches: boolean | null) {
  if (matches === null) {
    (window as { matchMedia?: unknown }).matchMedia = undefined;
    return;
  }
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

beforeEach(() => {
  mockLocalStorage.clear();
  // Drop any pf_theme cookie a previous test wrote (jsdom documents persist
  // across tests within a file).
  document.cookie = 'pf_theme=; Max-Age=0; path=/';
  installMatchMedia(false);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('theme constants', () => {
  it('pins the storage keys and defaults', () => {
    expect(SCHEME_KEY).toBe('pf.theme');
    expect(LEGACY_KEY).toBe('theme');
    expect(DEFAULT_SCHEME).toBe('dark');
    expect(DEFAULT_SKIN).toBe('3');
  });
});

describe('resolveStored', () => {
  it('reads scheme+skin from a valid pf.theme entry', () => {
    localStorage.setItem(SCHEME_KEY, JSON.stringify({ scheme: 'light', skin: '2' }));
    expect(resolveStored()).toEqual({ scheme: 'light', skin: '2' });
  });

  it('falls through to the OS preference when pf.theme is invalid JSON', () => {
    localStorage.setItem(SCHEME_KEY, '{not json');
    installMatchMedia(false);
    expect(resolveStored()).toEqual({ scheme: 'light', skin: DEFAULT_SKIN });
  });

  it('falls through when pf.theme has an invalid scheme value', () => {
    localStorage.setItem(SCHEME_KEY, JSON.stringify({ scheme: 'blue', skin: '3' }));
    installMatchMedia(true);
    expect(resolveStored()).toEqual({ scheme: 'dark', skin: DEFAULT_SKIN });
  });

  it('falls through when pf.theme has an invalid skin value', () => {
    localStorage.setItem(SCHEME_KEY, JSON.stringify({ scheme: 'dark', skin: '9' }));
    installMatchMedia(false);
    expect(resolveStored()).toEqual({ scheme: 'light', skin: DEFAULT_SKIN });
  });

  it('adopts the legacy theme key and migrates it to pf.theme', () => {
    localStorage.setItem(LEGACY_KEY, 'dark');
    expect(resolveStored()).toEqual({ scheme: 'dark', skin: DEFAULT_SKIN });
    expect(JSON.parse(localStorage.getItem(SCHEME_KEY) ?? '')).toEqual({
      scheme: 'dark',
      skin: DEFAULT_SKIN,
    });
  });

  it('migrated legacy theme also lands in the pf_theme cookie', () => {
    localStorage.setItem(LEGACY_KEY, 'dark');
    resolveStored();
    expect(document.cookie).toContain('pf_theme=dark.3');
  });

  it('falls through on a garbage legacy value', () => {
    localStorage.setItem(LEGACY_KEY, 'blue');
    installMatchMedia(true);
    expect(resolveStored()).toEqual({ scheme: 'dark', skin: DEFAULT_SKIN });
  });

  it('respects an empty-string legacy value as garbage', () => {
    localStorage.setItem(LEGACY_KEY, '');
    installMatchMedia(false);
    expect(resolveStored()).toEqual({ scheme: 'light', skin: DEFAULT_SKIN });
  });

  it('returns light when the OS prefers light (empty storage)', () => {
    installMatchMedia(false);
    expect(resolveStored()).toEqual({ scheme: 'light', skin: DEFAULT_SKIN });
  });

  it('returns dark when the OS prefers dark (empty storage)', () => {
    installMatchMedia(true);
    expect(resolveStored()).toEqual({ scheme: 'dark', skin: DEFAULT_SKIN });
  });

  it('returns the defaults when matchMedia is unavailable', () => {
    installMatchMedia(null);
    expect(resolveStored()).toEqual({ scheme: DEFAULT_SCHEME, skin: DEFAULT_SKIN });
  });

  it('returns the defaults on the server (no window)', () => {
    vi.stubGlobal('window', undefined);
    try {
      expect(resolveStored()).toEqual({ scheme: DEFAULT_SCHEME, skin: DEFAULT_SKIN });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('persist', () => {
  it('writes the pf.theme JSON entry and the pf_theme cookie', () => {
    persist('dark', '2');
    expect(JSON.parse(localStorage.getItem(SCHEME_KEY) ?? '')).toEqual({
      scheme: 'dark',
      skin: '2',
    });
    expect(document.cookie).toContain('pf_theme=dark.2');
  });
});

describe('applyToDocument', () => {
  it('sets data-scheme, data-skin and the legacy data-theme mirror', () => {
    applyToDocument('light', '2');
    const root = document.documentElement;
    expect(root.getAttribute('data-scheme')).toBe('light');
    expect(root.getAttribute('data-skin')).toBe('2');
    expect(root.getAttribute('data-theme')).toBe('light');
  });
});

describe('THEME_SCRIPT', () => {
  // The pre-paint script is hand-written vanilla JS (it runs before any
  // module system), so behavioral parity with resolveStored is asserted via
  // markers here and end-to-end by e2e/theme-no-flash.spec.ts, which runs
  // the real script.
  it('contains the parity markers for the resolve chain', () => {
    expect(THEME_SCRIPT).toContain('data-scheme');
    expect(THEME_SCRIPT).toContain('data-skin');
    expect(THEME_SCRIPT).toContain('data-theme');
    expect(THEME_SCRIPT).toContain('prefers-color-scheme');
    expect(THEME_SCRIPT).toContain('pf.theme');
    expect(THEME_SCRIPT).toContain("'theme'");
  });
});
