/**
 * Structural validator for `tokens.json` — the schema gate consumed by the
 * CSS generator (`build.mjs`) and the contrast checker (`check-contrast.mjs`).
 *
 * Contract enforced (task brief + controller rulings):
 * - top-level keys: `primitives`, `status`, `viz`, `motion`, `skins["3"]`,
 *   `contrastPairs` (extra keys are tolerated for forward compatibility)
 * - primitives / status / viz: DTCG color leaves `{ "$type": "color",
 *   "$value": "#RRGGBB" }`, `$value` hex-validated via `wcag.hexToRgb`.
 *   Status and viz are scheme-constant colors, so they use the same leaf
 *   shape and get the same hex check.
 * - semantic tokens: `{ light, dark }` whose values may be hex OR `rgba(...)`
 *   strings — string type check only, no hex validation of rgba values
 *   (ruling 1). `null` is allowed ONLY for `accent.traceHalo.light`.
 * - motion: `dur.tap/transition/reveal`, `ease.out/spring`,
 *   `reducedMotion.fade` — non-empty strings.
 * - contrastPairs: `{ fg, bg, level }` with `level` one of
 *   `AA_NORMAL | AA_LARGE | NONE`, `fg`/`bg` resolving to a known semantic
 *   token path (ruling 2), and an optional `schemes` array ⊆ {light, dark}
 *   restricting the schemes a pair is checked in (checked in both unless
 *   restricted).
 *
 * Throws a descriptive Error on the first violation; returns `true` when
 * the document satisfies the contract.
 */

import { hexToRgb } from './wcag.mjs';

const LEVELS = new Set(['AA_NORMAL', 'AA_LARGE', 'NONE']);
const SCHEMES = new Set(['light', 'dark']);
const TOP_LEVEL_KEYS = [
  'primitives',
  'publicSurface',
  'sandboxSurface',
  'legacyPalette',
  'brand',
  'scene',
  'status',
  'viz',
  'motion',
  'skins',
  'contrastPairs',
];

const fail = (message) => {
  throw new Error(`tokens.json: ${message}`);
};

const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

function assertHex(value, at) {
  if (typeof value !== 'string') fail(`${at} must be a hex string`);
  try {
    hexToRgb(value);
  } catch (error) {
    fail(`${at}: ${error.message}`);
  }
}

function assertSchemePair(pair, at) {
  if (!isObject(pair)) fail(`${at} must be an object with "light" and "dark" values`);
  for (const scheme of ['light', 'dark']) {
    if (!(scheme in pair)) fail(`${at} is missing the "${scheme}" value`);
    assertHex(pair[scheme], `${at}.${scheme}`);
  }
}

function assertScene(scene) {
  if (!isObject(scene)) fail('scene must be an object');
  for (const group of ['hero', 'backdrop', 'notFound']) {
    if (!isObject(scene[group])) fail(`scene.${group} must be an object`);
  }
  for (const name of ['primary', 'ambient', 'accent']) {
    assertSchemePair(scene.hero[name], `scene.hero.${name}`);
  }
  assertSchemePair(scene.backdrop, 'scene.backdrop');
  assertSchemePair(scene.notFound, 'scene.notFound');
  if (!isObject(scene.fallback)) fail('scene.fallback must be an object');
  for (const scheme of ['light', 'dark']) {
    const stops = scene.fallback[scheme];
    if (!Array.isArray(stops) || stops.length !== 3) {
      fail(`scene.fallback.${scheme} must be an array of exactly 3 hex strings`);
    }
    stops.forEach((stop, index) => assertHex(stop, `scene.fallback.${scheme}[${index}]`));
  }
  if (!isObject(scene.shapes)) fail('scene.shapes must be an object of hex strings');
  for (const [name, value] of Object.entries(scene.shapes)) {
    assertHex(value, `scene.shapes.${name}`);
  }
  if (!isObject(scene.adminParticles))
    fail('scene.adminParticles must be an object of hex strings');
  for (const [name, value] of Object.entries(scene.adminParticles)) {
    assertHex(value, `scene.adminParticles.${name}`);
  }
  assertDtcgColorGroup(scene.chart, 'scene.chart');
}

function assertDtcgColorGroup(group, path) {
  if (!isObject(group)) fail(`${path} must be an object of DTCG color tokens`);
  for (const [name, leaf] of Object.entries(group)) {
    const at = `${path}.${name}`;
    if (!isObject(leaf)) fail(`${at} must be a DTCG token object`);
    if (leaf.$type !== 'color') {
      fail(`${at}.$type must be "color", got ${JSON.stringify(leaf.$type)}`);
    }
    if (typeof leaf.$value !== 'string') fail(`${at}.$value must be a hex string`);
    try {
      hexToRgb(leaf.$value);
    } catch (error) {
      fail(`${at}.$value: ${error.message}`);
    }
  }
}

