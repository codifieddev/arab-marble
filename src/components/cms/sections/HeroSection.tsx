'use client';

import React from 'react';
import Link from 'next/link';
import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';

interface HeroSectionProps {
  block: PageBlock;
  locale?: string;
  localePrefix?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export default function HeroSection({
  block,
  locale = 'en',
  localePrefix = '',
  isEditable = false,
  onSave,
}: HeroSectionProps) {
  const props = block.props || {};

  const headingText = t(props.heading, locale) || 'Create.\nBuild.\nDesign.';
  const subheadingText = t(props.subheading, locale) || '';
  const bgImage = props.backgroundImage || props.image || '/images/home-hero.jpg';

  const ctaLabel = t(props.cta?.label || props.ctaLabel, locale);
  const rawHref = props.cta?.href || props.ctaHref || '/shop';
  const ctaHref = rawHref.startsWith('/') ? `${localePrefix}${rawHref}` : rawHref;

  const lines = headingText.split(/\r?\n|\\n/);
  const isCenter = props.align === 'center';

  return (
    <section
      className={`relative w-full min-h-[460px] md:min-h-[580px] lg:min-h-[640px] flex items-center ${
        isCenter ? 'justify-center text-center' : 'justify-start text-left'
      } overflow-hidden bg-neutral-950`}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-100"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* High-contrast gradient & dark overlay to ensure 100% text visibility */}
      <div
        className={`absolute inset-0 ${
          isCenter
            ? 'bg-black/65 backdrop-brightness-90'
            : 'bg-gradient-to-r from-black/85 via-black/65 to-black/40 backdrop-brightness-95'
        }`}
      />
      <div className="absolute inset-0 bg-black/20" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[1240px] mx-auto px-6 md:px-12 py-16">
        <div className={`max-w-[750px] ${isCenter ? 'mx-auto text-center' : 'text-left'}`}>
          {onSave && isEditable ? (
            <div className="mb-4">
              <EditableText
                value={headingText}
                onSave={(val) => onSave(block.id, 'props.heading', val)}
                isEditable={isEditable}
                tag="h1"
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold !text-white tracking-tight leading-[1.1] whitespace-pre-line drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
                placeholder="Hero Heading..."
              />
            </div>
          ) : (
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold !text-white tracking-tight leading-[1.1] mb-6 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
              style={{
                color: '#ffffff',
                textShadow: '0 2px 14px rgba(0,0,0,0.95), 0 4px 28px rgba(0,0,0,0.8)',
              }}
            >
              {lines.map((line, idx) => (
                <span
                  key={idx}
                  className="block !text-white"
                  style={{
                    color: '#ffffff',
                    textShadow: '0 2px 14px rgba(0,0,0,0.95), 0 4px 28px rgba(0,0,0,0.8)',
                  }}
                >
                  {line}
                </span>
              ))}
            </h1>
          )}

          {subheadingText &&
            (onSave && isEditable ? (
              <EditableText
                value={subheadingText}
                onSave={(val) => onSave(block.id, 'props.subheading', val)}
                isEditable={isEditable}
                tag="p"
                className="text-base sm:text-lg md:text-xl !text-neutral-100 font-light max-w-[550px] mb-8 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
                placeholder="Subheading..."
              />
            ) : (
              <p
                className={`text-base sm:text-lg md:text-xl !text-neutral-100 font-light max-w-[550px] mb-8 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] ${
                  isCenter ? 'mx-auto' : ''
                }`}
                style={{
                  color: '#f5f5f5',
                  textShadow: '0 1px 8px rgba(0,0,0,0.9)',
                }}
              >
                {subheadingText}
              </p>
            ))}

          {ctaLabel && (
            <div className={`mt-8 ${isCenter ? 'flex justify-center' : ''}`}>
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-white text-white font-medium tracking-widest text-sm uppercase bg-black/40 hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-xs shadow-lg"
                style={{ color: '#ffffff' }}
              >
                {ctaLabel}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
