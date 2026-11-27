'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';
import { Reveal, Magnetic } from '@/components/motion';

interface HomeTilesSectionProps {
  block?: PageBlock;
  locale?: string;
  localePrefix?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export default function HomeTilesSection({
  block,
  locale = 'en',
  localePrefix = '',
  isEditable = false,
  onSave,
}: HomeTilesSectionProps) {
  const props = block?.props || {};

  const rawLeftImage = props.leftImage || '/images/Colored_ArabMarble_-4-1-3.png';
  const leftLabel = t(props.leftLabel, locale) || 'PRODUCTS';
  const rawLeftHref = props.leftHref || '/shop';
  const leftHref = rawLeftHref.startsWith('/') ? `${localePrefix}${rawLeftHref}` : rawLeftHref;

  const rawRightImage = props.rightImage || '/images/Colored_ArabMarble_-5-1-3.png';
  const rightLabel = t(props.rightLabel, locale) || 'PROJECTS';
  const rawRightHref = props.rightHref || '/projects/latest';
  const rightHref = rawRightHref.startsWith('/') ? `${localePrefix}${rawRightHref}` : rawRightHref;

  const [leftSrc, setLeftSrc] = useState(rawLeftImage);
  const [rightSrc, setRightSrc] = useState(rawRightImage);

  useEffect(() => {
    setLeftSrc(rawLeftImage);
  }, [rawLeftImage]);

  useEffect(() => {
    setRightSrc(rawRightImage);
  }, [rawRightImage]);

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-white overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Left Tile: PRODUCTS */}
          <Reveal direction="up" delay={0.1} duration={0.8} className="w-full">
            <Link
              href={leftHref}
              data-cursor="Products"
              className="group relative aspect-[4/3] w-full overflow-hidden border border-neutral-200/80 block shadow-sm hover:shadow-2xl transition-all duration-500 rounded-sm bg-neutral-100"
            >
              <img
                src={leftSrc}
                alt={leftLabel}
                loading="lazy"
                decoding="async"
                onError={() => {
                  if (leftSrc !== '/images/products-tile.jpg') {
                    setLeftSrc('/images/products-tile.jpg');
                  }
                }}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/35 group-hover:bg-black/50 transition-colors duration-500 flex items-center justify-center z-10">
                {onSave && isEditable && block?.id ? (
                  <div onClick={(e) => e.stopPropagation()}>
                    <EditableText
                      value={leftLabel}
                      onSave={(val) => onSave(block.id, 'props.leftLabel', val)}
                      isEditable={isEditable}
                      tag="span"
                      className="px-8 py-3.5 border-2 border-white !text-white font-medium tracking-widest text-sm md:text-base uppercase bg-black/50 backdrop-blur-xs shadow-lg"
                      placeholder="Tile Label..."
                    />
                  </div>
                ) : (
                  <Magnetic strength={0.3}>
                    <span
                      className="inline-block px-9 py-3.5 border-2 border-white !text-white font-medium tracking-[0.2em] text-xs md:text-sm uppercase bg-black/50 backdrop-blur-xs transition-transform duration-500 group-hover:scale-105 shadow-xl group-hover:border-[#C9A96E]"
                      style={{ color: '#ffffff' }}
                    >
                      {leftLabel}
                    </span>
                  </Magnetic>
                )}
              </div>
            </Link>
          </Reveal>

          {/* Right Tile: PROJECTS */}
          <Reveal direction="up" delay={0.2} duration={0.8} className="w-full">
            <Link
              href={rightHref}
              data-cursor="Projects"
              className="group relative aspect-[4/3] w-full overflow-hidden border border-neutral-200/80 block shadow-sm hover:shadow-2xl transition-all duration-500 rounded-sm bg-neutral-100"
            >
              <img
                src={rightSrc}
                alt={rightLabel}
                loading="lazy"
                decoding="async"
                onError={() => {
                  if (rightSrc !== '/images/projects-tile.jpg') {
                    setRightSrc('/images/projects-tile.jpg');
                  }
                }}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/35 group-hover:bg-black/50 transition-colors duration-500 flex items-center justify-center z-10">
                {onSave && isEditable && block?.id ? (
                  <div onClick={(e) => e.stopPropagation()}>
                    <EditableText
                      value={rightLabel}
                      onSave={(val) => onSave(block.id, 'props.rightLabel', val)}
                      isEditable={isEditable}
                      tag="span"
                      className="px-8 py-3.5 border-2 border-white !text-white font-medium tracking-widest text-sm md:text-base uppercase bg-black/50 backdrop-blur-xs shadow-lg"
                      placeholder="Tile Label..."
                    />
                  </div>
                ) : (
                  <Magnetic strength={0.3}>
                    <span
                      className="inline-block px-9 py-3.5 border-2 border-white !text-white font-medium tracking-[0.2em] text-xs md:text-sm uppercase bg-black/50 backdrop-blur-xs transition-transform duration-500 group-hover:scale-105 shadow-xl group-hover:border-[#C9A96E]"
                      style={{ color: '#ffffff' }}
                    >
                      {rightLabel}
                    </span>
                  </Magnetic>
                )}
              </div>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
