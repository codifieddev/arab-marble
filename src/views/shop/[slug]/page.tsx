'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchCommerceProduct } from '@/lib/commerce/product-normalization';
import {
  mapCommerceProductToCatalog,
  type CatalogProduct,
} from '@/lib/commerce/catalog-product-adapter';
import { ReferenceEditButton } from '@/components/cms/reference-editor';

export default function ProductDetailPage({
  slug,
  locale = 'en',
}: {
  slug: string;
  locale?: string;
}) {
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const raw = await fetchCommerceProduct(slug);
        if (raw) {
          const adapted = mapCommerceProductToCatalog(raw);
          setProduct(adapted);
          setSelectedImage(adapted.primaryImage);
        } else {
          setProduct(null);
        }
      } catch (err) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [slug]);

  if (loading && !product) {
    return (
      <div className="bg-white min-h-screen">
        <div className="border-b border-stone-200 bg-stone-50/50 py-3.5">
          <div className="max-w-[1240px] mx-auto px-6">
            <div className="h-4 w-48 bg-stone-200 animate-pulse" />
          </div>
        </div>
        <div className="max-w-[1240px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-4">
              <div className="aspect-[4/3] bg-stone-100 border border-stone-200 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-linear-to-r from-transparent via-white/50 to-transparent" />
              </div>
              <div className="flex gap-3">
                <div className="w-20 h-20 bg-stone-100 border border-stone-200 animate-pulse" />
                <div className="w-20 h-20 bg-stone-100 border border-stone-200 animate-pulse" />
                <div className="w-20 h-20 bg-stone-100 border border-stone-200 animate-pulse" />
              </div>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <div className="border-b border-stone-200 pb-6 space-y-3">
                <div className="h-3 w-32 bg-stone-200 animate-pulse" />
                <div className="h-8 w-3/4 bg-stone-200 animate-pulse" />
                <div className="h-5 w-24 bg-stone-200 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-stone-100 animate-pulse" />
                <div className="h-4 w-5/6 bg-stone-100 animate-pulse" />
                <div className="h-4 w-2/3 bg-stone-100 animate-pulse" />
              </div>
              <div className="h-48 bg-stone-50 border border-stone-200 animate-pulse" />
              <div className="h-12 bg-stone-800/80 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white px-6">
        <h1 className="text-2xl font-light text-neutral-800 mb-2 uppercase tracking-wide">No Product Available</h1>
        <p className="text-xs text-neutral-500 mb-6 font-light">The requested stone product is not available in our catalog.</p>
        <Link
          href="/shop"
          className="px-6 py-2.5 bg-neutral-900 text-white text-xs uppercase tracking-wider font-semibold hover:bg-neutral-800 transition-colors"
        >
          ← Back to Products Catalog
        </Link>
      </div>
    );
  }

  const activeImage = selectedImage || product.primaryImage;

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="border-b border-neutral-200 bg-neutral-50/50 py-3.5">
        <div className="max-w-[1240px] mx-auto px-6 text-xs text-neutral-500 font-light tracking-wide flex items-center gap-2">
          <Link href="/" className="hover:text-black transition-colors">
            HOME
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-black transition-colors">
            PRODUCTS
          </Link>
          <span>/</span>
          <span className="text-neutral-800 font-normal uppercase">{product.name}</span>
        </div>
      </div>

      {/* Main Product Layout */}
      <div className="max-w-[1240px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Gallery (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Image with Lightbox Zoom */}
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="relative aspect-square md:aspect-[4/3] bg-neutral-100 border border-neutral-200 overflow-hidden cursor-zoom-in group shadow-xs"
              title="Click to expand high-resolution view"
            >
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="px-4 py-2 bg-white/90 text-neutral-900 text-xs uppercase tracking-widest font-semibold shadow-sm backdrop-blur-xs">
                  Click to Zoom
                </span>
              </div>
            </div>

            {/* Thumbnail Row */}
            {product.allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 shrink-0 border overflow-hidden cursor-pointer transition-colors ${
                      activeImage === img
                        ? 'border-neutral-900 ring-1 ring-neutral-900'
                        : 'border-neutral-200 hover:border-neutral-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Specification Sheet (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <div className="border-b border-neutral-200 pb-6 mb-6">
              <span className="text-xs uppercase font-light tracking-widest text-neutral-500 block mb-2">
                NATURAL & ENGINEERED STONE
              </span>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-3xl md:text-4xl font-light text-neutral-900 tracking-wide">
                  {product.name}
                </h1>
                <ReferenceEditButton
                  type="product"
                  data={product}
                  title={product.name}
                  label="Edit Stone"
                />
              </div>
              {product.country && (
                <div className="inline-block px-2.5 py-1 bg-neutral-100 border border-neutral-200 text-[11px] font-medium tracking-wider text-neutral-700 uppercase">
                  Origin: {product.country}
                </div>
              )}
            </div>

            {/* Overview */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                  Overview
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed font-light">
                  {product.description}
                </p>
              </div>
            )}

            {/* Specifications Table */}
            <div className="border border-neutral-200 divide-y divide-neutral-200 text-xs mb-8">
              <div className="p-3.5 bg-neutral-50/80 font-semibold uppercase tracking-wider text-neutral-700">
                Material Specifications
              </div>
              <div className="p-3.5 flex justify-between">
                <span className="text-neutral-500 font-light">Primary Color</span>
                <span className="font-medium text-neutral-800">{product.color}</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className="text-neutral-500 font-light">Country of Origin</span>
                <span className="font-medium text-neutral-800">{product.country}</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className="text-neutral-500 font-light">Surface Finish</span>
                <span className="font-medium text-neutral-800 text-right">{product.finish}</span>
              </div>
              <div className="p-3.5 flex flex-col gap-1">
                <span className="text-neutral-500 font-light">Available Formats</span>
                <span className="font-medium text-neutral-800">
                  {product.sizes.join(' • ')}
                </span>
              </div>
            </div>

            {/* Action Buttons: Enquiry & Contact */}
            <div className="space-y-3">
              <Link
                href={`/contact?subject=${encodeURIComponent(`Product Inquiry: ${product.name}`)}`}
                className="w-full py-4 bg-[#383838] hover:bg-black text-white text-center text-xs uppercase tracking-widest font-semibold transition-colors block shadow-sm"
              >
                Enquire About This Product
              </Link>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href="tel:+97125554008"
                  className="py-3 px-2 border border-neutral-300 hover:border-black text-center text-xs font-medium text-neutral-700 hover:text-black transition-colors block"
                >
                  Call +971 2 555 4008
                </a>
                <a
                  href={`mailto:am@arabmarble.ae?subject=${encodeURIComponent(`Product Inquiry: ${product.name}`)}`}
                  className="py-3 px-2 border border-neutral-300 hover:border-black text-center text-xs font-medium text-neutral-700 hover:text-black transition-colors block"
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white p-2 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
              aria-label="Close"
            >
              ✕
            </button>
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <div className="py-3 px-4 text-center text-sm font-semibold tracking-wider text-neutral-800 uppercase">
              {product.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
