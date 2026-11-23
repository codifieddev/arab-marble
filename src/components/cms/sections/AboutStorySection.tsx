'use client';

import React from 'react';
import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';
import { ParallaxImage, Reveal, GoldDivider, MaskImage, SplitReveal } from '@/components/motion';

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
  const paragraphs: any[] = props.paragraphs || [
    "Arab Marble was established in Abu Dhabi in 1973.\nEver since its inception, Arab Marble has played a pivotal role in the Abu Dhabi Market for Marble and Granite. Arab Marble engages in the wholesale and retail distribution and fixing of marble and granite for special decorative works, palaces, hotels, villas and high-rise prestigious and commercial buildings. Our supplier's network encompasses more than 350 stone processing factories worldwide.",
    'We are an exclusive distributor of Omani Beige marble in Abu Dhabi & Al Ain area.',
  ];
  const imageSrc = props.image || '/images/who-we-are.jpg';

  return (
    <section className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column: Who We are text */}
          <Reveal direction="up" duration={0.9} className="flex flex-col justify-center">
            {onSave && isEditable ? (
              <div className="mb-4">
                <EditableText
                  value={t(props.heading, locale) || 'Who We are'}
                  onSave={(val) => onSave(block.id, 'props.heading', val)}
                  isEditable={isEditable}
                  tag="h2"
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-800 tracking-tight"
                  placeholder="Section Heading..."
                />
              </div>
            ) : (
              <SplitReveal
                as="h2"
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-2 tracking-tight font-serif"
              >
                {t(props.heading, locale) || 'Who We are'}
              </SplitReveal>
            )}

            <GoldDivider delay={0.3} className="!mb-6 !mt-2" />

            <div className="space-y-6 text-neutral-600 font-normal text-sm md:text-base leading-relaxed">
              {paragraphs.map((para, idx) => {
                const paraText = t(para, locale) || (typeof para === 'string' ? para : '');
                return (
                  <div key={idx}>
                    {onSave && isEditable ? (
                      <EditableText
                        value={paraText}
                        onSave={(val) => onSave(block.id, `props.paragraphs[${idx}]`, val)}
                        isEditable={isEditable}
                        tag="p"
                        className="whitespace-pre-line"
                        placeholder="Paragraph text..."
                      />
                    ) : (
                      <p className="whitespace-pre-line">{paraText}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* Right Column: Sculpture / pedestals image with architectural curtain wipe */}
          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-[500px]" data-cursor="Stone">
              <MaskImage
                src={imageSrc}
                alt={t(props.imageAlt, locale) || 'Arab Marble Sculptures & Stonework'}
                aspectRatio="4/3"
                containerClassName="rounded-sm shadow-xl border border-neutral-200/80"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
