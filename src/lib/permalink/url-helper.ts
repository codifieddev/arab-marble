import { DEFAULT_PERMALINK_CONFIG, sanitizeBase } from './config';
import { EntityType, PermalinkConfig } from './types';

export interface EntityLike {
  type?: EntityType;
  slug?: string | Record<string, string> | null;
  id?: string | null;
  _id?: string | null;
  name?: string | null;
  categorySlug?: string | null;
  categoryIds?: string[] | null;
}

/**
 * Extracts a localized slug string from an entity for the given locale.
 */
export function extractEntitySlug(
  entity: EntityLike,
  locale = 'en',
  defaultLanguage = 'en'
): string {
  const rawSlug = entity.slug;
  if (typeof rawSlug === 'string' && rawSlug.trim()) {
    return rawSlug.trim();
  }

  if (rawSlug && typeof rawSlug === 'object') {
    const slugMap = rawSlug as Record<string, string>;
    if (slugMap[locale]?.trim()) return slugMap[locale].trim();
    if (slugMap[defaultLanguage]?.trim()) return slugMap[defaultLanguage].trim();
    const first = Object.values(slugMap)[0];
    if (first?.trim()) return first.trim();
  }

  // Fallback to ID or name
  const fallback = String(entity.id || entity._id || entity.name || '').trim();
  return fallback.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

let runtimePermalinkConfig: PermalinkConfig = { ...DEFAULT_PERMALINK_CONFIG };

if (typeof window !== 'undefined' && (window as any).__PERMALINK_CONFIG__) {
  try {
    runtimePermalinkConfig = {
      ...DEFAULT_PERMALINK_CONFIG,
      ...(window as any).__PERMALINK_CONFIG__,
    };
  } catch {
    // Ignore invalid config in window
  }
}

export function setRuntimePermalinkConfig(config: Partial<PermalinkConfig> | null | undefined): void {
  if (!config) return;
  runtimePermalinkConfig = {
    ...runtimePermalinkConfig,
    ...config,
  };
  if (typeof window !== 'undefined') {
    (window as any).__PERMALINK_CONFIG__ = runtimePermalinkConfig;
  }
}

export function getRuntimePermalinkConfig(): PermalinkConfig {
  if (typeof window !== 'undefined' && (window as any).__PERMALINK_CONFIG__) {
    return {
      ...runtimePermalinkConfig,
      ...(window as any).__PERMALINK_CONFIG__,
    };
  }
  return runtimePermalinkConfig;
}

/**
 * Returns the canonical URL path for any entity, honoring:
 * 1. Configured permalink structure (e.g. /product, /shop, /category, or custom)
 * 2. Multilingual rules (unprefixed for default language, prefixed for non-default)
 * 3. Translated or language-neutral slug
 */
export function getEntityUrl(
  entity: EntityLike,
  locale = 'en',
  config?: Partial<PermalinkConfig>,
  defaultLanguage = 'en'
): string {
  if (typeof window !== 'undefined' && (window as any).__PERMALINK_CONFIG__) {
    runtimePermalinkConfig = {
      ...runtimePermalinkConfig,
      ...(window as any).__PERMALINK_CONFIG__,
    };
  }

  const activeConfig: PermalinkConfig = {
    ...DEFAULT_PERMALINK_CONFIG,
    ...runtimePermalinkConfig,
    ...config,
  };

  const type = entity.type || 'product';
  const slug = extractEntitySlug(entity, locale, defaultLanguage);

  let entityPath = '';

  switch (type) {
    case 'product': {
      const rawStructure = (activeConfig.permalinkStructure || '/product').trim().toLowerCase();
      const shopBase = sanitizeBase(activeConfig.shopBase || 'shop', 'shop');
      if (rawStructure === 'shop' || rawStructure === '/shop') {
        entityPath = `/${shopBase}/${slug}`;
      } else if (rawStructure === 'category' || rawStructure === '/category') {
        const cat = entity.categorySlug || 'general';
        entityPath = `/${shopBase}/${cat}/${slug}`;
      } else if (
        rawStructure !== 'default' &&
        rawStructure !== '/default' &&
        rawStructure !== 'product' &&
        rawStructure !== '/product'
      ) {
        const customBase = sanitizeBase(rawStructure, 'product');
        entityPath = `/${customBase}/${slug}`;
      } else {
        // Standard default: /product/{slug}
        entityPath = `/product/${slug}`;
      }
      break;
    }
    case 'category': {
      const catBase = sanitizeBase(
        activeConfig.productCategoryBase || activeConfig.categoryBase,
        'product-category'
      );
      entityPath = slug && slug !== 'all' ? `/${catBase}/${slug}` : `/${catBase}`;
      break;
    }
    case 'admin': {
      entityPath = '/kalptree';
      break;
    }
    case 'cms_page': {
      if (slug === 'home' || slug === '') {
        entityPath = '';
      } else {
        entityPath = `/${slug}`;
      }
      break;
    }
    case 'shop': {
      const shopBase = sanitizeBase(activeConfig.shopBase || 'shop', 'shop');
      entityPath = slug ? `/${shopBase}/${slug}` : `/${shopBase}`;
      break;
    }
    case 'blog': {
      entityPath = slug ? `/blog/${slug}` : '/blog';
      break;
    }
    default: {
      entityPath = `/${slug}`;
      break;
    }
  }

  // Prepend language prefix if non-default language
  const isDefaultLang = (locale || defaultLanguage).toLowerCase() === defaultLanguage.toLowerCase();
  const localePrefix = isDefaultLang ? '' : `/${locale.toLowerCase()}`;

  const fullPath = `${localePrefix}${entityPath}`;
  return fullPath === '' ? '/' : fullPath;
}

/**
 * Normalizes any internal application href (e.g. '/shop', '/product/my-slug', '/category/dogs')
 * into its configured permalink canonical URL.
 */
export function resolveHrefWithPermalinks(
  href: string,
  locale = 'en',
  config?: Partial<PermalinkConfig>,
  defaultLanguage = 'en'
): string {
  if (
    !href ||
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#') ||
    href.startsWith('/#')
  ) {
    return href;
  }

  const [pathPart, queryOrHash = ''] = href.split(/(?=[?#])/);
  const cleanPath = pathPart.replace(/\/+$/, '') || '/';

  let purePath = cleanPath;
  let targetLocale = locale;
  const segments = cleanPath.split('/').filter(Boolean);
  if (segments.length > 0 && segments[0].length === 2) {
    targetLocale = segments[0];
    purePath = '/' + segments.slice(1).join('/');
  }

  if (purePath === '/shop' || purePath === '/shop/') {
    const shopUrl = getEntityUrl({ type: 'shop' }, targetLocale, config, defaultLanguage);
    return `${shopUrl}${queryOrHash}`;
  }

  if (purePath.startsWith('/product/')) {
    const slug = purePath.slice('/product/'.length);
    const prodUrl = getEntityUrl({ type: 'product', slug }, targetLocale, config, defaultLanguage);
    return `${prodUrl}${queryOrHash}`;
  }

  if (purePath.startsWith('/category/')) {
    const slug = purePath.slice('/category/'.length);
    const catUrl = getEntityUrl({ type: 'category', slug }, targetLocale, config, defaultLanguage);
    return `${catUrl}${queryOrHash}`;
  }

  return href;
}

