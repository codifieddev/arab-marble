import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PagesState, Page } from './pageType';
import type { RootState } from '@/lib/store/store';
import { loadPageData, loadAllPages } from '@/components/cms/loader';
import { fetchAllPages, fetchPageBySlug, updatePageThunk } from './pageThunk';
import { cleanCmsPage } from '@/lib/services/cmsService';

const allPagesData = Object.values(loadAllPages());

console.log('JSON Loaded - all CMS page files loaded into Redux');

const initialState: PagesState = {
  allPages: allPagesData,
  currentPages: null,
  originalPageBackup: null,
  isAllPageFetched: false,
  isError: false,
  isLoading: false,
  isSaving: false,
  isEditablePage: false,
  isEditable: false,
  hasUnsavedChanges: false,
};

console.log('Redux Updated - pages reducer initialized with', initialState.allPages.length, 'pages');

const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

const deepSetValue = (obj: any, path: string[], value: any): boolean => {
  if (path.length === 0) return false;
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    const nextKey = path[i + 1];
    if (current[key] === undefined || current[key] === null || typeof current[key] !== 'object') {
      const isNextNumeric = /^\d+$/.test(nextKey);
      const existingStr = typeof current[key] === 'string' ? current[key] : null;
      current[key] = isNextNumeric ? [] : (existingStr ? { en: existingStr } : {});
    }
    current = current[key];
    if (typeof current !== 'object') return false;
  }
  const lastKey = path[path.length - 1];
  current[lastKey] = value;
  return true;
};

