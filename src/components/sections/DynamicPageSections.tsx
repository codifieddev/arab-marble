'use client';

import React from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import JinjaSectionRenderer from './JinjaSectionRenderer';

interface Props {
  lang?: string;
}

const KNOWN_STATIC_TYPES = new Set([
  'hero',
  'usp',
  'trustbadges',
  'trust_badges',
  'services',
  'collections',
  'featuredproducts',
  'featured_products',
  'features',
  'shopByRoom',
  'shop_by_room',
  'featuredBanner',
  'featured_banner',
  'productSlider',
  'product_slider',
  'craft',
  'testimonials',
  'blog',
  'faq',
  'faq-accordion',
  'newsletter',
  'instagramGallery',
  'instagram_gallery',
  'logoStrip',
  'logo_strip',
  'cta',
  'form'
]);

export default function DynamicPageSections({ lang = 'en' }: Props) {
  const currentPages = useAppSelector((s) => s.pages?.currentPages);
  const content = Array.isArray(currentPages?.content) ? currentPages.content : [];

  // Filter for custom / jinja components or newly added blocks not in static list
  const customSections = content.filter((block: any) => {
    if (!block || typeof block !== 'object') return false;
    const blockType = (block.type || '').toLowerCase();
    const hasHtml = Boolean(block.html || block.templateHtml);
    return hasHtml || blockType === 'jinja-component' || blockType === 'component' || (!KNOWN_STATIC_TYPES.has(blockType) && hasHtml);
  });

  if (customSections.length === 0) return null;

  return (
    <>
      {customSections.map((sec: any) => (
        <JinjaSectionRenderer key={sec.id || sec.adminTitle} section={sec} lang={lang} />
      ))}
    </>
  );
}
