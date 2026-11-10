import { ContactForm } from '@/components/public/ContactForm';
import { ArrowUpRight } from '@/components/public/icons';
import { SITE } from '@/lib/public-content';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Contact',
  description:
    'Start a conversation about an applied AI system, a platform problem, or a full-stack product.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <>
      <section className="page-head container-ed">
        <div className="page-head__top">
          <span className="kicker">Index / Contact</span>
          <span className="meta">{SITE.availabilityLabel}</span>
        </div>

        <h1 className="display display--lg page-head__title reveal">
          Start with <em>the problem.</em>
        </h1>

        <p className="lede page-head__lead reveal reveal--1">
          Tell me what has to be right, what is currently fragile, and what a good outcome looks
          like. I read everything that comes through this form.
        </p>
      </section>

      <div className="contact-grid container-ed">
        <aside className="contact-aside">
          <div>
            <h2 className="contact-aside__title">Useful context, not a pitch.</h2>
            <p className="stack">
              A few sentences about the system, the constraint, and the deadline is enough to start.
              If it is a role, include the team and the problem they own.
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
            <h2>Response</h2>
            <p>
              Usually within a few days. If the fit is not there, I will say so directly rather than
              leave the thread open.
            </p>
          </div>
        </aside>

        <ContactForm />
      </div>
    </>
  );
}
