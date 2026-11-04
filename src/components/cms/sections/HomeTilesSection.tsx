'use client';

import React from 'react';
import Link from 'next/link';
import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';

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

  const leftImage = props.leftImage || '/images/products-tile.jpg';
  const leftLabel = t(props.leftLabel, locale) || 'PRODUCTS';
  const rawLeftHref = props.leftHref || '/shop';
  const leftHref = rawLeftHref.startsWith('/') ? `${localePrefix}${rawLeftHref}` : rawLeftHref;

  const rightImage = props.rightImage || '/images/projects-tile.jpg';
  const rightLabel = t(props.rightLabel, locale) || 'PROJECTS';
  const rawRightHref = props.rightHref || '/projects/latest';
  const rightHref = rawRightHref.startsWith('/') ? `${localePrefix}${rawRightHref}` : rawRightHref;

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Tile: PRODUCTS */}
          <Link
            href={leftHref}
            className="group relative h-[360px] md:h-[440px] overflow-hidden border border-neutral-200 block shadow-sm"
          >
            <img
              src={leftImage}
              alt={leftLabel}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
              {onSave && isEditable && block?.id ? (
                <div onClick={(e) => e.stopPropagation()}>
                  <EditableText
                    value={leftLabel}
                    onSave={(val) => onSave(block.id, 'props.leftLabel', val)}
                    isEditable={isEditable}
                    tag="span"
                    className="px-8 py-3 border-2 border-white !text-white font-medium tracking-widest text-sm md:text-base uppercase bg-black/50 backdrop-blur-xs shadow-lg"
                    placeholder="Tile Label..."
                  />
                </div>
              ) : (
                <span
                  className="px-8 py-3 border-2 border-white !text-white font-medium tracking-widest text-sm md:text-base uppercase bg-black/50 backdrop-blur-xs transition-transform duration-300 group-hover:scale-105 shadow-lg"
                  style={{ color: '#ffffff' }}
                >
                  {leftLabel}
                </span>
              )}
            </div>
          </Link>

          {/* Right Tile: PROJECTS */}
          <Link
            href={rightHref}
            className="group relative h-[360px] md:h-[440px] overflow-hidden border border-neutral-200 block shadow-sm"
          >
            <img
              src={rightImage}
              alt={rightLabel}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
              {onSave && isEditable && block?.id ? (
                <div onClick={(e) => e.stopPropagation()}>
                  <EditableText
                    value={rightLabel}
                    onSave={(val) => onSave(block.id, 'props.rightLabel', val)}
                    isEditable={isEditable}
                    tag="span"
                    className="px-8 py-3 border-2 border-white !text-white font-medium tracking-widest text-sm md:text-base uppercase bg-black/50 backdrop-blur-xs shadow-lg"
                    placeholder="Tile Label..."
                  />
                </div>
              ) : (
                <span
                  className="px-8 py-3 border-2 border-white !text-white font-medium tracking-widest text-sm md:text-base uppercase bg-black/50 backdrop-blur-xs transition-transform duration-300 group-hover:scale-105 shadow-lg"
                  style={{ color: '#ffffff' }}
                >
                  {rightLabel}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
