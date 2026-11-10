'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { ReferenceEditButton } from '@/components/cms/reference-editor';
import { t } from '@/lib/i18n';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchProducts } from '@/lib/store/products/productsThunk';
import { getCommerceId, resolveProductImage } from '@/lib/commerce/product-normalization';
import type { ProductFormState } from '@/lib/store/products/productsSlices';
import { getEntityUrl } from '@/lib/permalink/url-helper';

type CatalogProduct = ProductFormState & {
  categorySlugs?: string[];
  category?: unknown;
  title?: unknown;
  image?: string;
  imageUrl?: string;
  thumbnail?: string;
};

interface ProductGridSectionProps {
  block: PageBlock;
  locale?: string;
  localePrefix?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export default function ProductGridSection({
  block,
  locale = 'en',
  localePrefix = '',
  isEditable = false,
  onSave,
}: ProductGridSectionProps) {
  const dispatch = useAppDispatch();
  const { allProducts: catalogProducts, hasFetched, loading } = useAppSelector((state) => state.products);

  useEffect(() => {
    if ((!hasFetched || catalogProducts.length === 0) && !loading) {
      dispatch(fetchProducts());
    }
  }, [hasFetched, catalogProducts.length, loading, dispatch]);

  const props = block.props || {};
  const heading = props.heading || 'Our Stone Products';
  const subheading = props.subheading || 'Explore our complete collection of marble, granite, and natural stones.';

  const products = (catalogProducts as CatalogProduct[]).filter((p) => {
    if (p.status === 'archived' || p.status === 'inactive') return false;
    return true;
  });

  return (
    <div className="section-padding bg-white py-12 md:py-16">
      <div className="max-w-[1240px] mx-auto px-6">
        {/* Section Header with In-line Edit & Reference Button */}
        <div className="flex flex-col items-center justify-center mb-10 text-center relative">
          <div className="flex items-center justify-center gap-3">
            {onSave && isEditable ? (
              <EditableText
                value={t(heading, locale) || 'Our Stone Products'}
                onSave={(val) => onSave(block.id, 'props.heading', val)}
                isEditable={isEditable}
                tag="h2"
                className="text-3xl md:text-4xl font-light tracking-wide text-neutral-800 uppercase"
                placeholder="Section Heading..."
              />
            ) : (
              <h2 className="text-3xl md:text-4xl font-light tracking-wide text-neutral-800 uppercase">
                {t(heading, locale) || 'Our Stone Products'}
              </h2>
            )}

            <ReferenceEditButton
              type="product"
              title="Catalog Products"
              label="Edit Catalog"
              sectionId={block.id}
            />
          </div>

          <div className="w-16 h-0.5 bg-neutral-800 mx-auto mt-3 mb-4" />

          {subheading && (
            onSave && isEditable ? (
              <EditableText
                value={t(subheading, locale) || ''}
                onSave={(val) => onSave(block.id, 'props.subheading', val)}
                isEditable={isEditable}
                tag="p"
                className="text-sm text-neutral-500 max-w-xl mx-auto"
                placeholder="Section Subheading..."
              />
            ) : (
              <p className="text-sm text-neutral-500 max-w-xl mx-auto">
                {t(subheading, locale)}
              </p>
            )
          )}
        </div>

        {loading || (!hasFetched && products.length === 0) ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col space-y-3">
                <div className="aspect-square bg-stone-100 border border-stone-200 animate-pulse" />
                <div className="h-4 w-3/4 bg-stone-200 mx-auto animate-pulse" />
                <div className="h-3 w-1/2 bg-stone-100 mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 font-light">
            No products in catalog.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => {
              const id = getCommerceId(product) || product.id || product.slug;
              const name = t(product.name || product.title, locale);
              const img = resolveProductImage(product, '/images/products/stone-1.jpg');
              const url = getEntityUrl({ type: 'product', slug: product.slug, id }, locale);

              return (
                <div key={id} className="flex flex-col group relative">
                  <div className="relative aspect-square overflow-hidden bg-neutral-100 border border-neutral-200 block">
                    <Link href={url} className="w-full h-full block">
                      <img
                        src={img}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    {/* Product Edit Button for Admin */}
                    <ReferenceEditButton
                      type="product"
                      title={`Edit Product: ${name}`}
                      data={product}
                      className="absolute right-2.5 top-2.5 z-20"
                      compact
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <Link
                      href={url}
                      className="text-xs md:text-sm font-medium tracking-wide text-neutral-800 hover:text-black transition-colors block line-clamp-1"
                    >
                      {name}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
