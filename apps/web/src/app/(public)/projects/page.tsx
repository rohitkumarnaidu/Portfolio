import Link from 'next/link';
import { SITE, WORK } from '@/lib/public-content';
import { pageMetadata } from '@/lib/seo';
import { ArrowUpRight } from '@/components/public/icons';

export const revalidate = 60;

export const metadata = pageMetadata({
  title: 'Work',
  description:
    'Selected systems by Rohith Naidu: governed release engineering, disaster response, applied AI, and full-stack products.',
  path: '/projects',
});

export default function ProjectsPage() {
  return (
    <>
      <section className="page-head container-ed">
        <div className="page-head__top">
          <span className="kicker">Index / Work</span>
          <span className="meta">2025 — 2026</span>
        </div>

        <h1 className="display display--lg page-head__title reveal">
          Six systems, <em>one standard.</em>
        </h1>

        <p className="lede page-head__lead reveal reveal--1">
          Each of these had a point where the demo stopped being enough. The interesting work was
          the layer around the model, the release, or the transaction that made the result
          trustworthy.
        </p>

        <dl className="page-head__meta">
          <div>
            <dt>Focus</dt>
            <dd>Applied AI, platform, product</dd>
          </div>
          <div>
            <dt>Basis</dt>
            <dd>Public repositories and live systems</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>
              <a
                href={SITE.github}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline"
              >
                github.com/{SITE.githubHandle}
              </a>
            </dd>
          </div>
        </dl>
      </section>

      <section className="section container-ed">
        <div className="project-list">
          {WORK.map((project, index) => (
            <Link key={project.slug} href={`/projects/${project.slug}`} className="project-card">
              <div>
                <div className="project-card__head">
                  <span className="project-card__index">
                    {String(index + 1).padStart(2, '0')} / {project.year}
                  </span>
                  <span className="project-card__kicker">{project.kicker}</span>
                </div>
                <h2 className="project-card__title">{project.title}</h2>
                <p className="project-card__summary">{project.summary}</p>
              </div>

              <div className="project-card__foot">
                <span className="project-card__stack">
                  {project.stack.slice(0, 4).map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </span>
                <span className="project-card__arrow" aria-hidden="true">
                  <ArrowUpRight />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
