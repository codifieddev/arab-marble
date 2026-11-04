'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';

interface SearchSectionProps {
  block: PageBlock;
  locale?: string;
  localePrefix?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export default function SearchSection({ block, locale = 'en', localePrefix = '', isEditable, onSave }: SearchSectionProps) {
  const props = block.props || {};
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const q = searchParams?.get('q');
    if (q) {
      setQuery(q);
    }
  }, [searchParams]);

  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto">
          {onSave && isEditable ? (
            <EditableText value={t(props.heading, locale) || ''} onSave={(val) => onSave(block.id, 'props.heading', val)} isEditable={isEditable} tag="h1" className="text-3xl font-bold text-center mb-8" placeholder="Heading..." />
          ) : (
            <h1 className="text-3xl font-bold text-center mb-8">{t(props.heading, locale)}</h1>
          )}

          <div className="relative mb-10">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="form-input pl-12 py-4 text-base"
              placeholder={t(props.searchPlaceholder, locale)}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          {query && (
            <div className="text-center py-16">
              <svg className="w-20 h-20 mx-auto text-[var(--border)] mb-6" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /><line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              {onSave && isEditable ? (
                <EditableText value={t(props.noResultsTitle, locale) || ''} onSave={(val) => onSave(block.id, 'props.noResultsTitle', val)} isEditable={isEditable} tag="h2" className="text-xl font-bold mb-2" placeholder="No results title..." />
              ) : (
                <h2 className="text-xl font-bold mb-2">{t(props.noResultsTitle, locale)}</h2>
              )}
              {onSave && isEditable ? (
                <EditableText value={t(props.noResultsDescription, locale) || ''} onSave={(val) => onSave(block.id, 'props.noResultsDescription', val)} isEditable={isEditable} tag="p" className="text-[var(--text-secondary)] max-w-md mx-auto mb-8" placeholder="No results description..." />
              ) : (
                <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-8">{t(props.noResultsDescription, locale)}</p>
              )}
              {onSave && isEditable ? (
                <EditableText value={t(props.noResultsCtaLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.noResultsCtaLabel', val)} isEditable={isEditable} tag="span" className="btn-primary inline-flex items-center gap-2" placeholder="CTA..." />
              ) : (
                <Link href={`${localePrefix}/shop`} className="btn-primary inline-flex items-center gap-2">
                  {t(props.noResultsCtaLabel, locale)}
                </Link>
              )}
            </div>
          )}

          {!query && (
            <div className="text-center py-16 text-[var(--text-muted)]">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              {onSave && isEditable ? (
                <EditableText value="Enter a keyword to search our products" onSave={(val) => onSave(block.id, 'props.emptyStateLabel', val)} isEditable={isEditable} tag="p" placeholder="Search prompt..." />
              ) : (
                <p>Enter a keyword to search our products</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
