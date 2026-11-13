import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogPostingSchema } from '@/lib/json-ld';
import { formatDate } from '@/lib/format-date';
import { getPost, POSTS, SITE } from '@/lib/public-content';
import { pageMetadata } from '@/lib/seo';
import { ArrowLeft, ArrowUpRight } from '@/components/public/icons';

export const revalidate = 300;

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return { title: 'Post not found', robots: { index: false, follow: false } };
  }

  return pageMetadata({
    title: post.title,
    description: post.excerpt || `${post.title} — an essay by ${SITE.shortName}`,
    path: `/blog/${post.slug}`,
    type: 'article',
    article: {
      publishedTime: post.publishedAt,
      authors: [SITE.name],
    },
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  const published = post.publishedAt;

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
          {post.readingTimeMinutes ? <span>{post.readingTimeMinutes} min read</span> : null}
          {post.tags.length ? <span>{post.tags.join(', ')}</span> : null}
        </div>
      </header>

      <div className="article__body prose-editorial">
        {post.body.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </div>

      <footer className="article__foot">
        <div className="article__foot-inner">
          <span>Written by {SITE.name}</span>
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
              dateModified: published,
              authorName: SITE.name,
              url: `${SITE.url}/blog/${post.slug}`,
            }),
          ),
        }}
      />
    </article>
  );
}
