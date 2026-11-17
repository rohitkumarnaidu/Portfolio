/**
 * Theme resolution, persistence and application for the dual-attribute token
 * system (Phase 0): `data-scheme` ('light' | 'dark') + `data-skin` ('1'..'3'),
 * with a legacy `data-theme` mirror kept in sync so the existing Tailwind
 * `darkMode: ['selector', '[data-theme="dark"]']` config and the current
 * `globals.css` token blocks keep working unchanged (the mirror is deleted in
 * Phase 1 together with the alias bridge).
 *
 * This module is pure logic: no React, and the only DOM write is
 * `applyToDocument`. The inline pre-paint boot lives in `theme-script.ts` as
 * hand-written vanilla JS — it runs before any module system loads, so it
 * deliberately shares no code with this module.
 */

export type Scheme = 'light' | 'dark';
export type Skin = '1' | '2' | '3';

/** localStorage entry holding `{ scheme, skin }` as JSON. */
export const SCHEME_KEY = 'pf.theme';
/** Legacy string-only key ('light' | 'dark'). Read-only: adopted, then migrated. */
export const LEGACY_KEY = 'theme';

export const DEFAULT_SCHEME: Scheme = 'dark';
export const DEFAULT_SKIN: Skin = '3';

const SCHEMES: readonly string[] = ['light', 'dark'];
const SKINS: readonly string[] = ['1', '2', '3'];

const COOKIE_NAME = 'pf_theme';
const COOKIE_MAX_AGE = 31536000; // one year, in seconds

function isScheme(value: unknown): value is Scheme {
  return SCHEMES.includes(value as string);
}

function isSkin(value: unknown): value is Skin {
  return SKINS.includes(value as string);
}

/**
 * Resolve the active theme. localStorage can hold anything and browser APIs
 * can be blocked, so every link is validated and every access is guarded;
 * an invalid entry falls through to the next link instead of throwing.
 *
 * Chain: `pf.theme` (validated JSON) → legacy `theme` (exact 'light'/'dark',
 * adopted + migrated) → OS `prefers-color-scheme` → defaults.
 */
export function resolveStored(): { scheme: Scheme; skin: Skin } {
  // Server render: no storage, no matchMedia — straight to the defaults.
  if (typeof window === 'undefined') {
    return { scheme: DEFAULT_SCHEME, skin: DEFAULT_SKIN };
  }

  // 1. pf.theme — JSON `{ scheme, skin }`; both values must be valid.
  try {
    const raw = window.localStorage.getItem(SCHEME_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { scheme?: unknown; skin?: unknown } | null;
      if (parsed && isScheme(parsed.scheme) && isSkin(parsed.skin)) {
        return { scheme: parsed.scheme, skin: parsed.skin };
      }
    }
  } catch {
    // Corrupt JSON or blocked storage — fall through.
  }

  // 2. Legacy 'theme' key — only the exact scheme strings are adopted.
  //    Adoption resolves with the default skin and migrates immediately, so
  //    the legacy key is only ever read once per browser.
  try {
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy === 'light' || legacy === 'dark') {
      persist(legacy, DEFAULT_SKIN);
      return { scheme: legacy, skin: DEFAULT_SKIN };
    }
  } catch {
    // Blocked storage — fall through.
  }

  // 3. OS preference.
  try {
    if (typeof window.matchMedia === 'function') {
      const scheme: Scheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      return { scheme, skin: DEFAULT_SKIN };
    }
  } catch {
    // matchMedia unavailable or threw — fall through.
  }

  // 4. Defaults.
  return { scheme: DEFAULT_SCHEME, skin: DEFAULT_SKIN };
}

/**
 * Persist the theme: the `pf.theme` localStorage entry (JSON) plus a
 * `pf_theme=<scheme>.<skin>` cookie. The cookie lets a future server-side
 * read resolve the theme before HTML is served. Each write is guarded
 * independently so one failing surface can't block the other.
 */
export function persist(scheme: Scheme, skin: Skin): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  try {
    window.localStorage.setItem(SCHEME_KEY, JSON.stringify({ scheme, skin }));
  } catch {
    // Storage blocked or full — the cookie below still applies.
  }

  try {
    // `path=/` keeps the value visible on every route (the default-path
    // algorithm would otherwise scope it to the directory of the page the
    // toggle was clicked on).
    document.cookie = `${COOKIE_NAME}=${scheme}.${skin}; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax; path=/`;
  } catch {
    // Cookies blocked — localStorage above still applies.
  }
}

/**
 * Apply the theme to the document: `data-scheme` + `data-skin` on
 * `<html>`, plus the `data-theme` legacy mirror.
 */
export function applyToDocument(scheme: Scheme, skin: Skin): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.setAttribute('data-scheme', scheme);
  root.setAttribute('data-skin', skin);
  // Legacy mirror — keep in sync with data-scheme (deleted in Phase 1).
  root.setAttribute('data-theme', scheme);
}
