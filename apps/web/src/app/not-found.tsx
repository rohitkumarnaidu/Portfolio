import { NotFoundContent } from '@/components/public/NotFoundContent';
import { SiteFooter } from '@/components/public/SiteFooter';
import { SiteHeader } from '@/components/public/SiteHeader';

export default function NotFound() {
  return (
    <div className="site" id="top">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <NotFoundContent />
      </main>
      <SiteFooter />
    </div>
  );
}
