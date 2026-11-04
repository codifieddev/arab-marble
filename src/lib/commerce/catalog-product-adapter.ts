import {
  getCommerceId,
  normalizeCommerceProduct,
  type CommerceRecord,
} from "./product-normalization";

export interface CatalogProductOption {
  key: string;
  label: string;
  values: string[];
}

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  summary?: string;
  category?: string;
  categoryId?: string;
  categorySlug?: string;
  primaryImage: string;
  gallery: Array<{ id?: string; url: string; alt?: string } | string>;
  allImages: string[];
  // Stone specifications
  color: string;
  country: string;
  sizes: string[];
  finish: string;
  material?: string;
  // Raw options & attributes
  options: CatalogProductOption[];
  attributes: Record<string, string>;
  isFeatured?: boolean;
  status: string;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function mapCommerceProductToCatalog(source: CommerceRecord): CatalogProduct {
  const norm = normalizeCommerceProduct(source);
  const id = getCommerceId(source) || text(norm.id || source.id);
  const name = text(norm.name || source.name || norm.title || source.title) || "Natural Stone";
  const slug = text(norm.slug || source.slug) || id;
  const description = text(norm.description || source.description);
  const summary = text(norm.summary || source.summary);

  // Gallery
  const rawGallery = Array.isArray(norm.gallery) ? norm.gallery : Array.isArray(source.gallery) ? source.gallery : [];
  const galleryImageUrls: string[] = [];

  for (const item of rawGallery) {
    if (typeof item === "string" && item.trim()) {
      galleryImageUrls.push(item.trim());
    } else if (item && typeof item === "object") {
      const url = text((item as any).url || (item as any).src || (item as any).imageUrl);
      if (url) galleryImageUrls.push(url);
    }
  }

  // Check direct images if gallery was empty
  if (!galleryImageUrls.length) {
    const directImage = [
      norm.image,
      norm.imageUrl,
      norm.thumbnail,
      (norm as any).primaryImageUrl,
      source.image,
      source.imageUrl,
      source.thumbnail,
    ]
      .map(text)
      .find(Boolean);
    if (directImage) galleryImageUrls.push(directImage);
  }

  // Primary image
  let primaryImage = galleryImageUrls[0] || "/images/products/placeholder.jpg";
  if (norm.primaryImageId && rawGallery.length) {
    const primary = rawGallery.find((g: any) => text(g?.id) === text(norm.primaryImageId));
    if (primary && text(primary.url)) {
      primaryImage = text(primary.url);
    }
  }

  // Parse Options
  const rawOptions = Array.isArray(norm.options)
    ? norm.options
    : Array.isArray(source.options)
    ? source.options
    : [];

  const options: CatalogProductOption[] = [];
  for (const opt of rawOptions) {
    if (!opt) continue;
    const key = text(opt.key || opt.name || opt.label);
    const label = text(opt.label || opt.name || opt.key);
    const values: string[] = Array.isArray(opt.selectedValues)
      ? opt.selectedValues.map(text).filter(Boolean)
      : Array.isArray(opt.values)
      ? opt.values.map(text).filter(Boolean)
      : [];
    if (key || label) {
      options.push({ key: key.toLowerCase(), label, values });
    }
  }

  // Parse ProductAttributes
  const attributes: Record<string, string> = {};
  const rawAttrs = norm.productAttributes || source.productAttributes || source.attributes;
  if (rawAttrs && typeof rawAttrs === "object" && !Array.isArray(rawAttrs)) {
    for (const [k, v] of Object.entries(rawAttrs)) {
      if (v !== undefined && v !== null) {
        attributes[k] = text(v);
      }
    }
  }

  // Helper to extract a spec from options or attributes
  const findSpec = (patterns: RegExp[]): string => {
    // 1. Check attributes
    for (const [k, v] of Object.entries(attributes)) {
      if (patterns.some((p) => p.test(k)) && v) return v;
    }
    // 2. Check options
    for (const opt of options) {
      if (patterns.some((p) => p.test(opt.key) || p.test(opt.label))) {
        if (opt.values.length > 0) return opt.values[0];
      }
    }
    return "";
  };

  const findSpecArray = (patterns: RegExp[]): string[] => {
    for (const opt of options) {
      if (patterns.some((p) => p.test(opt.key) || p.test(opt.label))) {
        if (opt.values.length > 0) return opt.values;
      }
    }
    for (const [k, v] of Object.entries(attributes)) {
      if (patterns.some((p) => p.test(k)) && v) {
        return v.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const color = findSpec([/colou?r/i]) || "Natural";
  const country = findSpec([/country/i, /origin/i]) || "Imported";
  const finish = findSpec([/finish/i, /surface/i]) || "Polished / Honed";
  const sizes = findSpecArray([/size/i, /dimension/i]);

  // Category
  let category = "";
  let categoryId = "";
  let categorySlug = "";
  if (typeof source.category === "string") {
    categoryId = source.category;
    category = source.category;
  } else if (source.category && typeof source.category === "object") {
    const catObj = source.category as any;
    categoryId = text(catObj._id || catObj.id);
    category = text(catObj.name || catObj.title);
    categorySlug = text(catObj.slug);
  }

  return {
    id,
    name,
    slug,
    description,
    summary,
    category,
    categoryId,
    categorySlug,
    primaryImage,
    gallery: rawGallery,
    allImages: galleryImageUrls.length ? galleryImageUrls : [primaryImage],
    color,
    country,
    sizes: sizes.length ? sizes : ["Slabs (20mm / 30mm)", "Tiles 600x600mm", "Cut-to-size"],
    finish,
    options,
    attributes,
    isFeatured: Boolean(source.isFeatured || norm.isFeatured),
    status: text(source.status || norm.status) || "active",
  };
}

export function extractFacetOptions(products: CatalogProduct[]): {
  colors: string[];
  countries: string[];
  sizes: string[];
} {
  const colorSet = new Set<string>();
  const countrySet = new Set<string>();
  const sizeSet = new Set<string>();

  for (const p of products) {
    if (p.color && p.color !== "Natural") colorSet.add(p.color);
    if (p.country && p.country !== "Imported") countrySet.add(p.country);
    for (const s of p.sizes) {
      if (s) sizeSet.add(s);
    }
  }

  return {
    colors: Array.from(colorSet).sort(),
    countries: Array.from(countrySet).sort(),
    sizes: Array.from(sizeSet).sort(),
  };
}

export function filterCatalogProducts(
  products: CatalogProduct[],
  filters: { color?: string; country?: string; size?: string }
): CatalogProduct[] {
  return products.filter((p) => {
    if (filters.color && filters.color !== "all") {
      if (p.color.toLowerCase() !== filters.color.toLowerCase()) return false;
    }
    if (filters.country && filters.country !== "all") {
      if (p.country.toLowerCase() !== filters.country.toLowerCase()) return false;
    }
    if (filters.size && filters.size !== "all") {
      const match = p.sizes.some((s) => s.toLowerCase().includes(filters.size!.toLowerCase()));
      if (!match) return false;
    }
    return true;
  });
}
