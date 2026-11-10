import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Project } from '@portfolio/shared';
import { getProject } from '@/lib/api';
import { sanitizeHtml } from '@/lib/sanitize';
import { SITE, WORK, getWork } from '@/lib/public-content';
import { pageMetadata } from '@/lib/seo';
import { CaseStudy } from '@/components/public/CaseStudy';
import { ArrowLeft, ArrowUpRight } from '@/components/public/icons';

export const revalidate = 60;

export function generateStaticParams() {
  return WORK.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const curated = getWork(params.slug);
  if (curated) {
    return pageMetadata({
      title: curated.title,
      description: curated.summary,
      path: `/projects/${curated.slug}`,
      type: 'article',
    });
  }

  try {
    const project = await getProject(params.slug);
    return pageMetadata({
      title: project.title,
      description: project.description || `${project.title} by ${SITE.shortName}`,
      path: `/projects/${project.slug}`,
      type: 'article',
    });
  } catch {
    return { title: 'Project not found', robots: { index: false, follow: false } };
  }
}

function DashboardProject({ project }: { project: Project }) {
  const content =
    project.content && typeof project.content === 'object'
      ? Object.entries(project.content).filter((entry): entry is [string, string] => {
          return typeof entry[1] === 'string';
        })
      : [];

  return (
    <>
      <section className="case-head container-ed">
        <div className="case-head__top">
          <Link href="/projects" className="link-arrow">
            <ArrowLeft size={15} />
            All work
          </Link>
          <span className="meta">{project.category || 'Project'}</span>
        </div>

        <h1 className="display display--lg case-title">{project.title}</h1>
        <p className="case-summary">{project.description}</p>
      </section>

      <div className="case-layout container-ed">
        <div className="case-body">
          {content.length ? (
            content.map(([key, value]) => (
              <section key={key} className="case-section">
                <h2 className="case-section__title">{key.replace(/_/g, ' ')}</h2>
                <div
                  className="prose-editorial"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }}
                />
              </section>
            ))
          ) : (
            <section className="case-section">
              <h2 className="case-section__title">Overview</h2>
              <p>{project.description}</p>
            </section>
          )}

          {project.metrics && Object.keys(project.metrics).length ? (
            <section className="case-section">
              <h2 className="case-section__title">Metrics</h2>
              <div className="case-facts">
                {Object.entries(project.metrics).map(([key, value]) => (
                  <div key={key} className="case-fact">
                    <span className="case-fact__value">{String(value)}</span>
                    <span className="case-fact__label">{key.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="case-aside">
          {project.tech_stack?.length ? (
            <div className="case-aside__group">
              <h2>Stack</h2>
              <div className="tag-list">
                {project.tech_stack.map((item) => (
                  <span key={item} className="tag">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="case-aside__group">
            <h2>Links</h2>
            <div className="case-aside__links">
              {project.live_url ? (
                <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                  Live application
                  <ArrowUpRight size={14} />
                </a>
              ) : null}
              {project.github_url ? (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                  Source
                  <ArrowUpRight size={14} />
                </a>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const curated = getWork(params.slug);
  if (curated) {
    return <CaseStudy project={curated} />;
  }

  let project: Project | null = null;
  try {
    project = await getProject(params.slug);
  } catch {
    project = null;
  }

  if (!project) {
    notFound();
  }

  return <DashboardProject project={project} />;
}
