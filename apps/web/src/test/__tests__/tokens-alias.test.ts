import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Alias-drift guard: every `--pf-*` custom property the web stylesheets
 * consume in `var(...)` must be emitted by the token generator into
 * `packages/tokens/dist/theme-tokens.css`. A renamed or dropped token would
 * otherwise degrade silently to an unresolved custom property.
 *
 * `npm test` runs from `apps/web` (the workspace root), so `process.cwd()`
 * anchors both the stylesheets and the generated dist file.
 */
const STYLESHEETS = ['src/styles/globals.css', 'src/styles/public.css'];
const DIST = resolve(process.cwd(), '../../packages/tokens/dist/theme-tokens.css');

const read = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), 'utf8');

const collectReferenced = () => {
  const names = new Set<string>();
  for (const file of STYLESHEETS) {
    for (const match of read(file).matchAll(/var\(\s*(--pf-[a-z0-9-]+)/g)) {
      names.add(match[1]);
    }
  }
  return names;
};

const collectDefined = () => {
  const names = new Set<string>();
  for (const match of readFileSync(DIST, 'utf8').matchAll(/(--pf-[a-z0-9-]+)\s*:/g)) {
    names.add(match[1]);
  }
  return names;
};

describe('token alias drift', () => {
  it('every referenced --pf-* token is defined in the generated theme CSS', () => {
    const referenced = [...collectReferenced()].sort();
    const defined = collectDefined();
    const missing = referenced.filter((name) => !defined.has(name));

    // Measured baseline: 42 referenced / 65 defined / 0 missing. The count
    // floor keeps the guard from passing vacuously if both sides disappear.
    expect(referenced.length).toBeGreaterThanOrEqual(42);
    expect(missing).toEqual([]);
  });
});
