import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { evaluateBudget, run, LIMIT } from '../src/check-budget.mjs';

// ---------------------------------------------------------------------------
// TDD arc (task 8):
//   RED   — this file was written BEFORE check-budget.mjs existed; the import
//           above failed with ERR_MODULE_NOT_FOUND (Cannot find module
//           '.../src/check-budget.mjs').
//   GREEN — check-budget.mjs implemented; every fixture below and the
//           real-dist contract test pass.
// ---------------------------------------------------------------------------

// Budget unit is PER SKIN (controller ruling 15): a skin ships both its light
// and dark blocks, so their raw bytes are summed and the < 8192 limit applies
// to that sum — not to each scheme block.
const skinSelector = (skin, scheme) => `[data-scheme='${scheme}'][data-skin='${skin}']`;
const FIXTURE_TAIL = ';\n}';

/**
 * Build a CSS rule whose measured size (selector through closing brace,
 * surrounding whitespace excluded) is exactly `size` UTF-8 bytes.
 */
function blockOfSize(selector, size) {
  const head = `${selector} {\n  --pf-filler: `;
  const padding = size - Buffer.byteLength(head + FIXTURE_TAIL, 'utf8');
  assert.ok(padding > 0, `fixture size ${size} is too small for selector ${selector}`);
  const block = head + 'x'.repeat(padding) + FIXTURE_TAIL;
  assert.equal(
    Buffer.byteLength(block, 'utf8'),
    size,
    `fixture for ${selector} is exactly ${size} bytes`,
  );
  return block;
}

const skinBlock = (skin, scheme, size) => blockOfSize(skinSelector(skin, scheme), size);

const collectIo = () => {
  const lines = [];
  return { lines, io: { log: (line) => lines.push(String(line)) } };
};

const silent = { log: () => {} };

test('8191-byte skin block passes (strict < boundary)', () => {
  const css = skinBlock('1', 'light', 8191);
  const result = evaluateBudget(css);
  assert.equal(result.skins.length, 1);
  const [skin] = result.skins;
  assert.equal(skin.skin, '1');
  assert.deepEqual(
    skin.schemes.map((entry) => [entry.scheme, entry.bytes]),
    [['light', 8191]],
  );
  assert.equal(skin.bytes, 8191);
  assert.equal(skin.pass, true);
  assert.deepEqual(result.failures, []);
  assert.equal(run(css, silent), 0);
});

test('8193-byte skin block fails and prints the failure line', () => {
  const css = skinBlock('2', 'light', 8193);
  const { lines, io } = collectIo();
  assert.equal(run(css, io), 1);
  assert.deepEqual(evaluateBudget(css).failures, [{ skin: '2', bytes: 8193 }]);
  assert.ok(
    lines.includes('FAIL skin 2: 8193 bytes ≥ 8192 (limit)'),
    `missing failure line in:\n${lines.join('\n')}`,
  );
});

test('exact 8192-byte skin block fails (the limit itself is not under budget)', () => {
  const result = evaluateBudget(skinBlock('3', 'light', 8192));
  assert.equal(result.skins[0].bytes, 8192);
  assert.equal(result.skins[0].pass, false);
  assert.deepEqual(result.failures, [{ skin: '3', bytes: 8192 }]);
});

test('both scheme blocks of one skin sum toward one budget', () => {
  // Each 5000-byte block is under the limit on its own; the skin is not.
  const css = [skinBlock('3', 'light', 5000), skinBlock('3', 'dark', 5000)].join('\n\n');
  const result = evaluateBudget(css);
  assert.equal(result.skins.length, 1);
  const [skin] = result.skins;
  assert.deepEqual(
    skin.schemes.map((entry) => [entry.scheme, entry.bytes]),
    [
      ['light', 5000],
      ['dark', 5000],
    ],
  );
  assert.equal(skin.bytes, 10000);
  assert.equal(skin.pass, false);
  assert.deepEqual(result.failures, [{ skin: '3', bytes: 10000 }]);

  const { lines, io } = collectIo();
  assert.equal(run(css, io), 1);
  assert.ok(
    lines.some((line) => line.includes('5000 B') && line.includes('10000 B')),
    `missing summed row in:\n${lines.join('\n')}`,
  );
});

