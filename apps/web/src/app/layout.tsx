import type { Metadata, Viewport } from 'next';
import { AnimatePresence } from 'framer-motion';
import { fontVariables } from '@/lib/fonts';
import { websiteSchema, personSchema } from '@/lib/json-ld';
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SkipLink } from '@/components/layout/SkipLink';
import { ClientShell } from '@/components/layout/ClientShell';
import { PublicQueryProvider } from '@/lib/query-provider';
import { ChatPanel } from '@/components/chat/ChatPanel';

export const metadata: Metadata = {
  title: {
    default: 'Portfolio — Full-Stack Developer',
    template: '%s — Portfolio',
  },
  description:
    'Full-stack developer specializing in React, Next.js, NestJS, and TypeScript. Building enterprise-grade web applications with modern technologies.',
  keywords: [
    'full-stack developer',
    'react',
    'next.js',
    'nestjs',
    'typescript',
    'portfolio',
    'web development',
  ],
  authors: [{ name: 'Portfolio Owner' }],
  openGraph: {
    title: 'Portfolio — Full-Stack Developer',
    description: 'Full-stack developer specializing in React, Next.js, NestJS, and TypeScript.',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
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
      <body className="min-h-dvh bg-surface-primary text-text-primary antialiased">
        <ThemeProvider>
          <PublicQueryProvider>
            <ClientShell>
              <SkipLink targetId="main-content" />
              <Navbar variant="sticky" />
              <div id="main-content" className="flex-grow focus:outline-none" tabIndex={-1}>
                <AnimatePresence mode="wait">{children}</AnimatePresence>
              </div>
              <Footer />

              {/* Ambient Animated Background */}
              <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
                <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[70%] rounded-full bg-accent-500/10 blur-3xl animate-mesh-shift mix-blend-screen" />
                <div
                  className="absolute top-[20%] -right-[20%] w-[60%] h-[80%] rounded-full bg-accent-800/10 blur-3xl animate-mesh-shift mix-blend-screen"
                  style={{ animationDelay: '2s' }}
                />
                <div
                  className="absolute -bottom-[30%] left-[20%] w-[80%] h-[60%] rounded-full bg-accent-400/10 blur-3xl animate-mesh-shift mix-blend-screen"
                  style={{ animationDelay: '4s' }}
                />
              </div>

              <div className="noise-overlay" aria-hidden="true" />
              <ChatPanel />
            </ClientShell>

            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(
                  websiteSchema(
                    'Portfolio — Full-Stack Developer',
                    process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
                  ),
                ),
              }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(
                  personSchema(
                    'Portfolio Owner',
                    'Full-Stack Developer',
                    process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
                  ),
                ),
              }}
            />
          </PublicQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
