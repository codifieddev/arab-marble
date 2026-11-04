/**
 * Utility functions for locale validation, URL construction, and path manipulation.
 */

export const LOCALE_PATTERN = /^[a-z]{2}(-[A-Z]{2})?$/;

/**
 * Checks whether a given string matches an ISO 639-1 language code or locale pattern (e.g. "en", "hi", "zh-CN").
 */
export function isLocalePattern(segment: string | null | undefined): boolean {
  if (!segment || typeof segment !== 'string') return false;
  return LOCALE_PATTERN.test(segment);
}

/**
 * Strips any leading locale code from a pathname.
 * Example: "/hi/shop" -> { locale: "hi", cleanPath: "/shop" }
 * Example: "/shop" -> { locale: undefined, cleanPath: "/shop" }
 * Example: "/hi" -> { locale: "hi", cleanPath: "/" }
 */
export function stripLocalePrefix(pathname: string): { locale?: string; cleanPath: string } {
  if (!pathname || pathname === '/') {
    return { cleanPath: '/' };
  }

  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];

  if (isLocalePattern(first)) {
    const remaining = segments.slice(1).join('/');
    return {
      locale: first,
      cleanPath: remaining ? `/${remaining}` : '/',
    };
  }

  return { cleanPath: pathname.startsWith('/') ? pathname : `/${pathname}` };
}

/**
 * Builds a localized URL following the tenant rules:
 * - Default language MUST NEVER have a prefix in the URL (/shop, /product/123, /)
 * - Supported non-default languages MUST have a prefix (/hi/shop, /hi/product/123, /hi)
 * - Preserves hash and query params if provided.
 */
export function buildLocalizedHref(
  href: string,
  targetLocale: string = 'en',
  defaultLocale: string = 'en'
): string {
  if (!href) return targetLocale === defaultLocale ? '/' : `/${targetLocale}`;

  // If external link, don't modify
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return href;
  }

  // Handle hash only
  if (href.startsWith('#')) {
    return href;
  }

  // Split query/hash
  const [baseAndQuery, hash] = href.split('#');
  const [basePath, search] = baseAndQuery.split('?');

  const { cleanPath } = stripLocalePrefix(basePath || '/');

  let resultPath: string;
  if (targetLocale === defaultLocale) {
    resultPath = cleanPath;
  } else {
    resultPath = cleanPath === '/' ? `/${targetLocale}` : `/${targetLocale}${cleanPath}`;
  }

  if (search) {
    resultPath += `?${search}`;
  }
  if (hash) {
    resultPath += `#${hash}`;
  }

  return resultPath;
}
