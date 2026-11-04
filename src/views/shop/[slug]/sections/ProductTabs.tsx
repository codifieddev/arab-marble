'use client';

import React from 'react';
import type { PeekeeperProduct } from '@/lib/peekeeper-shop-data';

export default function ProductTabs({
  activeTab, onTabChange, product, locale = 'en', cmsProps
}: {
  activeTab: 'description' | 'specifications' | 'shipping';
  onTabChange: (tab: 'description' | 'specifications' | 'shipping') => void;
  product: PeekeeperProduct;
  locale?: string;
  cmsProps?: any;
}) {
  const descriptionTab = product.description || product.detailsTabs?.find((tab) => tab.key === 'description')?.content || '';
  const shippingFallback = cmsProps?.tabs?.shippingContent?.[locale] || (locale === 'hi' ? 'मानक शिपिंग 3-5 कार्य दिवसों में डिलीवर होती है। अप्रयुक्त वस्तुओं के लिए मूल पैकेजिंग में खरीद के 30 दिनों के भीतर रिटर्न स्वीकार किया जाता है।' : 'Standard shipping delivers within 3-5 business days. Returns accepted within 30 days of purchase for unused items in original packaging.');
  const shippingTab = product.detailsTabs?.find((tab) => tab.key === 'shipping-returns' || tab.key === 'shipping')?.content || shippingFallback;

  const descLabel = cmsProps?.tabs?.description?.[locale] || (locale === 'hi' ? 'विवरण' : 'Description');
  const specsLabel = cmsProps?.tabs?.specifications?.[locale] || (locale === 'hi' ? 'विशिष्टताएँ' : 'Specifications');
  const shippingLabel = cmsProps?.tabs?.shipping?.[locale] || (locale === 'hi' ? 'शिपिंग और रिटर्न' : 'Shipping & Returns');
  const noDescLabel = cmsProps?.tabs?.noDescription?.[locale] || (locale === 'hi' ? 'कोई उत्पाद विवरण प्रदान नहीं किया गया।' : 'No product description provided.');

  const hasSpecs = Boolean((product.productAttributes && product.productAttributes.length > 0) || product.sku);
  const tabs: Array<{ key: 'description' | 'specifications' | 'shipping'; label: string }> = [
    { key: 'description', label: descLabel },
    ...(hasSpecs ? [{ key: 'specifications' as const, label: specsLabel }] : []),
    { key: 'shipping', label: shippingLabel },
  ];

  return (
    <section className="section-padding pt-0">
      <div className="container-custom">
        <div className="card-theme overflow-hidden text-left">
          <div className="flex flex-wrap border-b border-[var(--border)] bg-[var(--surface)]" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`px-5 py-4 text-sm sm:text-base font-bold tracking-[0.08em] uppercase border-r border-[var(--border)] transition-colors ${activeTab === tab.key ? 'bg-[var(--background)] text-[var(--primary-dark)] border-b-2 border-b-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className="p-6 md:p-8 whitespace-pre-wrap body-text">
              {descriptionTab ? (
                <p className="text-[var(--text)] leading-relaxed">{descriptionTab}</p>
              ) : (
                <p className="text-[var(--text-muted)] italic">{noDescLabel}</p>
              )}
            </div>
          )}

          {activeTab === 'specifications' && hasSpecs && (
            <div className="p-6 md:p-8">
              <div className="max-w-xl overflow-hidden rounded-xl border border-[var(--border)]">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-[var(--border)]">
                    {product.sku && (
                      <tr className="bg-[var(--surface)]">
                        <td className="px-4 py-3 font-bold text-[var(--text)] w-1/3">SKU</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{product.sku}</td>
                      </tr>
                    )}
                    {(product.productAttributes || []).map((attr, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? '' : 'bg-[var(--surface)]'}>
                        <td className="px-4 py-3 font-bold text-[var(--text)] w-1/3">{attr.name || attr.label || attr.attributeId}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{Array.isArray(attr.values) ? attr.values.join(', ') : String(attr.value || '')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="p-6 md:p-8 whitespace-pre-wrap body-text">
              <p className="text-[var(--text)] leading-relaxed">{shippingTab}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
