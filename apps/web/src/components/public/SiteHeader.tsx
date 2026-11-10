'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PUBLIC_NAV, SITE } from '@/lib/public-content';

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="container-ed site-header__inner">
        <Link href="/" className="brand" aria-label={`${SITE.shortName} — home`}>
          <span className="brand__mark">{SITE.shortName}</span>
          <span className="brand__meta">{SITE.role}</span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="site-nav__link"
              aria-current={isActive(pathname, item.href) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <span className="site-status">
          <span className="site-status__dot" aria-hidden="true" />
          {SITE.availabilityLabel}
        </span>

        <details className="site-menu">
          <summary className="site-menu__summary">Menu</summary>
          <div className="site-menu__panel">
            {PUBLIC_NAV.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <a href={SITE.github} target="_blank" rel="noopener noreferrer">
              GitHub ↗
            </a>
          </div>
        </details>
      </div>
    </header>
  );
}
