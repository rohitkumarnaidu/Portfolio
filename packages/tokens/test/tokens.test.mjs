import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateTokens } from '../src/validate.mjs';
import tokens from '../tokens.json' with { type: 'json' };

// Every literal below is transcribed verbatim from spec §3.2 (the task brief
// copies it character for character). If Task 7's contrast reconciliation
// amends a value, update the matching literal here in the same commit and
// record the amendment in spec §14.

const color = ($value) => ({ $type: 'color', $value });

test('tokens.json is valid', () => {
  assert.doesNotThrow(() => validateTokens(tokens));
});

test('rejects semantic token missing a scheme', () => {
  const bad = structuredClone(tokens);
  delete bad.skins['3'].semantic.surface.base.dark;
  assert.throws(() => validateTokens(bad), /surface\.base.*dark/);
});

test('every contrastPair references a known semantic token', () => {
  // validateTokens covers reference resolution; assert no throw + the
  // brief's lower bound on matrix size.
  assert.doesNotThrow(() => validateTokens(tokens));
  assert.ok(tokens.contrastPairs.length > 8);
});

test('contrastPairs match the locked spec 3.2 matrix', () => {
  assert.deepEqual(tokens.contrastPairs, [
    { fg: 'text.primary', bg: 'surface.base', level: 'AA_NORMAL' },
    { fg: 'text.primary', bg: 'surface.panel', level: 'AA_NORMAL' },
    { fg: 'text.secondary', bg: 'surface.base', level: 'AA_NORMAL' },
    { fg: 'text.secondary', bg: 'surface.panel', level: 'AA_NORMAL' },
    { fg: 'text.muted', bg: 'surface.base', level: 'AA_NORMAL' },
    { fg: 'accent.link', bg: 'surface.base', level: 'AA_NORMAL' },
    { fg: 'accentSecondary.link', bg: 'surface.base', level: 'AA_NORMAL' },
    { fg: 'accent.primary', bg: 'surface.base', level: 'AA_LARGE' },
    { fg: 'accent.focus', bg: 'surface.base', level: 'AA_LARGE' },
    { fg: 'border.hairline', bg: 'surface.base', level: 'NONE' },
  ]);
});

test('rejects a contrastPair with an unknown fg path', () => {
  const bad = structuredClone(tokens);
  bad.contrastPairs[0].fg = 'text.nope';
  assert.throws(() => validateTokens(bad), /does not resolve/);
});

test('rejects a contrastPair with an invalid level', () => {
  const bad = structuredClone(tokens);
  bad.contrastPairs[0].level = 'AAA';
  assert.throws(() => validateTokens(bad), /level must be one of/);
});

test('null is allowed only for accent.traceHalo.light', () => {
  const bad = structuredClone(tokens);
  bad.skins['3'].semantic.text.primary.light = null;
  assert.throws(() => validateTokens(bad), /only be null for accent\.traceHalo\.light/);
});

test('semantic values may be rgba strings; non-strings rejected', () => {
  // String type check only per controller ruling 1 — no hex validation of
  // rgba values, so any string is accepted as-is.
  const ok = structuredClone(tokens);
  ok.skins['3'].semantic.border.accent.dark = 'rgba(0,0,0,0)';
  assert.doesNotThrow(() => validateTokens(ok));

  const bad = structuredClone(tokens);
  bad.skins['3'].semantic.text.primary.light = 42;
  assert.throws(() => validateTokens(bad), /hex\/rgba string or null/);
});

test('rejects invalid DTCG color leaves', () => {
  const badHex = structuredClone(tokens);
  badHex.primitives.ember['500'].$value = '#GGGGGG';
  assert.throws(() => validateTokens(badHex), /Invalid hex/);

  const badType = structuredClone(tokens);
  badType.status.success.$type = 'dimension';
  assert.throws(() => validateTokens(badType), /\$type must be "color"/);
});

