import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dragonflywood.ir';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/profile/',
          '/api/',
          '/checkout/',
          '/cart/',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/profile/',
          '/api/',
          '/checkout/',
          '/cart/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: 'dragonflywood.ir',
  };
}

