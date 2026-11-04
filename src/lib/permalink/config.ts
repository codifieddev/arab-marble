import { PermalinkConfig, RedirectEntry } from './types';

export const DEFAULT_PERMALINK_CONFIG: PermalinkConfig = {
  permalinkStructure: '/product',
  shopBase: 'shop',
  productCategoryBase: 'product-category',
  categoryBase: 'category',
  tagBase: 'tag',
  productTagBase: 'product-tag',
  productAttributeBase: 'attribute',
  productBrandBase: 'brands',
};

export const RESERVED_PATH_SEGMENTS = new Set([
  'api',
  'admin',
  '_next',
  'static',
  'public',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'cart',
  'checkout',
  'account',
  'orders',
  'wishlist',
  'search',
  'login',
  'signup',
  'blog',
  'ecommerce',
  'kalpauth',
  'studio',
  'kalptree',
  'kalp-admin',
]);

/**
 * Normalizes a URL path:
 * - strips duplicate and trailing slashes (unless root '/')
 * - ensures leading slash
 * - converts to lowercase for route matching
 */
export function normalizePath(path: string): string {
  if (!path || path === '/') return '/';
  let cleaned = path.trim().replace(/\/+$/, '');
  if (!cleaned.startsWith('/')) cleaned = '/' + cleaned;
  return cleaned.toLowerCase();
}

/**
 * Normalizes a base prefix (e.g. "/product" -> "product", "product-category" -> "product-category")
 */
export function sanitizeBase(base: string, fallback: string): string {
  if (!base) return fallback;
  const cleaned = base.trim().replace(/^\/+|\/+$/g, '');
  return cleaned || fallback;
}

// In-memory tenant redirect registries: tenantDb -> Map<fromPath, RedirectEntry>
const tenantRedirects = new Map<string, Map<string, RedirectEntry>>();

const DEFAULT_SEEDED_REDIRECTS: Record<
  string,
  Array<{ from: string; to: string; statusCode?: 301 | 302 | 307 | 308 }>
> = {
  kp_peekeeper: [
    { from: '/product/6a71d630de0168c70e489035', to: '/product/peekeeper', statusCode: 301 },
    { from: '/product/6a71d630de0168c70e48909e', to: '/product/peekeeper-net-bag', statusCode: 301 },
    { from: '/shop/peekeeper', to: '/product/peekeeper', statusCode: 301 },
    { from: '/shop/peekeeper-net-bag', to: '/product/peekeeper-net-bag', statusCode: 301 },
    { from: '/shop/6a71d630de0168c70e489035', to: '/product/peekeeper', statusCode: 301 },
    { from: '/shop/6a71d630de0168c70e48909e', to: '/product/peekeeper-net-bag', statusCode: 301 },
    { from: '/category/peekeeper', to: '/product-category/peekeeper', statusCode: 301 },
    { from: '/category/6a71d630de0168c70e489034', to: '/product-category/peekeeper', statusCode: 301 },
  ],
};

function ensureTenantRedirectsSeeded(tenantDb: string): void {
  if (!tenantRedirects.has(tenantDb)) {
    tenantRedirects.set(tenantDb, new Map());
    const seeds = DEFAULT_SEEDED_REDIRECTS[tenantDb];
    if (seeds) {
      for (const item of seeds) {
        const from = normalizePath(item.from);
        const to = normalizePath(item.to);
        tenantRedirects.get(tenantDb)!.set(from, {
          from,
          to,
          statusCode: item.statusCode || 301,
        });
      }
    }
  }
}

/**
 * Register a redirect rule for a specific tenant scope.
 */
export function registerTenantRedirect(
  tenantDb: string,
  fromPath: string,
  toPath: string,
  statusCode: 301 | 302 | 307 | 308 = 301
): void {
  ensureTenantRedirectsSeeded(tenantDb);
  const normalizedFrom = normalizePath(fromPath);
  const normalizedTo = normalizePath(toPath);

  if (normalizedFrom === normalizedTo) return;

  tenantRedirects.get(tenantDb)!.set(normalizedFrom, {
    from: normalizedFrom,
    to: normalizedTo,
    statusCode,
  });
}

/**
 * Seed multiple tenant redirects at once.
 */
export function seedTenantRedirects(
  tenantDb: string,
  redirects: Array<{ from: string; to: string; statusCode?: 301 | 302 | 307 | 308 }>
): void {
  for (const item of redirects) {
    registerTenantRedirect(tenantDb, item.from, item.to, item.statusCode);
  }
}

/**
 * Clears redirects for a specific tenant or all tenants.
 */
export function clearTenantRedirects(tenantDb?: string): void {
  if (tenantDb) {
    tenantRedirects.delete(tenantDb);
  } else {
    tenantRedirects.clear();
  }
}

