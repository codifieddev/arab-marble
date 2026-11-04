import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPage, fetchAllPages as fetchAllPagesService } from '@/lib/services/cmsService';
import type { Page } from '@/lib/store/pages/pageType';
import { loadPageData } from '@/components/cms/loader';

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export const fetchPageBySlug = createAsyncThunk<Page, string>(
  'pages/fetchPageBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      return await fetchPage(slug);
    } catch (error: unknown) {
      return rejectWithValue(errorMessage(error, 'Failed to fetch page'));
    }
  }
);

export const fetchAllPages = createAsyncThunk<Page[], void>(
  'pages/fetchAllPages',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAllPagesService();
    } catch (error: unknown) {
      return rejectWithValue(errorMessage(error, 'Failed to fetch CMS pages'));
    }
  }
);

export const fetchFastApiPagesThunk = fetchAllPages;

export const updatePageThunk = createAsyncThunk<
  { success: boolean; message?: string; data?: any },
  { slug?: string; pageData?: Page } | void
>(
  'pages/updatePage',
  async (arg, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      let targetPage =
        (arg && typeof arg === 'object' && 'pageData' in arg && arg.pageData)
          ? arg.pageData
          : state?.pages?.currentPages;

      if (!targetPage) {
        const requestedSlug = (arg && typeof arg === 'object' && 'slug' in arg && arg.slug) || '';
        if (requestedSlug) {
          targetPage = state?.pages?.allPages?.find((p: any) => p.slug === requestedSlug) || loadPageData(requestedSlug);
        } else if (typeof window !== 'undefined') {
          const path = window.location.pathname.replace(/^\/(?:en|hi)(?:\/|$)/, '').replace(/^\//, '') || 'home';
          const normalizedSlug = path.startsWith('pr/') || path.startsWith('product/')
            ? 'product'
            : path.startsWith('category/')
            ? 'category'
            : path;
          targetPage = state?.pages?.allPages?.find((p: any) => p.slug === normalizedSlug) || loadPageData(normalizedSlug);
        }
      }

      if (!targetPage) {
        return rejectWithValue('No page data found to save');
      }

      const slug =
        (arg && typeof arg === 'object' && 'slug' in arg && arg.slug)
          ? arg.slug
          : targetPage.slug;

      const token = state?.auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      const tenantDb = process.env.NEXT_PUBLIC_TENANT_DB || 'kp_arab_marble';
      const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG || 'arab-marble';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-tenant-db': tenantDb,
        'x-tenant-slug': tenantSlug,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['auth-token'] = token;
      }

      const cleanSlug = targetPage.slug || slug;
      const cleanTitle = typeof targetPage.title === 'object' && targetPage.title !== null
        ? targetPage.title
        : { en: String(targetPage.title || cleanSlug) };
      const cleanMetaTitle = typeof targetPage.metaTitle === 'object' && targetPage.metaTitle !== null
        ? targetPage.metaTitle
        : { en: String(targetPage.metaTitle || '') };
      const cleanMetaDesc = typeof targetPage.metaDescription === 'object' && targetPage.metaDescription !== null
        ? targetPage.metaDescription
        : { en: String(targetPage.metaDescription || '') };

      const contentBlocks = Array.isArray(targetPage.content) && targetPage.content.length > 0
        ? targetPage.content
        : (Array.isArray(targetPage.blocks) ? targetPage.blocks : []);

      const payload = {
        ...targetPage,
        slug: cleanSlug,
        title: cleanTitle,
        metaTitle: cleanMetaTitle,
        metaDescription: cleanMetaDesc,
        content: contentBlocks,
        blocks: contentBlocks,
        isPublished: targetPage.isPublished ?? true,
        status: targetPage.status || 'published',
      };

      const pageId = targetPage._id || targetPage.slug || slug;
      const response = await fetch(`/api/cms/pages/${encodeURIComponent(pageId)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Failed to update page');
      }

      return await response.json();
    } catch (error: unknown) {
      return rejectWithValue(errorMessage(error, 'Failed to update page'));
    }
  }
);
