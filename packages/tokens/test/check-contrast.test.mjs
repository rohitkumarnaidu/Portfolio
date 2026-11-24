import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  evaluatePairs,
  evaluatePublicPairs,
  evaluateStatusPairs,
  run,
} from '../src/check-contrast.mjs';
import { contrastRatio, REQUIRED } from '../src/wcag.mjs';
import tokens from '../tokens.json' with { type: 'json' };

// ---------------------------------------------------------------------------
// TDD arc (task 7):
//   RED   — this file was written BEFORE check-contrast.mjs existed; the
//           import above failed (module not found).
//   RED   — with the checker implemented, the real-tokens all-pass test
//           below failed against pre-reconciliation tokens.json:
//           text.muted.light 2.07 < 4.5, text.muted.dark 3.00 < 4.5 and
//           accent.link.light 3.70 < 4.5 (checker output, full precision).
//   GREEN — tokens.json was reconciled per spec §14 and dist regenerated;
//           the real-tokens test is now the regression test pinning the CI
//           contract "the checker exits 0 on the shipped tokens" (task 9).
// ---------------------------------------------------------------------------

// Step 1's seeded failure: the exact pre-reconciliation value pair, scoped
// to the light scheme. 2.07:1 sits comfortably below the 4.5 threshold, so
// no float-boundary hazard (ruling 1: comparisons stay full precision; only
// printed ratios are display-rounded).
const seeded = {
  skins: {
    3: {
      semantic: {
        surface: { base: { light: '#F4F5F7', dark: '#0A0C10' } },
        text: { muted: { light: '#A6ADBB', dark: '#565E6D' } },
      },
    },
  },
  contrastPairs: [
    { fg: 'text.muted', bg: 'surface.base', level: 'AA_NORMAL', schemes: ['light'] },
  ],
};

const collectIo = () => {
  const lines = [];
  return { lines, io: { log: (line) => lines.push(String(line)) } };
};

const fmtFailure = (r) => `${r.fg} × ${r.bg} × ${r.scheme}: ${r.actual.toFixed(2)} < ${r.required}`;

test('seeded failure: #A6ADBB on #F4F5F7 fails AA_NORMAL', () => {
  const results = evaluatePairs(seeded);
  assert.equal(results.length, 1);
  const row = results[0];
  assert.equal(row.fg, 'text.muted');
  assert.equal(row.bg, 'surface.base');
  assert.equal(row.scheme, 'light');
  assert.equal(row.level, 'AA_NORMAL');
  assert.equal(row.required, REQUIRED.AA_NORMAL);
  // Same module, same float — pins the evaluator to wcag.mjs's math exactly.
  assert.equal(row.actual, contrastRatio('#A6ADBB', '#F4F5F7'));
  assert.ok(row.actual < REQUIRED.AA_NORMAL);
  assert.equal(row.pass, false);
});

test('run() reports the failure in the required format and returns 1', () => {
  const { lines, io } = collectIo();
  assert.equal(run(seeded, io), 1);
  const expected = `text.muted × surface.base × light: ${contrastRatio('#A6ADBB', '#F4F5F7').toFixed(2)} < ${REQUIRED.AA_NORMAL}`;
  assert.ok(
    lines.some((line) => line.includes(expected)),
    `missing failure line ${expected} in:\n${lines.join('\n')}`,
  );
});

test('pair-level schemes override restricts the checked schemes', () => {
  const doc = structuredClone(seeded);
  doc.contrastPairs[0].schemes = ['dark'];
  assert.deepEqual(evaluatePairs(doc).map((r) => r.scheme), ['dark']);

  doc.contrastPairs[0].schemes = ['light'];
  assert.deepEqual(evaluatePairs(doc).map((r) => r.scheme), ['light']);
});

test('NONE level always passes (no threshold)', () => {
  const doc = {
    skins: {
      3: {
        semantic: {
          surface: { base: { light: '#F4F5F7', dark: '#0A0C10' } },
          border: { hairline: { light: '#A6ADBB', dark: '#262B35' } },
        },
      },
    },
    contrastPairs: [{ fg: 'border.hairline', bg: 'surface.base', level: 'NONE' }],
  };
  const results = evaluatePairs(doc);
  assert.equal(results.length, 2);
  assert.ok(results.every((r) => r.pass));
  assert.equal(results[0].required, REQUIRED.NONE);
});

