'use client';

import { useState } from 'react';
import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';

interface FAQSectionProps {
  block: PageBlock;
  locale?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export default function FAQSection({ block, locale = 'en', isEditable = false, onSave }: FAQSectionProps) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'faq-size': true, // Open the first item by default
  });

  const rawItems = Array.isArray(block.content) && block.content.length > 0
    ? block.content
    : Array.isArray((block.props as any)?.items) && (block.props as any).items.length > 0
      ? (block.props as any).items
      : [];

  const items = rawItems;

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const badgeText = t(block.props?.tag || block.props?.badge, locale) || 'Help & Information';
  const sectionTitle = t(block.props?.sectionTitle || block.props?.heading || (block.props as any)?.title, locale);
  const sectionSubtitle = t((block.props as any)?.subtitle || (block.props as any)?.description, locale);

  if (!items.length && !sectionTitle) return null;

  return (
    <div className="section-padding py-16 md:py-24 bg-[var(--background)]">
      <div className="container-custom">
        {sectionTitle && (
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-block mb-3">
              <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--primary)] bg-[var(--accent-soft)] px-4 py-2 rounded-full inline-block">
                <EditableText
                  className="inline-block"
                  value={badgeText}
                  onSave={(val) => onSave?.(block.id, 'props.tag', val)}
                  isEditable={Boolean(onSave && isEditable)}
                  placeholder="Badge..."
                />
              </span>
            </div>
            {onSave && isEditable ? (
              <EditableText
                value={sectionTitle}
                onSave={(val) => onSave(block.id, 'props.sectionTitle', val)}
                isEditable={isEditable}
                tag="h2"
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--text)] tracking-tight"
                placeholder="Section Title..."
              />
            ) : (
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--text)] tracking-tight">
                {sectionTitle}
              </h2>
            )}
            <div className="w-16 h-1 bg-[var(--accent)] mx-auto mt-4 rounded-full" />
            {sectionSubtitle && (
              <p className="text-sm md:text-base text-[var(--text-muted)] mt-3 max-w-xl mx-auto">
                {sectionSubtitle}
              </p>
            )}
          </div>
        )}

        <div style={{ maxWidth: 820, margin: '0 auto' }} className="space-y-4">
          {items.map((item: any, idx: number) => {
            const itemId = item.id || `faq-item-${idx}`;
            const isOpen = Boolean(openItems[itemId]);
            const q = t(item.props?.question, locale) || t(item.question, locale);
            const a = t(item.props?.answer, locale) || t(item.answer, locale);

            return (
              <div
                key={itemId}
                className="border border-[var(--border)] rounded-[var(--radius-xl)] bg-[var(--white)] overflow-hidden shadow-sm hover:border-[var(--border-hover)] transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(itemId)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left font-bold text-base md:text-lg text-[var(--text)] hover:bg-[var(--surface)]/50 transition-colors cursor-pointer gap-4"
                  aria-expanded={isOpen}
                >
                  {onSave && isEditable ? (
                    <EditableText
                      value={q}
                      onSave={(val) => onSave(block.id, `content.${idx}.props.question`, val)}
                      isEditable={isEditable}
                      tag="span"
                      className="flex-1 pr-2"
                      placeholder="Question..."
                    />
                  ) : (
                    <span className="flex-1 pr-2">{q}</span>
                  )}
                  <span className={`w-8 h-8 rounded-full bg-[var(--surface)] flex items-center justify-center shrink-0 text-[var(--primary)] transition-transform duration-200 ${isOpen ? 'rotate-180 bg-[var(--primary)] text-white' : ''}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-6 md:px-6 md:pb-6 pt-0 animate-in fade-in duration-200 border-t border-[var(--border)]/60 mt-1">
                    {onSave && isEditable ? (
                      <EditableText
                        value={a}
                        onSave={(val) => onSave(block.id, `content.${idx}.props.answer`, val)}
                        isEditable={isEditable}
                        tag="p"
                        className="body-text text-sm md:text-[15px] leading-relaxed text-[var(--text-muted)] pt-3"
                        placeholder="Answer..."
                        multiline
                        rows={3}
                      />
                    ) : (
                      <p className="body-text text-sm md:text-[15px] leading-relaxed text-[var(--text-muted)] pt-3">
                        {a}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
