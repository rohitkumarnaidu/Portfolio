/**
 * WCAG 2.x relative luminance and contrast ratio math.
 *
 * Leaf module of `@portfolio/tokens` (zero dependencies). Consumed by the
 * token validator, the CSS token generator, and the AA contrast checker.
 *
 * Results are returned at full float precision — callers that print values
 * round for display; this module never rounds, so threshold comparisons
 * against REQUIRED levels are exact.
 */

const HEX_RGB = /^#[0-9a-fA-F]{6}$/;

/**
 * Parse a `#RRGGBB` hex color into 8-bit integer channels.
 * Accepts mixed case (`#0a0C10`). Throws on anything else.
 * @param {string} hex
 * @returns {{ r: number, g: number, b: number }}
 */
export function hexToRgb(hex) {
  if (typeof hex !== 'string' || !HEX_RGB.test(hex)) {
    throw new TypeError(`Invalid hex color: ${JSON.stringify(hex)} — expected #RRGGBB`);
  }
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

/**
 * WCAG 2.x relative luminance: linearize each channel, then
 * L = 0.2126·R + 0.7152·G + 0.0722·B.
 * @param {string} hex
 * @returns {number} luminance in [0, 1], unrounded
 */
export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const linearize = (channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * WCAG contrast ratio between two `#RRGGBB` colors:
 * (Llighter + 0.05) / (Ldarker + 0.05). Argument order does not matter.
 * @param {string} fgHex
 * @param {string} bgHex
 * @returns {number} ratio in [1, 21], unrounded
 */
export function contrastRatio(fgHex, bgHex) {
  const lFg = relativeLuminance(fgHex);
  const lBg = relativeLuminance(bgHex);
  const lighter = Math.max(lFg, lBg);
  const darker = Math.min(lFg, lBg);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * WCAG success-criterion thresholds used by Phase 0 tooling.
 * @type {{ AA_NORMAL: 4.5, AA_LARGE: 3.0, NONE: 0 }}
 */
export const REQUIRED = Object.freeze({
  AA_NORMAL: 4.5,
  AA_LARGE: 3.0,
  NONE: 0,
});
