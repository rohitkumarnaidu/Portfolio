/**
 * Pre-paint theme boot — the single source of truth for the no-flash inline
 * script injected in `layout.tsx`'s `<head>`.
 *
 * This is hand-written vanilla JS exported as a plain string on purpose: it
 * runs inline before any module system or bundle loads, so it CANNOT import
 * from `theme.ts` (and nothing is build-time inlined). Keep it in lockstep
 * with `resolveStored()` + `applyToDocument()`; the unit suite asserts
 * parity markers only, and the Playwright suite (`e2e/theme-no-flash.spec.ts`)
 * runs the real script end to end.
 *
 * Chain (identical to `resolveStored`, equally defensive, everything inside
 * one outer try/catch):
 *   1. `pf.theme` — JSON `{ scheme, skin }`, both values validated.
 *   2. Legacy `theme` — exact 'light'/'dark' only; adopted with the default
 *      skin and migrated (writes `pf.theme` + the `pf_theme` cookie).
 *   3. OS `prefers-color-scheme`.
 *   4. Defaults (dark / skin 3).
 * Then sets `data-scheme` + `data-skin` + the `data-theme` legacy mirror on
 * `document.documentElement`.
 */
export const THEME_SCRIPT = `(function () {
  try {
    var scheme = null;
    var skin = null;
    try {
      var raw = localStorage.getItem('pf.theme');
      if (raw) {
        var parsed = JSON.parse(raw);
        if (
          parsed &&
          (parsed.scheme === 'light' || parsed.scheme === 'dark') &&
          (parsed.skin === '1' || parsed.skin === '2' || parsed.skin === '3')
        ) {
          scheme = parsed.scheme;
          skin = parsed.skin;
        }
      }
    } catch (e) {}
    if (scheme === null) {
      try {
        var legacy = localStorage.getItem('theme');
        if (legacy === 'light' || legacy === 'dark') {
          scheme = legacy;
          skin = '3';
          try {
            localStorage.setItem('pf.theme', JSON.stringify({ scheme: legacy, skin: '3' }));
          } catch (e2) {}
          try {
            document.cookie =
              'pf_theme=' + legacy + '.3; Max-Age=31536000; SameSite=Lax; path=/';
          } catch (e3) {}
        }
      } catch (e4) {}
    }
    if (scheme === null) {
      try {
        scheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } catch (e5) {
        scheme = 'dark';
      }
      skin = '3';
    }
    document.documentElement.setAttribute('data-scheme', scheme);
    document.documentElement.setAttribute('data-skin', skin);
    document.documentElement.setAttribute('data-theme', scheme);
  } catch (err) {}
})();`;
