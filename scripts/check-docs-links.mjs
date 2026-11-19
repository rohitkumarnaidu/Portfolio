#!/usr/bin/env node
/**
 * Verifies that relative links in the documentation tree resolve to real files.
 *
 * Scope: every Markdown file under `docs/` plus the root working documents.
 * External URLs, mail links and pure anchors are ignored; only relative file
 * links are checked, which are the ones that rot when documents move.
 *
 * Run from the repo root:
 *   node scripts/check-docs-links.mjs            # report and exit 1 on breakage
 *   node scripts/check-docs-links.mjs --json     # machine-readable report
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(ROOT, 'docs');
const ROOT_DOCS = [
  'AGENTS.md',
  'DESIGN.md',
  'PROGRESS.md',
  'roadmap.md',
  'README.md',
  'CHANGELOG.md',
];

const LINK_PATTERN = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const REFERENCE_PATTERN = /^\[[^\]]+\]:\s*(\S+)/gm;

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

function isExternal(target) {
  return (
    target.startsWith('http://') ||
    target.startsWith('https://') ||
    target.startsWith('mailto:') ||
    target.startsWith('tel:') ||
    target.startsWith('#') ||
    target.startsWith('/')
  );
}

/**
 * Removes fenced code blocks and inline code spans so that sample syntax such as
 * `[label](href)` inside a code sample is not mistaken for a real link. The
 * replacement keeps newlines, which preserves line numbers for reporting.
 */
function withoutCode(text) {
  return text
    .replace(/^ {0,3}(```|~~~)[^\n]*\n[\s\S]*?^ {0,3}\1[^\n]*$/gm, (block) =>
      block.replace(/[^\n]/g, ' '),
    )
    .replace(/(`+)[^`\n]*\1/g, (span) => span.replace(/[^\n]/g, ' '));
}

/** Returns [{ target, line }] for relative links in one file. */
export function linksIn(file) {
  const text = withoutCode(fs.readFileSync(file, 'utf8'));
  const links = [];
  const lineOf = (index) => text.slice(0, index).split('\n').length;
  for (const match of text.matchAll(LINK_PATTERN)) {
    links.push({ target: match[1], line: lineOf(match.index) });
  }
  for (const match of text.matchAll(REFERENCE_PATTERN)) {
    links.push({ target: match[1], line: lineOf(match.index) });
  }
  return links.filter((link) => !isExternal(link.target));
}

/** Resolves a link target relative to the file that contains it. */
export function resolveTarget(file, target) {
  const clean = target.replace(/^<|>$/g, '').split('#')[0].split('?')[0];
  if (!clean) return null;
  return path.resolve(path.dirname(file), clean);
}

export function scan() {
  const files = [
    ...walk(DOCS),
    ...ROOT_DOCS.map((f) => path.join(ROOT, f)).filter((f) => fs.existsSync(f)),
  ];
  const broken = [];
  let total = 0;
  for (const file of files) {
    for (const link of linksIn(file)) {
      total += 1;
      const resolved = resolveTarget(file, link.target);
      if (!resolved) continue;
      if (!fs.existsSync(resolved)) {
        broken.push({
          file: path.relative(ROOT, file).replaceAll('\\', '/'),
          line: link.line,
          target: link.target,
        });
      }
    }
  }
  return { files: files.length, total, broken };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const { files, total, broken } = scan();
  const json = process.argv.includes('--json');
  if (json) {
    console.log(JSON.stringify({ files, total, broken }, null, 2));
  } else {
    console.log(`checked ${files} files · ${total} relative links · ${broken.length} broken`);
    for (const item of broken) console.log(`${item.file}:${item.line}  ${item.target}`);
  }
  process.exit(broken.length === 0 ? 0 : 1);
}
