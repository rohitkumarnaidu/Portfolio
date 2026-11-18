#!/usr/bin/env node
/**
 * Guard against raw hex colors in component code (spec §3.7 criterion 1).
 *
 * Every color must come from `packages/tokens/tokens.json` — either through a
 * generated CSS custom property (`@portfolio/tokens/theme.css`) or, where a
 * literal is unavoidable (WebGL materials, SVG props, metadata), through
 * `apps/web/src/lib/design-tokens.ts`.
 *
 * Run from anywhere: the repo root is resolved from this file's location.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

export const SCAN_TARGETS = [
  'apps/web/src',
  'packages/ui/src',
  'packages/shared/src',
  'apps/web/tailwind.config.ts',
];

const EXTENSIONS = new Set(['.css', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', 'coverage', 'generated']);

// #RGB, #RGBA, #RRGGBB, #RRGGBBAA. The lookbehind keeps URL fragments and
// identifiers (`foo#abc`) out; `\b` keeps `#abc123def` from matching `#abc123`.
export const HEX_PATTERN = /(?<![&\w])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g;

function* walk(path) {
  let stats;
  try {
    stats = statSync(path);
  } catch {
    return; // Target may not exist in a trimmed checkout; treat as empty.
  }
  if (stats.isFile()) {
    if (EXTENSIONS.has(path.slice(path.lastIndexOf('.')))) yield path;
    return;
  }
  for (const entry of readdirSync(path)) {
    if (SKIP_DIRS.has(entry)) continue;
    yield* walk(join(path, entry));
  }
}

/** Returns `{ file, line, column, value }` for every raw hex color found. */
export function scanForHex(root = REPO_ROOT) {
  const violations = [];
  for (const target of SCAN_TARGETS) {
    for (const file of walk(join(root, target))) {
      const lines = readFileSync(file, 'utf8').split(/\r?\n/);
      lines.forEach((text, index) => {
        for (const match of text.matchAll(HEX_PATTERN)) {
          violations.push({
            file: relative(root, file).replaceAll('\\', '/'),
            line: index + 1,
            column: match.index + 1,
            value: match[0],
          });
        }
      });
    }
  }
  return violations;
}

export function run(root = REPO_ROOT) {
  const violations = scanForHex(root);
  if (violations.length === 0) {
    console.log('No raw hex colors outside packages/tokens.');
    return 0;
  }
  console.error(
    `Found ${violations.length} raw hex color(s). Use a CSS custom property from ` +
      `@portfolio/tokens/theme.css, or add the value to packages/tokens/tokens.json.`,
  );
  for (const violation of violations) {
    console.error(`  ${violation.file}:${violation.line}:${violation.column}  ${violation.value}`);
  }
  return 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = run();
}
