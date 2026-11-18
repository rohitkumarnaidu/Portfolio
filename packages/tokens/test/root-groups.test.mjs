import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from '../src/build.mjs';
import { validateTokens } from '../src/validate.mjs';
import tokens from '../tokens.json' with { type: 'json' };

// These groups are the single source for values that used to live as raw hex
// in `globals.css`, `public.css`, `tailwind.config.ts` and the WebGL layer.
// The literals below are the pre-migration values: if one changes, the
// rendered surfaces change with it, so it must be a deliberate, reviewed edit.

test('public surface emits its locked paper/ink palette at :root', () => {
  const css = build();
  const expected = {
    paper: '#F4F0E7',
    'paper-deep': '#EBE4D6',
    ink: '#17140F',
    'ink-soft': '#3D372E',
    muted: '#6C6456',
    rule: '#D6CDBA',
    'rule-strong': '#B5A98F',
    accent: '#C2401F',
    'accent-deep': '#8F2C14',
    green: '#2F6B4A',
    'code-bg': '#1C1914',
    'code-fg': '#EDE7DA',
  };
  for (const [name, value] of Object.entries(expected)) {
    assert.match(css, new RegExp(`--pf-public-${name}:\\s*${value};`));
  }
});

test('sandbox chrome and legacy palette emit at :root', () => {
  const css = build();
  assert.match(css, /--pf-sandbox-base:\s*#0E0E11;/);
  assert.match(css, /--pf-sandbox-panel:\s*#18181B;/);
  assert.match(css, /--pf-sandbox-rail:\s*#1E1E24;/);
  assert.match(css, /--pf-sandbox-preview-light:\s*#F5F5F5;/);
  assert.match(css, /--pf-sandbox-preview-dark:\s*#1A1A1A;/);
  assert.match(css, /--pf-legacy-palette-slate-300:\s*#CBD5E1;/);
  assert.match(css, /--pf-legacy-palette-cyan-neon:\s*#00F0FF;/);
});

test('scene chart colors emit at :root for CSS gradients', () => {
  const css = build();
  assert.match(css, /--pf-scene-chart-cyan:\s*#06B6D4;/);
  assert.match(css, /--pf-scene-chart-violet:\s*#8B5CF6;/);
  assert.match(css, /--pf-scene-chart-mesh-teal:\s*#6EE7B7;/);
});

test('scene keeps the exact WebGL values the components consumed inline', () => {
  assert.deepEqual(tokens.scene.hero.primary, { light: '#6366F1', dark: '#818CF8' });
  assert.deepEqual(tokens.scene.hero.ambient, { light: '#A5B4FC', dark: '#6366F1' });
  assert.deepEqual(tokens.scene.hero.accent, { light: '#22D3EE', dark: '#67E8F9' });
  assert.deepEqual(tokens.scene.backdrop, { light: '#0F0F1A', dark: '#0A0A14' });
  assert.deepEqual(tokens.scene.fallback, {
    light: ['#F0F0FF', '#E8E8FF', '#DDD6FE'],
    dark: ['#0F0F1A', '#1A1A2E', '#16213E'],
  });
  assert.deepEqual(tokens.scene.shapes, {
    box: '#6366F1',
    sphere: '#22D3EE',
    torus: '#A78BFA',
    octahedron: '#67E8F9',
  });
  assert.deepEqual(tokens.scene.notFound, { light: '#EF4444', dark: '#F87171' });
  assert.deepEqual(tokens.scene.adminParticles, {
    normal: '#06B6D4',
    loading: '#F59E0B',
    error: '#EF4444',
  });
});

test('brand marks stay literal, scheme-independent values', () => {
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(tokens.brand.google).map(([name, leaf]) => [name, leaf.$value]),
    ),
    {
      blue: '#4285F4',
      green: '#34A853',
      yellow: '#FBBC05',
      red: '#EA4335',
    },
  );
});

test('new groups are required and validated', () => {
  for (const key of ['publicSurface', 'sandboxSurface', 'legacyPalette', 'brand', 'scene']) {
    const bad = structuredClone(tokens);
    delete bad[key];
    assert.throws(() => validateTokens(bad), /missing required top-level key/, key);
  }

  const badSurface = structuredClone(tokens);
  badSurface.publicSurface.paper.$value = '#GGGGGG';
  assert.throws(() => validateTokens(badSurface), /Invalid hex/);

  const badScene = structuredClone(tokens);
  badScene.scene.fallback.dark = ['#000000', '#111111'];
  assert.throws(() => validateTokens(badScene), /exactly 3 hex strings/);
});
