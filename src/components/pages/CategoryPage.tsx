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

const DEFAULT_STONES: CatalogProduct[] = [
  {
    id: 'omani-beige',
    name: 'Omani Beige',
    slug: 'omani-beige',
    description: 'Exclusive natural beige marble quarried in Oman, offering superior density and elegance.',
    primaryImage: '/images/products/stone-1.jpg',
    allImages: ['/images/products/stone-1.jpg'],
    gallery: ['/images/products/stone-1.jpg'],
    color: 'Beige',
    country: 'Oman',
    sizes: ['Slabs (20mm / 30mm)', '600x600mm', '600x300mm'],
    finish: 'Polished / Honed / Brushed',
    options: [],
    attributes: { Color: 'Beige', Country: 'Oman', Finish: 'Polished' },
    status: 'active',
  },
  {
    id: 'crema-marfil',
    name: 'Crema Marfil',
    slug: 'crema-marfil',
    description: 'Classic creamy Spanish marble with subtle veining, suitable for grand flooring and wall cladding.',
    primaryImage: '/images/products/stone-2.jpg',
    allImages: ['/images/products/stone-2.jpg'],
    gallery: ['/images/products/stone-2.jpg'],
    color: 'Cream',
    country: 'Spain',
    sizes: ['Slabs 20mm', '600x600mm'],
    finish: 'Polished',
    options: [],
    attributes: { Color: 'Cream', Country: 'Spain', Finish: 'Polished' },
    status: 'active',
  },
  {
    id: 'dark-emperador',
    name: 'Dark Emperador',
    slug: 'dark-emperador',
    description: 'Rich dark chocolate brown marble with prominent white and golden crystalline veins.',
    primaryImage: '/images/products/stone-3.jpg',
    allImages: ['/images/products/stone-3.jpg'],
    gallery: ['/images/products/stone-3.jpg'],
    color: 'Brown',
    country: 'Spain',
    sizes: ['Slabs', '600x600mm', 'Cut to size'],
    finish: 'Polished / Honed',
    options: [],
    attributes: { Color: 'Brown', Country: 'Spain', Finish: 'Polished' },
    status: 'active',
  },
  {
    id: 'light-emperador',
    name: 'Light Emperador',
    slug: 'light-emperador',
    description: 'Delicate light brown and beige marble with intricate webs of crystalline veins.',
    primaryImage: '/images/products/promo-light-emperador.jpg',
    allImages: ['/images/products/promo-light-emperador.jpg'],
    gallery: ['/images/products/promo-light-emperador.jpg'],
    color: 'Brown',
    country: 'Spain',
    sizes: ['600x600x20mm', 'Slabs'],
    finish: 'Polished',
    options: [],
    attributes: { Color: 'Brown', Country: 'Spain', Finish: 'Polished' },
    status: 'active',
  },
  {
    id: 'carrara-white',
    name: 'Carrara White',
    slug: 'carrara-white',
    description: 'Iconic Italian white marble with soft feathery grey veining from the quarries of Carrara.',
    primaryImage: '/images/products/stone-4.jpg',
    allImages: ['/images/products/stone-4.jpg'],
    gallery: ['/images/products/stone-4.jpg'],
    color: 'White',
    country: 'Italy',
    sizes: ['Slabs (20mm / 30mm)', '600x600mm'],
    finish: 'Polished / Honed',
    options: [],
    attributes: { Color: 'White', Country: 'Italy', Finish: 'Polished' },
    status: 'active',
  },
  {
    id: 'statuario-extra',
    name: 'Statuario Extra',
    slug: 'statuario',
    description: 'Precious Italian marble characterized by bright white background and bold grey statement veins.',
    primaryImage: '/images/products/stone-5.jpg',
    allImages: ['/images/products/stone-5.jpg'],
    gallery: ['/images/products/stone-5.jpg'],
    color: 'White',
    country: 'Italy',
    sizes: ['Bookmatch Slabs 20mm', 'Cut to size'],
    finish: 'Polished',
    options: [],
    attributes: { Color: 'White', Country: 'Italy', Finish: 'Polished' },
    status: 'active',
  },
  {
    id: 'calacatta-oro',
    name: 'Calacatta Oro',
    slug: 'calacatta-oro',
    description: 'High-end luxury Italian marble with distinctive warm golden and grey veins on an ivory base.',
    primaryImage: '/images/products/promo-calacatta-oro.jpg',
    allImages: ['/images/products/promo-calacatta-oro.jpg'],
    gallery: ['/images/products/promo-calacatta-oro.jpg'],
    color: 'White',
    country: 'Italy',
    sizes: ['Slabs', 'Custom Tiles'],
    finish: 'Polished',
    options: [],
    attributes: { Color: 'White', Country: 'Italy', Finish: 'Polished' },
    status: 'active',
  },
  {
    id: 'nero-marquina',
    name: 'Nero Marquina',
    slug: 'nero-marquina',
    description: 'Deep nocturnal black marble quarried in Northern Spain, highlighted by striking white calcite veins.',
    primaryImage: '/images/products/stone-6.jpg',
    allImages: ['/images/products/stone-6.jpg'],
    gallery: ['/images/products/stone-6.jpg'],
    color: 'Black',
    country: 'Spain',
    sizes: ['Slabs 20mm', '600x600mm'],
    finish: 'Polished',
    options: [],
    attributes: { Color: 'Black', Country: 'Spain', Finish: 'Polished' },
    status: 'active',
  },
  {
    id: 'travertino-navona',
    name: 'Travertino Navona',
    slug: 'travertino-navona',
    description: 'Warm, porous natural Roman travertine celebrated for timeless warmth and architectural authenticity.',
    primaryImage: '/images/products/stone-8.jpg',
    allImages: ['/images/products/stone-8.jpg'],
    gallery: ['/images/products/stone-8.jpg'],
    color: 'Beige',
    country: 'Italy',
    sizes: ['Slabs 20mm / 30mm', 'Veincut Tiles'],
    finish: 'Filled & Polished',
    options: [],
    attributes: { Color: 'Beige', Country: 'Italy', Finish: 'Filled & Polished' },
    status: 'active',
  },
  {
    id: 'black-absolute',
    name: 'Black Absolute Granite',
    slug: 'black-absolute',
    description: 'Extremely dense, uniform solid black granite with virtually zero water absorption.',
    primaryImage: '/images/products/stone-10.jpg',
    allImages: ['/images/products/stone-10.jpg'],
    gallery: ['/images/products/stone-10.jpg'],
    color: 'Black',
    country: 'India',
    sizes: ['Slabs 20mm / 30mm', 'Counters', 'Tiles'],
    finish: 'Polished / Flamed / Leathered',
    options: [],
    attributes: { Color: 'Black', Country: 'India', Finish: 'Polished' },
    status: 'active',
  },
];

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
        : DEFAULT_STONES;
    return filterCatalogProducts(rawList, {
      color: selectedColor,
      country: selectedCountry,
      size: selectedSize,
    });
  }, [reduxProducts, selectedColor, selectedCountry, selectedSize]);

  // Extract facet options from ALL known stones so filter dropdown never collapses
  const facetOptions = useMemo(() => {
    const baseFacets = extractFacetOptions(DEFAULT_STONES);
    const dynamicFacets = reduxProducts?.length
      ? extractFacetOptions((reduxProducts as any[]).map(mapCommerceProductToCatalog))
      : { colors: [], countries: [], sizes: [] };

    return {
      colors: Array.from(new Set([...baseFacets.colors, ...dynamicFacets.colors])).sort(),
      countries: Array.from(new Set([...baseFacets.countries, ...dynamicFacets.countries])).sort(),
      sizes: Array.from(new Set([...baseFacets.sizes, ...dynamicFacets.sizes])).sort(),
    };
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

  // Step 1: Validate Email & Phone, then generate verification code
  const handleRequestVerification = (e: React.FormEvent) => {
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
    const cleanPhone = enquiryPhone.replace(/[\s-]/g, '');
    if (cleanPhone.length < 7) {
      toast.error('Please enter a valid phone or WhatsApp number.');
      return;
    }

    // Generate 4-digit verification code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setEnteredOtp('');
    setOtpError('');
    setVerificationStep('verify');

    // Display simulated verification code delivery
    toast.info(`Verification code sent to ${enquiryPhone}: ${code}`, {
      duration: 10000,
    });
  };

  // Step 2: Confirm OTP & Submit Inquiry
  const handleConfirmAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setOtpError('Invalid verification code. Please check and try again.');
      return;
    }

    setIsSubmitting(true);
    setOtpError('');

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: enquiryName,
          email: enquiryEmail,
          phone: enquiryPhone,
          notes: enquiryNotes,
          stones: enquiryItems.map((s) => ({
            id: s.id,
            name: s.name,
            country: s.country,
            color: s.color,
            primaryImage: s.primaryImage,
          })),
          verified: true,
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
        }),
      });

      if (res.ok) {
        setVerificationStep('success');
        saveEnquiryItems([]);
        toast.success('Inquiry submitted and recorded in admin dashboard!');
      } else {
        toast.error('Could not submit inquiry. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Category Hero Banner matching screenshot */}
      <div
        className="relative py-20 bg-neutral-900 border-b border-neutral-200 text-center bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url('/images/page-banner.jpg')` }}
      >
        <div className="absolute inset-0 bg-black/65 backdrop-brightness-85" />
        <div className="relative z-10 max-w-[1240px] mx-auto px-6">
          <h1
            className="text-3xl md:text-5xl font-light tracking-widest !text-white uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] mb-3"
            style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}
          >
            {categoryTitle}
          </h1>
          {categoryDescription && (
            <p
              className="text-sm md:text-base !text-neutral-100 font-light max-w-2xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
              style={{ color: '#f5f5f5', textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}
            >
              {categoryDescription}
            </p>
          )}
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
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Compact Header */}
            <div className="px-4 py-2.5 border-b border-neutral-200 bg-neutral-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#C9A96E]" />
                <h3 className="text-xs font-semibold tracking-wider uppercase text-white">
                  Product Enquiry
                </h3>
                <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded-xs font-mono">
                  {enquiryItems.length} {enquiryItems.length === 1 ? 'stone' : 'stones'}
                </span>
              </div>
              <button
                onClick={() => setIsEnquiryDrawerOpen(false)}
                className="w-6 h-6 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Compact Body without unnecessary scrolling */}
            <div className="flex-1 p-3.5 space-y-2.5 flex flex-col justify-start overflow-y-auto no-scrollbar">
              {/* Selected Stones List - Compact */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                    Selected Items ({enquiryItems.length})
                  </span>
                  {enquiryItems.length > 0 && (
                    <button
                      onClick={() => saveEnquiryItems([])}
                      className="text-[10px] text-neutral-400 hover:text-red-600 underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {enquiryItems.length === 0 ? (
                  <div className="p-4 border border-dashed border-neutral-300 text-center rounded-xs bg-neutral-50">
                    <p className="text-xs text-neutral-500 font-light">
                      No stones added yet. Browse catalog and click &quot;Add to Enquiry&quot;.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-28 overflow-y-auto pr-0.5 no-scrollbar">
                    {enquiryItems.map((stone) => (
                      <div
                        key={stone.id}
                        className="flex items-center justify-between p-1.5 border border-neutral-200 bg-neutral-50 rounded-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={stone.primaryImage}
                            alt={stone.name}
                            className="w-8 h-8 object-cover border border-neutral-200 rounded-2xs shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-neutral-800 truncate">
                              {stone.name}
                            </div>
                            <div className="text-[10px] text-neutral-500 font-light truncate">
                              {stone.country || 'Natural Stone'} • {stone.color || 'Standard'}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeEnquiryItem(stone.id)}
                          className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form & Verification Section - Ultra-Compact */}
              {enquiryItems.length > 0 && (
                <div className="border-t border-neutral-200 pt-2.5">
                  {verificationStep === 'form' && (
                    <form onSubmit={handleRequestVerification} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700">
                          Contact Details & Verification
                        </span>
                        <span className="text-[9px] text-[#C9A96E] font-medium uppercase tracking-wider">
                          Direct Stone Specialist Link
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Name */}
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-neutral-600 mb-0.5">
                            Full Name *
                          </label>
                          <div className="relative">
                            <User className="w-3 h-3 text-neutral-400 absolute left-2 top-2" />
                            <input
                              type="text"
                              required
                              value={enquiryName}
                              onChange={(e) => setEnquiryName(e.target.value)}
                              placeholder="John Doe"
                              className="w-full pl-6 pr-2 h-7 text-xs border border-neutral-300 focus:outline-none focus:border-neutral-800 rounded-none"
                            />
                          </div>
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-neutral-600 mb-0.5">
                            Phone / WhatsApp *
                          </label>
                          <div className="relative">
                            <Phone className="w-3 h-3 text-neutral-400 absolute left-2 top-2" />
                            <input
                              type="tel"
                              required
                              value={enquiryPhone}
                              onChange={(e) => setEnquiryPhone(e.target.value)}
                              placeholder="+971 50 123 4567"
                              className="w-full pl-6 pr-2 h-7 text-xs border border-neutral-300 focus:outline-none focus:border-neutral-800 rounded-none"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div className="col-span-2">
                          <label className="block text-[10px] uppercase font-semibold text-neutral-600 mb-0.5">
                            Email Address *
                          </label>
                          <div className="relative">
                            <Mail className="w-3 h-3 text-neutral-400 absolute left-2 top-2" />
                            <input
                              type="email"
                              required
                              value={enquiryEmail}
                              onChange={(e) => setEnquiryEmail(e.target.value)}
                              placeholder="client@domain.ae"
                              className="w-full pl-6 pr-2 h-7 text-xs border border-neutral-300 focus:outline-none focus:border-neutral-800 rounded-none"
                            />
                          </div>
                        </div>

                        {/* Project Scope / Quantity */}
                        <div className="col-span-2">
                          <label className="block text-[10px] uppercase font-semibold text-neutral-600 mb-0.5">
                            Project Scope & Quantity (Optional)
                          </label>
                          <input
                            type="text"
                            value={enquiryNotes}
                            onChange={(e) => setEnquiryNotes(e.target.value)}
                            placeholder="E.g., 250 sqm flooring for luxury villa in Abu Dhabi"
                            className="w-full px-2 h-7 text-xs border border-neutral-300 focus:outline-none focus:border-neutral-800 rounded-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full h-8 mt-1.5 bg-neutral-900 hover:bg-[#C9A96E] hover:text-neutral-950 text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verify & Submit Enquiry</span>
                      </button>
                    </form>
                  )}

                  {verificationStep === 'verify' && (
                    <form onSubmit={handleConfirmAndSubmit} className="space-y-2">
                      <div className="p-2 bg-amber-50 border border-amber-200 rounded-2xs">
                        <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-xs mb-0.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#C9A96E]" />
                          <span>Verification Code Sent</span>
                        </div>
                        <p className="text-[10px] text-amber-800 leading-snug font-light">
                          We sent a 4-digit code to <strong>{enquiryPhone}</strong> and{' '}
                          <strong>{enquiryEmail}</strong>. Enter code below:
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
                          className="w-full text-center tracking-[0.3em] font-mono text-base h-8 border border-neutral-300 focus:outline-none focus:border-neutral-800 rounded-none"
                        />
                        {otpError && (
                          <p className="text-red-600 text-[10px] mt-0.5 font-medium">{otpError}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setVerificationStep('form')}
                          className="w-1/3 h-8 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 h-8 bg-[#C9A96E] hover:bg-[#b5955b] text-neutral-950 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSubmitting ? 'Submitting...' : 'Confirm & Send'}</span>
                        </button>
                      </div>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const newCode = Math.floor(1000 + Math.random() * 9000).toString();
                            setGeneratedOtp(newCode);
                            toast.info(`New verification code sent: ${newCode}`, { duration: 10000 });
                          }}
                          className="text-[10px] text-neutral-500 hover:text-black underline cursor-pointer"
                        >
                          Didn&apos;t receive code? Resend PIN
                        </button>
                      </div>
                    </form>
                  )}

                  {verificationStep === 'success' && (
                    <div className="p-4 text-center space-y-2.5">
                      <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-5 h-5" />
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-wide text-neutral-900">
                        Inquiry Received & Verified!
                      </h4>
                      <p className="text-[11px] text-neutral-600 leading-snug font-light">
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
          </div>
        </div>
      )}
    </div>
  );
}
