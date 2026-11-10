import { cache } from 'react';
import { getBlueprintLocalization, fetchBlueprintPayload } from '../blueprint-server';
import { isLocalePattern } from '../locale-utils';
import {
  DEFAULT_PERMALINK_CONFIG,
  RESERVED_PATH_SEGMENTS,
  normalizePath,
  resolveRedirectChain,
  sanitizeBase,
} from './config';
import { EntityType, PermalinkConfig, ResolvedPermalink } from './types';
import { getEntityUrl, setRuntimePermalinkConfig } from './url-helper';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes in-memory TTL
const configCache = new Map<string, CacheEntry<PermalinkConfig>>();
const configOverrides = new Map<string, Partial<PermalinkConfig>>();

const FASTAPI_URL = (process.env.FASTAPI_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

/**
 * Manually set permalink config override for tests or demo.
 */
export function setTenantPermalinkOverride(
  tenantDb: string,
  override: Partial<PermalinkConfig> | null
): void {
  if (override === null) {
    configOverrides.delete(tenantDb);
    configCache.delete(tenantDb);
  } else {
    configOverrides.set(tenantDb, override);
    configCache.delete(tenantDb);
  }
}

/**
 * Fetches tenant permalink configuration with multi-tenant caching and fallback.
 */
export async function getTenantPermalinkConfig(
  tenantDbOverride?: string
): Promise<PermalinkConfig> {
  const tenantDb = (
    tenantDbOverride ||
    process.env.TENANT_DB_NAME ||
    process.env.NEXT_PUBLIC_TENANT_DB ||
    'kp_arab_marble'
  ).trim();

  // If override present
  if (configOverrides.has(tenantDb)) {
    return {
      ...DEFAULT_PERMALINK_CONFIG,
      ...configOverrides.get(tenantDb),
    };
  }

  const now = Date.now();
  const cached = configCache.get(tenantDb);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const payload = await fetchBlueprintPayload(tenantDb);

    if (payload) {
      const seoPermalinks = payload.seo?.permalinks || payload.permalinkDetails || {};

      const config: PermalinkConfig = {
        permalinkStructure:
          seoPermalinks.permalinkStructure || DEFAULT_PERMALINK_CONFIG.permalinkStructure,
        shopBase:
          seoPermalinks.shopBase ||
          seoPermalinks.shopPageBase ||
          DEFAULT_PERMALINK_CONFIG.shopBase,
        productCategoryBase:
          seoPermalinks.productCategoryBase || DEFAULT_PERMALINK_CONFIG.productCategoryBase,
        categoryBase: seoPermalinks.categoryBase || DEFAULT_PERMALINK_CONFIG.categoryBase,
        tagBase: seoPermalinks.tagBase || DEFAULT_PERMALINK_CONFIG.tagBase,
        productTagBase:
          seoPermalinks.productTagBase || DEFAULT_PERMALINK_CONFIG.productTagBase,
        productAttributeBase:
          seoPermalinks.productAttributeBase || DEFAULT_PERMALINK_CONFIG.productAttributeBase,
        productBrandBase:
          seoPermalinks.productBrandBase || DEFAULT_PERMALINK_CONFIG.productBrandBase,
        customStructureBase: seoPermalinks.customStructureBase,
      };

      configCache.set(tenantDb, { data: config, timestamp: now });
      setRuntimePermalinkConfig(config);
      return config;
    }
  } catch (error) {
    console.warn(`[permalink-resolver] Failed to extract permalink config for "${tenantDb}":`, error);
  }

  if (cached) {
    setRuntimePermalinkConfig(cached.data);
    return cached.data;
  }
  return DEFAULT_PERMALINK_CONFIG;
}

