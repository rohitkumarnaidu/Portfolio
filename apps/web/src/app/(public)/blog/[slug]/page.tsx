import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { BlogPost } from '@portfolio/shared';
import { getPublishedBlogPost } from '@/lib/api';
import { blogPostingSchema } from '@/lib/json-ld';
import { sanitizeHtml } from '@/lib/sanitize';
import { formatDate } from '@/lib/format-date';
import { SITE } from '@/lib/public-content';
import { pageMetadata } from '@/lib/seo';
import { ArrowLeft, ArrowUpRight } from '@/components/public/icons';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const post = await getPublishedBlogPost(params.slug);
    return pageMetadata({
      title: post.seoTitle || post.title,
      description:
        post.seoDescription || post.excerpt || `${post.title} — an essay by ${SITE.shortName}`,
      path: `/blog/${post.slug}`,
      type: 'article',
      images: post.coverImage ? [post.coverImage] : undefined,
      article: {
        publishedTime: post.publishedAt,
        authors: [post.authorName],
      },
    });
  } catch {
    return { title: 'Post not found', robots: { index: false, follow: false } };
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  let post: BlogPost | null = null;
  try {
    post = await getPublishedBlogPost(params.slug);
  } catch {
    post = null;
  }

  if (!post) {
    notFound();
  }

  const published = post.publishedAt || post.createdAt;

  return (
    <article className="article container-ed">
      <header className="article__head">
        <Link href="/blog" className="link-arrow">
          <ArrowLeft size={15} />
          All writing
        </Link>

        <h1 className="display display--lg article__title">{post.title}</h1>

        {post.excerpt ? <p className="lede article__excerpt">{post.excerpt}</p> : null}

        <div className="article__meta">
          <span>{formatDate(published)}</span>
          {post.readTimeMinutes ? <span>{post.readTimeMinutes} min read</span> : null}
          {post.category ? <span>{post.category}</span> : null}
          {post.authorName ? <span>{post.authorName}</span> : null}
        </div>

        {post.coverImage ? (
          <div className="article__cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverImage} alt={`Cover image for ${post.title}`} loading="lazy" />
          </div>
        ) : null}
      </header>

      <div
        className="article__body prose-editorial"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
      />

      <footer className="article__foot">
        <div className="article__foot-inner">
          <span>Written by {post.authorName || SITE.shortName}</span>
          <a href={SITE.github} target="_blank" rel="noopener noreferrer" className="link-arrow">
            Discuss on GitHub
            <ArrowUpRight size={14} />
          </a>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            blogPostingSchema({
              title: post.title,
              description: post.excerpt,
              datePublished: published,
              dateModified: post.updatedAt,
              authorName: post.authorName || SITE.name,
              url: `${SITE.url}/blog/${post.slug}`,
              image: post.coverImage || undefined,
            }),
          ),
        }}
      />
    </article>
  );
}