test('separate skins are measured separately', () => {
  const css = [skinBlock('1', 'light', 8191), skinBlock('2', 'dark', 8193)].join('\n\n');
  const result = evaluateBudget(css);
  assert.deepEqual(
    result.skins.map((skin) => [skin.skin, skin.bytes, skin.pass]),
    [
      ['1', 8191, true],
      ['2', 8193, false],
    ],
  );
  assert.deepEqual(result.failures, [{ skin: '2', bytes: 8193 }]);
});

test('shared :root and @media blocks are overhead, never counted toward a skin', () => {
  const css = [
    blockOfSize(':root', 9000),
    skinBlock('3', 'light', 100),
    blockOfSize('@media (prefers-reduced-motion: reduce)', 5000),
  ].join('\n\n');
  const result = evaluateBudget(css);
  assert.equal(result.skins.length, 1);
  assert.equal(result.skins[0].bytes, 100);
  assert.equal(result.skins[0].pass, true);
  assert.deepEqual(
    result.shared.blocks.map((block) => [block.selector, block.bytes]),
    [
      [':root', 9000],
      ['@media (prefers-reduced-motion: reduce)', 5000],
    ],
  );
  assert.equal(result.shared.bytes, 14000);

  const { lines, io } = collectIo();
  assert.equal(run(css, io), 0);
  assert.ok(
    lines.some((line) => line.includes('shared overhead') && line.includes('14000 B')),
    `missing shared-overhead line in:\n${lines.join('\n')}`,
  );
});

test('scheme/skin selectors nested inside @media are not counted as top-level skins', () => {
  // A naive global regex over the file would attribute the nested 9000-byte
  // selector to skin 3. The brace-depth scanner treats the whole @media rule
  // as one shared top-level block instead.
  const nested = `@media (prefers-color-scheme: dark) {\n  [data-scheme='dark'][data-skin='3'] {\n    --pf-filler: ${'x'.repeat(9000)};\n  }\n}`;
  const css = [nested, skinBlock('3', 'light', 100)].join('\n\n');
  const result = evaluateBudget(css);
  assert.equal(result.skins.length, 1);
  assert.equal(result.skins[0].bytes, 100);
  assert.ok(result.skins[0].pass);
  assert.equal(result.shared.blocks.length, 1);
  assert.ok(result.shared.bytes > 9000);
  assert.equal(run(css, silent), 0);
});

test('empty or absent data-skin values fail closed', () => {
  assert.throws(
    () => evaluateBudget(`[data-scheme='light'][data-skin=''] {\n  --pf-x: 1;\n}`),
    /data-skin/,
  );
  assert.throws(
    () => evaluateBudget(`[data-scheme='light'][data-skin] {\n  --pf-x: 1;\n}`),
    /data-skin/,
  );
  assert.throws(() => evaluateBudget(`[data-scheme='light'] {\n  --pf-x: 1;\n}`), /data-skin/);
});

test('zero scheme/skin blocks fail closed', () => {
  assert.throws(
    () => evaluateBudget(':root {\n  --pf-x: 1;\n}'),
    /no \[data-scheme=\.\.\.\]\[data-skin=\.\.\.\] rule blocks/,
  );
  assert.throws(() => evaluateBudget('/* comment only */'), /no CSS rule blocks/);
});

test('unbalanced braces fail closed', () => {
  const block = skinBlock('3', 'light', 100);
  assert.throws(() => evaluateBudget(block.slice(0, -2)), /unbalanced braces/);
  assert.throws(() => evaluateBudget(`${block}\n}`), /unbalanced braces/);
});

