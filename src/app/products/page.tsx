import { db } from '@/prisma/db';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilters } from '@/components/product/ProductFilters';
import { Pagination } from '@/components/ui/Pagination';
import { getSession } from '@/lib/session';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dragonflywood.ir';

function toAbsoluteUrl(url: string | null | undefined): string {
  if (!url) return `${baseUrl}/og-image.jpg`;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

export const metadata = {
  title: 'محصولات دست‌ساز چوبی',
  description: 'مشاهده و خرید آنلاین انواع دست‌سازه‌ها، ظروف، زیورآلات و دکوراسیون چوبی نفیس با اصالت چوب طبیعی از گالری چوب سنجاقک',
  alternates: {
    canonical: `${baseUrl}/products`,
  },
  openGraph: {
    title: 'محصولات دست‌ساز چوبی | گالری چوب سنجاقک',
    description: 'مشاهده و خرید آنلاین انواع دست‌سازه‌ها، ظروف، زیورآلات و دکوراسیون چوبی نفیس از گالری چوب سنجاقک',
    url: `${baseUrl}/products`,
    siteName: 'گالری چوب سنجاقک',
    locale: 'fa_IR',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'محصولات گالری چوب سنجاقک',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'محصولات دست‌ساز چوبی | گالری چوب سنجاقک',
    description: 'مشاهده و خرید آنلاین انواع دست‌سازه‌ها، ظروف، زیورآلات و دکوراسیون چوبی نفیس از گالری چوب سنجاقک',
    images: [`${baseUrl}/og-image.jpg`],
  },
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q : undefined;
  const category = typeof params.category === 'string' ? params.category : undefined;
  const minPrice = typeof params.minPrice === 'string' ? parseInt(params.minPrice) : undefined;
  const maxPrice = typeof params.maxPrice === 'string' ? parseInt(params.maxPrice) : undefined;
  const sort = typeof params.sort === 'string' ? params.sort : 'newest';

  const pageParam = params.page;
  const page = Math.max(1, parseInt(Array.isArray(pageParam) ? pageParam[0] : (pageParam || "1"), 10) || 1);
  const limit = 15; // 5 rows * 3 columns = 15 products per page
  const offset = (page - 1) * limit;

  // Fetch categories for the filter sidebar
  const categories = await db.orm.public.Category.select("id", "name", "slug").all();

  // Build the dynamic query (only active products for customers)
  let query = db.orm.public.Product
    .where((p) => p.isActive.eq(true))
    .include("variants", (v) => v.include("inventory"));

  if (q) {
    query = query.where((p) => p.name.ilike(`%${q}%`));
  }
  
  if (category) {
    const selectedCat = categories.find(c => c.slug === category);
    if (selectedCat) {
      query = query.where((p) => p.categoryId.eq(selectedCat.id));
    }
  }
  
  if (minPrice && !isNaN(minPrice)) {
    query = query.where((p) => p.basePrice.gte(minPrice));
  }
  
  if (maxPrice && !isNaN(maxPrice)) {
    query = query.where((p) => p.basePrice.lte(maxPrice));
  }

  // Count total matching items before limit/offset
  const agg = await query.aggregate((a: any) => ({ total: a.count() }));
  const totalCount = Number(agg.total) || 0;
  const totalPages = Math.ceil(totalCount / limit);
  
  // Apply sorting
  if (sort === 'price_asc') {
    query = query.orderBy((p) => p.basePrice.asc());
  } else if (sort === 'price_desc') {
    query = query.orderBy((p) => p.basePrice.desc());
  } else if (sort === 'popular') {
    query = query.orderBy([(p) => p.salesCount.desc(), (p) => p.viewCount.desc()]);
  } else {
    // newest (default)
    query = query.orderBy((p) => p.createdAt.desc());
  }

  // Execute query with pagination
  const products = await query.limit(limit).offset(offset).all();

  const session = await getSession();
  let userWishlistProductIds = new Set<string>();
  
  if (session?.userId) {
    const wishlist = await db.orm.public.Wishlist
      .where({ userId: session.userId as string })
      .include("items")
      .all().first();
    if (wishlist) {
      userWishlistProductIds = new Set(wishlist.items.map(i => i.productId));
    }
  }

  // Generate JSON-LD Schema for SEO with absolute URLs
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': products.map((product, index) => {
      const prodImages = (product.images && product.images.length > 0)
        ? product.images.map(toAbsoluteUrl)
        : [`${baseUrl}/og-image.jpg`];
      const prodUrl = `${baseUrl}/products/${product.slug}`;

      return {
        '@type': 'ListItem',
        'position': offset + index + 1,
        'item': {
          '@type': 'Product',
          '@id': `${prodUrl}#product`,
          'name': product.name,
          'url': prodUrl,
          'description': product.description || undefined,
          'image': prodImages,
          'offers': {
            '@type': 'Offer',
            'url': prodUrl,
            'price': product.basePrice - product.discount,
            'priceCurrency': 'IRR',
            'availability': 'https://schema.org/InStock',
          },
        }
      };
    })
  };

  const queryParams = new URLSearchParams();
  if (q) queryParams.set("q", q);
  if (category) queryParams.set("category", category);
  if (minPrice && !isNaN(minPrice)) queryParams.set("minPrice", minPrice.toString());
  if (maxPrice && !isNaN(maxPrice)) queryParams.set("maxPrice", maxPrice.toString());
  if (sort && sort !== 'newest') queryParams.set("sort", sort);
  queryParams.set("page", "__PAGE__");
  const buildHrefPattern = `?${queryParams.toString()}`;

  return (
    <main className="min-h-screen pt-28 pb-20 px-6">
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12 text-center md:text-right">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            همه محصولات
          </h1>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            جدیدترین سازه‌های دست‌ساز و زیورآلات چوبی را با ضمانت کیفیت کشف کنید
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar / Filters */}
          <aside className="w-full md:w-1/4">
            <ProductFilters categories={categories} />
          </aside>

          {/* Product Grid */}
          <div className="w-full md:w-3/4">
            {products.length === 0 ? (
              <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-3xl p-12 text-center">
                <p className="text-xl text-gray-600 dark:text-gray-400">متاسفانه هیچ محصولی با این مشخصات یافت نشد.</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      initialIsLiked={userWishlistProductIds.has(product.id)}
                    />
                  ))}
                </div>

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  limit={limit}
                  buildHrefPattern={buildHrefPattern}
                  className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl shadow-sm dark:shadow-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
