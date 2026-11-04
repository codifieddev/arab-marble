import { NextRequest, NextResponse } from 'next/server';
import { getPeekeeperGallery } from '@/lib/peekeeper-shop-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get('limit') || '3');
  const offset = Number(searchParams.get('offset') || '0');

  return NextResponse.json({
    items: getPeekeeperGallery(limit, offset),
    nextOffset: offset + limit,
  });
}