test('real dist: skin 3 passes and its measured total equals the sum of its blocks', () => {
  const css = readFileSync(
    fileURLToPath(new URL('../dist/theme-tokens.css', import.meta.url)),
    'utf8',
  );
  // Independent measurement: split the dist on blank lines, locate the two
  // scheme chunks by selector, byte-measure those exact chunk strings.
  const chunks = css
    .split(/\r?\n\r?\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  const chunkFor = (selector) => {
    const chunk = chunks.find((candidate) => candidate.startsWith(selector));
    assert.ok(chunk, `dist has no chunk starting with ${selector}`);
    assert.ok(chunk.endsWith('}'), `dist chunk for ${selector} does not end with "}"`);
    return chunk;
  };
  const lightChunk = chunkFor("[data-scheme='light'][data-skin='3']");
  const darkChunk = chunkFor("[data-scheme='dark'][data-skin='3']");
  const rootChunk = chunkFor(':root');
  const mediaChunk = chunkFor('@media');

  const result = evaluateBudget(css);
  const skin3 = result.skins.find((skin) => skin.skin === '3');
  assert.ok(skin3, 'dist must contain a data-skin="3" block');
  assert.deepEqual(
    skin3.schemes.map((entry) => entry.scheme),
    ['light', 'dark'],
  );
  assert.equal(
    skin3.schemes.find((entry) => entry.scheme === 'light').bytes,
    Buffer.byteLength(lightChunk, 'utf8'),
  );
  assert.equal(
    skin3.schemes.find((entry) => entry.scheme === 'dark').bytes,
    Buffer.byteLength(darkChunk, 'utf8'),
  );
  assert.equal(skin3.bytes, Buffer.byteLength(lightChunk) + Buffer.byteLength(darkChunk));
  assert.ok(skin3.bytes < LIMIT, `skin 3 is ${skin3.bytes} B, budget ${LIMIT} B`);
  assert.equal(skin3.pass, true);
  assert.deepEqual(
    result.failures.filter((skin) => skin.skin === '3'),
    [],
  );
  const sharedBytes = (selector) => {
    const block = result.shared.blocks.find((entry) => entry.selector === selector);
    assert.ok(block, `dist must report ${selector} as shared overhead`);
    return block.bytes;
  };
  assert.equal(sharedBytes(':root'), Buffer.byteLength(rootChunk));
  assert.equal(
    sharedBytes('@media (prefers-reduced-motion: reduce)'),
    Buffer.byteLength(mediaChunk),
  );
  assert.equal(run(css, silent), result.failures.length);
});

test('CLI: guarded direct run exits 0 from any cwd and prints the table', () => {
  const cliPath = fileURLToPath(new URL('../src/check-budget.mjs', import.meta.url));
  // cwd is deliberately not the repo: the dist path must resolve module-relative.
  const stdout = execFileSync(process.execPath, [cliPath], { encoding: 'utf8', cwd: tmpdir() });
  assert.match(stdout, /skin\s+light\s+dark/);
  assert.match(stdout, /^3\s+\d+ B/m);
  assert.match(stdout, /pass/);
  assert.match(stdout, /shared overhead/);
  assert.doesNotMatch(stdout, /FAIL/);
});

test('CLI guard: importing the module never runs the CLI', () => {
  // An unguarded CLI entry would print the table and set process.exitCode on
  // import; the guard must keep both from happening.
  const moduleUrl = pathToFileURL(
    fileURLToPath(new URL('../src/check-budget.mjs', import.meta.url)),
  ).href;
  const script = `import('${moduleUrl}').then(() => console.log('IMPORTED exitCode=' + String(process.exitCode)));`;
  const stdout = execFileSync(process.execPath, ['-e', script], { encoding: 'utf8' });
  assert.match(stdout, /^IMPORTED exitCode=undefined/);
});
