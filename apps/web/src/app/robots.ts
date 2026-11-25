import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/public-content';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = SITE.url;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/_next/', '/404', '/500'],
      },
      {
        userAgent: ['GPTBot', 'CCBot', 'anthropic-ai', 'ClaudeBot', 'PerplexityBot'],
        allow: '/',
        disallow: ['/admin/', '/api/', '/_next/', '/404', '/500'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
