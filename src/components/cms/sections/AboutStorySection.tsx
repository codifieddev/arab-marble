'use client';

import React from 'react';
import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';

interface AboutStorySectionProps {
  block: PageBlock;
  locale?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export default function AboutStorySection({
  block,
  locale = 'en',
  isEditable = false,
  onSave,
}: AboutStorySectionProps) {
  const props = block.props || {};
  const paragraphs: string[] = props.paragraphs || [
    "Arab Marble was established in Abu Dhabi in 1973.\nEver since its inception, Arab Marble has played a pivotal role in the Abu Dhabi Market for Marble and Granite. Arab Marble engages in the wholesale and retail distribution and fixing of marble and granite for special decorative works, palaces, hotels, villas and high-rise prestigious and commercial buildings. Our supplier's network encompasses more than 350 stone processing factories worldwide.",
    'We are an exclusive distributor of Omani Beige marble in Abu Dhabi & Al Ain area.',
  ];
  const imageSrc = props.image || '/images/who-we-are.jpg';

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-[1240px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column: Who We are text */}
          <div className="flex flex-col justify-center">
            {onSave && isEditable ? (
              <EditableText
                value={t(props.heading, locale) || 'Who We are'}
                onSave={(val) => onSave(block.id, 'props.heading', val)}
                isEditable={isEditable}
                tag="h2"
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-800 mb-6 tracking-tight"
                placeholder="Section Heading..."
              />
            ) : (
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-800 mb-6 tracking-tight">
                {t(props.heading, locale) || 'Who We are'}
              </h2>
            )}

            <div className="space-y-6 text-neutral-600 font-normal text-sm md:text-base leading-relaxed">
              {paragraphs.map((para, idx) => (
                <div key={idx}>
                  {onSave && isEditable ? (
                    <EditableText
                      value={para}
                      onSave={(val) => onSave(block.id, `props.paragraphs[${idx}]`, val)}
                      isEditable={isEditable}
                      tag="p"
                      className="whitespace-pre-line"
                      placeholder="Paragraph text..."
                    />
                  ) : (
                    <p className="whitespace-pre-line">{para}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Sculpture / pedestals image */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-full max-w-[500px] overflow-hidden rounded-sm shadow-sm border border-neutral-100">
              <img
                src={imageSrc}
                alt={t(props.imageAlt, locale) || 'Arab Marble Sculptures & Stonework'}
                className="w-full h-auto object-cover max-h-[500px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