test('rejects incomplete motion tokens', () => {
  const bad = structuredClone(tokens);
  delete bad.motion.dur.tap;
  assert.throws(() => validateTokens(bad), /motion\.dur\.tap/);
});

test('rejects malformed roots', () => {
  assert.throws(() => validateTokens(null), /expected a JSON object at the root/);
  assert.throws(() => validateTokens({}), /missing required top-level key/);

  const bad = structuredClone(tokens);
  delete bad.skins['3'].semantic;
  assert.throws(() => validateTokens(bad), /skins\["3"\]\.semantic/);
});

test('primitives carry the locked spec 3.2 values', () => {
  assert.deepEqual(tokens.primitives, {
    graphite: {
      '0': color('#FFFFFF'),
      '50': color('#F4F5F7'),
      '100': color('#E4E7EC'),
      '300': color('#A6ADBB'),
      '500': color('#565E6D'),
      '800': color('#262B35'),
      '850': color('#1B1F27'),
      '900': color('#12151B'),
      '950': color('#0A0C10'),
    },
    ember: {
      '300': color('#E3A87C'),
      '400': color('#D68A54'),
      '500': color('#C1662E'),
      '600': color('#9A4E22'),
      '700': color('#7A3C18'),
    },
    signal: {
      '400': color('#5C82E0'),
      '500': color('#2F5FD1'),
    },
  });
});

test('status and viz carry the locked constants', () => {
  assert.deepEqual(tokens.status, {
    success: color('#2E9E6D'),
    warning: color('#C98A2C'),
    danger: color('#C64545'),
    info: color('#2F5FD1'),
  });
  assert.deepEqual(tokens.viz, {
    '1': color('#2F5FD1'),
    '2': color('#C1662E'),
    '3': color('#2E9E6D'),
    '4': color('#6B5CA5'),
    '5': color('#2E8C8C'),
    '6': color('#A34D74'),
    '7': color('#C98A2C'),
    '8': color('#565E6D'),
  });
});

test('semantic map matches spec 3.2 verbatim', () => {
  assert.deepEqual(tokens.skins['3'].semantic, {
    surface: {
      base: { light: '#F4F5F7', dark: '#0A0C10' },
      panel: { light: '#FFFFFF', dark: '#1B1F27' },
      elevated: { light: '#E4E7EC', dark: '#12151B' },
    },
    border: {
      hairline: { light: '#A6ADBB', dark: '#262B35' },
      accent: { light: 'rgba(193,102,46,.30)', dark: 'rgba(224,137,90,.15)' },
    },
    text: {
      primary: { light: '#0A0C10', dark: '#F4F5F7' },
      secondary: { light: '#565E6D', dark: '#A6ADBB' },
      muted: { light: '#A6ADBB', dark: '#565E6D' },
    },
    accent: {
      primary: { light: '#C1662E', dark: '#C1662E' },
      link: { light: '#C1662E', dark: '#D68A54' },
      trace: { light: '#C1662E', dark: '#D68A54' },
      traceHalo: { light: null, dark: '#E3A87C' },
      hover: { light: '#9A4E22', dark: '#D68A54' },
      active: { light: '#7A3C18', dark: '#9A4E22' },
      tint: { light: '#E3A87C', dark: 'rgba(193,102,46,.15)' },
      focus: { light: '#C1662E', dark: '#D68A54' },
    },
    accentSecondary: {
      base: { light: '#2F5FD1', dark: '#2F5FD1' },
      link: { light: '#2F5FD1', dark: '#5C82E0' },
    },
  });
});

test('motion tokens match spec 3.6', () => {
  assert.deepEqual(tokens.motion, {
    dur: { tap: '120ms', transition: '200ms', reveal: '350ms' },
    ease: { out: 'cubic-bezier(0.2, 0, 0, 1)', spring: 'cubic-bezier(0.35, 0, 0.1, 1)' },
    reducedMotion: { fade: '120ms' },
  });
});
