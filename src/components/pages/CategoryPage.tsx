'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store/store';
import {
  mapCommerceProductToCatalog,
  extractFacetOptions,
  filterCatalogProducts,
  type CatalogProduct,
} from '@/lib/commerce/catalog-product-adapter';
import { ReferenceEditButton } from '@/components/cms/reference-editor';
import { fetchCategories } from '@/lib/store/categories/categoriesSlices';
import { fetchProductsByCategory } from '@/lib/store/products/productsThunk';
import { toast } from 'sonner';
import { Check, Plus, ShoppingBag, X, Send, ShieldCheck, Phone, Mail, User, Trash2, ArrowRight } from 'lucide-react';

// Luxury Stone Shimmer Skeleton for Arab Marble
export const CategoryPageSkeleton = () => (
  <div className="max-w-[1240px] mx-auto px-6 py-12">
    <div className="py-16 bg-stone-100 border-b border-stone-200 text-center mb-8 relative overflow-hidden">
      <div className="h-10 w-64 bg-stone-200 mx-auto mb-3 animate-pulse" />
      <div className="h-4 w-96 bg-stone-200 mx-auto animate-pulse" />
    </div>
    <div className="flex gap-4 mb-8">
      <div className="h-9 w-32 bg-stone-100 border border-stone-200 animate-pulse" />
      <div className="h-9 w-32 bg-stone-100 border border-stone-200 animate-pulse" />
      <div className="h-9 w-32 bg-stone-100 border border-stone-200 animate-pulse" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="flex flex-col space-y-3">
          <div className="aspect-square bg-stone-100 border border-stone-200 animate-pulse" />
          <div className="h-4 w-3/4 bg-stone-200 mx-auto animate-pulse" />
          <div className="h-3 w-1/2 bg-stone-100 mx-auto animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);

export default function CategoryPageComponent({
  categorySlug,
}: {
  categorySlug?: string;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const rawSlug =
    categorySlug ||
    (params?.id as string) ||
    (Array.isArray(params?.slug)
      ? params.slug.length > 1
        ? params.slug[params.slug.length - 1]
        : ['product-category', 'category'].includes(params.slug[0])
        ? 'all'
        : params.slug[0]
      : typeof params?.slug === 'string'
      ? params.slug
      : 'all');

  const slug = (typeof rawSlug === 'string' && rawSlug ? rawSlug : 'all');

  // Read filter query params directly from URL
  const selectedColor = searchParams.get('f_color') || 'all';
  const selectedCountry = searchParams.get('f_country') || 'all';
  const selectedSize = searchParams.get('f_size') || 'all';

  // URL-driven filter change handler (real dynamic re-fetching)
  const handleFilterChange = (filterKey: string, value: string) => {
    const currentKey = `f_${filterKey.toLowerCase()}`;
    const allParams = Object.fromEntries(searchParams.entries());
    delete allParams.page;

    if (value === 'all' || !value) {
      delete allParams[currentKey];
    } else {
      allParams[currentKey] = value;
    }

    const queryString = new URLSearchParams(allParams).toString();
    router.push(queryString ? `?${queryString}` : pathname);
  };

  const handleResetFilters = () => {
    const allParams = Object.fromEntries(searchParams.entries());
    delete allParams.f_color;
    delete allParams.f_country;
    delete allParams.f_size;
    delete allParams.page;
    const queryString = new URLSearchParams(allParams).toString();
    router.push(queryString ? `?${queryString}` : pathname);
  };

  // Build stable filter key from searchParams for server re-fetch
  const filterKey = useMemo(() => {
    const entries = Array.from(searchParams.entries())
      .filter(([k]) => k !== 'page' && k !== 'perPage')
      .sort(([a], [b]) => a.localeCompare(b));
    return JSON.stringify(entries);
  }, [searchParams]);

  const activeFilters = useMemo(
    () => Object.fromEntries(JSON.parse(filterKey)) as Record<string, string>,
    [filterKey],
  );

  // Re-fetch products from API when category or filters change
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(
      fetchProductsByCategory({
        category: slug || 'all',
        filters: activeFilters,
        offset: 0,
        limit: 50,
      }),
    );
  }, [dispatch, slug, filterKey]);

  // Redux data
  const categories = useSelector((state: RootState) => (state as any).categories?.allCategories || []);
  const reduxProducts = useSelector((state: RootState) => state.products?.allProducts || []);
  const isProductsLoading = useSelector((state: RootState) => state.products?.loading || false);

  // Find category details from DB
  const currentCategory = useMemo(() => {
    if (!slug || slug === 'all') return null;
    return categories.find((c: any) => c.slug === slug || c.id === slug || c._id === slug);
  }, [categories, slug]);

  const locale = (params?.locale as string) || 'en';
  const rawCatName = currentCategory?.name || currentCategory?.title;
  const currentCategoryName =
    typeof rawCatName === 'object' && rawCatName !== null
      ? (rawCatName as any)[locale] || (rawCatName as any).en || ''
      : typeof rawCatName === 'string'
      ? rawCatName
      : '';

  const categoryTitle =
    currentCategoryName ||
    (slug && slug !== 'all' && typeof slug === 'string'
      ? slug.replace(/-/g, ' ').toUpperCase()
      : 'ALL PRODUCTS');

  const rawCatDesc = currentCategory?.description;
  const currentCategoryDesc =
    typeof rawCatDesc === 'object' && rawCatDesc !== null
      ? (rawCatDesc as any)[locale] || (rawCatDesc as any).en || ''
      : typeof rawCatDesc === 'string'
      ? rawCatDesc
      : '';

  const categoryDescription =
    currentCategoryDesc ||
    (slug === 'all'
      ? 'Explore our full luxury collection of fine marble, granite, and natural stones.'
      : `Explore our premium ${categoryTitle.toLowerCase()} collection.`);

  // Pagination state (Load More)
  const [visibleCount, setVisibleCount] = useState(16);

  // Lightbox state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string | null>(null);

  // Map server-filtered redux products with dynamic facet filtering
  const productsList: CatalogProduct[] = useMemo(() => {
    const rawList =
      reduxProducts && reduxProducts.length > 0
        ? (reduxProducts as any[]).map(mapCommerceProductToCatalog)
        : [];
    return filterCatalogProducts(rawList, {
      color: selectedColor,
      country: selectedCountry,
      size: selectedSize,
    });
  }, [reduxProducts, selectedColor, selectedCountry, selectedSize]);

  // Extract facet options dynamically from active database products
  const facetOptions = useMemo(() => {
    if (!reduxProducts || reduxProducts.length === 0) {
      return { colors: [], countries: [], sizes: [] };
    }
    return extractFacetOptions((reduxProducts as any[]).map(mapCommerceProductToCatalog));
  }, [reduxProducts]);

  const visibleProducts = productsList.slice(0, visibleCount);
  const hasMore = visibleCount < productsList.length;

  // Add to Enquiry State & Persistence
  const [enquiryItems, setEnquiryItems] = useState<CatalogProduct[]>([]);
  const [isEnquiryDrawerOpen, setIsEnquiryDrawerOpen] = useState(false);

  // Form State
  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryEmail, setEnquiryEmail] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquiryNotes, setEnquiryNotes] = useState('');

  // Verification State
  const [verificationStep, setVerificationStep] = useState<'form' | 'verify' | 'success'>('form');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Load Enquiry items from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('arab_marble_enquiry');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setEnquiryItems(parsed);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const saveEnquiryItems = (items: CatalogProduct[]) => {
    setEnquiryItems(items);
    try {
      localStorage.setItem('arab_marble_enquiry', JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  };

  const toggleEnquiryItem = (stone: CatalogProduct) => {
    const exists = enquiryItems.some((item) => item.id === stone.id);
    if (exists) {
      const updated = enquiryItems.filter((item) => item.id !== stone.id);
      saveEnquiryItems(updated);
      toast.info(`Removed ${stone.name} from inquiry list.`);
    } else {
      const updated = [...enquiryItems, stone];
      saveEnquiryItems(updated);
      toast.success(`Added ${stone.name} to inquiry list.`, {
        action: {
          label: 'View List',
          onClick: () => setIsEnquiryDrawerOpen(true),
        },
      });
    }
  };

  const removeEnquiryItem = (stoneId: string) => {
    const updated = enquiryItems.filter((item) => item.id !== stoneId);
    saveEnquiryItems(updated);
  };

  const isItemInEnquiry = (stoneId: string) => {
    return enquiryItems.some((item) => item.id === stoneId);
  };

  // Step 1: Validate Email (Required), Phone (Optional), then send verification code via kalp-business-api platform email
  const sendVerificationEmail = async (email: string, name: string, code: string) => {
    return fetch('/api/platform/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email.trim(),
        subject: `[Arab Marble] Your Verification Code: ${code}`,
        html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 28px; border: 1px solid #e0e0e0; border-radius: 6px; background: #ffffff;">
          <div style="text-align: center; border-bottom: 2px solid #C9A96E; padding-bottom: 16px;">
            <h2 style="margin: 0; color: #171717; letter-spacing: 2px;">ARAB MARBLE</h2>
            <p style="margin: 4px 0 0; font-size: 11px; color: #777; text-transform: uppercase;">Natural Stone & Marble Abu Dhabi</p>
          </div>
          <div style="padding: 24px 0; text-align: center;">
            <p style="font-size: 14px; color: #333; margin-bottom: 16px;">Dear <strong>${name.trim() || 'Client'}</strong>,</p>
            <p style="font-size: 13px; color: #555; line-height: 1.6; margin-bottom: 20px;">
              Please use the verification code below to confirm your stone inquiry request on Arab Marble:
            </p>
            <div style="display: inline-block; background: #faf8f5; border: 2px dashed #C9A96E; padding: 12px 30px; border-radius: 4px; font-family: monospace; font-size: 30px; font-weight: bold; letter-spacing: 6px; color: #171717;">
              ${code}
            </div>
            <p style="font-size: 11px; color: #888; margin-top: 18px;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
          </div>
          <div style="border-top: 1px solid #eee; padding-top: 14px; text-align: center; font-size: 11px; color: #999;">
            Arab Marble LLC • Musaffah, Abu Dhabi, UAE • Phone: +971 2 555 4008
          </div>
        </div>`,
        tenantSlug: 'arab-marble',
      }),
    });
  };

  const handleRequestVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryName.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(enquiryEmail.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }

    // Generate 4-digit verification code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setEnteredOtp('');
    setOtpError('');
    setIsSubmitting(true);

    try {
      const res = await sendVerificationEmail(enquiryEmail, enquiryName, code);
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success !== false)) {
        setVerificationStep('verify');
        toast.success(`Verification code sent to ${enquiryEmail.trim()}. Please check your email inbox.`);
      } else {
        toast.error(data.error || data.message || 'Could not send verification email. Please check your email.');
      }
    } catch {
      toast.error('Network error while sending verification email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Confirm OTP & Submit Inquiry to kalp-business-api public forms endpoint
  const handleConfirmAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setOtpError('Invalid verification code. Please check and try again.');
      return;
    }

    setIsSubmitting(true);
    setOtpError('');

    try {
      const stonesSummary = enquiryItems
        .map((s, idx) => `${idx + 1}. ${s.name} (${s.country || 'Natural Stone'}, ${s.color || 'Standard'})`)
        .join(', ');

      const payloadData: Record<string, string> = {
        name: enquiryName.trim(),
        email: enquiryEmail.trim(),
        stones: stonesSummary || 'Selected Stone Products',
      };
      if (enquiryPhone.trim()) {
        payloadData.phone = enquiryPhone.trim();
      }
      if (enquiryNotes.trim()) {
        payloadData.message = enquiryNotes.trim();
      }

      const res = await fetch('/api/forms/public/arab-marble/product-catalog-enquiry-form/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: payloadData,
          context: {
            pageUrl: typeof window !== 'undefined' ? window.location.href : '',
            verified: true,
          },
        }),
      });

      if (res.ok) {
        setVerificationStep('success');
        saveEnquiryItems([]);
        toast.success('Inquiry submitted and recorded in admin dashboard!');
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.detail?.message || 'Could not submit inquiry. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Category Hero Banner */}
      <div
        className="relative py-12 md:py-24 bg-[#e9e8e6] border-b border-neutral-200 text-center bg-cover  overflow-hidden"
        style={{ backgroundImage: `url('https://arabmarble.ae/wp-content/uploads/2023/06/title-bg-2.png')` }}
      >
        <div className="absolute inset-0 bg-white/30" />
        <div className="relative z-10 max-w-[1140px] mx-auto px-6">
          <h1
            className="text-3xl sm:text-4xl md:text-[80px] font-bold tracking-[0.06em] uppercase"
            style={{ color: '#505050' }}
          >
            {categoryTitle}
          </h1>
        </div>
      </div>

      {/* Filter Bar: All Colors, All Countries, All Sizes - Strictly aligned in single row */}
      <div className="border-b border-neutral-200 bg-neutral-50/80 py-3.5">
        <div className="max-w-[1240px] mx-auto px-6 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar whitespace-nowrap">
          {/* Filters grouped in one row */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Colors Filter */}
            <div className="shrink-0">
              <select
                value={selectedColor}
                onChange={(e) => {
                  handleFilterChange('color', e.target.value);
                  setVisibleCount(16);
                }}
                className="bg-white border border-neutral-300 px-3 py-1.5 text-xs font-light rounded-none focus:outline-none focus:border-neutral-500 cursor-pointer shadow-2xs"
              >
                <option value="all">All Colors</option>
                {facetOptions.colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Countries Filter */}
            <div className="shrink-0">
              <select
                value={selectedCountry}
                onChange={(e) => {
                  handleFilterChange('country', e.target.value);
                  setVisibleCount(16);
                }}
                className="bg-white border border-neutral-300 px-3 py-1.5 text-xs font-light rounded-none focus:outline-none focus:border-neutral-500 cursor-pointer shadow-2xs"
              >
                <option value="all">All Countries</option>
                {facetOptions.countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Sizes Filter */}
            <div className="shrink-0">
              <select
                value={selectedSize}
                onChange={(e) => {
                  handleFilterChange('size', e.target.value);
                  setVisibleCount(16);
                }}
                className="bg-white border border-neutral-300 px-3 py-1.5 text-xs font-light rounded-none focus:outline-none focus:border-neutral-500 cursor-pointer shadow-2xs"
              >
                <option value="all">All Sizes</option>
                {facetOptions.sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {(selectedColor !== 'all' || selectedCountry !== 'all' || selectedSize !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-neutral-500 hover:text-black underline px-1 cursor-pointer shrink-0"
              >
                Reset
              </button>
            )}
          </div>

          {/* Right side: Items Count & Enquiry trigger */}
          <div className="flex items-center gap-3 shrink-0 pl-3">
            {enquiryItems.length > 0 && (
              <button
                onClick={() => setIsEnquiryDrawerOpen(true)}
                className="px-3 py-1.5 bg-[#C9A96E] hover:bg-[#b5955b] text-neutral-900 text-xs font-semibold uppercase tracking-wider rounded-none flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Enquiry ({enquiryItems.length})</span>
              </button>
            )}
            <div className="text-neutral-500 text-xs font-mono flex items-center gap-1.5">
              {isProductsLoading && (
                <span className="inline-block w-2 h-2 rounded-full bg-neutral-400 animate-ping" />
              )}
              {productsList.length} items
            </div>
          </div>
        </div>
      </div>

      {/* 4-Column Catalog Grid with Edit Buttons */}
      <div className="max-w-[1240px] mx-auto px-6 py-12">
        {isProductsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col space-y-3">
                <div className="aspect-square bg-stone-100 border border-stone-200 animate-pulse" />
                <div className="h-4 w-3/4 bg-stone-200 mx-auto animate-pulse" />
                <div className="h-3 w-1/2 bg-stone-100 mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="py-24 text-center space-y-4 bg-stone-50/50 border border-stone-200/60 p-8 my-4">
            <h3 className="text-xl font-light text-neutral-800 tracking-wider uppercase">
              No Products Available
            </h3>
            <p className="text-xs text-neutral-500 font-light max-w-md mx-auto">
              There are currently no stone products available in this category.
            </p>
            {(selectedColor !== 'all' || selectedCountry !== 'all' || selectedSize !== 'all') && (
              <div className="pt-2">
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-neutral-900 text-white text-xs uppercase tracking-wider font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {visibleProducts.map((stone) => {
              const inEnquiry = isItemInEnquiry(stone.id);

              return (
                <div key={stone.id} className="flex flex-col group relative">
                  {/* Product Image Tile: Lightbox on click */}
                  <div
                    onClick={() => {
                      setLightboxImage(stone.primaryImage);
                      setLightboxTitle(stone.name);
                    }}
                    className="relative aspect-square overflow-hidden bg-neutral-100 border border-neutral-200 cursor-zoom-in"
                    title="Click to view full image"
                  >
                    <img
                      src={stone.primaryImage}
                      alt={stone.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Edit Button for Admin */}
                    <ReferenceEditButton
                      type="product"
                      title={`Edit Product: ${stone.name}`}
                      data={stone}
                      className="absolute right-2.5 top-2.5 z-20"
                      compact
                    />

                    {/* Hover Overlay Zoom Indicator */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                      <span className="p-2 rounded-full bg-white/80 text-black shadow-xs">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* Product Title below Image */}
                  <div className="mt-3 text-center">
                    <Link
                      href={`/shop/${stone.slug}`}
                      className="text-xs md:text-sm font-medium tracking-wide text-neutral-800 hover:text-black transition-colors block line-clamp-1"
                    >
                      {stone.name}
                    </Link>
                    {stone.country && stone.country !== 'Imported' && (
                      <span className="text-[11px] text-neutral-500 font-light block mt-0.5">
                        {stone.country}
                      </span>
                    )}

                    {/* Add to Enquiry Button */}
                    <div className="mt-2.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleEnquiryItem(stone);
                        }}
                        className={`w-full py-1.5 px-2 text-[11px] uppercase tracking-wider font-medium border transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                          inEnquiry
                            ? 'bg-[#C9A96E] text-neutral-950 border-[#C9A96E]'
                            : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900 hover:text-black'
                        }`}
                      >
                        {inEnquiry ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-neutral-950" />
                            <span>Added to Enquiry</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 text-neutral-500" />
                            <span>Add to Enquiry</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-14 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 16)}
              className="px-9 py-3 border border-neutral-900 bg-neutral-900 hover:bg-[#C9A96E] hover:border-[#C9A96E] text-white text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 rounded-xs shadow-sm cursor-pointer inline-flex items-center justify-center gap-2"
              style={{ color: '#ffffff', backgroundColor: '#171717' }}
            >
              <span style={{ color: '#ffffff' }}>Load More</span>
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal with Add to Enquiry */}
      {lightboxImage && (
        <div
          onClick={() => {
            setLightboxImage(null);
            setLightboxTitle(null);
          }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-white p-4 border border-neutral-700 shadow-2xl flex flex-col items-center cursor-default"
          >
            <button
              onClick={() => {
                setLightboxImage(null);
                setLightboxTitle(null);
              }}
              className="absolute -top-10 right-0 text-white hover:text-neutral-300 text-sm font-light uppercase tracking-widest cursor-pointer"
            >
              ✕ Close
            </button>
            <img
              src={lightboxImage}
              alt={lightboxTitle || 'Stone Detail'}
              className="max-h-[70vh] w-auto object-contain"
            />
            {lightboxTitle && (
              <div className="mt-4 w-full flex items-center justify-between border-t border-neutral-200 pt-3">
                <div className="text-sm font-semibold tracking-wide text-neutral-800 uppercase">
                  {lightboxTitle}
                </div>
                {(() => {
                  const currentStone = productsList.find((s) => s.name === lightboxTitle);
                  if (!currentStone) return null;
                  const inEnquiry = isItemInEnquiry(currentStone.id);
                  return (
                    <button
                      onClick={() => toggleEnquiryItem(currentStone)}
                      className={`px-4 py-2 text-xs uppercase tracking-wider font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                        inEnquiry
                          ? 'bg-[#C9A96E] text-neutral-950 border-[#C9A96E]'
                          : 'bg-neutral-900 text-white border-neutral-900 hover:bg-[#C9A96E] hover:border-[#C9A96E]'
                      }`}
                    >
                      {inEnquiry ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>In Enquiry List</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Add to Enquiry</span>
                        </>
                      )}
                    </button>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Enquiry Trigger Pill */}
      {enquiryItems.length > 0 && !isEnquiryDrawerOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsEnquiryDrawerOpen(true)}
            className="group px-5 py-3.5 bg-neutral-950 hover:bg-neutral-900 text-white rounded-full shadow-2xl border border-[#C9A96E]/50 flex items-center gap-3 transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[#C9A96E] text-neutral-950 font-bold text-xs flex items-center justify-center">
              {enquiryItems.length}
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold tracking-wider uppercase text-white">
                Stone Enquiry List
              </div>
              <div className="text-[10px] text-neutral-300">
                Click to review & enquire
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#C9A96E] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* Multi-Product Enquiry Slide-over Drawer - Compact & Scroll-free */}
      {isEnquiryDrawerOpen && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end"
        >
          <div className="w-full max-w-md bg-white h-dvh max-h-dvh shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="shrink-0 px-5 py-3.5 border-b border-neutral-200 bg-[#333333] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-[#C9A96E]" />
                <h3 className="text-sm font-semibold tracking-[0.1em] uppercase text-white">
                  Product Enquiry
                </h3>
                <span className="text-[11px] bg-neutral-700 text-neutral-200 px-2 py-0.5 rounded-sm font-mono">
                  {enquiryItems.length} {enquiryItems.length === 1 ? 'stone' : 'stones'}
                </span>
              </div>
              <button
                onClick={() => setIsEnquiryDrawerOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div
              data-lenis-prevent
              className="flex-1 min-h-0 p-5 pb-6 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-neutral-100 [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-thumb]:rounded-full"
              style={{ scrollbarGutter: 'stable', scrollbarWidth: 'auto', scrollbarColor: '#a3a3a3 #f5f5f5' }}
            >
              {/* Selected Stones List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Selected Items ({enquiryItems.length})
                  </span>
                  {enquiryItems.length > 0 && (
                    <button
                      onClick={() => saveEnquiryItems([])}
                      className="text-xs text-neutral-500 hover:text-red-600 underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {enquiryItems.length === 0 ? (
                  <div className="p-5 border border-dashed border-neutral-300 text-center rounded-sm bg-neutral-50">
                    <p className="text-sm text-neutral-500 font-normal">
                      No stones added yet. Browse catalog and click &quot;Add to Enquiry&quot;.
                    </p>
                  </div>
                ) : (
                  <div
                    data-lenis-prevent
                    className="space-y-2 min-h-[140px] max-h-[280px] overflow-y-auto pr-1.5 border border-neutral-200 p-2.5 bg-neutral-50/50 rounded-sm [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-neutral-200/70 [&::-webkit-scrollbar-thumb]:bg-[#C9A96E] hover:[&::-webkit-scrollbar-thumb]:bg-[#b5955b] [&::-webkit-scrollbar-thumb]:rounded-full"
                    style={{ scrollbarGutter: 'stable', scrollbarWidth: 'auto', scrollbarColor: '#C9A96E #ececec' }}
                  >
                    {enquiryItems.map((stone) => (
                      <div
                        key={stone.id}
                        className="flex items-center justify-between p-2 border border-neutral-200 bg-white rounded-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={stone.primaryImage}
                            alt={stone.name}
                            className="w-10 h-10 object-cover border border-neutral-200 rounded-sm shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-neutral-800 truncate">
                              {stone.name}
                            </div>
                            <div className="text-xs text-neutral-500 font-normal truncate">
                              {stone.country || 'Natural Stone'} • {stone.color || 'Standard'}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeEnquiryItem(stone.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form & Verification Section */}
              {enquiryItems.length > 0 && (
                <div className="border-t border-neutral-200 pt-4">
                  {verificationStep === 'form' && (
                    <form id="enquiry-drawer-form" onSubmit={handleRequestVerification} className="space-y-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-600">
                          Contact Details & Verification
                        </span>
                        <span className="text-[10px] text-[#C9A96E] font-medium uppercase tracking-wider">
                          Direct Specialist Link
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Name */}
                        <div>
                          <label className="block text-[11px] uppercase font-semibold tracking-wider text-neutral-500 mb-1">
                            Full Name *
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              required
                              value={enquiryName}
                              onChange={(e) => setEnquiryName(e.target.value)}
                              placeholder="Enter your full name"
                              className="w-full pl-9 pr-3.5 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 border border-neutral-300 focus:outline-none focus:border-neutral-700 bg-white rounded-sm transition-colors"
                            />
                          </div>
                        </div>

                        {/* Phone - Optional */}
                        <div>
                          <label className="block text-[11px] uppercase font-semibold tracking-wider text-neutral-500 mb-1">
                            Phone / WhatsApp
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="tel"
                              value={enquiryPhone}
                              onChange={(e) => setEnquiryPhone(e.target.value)}
                              placeholder="+971 50 000 0000"
                              className="w-full pl-9 pr-3.5 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 border border-neutral-300 focus:outline-none focus:border-neutral-700 bg-white rounded-sm transition-colors"
                            />
                          </div>
                        </div>

                        {/* Email - Required */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] uppercase font-semibold tracking-wider text-neutral-500 mb-1">
                            Email Address *
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="email"
                              required
                              value={enquiryEmail}
                              onChange={(e) => setEnquiryEmail(e.target.value)}
                              placeholder="name@example.com"
                              className="w-full pl-9 pr-3.5 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 border border-neutral-300 focus:outline-none focus:border-neutral-700 bg-white rounded-sm transition-colors"
                            />
                          </div>
                        </div>

                        {/* Project Scope / Quantity */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] uppercase font-semibold tracking-wider text-neutral-500 mb-1">
                            Project Scope & Quantity (Optional)
                          </label>
                          <textarea
                            rows={4}
                            value={enquiryNotes}
                            onChange={(e) => setEnquiryNotes(e.target.value)}
                            placeholder="Provide dimensions, quantity (m²), finish (polished/honed), or project specifications..."
                            className="w-full px-3.5 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 border border-neutral-300 focus:outline-none focus:border-neutral-700 bg-white rounded-sm transition-colors min-h-[110px] resize-y"
                          />
                        </div>
                      </div>
                    </form>
                  )}

                  {verificationStep === 'verify' && (
                    <form id="enquiry-verify-form" onSubmit={handleConfirmAndSubmit} className="space-y-3.5">
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm">
                        <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm mb-1">
                          <ShieldCheck className="w-4 h-4 text-[#C9A96E]" />
                          <span>Verification Code Sent to Email</span>
                        </div>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          We sent a 4-digit code to <strong>{enquiryEmail}</strong>. Please check your email inbox and enter the code below:
                        </p>
                      </div>

                      <div>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={enteredOtp}
                          onChange={(e) => {
                            setEnteredOtp(e.target.value);
                            setOtpError('');
                          }}
                          placeholder="Enter 4-Digit PIN"
                          className="w-full text-center tracking-[0.3em] font-mono text-base py-2.5 px-3.5 border border-neutral-300 focus:outline-none focus:border-neutral-700 bg-white rounded-sm transition-colors"
                        />
                        {otpError && (
                          <p className="text-red-600 text-xs mt-1 font-medium">{otpError}</p>
                        )}
                      </div>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={async () => {
                            const newCode = Math.floor(1000 + Math.random() * 9000).toString();
                            setGeneratedOtp(newCode);
                            toast.info(`Sending new verification code to ${enquiryEmail}...`);
                            try {
                              const res = await sendVerificationEmail(enquiryEmail, enquiryName, newCode);
                              if (res.ok) {
                                toast.success(`New code sent to ${enquiryEmail}`);
                              } else {
                                toast.error('Failed to resend email code');
                              }
                            } catch {
                              toast.error('Failed to resend email code');
                            }
                          }}
                          className="text-xs text-neutral-500 hover:text-black underline cursor-pointer"
                        >
                          Didn&apos;t receive code? Resend PIN
                        </button>
                      </div>
                    </form>
                  )}

                  {verificationStep === 'success' && (
                    <div className="p-5 text-center space-y-3">
                      <div className="w-11 h-11 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
                        Inquiry Received & Verified!
                      </h4>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        Thank you, <strong>{enquiryName}</strong>. Our Arab Marble stone specialists have received
                        your specifications and recorded it in the admin dashboard.
                      </p>
                      <button
                        onClick={() => {
                          setVerificationStep('form');
                          setIsEnquiryDrawerOpen(false);
                        }}
                        className="px-5 py-1.5 bg-neutral-900 text-white text-[11px] uppercase tracking-wider font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sticky Sidebar Footer */}
            {enquiryItems.length > 0 && verificationStep !== 'success' && (
              <div className="shrink-0 border-t border-neutral-200 bg-white px-5 py-3.5">
                {verificationStep === 'form' && (
                  <button
                    type="submit"
                    form="enquiry-drawer-form"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#333333] hover:bg-black text-white text-xs font-semibold uppercase tracking-widest rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending Code to Email...' : 'Verify & Submit Enquiry'}</span>
                  </button>
                )}
                {verificationStep === 'verify' && (
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setVerificationStep('form')}
                      className="w-1/3 py-3 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      form="enquiry-verify-form"
                      disabled={isSubmitting}
                      className="flex-1 py-3 bg-[#333333] hover:bg-black text-white text-xs font-semibold uppercase tracking-widest rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? 'Submitting...' : 'Confirm & Send'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
