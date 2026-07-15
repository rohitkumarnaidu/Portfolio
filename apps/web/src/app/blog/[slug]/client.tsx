'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@portfolio/ui';
import { BlogDetailSkeleton } from '@/components/skeletons/BlogDetailSkeleton';
import { usePublicBlogPosts } from '@/lib/hooks/usePublicData';
import { sanitizeHtml } from '@/lib/sanitize';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function BlogPostClient({ slug }: { slug: string }) {
  const { data: posts, isLoading } = usePublicBlogPosts();

  const post = useMemo(() => {
    if (!posts) return null;
    return posts.find((p) => p.slug === slug) || null;
  }, [posts, slug]);

  const relatedPosts = useMemo(() => {
    if (!post || !posts) return [];
    return posts.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);
  }, [post, posts]);

  if (isLoading) {
    return <BlogDetailSkeleton />;
  }

  if (!post) {
    return (
      <div className="pt-32 pb-24 section-container text-center">
        <h1 className="text-h2 font-display text-text-primary mb-4">Post not found</h1>
        <p className="text-body text-text-secondary mb-6">
          The article you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link href="/blog" className="text-accent-500 hover:text-accent-600">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="pt-32 pb-24">
      <div className="section-container max-w-3xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-8 transition-colors"
          aria-label="Back to blog listing"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Blog
        </Link>

        <header className="mb-12">
          <div
            className="flex items-center gap-4 mb-6 text-sm flex-wrap"
            role="list"
            aria-label="Post metadata"
          >
            <span role="listitem" className="text-text-tertiary">
              {formatDate(post.publishedAt || post.createdAt)}
            </span>
            <span className="w-1 h-1 rounded-full bg-border-accent" aria-hidden="true" />
            <span role="listitem" className="text-text-tertiary">
              {post.readTimeMinutes} min read
            </span>
            <span className="w-1 h-1 rounded-full bg-border-accent" aria-hidden="true" />
            <span role="listitem" className="text-accent-500 font-medium">
              {post.category}
            </span>
          </div>

          <h1 className="text-display font-display text-text-primary mb-6">{post.title}</h1>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2" role="list" aria-label="Post tags">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="neutral">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {post.coverImage && (
            <div className="mt-8 -mx-6 md:-mx-10">
              <img
                src={post.coverImage}
                alt={`Cover image for ${post.title}`}
                className="w-full rounded-2xl object-cover max-h-[400px]"
                loading="lazy"
              />
            </div>
          )}
        </header>

        <div
          className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-display prose-headings:text-text-primary prose-p:text-text-secondary prose-a:text-accent-500 prose-code:text-accent-500 prose-code:bg-surface-elevated prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-surface-secondary prose-pre:border prose-pre:border-border-primary prose-img:rounded-xl prose-strong:text-text-primary prose-blockquote:border-accent-500 prose-blockquote:text-text-secondary"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
          role="article"
          aria-label="Article content"
        />

        {post.authorName && (
          <div className="mt-12 pt-8 border-t border-border-primary">
            <p className="text-sm text-text-tertiary">
              Written by <span className="text-text-primary font-medium">{post.authorName}</span>
            </p>
          </div>
        )}

        {relatedPosts.length > 0 && (
          <section
            className="mt-16 pt-8 border-t border-border-primary"
            aria-labelledby="related-heading"
          >
            <h2 id="related-heading" className="text-h2 font-display text-text-primary mb-6">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="list">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/blog/${rp.slug}`}
                  className="group hover:no-underline"
                  role="listitem"
                >
                  <div className="p-4 rounded-xl bg-surface-secondary border border-border-primary hover:border-border-accent transition-all h-full">
                    <p className="text-xs text-text-tertiary mb-2">
                      {formatDate(rp.publishedAt || rp.createdAt)}
                    </p>
                    <h3 className="text-sm font-medium text-text-primary group-hover:text-accent-500 transition-colors">
                      {rp.title}
                    </h3>
                    <p className="text-xs text-text-tertiary mt-1 line-clamp-2">{rp.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
