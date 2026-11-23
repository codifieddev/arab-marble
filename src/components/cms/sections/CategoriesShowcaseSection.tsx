'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';
import { Reveal, Magnetic } from '@/components/motion';

interface CategoryItem {
  id: string;
  slug: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  image: string;
  gridImage: string;
  localImage?: string;
  localGridImage?: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: 'marble',
    slug: 'marble',
    title: {
      en: 'Marble',
      ar: 'الرخام',
    },
    description: {
      en: 'Exclusive natural marble slabs, tiles and bespoke decorative cuts sourced from premier international quarries for luxury villas, palaces and commercial landmarks.',
      ar: 'ألواح وبلاط الرخام الطبيعي الفاخر والقطع الزخرفية المصممة حسب الطلب والمستوردة من أرقى المحاجر العالمية للفلل والقصور والمشاريع الكبرى.',
    },
    image: 'https://arabmarble.ae/wp-content/uploads/2022/08/Marble-1024x1024-580x600-1.jpeg',
    gridImage: 'https://arabmarble.ae/wp-content/uploads/2023/03/Marble-1024x1024-1.jpeg',
    localImage: '/images/categories/marble.jpg',
    localGridImage: '/images/categories/marble-square.jpg',
  },
  {
    id: 'granite',
    slug: 'granite',
    title: {
      en: 'Granite',
      ar: 'الجرانيت',
    },
    description: {
      en: 'High-density, highly durable granites engineered by nature for heavy-traffic exterior cladding, luxury flooring, and resilient kitchen countertops.',
      ar: 'جرانيت عالي الكثافة وفائق المتانة من صنع الطبيعة مخصص للواجهات الخارجية ذات الحركة العالية والأرضيات الفاخرة وأسطح المطابخ.',
    },
    image: 'https://arabmarble.ae/wp-content/uploads/2022/08/Granite-1024x1024-600x628-1.jpeg',
    gridImage: 'https://arabmarble.ae/wp-content/uploads/2023/03/Granite-1024x1024-1.jpeg',
    localImage: '/images/categories/granite.jpg',
    localGridImage: '/images/categories/granite-square.jpg',
  },
  {
    id: 'natural-stones',
    slug: 'natural-stones',
    title: {
      en: 'Natural Stone',
      ar: 'الأحجار الطبيعية',
    },
    description: {
      en: 'Authentic limestone, travertine, sandstone and onyx providing natural textures, warm earth tones, and timeless architectural beauty.',
      ar: 'الحجر الجيري والترافرتين والحجر الرملي والأونيكس الأصيل بتدرجات دافئة وملمس طبيعي يضفي لمسة معمارية خالدة.',
    },
    image: 'https://arabmarble.ae/wp-content/uploads/2022/08/Natural-Stone-1024x1024-580x600-1.jpeg',
    gridImage: 'https://arabmarble.ae/wp-content/uploads/2023/03/Natural-Stone-1024x1024-1.jpeg',
    localImage: '/images/categories/natural-stones.jpg',
    localGridImage: '/images/categories/natural-stones-square.jpg',
  },
  {
    id: 'artificial-stones',
    slug: 'artificial-stones',
    title: {
      en: 'Artificial Stone',
      ar: 'الأحجار الصناعية',
    },
    description: {
      en: 'Premium engineered quartz and porcelain surfaces designed with contemporary precision, zero porosity, and superior scratch and stain resistance.',
      ar: 'أسطح الكوارتز والبورسلين المصنعة فائقة الجودة بتصميمات عصرية خالية من المسام ومقاومة عالية للبقع والخدوش.',
    },
    image: 'https://arabmarble.ae/wp-content/uploads/2022/08/Artificial-Stone-1024x1024-580x600-1.jpeg',
    gridImage: 'https://arabmarble.ae/wp-content/uploads/2023/03/Artificial-Stone-1024x1024-1.jpeg',
    localImage: '/images/categories/artificial-stones.jpg',
    localGridImage: '/images/categories/artificial-stones-square.jpg',
  },
];

