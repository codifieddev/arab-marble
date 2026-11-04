'use client';
import { useCurrency } from '@/lib/currency/useCurrency';

import React from 'react';
import Image from 'next/image';
import type { PeekeeperProduct } from '@/lib/peekeeper-shop-data';

export default function NetBagAccessory({
  product, netBagQty, onQtyChange, onAddToCart, locale = 'en', cmsProps
}: {
  product: PeekeeperProduct;
  netBagQty: number;
  onQtyChange: (qty: number) => void;
  onAddToCart: () => void;
  locale?: string;
  cmsProps?: any;
}) {
  const { formatPrice } = useCurrency();

  const badgeText = cmsProps?.accessory?.badge?.[locale] || (locale === 'hi' ? 'एक्सेसरी' : 'Accessory');
  const titleText = cmsProps?.accessory?.title?.[locale] || product.netBag.title;
  const descText = cmsProps?.accessory?.description?.[locale] || product.netBag.description;
  const priceLabel = cmsProps?.accessory?.priceLabel?.[locale] || (locale === 'hi' ? 'कीमत' : 'Price');
  const quantityLabel = cmsProps?.accessory?.quantityLabel?.[locale] || (locale === 'hi' ? 'मात्रा' : 'Quantity');
  const addBtnText = cmsProps?.accessory?.addToCart?.[locale] || (locale === 'hi' ? 'एक्सेसरी कार्ट में जोड़ें' : 'Add Accessory to Cart');

  return (
    <section className="section-padding pt-0">
      <div className="container-custom">
        <div className="card-theme overflow-hidden max-w-4xl mx-auto hover:shadow-lg transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] text-left">
            <div className="flex items-center justify-center p-8 bg-[var(--surface)] border-b md:border-b-0 md:border-r border-[var(--border)]">
              <div className="relative w-full aspect-square max-w-[240px]">
                <Image
                  src={product.netBag.image}
                  alt={titleText}
                  fill
                  className="object-contain rounded-2xl"
                  unoptimized
                />
              </div>
            </div>
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <div className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--primary)] mb-3">
                {badgeText}
              </div>
              <h2 className="text-2xl font-bold text-[var(--text)] mb-3 whitespace-pre-wrap" style={{ fontFamily: 'var(--font-heading)' }}>
                {titleText}
              </h2>
              <div className="body-text text-sm max-w-prose text-[var(--text-secondary)] mb-6 leading-relaxed whitespace-pre-wrap">
                {descText}
              </div>

              <div className="flex items-end gap-6 pt-5 border-t border-[var(--border)] flex-wrap">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-1">{priceLabel}</span>
                  <span className="text-2xl font-black text-[var(--text)] leading-none" style={{ fontFamily: 'var(--font-heading)' }}>
                    {formatPrice(product.netBag.price)}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">{quantityLabel}</span>
                  <div className="flex items-center border border-[var(--border)] rounded-full bg-[var(--white)] overflow-hidden">
                    <button
                      type="button"
                      className="w-9 h-9 flex items-center justify-center text-sm font-bold hover:bg-[var(--accent-soft)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      onClick={() => onQtyChange(Math.max(1, netBagQty - 1))}
                      aria-label="Decrease quantity"
                      disabled={netBagQty <= 1}
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-sm font-semibold" aria-live="polite">
                      {netBagQty}
                    </span>
                    <button
                      type="button"
                      className="w-9 h-9 flex items-center justify-center text-sm font-bold hover:bg-[var(--accent-soft)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      onClick={() => onQtyChange(Math.min(99, netBagQty + 1))}
                      aria-label="Increase quantity"
                      disabled={netBagQty >= 99}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-w-[200px] flex items-end">
                  <button
                    type="button"
                    className="btn-primary w-full py-3 px-4 font-extrabold text-xs whitespace-nowrap rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white border-none"
                    onClick={onAddToCart}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="flex-shrink-0">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    {addBtnText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
