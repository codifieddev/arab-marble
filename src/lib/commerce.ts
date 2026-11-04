export interface ProductOption {
  label: string;
  values: string[];
  useForVariants?: boolean;
  key?: string;
  attributeSetId?: string;
}

export interface VariantRow {
  key: string;
  title: string;
  options: Record<string, string>;
  sku: string;
  price: number;
  stock: number;
  compareAtPrice: number;
  cost: number;
  imageId?: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  alt?: string;
}

export function generateVariantsFromOptions(
  currentOptions: ProductOption[],
  existingVariants: VariantRow[],
  baseSku: string,
  basePrice: number
): VariantRow[] {
  const variantOptions = currentOptions.filter(opt => opt.useForVariants !== false);
  if (variantOptions.length === 0) return [];

  const recurse = (index: number, current: Record<string, string>): any[] => {
    if (index === variantOptions.length) return [current];
    const option = variantOptions[index];
    let results: any[] = [];
    for (const val of option.values) {
      results = results.concat(recurse(index + 1, { ...current, [option.label]: val }));
    }
    return results;
  };

  const combinations = recurse(0, {});

  return combinations.map((combo, idx) => {
    const title = Object.values(combo).join(" / ");
    const key = Object.entries(combo).map(([k, v]) => `${k}:${v}`).join("|");
    const existing = existingVariants.find(v => v.key === key);
    return {
      key,
      title,
      options: combo,
      sku: existing?.sku || `${baseSku || "SKU"}-${idx + 1}`,
      price: existing?.price || basePrice,
      stock: existing?.stock || 0,
      compareAtPrice: existing?.compareAtPrice || 0,
      cost: existing?.cost || 0,
      imageId: existing?.imageId || ""
    };
  });
}
