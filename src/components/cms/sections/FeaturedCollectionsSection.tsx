'use client';

import type { PageBlock } from '@/lib/store/pages/pageType';
import { t } from '@/lib/i18n';
import EditableText from '@/components/shared/EditableText';

interface FeaturedCollectionsSectionProps {
  block: PageBlock;
  locale?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export default function FeaturedCollectionsSection({ block, locale = 'en', isEditable = false, onSave }: FeaturedCollectionsSectionProps) {
  const sectionTitle = block.props?.sectionTitle;
  const items = block.content || [];
  const columns = parseInt(block.props?.columns || '3', 10);

  if (!items.length) return null;

  const gridCols = columns === 2 ? 'md:grid-cols-2' : columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3';

  return (
    <div className="section-padding">
      <div className="container-custom">
        {sectionTitle && (onSave && isEditable ? (
          <EditableText
            value={t(sectionTitle, locale)}
            onSave={(val) => onSave(block.id, 'props.sectionTitle', val)}
            isEditable={isEditable}
            tag="h2"
            className="text-3xl font-bold mb-8 text-center"
            placeholder="Section Title..."
          />
        ) : (
          <h2 className="text-3xl font-bold mb-8 text-center">{t(sectionTitle, locale)}</h2>
        ))}
        <div className={`grid grid-cols-1 ${gridCols} gap-8`}>
          {items.map((item: any, idx: number) => (
            <div key={item.id} className="card-theme p-6 text-center">
              {item.props?.icon && <div className="text-3xl mb-3">{item.props.icon}</div>}
              {onSave && isEditable ? (
                <EditableText
                  value={t(item.props?.title, locale)}
                  onSave={(val) => onSave(block.id, `content.${idx}.props.title`, val)}
                  isEditable={isEditable}
                  tag="h3"
                  className="text-xl font-semibold mb-2"
                  placeholder="Title..."
                />
              ) : (
                <h3 className="text-xl font-semibold mb-2">{t(item.props?.title, locale)}</h3>
              )}
              {item.props?.description && (onSave && isEditable ? (
                <EditableText
                  value={t(item.props?.description, locale)}
                  onSave={(val) => onSave(block.id, `content.${idx}.props.description`, val)}
                  isEditable={isEditable}
                  tag="p"
                  className="text-[var(--text-secondary)]"
                  placeholder="Description..."
                />
              ) : (
                <p className="text-[var(--text-secondary)]">{t(item.props?.description, locale)}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
