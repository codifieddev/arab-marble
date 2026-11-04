'use client';

import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';

interface TextSectionProps {
  block: PageBlock;
  locale?: string;
  isEditable?: boolean;
  isReferenced?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export default function TextSection({ block, locale = 'en', isEditable = false, isReferenced = false, onSave }: TextSectionProps) {
  const heading = block.props?.heading || (block as any)?.content?.heading || (block as any)?.content?.title;
  const content = block.props?.content || (block as any)?.content?.body || (block as any)?.content?.description;
  const alignment = block.props?.alignment || 'left';

  if (!heading && !content) return null;

  return (
    <div className="section-padding">
      <div className="container-custom max-w-3xl">
        {heading && (
          <div className={`text-center mb-8`} style={{ textAlign: alignment === 'center' ? 'center' : 'left' }}>
            {onSave && isEditable ? (
              <EditableText
                value={t(heading, locale)}
                onSave={(val) => onSave(block.id, 'props.heading', val)}
                isEditable={isEditable}
                isReferenced={isReferenced}
                tag="h1"
                className="text-4xl font-bold"
                placeholder="Heading..."
              />
            ) : (
              <h1 className="text-4xl font-bold">{t(heading, locale)}</h1>
            )}
            {content && (
              <>
                {onSave && isEditable ? (
                  <EditableText
                    value={t(content, locale)}
                    onSave={(val) => onSave(block.id, 'props.content', val)}
                    isEditable={isEditable}
                    isReferenced={isReferenced}
                    tag="div"
                    className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-line mt-4"
                    placeholder="Content..."
                    multiline
                    rows={6}
                  />
                ) : (
                  <div className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-line mt-4">
                    {t(content, locale)}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
