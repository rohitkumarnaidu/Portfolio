/**
 * WCAG AA contrast checker for the Phase 0 token pair matrix — the
 * automated half of spec §3.7's "every semantic text/background pair ≥
 * WCAG AA in both schemes" acceptance criterion.
 *
 * Consumes `../tokens.json`'s contrast matrices: for each declared
 * `contrastPairs` entry it resolves the fg/bg semantic paths per scheme and
 * compares the full-precision contrast ratio from `./wcag.mjs` against the
 * pair's REQUIRED level. The scheme-constant matrices — `publicContrastPairs`
 * (publicSurface × publicSurface) and `statusContrastPairs` (status ×
 * publicSurface) — are evaluated the same way with `scheme: 'constant'`.
 * Comparisons are never rounded and use no epsilon — ratios are rounded only
 * for display (ruling 4). Values that cannot be measured (non-`#RRGGBB`, e.g.
 * rgba) throw instead of passing silently.
 *
 * Structure (ruling 6 — pure evaluator + guarded CLI):
 * - `evaluatePairs(tokens)` — pure; returns one result object per
 *   pair-scheme check (`{ fg, bg, scheme, level, required, actual, pass }`),
 *   never exits the process.
 * - `evaluatePublicPairs(tokens)` / `evaluateStatusPairs(tokens)` — pure;
 *   the scheme-constant matrices, one result each
 *   (`{ fg, bg, scheme: 'constant', level, required, actual, pass, kind }`).
 * - `run(tokens, io)` — prints the check table and, on failure, the
 *   `fg × bg × scheme: actual < required` failure lines; returns the number
 *   of failing checks. The constant matrices are appended only when the
 *   document declares them, so fixtures keep their original counts.
 * - CLI entry (guarded below): maps that count to the process exit code —
 *   0 = every declared pair passes, 1 = at least one failure. CI (task 9)
 *   runs `node src/check-contrast.mjs` and fails on non-zero exit.
 */

import { pathToFileURL } from 'node:url';
import { contrastRatio, REQUIRED } from './wcag.mjs';
import tokens from '../tokens.json' with { type: 'json' };

const SKIN = '3';
const SCHEMES = ['light', 'dark'];

function resolveSemantic(semantic, path, at) {
  let node = semantic;
  for (const part of path.split('.')) {
    if (typeof node !== 'object' || node === null || !(part in node)) {
      throw new Error(`contrastPairs: ${at} "${path}" does not resolve to a semantic token`);
    }
    node = node[part];
  }
  if (typeof node !== 'object' || node === null) {
    throw new Error(`contrastPairs: ${at} "${path}" does not resolve to a semantic token`);
  }
  return node;
}

/**
 * Evaluate every declared pair in every scheme it applies to.
 * @param {object} tokens a tokens document (as in `../tokens.json`)
 * @returns {Array<{fg: string, bg: string, scheme: string, level: string,
 *   required: number, actual: number, pass: boolean}>}
 */
export function evaluatePairs(tokens) {
  const pairs = tokens?.contrastPairs;
  if (!Array.isArray(pairs)) throw new Error('tokens.contrastPairs must be an array');
  const semantic = tokens?.skins?.[SKIN]?.semantic;
  if (typeof semantic !== 'object' || semantic === null) {
    throw new Error(`tokens.skins["${SKIN}"].semantic is missing`);
  }

  const results = [];
  pairs.forEach((pair, index) => {
    const at = `contrastPairs[${index}]`;
    const required = REQUIRED[pair.level];
    if (typeof required !== 'number') {
      throw new Error(
        `${at}.level must be one of ${Object.keys(REQUIRED).join(', ')} — got ${JSON.stringify(pair.level)}`,
      );
    }
    const schemes = 'schemes' in pair ? pair.schemes : SCHEMES;
    if (
      !Array.isArray(schemes) ||
      schemes.length === 0 ||
      !schemes.every((scheme) => SCHEMES.includes(scheme))
    ) {
      throw new Error(`${at}.schemes must be a non-empty array of "light" and/or "dark"`);
    }
    for (const scheme of schemes) {
      const fgValue = resolveSemantic(semantic, pair.fg, `${at}.fg`)[scheme];
      const bgValue = resolveSemantic(semantic, pair.bg, `${at}.bg`)[scheme];
      if (typeof fgValue !== 'string' || typeof bgValue !== 'string') {
        throw new Error(
          `${at}: ${pair.fg}.${scheme} / ${pair.bg}.${scheme} has no measurable string value`,
        );
      }
      let actual;
      try {
        actual = contrastRatio(fgValue, bgValue);
      } catch (error) {
        throw new Error(
          `${at}: ${pair.fg} × ${pair.bg} (${scheme}) cannot be measured — ${error.message}`,
        );
      }
      results.push({
        fg: pair.fg,
        bg: pair.bg,
        scheme,
        level: pair.level,
        required,
        actual,
        pass: actual >= required,
      });
    }
  });
  return results;
}

const display = (ratio) => ratio.toFixed(2);

