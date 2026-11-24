import { describe, expect, it } from 'vitest';
import { buildLlmsTxt } from '@/lib/llms';
import { profilePageSchema } from '@/lib/json-ld';
import { FEATURED_WORK } from '@/lib/public-content';
import robots from '@/app/robots';

/**
 * UTF-8 byte length without relying on `Buffer`. jsdom does not guarantee a
 * Node Buffer; `TextEncoder` is the primary path and the manual counter is
 * surrogate-pair aware so the fallback cannot undercount astral characters.
 */
function utf8Bytes(text: string): number {
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(text).length;
  if (typeof Buffer !== 'undefined') return Buffer.byteLength(text, 'utf8');
  let bytes = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    bytes += cp <= 0x7f ? 1 : cp <= 0x7ff ? 2 : cp <= 0xffff ? 3 : 4;
  }
  return bytes;
}

interface RobotsRule {
  userAgent: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
}

const AI_AGENTS = ['GPTBot', 'CCBot', 'anthropic-ai', 'ClaudeBot', 'PerplexityBot'];
const STANDARD_DISALLOW = ['/admin/', '/api/', '/_next/', '/404', '/500'];

describe('llms.txt', () => {
  it('stays under the 2048-byte budget', () => {
    expect(utf8Bytes(buildLlmsTxt())).toBeLessThan(2048);
  });

  it('leads with the profile H1 and the contact facts', () => {
    const text = buildLlmsTxt();
    expect(text.startsWith('# Rohith Naidu')).toBe(true);
    expect(text).toContain('Forgevena');
    expect(text).toContain('https://github.com/rohitkumarnaidu');
  });

  it('lists every featured project with an absolute case-study URL', () => {
    const text = buildLlmsTxt();
    expect(FEATURED_WORK).toHaveLength(3);
    for (const project of FEATURED_WORK) {
      expect(text).toContain(project.title);
      expect(text).toContain(project.summary.split('. ')[0] ?? project.summary);
    }
    expect(text).toContain('/projects/');
    expect(text).toContain('/projects/forgevena');
  });

  it('keeps the expected section order and contact URL', () => {
    const text = buildLlmsTxt();
    const order = [
      '# Rohith Naidu',
      '## Selected work',
      '## Capabilities',
      '## Toolkit',
      '## Contact',
    ];
    const positions = order.map((marker) => text.indexOf(marker));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    expect(text).toContain('/contact');
  });
});

describe('profilePageSchema', () => {
  it('wraps the Person in a ProfilePage with sameAs and knowsAbout intact', () => {
    const schema = profilePageSchema({
      name: 'Bappadala Rohith Kumar Naidu',
      jobTitle: 'Software engineer',
      url: 'https://example.com',
      sameAs: ['https://github.com/rohitkumarnaidu', 'https://www.npmjs.com/package/forgevena'],
      knowsAbout: ['Applied AI systems', 'Platform engineering', 'Product engineering'],
    });

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('ProfilePage');
    expect(schema.mainEntity['@type']).toBe('Person');
    expect(schema.mainEntity.name).toBe('Bappadala Rohith Kumar Naidu');
    expect(schema.mainEntity.jobTitle).toBe('Software engineer');
    expect(schema.mainEntity.url).toBe('https://example.com');
    expect(schema.mainEntity.sameAs).toEqual([
      'https://github.com/rohitkumarnaidu',
      'https://www.npmjs.com/package/forgevena',
    ]);
    expect(schema.mainEntity.knowsAbout).toEqual([
      'Applied AI systems',
      'Platform engineering',
      'Product engineering',
    ]);
  });
});

describe('robots.txt', () => {
  const rules = robots().rules as RobotsRule[];

  it('has exactly one AI-crawler rule covering all five agents', () => {
    const aiRules = rules.filter(
      (rule) =>
        Array.isArray(rule.userAgent) && rule.userAgent.some((agent) => AI_AGENTS.includes(agent)),
    );
    expect(aiRules).toHaveLength(1);
    const aiRule = aiRules[0]!;
    expect(aiRule.userAgent).toEqual(AI_AGENTS);
    expect(aiRule.allow).toBe('/');
    expect(aiRule.disallow).toEqual(STANDARD_DISALLOW);
  });

  it('keeps the wildcard rule and the sitemap', () => {
    const wildcard = rules.find((rule) => rule.userAgent === '*');
    expect(wildcard?.allow).toBe('/');
    expect(wildcard?.disallow).toEqual(STANDARD_DISALLOW);
    expect(robots().sitemap).toEqual(expect.stringContaining('/sitemap.xml'));
  });

  it('no longer disallows every AI crawler from the whole site', () => {
    for (const rule of rules) {
      const agents = Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent];
      const blocksAll = agents.some((agent) => AI_AGENTS.includes(agent)) && rule.disallow === '/';
      expect(blocksAll).toBe(false);
    }
  });
});
