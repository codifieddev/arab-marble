'use client';

import React from 'react';
import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';
import { Reveal, SplitReveal } from '@/components/motion';

interface AboutStorySectionProps {
  block: PageBlock;
  locale?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

const DEFAULT_ABOUT_BG =
  'https://arabmarble.ae/wp-content/uploads/2023/06/Elephant-Marble-New-1-2.png';

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
  const rawHeading = t(props.heading, locale) || '';
  const headingText =
    locale === 'ar'
      ? (rawHeading && rawHeading !== 'Who Are We' && rawHeading !== 'Who We are' ? rawHeading : 'من نحن')
      : (rawHeading && rawHeading !== 'Who Are We' ? rawHeading : 'Who We are');

  const rawImage = props.backgroundImage || props.image || '';
  const bgImage =
    block.id === 'who-we-are' &&
    (!rawImage ||
      rawImage.includes('Aerial-View-0002.jpg') ||
      rawImage === '/images/who-we-are.jpg')
      ? DEFAULT_ABOUT_BG
      : rawImage || DEFAULT_ABOUT_BG;

  return (
    <section
      className="relative py-20 md:py-28 bg-[#f4f5f6] bg-cover bg-center bg-no-repeat bg-scroll md:bg-fixed overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      {/* Subtle readability overlay on mobile/tablet where the sculpture sits behind text */}
      <div className="absolute inset-0 bg-white/75 md:bg-transparent pointer-events-none" />

      <div className="relative z-10 max-w-[1340px] mx-auto px-6 md:px-0">
        <div className="max-w-[540px] ">
          <Reveal direction="up" duration={0.9} className="flex flex-col justify-center">
            {onSave && isEditable ? (
              <div className="mb-5">
                <EditableText
                  value={headingText}
                  onSave={(val) => onSave(block.id, 'props.heading', val)}
                  isEditable={isEditable}
                  tag="h2"
                  className="text-[26px] sm:text-[28px] md:text-[30px] font-bold text-[#545454] tracking-normal mb-8 leading-[1.2]  text-center"
                  placeholder="Section Heading..."
                />
              </div>
            ) : (
              <SplitReveal
                as="h2"
                className="text-[26px] sm:text-[28px] md:text-[40px] font-bold text-[#505050] mb-8 tracking-normal leading-[1.2] text-center"
              >
                {headingText}
              </SplitReveal>
            )}

            <div className="space-y-7 text-[#545454] font-medium text-[14px] md:text-[22px] leading-[1.85] tracking-[0.01em] text-left rtl:text-right">
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
                        className="whitespace-pre-line text-justify "
                        placeholder="Paragraph text..."
                      />
                    ) : (
                      <p className="whitespace-pre-line text-justify pt-4">{paraText}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