test('unmeasurable or unknown inputs throw instead of passing silently', () => {
  const badPath = {
    skins: { 3: { semantic: {} } },
    contrastPairs: [{ fg: 'nope', bg: 'surface.base', level: 'AA_NORMAL' }],
  };
  assert.throws(() => evaluatePairs(badPath), /does not resolve/);

  const badLevel = structuredClone(seeded);
  badLevel.contrastPairs[0] = { fg: 'text.muted', bg: 'surface.base', level: 'AAA' };
  assert.throws(() => evaluatePairs(badLevel), /level must be one of/);

  const badValue = structuredClone(seeded);
  badValue.skins[3].semantic.text.muted.light = 'rgba(0,0,0,.5)';
  assert.throws(() => evaluatePairs(badValue), /cannot be measured/);
});

test('real tokens: every declared pair passes its level in both schemes', () => {
  // Post-reconciliation regression test (see the arc comment above). At RED
  // this failed on text.muted.light 2.07, text.muted.dark 3.00 and
  // accent.link.light 3.70 — all AA_NORMAL (< 4.5). After the §14
  // reconciliation it pins "checker exits 0 on the real tokens".
  const results = evaluatePairs(tokens);
  assert.equal(results.length, tokens.contrastPairs.length * 2); // 10 pairs × 2 schemes
  const failing = results.filter((r) => !r.pass);
  assert.deepEqual(
    failing,
    [],
    `failing pair-scheme checks:\n${failing.map(fmtFailure).join('\n')}`,
  );
  assert.equal(results.filter((r) => r.level === 'AA_NORMAL').length, 14);
  assert.equal(results.filter((r) => r.level === 'AA_LARGE').length, 4);
  assert.equal(results.filter((r) => r.level === 'NONE').length, 2);
});

test('run() returns 0 on the real tokens (exit-0 contract input)', () => {
  assert.equal(run(tokens, { log: () => {} }), 0);
});

test('public and status pairs evaluate scheme-constant', () => {
  const publicResults = evaluatePublicPairs(tokens);
  assert.equal(publicResults.length, tokens.publicContrastPairs.length);
  assert.ok(publicResults.every((r) => r.scheme === 'constant' && r.kind === 'public'));

  const inkPaper = publicResults.find((r) => r.fg === 'ink' && r.bg === 'paper');
  assert.equal(inkPaper.level, 'AA_NORMAL');
  assert.equal(inkPaper.required, REQUIRED.AA_NORMAL);
  assert.equal(inkPaper.actual, contrastRatio('#17140F', '#F4F0E7'));
  assert.equal(inkPaper.pass, true);

  const statusResults = evaluateStatusPairs(tokens);
  assert.deepEqual(
    statusResults.map((r) => [r.fg, r.bg, r.kind, r.scheme]),
    [['success', 'paper', 'status', 'constant']],
  );
  // Recomputes the amended status.success against publicSurface.paper.
  assert.equal(statusResults[0].actual, contrastRatio('#1F7A52', '#F4F0E7'));
  assert.equal(statusResults[0].pass, true);
});

test('run() appends public/status checks only when the matrices exist', () => {
  const real = collectIo();
  assert.equal(run(tokens, real.io), 0);
  assert.equal(real.lines.at(-1), '30/30 pair-scheme checks pass');

  // The seeded fixture has no public/status matrices, so its count stays at
  // one pair × one scheme — the evaluators must not be called blindly.
  const fixture = collectIo();
  assert.equal(run(seeded, fixture.io), 1);
  assert.equal(fixture.lines.at(-1), '0/1 pair-scheme checks pass');
});

test('CLI: guarded direct run exits 0 and prints the pass table', () => {
  const stdout = execFileSync(
    process.execPath,
    [fileURLToPath(new URL('../src/check-contrast.mjs', import.meta.url))],
    { encoding: 'utf8' },
  );
  assert.match(stdout, /30\/30 pair-scheme checks pass/);
});

test('CLI guard: importing the module never runs the CLI', () => {
  // An unguarded CLI entry would print the tables and set process.exitCode
  // on import; the guard must keep both from happening.
  const moduleUrl = pathToFileURL(
    fileURLToPath(new URL('../src/check-contrast.mjs', import.meta.url)),
  ).href;
  const script = `import('${moduleUrl}').then(() => console.log('IMPORTED exitCode=' + String(process.exitCode)));`;
  const stdout = execFileSync(process.execPath, ['-e', script], { encoding: 'utf8' });
  assert.match(stdout, /^IMPORTED exitCode=undefined/);
});
