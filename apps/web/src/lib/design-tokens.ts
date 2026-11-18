/**
 * Runtime design-token access for surfaces that cannot resolve CSS custom
 * properties: WebGL/Three.js materials and colors, SVG chart props, and
 * metadata that must be a concrete string.
 *
 * Source of truth: packages/tokens/tokens.json. CSS consumers keep using the
 * generated custom properties (`@portfolio/tokens/theme.css`); this module
 * exists only where a literal color value is unavoidable. Never add a color
 * here — add it to tokens.json first.
 */
import tokens from '@portfolio/tokens/tokens.json';

export type ColorScheme = 'light' | 'dark';

/** Paper/ink palette of the public editorial surface (scheme-independent). */
export const publicSurface = {
  paper: tokens.publicSurface.paper.$value,
  paperDeep: tokens.publicSurface.paperDeep.$value,
  ink: tokens.publicSurface.ink.$value,
  inkSoft: tokens.publicSurface.inkSoft.$value,
  muted: tokens.publicSurface.muted.$value,
  rule: tokens.publicSurface.rule.$value,
  ruleStrong: tokens.publicSurface.ruleStrong.$value,
  accent: tokens.publicSurface.accent.$value,
  accentDeep: tokens.publicSurface.accentDeep.$value,
  green: tokens.publicSurface.green.$value,
  codeBg: tokens.publicSurface.codeBg.$value,
  codeFg: tokens.publicSurface.codeFg.$value,
} as const;

/** Third-party brand marks. Brand colors are literal by definition. */
export const brand = {
  google: {
    blue: tokens.brand.google.blue.$value,
    green: tokens.brand.google.green.$value,
    yellow: tokens.brand.google.yellow.$value,
    red: tokens.brand.google.red.$value,
  },
} as const;

/**
 * Scene palette for the WebGL layer and admin charts. Kept out of CSS because
 * Three.js materials and SVG props need concrete values, not var() references.
 */
export const SCENE = tokens.scene;

/** Chart colors as plain strings (the DTCG wrapper is for the CSS build). */
export const CHART = {
  performance: tokens.scene.chart.performance.$value,
  accessibility: tokens.scene.chart.accessibility.$value,
  cyan: tokens.scene.chart.cyan.$value,
  violet: tokens.scene.chart.violet.$value,
  meshTeal: tokens.scene.chart.meshTeal.$value,
} as const;
