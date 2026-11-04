'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import EditableText from '@/components/shared/EditableText';
import { ReferenceEditButton } from '@/components/cms/reference-editor';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchProducts } from '@/lib/store/products/productsThunk';

interface PromotionItem {
  title: string;
  price: string;
  size?: string;
  image?: string;
  productId?: string;
  productSlug?: string;
}

interface PromotionsSectionProps {
  block?: any;
  items?: PromotionItem[];
  title?: string;
  locale?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

const DEFAULT_PROMOTIONS: PromotionItem[] = [
  {
    productId: '6ae848555cd44cc45b374c5e',
    productSlug: 'light-emperador',
    title: 'Light Emperador – Spain',
    price: 'AED 175/m2',
    size: '600x600x20mm',
    image: '/images/products/promo-light-emperador.jpg',
  },
  {
    productId: '6ae8484e5cd44cc45b374c5c',
    productSlug: 'crema-marfil',
    title: 'Crema Marfil',
    price: 'AED 100/m2',
    size: '600x600x20mm',
    image: '/images/products/promo-crema-marfil.jpg',
  },
  {
    productId: '6ae8486d5cd44cc45b374c65',
    productSlug: 'cats-eye',
    title: 'Cat’s Eye',
    price: 'AED 60/m2',
    size: '600x300x20mm',
    image: '/images/products/promo-cats-eye.jpg',
  },
  {
    productId: '6ae848715cd44cc45b374c66',
    productSlug: 'aegean-cream',
    title: 'Aegean Cream',
    price: 'AED 60/m2',
    size: '600x600x20mm',
    image: '/images/products/promo-aegean-cream.jpg',
  },
  {
    productId: '6ae848745cd44cc45b374c67',
    productSlug: 'black-opal-quartz',
    title: 'Black Opal Quartz',
    price: 'AED 60/m2',
    size: 'Slabs & Cut to size',
    image: '/images/products/promo-black-opal.jpg',
  },
  {
    productId: '6ae848605cd44cc45b374c61',
    productSlug: 'calacatta-oro',
    title: 'Calacatta Oro',
    price: 'AED 150-250/m2',
    size: 'Slabs & Custom Tiles',
    image: '/images/products/promo-calacatta-oro.jpg',
  },
];

export default function PromotionsSection({
  block,
  items: itemsProp,
  locale = 'en',
  isEditable = false,
  onSave,
}: PromotionsSectionProps) {
  const dispatch = useAppDispatch();
  const allProducts = useAppSelector((state) => (state.products as any)?.allProducts || []);

  useEffect(() => {
    if (!allProducts || allProducts.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, allProducts?.length]);

  const props = block?.props || {};
  const items: PromotionItem[] = props.items || itemsProp || DEFAULT_PROMOTIONS;
  const blockId = block?.id || 'promotions-grid';

  return (
    <section className="py-12 bg-white relative">
      <div className="max-w-[1240px] mx-auto px-6">
        {/* Top Reference Edit Bar for Section */}
        {isEditable && (
          <div className="flex justify-end mb-6">
            <ReferenceEditButton
              type="product"
              title="Manage Promotions Catalog"
              label="Manage Promotions"
              data={allProducts?.[0] || undefined}
              sectionId={blockId}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {items.map((item, idx) => {
            const itemProductId = item.productId ? String(item.productId) : undefined;
            const itemProductSlug = item.productSlug;

            const matchedProduct = allProducts.find((p: any) => {
              const pId = String(p._id || p.id || '');
              if (itemProductId && pId === itemProductId) return true;
              if (itemProductSlug && p.slug === itemProductSlug) return true;
              if (
                item.title &&
                p.name &&
                (item.title.toLowerCase().includes(p.name.toLowerCase()) ||
                  p.name.toLowerCase().includes(item.title.toLowerCase()))
              ) {
                return true;
              }
              return false;
            });

            const productDataForEditor = matchedProduct || {
              id: item.productId,
              _id: item.productId,
              slug: item.productSlug,
              name: item.title,
              title: item.title,
              price: item.price,
              image: item.image,
              sizes: item.size ? [item.size] : [],
            };

            const displayImage =
              item.image ||
              matchedProduct?.gallery?.[0]?.url ||
              matchedProduct?.image ||
              '/images/products/stone-1.jpg';

            return (
              <div
                key={idx}
                className="relative aspect-square overflow-hidden bg-neutral-100 group border border-gray-100 shadow-sm"
              >
                {/* Stone Image */}
                <img
                  src={displayImage}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = '/images/products/stone-1.jpg';
                  }}
                />

                {/* Per-Card Real Product Reference Edit Button */}
                {isEditable && (
                  <div className="absolute top-4 right-4 z-20">
                    <ReferenceEditButton
                      type="product"
                      title={`Edit ${matchedProduct?.name || item.title}`}
                      data={productDataForEditor}
                      sectionId={blockId}
                      itemIndex={idx}
                      label="Edit Product"
                      compact
                    />
                  </div>
                )}

                {/* Semi-transparent Overlay Card */}
                <div
                  className="absolute left-6 bottom-6 right-6 p-6 backdrop-blur-sm z-10"
                  style={{ backgroundColor: 'rgba(235, 235, 235, 0.92)' }}
                >
                  {/* Title */}
                  <EditableText
                    value={item.title}
                    onSave={(val) => onSave?.(blockId, `props.items.${idx}.title`, val)}
                    isEditable={isEditable}
                    tag="h3"
                    className="text-xl md:text-2xl font-light tracking-wide text-neutral-800 mb-2 border-b border-neutral-300 pb-2"
                    placeholder="Promotion Title..."
                  />

                  {/* Price */}
                  <EditableText
                    value={item.price}
                    onSave={(val) => onSave?.(blockId, `props.items.${idx}.price`, val)}
                    isEditable={isEditable}
                    tag="div"
                    className="text-sm font-semibold tracking-wider text-neutral-900 uppercase"
                    placeholder="Price (e.g. AED 175/m2)..."
                  />

                  {/* Size */}
                  <EditableText
                    value={item.size || ''}
                    onSave={(val) => onSave?.(blockId, `props.items.${idx}.size`, val)}
                    isEditable={isEditable}
                    tag="div"
                    className="text-xs text-neutral-600 mt-1 font-mono"
                    placeholder="Size (e.g. 600x600x20mm)..."
                  />

                  <div className="mt-4">
                    <Link
                      href={`/contact?subject=${encodeURIComponent(
                        `Promotion Enquiry: ${item.title || matchedProduct?.name || ''}`
                      )}`}
                      className="inline-block text-xs uppercase tracking-widest font-semibold text-neutral-900 hover:text-black underline underline-offset-4"
                    >
                      Enquire Now →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
