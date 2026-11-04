'use client';

import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';

interface SizeTableSectionProps {
  block: PageBlock;
  locale?: string;
  localePrefix?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

const sizeTagStyles: Record<string, { bg: string; color: string; border: string }> = {
  XS:  { bg: 'rgba(217,84,122,0.1)',  color: 'var(--primary)',   border: '1px solid rgba(217,84,122,0.25)' },
  SM:  { bg: 'rgba(235,160,130,0.15)', color: '#c46845',         border: '1px solid rgba(235,160,130,0.35)' },
  MED: { bg: 'rgba(217,84,122,0.12)', color: 'var(--primary)',   border: '1px solid rgba(217,84,122,0.3)' },
};

export default function SizeTableSection({ block, locale = 'en', isEditable = false, onSave }: SizeTableSectionProps) {
  const props = block.props || {};
  const rawSizes = props.sizes;
  const sizes = Array.isArray(rawSizes) ? rawSizes : (rawSizes && typeof rawSizes === 'object' && 'value' in rawSizes ? (typeof rawSizes.value === 'string' ? JSON.parse(rawSizes.value) : rawSizes.value) : []);

  return (
    <section style={{ padding: 'clamp(48px, 8vw, 80px) 0', background: 'var(--white)' }} id="size-chart">
      <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 28px' }}>

        {/* ── Section Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          {onSave && isEditable ? (
            <EditableText value={t(props.tag, locale) || 'FIND THE RIGHT FIT'} onSave={(val) => onSave(block.id, 'props.tag', val)} isEditable={isEditable} tag="div" className="sec-tag" placeholder="Tag..." />
          ) : (
            <div className="sec-tag" dangerouslySetInnerHTML={{ __html: t(props.tag, locale) || 'FIND THE RIGHT FIT' }} />
          )}
          {onSave && isEditable ? (
            <EditableText value={t(props.heading, locale) || 'Standard PeeKeeper Sizing Chart'} onSave={(val) => onSave(block.id, 'props.heading', val)} isEditable={isEditable} tag="h2" className="sec-title" placeholder="Heading..." />
          ) : (
            <h2 className="sec-title" dangerouslySetInnerHTML={{ __html: t(props.heading, locale) || 'Standard PeeKeeper Sizing Chart' }} />
          )}
          {onSave && isEditable ? (
            <EditableText value={t(props.subheading, locale) || 'Order by your dog\'s waist measurement. Length is adjustable.'} onSave={(val) => onSave(block.id, 'props.subheading', val)} isEditable={isEditable} tag="p" className="sec-sub" placeholder="Subheading..." />
          ) : (
            <p className="sec-sub" dangerouslySetInnerHTML={{ __html: t(props.subheading, locale) || 'Order by your dog\'s waist measurement. Length is adjustable.' }} />
          )}
        </div>

        {/* ── Two-column layout ── */}
        <div className="st-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 40,
          alignItems: 'start',
        }}>

