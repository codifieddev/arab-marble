import { NextResponse } from 'next/server';
import {
  resolveBrandLogo,
  resolveBrandFavicon,
  resolveBrandName,
} from '@/lib/brand/brand-resolver';

export const dynamic = 'force-dynamic';

export async function GET() {
  const tenantDb = (
    process.env.TENANT_DB_NAME ||
    process.env.NEXT_PUBLIC_TENANT_DB ||
    'kp_arab_marble'
  ).trim();

  const apiUrl = (
    process.env.FASTAPI_URL ||
    'http://127.0.0.1:8000'
  ).replace(/\/$/, '');

  try {
    const res = await fetch(`${apiUrl}/platform/business-blueprint`, {
      headers: {
        'x-tenant-db': tenantDb,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const json = await res.json();
      const payload = json?.data?.payload || json?.data || json || {};

      const logoUrl = resolveBrandLogo(payload);
      const faviconUrl = resolveBrandFavicon(payload);
      const brandName = resolveBrandName(payload);

      return NextResponse.json(
        {
          branding: {
            logoUrl,
            faviconUrl,
            brandName,
            payload,
          },
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }
  } catch (error: any) {
    console.warn('[api/branding/current] Error fetching fresh blueprint:', error?.message);
  }

  return NextResponse.json(
    {
      branding: {
        logoUrl: '/images/arab-marble-logo.svg',
        faviconUrl: '/images/arab-marble-logo.svg',
        brandName: 'Arab Marble',
        payload: null,
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
