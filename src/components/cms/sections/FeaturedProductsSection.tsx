'use client';

import React from 'react';
import Link from 'next/link';

interface FeaturedProductsSectionProps {
  block?: any;
  locale?: string;
}

export default function FeaturedProductsSection({ block }: FeaturedProductsSectionProps) {
  const props = block?.props || {};
  const heading = props.heading || 'Featured Natural Stones';

  return (
    <section className="py-16 bg-neutral-50 border-t border-b border-neutral-200">
      <div className="max-w-[1240px] mx-auto px-6 text-center">
        <h2 className="text-3xl font-light text-neutral-800 tracking-wide mb-4 uppercase">
          {heading}
        </h2>
        <div className="w-16 h-0.5 bg-neutral-800 mx-auto mb-8" />
        <p className="text-neutral-600 max-w-xl mx-auto mb-8 font-light text-sm">
          Discover our premier selection of rare Italian, Spanish and Omani marble slabs.
        </p>
        <Link
          href="/shop"
          className="inline-block px-8 py-3 bg-[#383838] hover:bg-black text-white text-xs uppercase tracking-widest font-semibold transition-colors"
        >
          View Full Catalog
        </Link>
      </div>
    </section>
  );
}
