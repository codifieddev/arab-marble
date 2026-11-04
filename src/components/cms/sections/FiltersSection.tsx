'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';

interface FiltersSectionProps {
  block: PageBlock;
  locale?: string;
  localePrefix?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export default function FiltersSection({ block, locale = 'en', localePrefix = '', isEditable = false, onSave }: FiltersSectionProps) {
  const categories = block.props?.categories || [];
  const products = block.props?.products || [];
  const sortOptions = block.props?.sortOptions || [{ value: 'popular', label: 'Most Popular' }];
  const heading = block.props?.heading;

  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const filtered = products.filter((p: any) => activeCategory === 'all' || p.category === activeCategory);

  const sorted = [...filtered].sort((a: any, b: any) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  const renderStars = (rating: number) => (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-amber-400' : 'text-[var(--border)]'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );

  if (!products.length) return null;

  return (
    <div className="section-padding bg-[var(--background)]">
      <div className="container-custom">
        {heading && (onSave && isEditable ? (
          <EditableText
            value={t(heading, locale) || ''}
            onSave={(val) => onSave(block.id, 'props.heading', val)}
            isEditable={isEditable}
            tag="h2"
            className="section-title"
            placeholder="Heading..."
          />
        ) : (
          <h2 className="section-title">{t(heading, locale)}</h2>
        ))}

        {/* Filter Bar */}
        <div className="sticky top-[var(--navbar-height)] z-20 bg-[var(--surface)]/95 backdrop-blur-sm border-b border-[var(--border)] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 -mt-8 mb-8">
          <div className="py-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveCategory(cat.slug)}
                    className={`px-4 py-2 text-xs font-medium rounded-full transition-all ${
                      activeCategory === cat.slug
                        ? 'bg-[var(--primary)] text-white shadow-sm'
                        : 'bg-[var(--background)] text-[var(--text-secondary)] hover:bg-[var(--accent-soft)]'
                    }`}
                  >
                    {onSave && isEditable ? (
                      <EditableText
                        value={t(cat.label, locale) || ''}
                        onSave={(val) => onSave(block.id, `props.categories.${i}.label`, val)}
                        isEditable={isEditable}
                        tag="span"
                        placeholder="Category..."
                      />
                    ) : (
                      t(cat.label, locale)
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)]">{sorted.length} products</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs bg-transparent border border-[var(--border)] rounded-full px-3 py-2 focus:outline-none focus:border-[var(--primary)]"
                >
                  {sortOptions.map((opt: any, i: number) => (
                    <option key={i} value={opt.value}>
                      {t(opt.label, locale)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {sorted.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-[var(--border)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            {onSave && isEditable ? (
              <EditableText
                value="No products found in this category."
                onSave={(val) => onSave(block.id, 'props.noResultsMessage', val)}
                isEditable={isEditable}
                tag="p"
                className="text-[var(--text-muted)]"
                placeholder="No results message..."
              />
            ) : (
              <p className="text-[var(--text-muted)]">No products found in this category.</p>
            )}
            <button onClick={() => setActiveCategory('all')} className="btn-ghost text-sm mt-4">
              {onSave && isEditable ? (
                <EditableText
                  value="View all products"
                  onSave={(val) => onSave(block.id, 'props.viewAllLabel', val)}
                  isEditable={isEditable}
                  tag="span"
                  placeholder="View all label..."
                />
              ) : (
                "View all products"
              )}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {sorted.map((product: any) => {
              const prodSlug = typeof product.slug === 'string' ? product.slug : (typeof product.slug === 'object' ? (product.slug[locale] || product.slug.en || product.id) : product.id);
              return (
              <Link
                key={product.id}
                href={`${localePrefix}/shop/${prodSlug}`}
                className="card-product group"
              >
                <div className="relative aspect-[4/5] bg-[var(--background)] overflow-hidden">
                  <Image
                    src={product.image}
                    alt={t(product.name, locale)}
                    fill
                    className="object-contain object-center transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  {product.hoverImage && (
                    <Image
                      src={product.hoverImage}
                      alt=""
                      fill
                      className="object-contain object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  )}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                    {product.badge && (
                      <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-[var(--primary)] rounded-full shadow-sm">{t(product.badge, locale)}</span>
                    )}
                    {product.isNew && (
                      <>
                        {onSave && isEditable ? (
                          <EditableText
                            value="New"
                            onSave={(val) => onSave(block.id, 'props.newBadgeLabel', val)}
                            isEditable={isEditable}
                            tag="span"
                            className="px-2 py-0.5 bg-[var(--primary)] text-white text-[10px] font-bold rounded-full shadow-sm"
                            placeholder="New badge..."
                          />
                        ) : (
                          <span className="px-2 py-0.5 bg-[var(--primary)] text-white text-[10px] font-bold rounded-full shadow-sm">New</span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <button
                      className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                      onClick={(e) => e.preventDefault()}
                    >
                      <svg className="w-3.5 h-3.5 text-[var(--text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                  <div className="product-card-action">
                    <button
                      className="block w-full py-2.5 bg-[var(--primary)] text-white text-xs font-semibold text-center rounded-full hover:bg-[var(--primary-hover)] transition-colors shadow-md"
                      onClick={(e) => e.preventDefault()}
                    >
                      {onSave && isEditable ? (
                        <EditableText
                          value="Quick Add"
                          onSave={(val) => onSave(block.id, 'props.quickAddLabel', val)}
                          isEditable={isEditable}
                          tag="span"
                          placeholder="Quick add..."
                        />
                      ) : (
                        "Quick Add"
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <span className="product-category capitalize">{t(product.category, locale)?.replace('-', ' ')}</span>
                  <h3 className="card-title">{t(product.name, locale)}</h3>
                  <div className="flex items-center gap-1.5 mb-2">
                    {renderStars(product.rating)}
                    <span className="text-[10px] text-[var(--text-muted)]">({product.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="price-sm">${product.price.toFixed(2)}</span>
                    {product.compareAtPrice && (
                      <span className="small-text line-through">${product.compareAtPrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
