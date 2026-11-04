import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isLocalePattern } from '@/lib/locale-utils';
import { getBlueprintLocalizationSync } from '@/lib/blueprint-server';
import {
  normalizePath,
  resolveRedirectChain,
  isValidProductSlug,
  isValidCategorySlug,
  sanitizeBase,
} from '@/lib/permalink/config';
import { getTenantPermalinkConfig } from '@/lib/permalink/resolver';

function createNotFoundResponse(): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>404 - Page Not Found | Arab Marble</title>
  <meta name="robots" content="noindex, nofollow" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fffaf5; color: #2d2a26; margin: 0; padding: 0; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
    .box { max-width: 540px; padding: 40px 20px; }
    h1 { font-size: 8rem; margin: 0; line-height: 1; font-weight: 900; color: #d4a373; }
    h2 { font-size: 2rem; margin: 16px 0; font-weight: 800; color: #1f2937; }
    p { font-size: 1.1rem; color: #6b7280; line-height: 1.6; margin-bottom: 32px; }
    a { display: inline-block; background: #d4a373; color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 700; transition: opacity 0.2s; }
    a:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="box">
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <p>The page you are looking for seems to have wandered off. Let's get you back on track.</p>
    <a href="/">Return Home</a>
  </div>
</body>
</html>`;
  return new NextResponse(html, {
    status: 404,
    statusText: 'Not Found',
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1a. Redirect legacy /kalp-admin to /kalptree
  if (pathname === '/kalp-admin' || pathname.startsWith('/kalp-admin/')) {
    const newPath = pathname.replace('/kalp-admin', '/kalptree');
    return NextResponse.redirect(new URL(newPath + request.nextUrl.search, request.url), 307);
  }

  // 1. Exclude API, Next.js internals, admin panel, and static assets
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/admin') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  // 2. Trailing slash & Uppercase normalization -> 301 Permanent Redirect (preserve query params)
  const hasTrailingSlash = pathname.length > 1 && pathname.endsWith('/');
  const hasUppercase = /[A-Z]/.test(pathname);
  if (hasTrailingSlash || hasUppercase) {
    const normalizedPath = normalizePath(pathname);
    const redirectUrl = new URL(normalizedPath + request.nextUrl.search, request.url);
    return NextResponse.redirect(redirectUrl, 301);
  }

  // 3. Fetch tenant localization configuration (uses in-memory TTL cache)
  const tenantDbHeader = request.headers.get('x-tenant-db');
  const tenantLocalization = getBlueprintLocalizationSync(tenantDbHeader || undefined);
  const defaultLanguage = tenantLocalization.defaultLanguage.toLowerCase();
  const supportedLanguages = tenantLocalization.supportedLanguages.map((l) => l.toLowerCase());

  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = (segments[0] || '').toLowerCase();

  const tenantDb = (
    tenantDbHeader ||
    process.env.TENANT_DB_NAME ||
    process.env.NEXT_PUBLIC_TENANT_DB ||
    'kp_arab_marble'
  ).trim();

  const permalinkConfig = await getTenantPermalinkConfig(tenantDb);
  const productBase = sanitizeBase(permalinkConfig.permalinkStructure, 'product');
  const shopBase = sanitizeBase(permalinkConfig.shopBase || 'shop', 'shop');
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
    'kalp-admin',
    'kalptree',
  ]);

  // A segment is a locale ONLY if:
  // 1. It matches the ISO locale pattern (2-letter code)
  // 2. It is NOT a known content base (product, shop, category, etc.)
  // 3. It IS actually one of the configured supported languages or the default language
  // This prevents custom permalink bases like 'pr' from being misidentified as locale prefixes.
  const isKnownLocale =
    isLocalePattern(firstSegment) &&
    (firstSegment === defaultLanguage || supportedLanguages.includes(firstSegment));
  const hasLocale = !knownBases.has(firstSegment) && isKnownLocale;

  // 4. First segment matches a 2-letter ISO locale pattern (e.g. "en", "hi", "zh")
  if (hasLocale) {
    // 4a. If the prefix is the DEFAULT language (e.g. "/en/shop" or "/en")
    // Rule: Default language MUST NEVER be present in the URL -> 301 Permanent Redirect
    if (firstSegment === defaultLanguage) {
      const remainingSegments = segments.slice(1);
      const cleanPath = remainingSegments.length > 0 ? `/${remainingSegments.join('/')}` : '/';
      const redirectUrl = new URL(cleanPath + request.nextUrl.search, request.url);
      return NextResponse.redirect(redirectUrl, 301);
    }

    // 4b. If the prefix is an ENABLED, SUPPORTED non-default language (e.g. "/hi/shop")
    if (supportedLanguages.includes(firstSegment)) {
      const remainingSegments = segments.slice(1);
      const cleanPath = remainingSegments.length > 0 ? `/${remainingSegments.join('/')}` : '/';

      // Check if remainder has a registered redirect
      const redirectMatch = resolveRedirectChain(tenantDb, cleanPath, request.nextUrl.search);
      if (redirectMatch) {
        const dest = redirectMatch.destination.startsWith('/')
          ? `/${firstSegment}${redirectMatch.destination}`
          : redirectMatch.destination;
        return NextResponse.redirect(new URL(dest, request.url), redirectMatch.statusCode);
      }

      // Check alternate patterns for non-default locale
      if (remainingSegments.length === 2 && remainingSegments[0] === 'shop') {
        const target = `/${firstSegment}/${productBase}/${remainingSegments[1]}${request.nextUrl.search}`;
        return NextResponse.redirect(new URL(target, request.url), 301);
      }
      if (remainingSegments.length === 2 && remainingSegments[0] === 'product' && productBase !== 'product') {
        const target = `/${firstSegment}/${productBase}/${remainingSegments[1]}${request.nextUrl.search}`;
        return NextResponse.redirect(new URL(target, request.url), 301);
      }
      if (remainingSegments.length === 2 && remainingSegments[0] === 'category' && categoryBase !== 'category') {
        const target = `/${firstSegment}/${categoryBase}/${remainingSegments[1]}${request.nextUrl.search}`;
        return NextResponse.redirect(new URL(target, request.url), 301);
      }
      if (remainingSegments.length === 2 && remainingSegments[0] === 'product-category' && categoryBase !== 'product-category') {
        const target = `/${firstSegment}/${categoryBase}/${remainingSegments[1]}${request.nextUrl.search}`;
        return NextResponse.redirect(new URL(target, request.url), 301);
      }
      if (remainingSegments.length === 1 && remainingSegments[0] === 'category' && categoryBase !== 'category') {
        const target = `/${firstSegment}/${categoryBase}${request.nextUrl.search}`;
        return NextResponse.redirect(new URL(target, request.url), 301);
      }
      if (remainingSegments.length === 1 && remainingSegments[0] === 'product-category' && categoryBase !== 'product-category') {
        const target = `/${firstSegment}/${categoryBase}${request.nextUrl.search}`;
        return NextResponse.redirect(new URL(target, request.url), 301);
      }
      if (remainingSegments.length === 1 && remainingSegments[0] === 'shop' && shopBase !== 'shop') {
        const target = `/${firstSegment}/${shopBase}${request.nextUrl.search}`;
        return NextResponse.redirect(new URL(target, request.url), 301);
      }

      // Check product/category validity
      if (remainingSegments.length === 2 && (remainingSegments[0] === 'product' || remainingSegments[0] === productBase)) {
        const exists = await isValidProductSlug(tenantDb, remainingSegments[1]);
        if (!exists) {
          return createNotFoundResponse();
        }
      }
      if (remainingSegments.length === 2 && (remainingSegments[0] === 'product-category' || remainingSegments[0] === categoryBase)) {
        const exists = await isValidCategorySlug(tenantDb, remainingSegments[1]);
        if (!exists) {
          return createNotFoundResponse();
        }
      }

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-locale', firstSegment);
      requestHeaders.set('x-locale-prefixed', 'true');
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // 4c. If the prefix is an UNSUPPORTED language (e.g. "/zh/shop")
    // Rule: 307 Temporary Redirect to clean path without prefix + short-lived notice cookie
    const remainingSegments = segments.slice(1);
    const cleanPath = remainingSegments.length > 0 ? `/${remainingSegments.join('/')}` : '/';
    const redirectUrl = new URL(cleanPath + request.nextUrl.search, request.url);

    const response = NextResponse.redirect(redirectUrl, 307);
    response.cookies.set('locale_notice', 'unsupported', {
      path: '/',
      maxAge: 30, // 30 seconds
      sameSite: 'lax',
    });
    return response;
  }

  // 5. No locale prefix in the URL (default language)
  // Check if path has a registered redirect
  const redirectMatch = resolveRedirectChain(tenantDb, pathname, request.nextUrl.search);
  if (redirectMatch) {
    return NextResponse.redirect(
      new URL(redirectMatch.destination, request.url),
      redirectMatch.statusCode
    );
  }

  // Check alternate patterns for default locale
  if (segments.length === 2 && segments[0] === 'shop') {
    const target = `/${productBase}/${segments[1]}${request.nextUrl.search}`;
    return NextResponse.redirect(new URL(target, request.url), 301);
  }
  if (segments.length === 2 && segments[0] === 'product' && productBase !== 'product') {
    const target = `/${productBase}/${segments[1]}${request.nextUrl.search}`;
    return NextResponse.redirect(new URL(target, request.url), 301);
  }
  if (segments.length === 2 && segments[0] === 'category' && categoryBase !== 'category') {
    const target = `/${categoryBase}/${segments[1]}${request.nextUrl.search}`;
    return NextResponse.redirect(new URL(target, request.url), 301);
  }
  if (segments.length === 2 && segments[0] === 'product-category' && categoryBase !== 'product-category') {
    const target = `/${categoryBase}/${segments[1]}${request.nextUrl.search}`;
    return NextResponse.redirect(new URL(target, request.url), 301);
  }
  if (segments.length === 1 && segments[0] === 'category' && categoryBase !== 'category') {
    const target = `/${categoryBase}${request.nextUrl.search}`;
    return NextResponse.redirect(new URL(target, request.url), 301);
  }
  if (segments.length === 1 && segments[0] === 'product-category' && categoryBase !== 'product-category') {
    const target = `/${categoryBase}${request.nextUrl.search}`;
    return NextResponse.redirect(new URL(target, request.url), 301);
  }
  if (segments.length === 1 && segments[0] === 'shop' && shopBase !== 'shop') {
    const target = `/${shopBase}${request.nextUrl.search}`;
    return NextResponse.redirect(new URL(target, request.url), 301);
  }

  // Check product/category validity
  if (segments.length === 2 && (segments[0] === 'product' || segments[0] === productBase)) {
    const exists = await isValidProductSlug(tenantDb, segments[1]);
    if (!exists) {
      return createNotFoundResponse();
    }
  }
  if (segments.length === 2 && (segments[0] === 'product-category' || segments[0] === categoryBase)) {
    const exists = await isValidCategorySlug(tenantDb, segments[1]);
    if (!exists) {
      return createNotFoundResponse();
    }
  }

  // 6. Internal rewrite to [locale] route for default language
  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = `/${defaultLanguage}${pathname === '/' ? '' : pathname}`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', defaultLanguage);
  requestHeaders.set('x-locale-prefixed', 'false');

  return NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}

// Backward compatibility alias
export const middleware = proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - admin (admin dashboard)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|admin).*)',
  ],
};
