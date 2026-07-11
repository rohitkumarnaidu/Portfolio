/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['@portfolio/ui', '@portfolio/shared', 'three', 'motion', 'gsap'],
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
      {
        source: '/admin/sandbox/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
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
