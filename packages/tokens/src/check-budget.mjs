/**
 * Per-skin CSS budget checker for the Phase 0 token foundation — the
 * automated half of spec §3.7's "<8KB each [skin]" acceptance criterion.
 * Controller ruling 15 makes the unit PER SKIN, not per scheme block:
 * one skin emits both `[data-scheme='light'][data-skin='N']` and
 * `[data-scheme='dark'][data-skin='N']`, and both are downloaded, so the
 * raw UTF-8 bytes of every block belonging to one skin are summed and the
 * strict `< 8192` limit applies to that sum. Shared blocks (`:root`,
 * `@media`) are reported as informational overhead and never counted
 * toward a skin.
 *
 * Measurement is exact: a block's measured text starts at the selector's
 * first character and ends at its closing `}`, excluding surrounding
 * whitespace; bytes are `Buffer.byteLength(text, 'utf8')`.
 *
 * Parsing is a brace-depth scanner over top-level rule blocks (not a
 * global selector regex), so selectors nested inside `@media` cannot be
 * double-counted or misattributed. The check fails closed: no
 * skin-attributable blocks, unbalanced braces, or an empty/absent
 * `data-skin` value throw instead of passing silently.
 *
 * Structure (same pattern as `./check-contrast.mjs`):
 * - `evaluateBudget(css)` — pure; returns `{ skins, shared, failures }`,
 *   never exits the process.
 * - `run(css, io)` — prints the per-skin table and shared-overhead line,
 *   then the `FAIL skin N: <bytes> bytes ≥ 8192 (limit)` lines; returns
 *   the number of failing skins.
 * - CLI entry (guarded below) reads `../dist/theme-tokens.css`
 *   module-relative — never cwd-relative — and maps failures (or an
 *   unparseable file) to `process.exitCode = 1`. CI (task 9) fails on a
 *   non-zero exit.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** Per-skin raw-byte budget; strict `<` (8192 itself is over budget). */
export const LIMIT = 8192;

const DIST_FILE = fileURLToPath(new URL('../dist/theme-tokens.css', import.meta.url));

const attributePattern = (name) =>
  new RegExp(`\\[\\s*${name}\\s*(?:=\\s*(?:"([^"]*)"|'([^']*)'|([^\\]\\s]+)))?\\s*\\]`, 'i');

function skipComment(css, index) {
  const end = css.indexOf('*/', index + 2);
  if (end === -1) throw new Error('budget check: unterminated comment');
  return end + 2;
}

function skipString(css, index) {
  const quote = css[index];
  let i = index + 1;
  while (i < css.length) {
    if (css[i] === '\\') {
      i += 2;
      continue;
    }
    if (css[i] === quote) return i + 1;
    i += 1;
  }
  throw new Error('budget check: unterminated string');
}

/**
 * Split CSS into top-level rule blocks with a brace-depth scanner.
 * Each block captures its selector and its full raw text (selector start
 * through the closing brace, surrounding whitespace excluded). Comments
 * and strings are skipped while counting braces but stay in `raw`, since
 * they are still downloaded bytes.
 * @param {string} css
 * @returns {Array<{selector: string, raw: string}>}
 */
function parseBlocks(css) {
  if (typeof css !== 'string') throw new TypeError('budget check: css must be a string');
  const blocks = [];
  let i = 0;

  while (i < css.length) {
    // Skip whitespace and comments between blocks.
    while (i < css.length) {
      if (/\s/.test(css[i])) {
        i += 1;
      } else if (css[i] === '/' && css[i + 1] === '*') {
        i = skipComment(css, i);
      } else {
        break;
      }
    }
    if (i >= css.length) break;
    if (css[i] === '}') throw new Error('budget check: unbalanced braces — unexpected "}"');

    const start = i;
    // Selector: everything up to the opening brace, skipping strings/comments.
    while (i < css.length && css[i] !== '{') {
      if (css[i] === '}') {
        throw new Error('budget check: unbalanced braces — unexpected "}" inside a selector');
      }
      if (css[i] === '/' && css[i + 1] === '*') {
        i = skipComment(css, i);
      } else if (css[i] === '"' || css[i] === "'") {
        i = skipString(css, i);
      } else {
        i += 1;
      }
    }
    if (i >= css.length) {
      const dangling = css.slice(start).trim();
      throw new Error(`budget check: unbalanced braces — rule "${dangling}" has no opening "{"`);
    }

    const selector = css.slice(start, i).trim();
    let depth = 1;
    let j = i + 1;
    while (j < css.length) {
      if (css[j] === '/' && css[j + 1] === '*') {
        j = skipComment(css, j);
      } else if (css[j] === '"' || css[j] === "'") {
        j = skipString(css, j);
      } else if (css[j] === '{') {
        depth += 1;
        j += 1;
      } else if (css[j] === '}') {
        depth -= 1;
        if (depth === 0) break;
        j += 1;
      } else {
        j += 1;
      }
    }
    if (depth !== 0) {
      throw new Error(`budget check: unbalanced braces — "${selector}" is missing its closing "}"`);
    }

    blocks.push({ selector, raw: css.slice(start, j + 1).trim() });
    i = j + 1;
  }

  if (blocks.length === 0) throw new Error('budget check: no CSS rule blocks found');
  return blocks;
}

/**
 * Read an attribute from a selector, distinguishing "absent" from
 * "present but valueless" (`[data-skin]`) and "present but empty"
 * (`[data-skin='']`).
 * @returns {{present: boolean, value: string | null}}
 */
