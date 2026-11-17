import type { Metadata, Viewport } from 'next';
import { fontVariables } from '@/lib/fonts';
import { THEME_SCRIPT } from '@/lib/theme-script';
import { SITE } from '@/lib/public-content';
import '@portfolio/tokens/theme.css';
import '@/styles/globals.css';
import '@/styles/public.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.shortName} — ${SITE.role}`,
    template: `%s — ${SITE.shortName}`,
  },
  description: SITE.description,
  keywords: [
    'Rohith Naidu',
    'software engineer',
    'applied AI',
    'platform engineering',
    'TypeScript',
    'Python',
    'Next.js',
    'portfolio',
  ],
  authors: [{ name: SITE.name, url: SITE.github }],
  creator: SITE.name,
  openGraph: {
    title: `${SITE.shortName} — ${SITE.role}`,
    description: SITE.description,
    type: 'website',
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.shortName,
  },
  twitter: {
    card: 'summary',
    title: `${SITE.shortName} — ${SITE.role}`,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#f4f0e7' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scheme="dark"
      data-skin="3"
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        {/*
          Admin keeps the existing data-theme contract. The public surface is
          intentionally fixed to its paper palette and does not read this value.
          THEME_SCRIPT below sets data-scheme + data-skin before paint and also
          writes the legacy data-theme mirror (kept in sync with data-scheme;
          deleted in Phase 1 together with the alias bridge).
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-dvh bg-surface-primary text-text-primary antialiased">{children}</body>
    </html>
  );
}
