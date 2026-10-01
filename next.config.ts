import { withSentryConfig } from '@sentry/nextjs/config';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: process.env.NODE_ENV === 'development' ? ['localhost'] : [],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://picsum.photos https://*.tile.openstreetmap.org; font-src 'self' data:; connect-src 'self' https://*.sentry.io ws://localhost:* wss://localhost:*; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self';",
          }
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: false,
  telemetry: false,
});
