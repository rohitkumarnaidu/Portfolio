import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../src/build.mjs';
import tokens from '../tokens.json' with { type: 'json' };

// One temp root per run, per-purpose subdirs inside it; cleaned up at exit.
const tmpRoot = mkdtempSync(join(tmpdir(), 'pf-theme-tokens-'));
after(() => rmSync(tmpRoot, { recursive: true, force: true }));
const out = (name) => join(tmpRoot, name);

// Ruling 6, restated for the naming assertions: `--pf-` + dotted-path-to-kebab.
const kebab = (path) => path.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`).replace(/\./g, '-');

// Blocks are flat (no blank lines inside), so the first "\n\n" after the
// selector marks the end of that block.
function blockAt(css, selector) {
  const start = css.indexOf(selector);
  assert.notEqual(start, -1, `missing block starting with ${JSON.stringify(selector)}`);
  const end = css.indexOf('\n\n', start);
  return css.slice(start, end === -1 ? css.length : end);
}

const schemeBlock = (css, scheme) => blockAt(css, `[data-scheme='${scheme}'][data-skin='3']`);

test('emits both scheme blocks with locked values', () => {
  const css = build({ outDir: out('verbatim') });
  assert.match(css, /\[data-scheme='dark'\]\[data-skin='3'\]/);
  assert.match(css, /--pf-surface-base:\s*#0A0C10/); // dark surface.base
  assert.match(css, /--pf-accent-link:\s*#D68A54/); // dark link steps to ember-400
  assert.match(css, /--pf-dur-tap:\s*120ms/);
  assert.match(css, /prefers-reduced-motion/);
});

test('output is byte-deterministic', () => {
  assert.equal(build({ outDir: out('a') }), build({ outDir: out('b') })); // two runs, identical bytes
});

test('null accent.traceHalo.light is omitted; dark keeps it', () => {
  const css = build();
  const light = schemeBlock(css, 'light');
  const dark = schemeBlock(css, 'dark');
  assert.ok(!light.includes('--pf-accent-trace-halo'), 'light block must not emit a null token');
  assert.match(dark, /--pf-accent-trace-halo:\s*#E3A87C/);
});

test('status and viz constants appear in both scheme blocks', () => {
  const css = build();
  for (const scheme of ['light', 'dark']) {
    const block = schemeBlock(css, scheme);
    assert.equal((block.match(/--pf-status-[a-z]+:/g) ?? []).length, 4);
    assert.equal((block.match(/--pf-viz-\d+:/g) ?? []).length, 8);
    // Spot-check one of each — values are scheme-constant.
    assert.match(block, /--pf-status-success:\s*#2E9E6D/);
    assert.match(block, /--pf-viz-1:\s*#2F5FD1/);
  }
});

test('all motion tokens live at :root; durations collapse under prefers-reduced-motion', () => {
  const css = build();
  const root = blockAt(css, '\n:root {');
  assert.match(root, /--pf-dur-tap:\s*120ms/);
  assert.match(root, /--pf-dur-transition:\s*200ms/);
  assert.match(root, /--pf-dur-reveal:\s*350ms/);
  assert.match(root, /--pf-ease-out:\s*cubic-bezier\(0\.2, 0, 0, 1\)/);
  assert.match(root, /--pf-ease-spring:\s*cubic-bezier\(0\.35, 0, 0\.1, 1\)/);
  assert.match(root, /--pf-reduced-motion-fade:\s*120ms/);

  // The override is var()-indirected on purpose (ruling 4): the fade token
  // itself stays emitted at :root — never flattened to literal 120ms.
  const media = blockAt(css, '@media (prefers-reduced-motion: reduce)');
  assert.match(media, /--pf-dur-tap:\s*var\(--pf-reduced-motion-fade\)/);
  assert.match(media, /--pf-dur-transition:\s*var\(--pf-reduced-motion-fade\)/);
  assert.match(media, /--pf-dur-reveal:\s*var\(--pf-reduced-motion-fade\)/);
});

test('every semantic token is emitted in its scheme block with kebab-case naming', () => {
  const css = build();
  for (const [group, tokensInGroup] of Object.entries(tokens.skins['3'].semantic)) {
    for (const [name, token] of Object.entries(tokensInGroup)) {
      const path = `${group}.${name}`;
      for (const scheme of ['light', 'dark']) {
        const block = schemeBlock(css, scheme);
        const value = token[scheme];
        if (value === null) {
          assert.ok(
            !block.includes(`--pf-${kebab(path)}`),
            `${path} is null for ${scheme} and must be omitted`,
          );
        } else {
          assert.ok(
            block.includes(`--pf-${kebab(path)}: ${value};`),
            `${path} (${scheme}) must emit --pf-${kebab(path)}: ${value};`,
          );
        }
      }
    }
  }
});

test('build({ outDir }) writes <outDir>/theme-tokens.css, creating the directory', () => {
  const dir = out('nested/write/dir');
  const css = build({ outDir: dir });
  assert.equal(readFileSync(join(dir, 'theme-tokens.css'), 'utf8'), css);
});

test('CLI regenerates the committed dist file byte-for-byte from any cwd', () => {
  const distCss = fileURLToPath(new URL('../dist/theme-tokens.css', import.meta.url));
  const before = readFileSync(distCss, 'utf8');
  execFileSync(process.execPath, [fileURLToPath(new URL('../src/build.mjs', import.meta.url))], {
    // Deliberately not the package dir — the output path must resolve from the
    // module file, never the cwd (ruling 3).
    cwd: tmpdir(),
  });
  const after = readFileSync(distCss, 'utf8');
  assert.equal(after, before, 'CLI run must reproduce the committed dist byte-for-byte');
  assert.equal(after, build());
});
