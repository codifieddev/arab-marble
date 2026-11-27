'use client';

import React from 'react';
import Link from 'next/link';
import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';
import { motion, useReducedMotion } from 'motion/react';
import { GoldDivider, Reveal, Magnetic } from '@/components/motion';

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
  const rawSubheading = t(props.subheading, locale) || '';
  const subheadingText =
    block.id === 'hero-home' &&
    (!rawSubheading ||
      rawSubheading === 'Premium Natural Stones & Marble in Abu Dhabi since 1973')
      ? locale === 'ar'
        ? 'تجربة رخام فريدة'
        : 'A Unique Marble Experience'
      : rawSubheading;
  const HERO_IMAGE = 'https://arabmarble.ae/wp-content/uploads/2023/06/Colored_ArabMarble_-1-2-1-3.png';
  const rawBgImage = props.backgroundImage || props.image || '';
  const bgImage =
    block.id === 'hero-home' &&
    (!rawBgImage ||
      rawBgImage.includes('Slabs-1.jpg') ||
      rawBgImage === '/images/home-hero.jpg')
      ? HERO_IMAGE
      : rawBgImage || HERO_IMAGE;
 

  const ctaLabel = t(props.cta?.label || props.ctaLabel, locale);
  const rawHref = props.cta?.href || props.ctaHref || '/shop';
  const ctaHref = rawHref.startsWith('/') ? `${localePrefix}${rawHref}` : rawHref;

  const lines = headingText.split(/\r?\n|\\n/);
  const isCenter = props.align === 'center';
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      className={`relative w-full min-h-[540px] md:min-h-[660px] lg:min-h-[760px] flex items-center ${
        isCenter ? 'justify-center text-center' : 'justify-start text-left'
      } overflow-hidden bg-neutral-950 select-none`}
    >
      {/* Static full-bleed background image (no parallax/scale animation) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgImage})`,
        }}
      />

      {/* High-contrast gradient & dark overlay to ensure 100% text visibility */}
      <div
        className={`absolute inset-0 ${
          isCenter
            ? 'bg-black/65 backdrop-brightness-90'
            : 'bg-gradient-to-r from-black/45 via-black/25 to-black/10 backdrop-brightness-95'
        }`}
      />
      {/* <div className="absolute inset-0 bg-black/20" /> */}

      {/* Content Container with fast foreground depth */}
      <div className="relative z-10 w-full max-w-[1240px] mx-auto px-6 md:px-12 py-20">
        <div className={`max-w-[750px] ${isCenter ? 'mx-auto text-center' : 'text-left'}`}>
          {onSave && isEditable ? (
            <div className="mb-4">
              <EditableText
                value={headingText}
                onSave={(val) => onSave(block.id, 'props.heading', val)}
                isEditable={isEditable}
                tag="h1"
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold !text-white tracking-[0.06em] leading-[185%] whitespace-pre-line"
                placeholder="Hero Heading..."
              />
            </div>
          ) : (
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold !text-white tracking-[0.06em] mb-6 "
              style={{
                color: '#ffffff',
                lineHeight: '145%',
              }}
            >
              {lines.map((line, idx) => (
                <span key={idx} className="block">
                  <motion.span
                    initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: '100%' }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.9,
                      delay: 0.2 + idx * 0.16,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="block !text-white will-change-transform"
                    style={{
                      color: '#ffffff',
                      
                    }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>
          )}

          {/* Luxury Gold Hairline Accent */}
          <GoldDivider centered={isCenter} delay={0.6} className="!my-6" />

          {subheadingText &&
            (onSave && isEditable ? (
              <EditableText
                value={subheadingText}
                onSave={(val) => onSave(block.id, 'props.subheading', val)}
                isEditable={isEditable}
                tag="p"
                className="text-base sm:text-lg md:text-xl !text-neutral-100 font-light max-w-[550px] mb-8 leading-relaxed "
                placeholder="Subheading..."
              />
            ) : (
              <Reveal direction="up" delay={0.7} duration={0.9}>
                <p
                  className={`text-base sm:text-lg md:text-[30px] !text-neutral-100 font-medium max-w-[550px] mb-8 leading-relaxed  ${
                    isCenter ? 'mx-auto' : ''
                  }`}
                  style={{
                    color: '#f5f5f5',
                    
                  }}
                >
                  {subheadingText}
                </p>
              </Reveal>
            ))}

          {block.id !== 'hero-home' && ctaLabel && (
            <Reveal direction="up" delay={0.9} duration={0.9}>
              <div className={`mt-8 ${isCenter ? 'flex justify-center' : ''}`}>
                <Magnetic strength={0.35}>
                  <Link
                    href={ctaHref}
                    data-cursor="Explore"
                    className="group relative inline-flex items-center justify-center px-9 py-4 border-2 border-white text-white font-medium tracking-[0.2em] text-xs uppercase bg-black/40 hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-xs shadow-lg hover:shadow-[0_0_25px_rgba(201,169,110,0.5)] rounded-sm overflow-hidden"
                    style={{ color: '#ffffff' }}
                  >
                    <span className="relative z-10">{ctaLabel}</span>
                    <span className="absolute inset-0 bg-[#C9A96E] translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                  </Link>
                </Magnetic>
              </div>
            </Reveal>
          )}
        </div>
      </div>

      {/* Elegant Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 0.8, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 pointer-events-none"
      >
        <span className="text-[10px] tracking-[0.25em] text-neutral-300 uppercase font-light">Scroll</span>
        <div className="w-[1px] h-7 bg-white/30 relative overflow-hidden">
          <motion.div
            animate={{ y: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="w-full h-1/2 bg-[#C9A96E]"
          />
        </div>
      </motion.div>
    </section>
  );
}
