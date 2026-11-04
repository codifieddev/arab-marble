'use client';

import React from 'react';
import Link from 'next/link';
import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';
import { ReferenceEditButton } from '@/components/cms/reference-editor';

interface TestimonialsSectionProps {
  block: PageBlock;
  locale?: string;
  localePrefix?: string;
  isEditable?: boolean;
  isReferenced?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export default function TestimonialsSection({
  block,
  locale = 'en',
  localePrefix = '',
  isEditable = false,
  isReferenced = false,
  onSave,
}: TestimonialsSectionProps) {
  const props = block?.props || {};
  const compiledTestimonials =
    (block as any).compiledTestimonials ||
    (block as any).referenced_testimonials ||
    (block as any).testimonials ||
    (props as any).compiledTestimonials ||
    [];

  const isReferencedTestimonials =
    isReferenced ||
    Boolean(
      (Array.isArray(compiledTestimonials) && compiledTestimonials.length > 0) ||
        (block as any).references?.testimonials ||
        (block as any).references?.testimonialIds ||
        (block as any).references?.testimonialId ||
        props.testimonialId ||
        props.testimonialIds
    );

  const sourceItems =
    Array.isArray(compiledTestimonials) && compiledTestimonials.length > 0
      ? compiledTestimonials
      : Array.isArray(props.items) && props.items.length > 0
      ? props.items
      : [];

  const rawItems = sourceItems.map((item: any) => {
    const id = item._id || item.id || item.testimonialId || '';
    const name = item.name || item.author || 'Verified Client';
    const role = item.role || 'Architect / Luxury Developer';
    const text = item.quote || item.text || item.content || '';
    const rating = typeof item.rating === 'number' ? item.rating : 5;
    const verified = item.verified !== false;
    const avatar = item.avatar || item.image || '';
    const initials =
      item.initials ||
      (name
        ? name
            .split(' ')
            .map((p: string) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : 'AM');

    return {
      ...item,
      id: String(id),
      _id: String(id),
      name,
      author: name,
      role,
      text,
      quote: text,
      rating,
      verified,
      avatar,
      initials,
    };
  });

  const maxDisplay = props.displayCount ? Number(props.displayCount) : 6;
  const visibleItems =
    maxDisplay > 0 && rawItems.length > maxDisplay ? rawItems.slice(0, maxDisplay) : rawItems;

  const tag = t(props.tag, locale) || 'CLIENT TESTIMONIALS';
  const heading = t(props.heading, locale) || 'WHAT OUR CLIENTS SAY';
  const subheading =
    t(props.subheading, locale) ||
    'Trusted by leading architects, interior designers, and luxury developers across the UAE since 1973.';

  const ctaTextValue = t(props.ctaText, locale);
  const showCta = props.showCta === true || String(props.showCta) === 'true';
  const rawCtaLink = props.ctaLink ? String(props.ctaLink) : '/contact';
  const ctaHref = rawCtaLink.startsWith('/') ? `${localePrefix}${rawCtaLink}` : rawCtaLink;

  if (!rawItems.length) return null;

  return (
    <section id="testimonials" className="py-20 md:py-28 bg-[#fbfbfb] border-t border-neutral-200/60 relative">
      <div className="max-w-[1240px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {onSave && isEditable ? (
            <EditableText
              value={tag}
              onSave={(val) => onSave(block.id, 'props.tag', val)}
              isEditable={isEditable}
              tag="div"
              className="text-xs uppercase tracking-[0.2em] font-bold text-neutral-500 mb-3"
              placeholder="Tag..."
            />
          ) : (
            <div className="text-xs uppercase tracking-[0.2em] font-bold text-neutral-500 mb-3">
              {tag}
            </div>
          )}

          {onSave && isEditable ? (
            <EditableText
              value={heading}
              onSave={(val) => onSave(block.id, 'props.heading', val)}
              isEditable={isEditable}
              tag="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 mb-4"
              placeholder="Heading..."
            />
          ) : (
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 mb-4">
              {heading}
            </h2>
          )}

          {onSave && isEditable ? (
            <EditableText
              value={subheading}
              onSave={(val) => onSave(block.id, 'props.subheading', val)}
              isEditable={isEditable}
              tag="p"
              className="text-sm md:text-base text-neutral-600 font-normal leading-relaxed"
              placeholder="Subheading..."
            />
          ) : (
            <p className="text-sm md:text-base text-neutral-600 font-normal leading-relaxed">
              {subheading}
            </p>
          )}

          {isEditable && (
            <div className="flex justify-center mt-6">
              <ReferenceEditButton
                type="testimonial"
                title="Reference Testimonials"
                label="Manage Testimonials"
                sectionId={block.id}
                data={rawItems[0]}
              />
            </div>
          )}
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {visibleItems.map((item: any, i: number) => (
            <div
              key={item.id || i}
              className="bg-white border border-neutral-200/90 shadow-sm hover:shadow-md transition-all duration-300 p-7 flex flex-col justify-between relative group rounded-sm"
            >
              {/* Reference Edit Button for this specific testimonial */}
              {isEditable && (
                <div className="absolute top-4 right-4 z-20">
                  <ReferenceEditButton
                    type="testimonial"
                    title={`Edit Testimonial: ${item.name}`}
                    data={{
                      id: item.id,
                      _id: item.id,
                      author: item.name,
                      name: item.name,
                      role: item.role,
                      quote: item.text,
                      text: item.text,
                      rating: item.rating,
                      avatar: item.avatar,
                    }}
                    sectionId={block.id}
                    itemIndex={i}
                    compact
                    label="Edit Testimonial"
                  />
                </div>
              )}

              {/* Quote Mark & Rating */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-4">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: item.rating || 5 }).map((_, si) => (
                      <svg key={si} width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                      </svg>
                    ))}
                  </div>

                  {item.verified && (
                    <span className="text-[10px] tracking-wider uppercase font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      Verified
                    </span>
                  )}
                </div>

                {/* Quote Text */}
                <p className="text-neutral-700 text-sm md:text-[14.5px] leading-relaxed italic font-light">
                  &ldquo;{t(item.text, locale)}&rdquo;
                </p>
              </div>

              {/* Client Info Footer */}
              <div className="pt-4 border-t border-neutral-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold tracking-wider shrink-0 overflow-hidden shadow-xs">
                  {item.avatar ? (
                    <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    item.initials
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                    {t(item.name, locale)}
                  </h4>
                  <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                    {t(item.role, locale)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Optional CTA */}
        {showCta && ctaTextValue && (
          <div className="text-center mt-12">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-900 text-xs font-semibold uppercase tracking-widest text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
            >
              <span>{ctaTextValue}</span>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