function assertMotion(motion) {
  if (!isObject(motion)) fail('motion must be an object');
  const bands = {
    dur: ['tap', 'transition', 'reveal'],
    ease: ['out', 'spring'],
    reducedMotion: ['fade'],
  };
  for (const [band, names] of Object.entries(bands)) {
    if (!isObject(motion[band])) fail(`motion.${band} must be an object`);
    for (const name of names) {
      const value = motion[band][name];
      if (typeof value !== 'string' || value.length === 0) {
        fail(`motion.${band}.${name} must be a non-empty string`);
      }
    }
  }
}

function assertSemantic(semantic) {
  if (!isObject(semantic)) fail('skins["3"].semantic must be an object');
  for (const [group, tokens] of Object.entries(semantic)) {
    if (!isObject(tokens)) fail(`skins["3"].semantic.${group} must be an object`);
    for (const [name, token] of Object.entries(tokens)) {
      const at = `skins["3"].semantic.${group}.${name}`;
      if (!isObject(token)) fail(`${at} must be an object with "light" and "dark" values`);
      for (const scheme of ['light', 'dark']) {
        if (!(scheme in token)) fail(`${at} is missing the "${scheme}" value`);
        const value = token[scheme];
        if (value === null) {
          if (!(group === 'accent' && name === 'traceHalo' && scheme === 'light')) {
            fail(`${at}.${scheme} may only be null for accent.traceHalo.light`);
          }
        } else if (typeof value !== 'string') {
          fail(`${at}.${scheme} must be a hex/rgba string or null, got ${typeof value}`);
        }
      }
    }
  }
}

function resolveSemanticPath(semantic, path) {
  let node = semantic;
  for (const part of path.split('.')) {
    if (!isObject(node) || !(part in node)) return null;
    node = node[part];
  }
  return node;
}

function assertContrastPairs(pairs, semantic) {
  if (!Array.isArray(pairs) || pairs.length === 0) fail('contrastPairs must be a non-empty array');
  pairs.forEach((pair, index) => {
    const at = `contrastPairs[${index}]`;
    if (!isObject(pair)) fail(`${at} must be an object`);
    for (const key of ['fg', 'bg']) {
      const ref = pair[key];
      if (typeof ref !== 'string' || ref.length === 0) {
        fail(`${at}.${key} must be a non-empty semantic path`);
      }
      const resolved = resolveSemanticPath(semantic, ref);
      if (!isObject(resolved) || !('light' in resolved)) {
        fail(`${at}.${key} "${ref}" does not resolve to a known semantic token`);
      }
    }
    if (!LEVELS.has(pair.level)) {
      fail(
        `${at}.level must be one of AA_NORMAL, AA_LARGE, NONE — got ${JSON.stringify(pair.level)}`,
      );
    }
    if ('schemes' in pair) {
      const valid =
        Array.isArray(pair.schemes) &&
        pair.schemes.length > 0 &&
        pair.schemes.every((scheme) => SCHEMES.has(scheme));
      if (!valid) fail(`${at}.schemes must be a non-empty array of "light" and/or "dark"`);
    }
  });
}

export function validateTokens(tokens) {
  if (!isObject(tokens)) fail('expected a JSON object at the root');
  for (const key of TOP_LEVEL_KEYS) {
    if (!(key in tokens)) fail(`missing required top-level key "${key}"`);
  }

  if (!isObject(tokens.primitives)) fail('primitives must be an object');
  for (const [family, group] of Object.entries(tokens.primitives)) {
    assertDtcgColorGroup(group, `primitives.${family}`);
  }
  assertDtcgColorGroup(tokens.publicSurface, 'publicSurface');
  assertDtcgColorGroup(tokens.sandboxSurface, 'sandboxSurface');
  assertDtcgColorGroup(tokens.legacyPalette, 'legacyPalette');
  if (!isObject(tokens.brand) || !isObject(tokens.brand.google)) {
    fail('brand.google must be an object of DTCG color tokens');
  }
  assertDtcgColorGroup(tokens.brand.google, 'brand.google');
  assertScene(tokens.scene);
  assertDtcgColorGroup(tokens.status, 'status');
  assertDtcgColorGroup(tokens.viz, 'viz');
  assertMotion(tokens.motion);

  if (!isObject(tokens.skins) || !isObject(tokens.skins['3'])) {
    fail('skins["3"] must be an object');
  }
  assertSemantic(tokens.skins['3'].semantic);
  assertContrastPairs(tokens.contrastPairs, tokens.skins['3'].semantic);

  return true;
}
