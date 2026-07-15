import type { Metadata } from 'next';
import { getBlogPost } from '@/lib/api';
import { blogPostingSchema } from '@/lib/json-ld';
import { BlogPostClient } from './client';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const post = await getBlogPost(params.slug);
    return {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      openGraph: {
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt,
        type: 'article',
        publishedTime: post.publishedAt,
        authors: [post.authorName],
        images: post.coverImage ? [{ url: post.coverImage }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt,
        images: post.coverImage ? [post.coverImage] : [],
      },
    };
  } catch {
    return { title: 'Post not found' };
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  let post;
  try {
    post = await getBlogPost(params.slug);
  } catch {
    return <BlogPostClient slug={params.slug} />;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

  const jsonLd = blogPostingSchema({
    title: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    authorName: post.authorName,
    url: `${baseUrl}/blog/${post.slug}`,
    image: post.coverImage,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostClient slug={params.slug} />
    </>
  );
}
