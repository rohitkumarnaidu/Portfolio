import Link from 'next/link';
import { SITE } from '@/lib/public-content';
import { ArrowUpRight } from '@/components/public/icons';
import { HeroSchematic } from './HeroSchematic';

export function HeroSection({ availabilityLabel }: { availabilityLabel?: string }) {
  return (
    <section className="hero container-ed" id="hero">
      <div className="hero__top">
        <span className="kicker">Software engineer · Portfolio 2026</span>
        <span className="hero__top-meta">Applied AI / Platform / Product</span>
      </div>

      <h1 className="display display--xl hero__title reveal">
        I build systems that <em>have to be right.</em>
      </h1>

      <div className="hero__grid hero__grid--lite">
        <div>
          <p className="hero__lead reveal reveal--1">{SITE.intro}</p>

          <div className="hero__actions">
            <a href="#work" className="btn">
              View case studies
            </a>
            <Link href="/resume" className="link-arrow">
              Résumé <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>

        <HeroSchematic />
      </div>

      <span className="site-status hero__status" data-available={SITE.available}>
        <span className="site-status__dot" aria-hidden="true" />
        {availabilityLabel ?? SITE.availabilityLabel}
      </span>
    </section>
  );
}
