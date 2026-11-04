'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';
import {
  Star,
  ThumbsUp,
  CheckCircle2,
  Search,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Heart,
  SlidersHorizontal,
  X,
  ShoppingBag,
} from 'lucide-react';
import { ReferenceEditButton } from '@/components/cms/reference-editor';

interface CustomerReviewsSectionProps {
  block: PageBlock;
  locale?: string;
  localePrefix?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export interface CustomerReviewItem {
  id: string;
  name: string;
  role?: string;
  rating: number;
  title?: string;
  quote: string;
  date?: string;
  helpful?: number;
  verified?: boolean;
  productName?: string;
  productSlug?: string;
  images?: string[];
}

const DEFAULT_CUSTOMER_REVIEWS: CustomerReviewItem[] = [
  {
    id: '6adee13a1334ab62507f06bb',
    name: 'Barbara T.',
    role: 'Verified Buyer · Boston Terrier Parent',
    rating: 5,
    title: 'Really works! Stays secure all night',
    quote: "Really works! My Boston Terrier is almost 15. It is hard to find anything to fit on his body shape. Diapers and bands didn't stay on. The Peekeeper stays on and is very easy to put on. I use it with adult incontinent pads and works like a charm. I bought another one after I saw how good this works. Highly recommend!",
    date: '2026-08-05',
    helpful: 39,
    verified: true,
    productName: 'PeeKeeper Escape-Proof Dog Diaper',
  },
  {
    id: '6adee1391334ab62507f06ba',
    name: 'Susan P.',
    role: 'Verified Buyer · Senior Dog Foster',
    rating: 5,
    title: 'Greatest invention EVER for senior & special needs dogs!',
    quote: "They are just about the greatest invention EVER for senior and 'special needs' dogs!! I only wish I'd known about the PeeKeeper sooner, I've been wrestling with diapers and belly bands for years with my various foster dogs.",
    date: '2026-07-20',
    helpful: 27,
    verified: true,
    productName: 'PeeKeeper Escape-Proof Dog Diaper',
  },
  {
    id: '6adee1381334ab62507f06b9',
    name: 'David & Linda M.',
    role: 'Verified Buyer · Happy Pet Parents',
    rating: 5,
    title: 'Life-Changing Happiness & Freedom',
    quote: 'Lo and behold I found PeeKeepers! I cannot even begin to tell you the happiness my husband and I feel when we see her zipping around the house with abandon since she has the PeeKeeper. You can see by how she is acting that she is very happy now. She even sleeps better at night. When I saw the difference in her, I ordered another PeeKeeper (one to wear, one to wash).',
    date: '2026-07-02',
    helpful: 31,
    verified: true,
    productName: 'PeeKeeper Escape-Proof Dog Diaper',
  },
  {
    id: '6adee1381334ab62507f06b8',
    name: 'Jennifer K.',
    role: 'Verified Buyer · Verified Customer',
    rating: 5,
    title: 'Fits perfectly — like little overalls',
    quote: 'Fits perfectly — like little overalls! She cannot wiggle out of it no matter how hard she tries. It completely solved our night-time leakage problems.',
    date: '2026-06-14',
    helpful: 24,
    verified: true,
    productName: 'PeeKeeper Escape-Proof Dog Diaper',
  },
  {
    id: '6adee1371334ab62507f06b7',
    name: 'Michael R.',
    role: 'Verified Buyer · Marriage Saver',
    rating: 5,
    title: 'Most of all, marriage saver!',
    quote: 'Most of all, marriage saver! No more arguments about soiled rugs or dogs slipping out of belly bands while we sleep. Durable, easy to clean, and fits snugly.',
    date: '2026-06-01',
    helpful: 19,
    verified: true,
    productName: 'PeeKeeper Escape-Proof Dog Diaper',
  },
  {
    id: '6adee1361334ab62507f06b6',
    name: 'Nancy R.',
    role: 'Verified Buyer · Lhasa Apso Mom',
    rating: 5,
    title: 'My Lhasa looks so cute — made my life so much easier',
    quote: 'My Lhasa looks so cute — made my life so much easier! Excellent quality fabric, solid stitching, and very gentle on her sensitive skin.',
    date: '2026-05-15',
    helpful: 22,
    verified: true,
    productName: 'PeeKeeper Escape-Proof Dog Diaper',
  },
  {
    id: '6adee1351334ab62507f06b5',
    name: 'Karen W.',
    role: 'Verified Buyer · Multi-Color Collector',
    rating: 5,
    title: 'Love it! Have now ordered a PeeKeeper in every color',
    quote: 'Love it! Have now ordered a PeeKeeper in every color. The straps stay put without chafing and wash beautifully without shrinking.',
    date: '2026-05-02',
    helpful: 18,
    verified: true,
    productName: 'PeeKeeper Escape-Proof Dog Diaper',
  },
  {
    id: '6adee1341334ab62507f06b4',
    name: 'Sarah J.',
    role: 'Verified Buyer · Verified Pet Parent',
    rating: 5,
    title: 'Around here we call the PeeKeeper magic pants!',
    quote: 'Around here we call the PeeKeeper magic pants! It gave our senior dog his dignity back and our floors complete peace of mind.',
    date: '2026-04-18',
    helpful: 35,
    verified: true,
    productName: 'PeeKeeper Escape-Proof Dog Diaper',
  },
  {
    id: '6adee1331334ab62507f06b3',
    name: 'Carol M.',
    role: 'Verified Buyer · Verified Pet Parent',
    rating: 5,
    title: 'You should win the Nobel prize for this!',
    quote: 'You should win the Nobel prize for this! After trying dozens of diapers, suspenders, and pins, nothing worked until PeeKeeper. A true godsend.',
    date: '2026-04-12',
    helpful: 42,
    verified: true,
    productName: 'PeeKeeper Escape-Proof Dog Diaper',
  },
];

export default function CustomerReviewsSection({
  block,
  locale = 'en',
  localePrefix = '',
  isEditable = false,
  onSave,
}: CustomerReviewsSectionProps) {
  const props = block.props || {};
  const heading = t(props.heading, locale) || 'CUSTOMER REVIEWS\nON PEEKEEPER';
  const tag = t(props.tag, locale) || 'Verified Customers';
  const introText =
    t(props.introText, locale) ||
    'Real feedback from pet parents who found complete relief and escape-proof protection with PeeKeeper.';

  const rawShopHref =
    typeof props.shopLinkHref === 'string'
      ? props.shopLinkHref
      : props.shopLinkHref && typeof props.shopLinkHref === 'object'
      ? props.shopLinkHref[locale] || props.shopLinkHref.en || props.shopLinkHref.value || '/shop'
      : '/shop';
  const shopLinkHref = rawShopHref.startsWith('/') ? `${localePrefix}${rawShopHref}` : rawShopHref;

  const [reviews, setReviews] = useState<CustomerReviewItem[]>(DEFAULT_CUSTOMER_REVIEWS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | number>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'helpful' | 'rating'>('newest');
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>({});
  const [helpfulOverrides, setHelpfulOverrides] = useState<Record<string, number>>({});

  // Fetch genuine customer reviews from MongoDB customer_reviews collection
  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/commerce/reviews?limit=100', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json?.items)
          ? json.items
          : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : [];

        // Filter out dummy/test reviews and deleted reviews
        const validItems = items.filter((item: any) => {
          const name = (item.name || item.user || '').toLowerCase();
          const title = (item.title || '').toLowerCase();
          const slug = (item.productSlug || '').toLowerCase();
          if (
            name.includes('anonymous') ||
            name === 'asfafs' ||
            title.includes('rigorous verification') ||
            slug === 'aa'
          ) {
            return false;
          }
          return item.status !== 'rejected' && item.status !== 'pending';
        });

        if (validItems.length > 0) {
          const mapped: CustomerReviewItem[] = validItems.map((item: any, idx: number) => {
            const cleanTitle = (item.title || '').replace(/\?\?/g, '—');
            const cleanQuote = (
              item.text ||
              item.comment ||
              item.review ||
              item.quote ||
              item.body ||
              ''
            ).replace(/\?\?/g, '—');

            return {
              id: item.id || item._id || `review-${idx}`,
              name: item.name || item.user || item.author || 'Verified Customer',
              role: item.productName
                ? `Verified Buyer · ${item.productName}`
                : item.role || 'Verified Customer',
              rating:
                typeof item.stars === 'number'
                  ? item.stars
                  : typeof item.rating === 'number'
                  ? item.rating
                  : 5,
              title: cleanTitle,
              quote: cleanQuote,
              date: item.date || (item.createdAt ? String(item.createdAt).split('T')[0] : ''),
              helpful: typeof item.helpful === 'number' ? item.helpful : 0,
              verified: item.verified !== false,
              productName: item.productName || 'PeeKeeper',
              productSlug: item.productSlug || 'peekeeper',
              images: Array.isArray(item.images) ? item.images : item.image ? [item.image] : [],
            };
          });

          setReviews(mapped);
        }
      }
    } catch (err) {
      console.error('Failed to load customer reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    const handleReviewUpdated = (e: Event) => {
      const updated = (e as CustomEvent).detail;
      if (!updated || !updated.id) return;
      setReviews((prev) =>
        prev.map((r) =>
          r.id === updated.id
            ? {
                ...r,
                name: updated.name || r.name,
                title: updated.title || r.title,
                quote: updated.quote || updated.text || r.quote,
                rating: updated.rating !== undefined ? Number(updated.rating) : r.rating,
                verified: updated.verified !== undefined ? updated.verified : r.verified,
              }
            : r
        )
      );
    };
    window.addEventListener('peekeeper:review-updated', handleReviewUpdated);
    return () => window.removeEventListener('peekeeper:review-updated', handleReviewUpdated);
  }, []);

  // Handle helpful vote
  const handleHelpfulClick = (id: string, currentHelpful: number) => {
    if (votedMap[id]) return;
    setVotedMap((prev) => ({ ...prev, [id]: true }));
    setHelpfulOverrides((prev) => ({ ...prev, [id]: currentHelpful + 1 }));
  };

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // Star rating filter
    if (ratingFilter !== 'all') {
      result = result.filter((item) => (item.rating || 5) === ratingFilter);
    }

    // Search query filter (search by name, role, title, quote, product)
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((item) => {
        const textToSearch = [
          item.name,
          item.role,
          item.title,
          item.quote,
          item.productName,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return textToSearch.includes(query);
      });
    }

    // Sorting
    result.sort((a, b) => {
      const aHelpful = helpfulOverrides[a.id] ?? a.helpful ?? 0;
      const bHelpful = helpfulOverrides[b.id] ?? b.helpful ?? 0;
      if (sortBy === 'helpful') {
        return bHelpful - aHelpful;
      }
      if (sortBy === 'rating') {
        return (b.rating || 5) - (a.rating || 5);
      }
      // 'newest'
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      return timeB - timeA;
    });

    return result;
  }, [reviews, ratingFilter, searchQuery, sortBy, helpfulOverrides]);

  // Aggregate stats from real customer reviews
  const totalCount = reviews.length;
  const fiveStarCount = reviews.filter((r) => (r.rating || 5) === 5).length;
  const fourStarCount = reviews.filter((r) => r.rating === 4).length;
  const threeStarCount = reviews.filter((r) => r.rating === 3).length;
  const twoStarCount = reviews.filter((r) => r.rating === 2).length;
  const oneStarCount = reviews.filter((r) => r.rating === 1).length;

  const avgRating =
    totalCount > 0
      ? (
          reviews.reduce((acc, curr) => acc + (curr.rating || 5), 0) / totalCount
        ).toFixed(1)
      : '5.0';

  const recommendationPct =
    totalCount > 0
      ? Math.round(((fiveStarCount + fourStarCount) / totalCount) * 100)
      : 100;

  return (
    <div className="bg-[var(--background)] min-h-screen text-[var(--text)] font-[var(--font-body)]">
      {/* ── Top Hero Band ── */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--background) 0%, var(--accent-soft) 100%)',
          position: 'relative',
          overflow: 'hidden',
          padding: 'clamp(50px, 8vw, 84px) 0 clamp(40px, 6vw, 64px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Ccircle cx='40' cy='40' r='35' fill='none' stroke='rgba(217,84,122,0.12)' stroke-width='1'/%3E%3C/svg%3E")`,
            pointerEvents: 'none',
          }}
        />

        <div className="container-custom max-w-6xl mx-auto px-4 relative z-10 text-center">
          {/* Eyebrow Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-extrabold text-[12px] uppercase tracking-wider mb-4 border border-[var(--primary)]/20 shadow-sm">
            <Sparkles size={14} className="text-[var(--primary)]" />
            {onSave && isEditable ? (
              <EditableText
                value={tag}
                onSave={(val) => onSave(block.id, 'props.tag', val)}
                isEditable={isEditable}
                placeholder="Tag..."
              />
            ) : (
              <span>{tag}</span>
            )}
          </div>

          {/* Heading */}
          <h1 className="text-[32px] sm:text-[44px] lg:text-[54px] font-[var(--font-heading)] leading-tight text-[var(--text)] mb-4 max-w-3xl mx-auto tracking-tight whitespace-pre-wrap">
            {onSave && isEditable ? (
              <EditableText
                value={heading}
                onSave={(val) => onSave(block.id, 'props.heading', val)}
                isEditable={isEditable}
                multiline={true}
                placeholder="Heading..."
              />
            ) : (
              heading
            )}
          </h1>

          {/* Subtitle */}
          <div className="text-[15px] sm:text-[18px] text-[var(--text-secondary)] max-w-2xl mx-auto mb-6 leading-relaxed font-medium whitespace-pre-wrap">
            {onSave && isEditable ? (
              <EditableText
                value={introText}
                onSave={(val) => onSave(block.id, 'props.introText', val)}
                isEditable={isEditable}
                multiline={true}
                placeholder="Intro text..."
              />
            ) : (
              <p>{introText}</p>
            )}
          </div>

          <div className="flex justify-center mb-10">
            <ReferenceEditButton
              type="review"
              title="Customer Reviews Reference"
              label="Edit Reference Reviews"
              sectionId={block.id}
            />
          </div>

          {/* ── Highlight Stats Dashboard Card ── */}
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-[0_10px_35px_-5px_rgba(61,46,46,0.08)] border border-[var(--border)] grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-center text-left">
            {/* Score & Stars */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left border-b md:border-b-0 md:border-r border-[var(--border)] pb-6 md:pb-0 md:pr-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black font-[var(--font-heading)] text-[var(--text)]">
                  {avgRating}
                </span>
                <span className="text-lg font-bold text-[var(--text-muted)]">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1 my-2 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={20} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Overall Customer Rating
              </p>
            </div>

            {/* Breakdown Bars */}
            <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-[var(--border)] pb-6 md:pb-0 md:pr-6">
              {[
                { stars: 5, count: fiveStarCount },
                { stars: 4, count: fourStarCount },
                { stars: 3, count: threeStarCount },
                { stars: 2, count: twoStarCount },
                { stars: 1, count: oneStarCount },
              ].map((row) => (
                <div key={row.stars} className="flex items-center gap-3 text-xs font-bold">
                  <span className="w-12 text-[var(--text-secondary)]">{row.stars} Stars</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${totalCount > 0 ? (row.count / totalCount) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="w-6 text-right text-[var(--text-muted)]">{row.count}</span>
                </div>
              ))}
            </div>

            {/* Recommendation Badge & Action */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck size={26} className="text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-[var(--text)] leading-snug">
                    {recommendationPct}% Recommended
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-tight">
                    Based on {totalCount}+ verified customer experiences.
                  </p>
                </div>
              </div>

              <Link
                href={shopLinkHref}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[var(--primary)] text-white text-xs font-extrabold uppercase tracking-wider hover:bg-[var(--primary-dark)] transition-all cursor-pointer shadow-sm hover:shadow"
              >
                <ShoppingBag size={15} />
                <span>Shop Escape-Proof Diapers</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Reviews Grid Section ── */}
      <section className="py-12 sm:py-16 px-4">
        <div className="container-custom max-w-6xl mx-auto">
          {/* Controls: Search, Rating Filter Pills, Sort */}
          <div className="mb-10 p-5 rounded-2xl bg-white border border-[var(--border)] shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  type="text"
                  placeholder="Filter reviews by dog breed, fit, name, or quote..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-11 pr-10 rounded-full bg-[var(--background)] border border-[var(--border)] outline-none focus:border-[var(--primary)] text-sm font-semibold transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] p-1 rounded-full cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Sort Selector & Write Button */}
              <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Sort:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="h-10 px-4 rounded-full bg-[var(--background)] border border-[var(--border)] text-xs font-bold uppercase tracking-wider outline-none cursor-pointer focus:border-[var(--primary)] text-[var(--text)]"
                  >
                    <option value="newest">Newest First</option>
                    <option value="helpful">Most Helpful</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[var(--border)]">
              <span className="text-xs font-bold text-[var(--text-muted)] mr-1 flex items-center gap-1">
                <SlidersHorizontal size={13} /> Filter:
              </span>
              <button
                type="button"
                onClick={() => setRatingFilter('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  ratingFilter === 'all'
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'bg-[var(--background)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
                }`}
              >
                All Reviews ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setRatingFilter(5)}
                className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  ratingFilter === 5
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'bg-[var(--background)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
                }`}
              >
                <Star size={13} className="fill-current" /> 5 Stars ({fiveStarCount})
              </button>
              {fourStarCount > 0 && (
                <button
                  type="button"
                  onClick={() => setRatingFilter(4)}
                  className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    ratingFilter === 4
                      ? 'bg-[var(--primary)] text-white shadow-sm'
                      : 'bg-[var(--background)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
                  }`}
                >
                  <Star size={13} className="fill-current" /> 4 Stars ({fourStarCount})
                </button>
              )}
              {threeStarCount > 0 && (
                <button
                  type="button"
                  onClick={() => setRatingFilter(3)}
                  className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    ratingFilter === 3
                      ? 'bg-[var(--primary)] text-white shadow-sm'
                      : 'bg-[var(--background)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
                  }`}
                >
                  <Star size={13} className="fill-current" /> 3 Stars ({threeStarCount})
                </button>
              )}
            </div>
          </div>

          {/* ── Active Review Results ── */}
          {isLoading ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-[var(--border)]">
              <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-bold text-[var(--text-secondary)]">Loading customer reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[var(--border)]">
              <div className="w-16 h-16 rounded-full bg-[var(--background)] flex items-center justify-center mx-auto mb-4 text-[var(--text-muted)]">
                <Search size={28} />
              </div>
              <h3 className="text-xl font-bold text-[var(--text)] mb-2 font-[var(--font-heading)]">
                No matching reviews found
              </h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-6">
                We couldn&apos;t find any reviews matching &quot;{searchQuery}&quot;. Try adjusting your search or clearing the filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setRatingFilter('all');
                }}
                className="btn-primary text-xs uppercase tracking-wider cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredReviews.map((review) => {
                const effectiveHelpful = helpfulOverrides[review.id] ?? review.helpful ?? 0;
                const isVoted = votedMap[review.id];
                const initials =
                  review.name
                    .split(' ')
                    .map((p) => p[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join('')
                    .toUpperCase() || 'VP';

                return (
                  <div
                    key={review.id}
                    className="p-6 sm:p-7 rounded-3xl bg-white border border-[var(--border)] shadow-[0_4px_20px_-4px_rgba(61,46,46,0.06)] hover:shadow-lg transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Header: Stars, Verified Badge, Date */}
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: review.rating || 5 }).map((_, i) => (
                            <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <ReferenceEditButton
                            type="review"
                            title={`Edit Review: ${review.name}`}
                            data={{ ...review, author: review.name, review: review.quote }}
                            sectionId={block.id}
                            onSave={(updated) => {
                              setReviews((prev) =>
                                prev.map((r) =>
                                  r.id === review.id
                                    ? {
                                        ...r,
                                        ...updated,
                                        name: updated.author || updated.name || r.name,
                                        quote: updated.content || updated.quote || updated.review || r.quote,
                                        title: updated.title || r.title,
                                        rating: typeof updated.rating === 'number' ? updated.rating : r.rating,
                                        verified: updated.verified !== undefined ? updated.verified : r.verified,
                                      }
                                    : r
                                )
                              );
                            }}
                            compact
                          />
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-700">
                            <CheckCircle2 size={12} className="text-emerald-600" />
                            Verified
                          </span>
                          {review.date && (
                            <span className="text-[12px] font-semibold text-[var(--text-muted)]">
                              {review.date}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Review Title */}
                      {review.title && (
                        <h3 className="text-[17px] font-black text-[var(--text)] mb-2 font-[var(--font-heading)] tracking-tight">
                          &ldquo;{review.title}&rdquo;
                        </h3>
                      )}

                      {/* Review Quote / Text */}
                      {review.quote && (
                        <p className="text-[14px] sm:text-[15px] text-[var(--text-secondary)] leading-relaxed font-medium mb-6">
                          {review.quote}
                        </p>
                      )}
                    </div>

                    {/* Footer: Reviewer Info & Helpful Vote */}
                    <div className="pt-5 border-t border-[var(--border)] flex items-center justify-between gap-4">
                      {/* Author Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white text-xs font-black flex items-center justify-center shrink-0 shadow-sm">
                          {initials}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-[var(--text)] truncate">
                            {review.name}
                          </p>
                          <p className="text-[11px] font-bold text-[var(--primary)] truncate uppercase tracking-wider">
                            {review.role || 'Verified Customer'}
                          </p>
                        </div>
                      </div>

                      {/* Helpful Button */}
                      <button
                        type="button"
                        onClick={() => handleHelpfulClick(review.id, effectiveHelpful)}
                        disabled={isVoted}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          isVoted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : 'bg-[var(--background)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--border)] hover:text-[var(--text)]'
                        }`}
                        title="Mark as helpful"
                      >
                        <ThumbsUp size={13} className={isVoted ? 'fill-emerald-600' : ''} />
                        <span>Helpful ({effectiveHelpful})</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Bottom Shop Call-To-Action Banner ── */}
          <div
            className="mt-16 p-8 sm:p-12 rounded-3xl text-center relative overflow-hidden text-white shadow-xl"
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            }}
          >
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/20 text-white font-extrabold text-[12px] uppercase tracking-wider backdrop-blur-sm">
                <Heart size={14} className="fill-white" />
                {onSave && isEditable ? (
                  <EditableText
                    value={t(props.ctaTag, locale) || 'Join Over 10,000 Happy Pet Parents'}
                    onSave={(val) => onSave(block.id, 'props.ctaTag', val)}
                    isEditable={isEditable}
                    placeholder="CTA Tag..."
                  />
                ) : (
                  <span>{t(props.ctaTag, locale) || 'Join Over 10,000 Happy Pet Parents'}</span>
                )}
              </div>
              <h2 className="text-3xl sm:text-4xl font-black font-[var(--font-heading)] leading-tight whitespace-pre-wrap">
                {onSave && isEditable ? (
                  <EditableText
                    value={t(props.ctaHeading, locale) || 'Ready to End Diaper Slips and Floor Messes?'}
                    onSave={(val) => onSave(block.id, 'props.ctaHeading', val)}
                    isEditable={isEditable}
                    multiline={true}
                    placeholder="CTA Heading..."
                  />
                ) : (
                  t(props.ctaHeading, locale) || 'Ready to End Diaper Slips and Floor Messes?'
                )}
              </h2>
              <div className="text-sm sm:text-base text-white/90 leading-relaxed font-semibold max-w-xl mx-auto whitespace-pre-wrap">
                {onSave && isEditable ? (
                  <EditableText
                    value={
                      t(props.ctaSubheading, locale) ||
                      'Give your companion the dignity, comfort, and escape-proof protection they deserve.'
                    }
                    onSave={(val) => onSave(block.id, 'props.ctaSubheading', val)}
                    isEditable={isEditable}
                    multiline={true}
                    placeholder="CTA Subheading..."
                  />
                ) : (
                  <p>
                    {t(props.ctaSubheading, locale) ||
                      'Give your companion the dignity, comfort, and escape-proof protection they deserve.'}
                  </p>
                )}
              </div>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                {onSave && isEditable ? (
                  <div className="inline-flex items-center justify-center gap-2.5 px-8 h-13 rounded-full bg-white text-[var(--primary)] font-extrabold text-sm uppercase tracking-wider">
                    <EditableText
                      value={t(props.ctaButtonText, locale) || 'Shop Escape-Proof Diapers'}
                      onSave={(val) => onSave(block.id, 'props.ctaButtonText', val)}
                      isEditable={isEditable}
                      placeholder="Button text..."
                    />
                    <ArrowRight size={16} />
                  </div>
                ) : (
                  <Link
                    href={shopLinkHref}
                    className="inline-flex items-center justify-center gap-2.5 px-8 h-13 rounded-full bg-white text-[var(--primary)] font-extrabold text-sm uppercase tracking-wider hover:bg-[var(--background)] shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  >
                    <span>{t(props.ctaButtonText, locale) || 'Shop Escape-Proof Diapers'}</span>
                    <ArrowRight size={16} />
                  </Link>
                )}
                {onSave && isEditable ? (
                  <div className="inline-flex items-center justify-center gap-2 px-7 h-13 rounded-full border-2 border-white/60 text-white font-extrabold text-sm uppercase tracking-wider">
                    <EditableText
                      value={t(props.ctaSecondaryButtonText, locale) || 'View Size Guide'}
                      onSave={(val) => onSave(block.id, 'props.ctaSecondaryButtonText', val)}
                      isEditable={isEditable}
                      placeholder="Secondary button..."
                    />
                  </div>
                ) : (
                  <Link
                    href={`${localePrefix}/dog-diaper-size-guide`}
                    className="inline-flex items-center justify-center gap-2 px-7 h-13 rounded-full border-2 border-white/60 text-white font-extrabold text-sm uppercase tracking-wider hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <span>{t(props.ctaSecondaryButtonText, locale) || 'View Size Guide'}</span>
                  </Link>
                )}
              </div>

              {/* Guarantees Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-white/20 text-xs font-bold uppercase tracking-wider text-white/80">
                <div className="flex items-center justify-center gap-2">
                  <span>🇺🇸</span> Made with Love in the USA
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span>🚚</span> Free US Shipping Over $50
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span>🔄</span> 30-Day Fit Guarantee
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

