import { ContactForm } from '@/components/public/ContactForm';
import { ArrowUpRight } from '@/components/public/icons';
import { SectionHead } from '@/components/public/SectionHead';
import type { PublicAvailability } from '@/lib/api';
import { SITE } from '@/lib/public-content';

export function ContactSection({ availability }: { availability?: PublicAvailability | null }) {
  const availabilityLabel = availability?.statusLabel || SITE.availabilityLabel;

  return (
    <section className="section container-ed" id="contact">
      <SectionHead index="04" title="Contact" aside={availabilityLabel} />

      <div className="contact-grid home-contact">
        <aside className="contact-aside">
          <div>
            <p className="contact-aside__title">Start with the problem.</p>
            <p className="stack">
              What has to be right, what is fragile today, and what a good outcome looks like. A few
              sentences is enough to begin.
            </p>
          </div>

          <div className="contact-direct">
            <a href={SITE.github} target="_blank" rel="noopener noreferrer">
              <span>GitHub — {SITE.githubHandle}</span>
              <ArrowUpRight size={14} />
            </a>
            <a href={SITE.npm} target="_blank" rel="noopener noreferrer">
              <span>npm — forgevena</span>
              <ArrowUpRight size={14} />
            </a>
          </div>

          <div className="about-aside__group">
            <h3>Response</h3>
            <p>Usually within a few days, with a direct answer either way.</p>
          </div>
        </aside>

        <ContactForm />
      </div>
    </section>
  );
}
