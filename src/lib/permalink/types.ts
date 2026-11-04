export type EntityType = 'product' | 'category' | 'cms_page' | 'shop' | 'blog' | 'admin';

export interface PermalinkConfig {
  permalinkStructure: string; // e.g. "/product", "product", "/shop", "/category", "/custom"
  shopBase: string; // e.g. "shop", "store", "catalog"
  productCategoryBase: string; // e.g. "product-category", "category"
  categoryBase: string;
  tagBase: string;
  productTagBase: string;
  productAttributeBase: string;
  productBrandBase: string;
  customStructureBase?: string;
}

export interface RedirectEntry {
  from: string; // source path (lowercase, no trailing slash), e.g. "/shop/old-leash"
  to: string;   // target path or canonical URL
  statusCode?: 301 | 302 | 307 | 308;
}

export type ResolutionStatus = 'match' | 'redirect' | 'not_found' | 'static';

export interface ResolvedPermalink {
  status: ResolutionStatus;
  type?: EntityType;
  entityId?: string;
  slug?: string;
  canonicalPath?: string; // Path without origin, including locale prefix if non-default (e.g. "/hi/product/peekeeper" or "/product/peekeeper")
  cleanPath?: string;     // Path without locale prefix (e.g. "/product/peekeeper")
  locale: string;
  redirectUrl?: string;   // Full or relative redirect destination
  statusCode?: 301 | 302 | 307 | 308;
  data?: any;
  alternateSlugs?: Record<string, string>; // Translated slugs per locale (e.g. { en: 'peekeeper', hi: 'peekeeper' })
}
