import { describe, it, expect } from 'vitest';
import { DEFAULT_OG_IMAGE, absoluteUrl, pageMetadata } from '@/lib/seo';

/**
 * `pageMetadata` is the single source of canonical, Open Graph and Twitter
 * metadata for every public page. These tests pin the image defaults and the
 * base-path handling that the GitHub Pages deployment depends on.
 */
describe('pageMetadata', () => {
  it('defaults to the static OG image and a large twitter card', () => {
    const meta = pageMetadata({
      title: 'Work',
      description: 'Selected systems.',
      path: '/projects',
    });

    expect(DEFAULT_OG_IMAGE).toBe('/og/og-default.png');
    expect(meta.openGraph?.images).toEqual([{ url: absoluteUrl('/og/og-default.png') }]);
    expect(meta.twitter?.card).toBe('summary_large_image');
    expect(meta.twitter?.images).toEqual([absoluteUrl('/og/og-default.png')]);
  });

  it('prefixes a caller-supplied root-relative image through absoluteUrl', () => {
    const meta = pageMetadata({
      title: 'Work',
      description: 'Selected systems.',
      path: '/projects',
      images: ['/images/cover.png'],
    });

    expect(meta.openGraph?.images).toEqual([{ url: absoluteUrl('/images/cover.png') }]);
    expect(meta.twitter?.images).toEqual([absoluteUrl('/images/cover.png')]);
  });

  it('leaves an already-absolute image untouched', () => {
    const meta = pageMetadata({
      title: 'Work',
      description: 'Selected systems.',
      path: '/projects',
      images: ['https://cdn.example.com/cover.png'],
    });

    expect(meta.openGraph?.images).toEqual([{ url: 'https://cdn.example.com/cover.png' }]);
    expect(meta.twitter?.images).toEqual(['https://cdn.example.com/cover.png']);
  });

  it('keeps the default image for article metadata', () => {
    const meta = pageMetadata({
      title: 'On provable releases',
      description: 'A note on shipping evidence.',
      path: '/blog/on-provable-releases',
      type: 'article',
      article: {
        publishedTime: '2026-11-01T00:00:00.000Z',
        authors: ['Rohith Naidu'],
      },
    });

    expect(meta.openGraph?.images).toEqual([{ url: absoluteUrl('/og/og-default.png') }]);
    const article = meta.openGraph as {
      type?: string;
      publishedTime?: string;
      authors?: string[];
    };
    expect(article.type).toBe('article');
    expect(article.publishedTime).toBe('2026-11-01T00:00:00.000Z');
    expect(article.authors).toEqual(['Rohith Naidu']);
  });

  it('derives the canonical URL from absoluteUrl(path)', () => {
    const meta = pageMetadata({
      title: 'Work',
      description: 'Selected systems.',
      path: '/projects',
    });

    expect(meta.alternates?.canonical).toBe(absoluteUrl('/projects'));
  });
});
