'use client';

import type { PageBlock } from '@/lib/store/pages/pageType';
import { t } from '@/lib/i18n';
import EditableText from '@/components/shared/EditableText';
import { Reveal, GoldDivider, CountUp, SplitReveal } from '@/components/motion';

interface MetricsSectionProps {
  block: PageBlock;
  locale?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export default function MetricsSection({ block, locale = 'en', isEditable = false, onSave }: MetricsSectionProps) {
  const title = block.props?.sectionTitle;
  const subtitle = block.props?.sectionSubtitle;
  const items = block.content || [];

  if (!items.length) return null;

  return (
    <div className="section-padding py-16 md:py-24 bg-white relative overflow-hidden">
      <div className="container-custom max-w-[1240px] mx-auto px-6">
        {(title || subtitle) && (
          <Reveal direction="up" duration={0.9} className="text-center mb-12">
            {Boolean(title) && (onSave && isEditable ? (
              <EditableText
                value={t(title, locale)}
                onSave={(val) => onSave(block.id, 'props.sectionTitle', val)}
                isEditable={isEditable}
                tag="h2"
                className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-800"
                placeholder="Section Title..."
              />
            ) : (
              <SplitReveal as="h2" className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 font-serif">
                {t(title, locale)}
              </SplitReveal>
            ))}
            <GoldDivider centered delay={0.2} className="!my-4" />
            {Boolean(subtitle) && (onSave && isEditable ? (
              <EditableText
                value={t(subtitle, locale)}
                onSave={(val) => onSave(block.id, 'props.sectionSubtitle', val)}
                isEditable={isEditable}
                tag="p"
                className="text-[var(--text-secondary)] mt-2 max-w-xl mx-auto"
                placeholder="Subtitle..."
              />
            ) : (
              <p className="text-[var(--text-secondary)] mt-2 max-w-xl mx-auto">{t(subtitle, locale)}</p>
            ))}
          </Reveal>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {items.map((item: any, idx: number) => (
            <Reveal key={item.id || idx} direction="up" delay={0.15 + idx * 0.1} duration={0.9}>
              <div className="text-center p-6 rounded-sm bg-neutral-50/60 border border-neutral-100 hover:border-[#C9A96E]/40 hover:shadow-md transition-all duration-300">
                {onSave && isEditable ? (
                  <EditableText
                    value={t(item.props?.value, locale) || ''}
                    onSave={(val) => onSave(block.id, `content.${idx}.props.value`, val)}
                    isEditable={isEditable}
                    tag="div"
                    className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight font-serif"
                    placeholder="Value..."
                  />
                ) : (
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight font-serif">
                    <CountUp value={t(item.props?.value, locale)} />
                  </div>
                )}
                {onSave && isEditable ? (
                  <EditableText
                    value={t(item.props?.label, locale)}
                    onSave={(val) => onSave(block.id, `content.${idx}.props.label`, val)}
                    isEditable={isEditable}
                    tag="div"
                    className="text-xs sm:text-sm text-neutral-500 font-medium tracking-wider uppercase mt-2"
                    placeholder="Label..."
                  />
                ) : (
                  <div className="text-xs sm:text-sm text-neutral-500 font-medium tracking-wider uppercase mt-2">
                    {t(item.props?.label, locale)}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
