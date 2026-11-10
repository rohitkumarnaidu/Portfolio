import type { Metadata, Viewport } from 'next';
import { fontVariables } from '@/lib/fonts';
import { SITE } from '@/lib/public-content';
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
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        {/*
          Admin keeps the existing data-theme contract. The public surface is
          intentionally fixed to its paper palette and does not read this value.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-dvh bg-surface-primary text-text-primary antialiased">{children}</body>
    </html>
  );
}
