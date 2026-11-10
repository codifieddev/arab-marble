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

  // Map server-filtered redux products
  const productsList: CatalogProduct[] = useMemo(() => {
    if (reduxProducts && reduxProducts.length > 0) {
      return (reduxProducts as any[]).map(mapCommerceProductToCatalog);
    }
    return filterCatalogProducts(DEFAULT_STONES, {
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

      {/* Filter Bar: All Colors, All Countries, All Sizes */}
      <div className="border-b border-neutral-200 bg-neutral-50/80 py-4">
        <div className="max-w-[1240px] mx-auto px-6 flex flex-wrap items-center gap-4 text-xs font-light text-neutral-700">
          {/* Colors Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedColor}
              onChange={(e) => {
                handleFilterChange('color', e.target.value);
                setVisibleCount(16);
              }}
              className="bg-white border border-neutral-300 px-3 py-2 rounded-none focus:outline-none focus:border-neutral-500 cursor-pointer"
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
          <div className="flex items-center gap-2">
            <select
              value={selectedCountry}
              onChange={(e) => {
                handleFilterChange('country', e.target.value);
                setVisibleCount(16);
              }}
              className="bg-white border border-neutral-300 px-3 py-2 rounded-none focus:outline-none focus:border-neutral-500 cursor-pointer"
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
          <div className="flex items-center gap-2">
            <select
              value={selectedSize}
              onChange={(e) => {
                handleFilterChange('size', e.target.value);
                setVisibleCount(16);
              }}
              className="bg-white border border-neutral-300 px-3 py-2 rounded-none focus:outline-none focus:border-neutral-500 cursor-pointer"
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
              className="text-xs text-neutral-500 hover:text-black underline ml-2 cursor-pointer"
            >
              Reset Filters
            </button>
          )}

          <div className="ml-auto text-neutral-500 text-xs font-mono flex items-center gap-2">
            {isProductsLoading && (
              <span className="inline-block w-2 h-2 rounded-full bg-neutral-400 animate-ping" />
            )}
            {productsList.length} items
          </div>
        </div>
      </div>

      {/* 4-Column Catalog Grid with Edit Buttons */}
      <div className="max-w-[1240px] mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {visibleProducts.map((stone) => (
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
                  <span className="text-[11px] text-neutral-500 font-light block">
                    {stone.country}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-14 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 16)}
              className="px-8 py-2.5 border border-neutral-400 text-xs font-semibold uppercase tracking-widest text-neutral-700 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-colors cursor-pointer"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
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
            className="relative max-w-4xl max-h-[90vh] bg-white p-3 border border-neutral-700 shadow-2xl flex flex-col items-center cursor-default"
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
              className="max-h-[75vh] w-auto object-contain"
            />
            {lightboxTitle && (
              <div className="mt-3 text-sm font-medium tracking-wide text-neutral-800 uppercase">
                {lightboxTitle}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
