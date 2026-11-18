import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hexToRgb, relativeLuminance, contrastRatio, REQUIRED } from '../src/wcag.mjs';

// Anchor assertions use a 1e-9 tolerance: the WCAG coefficient sum
// 0.2126 + 0.7152 + 0.0722 is float-hostile, so exact equality is not
// reliable. The implementation itself must NOT round (Task 7 needs
// full precision to compare against the 4.5 / 3.0 thresholds).

test('white vs black = 21:1 (WCAG definition)', () => {
  assert.ok(Math.abs(contrastRatio('#FFFFFF', '#000000') - 21) < 1e-9);
});

test('relativeLuminance of #FFFFFF is 1, #000000 is 0', () => {
  assert.ok(Math.abs(relativeLuminance('#FFFFFF') - 1) < 1e-9);
  assert.ok(Math.abs(relativeLuminance('#000000') - 0) < 1e-9);
});

test('hexToRgb parses and rejects', () => {
  assert.deepEqual(hexToRgb('#0A0C10'), { r: 10, g: 12, b: 16 });
  assert.throws(() => hexToRgb('#GGG'));
});

test('REQUIRED levels', () => {
  assert.equal(REQUIRED.AA_NORMAL, 4.5);
  assert.equal(REQUIRED.AA_LARGE, 3.0);
});
