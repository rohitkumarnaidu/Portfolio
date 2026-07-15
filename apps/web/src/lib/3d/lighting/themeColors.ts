export const THEME_LIGHT_COLORS = {
  primary: { light: '#6366f1', dark: '#818cf8' },
  ambient: { light: '#a5b4fc', dark: '#6366f1' },
  accent: { light: '#22d3ee', dark: '#67e8f9' },
} as const;

export const THEME_BACKGROUND_COLORS = {
  light: '#0f0f1a',
  dark: '#0a0a14',
} as const;

export const getLightColor = (
  theme: 'light' | 'dark',
  colorKey: keyof typeof THEME_LIGHT_COLORS,
): string => THEME_LIGHT_COLORS[colorKey][theme];