/**
 * Resolves a redirect chain with loop detection and single-hop flattening.
 * E.g., A -> B -> C will immediately return C in 1 hop.
 * Preserves query params if provided.
 */
export function resolveRedirectChain(
  tenantDb: string,
  path: string,
  search = ''
): { destination: string; statusCode: 301 | 302 | 307 | 308; hops: number } | null {
  ensureTenantRedirectsSeeded(tenantDb);
  const redirectsMap = tenantRedirects.get(tenantDb);
  if (!redirectsMap) return null;

  const initialPath = normalizePath(path);
  if (!redirectsMap.has(initialPath)) return null;

  const visited = new Set<string>();
  let current = initialPath;
  let hops = 0;
  const MAX_HOPS = 10;
  let finalStatusCode: 301 | 302 | 307 | 308 = 301;

  while (redirectsMap.has(current) && hops < MAX_HOPS) {
    if (visited.has(current)) {
      // Loop detected (e.g. A -> B -> A). Break immediately to prevent infinite cycle.
      console.warn(`[permalink] Redirect loop detected for "${path}" at "${current}".`);
      break;
    }
    visited.add(current);
    const entry = redirectsMap.get(current)!;
    current = entry.to;
    finalStatusCode = entry.statusCode || 301;
    hops++;
  }

  if (current === initialPath) return null;

  const querySuffix = search ? (search.startsWith('?') ? search : `?${search}`) : '';
  return {
    destination: `${current}${querySuffix}`,
    statusCode: finalStatusCode,
    hops,
  };
}

const FASTAPI_URL = (process.env.FASTAPI_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

const productSlugsCache = new Map<string, { slugs: Set<string>; timestamp: number }>();
const categorySlugsCache = new Map<string, { slugs: Set<string>; timestamp: number }>();

const DEFAULT_KNOWN_PRODUCT_SLUGS: Record<string, string[]> = {
  kp_peekeeper: ['peekeeper', 'peekeeper-net-bag'],
};

const DEFAULT_KNOWN_CATEGORY_SLUGS: Record<string, string[]> = {
  kp_peekeeper: ['peekeeper'],
};

/**
 * Validates whether a product slug exists for a given tenant.
 * Uses fast-path known seeds, in-memory cache, and fallback to backend API.
 */
export async function isValidProductSlug(tenantDb: string, slug: string): Promise<boolean> {
  if (!slug) return false;
  const cleanSlug = slug.trim().toLowerCase();

  // Fast-path known static seeds
  const known = DEFAULT_KNOWN_PRODUCT_SLUGS[tenantDb];
  if (known && known.includes(cleanSlug)) {
    return true;
  }

  const now = Date.now();
  const cached = productSlugsCache.get(tenantDb);
  if (cached && now - cached.timestamp < 60000) {
    return cached.slugs.has(cleanSlug);
  }

  try {
    const res = await fetch(`${FASTAPI_URL}/commerce/products`, {
      headers: { 'x-tenant-db': tenantDb },
      signal: AbortSignal.timeout(4000),
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      const items: any[] = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
        ? json.data
        : json?.items || [];
      const set = new Set<string>(known || []);
      for (const item of items) {
        if (item.slug) set.add(item.slug.toLowerCase());
      }
      productSlugsCache.set(tenantDb, { slugs: set, timestamp: now });
      return set.has(cleanSlug);
    }
  } catch (e) {
    // Backend unreachable
  }

  return known ? known.includes(cleanSlug) : false;
}

/**
 * Validates whether a category slug exists for a given tenant.
 */
export async function isValidCategorySlug(tenantDb: string, slug: string): Promise<boolean> {
  if (!slug) return false;
  const cleanSlug = slug.trim().toLowerCase();

  const known = DEFAULT_KNOWN_CATEGORY_SLUGS[tenantDb];
  if (known && known.includes(cleanSlug)) {
    return true;
  }

  const now = Date.now();
  const cached = categorySlugsCache.get(tenantDb);
  if (cached && now - cached.timestamp < 60000) {
    return cached.slugs.has(cleanSlug);
  }

  try {
    const res = await fetch(`${FASTAPI_URL}/commerce/categories`, {
      headers: { 'x-tenant-db': tenantDb },
      signal: AbortSignal.timeout(4000),
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      const items: any[] = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
        ? json.data
        : json?.categories || [];
      const set = new Set<string>(known || []);
      for (const item of items) {
        if (item.slug) set.add(item.slug.toLowerCase());
      }
      categorySlugsCache.set(tenantDb, { slugs: set, timestamp: now });
      return set.has(cleanSlug);
    }
  } catch (e) {
    // Backend unreachable
  }

  return known ? known.includes(cleanSlug) : false;
}