const pagesSlice = createSlice({
  name: 'pages',
  initialState,
  reducers: {
    setCurrentPages: (state, action: PayloadAction<string | Page>) => {
      const slug = typeof action.payload === 'string' ? action.payload : action.payload.slug;
      const page = typeof action.payload === 'string'
        ? state.allPages.find((item) => item.slug === action.payload) ?? loadPageData(action.payload) ?? null
        : action.payload;
      state.currentPages = page ? deepClone(cleanCmsPage(page)) : null;
      if (page && !state.allPages.some((item) => item.slug === page.slug)) {
        state.allPages.push(deepClone(page));
      }
      console.log('[CMS] currentPages loaded - slug:', slug, 'content blocks:', state.currentPages?.content?.length ?? 0);
    },
    setEditMode: (state, action: PayloadAction<boolean>) => {
      const enabling = action.payload;
      state.isEditablePage = enabling;
      state.isEditable = enabling;
      if (enabling) {
        if (state.currentPages && !state.originalPageBackup) {
          state.originalPageBackup = deepClone(state.currentPages);
        }
      } else {
        state.originalPageBackup = null;
        state.hasUnsavedChanges = false;
      }
    },
    cancelEditMode: (state) => {
      if (state.originalPageBackup) {
        state.currentPages = deepClone(state.originalPageBackup);
      }
      state.originalPageBackup = null;
      state.hasUnsavedChanges = false;
      state.isEditablePage = false;
      state.isEditable = false;
    },
    saveEditModeSuccess: (state) => {
      state.originalPageBackup = null;
      state.hasUnsavedChanges = false;
      state.isEditablePage = false;
      state.isEditable = false;
    },
    updatePageField: (state, action: PayloadAction<{
      sectionId: string;
      fieldPath: string;
      value: string;
      locale?: string;
    }>) => {
      const { sectionId, fieldPath, value, locale = 'en' } = action.payload;
      if (!state.currentPages) return;
      if (!Array.isArray(state.currentPages.content)) {
        state.currentPages.content = [];
      }
      let sectionIndex = (state.currentPages.content as any[]).findIndex((s: any) => s.id === sectionId);
      if (sectionIndex === -1) {
        sectionIndex = (state.currentPages.content as any[]).findIndex((s: any) => s.type === sectionId || s.id?.startsWith(sectionId));
      }
      if (sectionIndex === -1) {
        const newBlock = { id: sectionId, type: sectionId, props: {} };
        (state.currentPages.content as any[]).push(newBlock);
        sectionIndex = (state.currentPages.content as any[]).length - 1;
      }

      const normalizedPath = fieldPath.startsWith('props.') ? fieldPath : `props.${fieldPath}`;
      const pathParts = normalizedPath.split('.');
      if (locale && pathParts[pathParts.length - 1] !== locale) {
        pathParts.push(locale);
      }

      const updatedPage = deepClone(state.currentPages);
      const sectionToUpdate = (updatedPage.content as any[])[sectionIndex];
      const success = deepSetValue(sectionToUpdate, pathParts, value);
      if (success) {
        updatedPage.blocks = updatedPage.content;
        state.currentPages = updatedPage as Page;
        state.hasUnsavedChanges = true;
        const indexInAll = state.allPages.findIndex(p => p.slug === updatedPage.slug);
        if (indexInAll !== -1) {
          const updatedAllPages = deepClone(state.allPages);
          let allPageSection = (updatedAllPages[indexInAll].content as any[])?.find(
            (s: any) => s.id === sectionId || s.type === sectionId || s.id?.startsWith(sectionId)
          );
          if (!allPageSection) {
            if (!Array.isArray(updatedAllPages[indexInAll].content)) {
              updatedAllPages[indexInAll].content = [];
            }
            allPageSection = { id: sectionId, type: sectionId, props: {} };
            updatedAllPages[indexInAll].content.push(allPageSection);
          }
          deepSetValue(allPageSection, pathParts, value);
          updatedAllPages[indexInAll].blocks = updatedAllPages[indexInAll].content;
          state.allPages = updatedAllPages;
        }
      }
    },
    refreshCurrentPage: (state) => {
      if (state.currentPages) {
        const refreshed = state.allPages.find((p) => p.slug === state.currentPages!.slug);
        if (refreshed) {
          state.currentPages = deepClone(refreshed);
        }
      }
    },
    updateSectionItem: (state, action: PayloadAction<{
      sectionId?: string;
      itemIndex: number;
      data: Record<string, any>;
    }>) => {
      if (!state.currentPages?.content) return;
      const { sectionId, itemIndex, data } = action.payload;
      let section = (state.currentPages.content as any[]).find(
        (s: any) => s.id === sectionId || s.type === sectionId || s.adminTitle === sectionId
      );
      if (!section && sectionId) {
        section = (state.currentPages.content as any[]).find((s: any) => s.id?.includes(sectionId) || s.adminTitle?.includes(sectionId));
      }
      if (section) {
        let updatedAny = false;
        const authorName = data.author || data.name;
        const quoteText = data.quote || data.text || data.content;

        const updateArrayAt = (arr: any[]) => {
          if (Array.isArray(arr) && arr[itemIndex]) {
            const item = arr[itemIndex];
            arr[itemIndex] = {
              ...item,
              ...data,
              name: authorName || item.name,
              author: authorName || item.author,
              quote: quoteText || item.quote,
              text: quoteText || item.text,
              content: quoteText || item.content,
              role: data.role !== undefined ? data.role : item.role,
              rating: data.rating !== undefined ? Number(data.rating) : item.rating,
              avatar: data.avatar !== undefined ? data.avatar : item.avatar,
              image: data.avatar !== undefined ? data.avatar : (data.image || item.image),
              verified: data.verified !== undefined ? data.verified : item.verified,
              props: {
                ...(item.props || {}),
                ...data,
                author: authorName || item.props?.author,
                quote: quoteText || item.props?.quote,
              },
            };
            updatedAny = true;
          }
        };

        if (Array.isArray(section.content)) updateArrayAt(section.content);
        if (section.props && Array.isArray(section.props.items)) updateArrayAt(section.props.items);
        if (Array.isArray((section as any).compiledTestimonials)) updateArrayAt((section as any).compiledTestimonials);
        if (section.props && Array.isArray((section as any).props.compiledTestimonials)) updateArrayAt((section as any).props.compiledTestimonials);
        if (section.props && Array.isArray((section as any).props.testimonials)) updateArrayAt((section as any).props.testimonials);
        if (Array.isArray((section as any).referenced_testimonials)) updateArrayAt((section as any).referenced_testimonials);

        if (updatedAny) {
          state.hasUnsavedChanges = true;
          state.currentPages.blocks = state.currentPages.content;
          const slug = state.currentPages.slug;
          const pageIndex = state.allPages.findIndex((p) => p.slug === slug);
          if (pageIndex !== -1) {
            state.allPages[pageIndex] = deepClone(state.currentPages);
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPageBySlug.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(fetchPageBySlug.fulfilled, (state, action) => {
      state.isLoading = false;
      const fetchedPage = cleanCmsPage(action.payload);
      state.currentPages = deepClone(fetchedPage);

      const indexInAll = state.allPages.findIndex((page) => page.slug === fetchedPage.slug);
      const updatedAllPages = deepClone(state.allPages);
      if (indexInAll === -1) {
        updatedAllPages.push(fetchedPage);
      } else {
        updatedAllPages[indexInAll] = fetchedPage;
      }
      state.allPages = updatedAllPages;
    });

    builder.addCase(fetchPageBySlug.rejected, (state, action) => {
      state.isLoading = false;
      const slug = action.meta?.arg;
      if (slug && (!state.currentPages || state.currentPages.slug !== slug)) {
        const fallback = state.allPages.find((p) => p.slug === slug) ?? loadPageData(slug);
        if (fallback) {
          state.currentPages = deepClone(cleanCmsPage(fallback));
          if (!state.allPages.some((item) => item.slug === fallback.slug)) {
            state.allPages.push(deepClone(fallback));
          }
        }
      }
    });

    builder.addCase(updatePageThunk.pending, (state) => {
      state.isSaving = true;
    });

    builder.addCase(updatePageThunk.fulfilled, (state, action) => {
      state.isSaving = false;
      state.hasUnsavedChanges = false;
      state.originalPageBackup = null;
      state.isEditablePage = false;
      state.isEditable = false;
      if (action.payload && (action.payload as any).data) {
        const saved = cleanCmsPage((action.payload as any).data);
        if (saved && saved.slug === state.currentPages?.slug) {
          state.currentPages = deepClone(saved);
          const idx = state.allPages.findIndex(p => p.slug === saved.slug);
          if (idx !== -1) {
            state.allPages[idx] = deepClone(saved);
          }
        }
      }
    });

    builder.addCase(updatePageThunk.rejected, (state) => {
      state.isSaving = false;
    });

    builder.addCase(fetchAllPages.fulfilled, (state, action) => {
      const dbPages = action.payload.map(cleanCmsPage);
      const pageMap = new Map<string, Page>();
      allPagesData.forEach((p) => pageMap.set(p.slug, p));
      dbPages.forEach((p) => pageMap.set(p.slug, p));
      state.allPages = Array.from(pageMap.values());
      state.isAllPageFetched = true;
      if (state.currentPages) {
        const refreshed = state.allPages.find((p) => p.slug === state.currentPages!.slug);
        if (refreshed) {
          state.currentPages = deepClone(refreshed);
        }
      }
      console.log('[CMS] All pages loaded from DB -', state.allPages.length, 'pages');
    });
  },
});

export const selectPageContent = (state: RootState, slug: string, locale: string): any => {
  const page = state.pages.allPages.find((p) => p.slug === slug);
  return page?.content || null;
};

export const {
  setCurrentPages,
  setEditMode,
  cancelEditMode,
  saveEditModeSuccess,
  updatePageField,
  updateSectionItem,
  refreshCurrentPage,
} = pagesSlice.actions;
export default pagesSlice.reducer;
