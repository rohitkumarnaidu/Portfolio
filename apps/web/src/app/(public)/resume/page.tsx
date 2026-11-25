import Link from 'next/link';
import {
  ABOUT_PARAGRAPHS,
  CAPABILITIES,
  FACTS,
  FEATURED_WORK,
  PRINCIPLES,
  SITE,
  TOOLKIT,
} from '@/lib/public-content';
import { pageMetadata } from '@/lib/seo';
import { ResumeDownloadLink } from '@/components/public/ResumeDownloadLink';
import { SectionHead } from '@/components/public/SectionHead';

export const metadata = pageMetadata({
  title: 'Résumé',
  description:
    'Print-ready résumé for Rohith Naidu, a software engineer working on applied AI systems, developer platforms, and full-stack products.',
  path: '/resume',
});

function ResumePage() {
  return (
    <div className="resume">
      <section className="page-head container-ed">
        <div className="page-head__top">
          <span className="kicker">Index / Résumé</span>
          <span className="meta">
            {SITE.role} · {SITE.availabilityLabel}
          </span>
        </div>

        <h1 className="display display--lg page-head__title">{SITE.name}</h1>

        <p className="lede page-head__lead">{ABOUT_PARAGRAPHS[0]}</p>

        <ResumeDownloadLink />
      </section>

      <section className="section section--tight container-ed">
        <div className="fact-grid">
          {FACTS.map((fact) => (
            <div key={fact.label} className="fact">
              <span className="fact__value">{fact.value}</span>
              <span className="fact__label">{fact.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section container-ed">
        <SectionHead index="01" title="Selected systems" aside="Three in production" />

        <div className="work-index">
          {FEATURED_WORK.map((project, index) => (
            <article key={project.slug} className="resume-system">
              <span className="work-row__num">{String(index + 1).padStart(2, '0')}</span>

              <div>
                <span className="work-row__kicker">
                  {project.kicker} · {project.year}
                </span>
                <h3 className="work-row__title">{project.title}</h3>
                <p className="work-row__summary">{project.summary}</p>
                <p className="work-row__meta">
                  {project.stack.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section container-ed">
        <SectionHead index="02" title="Capabilities" aside="Three disciplines" />

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
        <SectionHead index="03" title="Toolkit" aside="What I reach for" />

        <div className="toolkit">
          {TOOLKIT.map((group) => (
            <div key={group.label} className="toolkit__group">
              <h3>{group.label}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="section container-ed">
        <SectionHead index="04" title="Working principles" aside="Four rules" />

        <ol className="principle-list">
          {PRINCIPLES.map((principle) => (
            <li key={principle.index} className="principle">
              <span className="principle__index">{principle.index}</span>
              <h3 className="principle__title">{principle.title}</h3>
              <p className="principle__body">{principle.body}</p>
            </li>
          ))}
        </ol>

        <p className="body-copy resume__contact">
          Case studies, source, and release notes live on this site. For full-time roles or selected
          contract work, <Link href="/contact">get in touch</Link> or browse{' '}
          <a href={SITE.github} target="_blank" rel="noopener noreferrer">
            github.com/{SITE.githubHandle}
          </a>
          .
        </p>
      </section>
    </div>
  );
}

export default ResumePage;
