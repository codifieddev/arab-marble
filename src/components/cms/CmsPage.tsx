'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { setCurrentPages } from '@/lib/store/pages/pagesSlice';
import { fetchPageBySlug } from '@/lib/store/pages/pageThunk';
import { saveField } from '@/lib/store/pages/saveField';
import { SectionRenderer } from '@/components/cms/SectionRenderer/SectionRenderer';
import PageLoader from '@/components/pages/PageLoader';
import type { PageBlock } from '@/lib/store/pages/pageType';

interface CmsPageProps {
  slug: string;
  locale?: string;
  localePrefix?: string;
}

export default function CmsPage({ slug, locale = 'en', localePrefix = '' }: CmsPageProps) {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const isStudioPreview = searchParams.get('studio_preview') === 'true';

  const loadedSlugRef = useRef<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const currentPages = useAppSelector((state) => state.pages.currentPages);
  const matchedPage = useAppSelector((state) =>
    state.pages.currentPages?.slug === slug
      ? state.pages.currentPages
      : state.pages.allPages.find((p) => p.slug === slug) ?? null
  );
  const activePage = (currentPages?.slug === slug ? currentPages : matchedPage) || currentPages;
  const isEditable = useAppSelector((state) => state.pages.isEditablePage);

  const [liveSections, setLiveSections] = useState<PageBlock[] | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (loadedSlugRef.current !== slug) {
      loadedSlugRef.current = slug;
      setHasFetched(false);
      dispatch(fetchPageBySlug(slug)).finally(() => {
        setHasFetched(true);
      });
    }
  }, [dispatch, slug]);

  // Prevent link navigation inside studio preview iframe
  useEffect(() => {
    if (!isStudioPreview) return;
    const handleCaptureClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      // Allow interaction with inputs, textareas, and buttons used for editing
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') {
        return;
      }
      const anchor = target?.closest('a');
      if (anchor) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('click', handleCaptureClick, true);
    return () => document.removeEventListener('click', handleCaptureClick, true);
  }, [isStudioPreview]);

  // Two-way postMessage communication with Studio editor
  useEffect(() => {
    if (!isStudioPreview) return;

    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'STUDIO_SYNC_SECTIONS' && Array.isArray(data.sections)) {
        setLiveSections(data.sections);
      } else if (data.type === 'STUDIO_SELECT_SECTION') {
        setSelectedSectionId(data.sectionId || null);
        if (data.sectionId) {
          const el = document.getElementById(`section-${data.sectionId}`) || document.querySelector(`[data-section-id="${data.sectionId}"]`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Notify parent studio that iframe is ready
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'STUDIO_PREVIEW_READY', slug }, '*');
    }

    return () => window.removeEventListener('message', handleMessage);
  }, [isStudioPreview, slug]);

  const handleSave = useCallback(async (sectionId: string, fieldPath: string, value: string) => {
    await saveField(dispatch, activePage, sectionId, fieldPath, value, locale);
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'STUDIO_PROP_UPDATED',
        sectionId,
        fieldPath,
        value,
        locale
      }, '*');
    }
  }, [dispatch, activePage, locale]);

  const rawSections =
    (activePage?.content as PageBlock[] | undefined) ||
    (activePage?.blocks as PageBlock[] | undefined) ||
    [];
  const displaySections = (liveSections || rawSections || []) as PageBlock[];

  const isPageReady = hasFetched && (currentPages?.slug === slug || matchedPage?.slug === slug);

  if (!isPageReady && !liveSections) {
    return <PageLoader text={`Loading ${slug.replace('-', ' ')}...`} />;
  }

  return (
    <>
      {displaySections.map((section, idx) => {
        const isSelected = selectedSectionId === section.id;
        return (
          <div
            key={section.id || idx}
            id={`section-${section.id}`}
            data-section-id={section.id}
            onClick={() => {
              if (isStudioPreview && window.parent && window.parent !== window) {
                window.parent.postMessage({ type: 'STUDIO_SECTION_CLICKED', sectionId: section.id }, '*');
              }
            }}
            className={`relative transition-all duration-200 ${
              isStudioPreview
                ? isSelected
                  ? 'outline outline-3 outline-[#e11d48] outline-offset-[-3px] cursor-pointer'
                  : 'hover:outline hover:outline-2 hover:outline-[#e11d48]/50 cursor-pointer'
                : ''
            }`}
          >
            {isStudioPreview && isSelected && (
              <div className="absolute top-2 left-2 z-50 bg-[#18181b] text-white px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider shadow-lg pointer-events-none">
                #{section.type} • {section.adminTitle || 'Section'}
              </div>
            )}
            <SectionRenderer
              section={section}
              locale={locale}
              localePrefix={localePrefix}
              isEditable={isStudioPreview ? true : isEditable}
              onSave={handleSave}
            />
          </div>
        );
      })}
    </>
  );
}
