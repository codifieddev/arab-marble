import type { Page } from '@/lib/store/pages/pageType';
import { PAGE_SLUGS, loadPageData, loadAllPages } from '@/components/cms/loader';

async function fetchWithTenant(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    cache: 'no-store',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.detail || body.message || body.error || `HTTP ${response.status}`);
  }
  return body;
}

export function cleanPropValue(val: unknown): unknown {
  if (val === null || val === undefined) return val;

  // Handle { type: '...', value: ... } wrappers from CMS backend
  if (typeof val === 'object' && !Array.isArray(val) && 'type' in val && 'value' in val) {
    const record = val as { type?: unknown; value?: unknown };
    const type = record.type;
    const inner = record.value;

    if (type === 'json') {
      if (typeof inner === 'string') {
        try {
          return cleanPropValue(JSON.parse(inner));
        } catch {
          return inner;
        }
      }
      return cleanPropValue(inner);
    }

    if (
      type === 'text' ||
      type === 'textarea' ||
      type === 'image' ||
      type === 'link' ||
      type === 'number' ||
      type === 'boolean'
    ) {
      return cleanPropValue(inner);
    }
  }

  // If array, recursively clean each element
  if (Array.isArray(val)) {
    return val.map(cleanPropValue);
  }

  return val;
}

export function cleanCmsPage(page: Page): Page {
  if (!page) return page;

  const rawBlocks =
    (Array.isArray(page.content) && page.content.length > 0 ? page.content : null) ||
    (Array.isArray((page as any).blocks) && (page as any).blocks.length > 0 ? (page as any).blocks : null) ||
    (Array.isArray((page as any).payload?.blocks) ? (page as any).payload.blocks : null) ||
    (Array.isArray((page as any).payload?.content) ? (page as any).payload.content : null) ||
    page.content ||
    [];

  const cleanedContent = Array.isArray(rawBlocks)
    ? rawBlocks.map((block: any) => {
        if (!block || !block.props || typeof block.props !== 'object') return block;

        const cleanedProps: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(block.props)) {
          cleanedProps[key] = cleanPropValue(val);
        }

        return {
          ...block,
          props: cleanedProps,
        };
      })
    : [];

  return {
    ...page,
    content: cleanedContent,
    blocks: cleanedContent,
  };
}

function normalizePageResponse(response: unknown): Page {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid CMS response: not an object');
  }

  const obj = response as Record<string, unknown>;

  if (
    obj.data &&
    typeof obj.data === 'object' &&
    obj.data !== null &&
    'slug' in (obj.data as Record<string, unknown>)
  ) {
    return cleanCmsPage(obj.data as unknown as Page);
  }

  if (typeof obj.slug === 'string') {
    return cleanCmsPage(response as Page);
  }

  throw new Error('Invalid CMS response: missing slug field');
}

export async function fetchPage(slug: string): Promise<Page> {
  try {
    const response = await fetchWithTenant(
      `/api/cms/pages?slug=${encodeURIComponent(slug)}`,
    );
    return normalizePageResponse(response);
  } catch (error) {
    const fallback = loadPageData(slug);
    if (fallback) {
      return cleanCmsPage(fallback);
    }
    throw error;
  }
}

function normalizeAllPagesResponse(response: unknown): Record<string, Page> {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid all-pages response');
  }

  const obj = response as Record<string, unknown>;
  const data = obj.data && typeof obj.data === 'object' ? obj.data : obj;

  if (Array.isArray(data)) {
    const pages: Record<string, Page> = {};
    for (const item of data) {
      if (item && typeof item === 'object' && typeof (item as Page).slug === 'string') {
        const page = cleanCmsPage(item as Page);
        pages[page.slug] = page;
      }
    }
    if (Object.keys(pages).length > 0) return pages;
  }

  if (!Array.isArray(data)) {
    const record = data as Record<string, unknown>;
    const firstVal = Object.values(record)[0];
    if (firstVal && typeof firstVal === 'object' && typeof (firstVal as Page).slug === 'string') {
      const cleanedRecord: Record<string, Page> = {};
      for (const [key, val] of Object.entries(record)) {
        if (val && typeof val === 'object' && typeof (val as Page).slug === 'string') {
          cleanedRecord[key] = cleanCmsPage(val as Page);
        }
      }
      return cleanedRecord;
    }
  }

  throw new Error('Invalid all-pages response format');
}

export async function fetchAllPages(): Promise<Page[]> {
  try {
    const response = await fetchWithTenant('/api/cms/pages');
    const record = normalizeAllPagesResponse(response);
    return Object.values(record);
  } catch {
    // Graceful fallback without hammering backend with 20 parallel requests
    const localPages = loadAllPages();
    return Object.values(localPages);
  }
}
