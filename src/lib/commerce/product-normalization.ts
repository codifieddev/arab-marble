import { formatCurrencyPrice } from '@/lib/currency/currency';
export type CommerceRecord = {
  [key: string]: unknown;
  id?: unknown;
  _id?: unknown;
  price?: unknown;
  unitPriceMinor?: unknown;
  compareAtPrice?: unknown;
  compareAtPriceMinor?: unknown;
  currency?: unknown;
  pricing?: {
    [key: string]: unknown;
    price?: unknown;
    compareAtPrice?: unknown;
    currency?: unknown;
  };
  gallery?: unknown;
  image?: unknown;
  imageUrl?: unknown;
  thumbnail?: unknown;
};

function finiteNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function getCommerceId(value: object | null | undefined): string {
  const product = (value || {}) as CommerceRecord;
  return String(product.id || product._id || "");
}

export function resolveCommercePrice(value: object): number {
  const product = value as CommerceRecord;
  const minor = finiteNumber(product.unitPriceMinor);
  if (minor !== null && Number.isInteger(minor) && minor >= 0) {
    return minor / 100;
  }

  const direct = finiteNumber(product.price);
  const nested = finiteNumber(product.pricing?.price);
  if (direct === 0 && nested !== null && nested > 0) return nested;
  if (direct !== null && direct >= 0) return direct;
  if (nested !== null && nested >= 0) return nested;
  return 0;
}

export function resolveCompareAtPrice(value: object): number | null {
  const product = value as CommerceRecord;
  const minor = finiteNumber(product.compareAtPriceMinor);
  const candidate =
    minor !== null && Number.isInteger(minor) && minor >= 0
      ? minor / 100
      : finiteNumber(product.pricing?.compareAtPrice ?? product.compareAtPrice);
  const current = resolveCommercePrice(product);
  return candidate !== null && candidate > current ? candidate : null;
}

export function resolveProductImage(
  value: object,
  fallback = "/placeholder.png",
): string {
  const product = value as CommerceRecord;
  const direct = [product.image, product.imageUrl, product.thumbnail]
    .find((item) => typeof item === "string" && item.trim());
  if (typeof direct === "string") return direct;

  const galleryUrl = Array.isArray(product.gallery)
    ? product.gallery.find(
        (item: CommerceRecord) => typeof item?.url === "string" && item.url,
      )?.url
    : undefined;
  return galleryUrl || fallback;
}

export function normalizeCommerceProduct<T extends object>(
  product: T,
): T {
  const source = product as CommerceRecord;
  const price = resolveCommercePrice(source);
  const compareAtPrice = resolveCompareAtPrice(source);
  const id = getCommerceId(source);

  return {
    ...product,
    ...(id ? { id } : {}),
    price,
    currency: source.currency || source.pricing?.currency || "USD",
    pricing: {
      ...(source.pricing || {}),
      price,
      compareAtPrice,
    },
  } as T;
}

export function formatCommercePrice(
  value: unknown,
  currency = "USD",
): string {
  const amount = Math.max(0, finiteNumber(value) ?? 0);
  return formatCurrencyPrice(amount, currency);
}

async function readProductResponse(response: Response): Promise<CommerceRecord> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.detail || body.message || body.error || "Product not found");
  }
  return body.data || body;
}

export async function fetchCommerceProduct(
  identifier: string,
): Promise<CommerceRecord> {
  const encoded = encodeURIComponent(identifier);
  let product: CommerceRecord | null = null;

  const slugResponse = await fetch(`/api/commerce/products/slug/${encoded}`, {
    credentials: "include",
    cache: "no-store",
  });

  if (slugResponse.ok) {
    product = await readProductResponse(slugResponse);
  } else {
    const detailResponse = await fetch(`/api/commerce/products/${encoded}`, {
      credentials: "include",
      cache: "no-store",
    });
    product = await readProductResponse(detailResponse);
  }

  const productId = getCommerceId(product);
  if (productId && !Array.isArray(product.variants)) {
    const detailResponse = await fetch(
      `/api/commerce/products/${encodeURIComponent(productId)}`,
      { credentials: "include", cache: "no-store" },
    );
    if (detailResponse.ok) {
      product = await readProductResponse(detailResponse);
    }
  }

  return normalizeCommerceProduct(product);
}
