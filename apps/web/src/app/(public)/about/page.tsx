import Link from 'next/link';
import { ABOUT_PARAGRAPHS, FACTS, PRINCIPLES, SITE, TOOLKIT } from '@/lib/public-content';
import { pageMetadata } from '@/lib/seo';
import { ArrowUpRight } from '@/components/public/icons';
import { SectionHead } from '@/components/public/SectionHead';

export const metadata = pageMetadata({
  title: 'About',
  description:
    'Rohith Naidu is a software engineer working on applied AI systems, developer platforms, and full-stack products.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <>
      <section className="page-head container-ed">
        <div className="page-head__top">
          <span className="kicker">Index / About</span>
          <span className="meta">
            {SITE.role} · {SITE.availabilityLabel}
          </span>
        </div>

        <h1 className="display display--lg page-head__title reveal">
          I like the part <em>after the demo.</em>
        </h1>

        <p className="lede page-head__lead reveal reveal--1">
          The model works on a sample. The CLI runs once. The dashboard looks right in a screenshot.
          The real work starts when any of those has to survive a bad day.
        </p>
      </section>

      <section className="container-ed">
        <div className="about-grid">
          <div className="about-copy">
            {ABOUT_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}

            <p className="stack-lg">
              <a
                href={SITE.github}
                target="_blank"
                rel="noopener noreferrer"
                className="link-arrow"
              >
                github.com/{SITE.githubHandle}
                <ArrowUpRight size={15} />
              </a>
            </p>
          </div>

          <aside className="about-aside">
            <div>
              <div className="fact-grid">
                {FACTS.map((fact) => (
                  <div key={fact.label} className="fact">
                    <span className="fact__value">{fact.value}</span>
                    <span className="fact__label">{fact.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="about-aside__group">
              <h2>Currently</h2>
              <p>
                Building governed developer tooling and evidence-first AI systems. Open to full-time
                roles and selected contract work where correctness matters.
              </p>
            </div>

            <div className="about-aside__group">
              <h2>Find me</h2>
              <p>
                <a
                  href={SITE.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  GitHub
                </a>
                <br />
                <a
                  href={SITE.npm}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  npm
                </a>
                <br />
                <Link href="/contact" className="link-underline">
                  Contact form
                </Link>
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="section container-ed">
        <SectionHead index="01" title="How I work" aside="Four rules" />

        <div className="principle-list">
          {PRINCIPLES.map((principle) => (
            <div key={principle.index} className="principle">
              <span className="principle__index">{principle.index}</span>
              <h3 className="principle__title">{principle.title}</h3>
              <p className="principle__body">{principle.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section container-ed">
        <SectionHead index="02" title="Toolkit" aside="What I reach for" />

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
    </>
  );
}
