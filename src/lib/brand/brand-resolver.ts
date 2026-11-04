/**
 * Centralized Brand Asset Resolver for PeeKeeper Storefront.
 * Resolves Logo, Favicon, and Brand Name across all legacy & modern
 * Kalp-Admin / FastAPI blueprint schemas.
 */

const DEFAULT_LOGO = '/images/arab-marble-logo.svg';
const DEFAULT_FAVICON = '/images/arab-marble-logo.svg';
const DEFAULT_BRAND_NAME = 'Arab Marble';

function cleanUrl(val: unknown): string | null {
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (
    !trimmed ||
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    trimmed === '[object Object]' ||
    trimmed.startsWith('media://') ||
    trimmed.includes('undefined')
  ) {
    return null;
  }
  return trimmed;
}

/**
 * Resolves the primary brand logo URL from the blueprint / branding configuration.
 * Prioritizes admin-managed Theme Style brand assets, followed by DNA profile,
 * brandKit, publicProfile, and finally fallback defaults.
 */
export function resolveBrandLogo(payload: any): string {
  if (!payload) return DEFAULT_LOGO;

  const candidates: unknown[] = [
    payload?.brandAssets?.logoUrl,
    payload?.brandAssets?.logo,
    payload?.business?.brand?.logoRef,
    payload?.business?.brand?.logoUrl,
    payload?.business?.brand?.businessDna?.logoUrl,
    payload?.brandKit?.logo?.primary,
    payload?.brandKit?.logo?.light,
    payload?.brandKit?.logo?.icon,
    payload?.publicProfile?.logoUrl,
    payload?.publicProfile?.logo,
    payload?.branding?.logoUrl,
    payload?.branding?.logo,
    Array.isArray(payload?.business?.brand?.logos)
      ? payload.business.brand.logos.find(
          (l: any) => l?.id === 'primary' || l?.id === 'primary-logo'
        )?.url || payload.business.brand.logos[0]?.url
      : null,
    payload?.header?.logo?.image,
    payload?.header?.image,
  ];

  for (const candidate of candidates) {
    const url = cleanUrl(candidate);
    if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:'))) {
      return url;
    }
  }

  for (const candidate of candidates) {
    const url = cleanUrl(candidate);
    if (url) return url;
  }

  return DEFAULT_LOGO;
}

/**
 * Resolves the primary brand favicon URL from the blueprint / branding configuration.
 * Strictly mirrors the resolution priority in ThemeManager.tsx.
 */
export function resolveBrandFavicon(payload: any): string {
  if (!payload) return DEFAULT_FAVICON;

  const candidates: unknown[] = [
    payload?.business?.brand?.faviconRef,
    payload?.business?.brand?.businessDna?.faviconUrl,
    payload?.brandKit?.logo?.favicon,
    payload?.brandKit?.faviconUrl,
    payload?.brandAssets?.favIcon,
    payload?.brandAssets?.favicon,
    payload?.brandAssets?.faviconUrl,
    payload?.branding?.favIcon,
    payload?.branding?.favicon,
    payload?.publicProfile?.faviconUrl,
    payload?.faviconUrl,
    payload?.favicon,
  ];

  for (const candidate of candidates) {
    const url = cleanUrl(candidate);
    if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:'))) {
      return url;
    }
  }

  for (const candidate of candidates) {
    const url = cleanUrl(candidate);
    if (url) return url;
  }

  return DEFAULT_FAVICON;
}

/**
 * Resolves the brand / business display name.
 */
export function resolveBrandName(payload: any): string {
  if (!payload) return DEFAULT_BRAND_NAME;

  const candidates: unknown[] = [
    payload?.business?.name,
    payload?.business?.brand?.businessDna?.businessName,
    payload?.business?.brand?.name,
    payload?.publicProfile?.businessName,
    payload?.header?.WebsiteName?.title,
    payload?.header?.text,
    payload?.companyInfo?.name,
  ];

  for (const candidate of candidates) {
    const name = cleanUrl(candidate);
    if (name) return name;
  }

  return DEFAULT_BRAND_NAME;
}

/**
 * Client-side DOM helper: updates all <link rel="icon"> tags in <head>
 * dynamically so the browser tab immediately reflects the updated favicon.
 */
export function applyFaviconToDocument(href: string): void {
  if (!href || typeof document === 'undefined') return;

  const selectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
  ];

  for (const selector of selectors) {
    let link = document.querySelector<HTMLLinkElement>(selector);
    if (!link) {
      link = document.createElement('link');
      link.rel = selector.includes('apple')
        ? 'apple-touch-icon'
        : selector.includes('shortcut')
          ? 'shortcut icon'
          : 'icon';
      document.head.appendChild(link);
    }
    link.href = href;
  }
}
