import { NextResponse } from 'next/server';
import type { BlogPost } from '@portfolio/shared';
import { SITE_CONFIG } from '@/lib/constants';

export const revalidate = 600;

const API_BASE = `${process.env.API_PROXY_TARGET || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api`;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || SITE_CONFIG.url;

function escapeXml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822(date?: string): string {
  const d = date ? new Date(date) : new Date();
  return d.toUTCString();
}

function buildFeed(posts: BlogPost[]): string {
  const items = posts
    .map((post) => {
      const link = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`;
      const description = post.excerpt || post.seoDescription || '';
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${escapeXml(toRfc822(post.publishedAt || post.createdAt))}</pubDate>
      <author>${escapeXml(post.authorName)}</author>
${post.category ? `      <category>${escapeXml(post.category)}</category>\n` : ''}    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_CONFIG.title)}</title>
    <link>${escapeXml(`${SITE_URL}/blog`)}</link>
    <atom:link href="${escapeXml(`${SITE_URL}/rss.xml`)}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(SITE_CONFIG.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${escapeXml(toRfc822())}</lastBuildDate>
    <generator>Portfolio RSS</generator>
${items}
  </channel>
</rss>`;
}

export async function GET() {
  let posts: BlogPost[] = [];

  try {
    const res = await fetch(`${API_BASE}/portfolio/blog?perPage=50`, {
      next: { revalidate: 600 },
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const body = (await res.json()) as { data?: BlogPost[] } | BlogPost[];
      posts = Array.isArray(body) ? body : (body.data ?? []);
    }
  } catch {
    posts = [];
  }

  const xml = buildFeed(posts);

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=600',
    },
  });
}
