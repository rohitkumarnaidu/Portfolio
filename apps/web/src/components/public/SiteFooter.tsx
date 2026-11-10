import Link from 'next/link';
import { PUBLIC_NAV, SITE } from '@/lib/public-content';
import { ArrowUpRight } from './icons';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container-ed">
        <div className="footer-cta">
          <h2 className="footer-cta__title">
            Have a system that <em>has to be right?</em>
          </h2>
          <Link href="/contact" className="btn">
            Start a conversation
            <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="footer-grid">
          <div className="footer-col">
            <h2>Rohith Naidu</h2>
            <p>
              Software engineer working across applied AI, platform engineering, and full-stack
              product. Building most of it in public.
            </p>
          </div>

          <div className="footer-col">
            <h2>Navigate</h2>
            <ul>
              {PUBLIC_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h2>Elsewhere</h2>
            <ul>
              <li>
                <a href={SITE.github} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </li>
              <li>
                <a href={SITE.npm} target="_blank" rel="noopener noreferrer">
                  npm — Forgevena
                </a>
              </li>
              <li>
                <a
                  href="https://disaster-intelligence-response-os.up.railway.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  DRAXELYRA — live
                </a>
              </li>
              <li>
                <a href="https://scholarform.vercel.app" target="_blank" rel="noopener noreferrer">
                  ScholarFormAI — live
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h2>Colophon</h2>
            <p>
              Designed and built by {SITE.name}. Set in Instrument Serif and Inter, on Next.js and
              TypeScript.
            </p>
          </div>
        </div>

        <div className="footer-base">
          <span>
            © {new Date().getFullYear()} {SITE.shortName}
          </span>
          <span>Built in public. Source on GitHub.</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
