'use client';

import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';

interface MeasureGuideSectionProps {
  block: PageBlock;
  locale?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

function parseIfJson(val: any): any {
  if (!val) return val;
  if (typeof val === 'object' && 'type' in val && 'value' in val) {
    val = val.value;
  }
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}

export default function MeasureGuideSection({ block, locale = 'en', isEditable = false, onSave }: MeasureGuideSectionProps) {
  const props = block.props || {};
  const steps: any[] = (() => {
    const parsed = parseIfJson(props.steps);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') return Object.values(parsed);
    return [];
  })();
  const tools: any[] = (() => {
    const parsed = parseIfJson(props.tools);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') return Object.values(parsed);
    return [];
  })();

  if (!steps.length) return null;

  return (
    <section style={{ padding: 'clamp(48px, 8vw, 80px) 0', background: 'var(--white)' }}>
      <style>{`@media (max-width:600px){.mg-step-num{width:44px!important;height:44px!important;font-size:18px!important}.mg-step-content{padding:16px 18px 16px 0!important}}`}</style>
      <div className="container-custom" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 className="sec-title whitespace-pre-wrap">
            {onSave && isEditable ? (
              <EditableText
                value={t(props.sectionTitle, locale) || 'How to Measure Your Dog'}
                onSave={(val) => onSave(block.id, 'props.sectionTitle', val)}
                isEditable={isEditable}
                placeholder="Section Title..."
              />
            ) : (
              t(props.sectionTitle, locale) || 'How to Measure Your Dog'
            )}
          </h2>
        </div>

        {tools.length > 0 && (
          <div style={{
            background: 'var(--accent-soft)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 28px',
            marginBottom: 40,
            display: 'flex',
            gap: 24,
            flexWrap: 'wrap',
          }}>
            {tools.map((tool: any, i: number) => (
              <div key={i} style={{ flex: 1, minWidth: 200 }}>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--primary)',
                  display: 'block',
                  marginBottom: 4,
                }}>
                  {onSave && isEditable ? (
                    <EditableText
                      value={t(tool.label, locale) || ''}
                      onSave={(val) => onSave(block.id, `props.tools.${i}.label`, val)}
                      isEditable={isEditable}
                      placeholder="Label..."
                    />
                  ) : (
                    t(tool.label, locale)
                  )}
                </span>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                  fontSize: 15,
                  color: 'var(--text)',
                  display: 'block',
                  marginBottom: 4,
                }}>
                  {onSave && isEditable ? (
                    <EditableText
                      value={t(tool.tool, locale) || ''}
                      onSave={(val) => onSave(block.id, `props.tools.${i}.tool`, val)}
                      isEditable={isEditable}
                      placeholder="Tool..."
                    />
                  ) : (
                    t(tool.tool, locale)
                  )}
                </span>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  display: 'block',
                }}>
                  {onSave && isEditable ? (
                    <EditableText
                      value={t(tool.note, locale) || ''}
                      onSave={(val) => onSave(block.id, `props.tools.${i}.note`, val)}
                      isEditable={isEditable}
                      placeholder="Note..."
                    />
                  ) : (
                    t(tool.note, locale)
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {steps.map((step: any, i: number) => (
            <div key={i} style={{
              display: 'flex',
              gap: 24,
              alignItems: 'flex-start',
              background: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}>
              <div className="mg-step-num" style={{
                flexShrink: 0,
                width: 60,
                height: 60,
                background: 'var(--primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-heading)',
                fontSize: 24,
                fontWeight: 700,
              }}>{i + 1}</div>
              <div className="mg-step-content" style={{ padding: '20px 24px 20px 0', flex: 1 }}>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 18,
                  color: 'var(--text)',
                  marginBottom: 8,
                }}>
                  {onSave && isEditable ? (
                    <EditableText
                      value={t(step.title, locale) || ''}
                      onSave={(val) => onSave(block.id, `props.steps.${i}.title`, val)}
                      isEditable={isEditable}
                      placeholder="Step Title..."
                    />
                  ) : (
                    t(step.title, locale)
                  )}
                </h3>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  margin: 0,
                }}>
                  {onSave && isEditable ? (
                    <EditableText
                      value={t(step.description, locale) || ''}
                      onSave={(val) => onSave(block.id, `props.steps.${i}.description`, val)}
                      isEditable={isEditable}
                      multiline={true}
                      placeholder="Step Description..."
                    />
                  ) : (
                    <p style={{ margin: 0 }}>{t(step.description, locale)}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
