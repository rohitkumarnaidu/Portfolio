#!/usr/bin/env node
/**
 * Regenerates docs/MASTER-INDEX.md from the directories that exist.
 *
 * The index used to be hand-written for a three-tier platform and drifted out
 * of date. This keeps it honest.
 */
const fs = require('fs');
const path = require('path');

const DOCS = path.join(__dirname, '..', 'docs');

const TITLES = {
  '00-overview': 'Overview',
  '01-product': 'Product',
  '02-strategy': 'Strategy',
  '03-requirements': 'Requirements',
  '04-design': 'Design system',
  '05-architecture': 'Architecture',
  '07-frontend': 'Frontend',
  '13-testing': 'Testing',
  '15-performance': 'Performance',
  '16-accessibility': 'Accessibility',
  '17-seo': 'SEO',
  '21-operations': 'Operations',
  '22-release': 'Release',
  '23-governance': 'Governance',
  '24-development': 'Development',
  '27-decisions': 'Decision records',
  '28-templates': 'Templates',
  '29-checklists': 'Checklists',
  '31-playbooks': 'Playbooks',
  '33-onboarding': 'Onboarding',
  '34-contributing': 'Contributing',
  '35-quality': 'Quality',
};

const dirs = fs
  .readdirSync(DOCS, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const lines = [
  '# Documentation Index',
  '',
  'Every document in this repository, grouped by category. The directory',
  'numbering is historical — categories were removed when the backend, the AI',
  'service and the admin dashboard were deleted, and the gaps are left so',
  'existing links keep working.',
  '',
];

for (const dir of dirs) {
  const title = TITLES[dir] || dir;
  lines.push(`## ${title} (\`${dir}\`)`, '');
  const files = fs
    .readdirSync(path.join(DOCS, dir))
    .filter((file) => file.endsWith('.md'))
    .sort();
  for (const file of files) {
    lines.push(`- [${file.replace(/\.md$/, '')}](${dir}/${file})`);
  }
  lines.push('');
}

const out = path.join(DOCS, 'MASTER-INDEX.md');
fs.writeFileSync(out, lines.join('\n'));
console.log(`wrote ${out} (${dirs.length} categories)`);
