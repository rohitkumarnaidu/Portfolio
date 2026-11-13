/** @type {import('next').NextConfig} */
const path = require('path');

// The repo keeps runtime configuration in `config/.env` (single source of
// truth for the web server). Next.js only reads .env files from the app
// directory, so load the shared file here. Real process env always wins, and
// production hosts (Vercel) set these in project settings.
const sharedEnvPath = path.join(__dirname, '../../config/.env');
if (require('fs').existsSync(sharedEnvPath)) {
  require('dotenv').config({ path: sharedEnvPath });
}

const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  // Monorepo root so `output: standalone` bundles workspace packages.
  outputFileTracingRoot: path.join(__dirname, '../../'),
  experimental: {
    optimizePackageImports: ['@portfolio/ui', 'three'],
  },
  transpilePackages: ['three'],

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours cache
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.squiz.cloud',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
    ],
  },

  // Compression
  compress: true,

  // HTTP headers for caching
  async headers() {
    return [
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

// Bundle analyzer (enabled via ANALYZE=true)
const withBundleAnalyzer = process.env.ANALYZE
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config) => config;

const config = withBundleAnalyzer(nextConfig);

// Sentry integration (enabled when NEXT_PUBLIC_SENTRY_DSN is set)
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  try {
    const { withSentryConfig } = require('@sentry/nextjs');
    module.exports = withSentryConfig(config, {
      silent: true,
      hideSourceMaps: true,
      transpileClientSDK: true,
      tunnelRoute: '/monitoring',
    });
  } catch {
    module.exports = config;
  }
} else {
  module.exports = config;
}
