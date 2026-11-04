import { NextResponse } from 'next/server';
import { getBrandAssets } from '@/lib/blueprint-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { faviconUrl } = await getBrandAssets();

    if (faviconUrl && faviconUrl.startsWith('http')) {
      const imgRes = await fetch(faviconUrl, {
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      });

      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const contentType = imgRes.headers.get('content-type') || 'image/webp';

        return new NextResponse(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });
      }
    }
  } catch (error: any) {
    console.warn('[favicon.ico/route] Failed to fetch live favicon:', error?.message);
  }

  // Fallback 1x1 transparent PNG if nothing else is available
  const transparentPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    'base64'
  );

  return new NextResponse(transparentPng, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
