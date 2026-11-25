import Link from 'next/link';
import { FEATURED_WORK } from '@/lib/public-content';
import { ArrowUpRight } from '@/components/public/icons';
import { SectionHead } from '@/components/public/SectionHead';

export function FlagshipWork() {
  return (
    <section className="section container-ed" id="work">
      <SectionHead index="01" title="Selected work" aside="2025 — 2026" />

      <div className="work-index">
        {FEATURED_WORK.map((project, index) => (
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
  );
}
