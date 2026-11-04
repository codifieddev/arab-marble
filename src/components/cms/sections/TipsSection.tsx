'use client';

import Link from 'next/link';
import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';

interface TipsSectionProps {
  block: PageBlock;
  locale?: string;
  localePrefix?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

const tipIcons: Record<string, string> = {
  Ruler: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
  ArrowUpDown: '<path d="M12 5v14"/><path d="M9 8l3-3 3 3"/><path d="M9 16l3 3 3-3"/>',
  RefreshCw: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
};

export default function TipsSection({ block, locale = 'en', localePrefix = '', isEditable = false, onSave }: TipsSectionProps) {
  const props = block.props || {};
  const tips = Array.isArray(props.tips) ? props.tips : [];

  if (!tips.length) return null;

  return (
    <section style={{ padding: 'clamp(48px, 8vw, 80px) 0', background: 'var(--background)' }}>
      <div className="container-custom" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 className="sec-title whitespace-pre-wrap">
            {onSave && isEditable ? (
              <EditableText
                value={t(props.sectionTitle, locale) || 'Measurement Tips'}
                onSave={(val) => onSave(block.id, 'props.sectionTitle', val)}
                isEditable={isEditable}
                placeholder="Section Title..."
              />
            ) : (
              t(props.sectionTitle, locale) || 'Measurement Tips'
            )}
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {tips.map((tip: any, i: number) => (
            <div key={i} style={{
              display: 'flex',
              gap: 18,
              alignItems: 'flex-start',
              background: 'var(--white)',
              borderRadius: 'var(--radius-lg)',
              padding: '22px 26px',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{
                flexShrink: 0,
                width: 44,
                height: 44,
                background: 'var(--accent-soft)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}>
                {tip.icon && tipIcons[tip.icon] ? (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                    dangerouslySetInnerHTML={{ __html: tipIcons[tip.icon] }} />
                ) : (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                )}
              </div>
              <div style={{ flex: 1, paddingTop: 2 }}>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 15,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  margin: 0,
                }}>
                  {onSave && isEditable ? (
                    <EditableText
                      value={t(tip.text, locale) || ''}
                      onSave={(val) => onSave(block.id, `props.tips.${i}.text`, val)}
                      isEditable={isEditable}
                      multiline={true}
                      placeholder="Tip text..."
                    />
                  ) : (
                    <p style={{ margin: 0 }}>{t(tip.text, locale)}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {props.ctaText && props.ctaHref && (() => {
          const rawHref = typeof props.ctaHref === 'string' ? props.ctaHref : (typeof props.ctaHref === 'object' ? (props.ctaHref[locale] || props.ctaHref.en || props.ctaHref.value || '/') : '/');
          const fullHref = rawHref.startsWith('/') ? `${localePrefix}${rawHref}` : rawHref;
          return (
            <div style={{ textAlign: 'center', marginTop: 36 }}>
              {onSave && isEditable ? (
                <div className="btn-primary inline-flex">
                  <EditableText
                    value={t(props.ctaText, locale) || 'Shop PeeKeeper'}
                    onSave={(val) => onSave(block.id, 'props.ctaText', val)}
                    isEditable={isEditable}
                    placeholder="Button..."
                  />
                </div>
              ) : (
                <Link
                  href={fullHref}
                  className="btn-primary"
                  style={{ textDecoration: 'none' }}
                >
                  {t(props.ctaText, locale)}
                </Link>
              )}
            </div>
          );
        })()}
      </div>
    </section>
  );
}
