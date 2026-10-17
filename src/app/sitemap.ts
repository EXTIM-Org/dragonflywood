import { MetadataRoute } from 'next';
import { db } from '@/prisma/db';

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dragonflywood.ir';

  try {
    // Fetch all products
    const products = await db.orm.public.Product.orderBy((p) => p.updatedAt.desc()).all();
    
    // Fetch all categories
    const categories = await db.orm.public.Category.orderBy((c) => c.updatedAt.desc()).all();
    
    // Fetch all published articles
    const articles = await db.orm.public.Article.where({ status: "PUBLISHED" }).orderBy((a) => a.updatedAt.desc()).all();

    const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: 'daily',
      priority: 0.8,
    }));

    const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/products?category=${category.slug}`,
      lastModified: new Date(category.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const articleUrls: MetadataRoute.Sitemap = articles.map((article) => ({
      url: `${baseUrl}/blog/${article.slug}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/products`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/offers`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/faq`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/returns`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/terms`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.4,
      },
      {
        url: `${baseUrl}/privacy`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.4,
      },
    ];

    return [
      ...staticRoutes,
      ...productUrls,
      ...categoryUrls,
      ...articleUrls,
    ];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/products`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
    ];
  }
}