function readAttribute(selector, name) {
  const match = attributePattern(name).exec(selector);
  if (!match) return { present: false, value: null };
  if (match[2] !== undefined) return { present: true, value: match[2] };
  if (match[3] !== undefined) return { present: true, value: match[3] };
  if (match[4] !== undefined) return { present: true, value: match[4] };
  return { present: true, value: null };
}

/**
 * Attribute a top-level block to its (scheme, skin), or `null` when the
 * selector is shared overhead. Any selector that references only one of
 * the two attributes, or has an empty/valueless value, throws: silently
 * skipping such a block would undercount a skin's real download size.
 * @returns {{scheme: string, skin: string} | null}
 */
function attributeSkin(selector) {
  const scheme = readAttribute(selector, 'data-scheme');
  const skin = readAttribute(selector, 'data-skin');
  if (!scheme.present && !skin.present) return null;
  if (!scheme.present) {
    throw new Error(
      `budget check: selector "${selector}" has data-skin but no data-scheme attribute`,
    );
  }
  if (!skin.present) {
    throw new Error(
      `budget check: selector "${selector}" has data-scheme but no data-skin attribute`,
    );
  }
  if (scheme.value === null || scheme.value === '') {
    throw new Error(
      `budget check: selector "${selector}" has an empty or valueless data-scheme attribute`,
    );
  }
  if (skin.value === null || skin.value === '') {
    throw new Error(`budget check: selector "${selector}" has an empty or absent data-skin value`);
  }
  return { scheme: scheme.value, skin: skin.value };
}

/**
 * Evaluate the per-skin budget for a CSS document.
 * @param {string} css
 * @returns {{
 *   skins: Array<{skin: string, schemes: Array<{scheme: string, bytes: number}>,
 *     bytes: number, pass: boolean}>,
 *   shared: {bytes: number, blocks: Array<{selector: string, bytes: number}>},
 *   failures: Array<{skin: string, bytes: number}>}}
 */
export function evaluateBudget(css) {
  const blocks = parseBlocks(css);
  const groups = new Map();
  const sharedBlocks = [];

  for (const block of blocks) {
    const attribution = attributeSkin(block.selector);
    const bytes = Buffer.byteLength(block.raw, 'utf8');
    if (attribution === null) {
      sharedBlocks.push({ selector: block.selector, bytes });
      continue;
    }
    if (!groups.has(attribution.skin)) groups.set(attribution.skin, []);
    groups.get(attribution.skin).push({ scheme: attribution.scheme, bytes });
  }

  if (groups.size === 0) {
    throw new Error(
      'budget check: no [data-scheme=...][data-skin=...] rule blocks found — ' +
        'refusing to pass without skin-attributable CSS',
    );
  }

  const skins = [...groups.entries()]
    .map(([skin, schemes]) => {
      const bytes = schemes.reduce((sum, entry) => sum + entry.bytes, 0);
      return { skin, schemes, bytes, pass: bytes < LIMIT };
    })
    .sort((a, b) => a.skin.localeCompare(b.skin, undefined, { numeric: true }));

  const failures = skins
    .filter((skin) => !skin.pass)
    .map((skin) => ({ skin: skin.skin, bytes: skin.bytes }));

  const shared = {
    bytes: sharedBlocks.reduce((sum, block) => sum + block.bytes, 0),
    blocks: sharedBlocks,
  };

  return { skins, shared, failures };
}

/** Render the per-skin table as aligned lines (skin · schemes · total · result). */
function formatTable(skins) {
  const schemes = [...new Set(skins.flatMap((skin) => skin.schemes.map((entry) => entry.scheme)))];
  const header = ['skin', ...schemes, 'total', 'result'];
  const rows = skins.map((skin) => [
    skin.skin,
    ...schemes.map((scheme) => {
      const entry = skin.schemes.find((candidate) => candidate.scheme === scheme);
      return entry === undefined ? '—' : `${entry.bytes} B`;
    }),
    `${skin.bytes} B`,
    skin.pass ? 'pass' : 'FAIL',
  ]);
  const widths = header.map((label, column) =>
    Math.max(label.length, ...rows.map((row) => row[column].length)),
  );
  const line = (cells) =>
    cells
      .map((cell, column) => cell.padEnd(widths[column]))
      .join('  ')
      .trimEnd();
  return [line(header), ...rows.map(line)];
}

/**
 * Print the per-skin table and return the failure count.
 * @param {string} css
 * @param {{log: (line: string) => void}} [io] defaults to `console`
 * @returns {number} number of skins at or above `LIMIT`
 */
export function run(css, io = console) {
  const { skins, shared, failures } = evaluateBudget(css);

  io.log(`skin CSS budget — per-skin limit ${LIMIT} B, strict < (spec §3.7)`);
  for (const line of formatTable(skins)) io.log(line);
  io.log(
    `shared overhead (not counted toward any skin): ${shared.bytes} B — ` +
      `${shared.blocks.map((block) => block.selector).join(', ')}`,
  );
  if (failures.length > 0) {
    io.log(`${failures.length} failing skin(s) — fix before shipping:`);
    for (const failure of failures) {
      io.log(`FAIL skin ${failure.skin}: ${failure.bytes} bytes ≥ ${LIMIT} (limit)`);
    }
  }
  io.log(`${skins.length} skin(s) checked, ${failures.length} failing`);
  return failures.length;
}

const isDirectRun =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const css = readFileSync(DIST_FILE, 'utf8');
    process.exitCode = run(css) > 0 ? 1 : 0;
  } catch (error) {
    console.error(`budget check failed: ${error.message}`);
    process.exitCode = 1;
  }
}
