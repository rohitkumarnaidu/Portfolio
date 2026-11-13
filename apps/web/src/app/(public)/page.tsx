import Link from 'next/link';
import { formatDate } from '@/lib/format-date';
import {
  ABOUT_PARAGRAPHS,
  CAPABILITIES,
  POSTS,
  PRINCIPLES,
  SITE,
  WORK,
} from '@/lib/public-content';
import { pageMetadata } from '@/lib/seo';
import { ArrowUpRight } from '@/components/public/icons';
import { SectionHead } from '@/components/public/SectionHead';

export const revalidate = 300;

export const metadata = pageMetadata({
  title: `${SITE.shortName} — ${SITE.role}`,
  description: SITE.description,
  path: '/',
  absoluteTitle: true,
  socialTitle: `${SITE.shortName} — ${SITE.role}`,
});

export default function HomePage() {
  const posts = POSTS.slice(0, 3);

  return (
    <>
      <section className="hero container-ed">
        <div className="hero__top">
          <span className="kicker">Software engineer · Portfolio 2026</span>
          <span className="hero__top-meta">Applied AI / Platform / Product</span>
        </div>

        <h1 className="display display--xl hero__title reveal">
          I build systems that <em>have to be right.</em>
        </h1>

        <div className="hero__grid">
          <p className="hero__lead reveal reveal--1">{SITE.intro}</p>

          <div className="hero__side reveal reveal--2">
            <div className="hero__actions">
              <Link href="/projects" className="link-arrow">
                Selected work
                <ArrowUpRight size={15} />
              </Link>
              <a
                href={SITE.github}
                target="_blank"
                rel="noopener noreferrer"
                className="link-arrow"
              >
                GitHub
                <ArrowUpRight size={15} />
              </a>
            </div>

            <div className="hero__stats">
              <div className="hero__stat">
                <span className="hero__stat-value">06</span>
                <span className="hero__stat-label">Systems indexed</span>
              </div>
              <div className="hero__stat">
                <span className="hero__stat-value">03</span>
                <span className="hero__stat-label">Live products</span>
              </div>
              <div className="hero__stat">
                <span className="hero__stat-value">31</span>
                <span className="hero__stat-label">Public repos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section container-ed">
        <SectionHead index="01" title="Selected work" aside="2025 — 2026" />

        <div className="work-index">
          {WORK.map((project, index) => (
            <Link key={project.slug} href={`/projects/${project.slug}`} className="work-row">
              <span className="work-row__num">{String(index + 1).padStart(2, '0')}</span>

              <div>
                <span className="work-row__kicker">{project.kicker}</span>
                <h3 className="work-row__title">{project.title}</h3>
              </div>

              <div>
                <p className="work-row__summary">{project.summary}</p>
                <p className="work-row__meta">
                  <span>{project.year}</span>
                  <span>{project.stack.slice(0, 3).join(' · ')}</span>
                </p>
              </div>

              <span className="work-row__arrow" aria-hidden="true">
                <ArrowUpRight />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-ed">
        <div className="statement">
          <span className="kicker">Operating principle</span>
          <div>
            <p className="statement__text">
              The model can be probabilistic. <em>The system around it cannot be.</em>
            </p>
            <p className="statement__note">
              Every project here puts a deterministic layer around the uncertain part: rules around
              a model, a state machine around a task, a signed artifact around a release.
            </p>
          </div>
        </div>
      </section>

      <section className="section container-ed">
        <SectionHead index="02" title="What I work on" aside="Three disciplines" />

        <div className="cap-grid">
          {CAPABILITIES.map((capability) => (
            <article key={capability.index} className="cap">
              <span className="cap__index">{capability.index}</span>
              <h3 className="cap__title">{capability.title}</h3>
              <p className="cap__body">{capability.body}</p>
              <ul className="cap__list">
                {capability.detail.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section container-ed">
        <SectionHead index="03" title="About" aside="The short version" />

        <div className="about-grid about-grid--flush">
          <div className="about-copy">
            <p>{ABOUT_PARAGRAPHS[0]}</p>
            <p>{ABOUT_PARAGRAPHS[1]}</p>
            <p className="stack-lg">
              <Link href="/about" className="link-arrow">
                More about how I work
                <ArrowUpRight size={15} />
              </Link>
            </p>
          </div>

          <div className="about-aside">
            <div className="about-aside__group">
              <h2>Working principles</h2>
              {PRINCIPLES.slice(0, 3).map((principle) => (
                <p key={principle.index} className="about-aside__principle">
                  <span className="about-aside__index">{principle.index}</span> {principle.title}{' '}
                  {principle.body}
                </p>
              ))}
            </div>

            <div className="about-aside__group">
              <h2>Elsewhere</h2>
              <p>
                <a
                  href={SITE.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  github.com/{SITE.githubHandle}
                </a>
                <br />
                <a
                  href={SITE.npm}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  npm — forgevena
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section container-ed">
        <SectionHead
          index="04"
          title="Writing"
          aside={posts.length ? `${posts.length} recent notes` : 'In progress'}
        />

        {posts.length ? (
          <div className="post-list">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="post-row">
                <span className="post-row__date">{formatDate(post.publishedAt)}</span>
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
            <h3 className="empty-note__title">Notes from the build, eventually.</h3>
            <p>
              I would rather publish the code first and the writing second. The repositories are
              public now; essays and build notes will land here as they are finished.
            </p>
            <p className="stack">
              <a
                href={SITE.github}
                target="_blank"
                rel="noopener noreferrer"
                className="link-arrow"
              >
                Read the source instead
                <ArrowUpRight size={15} />
              </a>
            </p>
          </div>
        )}
      </section>
    </>
  );
}