          {/* Left: table + tip */}
          <div style={{ minWidth: 0 }}>
            {/* Mobile swipe helper */}
            <div className="mobile-swipe-hint">
              {onSave && isEditable ? (
                <EditableText
                  value={t(props.swipeHint, locale) || 'Swipe to view full table'}
                  onSave={(val) => onSave(block.id, 'props.swipeHint', val)}
                  isEditable={isEditable}
                  placeholder="Swipe hint..."
                />
              ) : (
                <span>{t(props.swipeHint, locale) || 'Swipe to view full table'}</span>
              )}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                minWidth: 500,
                borderCollapse: 'collapse',
                fontSize: 14,
                fontFamily: 'var(--font-body)',
              }}>
                <thead>
                  <tr>
                    <th className="mobile-sticky-col mobile-sticky-col-rose" style={{
                      background: 'var(--primary)', color: 'white',
                      padding: '14px 18px', textAlign: 'left',
                      fontFamily: 'var(--font-body)', fontSize: 11,
                      fontWeight: 800, letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      borderRadius: 'var(--radius-sm) 0 0 0',
                    }}>
                      {onSave && isEditable ? (
                        <EditableText
                          value={t(props.sizeHeader, locale) || 'Size'}
                          onSave={(val) => onSave(block.id, 'props.sizeHeader', val)}
                          isEditable={isEditable}
                          placeholder="Header..."
                        />
                      ) : (
                        t(props.sizeHeader, locale) || 'Size'
                      )}
                    </th>
                    <th style={{
                      background: 'var(--primary)', color: 'white',
                      padding: '14px 18px', textAlign: 'left',
                      fontFamily: 'var(--font-body)', fontSize: 11,
                      fontWeight: 800, letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}>
                      {onSave && isEditable ? (
                        <EditableText
                          value={t(props.waistHeader, locale) || 'Waist'}
                          onSave={(val) => onSave(block.id, 'props.waistHeader', val)}
                          isEditable={isEditable}
                          placeholder="Header..."
                        />
                      ) : (
                        t(props.waistHeader, locale) || 'Waist'
                      )}
                    </th>
                    <th style={{
                      background: 'var(--primary)', color: 'white',
                      padding: '14px 18px', textAlign: 'left',
                      fontFamily: 'var(--font-body)', fontSize: 11,
                      fontWeight: 800, letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}>
                      {onSave && isEditable ? (
                        <EditableText
                          value={t(props.lengthsHeader, locale) || 'Available Lengths'}
                          onSave={(val) => onSave(block.id, 'props.lengthsHeader', val)}
                          isEditable={isEditable}
                          placeholder="Header..."
                        />
                      ) : (
                        t(props.lengthsHeader, locale) || 'Available Lengths'
                      )}
                    </th>
                    <th style={{
                      background: 'var(--primary)', color: 'white',
                      padding: '14px 18px', textAlign: 'left',
                      fontFamily: 'var(--font-body)', fontSize: 11,
                      fontWeight: 800, letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      borderRadius: '0 var(--radius-sm) 0 0',
                    }}>
                      {onSave && isEditable ? (
                        <EditableText
                          value={t(props.weightHeader, locale) || 'Weight'}
                          onSave={(val) => onSave(block.id, 'props.weightHeader', val)}
                          isEditable={isEditable}
                          placeholder="Header..."
                        />
                      ) : (
                        t(props.weightHeader, locale) || 'Weight'
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((s: any, i: number) => {
                    const tagStyle = sizeTagStyles[s.tag] || sizeTagStyles.XS;
                    return (
                      <tr key={i}>
                        <td className="mobile-sticky-col mobile-sticky-col-white" style={{
                          padding: '14px 18px',
                          borderBottom: '1px solid var(--border)',
                          color: 'var(--text-secondary)',
                          fontWeight: 600,
                        }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 14px',
                            borderRadius: '100px',
                            background: tagStyle.bg,
                            color: tagStyle.color,
                            border: tagStyle.border,
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                          }}>
                            {onSave && isEditable ? (
                              <EditableText
                                value={t(s.name, locale) || s.tag || ''}
                                onSave={(val) => onSave(block.id, `props.sizes.${i}.name`, val)}
                                isEditable={isEditable}
                                placeholder="Size..."
                              />
                            ) : (
                              t(s.name, locale) || s.tag
                            )}
                          </span>
                        </td>
                        <td style={{
                          padding: '14px 18px',
                          borderBottom: '1px solid var(--border)',
                          color: 'var(--text-secondary)',
                          fontWeight: 600,
                        }}>
                          {onSave && isEditable ? (
                            <EditableText
                              value={t(s.waist, locale) || ''}
                              onSave={(val) => onSave(block.id, `props.sizes.${i}.waist`, val)}
                              isEditable={isEditable}
                              placeholder="Waist..."
                            />
                          ) : (
                            t(s.waist, locale)
                          )}
                        </td>
                        <td style={{
                          padding: '14px 18px',
                          borderBottom: '1px solid var(--border)',
                          color: 'var(--text-secondary)',
                          fontWeight: 600,
                        }}>
                          {onSave && isEditable ? (
                            <EditableText
                              value={t(s.lengths, locale) || ''}
                              onSave={(val) => onSave(block.id, `props.sizes.${i}.lengths`, val)}
                              isEditable={isEditable}
                              placeholder="Lengths..."
                            />
                          ) : (
                            t(s.lengths, locale)
                          )}
                        </td>
                        <td style={{
                          padding: '14px 18px',
                          borderBottom: '1px solid var(--border)',
                          color: 'var(--text-secondary)',
                          fontWeight: 600,
                        }}>
                          {onSave && isEditable ? (
                            <EditableText
                              value={t(s.weight, locale) || ''}
                              onSave={(val) => onSave(block.id, `props.sizes.${i}.weight`, val)}
                              isEditable={isEditable}
                              placeholder="Weight..."
                            />
                          ) : (
                            t(s.weight, locale)
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Lavender tip box */}
            <div style={{
              marginTop: 16,
              padding: '14px 18px',
              background: 'var(--accent-soft)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
            }}>
              <strong style={{ fontWeight: 700, color: 'var(--text)' }}>Tip:</strong>{' '}
              {onSave && isEditable ? (
                <EditableText value={t(props.tip, locale) || ''} onSave={(val) => onSave(block.id, 'props.tip', val)} isEditable={isEditable} tag="span" className="" placeholder="Tip text..." />
              ) : (
                <>{t(props.tip, locale)}</>
              )}
            </div>
          </div>

          {/* Right: image card */}
          {props.image && (
            <div className="st-image-card" style={{
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              overflow: 'hidden',
              border: '1px solid var(--border)',
            }}>
              <style>{`@media (max-width:900px){.st-image-card{display:none!important}}`}</style>
              <img
                src={props.image}
                alt="Measurement and fit guide"
                style={{
                  width: '100%',
                  height: 'clamp(180px, 40vw, 260px)',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <div style={{
                padding: 'clamp(16px, 3vw, 22px)',
                textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--text)',
                  marginBottom: 6,
                }}>
                  {onSave && isEditable ? (
                    <EditableText
                      value={t(props.cardTitle, locale) || 'Measure with flexible tape.'}
                      onSave={(val) => onSave(block.id, 'props.cardTitle', val)}
                      isEditable={isEditable}
                      placeholder="Card Title..."
                    />
                  ) : (
                    <span dangerouslySetInnerHTML={{ __html: t(props.cardTitle, locale) || 'Measure with flexible tape.' }} />
                  )}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}>
                  {onSave && isEditable ? (
                    <EditableText
                      value={t(props.cardSubtitle, locale) || 'Or use shoelace around belly & mark where it meets. Measure the shoelace.'}
                      onSave={(val) => onSave(block.id, 'props.cardSubtitle', val)}
                      isEditable={isEditable}
                      multiline={true}
                      placeholder="Card Subtitle..."
                    />
                  ) : (
                    <span dangerouslySetInnerHTML={{ __html: t(props.cardSubtitle, locale) || 'Or use shoelace around belly & mark where it meets. Measure the shoelace.' }} />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
