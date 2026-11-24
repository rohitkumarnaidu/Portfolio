/**
 * Syntax check for the token package's ESM sources.
 *
 * `node --check` still validates ESM syntax without executing the module, so
 * a typo in `src/` or `test/` fails the lint script instead of surfacing as a
 * runtime error in CI or a pre-commit hook.
 *
 * Usage: `node scripts/check-syntax.mjs src/*.mjs test/*.mjs`
 *
 * Windows shells pass globs through literally, so one level of `dir/*.ext`
 * is expanded here. An already-expanded argument passes straight through.
 */

import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';

const expand = (pattern) => {
  if (!pattern.includes('*')) return [pattern];
  const directory = dirname(pattern);
  const suffix = basename(pattern).replace(/^\*/, '');
  return readdirSync(resolve(directory))
    .filter((name) => name.endsWith(suffix))
    .map((name) => resolve(directory, name))
    .sort();
};

const files = process.argv.slice(2).flatMap(expand);

if (files.length === 0) {
  console.error('check-syntax: no files given — pass file paths or dir/*.mjs globs');
  process.exitCode = 1;
} else {
  for (const file of files) {
    execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  }
}
