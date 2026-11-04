import {
  getCommerceId,
  normalizeCommerceProduct,
  resolveCommercePrice,
  type CommerceRecord,
} from "@/lib/commerce/product-normalization";
import {
  getPeekeeperProduct,
  type PeekeeperProduct,
  type Variant,
  type ProductOption,
} from "@/lib/peekeeper-shop-data";

export const PEEKEEPER_CANONICAL_COLORS = [
  {
    value: "walnut",
    label: "Walnut",
    fabric: "100% Cotton Flannel",
    hex: "#8B6914",
    image: "/images/products/walnut.jpg",
  },
  {
    value: "pink-begonia",
    label: "Pink Begonia",
    fabric: "100% Cotton Flannel",
    hex: "#F0A0B8",
    image: "/images/products/pink-begonia.jpg",
  },
  {
    value: "peri-blue",
    label: "Periwinkle Blue",
    fabric: "100% Cotton Flannel",
    hex: "#8090C8",
    image: "/images/products/peri-blue.jpg",
  },
  {
    value: "lilac",
    label: "Lavender (Lilac)",
    fabric: "100% Long Staple Cotton",
    hex: "#C8A0D0",
    image: "/images/products/lilac.jpg",
  },
  {
    value: "hot-pink",
    label: "Hot Pink",
    fabric: "100% Cotton Flannel",
    hex: "#FF5070",
    image: "/images/products/hot-pink.jpg",
  },
  {
    value: "fire-red",
    label: "Fire Engine Red",
    fabric: "100% Cotton Flannel",
    hex: "#C82020",
    image: "/images/products/fire-red.jpg",
  },
  {
    value: "denim",
    label: "Denim Blue",
    fabric: "100% Cotton Denim",
    hex: "#4878A8",
    image: "/images/products/denim.jpg",
  },
] as const;

export const PEEKEEPER_CANONICAL_SIZES = [
  {
    value: "xs",
    label: '(XS 10") Waist 9"-12", Length 10"-12"',
    note: "Extra Small",
  },
  {
    value: "sm",
    label: '(SM 12") Waist 13"-16", Length 12"-16"',
    note: "Small",
  },
  {
    value: "med",
    label: '(MED 14") Waist 17"-21", Length 14"-18"',
    note: "Medium",
  },
] as const;

const COLOR_MAP: Record<string, (typeof PEEKEEPER_CANONICAL_COLORS)[number]> = {};
PEEKEEPER_CANONICAL_COLORS.forEach((c) => {
  COLOR_MAP[c.value] = c;
});

