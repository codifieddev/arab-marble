import { NextRequest, NextResponse } from 'next/server';
import { getConfiguredDatabaseName } from '@/lib/database-authority';

const FASTAPI_URL = (process.env.FASTAPI_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '6';
  const offset = searchParams.get('offset') || '0';
  const filter = searchParams.get('filter') || '';
  const slug = searchParams.get('slug') || '';
  const productId = searchParams.get('productId') || '';

  let dbName = 'kp_peekeeper';
  try {
    dbName = getConfiguredDatabaseName();
  } catch {}

  const params = new URLSearchParams();
  params.set('limit', limit);
  params.set('offset', offset);
  if (filter) params.set('filter', filter);
  if (slug) params.set('slug', slug);
  if (productId) params.set('productId', productId);

  try {
    const res = await fetch(`${FASTAPI_URL}/commerce/reviews?${params.toString()}`, {
      headers: {
        'x-tenant-db': dbName,
        'x-tenant-slug': process.env.NEXT_PUBLIC_TENANT_SLUG || 'peekeeper',
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        items: data.items || [],
        total: data.total || 0,
        nextOffset: data.nextOffset ?? (Number(offset) + (data.items?.length || 0)),
        hasMore: Boolean(data.hasMore),
        summary: data.summary || { average: 0, total: 0, distribution: [] },
        reviewSummary: data.summary || { average: 0, total: 0, distribution: [] },
      });
    }
  } catch (err) {
    console.error('Failed to fetch reviews from backend:', err);
  }

  return NextResponse.json({
    items: [],
    total: 0,
    nextOffset: 0,
    hasMore: false,
    summary: { average: 0, total: 0, distribution: [] },
    reviewSummary: { average: 0, total: 0, distribution: [] },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  let dbName = 'kp_peekeeper';
  try {
    dbName = getConfiguredDatabaseName();
  } catch {}

  try {
    const res = await fetch(`${FASTAPI_URL}/commerce/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-db': dbName,
        'x-tenant-slug': process.env.NEXT_PUBLIC_TENANT_SLUG || 'peekeeper',
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ review: data.review || data.data }, { status: 201 });
    }
    const errBody = await res.json().catch(() => ({}));
    return NextResponse.json({ error: errBody.detail || 'Failed to submit review' }, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error submitting review' }, { status: 500 });
  }
}
