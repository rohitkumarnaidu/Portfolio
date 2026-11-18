import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { scanForHex, HEX_PATTERN } from '../src/check-no-hex.mjs';

// The guard is the enforcement half of §3.7 criterion 1: tokens are the only
// source. Each test gets its own temp tree shaped like the repo so
// `scanForHex` walks it with the real target list.

const roots = [];
after(() => roots.forEach((root) => rmSync(root, { recursive: true, force: true })));

function fixtureRoot() {
  const root = mkdtempSync(join(tmpdir(), 'pf-no-hex-'));
  roots.push(root);
  return root;
}

function fixture(root, relativePath, contents) {
  const file = join(root, relativePath);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, contents);
}

test('flags six-, three-, four- and eight-digit hex colors', () => {
  const root = fixtureRoot();
  fixture(
    root,
    'apps/web/src/styles/bad.css',
    [
      '.a { color: #FF0055; }',
      '.b { color: #abc; }',
      '.c { color: #abcd; }',
      '.d { color: #11223344; }',
    ].join('\n'),
  );
  const values = scanForHex(root).map((violation) => violation.value);
  assert.deepEqual(values, ['#FF0055', '#abc', '#abcd', '#11223344']);
});

test('reports file, line and column', () => {
  const root = fixtureRoot();
  fixture(root, 'apps/web/src/bad.tsx', 'const a = 1;\nconst color = "#123456";\n');
  assert.deepEqual(scanForHex(root), [
    { file: 'apps/web/src/bad.tsx', line: 2, column: 16, value: '#123456' },
  ]);
});

test('ignores token references, anchors and non-color fragments', () => {
  const root = fixtureRoot();
  fixture(
    root,
    'apps/web/src/good.tsx',
    [
      'const a = "var(--pf-public-paper)";',
      'const b = "#main-content";',
      'const c = "issue #12345";',
      'const d = "foo#abcdef";',
    ].join('\n'),
  );
  assert.deepEqual(scanForHex(root), []);
});

test('scans Tailwind config and skips ignored directories', () => {
  const root = fixtureRoot();
  fixture(root, 'apps/web/tailwind.config.ts', "background: '#0e0e11',");
  fixture(root, 'apps/web/src/node_modules/pkg/index.css', '.x { color: #000; }');
  fixture(root, 'apps/web/src/.next/static/app.css', '.y { color: #000; }');
  fixture(root, 'packages/ui/src/button.tsx', "const c = '#ffffff';");
  fixture(root, 'packages/shared/src/theme.ts', "const c = '#ffffff';");
  const files = scanForHex(root).map((violation) => violation.file);
  assert.deepEqual(files, [
    'packages/ui/src/button.tsx',
    'packages/shared/src/theme.ts',
    'apps/web/tailwind.config.ts',
  ]);
});

test('HEX_PATTERN does not match a hex-looking word inside an identifier', () => {
  assert.equal([...'foo#abcdef'.matchAll(HEX_PATTERN)].length, 0);
  assert.equal([...'#abcdef'.matchAll(HEX_PATTERN)].length, 1);
});
