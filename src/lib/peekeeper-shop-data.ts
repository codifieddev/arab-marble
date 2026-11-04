export type ProductOption = {
  key: string;
  label: string;
  values: string[];
  selectedValues?: string[];
  useForVariants?: boolean;
};

export type Variant = {
  id: string;
  sku?: string;
  price?: number;
  size: string;
  color: string;
  colorLabel?: string;
  hex?: string;
  image?: string;
  stock: number;
  selectedOptions?: Record<string, string>;
  optionValues?: Record<string, string>;
};

export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  rowSpan?: number;
};

export type Review = {
  id: string;
  name: string;
  date: string;
  title: string;
  text: string;
  stars: number;
  image?: string;
  helpful: number;
  notHelpful: number;
  verified?: boolean;
  withImages?: boolean;
  reply?: string;
};

export type PeekeeperProduct = {
  id: string;
  slug: string;
  sku?: string;
  title: string;
  subtitle: string;
  price: number;
  currency?: string;
  mainImage: string;
  thumbnails: string[];
  description: string;
  detailsTabs?: Array<{ key?: string; label?: string; content?: string }>;
  sizeOptions: { value: string; label: string; note: string; stock: number }[];
  colorOptions: { value: string; label: string; hex: string; image: string; stock: number }[];
  variants: Variant[];
  inventory: number;
  payPalText: string;
  rating: number | string;
  reviewCount: number | string;
  starColor?: string;
  emptyStarColor?: string;
  reviewSummary: {
    average: number;
    total: number;
    distribution: { stars: number; count: number }[];
  };
  netBag: {
    title: string;
    price: number;
    description: string;
    image: string;
  };
  sizeGuide: {
    intro: string;
    image: string;
    table: Array<[string, string, string, string]>;
  };
  cards: Array<{
    title: string;
    text: string;
  }>;
  gallery: GalleryImage[];
  reviews: Review[];

  // Dynamic extension fields for real products
  isFlagshipDiaper?: boolean;
  hasOptions?: boolean;
  options?: ProductOption[];
  primaryCategoryId?: string;
  categoryName?: string;
  productAttributes?: Array<{
    attributeId?: string;
    name?: string;
    label?: string;
    value?: string;
    values?: string[];
    [key: string]: any;
  }>;
  hasNetBag?: boolean;
  hasSizeGuide?: boolean;
  trackQuantity?: boolean;
};

type SizeGuideRow = [string, string, string, string];

import productData from './peekeeper-shop-data.json';

const sizeGuideTable: SizeGuideRow[] = productData.sizeGuide.table.map((row): SizeGuideRow => {
  if (row.length !== 4) {
    throw new Error('Each size guide row must have exactly 4 columns.');
  }

  const [size, waist, length, weight] = row;
  return [size, waist, length, weight];
});

const product: PeekeeperProduct = {
  ...productData,
  sizeGuide: {
    ...productData.sizeGuide,
    table: sizeGuideTable,
  },
};

declare global {
  // eslint-disable-next-line no-var
  var __peekeeperLegacyStore: {
    product: PeekeeperProduct;
    galleryCursor: number;
    reviewCursor: number;
    submittedReviews: Review[];
  } | undefined;
}

const store =
  globalThis.__peekeeperLegacyStore ||
  (globalThis.__peekeeperLegacyStore = {
    product,
    galleryCursor: 0,
    reviewCursor: 0,
    submittedReviews: [],
  });

store.product = product;

export function getPeekeeperProduct() {
  return store.product;
}

export function getPeekeeperGallery(limit = 3, offset = 0) {
  return store.product.gallery.slice(offset, offset + limit);
}

export function getPeekeeperReviews(limit = 4, offset = 0, filter?: string) {
  const source = [...store.submittedReviews, ...store.product.reviews];
  const filtered = filter === 'with-images'
    ? source.filter((review) => review.withImages || review.image)
    : filter === 'verified'
      ? source.filter((review) => review.verified)
      : source;

  return {
    items: filtered.slice(offset, offset + limit),
    total: filtered.length,
    nextOffset: Math.min(offset + limit, filtered.length),
    hasMore: offset + limit < filtered.length,
  };
}

export function addPeekeeperReview(review: Omit<Review, 'id'>) {
  const next: Review = {
    ...review,
    id: `submitted-${Date.now()}`,
  };
  store.submittedReviews.unshift(next);
  return next;
}

export function getVariantBySelection(size: string, color: string) {
  return store.product.variants.find(
    (variant) => variant.size.toLowerCase() === size.toLowerCase() && variant.color.toLowerCase() === color.toLowerCase(),
  ) || null;
}
