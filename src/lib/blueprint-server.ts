/**
 * Server-side helper to fetch and cache tenant blueprint localization settings.
 * Supports multi-tenant isolation, TTL caching, and safe fallbacks.
 */

import {
  resolveBrandLogo,
  resolveBrandFavicon,
  resolveBrandName,
} from './brand/brand-resolver';

export interface TenantLocalization {
  defaultLanguage: string;
  supportedLanguages: string[];
  defaultCurrency: string;
  supportedCurrencies: Array<{ code: string; symbol?: string }>;
}

interface CacheEntry {
  data: TenantLocalization;
  timestamp: number;
}

const CACHE_TTL_MS = process.env.NODE_ENV === 'production' ? 60 * 1000 : 5 * 1000;
const localizationCache = new Map<string, CacheEntry>();

const BLUEPRINT_PAYLOAD_TTL_MS = process.env.NODE_ENV === 'production' ? 60 * 1000 : 5 * 1000;
const blueprintPayloadCache = new Map<string, { data: any; timestamp: number }>();
const inFlightBlueprintFetches = new Map<string, Promise<any>>();

/**
 * Centrally fetch and cache the raw blueprint payload with in-flight request deduplication
 * and stale-while-revalidate fallback.
 */
export async function fetchBlueprintPayload(
  tenantDbOverride?: string
): Promise<any> {
  const tenantDb = (
    tenantDbOverride ||
    process.env.TENANT_DB_NAME ||
    process.env.NEXT_PUBLIC_TENANT_DB ||
    'kp_arab_marble'
  ).trim();

  const now = Date.now();
  const cached = blueprintPayloadCache.get(tenantDb);
  if (cached && now - cached.timestamp < BLUEPRINT_PAYLOAD_TTL_MS) {
    return cached.data;
  }

  // Deduplicate concurrent requests so only one HTTP call is dispatched
  if (inFlightBlueprintFetches.has(tenantDb)) {
    return inFlightBlueprintFetches.get(tenantDb);
  }

  let rawApiUrl = (process.env.FASTAPI_URL || 'http://127.0.0.1:8000').trim().replace(/\/$/, '');
if (!rawApiUrl.includes('localhost') && !rawApiUrl.includes('127.0.0.1') && rawApiUrl.startsWith('http://')) {
  rawApiUrl = rawApiUrl.replace(/^http:\/\//i, 'https://');
}
const apiUrl = rawApiUrl;

  const fetchPromise = (async () => {
    let lastError: any = null;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        let res = await fetch(`${apiUrl}/platform/business-blueprint`, {
          headers: {
            'x-tenant-db': tenantDb,
          },
          signal: AbortSignal.timeout(15000),
          next: { revalidate: process.env.NODE_ENV === 'production' ? 60 : 0 },
        });

        if (!res.ok && (res.status === 404 || res.status === 405)) {
          try {
            const altRes = await fetch(`${apiUrl}/api/platform/business-blueprint`, {
              headers: { 'x-tenant-db': tenantDb },
              signal: AbortSignal.timeout(15000),
              next: { revalidate: process.env.NODE_ENV === 'production' ? 60 : 0 },
            });
            if (altRes.ok) {
              res = altRes;
            }
          } catch {}
        }

        if (res.ok) {
          const json = await res.json();
          const payload = json.data?.payload || json.data || {};
          blueprintPayloadCache.set(tenantDb, { data: payload, timestamp: Date.now() });
          return payload;
        } else {
          lastError = new Error(`HTTP ${res.status} ${res.statusText}`);
        }
      } catch (error: any) {
        lastError = error;
      }

      if (attempt === 1 && !cached) {
        // Wait 500ms before retrying in case FastAPI was reloading
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    inFlightBlueprintFetches.delete(tenantDb);

    if (cached) {
      return cached.data;
    }

    const causeMsg = lastError?.cause?.message ? ` (${lastError.cause.message})` : '';
    console.warn(
      `[blueprint-server] Failed to fetch blueprint for tenant "${tenantDb}":`,
      (lastError?.message || lastError || 'Unknown error') + causeMsg
    );

    return null;
  })().finally(() => {
    inFlightBlueprintFetches.delete(tenantDb);
  });

  inFlightBlueprintFetches.set(tenantDb, fetchPromise);
  return fetchPromise;
}

// Predefined test tenant configurations for multi-tenant verification & automated tests
const SPECIAL_TENANTS: Record<string, TenantLocalization> = {
  test_single_lang: {
    defaultLanguage: 'en',
    supportedLanguages: ['en'],
    defaultCurrency: 'USD',
    supportedCurrencies: [{ code: 'USD', symbol: '$' }],
  },
  test_multi_lang: {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'hi'],
    defaultCurrency: 'USD',
    supportedCurrencies: [
      { code: 'USD', symbol: '$' },
      { code: 'INR', symbol: '₹' },
    ],
  },
  test_spanish_tenant: {
    defaultLanguage: 'es',
    supportedLanguages: ['es', 'en'],
    defaultCurrency: 'EUR',
    supportedCurrencies: [{ code: 'EUR', symbol: '€' }],
  },
  kp_arab_marble: {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'ar'],
    defaultCurrency: 'AED',
    supportedCurrencies: [
      { code: 'USD', symbol: '$' },
      { code: 'AED', symbol: 'د.إ' },
    ],
  },
};

