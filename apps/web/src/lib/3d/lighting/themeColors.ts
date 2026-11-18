import { SCENE } from '@/lib/design-tokens';

// Concrete values for the WebGL layer — CSS custom properties cannot be
// sampled by shaders. Source of truth: packages/tokens/tokens.json (scene).
export const THEME_LIGHT_COLORS = {
  primary: SCENE.hero.primary,
  ambient: SCENE.hero.ambient,
  accent: SCENE.hero.accent,
} as const;

export const THEME_BACKGROUND_COLORS = SCENE.backdrop;

export const getLightColor = (
  theme: 'light' | 'dark',
  colorKey: keyof typeof THEME_LIGHT_COLORS,
): string => THEME_LIGHT_COLORS[colorKey][theme];
