import { CAPABILITIES, FEATURED_WORK, SITE, TOOLKIT } from './public-content';
import { absoluteUrl } from './seo';

/**
 * `llms.txt` — a compact, machine-readable index of the public site.
 *
 * Deliberately small (under 2 KB): titles, absolute links, and one-line
 * summaries only. Full project narratives live on the case-study pages; there
 * is no `llms-full.txt` or Markdown mirror (spec §12 Q3).
 */
export function buildLlmsTxt(): string {
  const work = FEATURED_WORK.map((project) =>
    [`### ${project.title}`, absoluteUrl(`/projects/${project.slug}`), project.summary].join('\n'),
  ).join('\n\n');

  const capabilities = CAPABILITIES.map(
    (capability) => `- ${capability.title} — ${capability.body}`,
  ).join('\n');

  const toolkit = TOOLKIT.map((group) => group.label).join(', ');

  return `# ${SITE.shortName}

> ${SITE.description}

- Role: ${SITE.role}
- Availability: ${SITE.availabilityLabel}
- Site: ${SITE.url}

## Selected work

${work}

## Capabilities

${capabilities}

## Toolkit

${toolkit}

## Contact

- Contact: ${absoluteUrl('/contact')}
- GitHub: ${SITE.github}
`;
}