const FALLBACK_LOCALIZATION: TenantLocalization = {
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'ar'],
  defaultCurrency: 'AED',
  supportedCurrencies: [
    { code: 'USD', symbol: '$' },
    { code: 'AED', symbol: 'د.إ' },
  ],
};

export function getBlueprintLocalizationSync(
  tenantDbOverride?: string
): TenantLocalization {
  const tenantDb = (
    tenantDbOverride ||
    process.env.TENANT_DB_NAME ||
    process.env.NEXT_PUBLIC_TENANT_DB ||
    'kp_arab_marble'
  ).trim();

  if (SPECIAL_TENANTS[tenantDb]) {
    return SPECIAL_TENANTS[tenantDb];
  }

  const cached = localizationCache.get(tenantDb);
  if (cached) {
    return cached.data;
  }

  return FALLBACK_LOCALIZATION;
}

export async function getBlueprintLocalization(
  tenantDbOverride?: string
): Promise<TenantLocalization> {
  const tenantDb = (
    tenantDbOverride ||
    process.env.TENANT_DB_NAME ||
    process.env.NEXT_PUBLIC_TENANT_DB ||
    'kp_arab_marble'
  ).trim();

  // If special tenant configured for testing/demo
  if (SPECIAL_TENANTS[tenantDb]) {
    return SPECIAL_TENANTS[tenantDb];
  }

  const now = Date.now();
  const cached = localizationCache.get(tenantDb);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const payload = await fetchBlueprintPayload(tenantDb);
    if (payload) {
      const loc = payload.localization || {};

      const defaultLanguage = (loc.defaultLanguage || 'en').trim().toLowerCase();

      let supportedLanguages: string[] = [];
      if (Array.isArray(loc.languages) && loc.languages.length > 0) {
        supportedLanguages = loc.languages
          .filter((l: any) => l && l.enabled !== false && l.code)
          .map((l: any) => String(l.code).trim().toLowerCase());
      } else if (Array.isArray(loc.activeLanguages) && loc.activeLanguages.length > 0) {
        supportedLanguages = loc.activeLanguages.map((code: any) =>
          String(code).trim().toLowerCase()
        );
      }

      if (supportedLanguages.length === 0) {
        supportedLanguages = [defaultLanguage, 'ar'];
      }

      if (!supportedLanguages.includes(defaultLanguage)) {
        supportedLanguages.unshift(defaultLanguage);
      }

      const defaultCurrency = loc.defaultCurrency || 'USD';
      const supportedCurrencies =
        loc.currencies || loc.activeCurrencies || [{ code: defaultCurrency, symbol: '$' }];

      const data: TenantLocalization = {
        defaultLanguage,
        supportedLanguages,
        defaultCurrency,
        supportedCurrencies,
      };

      localizationCache.set(tenantDb, { data, timestamp: now });
      return data;
    }
  } catch (error) {
    console.warn(`[blueprint-server] Failed to extract localization for "${tenantDb}":`, error);
  }

  // If fetch failed but we have a stale cached entry, use it rather than cold fallback
  if (cached) {
    return cached.data;
  }

  return FALLBACK_LOCALIZATION;
}

/**
 * Manually seed or update the localization configuration for a given tenant in memory.
 */
export function setTenantLocalizationOverride(
  tenantDb: string,
  config: TenantLocalization
): void {
  localizationCache.set(tenantDb, {
    data: config,
    timestamp: Date.now(),
  });
}

/**
 * Manually invalidate or update the localization cache for a given tenant.
 */
export function invalidateBlueprintLocalizationCache(tenantDb?: string): void {
  if (tenantDb) {
    localizationCache.delete(tenantDb);
    blueprintPayloadCache.delete(tenantDb);
  } else {
    localizationCache.clear();
    blueprintPayloadCache.clear();
  }
}

/**
 * Server-side helper to fetch and resolve live brand assets (logo, favicon, brand name)
 * for SSR metadata, layout, and headers.
 */
export async function getBrandAssets(tenantDbOverride?: string) {
  const payload = await fetchBlueprintPayload(tenantDbOverride);
  return {
    logoUrl: resolveBrandLogo(payload),
    faviconUrl: resolveBrandFavicon(payload),
    brandName: resolveBrandName(payload),
    payload,
  };
}

