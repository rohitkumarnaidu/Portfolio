import Link from 'next/link';
import type { BlogPost } from '@portfolio/shared';
import { getPublishedBlogPosts } from '@/lib/api';
import { formatDate } from '@/lib/format-date';
import { SITE } from '@/lib/public-content';
import { pageMetadata } from '@/lib/seo';
import { ArrowUpRight } from '@/components/public/icons';

export const revalidate = 300;

export const metadata = pageMetadata({
  title: 'Writing',
  description:
    'Essays and build notes on applied AI, platform engineering, and shipping systems that have to be right.',
  path: '/blog',
});

async function getPosts(): Promise<BlogPost[]> {
  try {
    return await getPublishedBlogPosts({ per_page: 24 });
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <section className="page-head container-ed">
        <div className="page-head__top">
          <span className="kicker">Index / Writing</span>
          <span className="meta">{posts.length ? `${posts.length} published` : 'In progress'}</span>
        </div>

        <h1 className="display display--lg page-head__title reveal">
          Notes from <em>the build.</em>
        </h1>

        <p className="lede page-head__lead reveal reveal--1">
          Short essays on the decisions that do not fit in a README: how a system earns trust, what
          breaks under load, and why the boring answer usually wins.
        </p>
      </section>

      <section className="section container-ed">
        {posts.length ? (
          <div className="post-list">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="post-row">
                <span className="post-row__date">
                  {formatDate(post.publishedAt || post.createdAt)}
                </span>
                <span>
                  <span className="post-row__title">{post.title}</span>
                  {post.excerpt ? <span className="post-row__excerpt">{post.excerpt}</span> : null}
                </span>
                <span className="post-row__arrow" aria-hidden="true">
                  <ArrowUpRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-note">
            <h2 className="empty-note__title">The first note is still being written.</h2>
            <p>
              I am keeping the publishing surface honest: no placeholder essays, no invented
              archive. When a piece is ready it will appear here, and it will be about something
              that actually shipped.
            </p>
            <p className="stack">
              <Link href="/projects" className="link-arrow">
                Read the work instead
                <ArrowUpRight size={15} />
              </Link>
            </p>
            <p className="stack-sm">
              <a
                href={SITE.github}
                target="_blank"
                rel="noopener noreferrer"
                className="link-arrow"
              >
                Browse the repositories
                <ArrowUpRight size={15} />
              </a>
            </p>
          </div>
        )}
      </section>
    </>
  );
}