async function fetchFromApi<T>(path: string, tenantDb: string): Promise<T | null> {
  const cleanPath = path.replace(/^\/?(api\/)?/, '');
  const candidatePaths = [cleanPath, `api/${cleanPath}`];
  for (const p of candidatePaths) {
    try {
      const response = await fetch(`${FASTAPI_URL}/${p}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-db': tenantDb,
        },
        signal: AbortSignal.timeout(3000),
        next: { revalidate: 60 },
      });
      if (!response.ok) continue;
      const body = await response.json();
      if (!body) continue;
      return (body.data !== undefined ? body.data : body) as T;
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Central Resolution Engine:
 * Resolves any incoming path against:
 * 1. Excluded paths & static assets
 * 2. Trailing slash & uppercase normalizations
 * 3. Multilingual prefix rules
 * 4. Tenant redirect table
 * 5. Configured permalink structures (Products, Categories, CMS Pages)
 * 6. Legacy / ID URL canonical redirects
 * 7. Proper 404
 */
async function resolvePermalinkInternal(
  rawPathname: string,
  options?: {
    locale?: string;
    tenantDb?: string;
    search?: string;
  }
): Promise<ResolvedPermalink> {
  const tenantDb = (
    options?.tenantDb ||
    process.env.TENANT_DB_NAME ||
    process.env.NEXT_PUBLIC_TENANT_DB ||
    'kp_arab_marble'
  ).trim();

  const search = options?.search || '';

  // 1. Excluded paths: API, Next internals, static files
  if (
    rawPathname.startsWith('/api') ||
    rawPathname.startsWith('/_next') ||
    rawPathname.startsWith('/admin') ||
    rawPathname.includes('.') ||
    rawPathname === '/favicon.ico' ||
    rawPathname === '/robots.txt' ||
    rawPathname === '/sitemap.xml'
  ) {
    return {
      status: 'static',
      locale: options?.locale || 'en',
    };
  }

  // 2. Trailing slash & Uppercase Normalization -> 301 Permanent Redirect
  const hasTrailingSlash = rawPathname.length > 1 && rawPathname.endsWith('/');
  const hasUppercase = /[A-Z]/.test(rawPathname);
  if (hasTrailingSlash || hasUppercase) {
    const normalized = normalizePath(rawPathname);
    return {
      status: 'redirect',
      locale: options?.locale || 'en',
      redirectUrl: `${normalized}${search}`,
      statusCode: 301,
    };
  }

  // 3. Fetch Active Tenant Permalink & Localization Configuration
  const loc = await getBlueprintLocalization(tenantDb);
  const defaultLanguage = loc.defaultLanguage.toLowerCase();
  const supportedLanguages = loc.supportedLanguages.map((l) => l.toLowerCase());

  const permalinkConfig = await getTenantPermalinkConfig(tenantDb);
  const rawStructure = (permalinkConfig.permalinkStructure || '/product').trim().toLowerCase();
  const shopBase = sanitizeBase(permalinkConfig.shopBase || 'shop', 'shop');
  const productBase = rawStructure === 'shop' || rawStructure === '/shop'
    ? shopBase
    : rawStructure === 'category' || rawStructure === '/category'
    ? shopBase
    : sanitizeBase(rawStructure, 'product');
  const categoryBase = sanitizeBase(
    permalinkConfig.productCategoryBase || permalinkConfig.categoryBase,
    'product-category'
  );

  const knownBases = new Set([
    productBase,
    shopBase,
    categoryBase,
    'product',
    'category',
    'shop',
    'shopp',
    'blog',
    'account',
    'cart',
    'checkout',
    'search',
    'wishlist',
    'studio',
    ...Array.from(RESERVED_PATH_SEGMENTS),
  ]);

  const segments = rawPathname.split('/').filter(Boolean);
  const firstSegment = (segments[0] || '').toLowerCase();

  // A segment is a locale ONLY if:
  // 1. It matches the ISO locale pattern (2-letter code)
  // 2. It is NOT a known content base (product, shop, category, etc.)
  // 3. It IS actually one of the configured supported languages or the default language
  // This prevents custom permalink bases like 'pr' from being misidentified as locale prefixes.
  const isKnownLocale =
    isLocalePattern(firstSegment) &&
    (firstSegment === defaultLanguage || supportedLanguages.includes(firstSegment));
  const hasLocale = !knownBases.has(firstSegment) && isKnownLocale;

  let currentLocale = (options?.locale || defaultLanguage).toLowerCase();
  let cleanSegments = [...segments];

  if (hasLocale) {
    // 3a. Default language MUST NOT have prefix -> 301 redirect to clean path
    if (firstSegment === defaultLanguage) {
      const remaining = segments.slice(1);
      const cleanPath = remaining.length > 0 ? `/${remaining.join('/')}` : '/';
      return {
        status: 'redirect',
        locale: defaultLanguage,
        redirectUrl: `${cleanPath}${search}`,
        statusCode: 301,
      };
    }

    // 3b. Enabled non-default language
    if (supportedLanguages.includes(firstSegment)) {
      currentLocale = firstSegment;
      cleanSegments = segments.slice(1);

      // Guard against repeated or duplicate locale prefixes (e.g. /ar/ar/shop -> /ar/shop)
      if (cleanSegments.length > 0 && supportedLanguages.includes(cleanSegments[0].toLowerCase())) {
        while (cleanSegments.length > 0 && supportedLanguages.includes(cleanSegments[0].toLowerCase())) {
          cleanSegments.shift();
        }
        const cleanPath = cleanSegments.length > 0 ? `/${currentLocale}/${cleanSegments.join('/')}` : `/${currentLocale}`;
        return {
          status: 'redirect',
          locale: currentLocale,
          redirectUrl: `${cleanPath}${search}`,
          statusCode: 301,
        };
      }
    } else {
      // 3c. Unsupported language prefix -> 307 Temporary Redirect to clean path
      const remaining = segments.slice(1);
      const cleanPath = remaining.length > 0 ? `/${remaining.join('/')}` : '/';
      return {
        status: 'redirect',
        locale: defaultLanguage,
        redirectUrl: `${cleanPath}${search}`,
        statusCode: 307,
      };
    }
  }

  const cleanPathname = cleanSegments.length > 0 ? `/${cleanSegments.join('/')}` : '/';

  // 4. Check Reserved Static Application Routes (cart, checkout, account, etc.)
  const candidateFirst = cleanSegments[0] || '';
  if (candidateFirst === 'kalp-admin') {
    const localePrefix = currentLocale === defaultLanguage ? '' : `/${currentLocale}`;
    return {
      status: 'redirect',
      locale: currentLocale,
      redirectUrl: `${localePrefix}/kalptree${search}`,
      statusCode: 301,
    };
  }

  if (candidateFirst === 'kalptree') {
    const localePrefix = currentLocale === defaultLanguage ? '' : `/${currentLocale}`;
    return {
      status: 'match',
      type: 'admin',
      slug: 'kalptree',
      canonicalPath: `${localePrefix}/kalptree`,
      cleanPath: '/kalptree',
      locale: currentLocale,
      data: { title: 'Admin Login' },
    };
  }

  if (RESERVED_PATH_SEGMENTS.has(candidateFirst)) {
    // If it's a known static section (like /cart or /checkout) without sub-entity resolution
    if (['cart', 'checkout', 'account', 'orders', 'wishlist', 'search', 'login', 'signup'].includes(candidateFirst)) {
      return {
        status: 'static',
        locale: currentLocale,
        cleanPath: cleanPathname,
      };
    }
  }

  // 5. Check In-Memory Tenant Redirect Table (Chain Flattening & Loop Guarded)
  const redirectMatch = resolveRedirectChain(tenantDb, cleanPathname, search);
  if (redirectMatch) {
    const localePrefix = currentLocale === defaultLanguage ? '' : `/${currentLocale}`;
    const destinationPath = redirectMatch.destination.startsWith('/')
      ? `${localePrefix}${redirectMatch.destination}`
      : redirectMatch.destination;
    return {
      status: 'redirect',
      locale: currentLocale,
      redirectUrl: destinationPath,
      statusCode: redirectMatch.statusCode,
    };
  }

  // 6. Check Entity Resolution

  // 7. Check Entity Resolution

  // 7a. Product Resolution
  // Potential product paths:
  // - Current structure: /{productBase}/{slug}
  // - Legacy / Alternate structures: /product/{slug}, /shop/{slug}
  const isProductCandidate =
    (cleanSegments.length === 2 && ['product', 'shop', shopBase, productBase].includes(cleanSegments[0])) ||
    (rawStructure.includes('category') && cleanSegments.length === 3 && ['shop', shopBase].includes(cleanSegments[0]));

  if (isProductCandidate) {
    const candidateSlug = cleanSegments[cleanSegments.length - 1];
    const encodedSlug = encodeURIComponent(candidateSlug);

    // Attempt lookup by slug
    let product: any = await fetchFromApi(`commerce/products/slug/${encodedSlug}`, tenantDb);

    // If not found by slug, check if candidateSlug is a product ID (e.g. 24 hex chars)
    if (!product && /^[0-9a-fA-F]{24}$/.test(candidateSlug)) {
      product = await fetchFromApi(`commerce/products/${encodedSlug}`, tenantDb);
    }

    if (product) {
      const canonicalPath = getEntityUrl(
        {
          type: 'product',
          slug: product.slug,
          id: product.id || product._id,
        },
        currentLocale,
        permalinkConfig,
        defaultLanguage
      );

      const expectedCleanPath = getEntityUrl(
        {
          type: 'product',
          slug: product.slug,
          id: product.id || product._id,
        },
        defaultLanguage,
        permalinkConfig,
        defaultLanguage
      );

      // Check if current cleanPath is non-canonical (e.g. accessed by ID or old pattern like /shop/ when config is /product)
      if (cleanPathname !== expectedCleanPath) {
        return {
          status: 'redirect',
          locale: currentLocale,
          redirectUrl: `${canonicalPath}${search}`,
          statusCode: 301,
        };
      }

      // Check Translated Slugs
      // If product has translated slugs object (e.g. product.slugs = { en: "...", hi: "..." })
      if (product.slugs && typeof product.slugs === 'object') {
        const expectedLocaleSlug = product.slugs[currentLocale] || product.slug;
        if (candidateSlug !== expectedLocaleSlug) {
          return {
            status: 'redirect',
            locale: currentLocale,
            redirectUrl: `${canonicalPath}${search}`,
            statusCode: 301,
          };
        }
      }

      return {
        status: 'match',
        type: 'product',
        entityId: String(product.id || product._id),
        slug: product.slug,
        canonicalPath,
        cleanPath: cleanPathname,
        locale: currentLocale,
        data: product,
        alternateSlugs: product.slugs || { [defaultLanguage]: product.slug },
      };
    }
  }

  // 7b. Category Resolution
  // Potential category paths:
  // - /{categoryBase} or /category (all categories)
  // - /{categoryBase}/{slug}
  // - /category/{slug}
  // - /product-category/{slug}
  if (
    cleanSegments.length === 1 &&
    ['category', 'product-category', categoryBase].includes(cleanSegments[0])
  ) {
    const canonicalPath = getEntityUrl(
      { type: 'category', slug: 'all' },
      currentLocale,
      permalinkConfig,
      defaultLanguage
    );
    const expectedCleanPath = getEntityUrl(
      { type: 'category', slug: 'all' },
      defaultLanguage,
      permalinkConfig,
      defaultLanguage
    );

    if (cleanPathname !== expectedCleanPath) {
      return {
        status: 'redirect',
        locale: currentLocale,
        redirectUrl: `${canonicalPath}${search}`,
        statusCode: 301,
      };
    }

    return {
      status: 'match',
      type: 'category',
      slug: 'all',
      canonicalPath,
      cleanPath: cleanPathname,
      locale: currentLocale,
      data: { isAll: true, name: 'All Categories' },
    };
  }

  const isCategoryCandidate =
    cleanSegments.length === 2 &&
    ['category', 'product-category', categoryBase].includes(cleanSegments[0]);

  if (isCategoryCandidate) {
    const candidateSlug = cleanSegments[1];
    const encodedSlug = encodeURIComponent(candidateSlug);

    let category: any = await fetchFromApi(`commerce/categories/slug/${encodedSlug}`, tenantDb);
    if (!category && /^[0-9a-fA-F]{24}$/.test(candidateSlug)) {
      category = await fetchFromApi(`commerce/categories/${encodedSlug}`, tenantDb);
    }
    if (!category) {
      category = {
        slug: candidateSlug,
        name: candidateSlug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      };
    }

    if (category) {
      const canonicalPath = getEntityUrl(
        {
          type: 'category',
          slug: category.slug,
          id: category.id || category._id,
        },
        currentLocale,
        permalinkConfig,
        defaultLanguage
      );

      const expectedCleanPath = getEntityUrl(
        {
          type: 'category',
          slug: category.slug,
          id: category.id || category._id,
        },
        defaultLanguage,
        permalinkConfig,
        defaultLanguage
      );

      if (cleanPathname !== expectedCleanPath) {
        return {
          status: 'redirect',
          locale: currentLocale,
          redirectUrl: `${canonicalPath}${search}`,
          statusCode: 301,
        };
      }

      return {
        status: 'match',
        type: 'category',
        entityId: String(category.id || category._id || category.slug),
        slug: category.slug,
        canonicalPath,
        cleanPath: cleanPathname,
        locale: currentLocale,
        data: category,
      };
    }
  }

  // 7c. Shop Page Resolution
  // If user requests legacy /shop when shopBase has been changed to something else (e.g. /store), 301 redirect to canonical
  if (cleanSegments.length === 1 && cleanSegments[0] === 'shop' && shopBase !== 'shop') {
    const canonicalPath = getEntityUrl(
      { type: 'shop' },
      currentLocale,
      permalinkConfig,
      defaultLanguage
    );
    return {
      status: 'redirect',
      locale: currentLocale,
      redirectUrl: `${canonicalPath}${search}`,
      statusCode: 301,
    };
  }

  // If path matches configured shopBase (e.g. /shop, or /store)
  if (cleanSegments.length === 1 && cleanSegments[0] === shopBase) {
    const canonicalPath = getEntityUrl(
      { type: 'shop' },
      currentLocale,
      permalinkConfig,
      defaultLanguage
    );
    return {
      status: 'match',
      type: 'shop',
      slug: shopBase,
      canonicalPath,
      cleanPath: cleanPathname,
      locale: currentLocale,
      data: { permalinkConfig },
    };
  }

  // 7d. CMS Page Resolution
  // Single segment path: /{slug} or root homepage ''
  if (cleanSegments.length === 1 || cleanSegments.length === 0) {
    const slugKey = cleanSegments[0] || 'home';
    const cmsData = await fetchFromApi<any>(`cms/pages?slug=${encodeURIComponent(slugKey)}`, tenantDb);
    const rawPage = Array.isArray(cmsData)
      ? cmsData.find((p) => p.slug === slugKey || p.document_key === slugKey)
      : (cmsData?.data || cmsData);
    const page = rawPage?.data || rawPage;

    if (page) {
      const isPreview = search.includes('studio_preview=true') || search.includes('preview=true');
      const isPublished = page.isPublished === true || page.status === 'published' || page.status === 'live';

      // Draft pages must never show on live storefront
      if (!isPublished && !isPreview) {
        return {
          status: 'not_found',
          locale: currentLocale,
        };
      }

      const pageSlug = page.slug || page.document_key || slugKey;
      const canonicalPath = getEntityUrl(
        {
          type: 'cms_page',
          slug: pageSlug,
        },
        currentLocale,
        permalinkConfig,
        defaultLanguage
      );

      return {
        status: 'match',
        type: 'cms_page',
        entityId: String(page.id || page._id),
        slug: pageSlug,
        canonicalPath,
        cleanPath: cleanPathname,
        locale: currentLocale,
        data: page,
      };
    }
  }

  // 8. Nothing found -> 404
  return {
    status: 'not_found',
    locale: currentLocale,
    cleanPath: cleanPathname,
  };
}

const memoizedResolvePermalink = cache(
  async (
    rawPathname: string,
    locale?: string,
    tenantDb?: string,
    search?: string
  ): Promise<ResolvedPermalink> => {
    return resolvePermalinkInternal(rawPathname, { locale, tenantDb, search });
  }
);

export async function resolvePermalink(
  rawPathname: string,
  options?: {
    locale?: string;
    tenantDb?: string;
    search?: string;
  }
): Promise<ResolvedPermalink> {
  return memoizedResolvePermalink(
    rawPathname,
    options?.locale,
    options?.tenantDb,
    options?.search
  );
}

export const resolvePermalinkAsync = resolvePermalink;
