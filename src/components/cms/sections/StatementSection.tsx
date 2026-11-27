'use client';

import React from 'react';
import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';

interface StatementSectionProps {
  block?: PageBlock;
  locale?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export default function StatementSection({
  block,
  locale = 'en',
  isEditable = false,
  onSave,
}: StatementSectionProps) {
  const props = block?.props || {};
  const statement =
    t(props.text, locale) ||
    t(props.content, locale) ||
    '';

  if (!statement) return null;

  return (
    <section className="py-16 md:py-20 bg-white text-center">
      <div className="max-w-7xl mx-auto px-6">
        {onSave && isEditable && block?.id ? (
          <div className="mb-8">
            <EditableText
              value={statement}
              onSave={(val) => onSave(block.id, 'props.text', val)}
              isEditable={isEditable}
              tag="h2"
              className="text-lg sm:text-xl md:text-2xl font-semibold text-[#505050] leading-relaxed tracking-wide"
              placeholder="Statement text..."
            />
          </div>
        ) : (
          <h2 className="text-[30px] sm:text-xl md:text-2xl font-semibold text-[#505050] tracking-wide mb-8" 
          style={{lineHeight:"40px", color:"#505050"}}>
            {statement}
          </h2>
        )}
        <div className="w-24 h-0.5 bg-neutral-400 mx-auto mt-4" />
      </div>
    </section>
  );
}