function record(value: unknown): CommerceRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as CommerceRecord)
    : {};
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function key(value: unknown): string {
  return text(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function sizeKey(value: unknown): string {
  const normalized = key(value);
  if (normalized.startsWith("xs") || normalized.includes("extra-small") || normalized.includes("x-small")) return "xs";
  if (normalized.startsWith("sm") || normalized.includes("small")) return "sm";
  if (normalized.startsWith("med") || normalized.includes("medium")) return "med";
  return normalized;
}

export function colorKey(value: unknown): string {
  const normalized = key(value);
  if (normalized.includes("walnut")) return "walnut";
  if (normalized.includes("begonia") || normalized.includes("pink-begonia")) return "pink-begonia";
  if (normalized.includes("peri") || normalized.includes("periwinkle")) return "peri-blue";
  if (normalized.includes("lilac") || normalized.includes("lavender")) return "lilac";
  if (normalized.includes("hot-pink") || (normalized.includes("hot") && normalized.includes("pink"))) return "hot-pink";
  if (normalized.includes("fire") || normalized.includes("red")) return "fire-red";
  if (normalized.includes("denim")) return "denim";
  return normalized;
}

function selectedValue(options: CommerceRecord, name: string): string {
  const entry = Object.entries(options).find(([option]) =>
    key(option).includes(name),
  );
  return entry ? text(entry[1]) : "";
}

export function mapCommerceProductToPeekeeper(
  source: CommerceRecord,
): PeekeeperProduct {
  const fallback = getPeekeeperProduct();
  const product = normalizeCommerceProduct(source);
  const slug = text(product.slug || source.slug);
  const isFlagship = slug === "peekeeper";

  // Gallery and Images
  const rawGallery = Array.isArray(product.gallery) ? product.gallery : [];
  const galleryImageUrls: string[] = rawGallery
    .map((item: any) => (typeof item === "string" ? item : text(item?.url || item?.src)))
    .filter(Boolean);

  if (!galleryImageUrls.length) {
    const directImage = [
      product.image,
      product.imageUrl,
      product.thumbnail,
      (product as any).primaryImageUrl,
    ]
      .map(text)
      .find(Boolean);
    if (directImage) galleryImageUrls.push(directImage);
  }

  if (!galleryImageUrls.length && Array.isArray(product.variants)) {
    for (const v of product.variants as any[]) {
      const vImg = text(v?.imageId || v?.image || v?.imageUrl);
      if (vImg && (vImg.startsWith("/") || vImg.startsWith("http"))) {
        if (!galleryImageUrls.includes(vImg)) galleryImageUrls.push(vImg);
      }
    }
  }

  const thumbnails = galleryImageUrls.length
    ? galleryImageUrls
    : isFlagship
    ? PEEKEEPER_CANONICAL_COLORS.map((c) => c.image)
    : ["/placeholder.png"];

  let mainImage = thumbnails[0];
  if (product.primaryImageId && rawGallery.length) {
    const primary = rawGallery.find((g: any) => text(g?.id) === text(product.primaryImageId));
    if (primary && text(primary.url)) {
      mainImage = text(primary.url);
    }
  }

  // Price & Currency
  const resolvedPrice = resolveCommercePrice(product);
  const price =
    Number.isFinite(Number(product.price)) && Number(product.price) >= 0
      ? Number(product.price)
      : resolvedPrice;
  const currency = text(product.currency || (product.pricing as any)?.currency) || "USD";

  // Title, Subtitle, Description
  const title = text(product.name || product.title) || (isFlagship ? fallback.title : "Product");
  const subtitle = text(product.subtitle) || (isFlagship ? fallback.subtitle : "");
  const description = text(product.description) || (isFlagship ? fallback.description : "");

  // Options & Variants
  const rawOptions = Array.isArray(product.options) ? (product.options as ProductOption[]) : [];
  const rawVariants = Array.isArray(product.variants) ? (product.variants as any[]).map(record) : [];
  const hasOptions = rawOptions.length > 0;

  let variants: Variant[] = [];
  let colorOptions: PeekeeperProduct["colorOptions"] = [];
  let sizeOptions: PeekeeperProduct["sizeOptions"] = [];

  if (isFlagship) {
    variants = rawVariants.map((variant, index) => {
      const selectedOptions = record(variant.optionValues) as Record<string, string>;
      const rawSize = selectedValue(selectedOptions, "size") || variant.size || variant.title;
      const rawColor = selectedValue(selectedOptions, "color") || variant.color;
      const normalizedColor = colorKey(rawColor) || "walnut";
      const normalizedSize = sizeKey(rawSize) || "xs";
      const canonColor = COLOR_MAP[normalizedColor] || COLOR_MAP.walnut;
      const canonSize = PEEKEEPER_CANONICAL_SIZES.find((s) => s.value === normalizedSize) || PEEKEEPER_CANONICAL_SIZES[0];

      const image = text(variant.imageId || variant.image || variant.imageUrl);
      const validImage = image.startsWith("/") || image.startsWith("http")
        ? image
        : canonColor.image;

      return {
        id: getCommerceId(variant) || text(variant.sku) || `variant-${index}`,
        sku: text(variant.sku) || `PK-${normalizedSize.toUpperCase()}-${normalizedColor.toUpperCase()}`,
        price: Number.isFinite(Number(variant.price)) ? Number(variant.price) : price,
        size: normalizedSize,
        color: normalizedColor,
        colorLabel: canonColor.label,
        hex: text(variant.hex) || canonColor.hex,
        image: validImage,
        stock: Math.max(0, Number(variant.stock ?? 15)),
        selectedOptions: {
          size: canonSize.label,
          color: canonColor.label,
        },
        optionValues: selectedOptions,
      };
    });

    const dbColorOption = rawOptions.find((o) => key(o.key || o.label).includes("color"));
    const dbColorValues = dbColorOption?.values?.length ? dbColorOption.values : null;

    if (dbColorValues && dbColorValues.length > 0) {
      colorOptions = dbColorValues.map((colorName: string) => {
        const valStr = text(colorName);
        const nKey = colorKey(valStr);
        const canon = COLOR_MAP[nKey];
        const matchingVariants = variants.filter(
          (v) => v.color === nKey || key(v.colorLabel).includes(key(valStr)) || key(v.color).includes(key(valStr))
        );
        const totalStock = matchingVariants.reduce((sum, v) => sum + v.stock, 0);
        const firstVariantWithImg = matchingVariants.find((v) => v.image && !v.image.includes('placeholder'));

        return {
          value: nKey || valStr,
          label: valStr,
          hex: canon?.hex || (firstVariantWithImg as any)?.hex || "#8B6914",
          image: firstVariantWithImg?.image || canon?.image || mainImage,
          stock: totalStock > 0 ? totalStock : (matchingVariants.length > 0 ? 15 : 0),
        };
      });
    } else {
      colorOptions = PEEKEEPER_CANONICAL_COLORS.map((canon) => {
        const matchingVariants = variants.filter((v) => v.color === canon.value);
        const totalStock = matchingVariants.reduce((sum, v) => sum + v.stock, 0);
        return {
          value: canon.value,
          label: canon.label,
          hex: canon.hex,
          image: canon.image,
          stock: totalStock > 0 ? totalStock : 25,
        };
      });
    }

    const dbSizeOption = rawOptions.find((o) => key(o.key || o.label).includes("size"));
    const dbSizeValues = dbSizeOption?.values?.length ? dbSizeOption.values : null;

    if (dbSizeValues && dbSizeValues.length > 0) {
      sizeOptions = dbSizeValues.map((sizeName: string) => {
        const valStr = text(sizeName);
        const nKey = sizeKey(valStr);
        const canon = PEEKEEPER_CANONICAL_SIZES.find((s) => s.value === nKey);
        const matchingVariants = variants.filter(
          (v) => v.size === nKey || key(v.selectedOptions?.size).includes(key(valStr))
        );
        const totalStock = matchingVariants.reduce((sum, v) => sum + v.stock, 0);
        const note = canon?.note || (nKey === 'xs' ? 'Extra Small' : nKey === 'sm' ? 'Small' : nKey === 'med' ? 'Medium' : valStr);

        return {
          value: nKey || valStr,
          label: valStr,
          note,
          stock: totalStock > 0 ? totalStock : (matchingVariants.length > 0 ? 20 : 0),
        };
      });
    } else {
      sizeOptions = PEEKEEPER_CANONICAL_SIZES.map((canon) => {
        const matchingVariants = variants.filter((v) => v.size === canon.value);
        const totalStock = matchingVariants.reduce((sum, v) => sum + v.stock, 0);
        return {
          value: canon.value,
          label: canon.label,
          note: canon.note,
          stock: totalStock > 0 ? totalStock : 45,
        };
      });
    }
  } else {
    // Dynamic products
    variants = rawVariants.map((variant, index) => {
      const optVals = { ...(record(variant.optionValues) as Record<string, string>) };
      const rawTitle = text(variant.title);
      if (Object.keys(optVals).length === 0 && rawTitle && rawTitle.includes(":")) {
        rawTitle.split("/").forEach((part: string) => {
          const [k, ...vParts] = part.split(":");
          if (k && vParts.length) {
            optVals[k.trim().toLowerCase()] = vParts.join(":").trim();
          }
        });
      }
      const image = text(variant.imageId || variant.image || variant.imageUrl);
      const variantPrice = Number(variant.price);
      return {
        id: getCommerceId(variant) || text(variant.sku) || `variant-${index}`,
        sku: text(variant.sku) || text(product.sku) || `SKU-${index + 1}`,
        price: Number.isFinite(variantPrice) && variantPrice > 0 ? variantPrice : price,
        size: text(variant.size) || selectedValue(optVals, "size") || "",
        color: text(variant.color) || selectedValue(optVals, "color") || "",
        image: image || mainImage,
        stock: Math.max(0, Number(variant.stock ?? 0)),
        selectedOptions: optVals,
        optionValues: optVals,
      };
    });

    // Check if options contains color or size
    const colorOpt = rawOptions.find((o: any) => key(o.key || o.label).includes("color"));
    if (colorOpt && Array.isArray(colorOpt.values)) {
      colorOptions = colorOpt.values.map((val: string) => {
        const valStr = text(val);
        const nKey = colorKey(valStr);
        const canon = COLOR_MAP[nKey];
        return {
          value: valStr,
          label: valStr,
          hex: canon?.hex || "#4A5568",
          image: canon?.image || mainImage,
          stock: 10,
        };
      });
    }

    const sizeOpt = rawOptions.find((o: any) => key(o.key || o.label).includes("size"));
    if (sizeOpt && Array.isArray(sizeOpt.values)) {
      sizeOptions = sizeOpt.values.map((val: string) => {
        const valStr = text(val);
        return {
          value: valStr,
          label: valStr,
          note: valStr,
          stock: 10,
        };
      });
    }
  }

  // Synthesize options from variants if product.options is empty
  let effectiveOptions: ProductOption[] = [...rawOptions];
  if (effectiveOptions.length === 0 && variants.length > 0) {
    const synthMap: Record<string, Set<string>> = {};
    for (const v of variants) {
      for (const [k, val] of Object.entries(v.optionValues || {})) {
        const optKey = k.trim().toLowerCase();
        if (!synthMap[optKey]) synthMap[optKey] = new Set();
        if (val) synthMap[optKey].add(String(val).trim());
      }
    }
    effectiveOptions = Object.entries(synthMap).map(([k, setVals]) => ({
      key: k,
      label: k.charAt(0).toUpperCase() + k.slice(1),
      values: Array.from(setVals),
      selectedValues: Array.from(setVals),
      useForVariants: true,
    }));
  }

  const effectiveHasOptions = effectiveOptions.length > 0;
  const firstVariantPrice = variants[0]?.price;
  const effectivePrice: number = price > 0
    ? price
    : typeof firstVariantPrice === "number" && firstVariantPrice > 0
    ? firstVariantPrice
    : 0;

  // Details tabs
  const detailsTabs = Array.isArray(product.detailsTabs) && product.detailsTabs.length
    ? product.detailsTabs
    : isFlagship
    ? fallback.detailsTabs
    : [{ key: "description", label: "Description", content: description }];

  const trackQuantity = (product.pricing as any)?.trackQuantity ?? false;
  const totalVariantStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  const inventory = variants.length ? totalVariantStock : Math.max(0, Number(product.stock ?? 0));

  return {
    ...fallback,
    id: getCommerceId(product) || fallback.id,
    slug: text(product.slug) || slug,
    sku: text(product.sku),
    title,
    subtitle,
    price: effectivePrice,
    currency,
    mainImage,
    thumbnails,
    description,
    detailsTabs,
    sizeOptions,
    colorOptions,
    variants: variants.length ? variants : (isFlagship ? fallback.variants : []),
    inventory,
    isFlagshipDiaper: isFlagship,
    hasOptions: effectiveHasOptions,
    options: effectiveOptions,
    primaryCategoryId: text(product.primaryCategoryId || (product.categoryIds as string[])?.[0]),
    categoryName: text((product as any).categoryName || (product as any).category),
    productAttributes: Array.isArray((product as any).productAttributes) ? (product as any).productAttributes : [],
    hasNetBag: isFlagship,
    hasSizeGuide: isFlagship || Boolean(product.sizeGuide && (product.sizeGuide as any).table?.length),
    trackQuantity,
    rating: (product as any).rating !== undefined && (product as any).rating !== null ? Number((product as any).rating) : 0,
    reviewCount: (product as any).reviewCount !== undefined && (product as any).reviewCount !== null ? Number((product as any).reviewCount) : 0,
    reviews: Array.isArray((product as any).reviews) ? (product as any).reviews : [],
    reviewSummary: (product as any).reviewSummary && (product as any).reviewSummary.total > 0
      ? (product as any).reviewSummary
      : { average: Number((product as any).rating || 0), total: Number((product as any).reviewCount || 0), distribution: [] },
  };
}
