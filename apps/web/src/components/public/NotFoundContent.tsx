import Link from 'next/link';
import { ArrowUpRight } from './icons';

export function NotFoundContent() {
  return (
    <div className="notfound container-ed">
      <span className="notfound__code">404 / Not found</span>
      <h1 className="display display--lg notfound__title">
        This page is not <em>in the index.</em>
      </h1>
      <p className="lede notfound__body">
        The link may be old, or the page may have been removed in the redesign. The work and the
        writing are still where you left them.
      </p>
      <div className="notfound__actions">
        <Link href="/" className="btn">
          Return home
        </Link>
        <Link href="/projects" className="link-arrow">
          Browse the work
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </div>
  );
}