interface CategoriesShowcaseSectionProps {
  block?: PageBlock;
  locale?: string;
  localePrefix?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export default function CategoriesShowcaseSection({
  block,
  locale = 'en',
  localePrefix = '',
  isEditable = false,
  onSave,
}: CategoriesShowcaseSectionProps) {
  const props = block?.props || {};
  const isArabic = locale === 'ar';

  const showBanner = props.showBanner !== false;
  const bannerImage = props.bannerImage || '/images/title-bg-2.png';
  const pageTitle = t(props.title, locale) || (isArabic ? 'المنتجات' : 'Products');

  const categories: CategoryItem[] = Array.isArray(props.categories) && props.categories.length > 0
    ? props.categories.map((c: any) => {
        const fallback = DEFAULT_CATEGORIES.find((d) => d.slug === c.slug) || {};
        return { ...fallback, ...c };
      })
    : DEFAULT_CATEGORIES;

  return (
    <div className="w-full bg-[#fdfdfc] text-neutral-900 overflow-hidden">
      {/* 1. Hero Title Banner matching arabmarble.ae/products/ */}
      {showBanner && (
        <section
          className="relative w-full h-[240px] md:h-[300px] flex items-center justify-center bg-cover bg-center overflow-hidden"
          style={{ backgroundImage: `url(${bannerImage})` }}
        >
          {/* Subtle dark gradient overlay */}
          <div className="absolute inset-0 bg-black/45" />

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            {onSave && isEditable && block?.id ? (
              <EditableText
                value={pageTitle}
                onSave={(val) => onSave(block.id, 'props.title', val)}
                isEditable={isEditable}
                tag="h1"
                className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-[0.08em] !text-white uppercase drop-shadow-md"
                placeholder="Page Title..."
              />
            ) : (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-[0.08em] !text-white uppercase drop-shadow-md" style={{ color: '#ffffff' }}>
                {pageTitle}
              </h1>
            )}
            <div className="w-16 h-[2px] bg-[#C9A96E] mx-auto mt-4" />
          </div>
        </section>
      )}

      {/* 2. Alternating Category Showcase Rows */}
      <section className="py-14 md:py-20 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-16 md:space-y-24">
          {categories.map((cat, index) => {
            const isImageLeft = index % 2 === 0;
            const categoryHref = `${localePrefix}/category/${cat.slug}`;
            const titleText = t(cat.title, locale);
            const descText = t(cat.description, locale);
            const primaryImage = cat.localImage || cat.image || cat.gridImage;
            const fallbackImage = cat.image || cat.localImage || '/images/products-tile.jpg';

            return (
              <Reveal key={cat.id || cat.slug} direction="up" delay={0.1} duration={0.8}>
                <div
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${
                    isImageLeft ? '' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Image Column (7 cols) */}
                  <div
                    className={`w-full lg:col-span-7 ${
                      isImageLeft ? 'order-1' : 'order-1 lg:order-2'
                    }`}
                  >
                    <Link
                      href={categoryHref}
                      className="group block relative w-full h-[320px] sm:h-[400px] md:h-[460px] overflow-hidden rounded-sm shadow-md border border-neutral-200/60 bg-neutral-100"
                    >
                      <Image
                        src={primaryImage}
                        alt={titleText}
                        fill
                        unoptimized
                        sizes="(max-width: 1024px) 100vw, 58vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (fallbackImage && target.src !== fallbackImage) {
                            target.src = fallbackImage;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-500" />
                    </Link>
                  </div>

                  {/* Text Column (5 cols) */}
                  <div
                    className={`w-full lg:col-span-5 flex flex-col justify-center ${
                      isImageLeft
                        ? 'order-2 text-center lg:text-left'
                        : 'order-2 lg:order-1 text-center lg:text-right'
                    }`}
                  >
                    <div className="inline-block">
                      <span className="text-xs uppercase tracking-[0.25em] text-[#C9A96E] font-medium">
                        {isArabic ? `الفئة 0${index + 1}` : `Collection 0${index + 1}`}
                      </span>
                    </div>

                    <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight text-neutral-900" style={{ color: '#171717' }}>
                      <Link
                        href={categoryHref}
                        className="hover:text-[#C9A96E] transition-colors duration-300"
                        style={{ color: 'inherit' }}
                      >
                        {titleText}
                      </Link>
                    </h2>

                    <div
                      className={`w-14 h-[2px] bg-[#C9A96E] my-5 ${
                        isImageLeft ? 'mx-auto lg:mx-0' : 'mx-auto lg:ml-auto lg:mr-0'
                      }`}
                    />

                    <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-xl mx-auto lg:mx-0" style={{ color: '#525252' }}>
                      {descText}
                    </p>

                    <div className="mt-7">
                      <Magnetic strength={0.2}>
                        <Link
                          href={categoryHref}
                          className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-neutral-900 hover:bg-[#C9A96E] border border-neutral-900 hover:border-[#C9A96E] transition-all duration-300 rounded-xs shadow-md group/btn"
                          style={{ color: '#ffffff', backgroundColor: '#171717' }}
                        >
                          <span
                            className="font-medium tracking-[0.2em] text-xs uppercase"
                            style={{ color: '#ffffff' }}
                          >
                            {isArabic ? 'عرض المجموعة' : 'Explore Collection'}
                          </span>
                          <span
                            className={`text-xs transition-transform duration-300 group-hover/btn:translate-x-1.5 ${
                              isArabic ? 'rotate-180 group-hover/btn:-translate-x-1.5' : ''
                            }`}
                            style={{ color: '#ffffff' }}
                          >
                            &rarr;
                          </span>
                        </Link>
                      </Magnetic>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 3. Bottom 4-Column Category Grid matching reference */}
      <section className="py-16 md:py-20 bg-neutral-50 border-t border-neutral-200/80">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C9A96E] font-medium">
              {isArabic ? 'نظرة عامة على المنتجات' : 'Product Categories'}
            </span>
            <h3 className="text-2xl md:text-3xl font-serif text-neutral-900 mt-2 uppercase tracking-wide" style={{ color: '#171717' }}>
              {isArabic ? 'تصفح حسب الفئة' : 'Browse By Category'}
            </h3>
            <div className="w-12 h-[2px] bg-[#C9A96E] mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {categories.map((cat, idx) => {
              const categoryHref = `${localePrefix}/category/${cat.slug}`;
              const titleText = t(cat.title, locale);
              const gridImg = cat.localGridImage || cat.gridImage || cat.localImage || cat.image;

              return (
                <Reveal key={`card-${cat.id || cat.slug}`} direction="up" delay={0.08 * idx} duration={0.6}>
                  <Link
                    href={categoryHref}
                    className="group block bg-white border border-neutral-200/80 rounded-sm overflow-hidden shadow-xs hover:shadow-xl hover:border-[#C9A96E]/60 transition-all duration-400"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
                      <Image
                        src={gridImg}
                        alt={titleText}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/15 group-hover:bg-black/30 transition-colors duration-400" />
                    </div>

                    <div className="p-5 text-center">
                      <h4 className="text-lg font-serif text-neutral-900 group-hover:text-[#C9A96E] transition-colors duration-300 uppercase tracking-wider" style={{ color: '#171717' }}>
                        {titleText}
                      </h4>
                      <p className="mt-1 text-xs text-neutral-500 tracking-wide uppercase" style={{ color: '#737373' }}>
                        {isArabic ? 'استكشف الآن' : 'View Slabs'} &rarr;
                      </p>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
