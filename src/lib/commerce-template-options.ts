export type ProductTemplateKey =
  | "product-split"
  | "product-centered"
  | "product-showcase"
  | "product-minimal";

export type CategoryTemplateKey =
  | "category-sidebar"
  | "category-topbar"
  | "category-masonry";

type CategoryType = "product" | "portfolio" | "blog";

export const PRODUCT_TEMPLATE_OPTIONS: Array<{
  key: ProductTemplateKey;
  label: string;
  description: string;
}> = [
  { key: "product-split", label: "Split Classic", description: "Two-column product detail with sticky gallery and buy panel." },
  { key: "product-centered", label: "Centered Focus", description: "Centered storytelling layout for premium highlights." },
  { key: "product-showcase", label: "Showcase Grid", description: "Visual-first layout with merchandising highlights." },
  { key: "product-minimal", label: "Minimal Clean", description: "A clean, typography-focused layout with distraction-free checkout." },
];

export const CATEGORY_TEMPLATE_OPTIONS: Array<{
  key: CategoryTemplateKey;
  label: string;
  description: string;
}> = [
  { key: "category-sidebar", label: "Sidebar Filters", description: "Left filter rail with responsive product grid." },
  { key: "category-topbar", label: "Topbar Filters", description: "Compact top controls with wide listing area." },
  { key: "category-masonry", label: "Masonry Explorer", description: "Visual masonry cards for content-rich collections." },
];

export function normalizeProductTemplateKey(value: unknown, fallback: ProductTemplateKey = "product-split"): ProductTemplateKey {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  const validKeys = PRODUCT_TEMPLATE_OPTIONS.map((o) => o.key);
  return validKeys.includes(normalized as ProductTemplateKey) ? normalized as ProductTemplateKey : fallback;
}

export function normalizeCategoryTemplateKey(value: unknown, fallback: CategoryTemplateKey = "category-sidebar"): CategoryTemplateKey {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  const validKeys = CATEGORY_TEMPLATE_OPTIONS.map((o) => o.key);
  return validKeys.includes(normalized as CategoryTemplateKey) ? normalized as CategoryTemplateKey : fallback;
}

export function defaultCategoryTemplateForType(type: CategoryType): CategoryTemplateKey {
  if (type === "portfolio") return "category-masonry";
  if (type === "blog") return "category-topbar";
  return "category-sidebar";
}
