'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { renderJinjaHtml } from '@/lib/jinjaEngine';
import { saveField } from '@/lib/editorUtils';

interface JinjaSectionProps {
  section?: {
    id: string;
    type?: string;
    adminTitle?: string;
    html?: string;
    props?: Record<string, any>;
    data?: Record<string, any>;
    [key: string]: any;
  };
  block?: any;
  lang?: string;
  locale?: string;
  className?: string;
}

export default function JinjaSectionRenderer({
  section,
  block,
  lang = 'en',
  locale,
  className = '',
}: JinjaSectionProps) {
  const targetSection = section || block || {};
  const activeLocale = locale || lang || 'en';
  const dispatch = useAppDispatch();
  const storeCurrentPages = useAppSelector((s) => s.pages?.currentPages);

  const containerRef = useRef<HTMLDivElement>(null);

  const isInsideStudio =
    typeof window !== 'undefined' &&
    (window.location.search.includes('studio_preview=true') ||
      window.parent !== window);

  // Find latest state of this block from Redux if present
  const liveBlock = useMemo(() => {
    if (!storeCurrentPages?.content || !Array.isArray(storeCurrentPages.content)) {
      return targetSection;
    }
    const found = storeCurrentPages.content.find(
      (b: any) => b?.id === targetSection.id || b?.title === targetSection.id
    );
    return found || targetSection;
  }, [storeCurrentPages, targetSection]);

  const templateHtml = liveBlock?.html || liveBlock?.templateHtml || '';
  const blockProps = liveBlock?.props || liveBlock?.data || {};

  const renderedHtml = useMemo(() => {
    if (!templateHtml) return '';
    return renderJinjaHtml(templateHtml, blockProps, {
      isStudio: isInsideStudio,
      sectionId: liveBlock.id,
      lang: activeLocale,
    });
  }, [templateHtml, blockProps, isInsideStudio, liveBlock.id, activeLocale]);

  // Intercept studio inline edits and link clicks
  useEffect(() => {
    if (!isInsideStudio || !containerRef.current) return;

    const el = containerRef.current;

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.classList.contains('studio-jinja-node')) {
        const fieldPath = target.getAttribute('data-studio-prop');
        const sectionId = target.getAttribute('data-studio-section');
        const newText = target.innerText.trim();

        if (fieldPath && sectionId) {
          // Update Redux store
          if (storeCurrentPages) {
            saveField(dispatch, storeCurrentPages, sectionId, fieldPath, newText);
          }
          // Notify Kalp Studio Overlay parent
          if (window.parent && window.parent !== window) {
            window.parent.postMessage(
              {
                type: 'STUDIO_PROP_UPDATED',
                sectionId,
                fieldPath,
                value: newText,
              },
              '*'
            );
          }
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (target) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.addEventListener('blur', handleBlur, true);
    el.addEventListener('click', handleClick, true);

    return () => {
      el.removeEventListener('blur', handleBlur, true);
      el.removeEventListener('click', handleClick, true);
    };
  }, [isInsideStudio, dispatch, storeCurrentPages]);

  if (!templateHtml) return null;

  return (
    <div
      ref={containerRef}
      id={liveBlock.id}
      data-annotate-id={liveBlock.id}
      data-studio-section={liveBlock.id}
      data-studio-type={liveBlock.type || 'jinja-component'}
      className={`jinja-section-wrapper relative ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