/** Resolve a scheme-constant DTCG color leaf's `$value` hex. */
function resolveConstant(group, path, at) {
  const leaf = typeof group === 'object' && group !== null ? group[path] : undefined;
  if (typeof leaf !== 'object' || leaf === null || typeof leaf.$value !== 'string') {
    throw new Error(`${at} "${path}" does not resolve to a color token`);
  }
  return leaf.$value;
}

/**
 * Evaluate one scheme-constant matrix. Both sides are declared as `{ fg, bg }`
 * groups, so a status pair can mix `status` (fg) with `publicSurface` (bg).
 * @param {Array<{fg: string, bg: string, level: string}>} pairs
 * @param {{fg: object, bg: object}} groups
 * @param {string} kind
 * @param {string} name matrix name, used in error messages
 */
function evaluateConstantPairs(pairs, groups, kind, name) {
  if (!Array.isArray(pairs)) throw new Error(`tokens.${name} must be an array`);

  return pairs.map((pair, index) => {
    const at = `${name}[${index}]`;
    const required = REQUIRED[pair.level];
    if (typeof required !== 'number') {
      throw new Error(
        `${at}.level must be one of ${Object.keys(REQUIRED).join(', ')} — got ${JSON.stringify(pair.level)}`,
      );
    }
    const fgValue = resolveConstant(groups.fg, pair.fg, `${at}.fg`);
    const bgValue = resolveConstant(groups.bg, pair.bg, `${at}.bg`);
    let actual;
    try {
      actual = contrastRatio(fgValue, bgValue);
    } catch (error) {
      throw new Error(`${at}: ${pair.fg} × ${pair.bg} cannot be measured — ${error.message}`);
    }
    return {
      fg: pair.fg,
      bg: pair.bg,
      scheme: 'constant',
      level: pair.level,
      required,
      actual,
      pass: actual >= required,
      kind,
    };
  });
}

/**
 * Evaluate `tokens.publicContrastPairs` — publicSurface fg × publicSurface bg.
 * @param {object} tokens
 * @returns {Array<object>} one result per pair (`scheme: 'constant'`, `kind: 'public'`)
 */
export function evaluatePublicPairs(tokens) {
  const surface = tokens?.publicSurface;
  if (typeof surface !== 'object' || surface === null) {
    throw new Error('tokens.publicSurface is missing');
  }
  return evaluateConstantPairs(
    tokens.publicContrastPairs,
    { fg: surface, bg: surface },
    'public',
    'publicContrastPairs',
  );
}

/**
 * Evaluate `tokens.statusContrastPairs` — status fg × publicSurface bg.
 * @param {object} tokens
 * @returns {Array<object>} one result per pair (`scheme: 'constant'`, `kind: 'status'`)
 */
export function evaluateStatusPairs(tokens) {
  const status = tokens?.status;
  if (typeof status !== 'object' || status === null) throw new Error('tokens.status is missing');
  const surface = tokens?.publicSurface;
  if (typeof surface !== 'object' || surface === null) {
    throw new Error('tokens.publicSurface is missing');
  }
  return evaluateConstantPairs(
    tokens.statusContrastPairs,
    { fg: status, bg: surface },
    'status',
    'statusContrastPairs',
  );
}

/**
 * Print the check table via `io.log` and return the failure count.
 * @param {object} tokens a tokens document (as in `../tokens.json`)
 * @param {{ log: (line: string) => void }} [io] defaults to `console`
 * @returns {number} number of failing pair-scheme checks
 */
export function run(tokens, io = console) {
  const results = [...evaluatePairs(tokens)];
  // Appended only when declared, so fixtures without the constant matrices
  // keep their original pair-scheme counts.
  if (Array.isArray(tokens?.publicContrastPairs)) results.push(...evaluatePublicPairs(tokens));
  if (Array.isArray(tokens?.statusContrastPairs)) results.push(...evaluateStatusPairs(tokens));
  const failures = results.filter((result) => !result.pass);

  io.log(
    `contrast pair matrix — ${results.length} pair-scheme checks ` +
      `(AA_NORMAL ≥ ${REQUIRED.AA_NORMAL} · AA_LARGE ≥ ${REQUIRED.AA_LARGE} · NONE none)` +
      ' — semantic pairs per scheme, public/status pairs scheme-constant',
  );
  for (const result of results) {
    io.log(
      `${result.pass ? 'pass' : 'FAIL'}  ${result.fg} × ${result.bg} × ${result.scheme}` +
        `  ${display(result.actual)}  ${result.pass ? '≥' : '<'} ${result.required} (${result.level})`,
    );
  }
  if (failures.length > 0) {
    io.log(`${failures.length} failing pair-scheme check(s) — fix before shipping:`);
    for (const failure of failures) {
      io.log(
        `  ${failure.fg} × ${failure.bg} × ${failure.scheme}: ` +
          `${display(failure.actual)} < ${failure.required}`,
      );
    }
  }
  io.log(`${results.length - failures.length}/${results.length} pair-scheme checks pass`);
  return failures.length;
}

const isDirectRun =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  const failures = run(tokens);
  process.exitCode = failures > 0 ? 1 : 0;
}
