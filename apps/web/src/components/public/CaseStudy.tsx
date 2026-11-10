import Link from 'next/link';
import { WORK, type WorkProject } from '@/lib/public-content';
import { ArrowLeft, ArrowUpRight } from './icons';

export function CaseStudy({ project }: { project: WorkProject }) {
  const index = WORK.findIndex((item) => item.slug === project.slug);
  const next = WORK[(index + 1) % WORK.length] ?? project;

  return (
    <>
      <section className="case-head container-ed">
        <div className="case-head__top">
          <Link href="/projects" className="link-arrow">
            <ArrowLeft size={15} />
            All work
          </Link>
          <span className="meta">
            {project.kicker} · {project.year}
          </span>
        </div>

        <h1 className="display display--lg case-title reveal">{project.title}</h1>
        <p className="case-summary reveal reveal--1">{project.summary}</p>

        <div className="case-facts reveal reveal--2">
          {project.facts.map((fact) => (
            <div key={fact.label} className="case-fact">
              <span className="case-fact__value">{fact.value}</span>
              <span className="case-fact__label">{fact.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="case-layout container-ed">
        <div className="case-body">
          {project.sections.map((section) => (
            <section key={section.title} className="case-section">
              <h2 className="case-section__title">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>

        <aside className="case-aside">
          <div className="case-aside__group">
            <h2>Stack</h2>
            <div className="tag-list">
              {project.stack.map((item) => (
                <span key={item} className="tag">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="case-aside__group">
            <h2>Links</h2>
            <div className="case-aside__links">
              {project.links.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                  <ArrowUpRight size={14} />
                </a>
              ))}
            </div>
          </div>

          <div className="case-aside__group">
            <h2>Index</h2>
            <div className="case-aside__links">
              {WORK.map((item, itemIndex) => (
                <Link
                  key={item.slug}
                  href={`/projects/${item.slug}`}
                  aria-current={item.slug === project.slug ? 'page' : undefined}
                >
                  <span>
                    {String(itemIndex + 1).padStart(2, '0')} — {item.title}
                  </span>
                  {item.slug === project.slug ? <span aria-hidden="true">●</span> : null}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="container-ed">
        <Link href={`/projects/${next.slug}`} className="case-next">
          <span>
            <span className="case-next__label">Next system</span>
            <span className="case-next__title">{next.title}</span>
          </span>
          <ArrowUpRight size={30} />
        </Link>
      </div>
    </>
  );
}
