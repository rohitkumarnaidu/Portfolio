import type { Metadata } from 'next';
import { getBlogPost } from '@/lib/api';
import { BlogPostClient } from './client';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const post = await getBlogPost(params.slug);
    return {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      openGraph: {
        title: post.seo_title || post.title,
        description: post.seo_description || post.excerpt,
        type: 'article',
        publishedTime: post.published_at,
        authors: [post.author],
        images: post.cover_image ? [{ url: post.cover_image }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.seo_title || post.title,
        description: post.seo_description || post.excerpt,
        images: post.cover_image ? [post.cover_image] : [],
      },
    };
  } catch {
    return { title: 'Post not found' };
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return <BlogPostClient slug={params.slug} />;
}
