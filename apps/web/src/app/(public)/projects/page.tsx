import Link from 'next/link';
import type { Project } from '@portfolio/shared';
import { getProjects } from '@/lib/api';
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

async function getDashboardProjects(): Promise<Project[]> {
  try {
    return await getProjects({ per_page: 24 });
  } catch {
    return [];
  }
}

export default async function ProjectsPage() {
  const curatedSlugs = new Set(WORK.map((project) => project.slug));
  const dashboardProjects = (await getDashboardProjects()).filter(
    (project) => !curatedSlugs.has(project.slug),
  );

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

      {dashboardProjects.length > 0 ? (
        <section className="section container-ed">
          <div className="section-head">
            <div className="section-head__left">
              <span className="section-head__index">+</span>
              <h2 className="section-head__title">From the dashboard</h2>
            </div>
            <span className="section-head__aside">{dashboardProjects.length} published</span>
          </div>

          <div className="work-index">
            {dashboardProjects.map((project, index) => (
              <Link key={project.id} href={`/projects/${project.slug}`} className="work-row">
                <span className="work-row__num">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <span className="work-row__kicker">{project.category || 'Project'}</span>
                  <h3 className="work-row__title">{project.title}</h3>
                </div>
                <div>
                  <p className="work-row__summary">{project.description}</p>
                  <p className="work-row__meta">
                    {project.tech_stack?.slice(0, 3).map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </p>
                </div>
                <span className="work-row__arrow" aria-hidden="true">
                  <ArrowUpRight />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
