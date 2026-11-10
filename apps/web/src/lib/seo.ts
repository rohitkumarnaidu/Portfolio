import type { Metadata } from 'next';
import { SITE } from './public-content';

/**
 * Joins a route path onto the configured site origin while preserving any
 * base path (the GitHub Pages deployment serves from `/Portfolio`).
 */
export function absoluteUrl(path: string): string {
  const base = SITE.url.replace(/\/+$/, '');
  if (!path || path === '/') return `${base}/`;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Canonical + Open Graph + Twitter metadata for a public page. Canonical URLs
 * are absolute so they stay correct under a base path.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = 'website',
  absoluteTitle = false,
  socialTitle,
  images,
  article,
}: {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  /** Skip the `%s — Site` title template (used by the home page). */
  absoluteTitle?: boolean;
  /** Override the generated social title. */
  socialTitle?: string;
  images?: string[];
  article?: { publishedTime?: string; authors?: string[] };
}): Metadata {
  const url = absoluteUrl(path);
  const social = socialTitle ?? `${title} — ${SITE.shortName}`;
  const ogImages = (images ?? []).filter(Boolean).map((src) => ({ url: src }));
  const hasImages = ogImages.length > 0;

  const openGraph: Metadata['openGraph'] =
    type === 'article'
      ? {
          title: social,
          description,
          url,
          siteName: SITE.shortName,
          locale: SITE.locale,
          type: 'article',
          ...(hasImages ? { images: ogImages } : {}),
          ...(article?.publishedTime ? { publishedTime: article.publishedTime } : {}),
          ...(article?.authors?.length ? { authors: article.authors } : {}),
        }
      : {
          title: social,
          description,
          url,
          siteName: SITE.shortName,
          locale: SITE.locale,
          type: 'website',
          ...(hasImages ? { images: ogImages } : {}),
        };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph,
    twitter: {
      card: hasImages ? 'summary_large_image' : 'summary',
      title: social,
      description,
      ...(hasImages ? { images: ogImages.map((image) => image.url) } : {}),
    },
  };
}
