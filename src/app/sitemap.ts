import type { MetadataRoute } from 'next';
import { getBlueprintLocalization } from '@/lib/blueprint-server';
import { getTenantPermalinkConfig } from '@/lib/permalink/resolver';
import { getEntityUrl } from '@/lib/permalink/url-helper';

export const dynamic = 'force-dynamic';

const FASTAPI_URL = (process.env.FASTAPI_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

async function fetchFromApi<T>(path: string, tenantDb: string): Promise<T | null> {
  try {
    const res = await fetch(`${FASTAPI_URL}/${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-db': tenantDb,
      },
      next: { revalidate: 300 }, // 5 min cache
    });
    if (!res.ok) return null;
    const body = await res.json();
    return (body.data !== undefined ? body.data : body) as T;
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tenantDb = (
    process.env.TENANT_DB_NAME ||
    process.env.NEXT_PUBLIC_TENANT_DB ||
    'kp_arab_marble'
  ).trim();

  const { defaultLanguage, supportedLanguages } = await getBlueprintLocalization(tenantDb);
  const permalinkConfig = await getTenantPermalinkConfig(tenantDb);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://arabmarble.ae';
  const isMultilingual = supportedLanguages.length > 1;

  // 1. Key static routes
  const shopPath = getEntityUrl({ type: 'shop' }, defaultLanguage, permalinkConfig);
  const staticRoutes = ['', shopPath, '/account', '/cart'];

  // 2. Fetch active dynamic entities
  const [productsData, categoriesData, pagesData] = await Promise.all([
    fetchFromApi<any>('commerce/products', tenantDb),
    fetchFromApi<any>('commerce/categories', tenantDb),
    fetchFromApi<any>('api/cms/pages', tenantDb),
  ]);

  const products: any[] = Array.isArray(productsData) ? productsData : productsData?.data || [];
  const categories: any[] = Array.isArray(categoriesData)
    ? categoriesData
    : categoriesData?.categories || categoriesData?.data || [];
  const pages: any[] = Array.isArray(pagesData) ? pagesData : pagesData?.data || [];

  const dynamicRoutes: Array<{
    cleanPath: string;
    lastModified: Date;
    priority: number;
    changeFrequency: 'daily' | 'weekly';
  }> = [];

  // Add active products (canonical permalinks only)
  for (const product of products) {
    if (product.status === 'active' && product.slug) {
      const cleanPath = getEntityUrl(
        { type: 'product', slug: product.slug, id: product.id || product._id },
        defaultLanguage,
        permalinkConfig,
        defaultLanguage
      );
      dynamicRoutes.push({
        cleanPath,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        priority: 0.9,
        changeFrequency: 'daily',
      });
    }
  }

  // Add active categories (canonical permalinks only)
  for (const cat of categories) {
    if (cat.slug) {
      const cleanPath = getEntityUrl(
        { type: 'category', slug: cat.slug, id: cat.id || cat._id },
        defaultLanguage,
        permalinkConfig,
        defaultLanguage
      );
      dynamicRoutes.push({
        cleanPath,
        lastModified: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
        priority: 0.8,
        changeFrequency: 'weekly',
      });
    }
  }

  // Add published CMS pages (excluding home and static duplicates)
  for (const page of pages) {
    const slug = page.slug;
    if (
      slug &&
      slug !== 'home' &&
      !staticRoutes.includes(`/${slug}`) &&
      (page.isPublished !== false)
    ) {
      const cleanPath = getEntityUrl(
        { type: 'cms_page', slug },
        defaultLanguage,
        permalinkConfig,
        defaultLanguage
      );
      dynamicRoutes.push({
        cleanPath,
        lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date(),
        priority: 0.7,
        changeFrequency: 'weekly',
      });
    }
  }

  const allRouteEntries = [
    ...staticRoutes.map((route) => ({
      cleanPath: route,
      lastModified: new Date(),
      priority: route === '' ? 1.0 : 0.8,
      changeFrequency: 'daily' as const,
    })),
    ...dynamicRoutes,
  ];

  // De-duplicate by cleanPath
  const uniqueRoutes = new Map<string, (typeof allRouteEntries)[0]>();
  for (const item of allRouteEntries) {
    if (!uniqueRoutes.has(item.cleanPath)) {
      uniqueRoutes.set(item.cleanPath, item);
    }
  }

  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const item of uniqueRoutes.values()) {
    const route = item.cleanPath;

    if (!isMultilingual) {
      sitemapEntries.push({
        url: `${baseUrl}${route}`,
        lastModified: item.lastModified,
        changeFrequency: item.changeFrequency,
        priority: item.priority,
      });
    } else {
      const languages: Record<string, string> = {
        'x-default': `${baseUrl}${route}`,
      };
      for (const lang of supportedLanguages) {
        languages[lang] =
          lang === defaultLanguage
            ? `${baseUrl}${route}`
            : `${baseUrl}/${lang}${route === '' ? '' : route}`;
      }

      // Unprefixed default language entry
      sitemapEntries.push({
        url: `${baseUrl}${route}`,
        lastModified: item.lastModified,
        changeFrequency: item.changeFrequency,
        priority: item.priority,
        alternates: {
          languages,
        },
      });

      // Non-default language entries
      for (const lang of supportedLanguages) {
        if (lang !== defaultLanguage) {
          sitemapEntries.push({
            url: `${baseUrl}/${lang}${route === '' ? '' : route}`,
            lastModified: item.lastModified,
            changeFrequency: item.changeFrequency,
            priority: Math.max(0.1, Number((item.priority - 0.1).toFixed(1))),
            alternates: {
              languages,
            },
          });
        }
      }
    }
  }

  return sitemapEntries;
}
