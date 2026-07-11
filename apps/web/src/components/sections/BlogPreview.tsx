'use client';

import { usePublicBlogPosts } from '@/lib/hooks/usePublicData';
import { useInView } from '@/hooks/useInView';
import { SECTION_IDS, ANIMATION, ROUTES } from '@/lib/constants';
import { SectionWrapper } from '@/components/layout/SectionWrapper';

// ── Types ───────────────────────────────────────────────────

interface BlogPostPreview {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly category: string;
  readonly readTime: number;
  readonly publishedAt: string;
  readonly tags: readonly string[];
}

// ── Helpers ─────────────────────────────────────────────────

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Sub-components ──────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-caption font-medium bg-accent-50 text-accent-700 dark:bg-accent-50 dark:text-accent-300 [html[data-theme='dark']_&]:bg-accent-50 [html[data-theme='dark']_&]:text-accent-300">
      {category}
    </span>
  );
}

function BlogCard({
  post,
  index,
  inView,
}: {
  post: BlogPostPreview;
  index: number;
  inView: boolean;
}) {
  return (
    <article
      className={`group glass-subtle rounded-2xl overflow-hidden transition-all duration-700 hover:shadow-md ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * ANIMATION.STAGGER_DELAY + 200}ms` }}
    >
      {/* Gradient placeholder for cover image */}
      <div
        className="h-48 bg-gradient-to-br from-accent-100 via-accent-200 to-accent-300 dark:from-accent-800 dark:via-accent-700 dark:to-accent-600 group-hover:opacity-90 transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="p-6">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-3">
          <CategoryBadge category={post.category} />
          <span className="text-caption text-text-tertiary">
            {post.readTime} min read
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display text-h4 text-text-primary mb-2 group-hover:text-accent-500 transition-colors duration-200">
          <a href={ROUTES.BLOG_POST(post.slug)} className="hover:no-underline">
            {post.title}
          </a>
        </h3>

        {/* Excerpt */}
        <p className="text-body-sm text-text-secondary mb-4 line-clamp-2">
          {post.excerpt}
        </p>

        {/* Date */}
        <time
          dateTime={post.publishedAt}
          className="text-caption text-text-tertiary"
        >
          {formatDate(post.publishedAt)}
        </time>
      </div>
    </article>
  );
}

// ── Main Component ──────────────────────────────────────────

import type { Section } from '@portfolio/shared';

interface BlogSectionContent {
  title?: string;
  subtitle?: string;
}

export function BlogPreview({ data }: { data?: Section }) {
  const { data: apiPosts, isLoading } = usePublicBlogPosts();
  const content = (data?.content ?? {}) as BlogSectionContent;
  const { ref, inView } = useInView<HTMLDivElement>(ANIMATION.REVEAL_THRESHOLD);

  const posts: BlogPostPreview[] = apiPosts
    ? apiPosts.slice(0, 3).map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        readTime: post.read_time,
        publishedAt: post.published_at ?? post.created_at,
        tags: post.tags,
      }))
    : [];

  if (isLoading) {
    return (
      <SectionWrapper
        id={SECTION_IDS.BLOG}
        animate={false}
      >
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-surface-elevated rounded-lg mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-surface-secondary border border-border-primary overflow-hidden">
                <div className="h-48 bg-surface-elevated" />
                <div className="p-6 space-y-3">
                  <div className="flex gap-3">
                    <div className="h-5 w-20 bg-surface-elevated rounded" />
                    <div className="h-5 w-16 bg-surface-elevated rounded" />
                  </div>
                  <div className="h-5 w-3/4 bg-surface-elevated rounded" />
                  <div className="h-4 w-full bg-surface-elevated rounded" />
                  <div className="h-4 w-1/2 bg-surface-elevated rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      id={SECTION_IDS.BLOG}
      animate={false}
    >
      <div ref={ref}>
        {/* Section Header */}
        <div
          className={`flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 transition-all duration-700 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="max-w-2xl">
            <span className="text-caption font-medium text-accent-500 uppercase tracking-widest">
              Blog
            </span>
            <h2
              id="heading-blog"
              className="font-display text-h2 text-text-primary mt-3 mb-2 text-balance"
            >
              {content.title || 'Latest thoughts'}
            </h2>
            <p className="text-body-lg text-text-secondary text-pretty">
              {content.subtitle || 'Writing about web development, performance, accessibility, and engineering culture.'}
            </p>
          </div>

          <a
            href={ROUTES.BLOG}
            className="inline-flex items-center gap-2 text-body font-medium text-accent-500 hover:text-accent-600 transition-colors duration-200 whitespace-nowrap hover:no-underline"
          >
            View all posts
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>

        {/* Post Grid / Empty State */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {posts.map((post, index) => (
              <BlogCard key={post.id} post={post} index={index} inView={inView} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-elevated flex items-center justify-center">
              <svg className="w-8 h-8 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-body text-text-secondary">No blog posts yet.</p>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
