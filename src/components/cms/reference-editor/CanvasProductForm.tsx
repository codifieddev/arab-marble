"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Type,
  Hash,
  Barcode,
  Boxes,
  AlignLeft,
  ImageIcon,
  FolderTree,
  Check,
  Save,
  Tag,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  SlidersHorizontal,
  WandSparkles,
  Search,
  IndianRupee,
  Link2,
  CheckCircle2,
  CircleAlert,
  X,
  Eye,
  Building2,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";
import { PRODUCT_TEMPLATE_OPTIONS } from "@/lib/commerce-template-options";
import {
  buildCombinationTitle,
  buildVariantCombinations,
  generateSKUWithBaseSKU,
  sanitizeKey,
  slugify,
} from "@/lib/admin-products/utils";
import { toast } from "sonner";
import { useAppSelector } from "@/lib/store/hooks";
import styles from "./canvas-product-form.module.css";

export interface ProductOption {
  attributeSetId?: string;
  values: string[];
  selectedValues: string[];
  useForVariants: boolean;
  label: string;
  key: string;
  draftValue?: string;
}

export interface Variant {
  id?: string;
  sku?: string;
  title?: string;
  price?: number;
  originalPrice?: number | null;
  currency?: string;
  stock?: number;
  attributeValues?: any[];
  compareAtPrice?: number;
  imageId?: string;
  optionValues?: {
    [key: string]: string;
  };
  status?: string;
}

export interface CategoryType {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  slug?: string;
}

const getMediaUrl = (url: string) => url || "";

const CanvasMediaLibraryModal = ({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: { url: string; alt?: string }) => void;
}) => {
  const [url, setUrl] = useState("");
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#12151b] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-400" />
            Add Image Asset
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Image URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://... or /images/..."
              className="w-full bg-[#171b23] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Or Upload Local Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result === "string") {
                      onSelect({ url: reader.result, alt: file.name });
                      onClose();
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white">Cancel</button>
            <button
              type="button"
              disabled={!url.trim()}
              onClick={() => {
                if (url.trim()) {
                  onSelect({ url: url.trim(), alt: "Product image" });
                  onClose();
                }
              }}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl disabled:opacity-50"
            >
              Add Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export interface CanvasProductFormProps {
  initialData?: any;
  allCategories?: CategoryType[];
  onSubmit: (data: any) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
}

type TabKey = "details" | "variants" | "pricing" | "organization" | "media" | "seo";

interface ProductFormState {
  name: string;
  slug: string;
  sku: string;
  description: string;
  status: "active" | "draft" | "archived";
  categoryIds: string[];
  primaryCategoryId: string;
  manufacturer: string;
  templateKey: string;
  attributeSetIds: string[];
  tags: string[];
  relatedProductIds: string[];
  metaTitle: string;
  metaDescription: string;
  detailsTabs: any[];
}

export default function CanvasProductForm({
  initialData,
  allCategories = [],
  onSubmit,
  onCancel,
  isLoading = false,
}: CanvasProductFormProps) {
  const allAttributes = useAppSelector((state: any) => state.attributes?.allAttributes || []);
  const productTypes = useAppSelector((state: any) => state.attributes?.productTypes || []);
  const allProducts = useAppSelector((state: any) => state.products?.allProducts || []);
  const allBrands: any[] = [];

  const isEditing = Boolean(initialData?.id || initialData?._id);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabKey>("details");

  // Product Type: "simple" | "variant" | "catalog"
  const rawType = (initialData?.type || "").toLowerCase();
  const normalizedType: "simple" | "variant" | "catalog" =
    rawType === "variable" ||
    rawType === "variant" ||
    (!rawType &&
      (initialData?.variants?.length > 1 ||
        initialData?.options?.length > 0 ||
        initialData?.isFlagshipDiaper))
      ? "variant"
      : rawType === "catalog" || rawType === "catalogue"
      ? "catalog"
      : "simple";

  const [productType, setProductType] = useState<"simple" | "variant" | "catalog">(
    normalizedType
  );

  const resolvedInitialName =
    initialData?.name || initialData?.title || "";
  const resolvedInitialSku =
    initialData?.sku === "—" ? "" : initialData?.sku || initialData?.slug || "";
  const resolvedInitialManufacturer =
    initialData?.manufacturer || "Arab Marble";
  const resolvedInitialDesc =
    initialData?.description || "";
  const resolvedInitialTags =
    Array.isArray(initialData?.tags) && initialData.tags.length > 0
      ? initialData.tags
      : ["marble", "natural stone", "luxury architecture"];

  // Core product details
  const [form, setForm] = useState<ProductFormState>({
    name: resolvedInitialName,
    slug: initialData?.slug || "",
    sku: resolvedInitialSku,
    description: resolvedInitialDesc,
    status: (initialData?.status as "active" | "draft" | "archived") || "active",
    categoryIds:
      Array.isArray(initialData?.categoryIds) && initialData.categoryIds.length > 0
        ? initialData.categoryIds
        : initialData?.primaryCategoryId
        ? [initialData.primaryCategoryId]
        : initialData?.categories
        ? [initialData.categories]
        : allCategories.length > 0
        ? [(allCategories[0].id || (allCategories[0] as any)._id)]
        : [],
    primaryCategoryId:
      initialData?.primaryCategoryId ||
      initialData?.categoryIds?.[0] ||
      (allCategories[0]?.id || (allCategories[0] as any)?._id || ""),
    manufacturer: resolvedInitialManufacturer,
    templateKey: initialData?.templateKey || "product-split",
    attributeSetIds: Array.isArray(initialData?.attributeSetIds)
      ? initialData.attributeSetIds
      : [],
    tags: resolvedInitialTags,
    relatedProductIds: Array.isArray(initialData?.relatedProductIds)
      ? initialData.relatedProductIds
      : [],
    metaTitle:
      initialData?.metaTitle ||
      initialData?.seoTitle ||
      (resolvedInitialName ? `${resolvedInitialName} | Arab Marble` : ""),
    metaDescription:
      initialData?.metaDescription ||
      initialData?.seoDescription ||
      resolvedInitialDesc,
    detailsTabs: Array.isArray(initialData?.detailsTabs) ? initialData.detailsTabs : [],
  });

  // Re-sync all state when full initialData or categories become available
  useEffect(() => {
    if (!initialData) return;
    const rType = (initialData?.type || "").toLowerCase();
    const isVar =
      rType === "variable" ||
      rType === "variant" ||
      (!rType &&
        (initialData?.variants?.length > 1 ||
          initialData?.options?.length > 0));
    const nType: "simple" | "variant" | "catalog" = isVar
      ? "variant"
      : rType === "catalog" || rType === "catalogue"
      ? "catalog"
      : "simple";
    setProductType(nType);

    const resName =
      initialData.name ||
      initialData.title ||
      "";
    const resSku =
      initialData.sku === "—" ? "" : initialData.sku || initialData.slug || "";
    const resManufacturer =
      initialData.manufacturer || "Arab Marble";
    const resDesc =
      initialData.description || "";
    const resCatIds =
      Array.isArray(initialData.categoryIds) && initialData.categoryIds.length > 0
        ? initialData.categoryIds
        : initialData.primaryCategoryId
        ? [initialData.primaryCategoryId]
        : allCategories.length > 0
        ? [(allCategories[0].id || (allCategories[0] as any)._id)]
        : [];
    const resPrimaryCat =
      initialData.primaryCategoryId ||
      resCatIds[0] ||
      (allCategories[0]?.id || (allCategories[0] as any)?._id || "");
    const resTags =
      Array.isArray(initialData.tags) && initialData.tags.length > 0
        ? initialData.tags
        : ["marble", "natural stone", "luxury architecture"];

    setForm((prev) => ({
      ...prev,
      name: resName || prev.name,
      slug: initialData.slug || prev.slug,
      sku: resSku || prev.sku,
      description: resDesc || prev.description,
      status: (initialData.status as any) || prev.status,
      categoryIds: resCatIds.length ? resCatIds : prev.categoryIds,
      primaryCategoryId: resPrimaryCat || prev.primaryCategoryId,
      manufacturer: resManufacturer || prev.manufacturer,
      templateKey: initialData.templateKey || prev.templateKey,
      attributeSetIds: Array.isArray(initialData.attributeSetIds)
        ? initialData.attributeSetIds
        : prev.attributeSetIds,
      tags: resTags,
      relatedProductIds: Array.isArray(initialData.relatedProductIds)
        ? initialData.relatedProductIds
        : prev.relatedProductIds,
      metaTitle:
        initialData.metaTitle ||
        initialData.seoTitle ||
        (resName ? `${resName} | Arab Marble` : prev.metaTitle),
      metaDescription:
        initialData.metaDescription ||
        initialData.seoDescription ||
        resDesc ||
        prev.metaDescription,
      detailsTabs:
        Array.isArray(initialData.detailsTabs) && initialData.detailsTabs.length > 0
          ? initialData.detailsTabs
          : prev.detailsTabs,
    }));

    if (Array.isArray(initialData.options) && initialData.options.length > 0) {
      setOptions(initialData.options);
    }
    if (Array.isArray(initialData.variants) && initialData.variants.length > 0) {
      setVariants(initialData.variants);
    }
    if (initialData.gallery && Array.isArray(initialData.gallery) && initialData.gallery.length > 0) {
      setGallery(initialData.gallery);
    }
    if (initialData.pricing) {
      setPricing((prev) => ({
        ...prev,
        price: String(initialData.pricing.price ?? prev.price),
        compareAtPrice: String(initialData.pricing.compareAtPrice ?? prev.compareAtPrice),
        costPerItem: String(initialData.pricing.costPerItem ?? prev.costPerItem),
        stock: String(initialData.pricing.stock ?? prev.stock),
      }));
    }
  }, [initialData, allCategories]);

  const [hasManuallyEditedSlug, setHasManuallyEditedSlug] = useState(
    Boolean(initialData?.slug)
  );

  // Pricing State
  const initialPricing = initialData?.pricing || {};
  const [pricing, setPricing] = useState({
    price: String(
      initialPricing.price !== undefined
        ? initialPricing.price
        : initialData?.priceSort !== undefined
        ? initialData.priceSort
        : initialData?.price || ""
    ),
    compareAtPrice: String(initialPricing.compareAtPrice || ""),
    costPerItem: String(initialPricing.costPerItem || ""),
    stock: String(
      initialPricing.stock !== undefined
        ? initialPricing.stock
        : initialData?.stock !== undefined
        ? initialData.stock
        : "10"
    ),
    chargeTax: initialPricing.chargeTax !== undefined ? initialPricing.chargeTax : true,
    trackQuantity:
      initialPricing.trackQuantity !== undefined ? initialPricing.trackQuantity : true,
  });

  // Media / Gallery State
  const derivedGallery = useMemo(() => {
    if (initialData?.gallery && Array.isArray(initialData.gallery) && initialData.gallery.length > 0) {
      return initialData.gallery;
    }
    if (initialData?.images && Array.isArray(initialData.images) && initialData.images.length > 0) {
      return initialData.images.map((url: string, index: number) => ({
        id: `img-${index}-${Date.now()}`,
        url,
        alt: initialData?.name || `Product image ${index + 1}`,
        order: index,
      }));
    }
    if (initialData?.imageUrl) {
      return [
        {
          id: `img-primary-${Date.now()}`,
          url: initialData.imageUrl,
          alt: initialData?.name || "Product image",
          order: 0,
        },
      ];
    }
    return [];
  }, [initialData]);

  const [gallery, setGallery] = useState<Array<{ id: string; url: string; alt?: string; order?: number }>>(
    derivedGallery
  );
  const [primaryImageId, setPrimaryImageId] = useState<string>(
    initialData?.primaryImageId || derivedGallery[0]?.id || ""
  );
  const [galleryUrlDraft, setGalleryUrlDraft] = useState("");
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");

  // Variant Options & Combinations
  const [options, setOptions] = useState<ProductOption[]>(
    Array.isArray(initialData?.options) && initialData.options.length > 0
      ? initialData.options
      : []
  );

  const [activeAttributeSetId, setActiveAttributeSetId] = useState<string | null>(null);

  // Focus the first attribute set by default when available
  useEffect(() => {
    if (!activeAttributeSetId && allAttributes && allAttributes.length > 0) {
      setActiveAttributeSetId(
        allAttributes[0].key || allAttributes[0].id || (allAttributes[0] as any)._id || null
      );
    }
  }, [allAttributes, activeAttributeSetId]);

  const [newOptionDraftInput, setNewOptionDraftInput] = useState<{ [key: string]: string }>({});

  const [variants, setVariants] = useState<Variant[]>(
    Array.isArray(initialData?.variants) && initialData.variants.length > 0
      ? initialData.variants
      : []
  );

  useEffect(() => {
    if (Array.isArray(initialData?.variants) && initialData.variants.length > 0) {
      const normalizedVariants = initialData.variants.map((v: any) => {
        let optVals = v.optionValues ? { ...v.optionValues } : {};
        if (Object.keys(optVals).length === 0 && v.title && typeof v.title === "string" && v.title.includes(":")) {
          v.title.split("/").forEach((part: string) => {
            const [k, ...vParts] = part.split(":");
            if (k && vParts.length) {
              optVals[k.trim().toLowerCase()] = vParts.join(":").trim();
            }
          });
        }
        return {
          ...v,
          optionValues: optVals,
        };
      });
      setVariants(normalizedVariants);

      if ((!options || options.length === 0)) {
        const derivedOptsMap: Record<string, Set<string>> = {};
        for (const v of normalizedVariants) {
          const vOpts = v.optionValues || {};
          for (const [k, val] of Object.entries(vOpts)) {
            const optK = k.trim().toLowerCase();
            if (!derivedOptsMap[optK]) derivedOptsMap[optK] = new Set();
            if (val) derivedOptsMap[optK].add(String(val));
          }
        }
        const derivedList: ProductOption[] = Object.entries(derivedOptsMap).map(([k, setVals]) => ({
          key: k,
          label: k.charAt(0).toUpperCase() + k.slice(1),
          attributeSetId: k || "custom",
          values: Array.from(setVals),
          selectedValues: Array.from(setVals),
          useForVariants: true,
        }));
        if (derivedList.length > 0) {
          setOptions(derivedList);
        }
      }
    }
  }, [initialData?.variants]);

  const [isAddVariantModalOpen, setIsAddVariantModalOpen] = useState(false);
  const [variantSearch, setVariantSearch] = useState("");
  const [newVariantDraft, setNewVariantDraft] = useState<{
    sku: string;
    price: string;
    compareAtPrice: string;
    stock: string;
    optionValues: Record<string, string>;
  }>({
    sku: "",
    price: "",
    compareAtPrice: "",
    stock: "10",
    optionValues: {},
  });

  const getVariantOptionValue = (variant: Variant, optKey: string): string => {
    if (variant.optionValues && variant.optionValues[optKey] !== undefined) {
      return String(variant.optionValues[optKey]);
    }
    const attr = variant.attributeValues?.find(
      (a: any) => (a.attributeId || a.key || a.name)?.toLowerCase() === optKey.toLowerCase()
    );
    if (attr && attr.value !== undefined) {
      return String(attr.value);
    }
    if (variant.title) {
      const parts = variant.title.split("/");
      for (const part of parts) {
        const [k, ...vParts] = part.split(":");
        if (k && vParts.length > 0 && k.trim().toLowerCase() === optKey.toLowerCase()) {
          return vParts.join(":").trim();
        }
      }
    }
    return "";
  };

  const handleVariantOptionChange = (idx: number, optKey: string, newValue: string) => {
    const next = [...variants];
    const target = next[idx];
    const currentOptions = { ...(target.optionValues || {}) };
    options.forEach((o) => {
      if (!currentOptions[o.key]) {
        currentOptions[o.key] = getVariantOptionValue(target, o.key);
      }
    });
    currentOptions[optKey] = newValue;

    const currentAttrs = (target.attributeValues || []).filter(
      (a: any) => (a.attributeId || a.key || a.name)?.toLowerCase() !== optKey.toLowerCase()
    );
    currentAttrs.push({ attributeId: optKey, value: newValue });

    const newTitle = buildCombinationTitle(currentOptions);

    next[idx] = {
      ...target,
      optionValues: currentOptions,
      attributeValues: currentAttrs,
      title: newTitle || target.title,
    };
    setVariants(next);
  };

  const filteredVariants = useMemo(() => {
    if (!variantSearch.trim()) return variants;
    const q = variantSearch.toLowerCase();
    return variants.filter(
      (v) =>
        (v.title || "").toLowerCase().includes(q) ||
        (v.sku || "").toLowerCase().includes(q) ||
        Object.values(v.optionValues || {}).some((val) =>
          String(val).toLowerCase().includes(q)
        )
    );
  }, [variants, variantSearch]);

  // Sync primary image if gallery changes and primary isn't set
  useEffect(() => {
    if (!primaryImageId && gallery.length > 0) {
      setPrimaryImageId(gallery[0].id);
    }
  }, [gallery, primaryImageId]);

  // Reactive variant stock summation
  const calculatedStock = useMemo(() => {
    if (productType !== "variant") return Number(pricing.stock) || 0;
    return (variants || []).reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }, [variants, productType, pricing.stock]);

  // Health checks computation
  const healthChecks = useMemo(() => {
    const titleLen = form.name.trim().length;
    const descLen = form.description.trim().length;
    const hasCategory = form.categoryIds.length > 0;
    const seoTitleLen = (form.metaTitle || form.name).trim().length;
    const seoDescLen = (form.metaDescription || form.description).trim().length;
    const tagsCount = form.tags.length;
    const hasMedia = gallery.length > 0;
    const hasPrice =
      productType === "variant"
        ? variants.length > 0 && variants.every((v) => Number(v.price) > 0)
        : productType === "catalog" || Number(pricing.price) > 0;

    return [
      {
        label: "Product title",
        ready: titleLen >= 3,
        detail: `${titleLen} chars`,
        tab: "details" as TabKey,
      },
      {
        label: "Description",
        ready: descLen >= 40,
        detail: `${descLen} / 40+ chars`,
        tab: "details" as TabKey,
      },
      {
        label: "Category assigned",
        ready: hasCategory,
        detail: `${form.categoryIds.length} linked`,
        tab: "organization" as TabKey,
      },
      {
        label: "Pricing configured",
        ready: hasPrice,
        detail:
          productType === "variant"
            ? variants.length === 0
              ? "No variants"
              : `${variants.filter((v) => Number(v.price) > 0).length}/${variants.length} priced`
            : Number(pricing.price) > 0
            ? "Ready"
            : "Missing",
        tab: "pricing" as TabKey,
      },
      {
        label: "Visual assets",
        ready: hasMedia,
        detail: `${gallery.length} images`,
        tab: "media" as TabKey,
      },
      {
        label: "SEO calibrated",
        ready: seoTitleLen >= 10 && seoDescLen >= 30,
        detail: `${seoTitleLen} / ${seoDescLen}`,
        tab: "seo" as TabKey,
      },
      {
        label: "Keyword tags",
        ready: tagsCount >= 2,
        detail: `${tagsCount} tags`,
        tab: "details" as TabKey,
      },
    ];
  }, [form, gallery, pricing, productType, variants]);

  const healthScore = Math.round(
    (healthChecks.filter((item) => item.ready).length / healthChecks.length) * 100
  );

  // Auto-slug update if not manually edited
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm((prev) => ({
      ...prev,
      name: val,
      slug: hasManuallyEditedSlug ? prev.slug : slugify(val),
    }));
  };

  // Tag Management
  const addTag = (tagToAdd?: string) => {
    const cleanTag = (tagToAdd || tagInput).trim().toLowerCase().replace(/^#/, "");
    if (!cleanTag || form.tags.includes(cleanTag)) return;
    setForm((prev) => ({
      ...prev,
      tags: [...prev.tags, cleanTag],
    }));
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  // Category Toggle
  const toggleCategory = (id: string) => {
    setForm((prev) => {
      const exists = prev.categoryIds.includes(id);
      const nextIds = exists
        ? prev.categoryIds.filter((cid) => cid !== id)
        : [...prev.categoryIds, id];

      let nextPrimary = prev.primaryCategoryId;
      if (exists && prev.primaryCategoryId === id) {
        nextPrimary = nextIds[0] || "";
      } else if (!exists && nextIds.length === 1) {
        nextPrimary = id;
      }

      return {
        ...prev,
        categoryIds: nextIds,
        primaryCategoryId: nextPrimary,
      };
    });
  };

  // Related Products Toggle
  const toggleRelatedProduct = (id: string) => {
    setForm((prev) => {
      const exists = prev.relatedProductIds.includes(id);
      return {
        ...prev,
        relatedProductIds: exists
          ? prev.relatedProductIds.filter((pid) => pid !== id)
          : [...prev.relatedProductIds, id],
      };
    });
  };

  // Add specific attribute from an attribute set (Matching Image 1 behavior)
  const handleAddAttributeFromSet = (set: any, attr: any) => {
    const optKey = sanitizeKey(attr.key || attr.label || "");
    if (options.some((o) => o.key === optKey)) return;

    const rawOptions = Array.isArray(attr.options)
      ? attr.options
      : typeof attr.options === "string"
      ? attr.options.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    const setId = set.key || set.id || set._id || "";
    const newOption: ProductOption = {
      attributeSetId: setId,
      key: optKey,
      label: attr.label || attr.key || "Option",
      values: rawOptions,
      selectedValues: rawOptions,
      useForVariants: true,
      draftValue: "",
    };

    setOptions((prev) => [...prev, newOption]);
    setForm((prev) => ({
      ...prev,
      attributeSetIds: prev.attributeSetIds.includes(setId)
        ? prev.attributeSetIds
        : [...prev.attributeSetIds, setId],
    }));
  };

  // Remove individual option and clean up attributeSetIds if no options remain for that set
  const handleRemoveOption = (optKey: string) => {
    const removedOption = options.find((o) => o.key === optKey);
    const nextOptions = options.filter((o) => o.key !== optKey);
    setOptions(nextOptions);

    if (removedOption?.attributeSetId) {
      const stillHasSameSet = nextOptions.some(
        (o) => o.attributeSetId === removedOption.attributeSetId
      );
      if (!stillHasSameSet) {
        setForm((prev) => ({
          ...prev,
          attributeSetIds: prev.attributeSetIds.filter(
            (id) => id !== removedOption.attributeSetId
          ),
        }));
      }
    }
  };

  // Attribute Set focus / toggle
  const toggleAttributeSet = (setId: string) => {
    setActiveAttributeSetId(setId);
    setForm((prev) => {
      const exists = prev.attributeSetIds.includes(setId);
      return {
        ...prev,
        attributeSetIds: exists
          ? prev.attributeSetIds.filter((id) => id !== setId)
          : [...prev.attributeSetIds, setId],
      };
    });
  };

  // Option value management
  const addOptionValue = (optKey: string) => {
    const val = (newOptionDraftInput[optKey] || "").trim();
    if (!val) return;

    setOptions((prev) =>
      prev.map((opt) => {
        if (opt.key !== optKey) return opt;
        const nextVals = Array.from(new Set([...opt.values, val]));
        const nextSelected = Array.from(new Set([...(opt.selectedValues || []), val]));
        return {
          ...opt,
          values: nextVals,
          selectedValues: nextSelected,
        };
      })
    );
    setNewOptionDraftInput((prev) => ({ ...prev, [optKey]: "" }));
  };

  const removeOptionValue = (optKey: string, valToRemove: string) => {
    setOptions((prev) =>
      prev.map((opt) => {
        if (opt.key !== optKey) return opt;
        return {
          ...opt,
          values: opt.values.filter((v: any) => v !== valToRemove),
          selectedValues: (opt.selectedValues || []).filter((v: any) => v !== valToRemove),
        };
      })
    );
  };

  const toggleOptionValueSelection = (optKey: string, val: string) => {
    setOptions((prev) =>
      prev.map((opt) => {
        if (opt.key !== optKey) return opt;
        const selected = opt.selectedValues || [];
        const isSelected = selected.includes(val);
        return {
          ...opt,
          selectedValues: isSelected
            ? selected.filter((v: any) => v !== val)
            : [...selected, val],
        };
      })
    );
  };

  // Regenerate Variants from Options (matching main admin logic)
  const regenerateVariants = () => {
    const combos = buildVariantCombinations(options);
    const baseSku = form.sku.trim() || "PRD";
    const defaultPrice = Number(pricing.price) || 0;
    const defaultStock = Math.max(1, Math.floor((Number(pricing.stock) || 10) / (combos.length || 1)));

    const nextVariants: Variant[] = combos.map((combo, index) => {
      // Look for existing variant with exact matching options
      const existing = variants.find((v) => {
        if (!v.optionValues) return false;
        return Object.entries(combo).every(([k, val]) => v.optionValues?.[k] === val);
      });

      const title = buildCombinationTitle(combo) || `Variant ${index + 1}`;
      const varSku = existing?.sku || generateSKUWithBaseSKU(baseSku, combo);

      return {
        id: existing?.id || `var-${index}-${Date.now()}`,
        title,
        sku: varSku,
        price: existing?.price !== undefined ? existing.price : defaultPrice,
        stock: existing?.stock !== undefined ? existing.stock : defaultStock,
        compareAtPrice: existing?.compareAtPrice || Number(pricing.compareAtPrice) || 0,
        currency: existing?.currency || "INR",
        optionValues: combo,
        attributeValues: Object.entries(combo).map(([key, val]) => ({
          attributeId: key,
          value: String(val),
        })),
        imageId: existing?.imageId || primaryImageId || "",
        status: existing?.status || "active",
      };
    });

    setVariants(nextVariants);
  };

  // Media Gallery operations
  const handleSelectFromLibrary = (media: { url: string; alt?: string }) => {
    const newItem = {
      id: `lib-${Date.now()}`,
      url: media.url,
      alt: media.alt || form.name || "Product image",
      order: gallery.length,
    };
    setGallery((prev) => [...prev, newItem]);
    if (!primaryImageId) setPrimaryImageId(newItem.id);
    setIsMediaModalOpen(false);
  };

  const addGalleryImage = () => {
    const url = galleryUrlDraft.trim();
    if (!url) return;
    const newItem = {
      id: `img-${Date.now()}`,
      url,
      alt: form.name || "Product image",
      order: gallery.length,
    };
    setGallery((prev) => [...prev, newItem]);
    if (!primaryImageId) setPrimaryImageId(newItem.id);
    setGalleryUrlDraft("");
  };

  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const newItem = {
          id: `img-${Date.now()}`,
          url: reader.result as string,
          alt: file.name,
          order: gallery.length,
        };
        setGallery((prev) => [...prev, newItem]);
        if (!primaryImageId) setPrimaryImageId(newItem.id);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeGalleryImage = (id: string) => {
    setGallery((prev) => prev.filter((img) => img.id !== id));
    if (primaryImageId === id) {
      const remaining = gallery.filter((img) => img.id !== id);
      setPrimaryImageId(remaining[0]?.id || "");
    }
  };

  // Autofill sample logic matching main admin
  const handleAutofill = () => {
    const firstCategory = allCategories[0];
    const catId = firstCategory ? firstCategory.id || (firstCategory as any)._id : "";
    const sampleName = form.name.trim() || "Calacatta Gold Luxury Slab";
    const sampleSku = form.sku.trim() || `AM-${Date.now().toString().slice(-6)}`;
    const sampleSlug = form.slug.trim() || slugify(sampleName);

    setForm((prev) => ({
      ...prev,
      name: sampleName,
      sku: sampleSku,
      slug: sampleSlug,
      description:
        prev.description.trim() ||
        "Premium Italian natural marble featuring striking golden and grey veining on a crystalline white canvas. Ideal for luxury flooring, feature walls, and bespoke countertops.",
      categoryIds: prev.categoryIds.length ? prev.categoryIds : catId ? [catId] : [],
      primaryCategoryId: prev.primaryCategoryId || catId || "",
      manufacturer: prev.manufacturer || "Arab Marble",
      tags: prev.tags.length ? prev.tags : ["marble", "natural stone", "calacatta", "luxury"],
      metaTitle: prev.metaTitle || `${sampleName} | Arab Marble`,
      metaDescription:
        prev.metaDescription ||
        `Explore ${sampleName}. Premium natural stone supplied by Arab Marble UAE.`,
    }));

    if (!pricing.price || Number(pricing.price) === 0) {
      setPricing((prev) => ({
        ...prev,
        price: "18500",
        compareAtPrice: "22000",
        costPerItem: "11000",
        stock: "25",
      }));
    }

    if (gallery.length === 0) {
      const sampleImg = {
        id: `img-sample-${Date.now()}`,
        url: "https://images.unsplash.com/photo-1580481077197-9b2f6efcf5e3?auto=format&fit=crop&w=800&q=80",
        alt: sampleName,
        order: 0,
      };
      setGallery([sampleImg]);
      setPrimaryImageId(sampleImg.id);
    }
  };

  // Details Tabs for Public Product
  const detailsTabsForPublicProduct = () => {
    const tabs = form.detailsTabs || [];
    const description = form.description || "";
    const byKey = new Map<string, any>(tabs.map((t: any) => [t.key, t]));
    const descTab = byKey.get("description")?.content || description;
    byKey.set("description", {
      key: "description",
      label: "Description",
      content: descTab,
    });
    if (!byKey.has("shipping-returns")) {
      byKey.set("shipping-returns", {
        key: "shipping-returns",
        label: "Shipping & Returns",
        content:
          byKey.get("shipping-returns")?.content ||
          "Standard delivery across India within 3-5 business days. 30-day return policy on unused items.",
      });
    }
    return ["description", "shipping-returns"]
      .map((key) => byKey.get(key))
      .filter(Boolean);
  };

  // Submission handler matching main admin's complete schema and variant logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Product name is required.");
      setActiveTab("details");
      return;
    }
    if (!form.sku.trim()) {
      toast.error("Product SKU is required.");
      setActiveTab("details");
      return;
    }

    if (productType === "variant") {
      if (!variants || variants.length === 0) {
        toast.error("Please configure at least one variant for this product.");
        setActiveTab("variants");
        return;
      }

      const invalidVariants = variants.filter(
        (v) => v.price === undefined || v.price === null || Number(v.price) <= 0 || isNaN(Number(v.price))
      );
      if (invalidVariants.length > 0) {
        toast.error(
          `All variants must have a valid price greater than 0 (${invalidVariants.length} variant${
            invalidVariants.length > 1 ? "s" : ""
          } missing pricing).`
        );
        setActiveTab("variants");
        return;
      }
    } else if (productType === "simple") {
      if (!pricing.price || Number(pricing.price) <= 0 || isNaN(Number(pricing.price))) {
        toast.error("Product price must be greater than 0.");
        setActiveTab("pricing");
        return;
      }
    }

    const nextSlug = form.slug.trim() || slugify(form.name);

    const productAttributes = (options || [])
      .filter((option) => option.selectedValues?.length)
      .map((option) => ({
        attributeId: option.key,
        value:
          option.selectedValues.length === 1
            ? option.selectedValues[0]
            : option.selectedValues,
      }));

    let finalForm: any = {
      ...form,
      name: form.name.trim(),
      sku: form.sku.trim(),
      slug: nextSlug,
      description: form.description.trim(),
      type: productType,
      productAttributes,
      detailsTabs: detailsTabsForPublicProduct(),
      gallery,
      primaryImageId,
      images: gallery.map((item) => item.url),
    };

    if (productType === "simple") {
      const priceNum = Number(pricing.price) || 0;
      const compareNum = Number(pricing.compareAtPrice) || 0;
      const stockNum = Number(pricing.stock) || 0;
      const costNum = Number(pricing.costPerItem) || 0;

      const simpleVariant = {
        id: initialData?.variants?.[0]?.id || `var-${Date.now()}`,
        title: form.name.trim(),
        sku: form.sku.trim(),
        price: priceNum,
        compareAtPrice: compareNum,
        stock: stockNum,
        status: form.status || "active",
      };

      finalForm = {
        ...finalForm,
        pricing: {
          price: priceNum,
          compareAtPrice: compareNum,
          costPerItem: costNum,
          stock: stockNum,
          chargeTax: pricing.chargeTax,
          trackQuantity: pricing.trackQuantity,
        },
        variants: [simpleVariant],
        options: [],
      };
    } else if (productType === "variant") {
      const totalStock = (variants || []).reduce(
        (sum, v) => sum + (Number(v.stock) || 0),
        0
      );
      finalForm = {
        ...finalForm,
        options,
        variants,
        pricing: {
          price: Number(variants[0]?.price || pricing.price || 0),
          compareAtPrice: Number(variants[0]?.compareAtPrice || pricing.compareAtPrice || 0),
          costPerItem: Number(pricing.costPerItem || 0),
          chargeTax: pricing.chargeTax,
          trackQuantity: pricing.trackQuantity,
          stock: totalStock,
        },
      };
    } else if (productType === "catalog") {
      const cleanVariants = (variants || []).map((v) => {
        let optVals = v.optionValues ? { ...v.optionValues } : {};
        if (Object.keys(optVals).length === 0 && v.title && typeof v.title === "string" && v.title.includes(":")) {
          v.title.split("/").forEach((part: string) => {
            const [k, ...vParts] = part.split(":");
            if (k && vParts.length) {
              optVals[k.trim().toLowerCase()] = vParts.join(":").trim();
            }
          });
        }
        return {
          id: v.id,
          title: v.title,
          sku: v.sku,
          price: Number(v.price) || 0,
          compareAtPrice: Number(v.compareAtPrice) || 0,
          stock: Number(v.stock) || 0,
          status: v.status || "active",
          optionValues: optVals,
          attributeValues: v.attributeValues || Object.entries(optVals).map(([k, val]) => ({ attributeId: k, value: val })),
          weight: (v as any).weight,
          imageId: v.imageId,
        };
      });

      const totalStock = cleanVariants.reduce(
        (sum, v) => sum + (Number(v.stock) || 0),
        0
      );
      const effectivePrice = Number(pricing.price) || Number(cleanVariants[0]?.price) || 0;
      const effectiveCompare = Number(pricing.compareAtPrice) || Number(cleanVariants[0]?.compareAtPrice) || 0;

      finalForm = {
        ...finalForm,
        options: options && options.length > 0 ? options : finalForm.options,
        pricing: {
          price: effectivePrice,
          compareAtPrice: effectiveCompare,
          costPerItem: Number(pricing.costPerItem || 0),
          chargeTax: Boolean(pricing.chargeTax),
          trackQuantity: Boolean(pricing.trackQuantity),
          stock: totalStock || Number(pricing.stock) || 0,
        },
        variants: cleanVariants,
      };
    }

    await onSubmit(finalForm);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      {/* ── Scroll Area with All Tabbed & Card Content ─────────────────── */}
      <div className={styles.scrollArea}>
        {/* ── Health Score & Quick Merchandising Banner ── */}
        <div className={styles.healthBanner}>
          <div className={styles.healthLeft}>
            <div className={styles.healthScoreBadge}>{healthScore}%</div>
            <div>
              <p className={styles.healthTitle}>Catalog & Merchandising Health</p>
              <p className={styles.healthDesc}>
                {healthChecks.filter((h) => h.ready).length} of {healthChecks.length} signals configured
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAutofill}
            className={styles.autofillBtn}
            style={{ margin: 0 }}
          >
            <WandSparkles size={13} />
            <span>Autofill Sample</span>
          </button>
        </div>

        {/* ── Top Tabs Navigation ── */}
        <nav className={styles.tabsNav}>
          {[
            { key: "details", label: "Details", icon: Package },
            { key: "variants", label: "Options & Variants", icon: Boxes },
            { key: "pricing", label: "Pricing & Stock", icon: IndianRupee },
            { key: "organization", label: "Categories & Relations", icon: Link2 },
            { key: "media", label: "Media Gallery", icon: ImageIcon },
            { key: "seo", label: "SEO & Search", icon: Search },
          ].map(({ key, label, icon: TabIcon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key as TabKey)}
              className={`${styles.tabBtn} ${activeTab === key ? styles.tabBtnActive : ""}`}
            >
              <TabIcon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* ── 1. DETAILS TAB ─────────────────────────────────────────────── */}
        {activeTab === "details" && (
          <>
            {/* Product Type Selector */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <SlidersHorizontal />
                  <span>Product Classification Type</span>
                </div>
                <span className={styles.keyTag}>{productType.toUpperCase()}</span>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.typeSelectorGrid}>
                  {/* Simple Product */}
                  <button
                    type="button"
                    onClick={() => setProductType("simple")}
                    className={`${styles.typeCard} ${
                      productType === "simple" ? styles.typeCardActive : ""
                    }`}
                  >
                    <div className={styles.typeCardTop}>
                      <div className={styles.typeCardTitle}>
                        <Package size={14} />
                        <span>Simple Product</span>
                      </div>
                      {productType === "simple" && <Check size={14} color="#22c55e" />}
                    </div>
                    <span className={styles.typeCardDesc}>
                      Single standalone product with unified SKU, direct price & stock.
                    </span>
                  </button>

                  {/* Variant Product */}
                  <button
                    type="button"
                    onClick={() => {
                      setProductType("variant");
                      if (variants.length === 0) regenerateVariants();
                    }}
                    className={`${styles.typeCard} ${
                      productType === "variant" ? styles.typeCardActive : ""
                    }`}
                  >
                    <div className={styles.typeCardTop}>
                      <div className={styles.typeCardTitle}>
                        <Boxes size={14} />
                        <span>Variant Product</span>
                      </div>
                      {productType === "variant" && <Check size={14} color="#22c55e" />}
                    </div>
                    <span className={styles.typeCardDesc}>
                      Configurable product with choices (Size, Color) & per-variant matrix.
                    </span>
                  </button>

                  {/* Catalogue Product */}
                  <button
                    type="button"
                    onClick={() => setProductType("catalog")}
                    className={`${styles.typeCard} ${
                      productType === "catalog" ? styles.typeCardActive : ""
                    }`}
                  >
                    <div className={styles.typeCardTop}>
                      <div className={styles.typeCardTitle}>
                        <Eye size={14} />
                        <span>Catalogue Product</span>
                      </div>
                      {productType === "catalog" && <Check size={14} color="#22c55e" />}
                    </div>
                    <span className={styles.typeCardDesc}>
                      Showcase & portfolio item. Direct inventory checkout optional.
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Basic Identification */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <Package />
                  <span>General Information</span>
                </div>
                <span className={styles.keyTag}>{form.sku || "NO-SKU"}</span>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.grid2}>
                  {/* Name */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                      <Type />
                      Product Name <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ergonomic Office Chair"
                      value={form.name}
                      onChange={handleNameChange}
                      className={styles.input}
                    />
                  </div>

                  {/* SKU */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                      <Barcode />
                      {productType === "variant" ? "Base SKU Prefix" : "SKU"}{" "}
                      <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CHR-ERG-001"
                      value={form.sku}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, sku: e.target.value.toUpperCase() }))
                      }
                      className={`${styles.input} ${styles.monoInput}`}
                    />
                  </div>
                </div>

                <div className={styles.grid2}>
                  {/* Slug */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                      <Hash />
                      URL Slug
                    </label>
                    <input
                      type="text"
                      placeholder="ergonomic-office-chair"
                      value={form.slug}
                      onChange={(e) => {
                        setHasManuallyEditedSlug(true);
                        setForm((prev) => ({
                          ...prev,
                          slug: slugify(e.target.value),
                        }));
                      }}
                      className={`${styles.input} ${styles.monoInput}`}
                    />
                  </div>

                  {/* Brand / Manufacturer */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                      <Building2 size={13} />
                      Brand / Manufacturer
                    </label>
                    {allBrands && allBrands.length > 0 ? (
                      <select
                        value={form.manufacturer || ""}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, manufacturer: e.target.value }))
                        }
                        className={styles.select}
                      >
                        <option value="">Select Brand / Manufacturer</option>
                        {allBrands.map((b: any) => (
                          <option key={b.id || b._id || b.name} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="e.g. Arab Marble"
                        value={form.manufacturer || ""}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, manufacturer: e.target.value }))
                        }
                        className={styles.input}
                      />
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <AlignLeft />
                    Product Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter complete product description and features..."
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className={styles.textarea}
                  />
                </div>

                {/* Tags */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <Tag />
                    Product Tags & Keywords
                  </label>
                  <div className={styles.tagsContainer}>
                    {form.tags.map((tag) => (
                      <span key={tag} className={styles.tagChip}>
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className={styles.tagRemoveBtn}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="Add tag and press Enter..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      className={styles.tagInput}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── 2. VARIANTS TAB ────────────────────────────────────────────── */}
        {activeTab === "variants" && (
          <>
            {productType === "simple" ? (
              <div className={styles.card}>
                <div className={styles.cardBody} style={{ textAlign: "center", padding: "36px 20px" }}>
                  <Package size={36} color="var(--admin-desktop-accent, #22c55e)" style={{ margin: "0 auto 12px" }} />
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700 }}>Single Simple Product</h4>
                  <p className={styles.hint} style={{ maxWidth: "420px", margin: "8px auto 16px" }}>
                    This product is configured as a Simple Product with unified SKU and pricing. Switch to "Variant Product" on the Details tab to configure options, attributes, and multiple SKUs.
                  </p>
                  <button
                    type="button"
                    onClick={() => setProductType("variant")}
                    className={styles.addBtn}
                  >
                    Enable Variant Product Options
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Attribute Sets Selector & Available Attributes Panel (Image 1 behavior) */}
                {allAttributes && allAttributes.length > 0 && (
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <div className={styles.cardTitle}>
                        <Layers />
                        <span>Options</span>
                      </div>
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.chipsSelector}>
                        {allAttributes.map((attr: any) => {
                          const id = attr.key || attr.id || attr._id || "";
                          const isFocused = activeAttributeSetId === id;
                          const isLinked = form.attributeSetIds.includes(id);
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() =>
                                setActiveAttributeSetId((prev) => (prev === id ? null : id))
                              }
                              className={`${styles.chipBtn} ${
                                isFocused
                                  ? styles.chipBtnActive
                                  : isLinked
                                  ? styles.chipBtnSelected
                                  : ""
                              }`}
                            >
                              {isLinked ? <Check size={12} /> : <Tag size={12} />}
                              <span>{attr.name || attr.key}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Available Attributes in Focused Set (Matching Image 1) */}
                      {(() => {
                        if (!activeAttributeSetId) return null;
                        const activeSet = allAttributes.find(
                          (s: any) =>
                            s.key === activeAttributeSetId ||
                            s.id === activeAttributeSetId ||
                            s._id === activeAttributeSetId
                        );
                        if (!activeSet) return null;

                        const availableAttributes = (activeSet.attributes || [])
                          .filter((a: any) => a.enabled !== false)
                          .filter((a: any) => {
                            const optKey = sanitizeKey(a.key || a.label || "");
                            return !options.some((o) => o.key === optKey);
                          });

                        return (
                          <div className={styles.availableAttributesPanel}>
                            <div className={styles.availableAttributesHeader}>
                              <Sparkles size={14} className={styles.sparkleIcon} />
                              <span>
                                Available Attributes in {activeSet.name || activeSet.key}
                              </span>
                            </div>
                            {availableAttributes.length > 0 ? (
                              <div className={styles.availableAttributesChips}>
                                {availableAttributes.map((attr: any) => {
                                  const attrKey = attr.key || attr.label || "";
                                  return (
                                    <button
                                      key={attrKey}
                                      type="button"
                                      onClick={() => handleAddAttributeFromSet(activeSet, attr)}
                                      className={styles.addAttributeBtn}
                                    >
                                      <Plus size={12} />
                                      <span>{attr.label || attr.key}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className={styles.hint} style={{ fontStyle: "italic", margin: 0 }}>
                                All attributes from this set have been added.
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Configured Options */}
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                      <Boxes />
                      <span>Product Options & Attributes</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newKey = `option-${options.length + 1}`;
                        setOptions((prev) => [
                          ...prev,
                          {
                            attributeSetId: `custom-opt-${Date.now()}`,
                            key: newKey,
                            label: `Option ${prev.length + 1}`,
                            values: [],
                            selectedValues: [],
                            useForVariants: true,
                            draftValue: "",
                          },
                        ]);
                      }}
                      className={styles.addBtn}
                    >
                      <Plus size={12} />
                      <span>Add Option</span>
                    </button>
                  </div>

                  <div className={styles.cardBody}>
                    {options.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "24px 16px", color: "#64748b" }}>
                        <Boxes size={28} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                        <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>
                          No options added yet
                        </p>
                        <p style={{ margin: "4px 0 0", fontSize: "11px" }}>
                          Click any attribute above (e.g. + Length, + Color) or click "+ Add Option".
                        </p>
                      </div>
                    ) : (
                      options.map((opt) => (
                      <div key={opt.key} className={styles.optionCard}>
                        <div className={styles.optionCardHeader}>
                          <input
                            type="text"
                            value={opt.label}
                            onChange={(e) => {
                              const newLabel = e.target.value;
                              setOptions((prev) =>
                                prev.map((o) =>
                                  o.key === opt.key ? { ...o, label: newLabel } : o
                                )
                              );
                            }}
                            className={styles.tableInput}
                            style={{ fontWeight: 700, width: "160px" }}
                          />
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <label className={styles.checkboxLabel}>
                              <input
                                type="checkbox"
                                checked={opt.useForVariants}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setOptions((prev) =>
                                    prev.map((o) =>
                                      o.key === opt.key ? { ...o, useForVariants: checked } : o
                                    )
                                  );
                                }}
                                className={styles.checkboxInput}
                              />
                              <span>Use for variants</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(opt.key)}
                              className={styles.deleteBtn}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Value chips */}
                        <div className={styles.optionValuesList}>
                          {opt.values.map((val: any) => {
                            const isSelected = (opt.selectedValues || []).includes(val);
                            return (
                              <span
                                key={val}
                                className={styles.optionValueChip}
                                style={{
                                  opacity: isSelected ? 1 : 0.45,
                                  cursor: "pointer",
                                }}
                                onClick={() => toggleOptionValueSelection(opt.key, val)}
                              >
                                {isSelected ? <Check size={11} /> : null}
                                <span>{val}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeOptionValue(opt.key, val);
                                  }}
                                  className={styles.tagRemoveBtn}
                                >
                                  <X size={11} />
                                </button>
                              </span>
                            );
                          })}
                        </div>

                        {/* Add value input */}
                        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                          <input
                            type="text"
                            placeholder={`Add value to ${opt.label} (e.g. Red, XL)...`}
                            value={newOptionDraftInput[opt.key] || ""}
                            onChange={(e) =>
                              setNewOptionDraftInput((prev) => ({
                                ...prev,
                                [opt.key]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addOptionValue(opt.key);
                              }
                            }}
                            className={styles.input}
                            style={{ padding: "5px 10px", fontSize: "11px" }}
                          />
                          <button
                            type="button"
                            onClick={() => addOptionValue(opt.key)}
                            className={styles.addBtn}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )))}

                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={regenerateVariants}
                        className={styles.submitBtn}
                        style={{ alignSelf: "flex-start", marginTop: "8px" }}
                      >
                        <Sparkles size={13} />
                        <span>Generate / Rebuild Variants Matrix</span>
                      </button>
                    ) : (
                      <div
                        style={{
                          marginTop: "10px",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          background: "rgba(234, 179, 8, 0.08)",
                          border: "1px solid rgba(234, 179, 8, 0.25)",
                          fontSize: "11px",
                          color: "#fde047",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <CircleAlert size={16} style={{ flexShrink: 0, color: "#eab308" }} />
                        <span>
                          <strong>Matrix Rebuild Locked:</strong> Rebuilding matrix is disabled in edit mode to prevent overriding existing customized variants and inventory. To add a new variation, use the <strong>+ Add Variant</strong> button in the Variant Matrix section below.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Variant Matrix Table */}
                <div className={styles.card}>
                  <div className={styles.cardHeader} style={{ flexWrap: "wrap", gap: "10px" }}>
                    <div className={styles.cardTitle}>
                      <Layers />
                      <span>Variant Matrix ({variants.length} {variants.length === 1 ? "Variant" : "Variants"})</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {variants.length > 5 && (
                        <div style={{ position: "relative" }}>
                          <input
                            type="text"
                            placeholder="Filter variants..."
                            value={variantSearch}
                            onChange={(e) => setVariantSearch(e.target.value)}
                            className={styles.tableInput}
                            style={{ width: "160px", paddingLeft: "26px", fontSize: "11px" }}
                          />
                          <Search
                            size={12}
                            style={{
                              position: "absolute",
                              left: "8px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: "#64748b",
                              pointerEvents: "none",
                            }}
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          const initialOptVals: Record<string, string> = {};
                          options.forEach((opt) => {
                            if (opt.values && opt.values.length > 0) {
                              initialOptVals[opt.key] = opt.values[0];
                            }
                          });
                          const suggestedSku = generateSKUWithBaseSKU(form.sku || "PRD", initialOptVals) || `${form.sku || "PRD"}-VAR-${variants.length + 1}`;
                          setNewVariantDraft({
                            sku: suggestedSku,
                            price: pricing.price || (variants[0]?.price ? String(variants[0].price) : "0"),
                            compareAtPrice: pricing.compareAtPrice || "",
                            stock: "10",
                            optionValues: initialOptVals,
                          });
                          setIsAddVariantModalOpen(true);
                        }}
                        className={styles.addBtn}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 14px",
                          fontSize: "11px",
                          fontWeight: 700,
                          borderRadius: "8px",
                          background: "var(--admin-desktop-accent, #22c55e)",
                          color: "#051b0d",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <Plus size={14} />
                        <span>Add Variant</span>
                      </button>
                    </div>
                  </div>

                  <div className={styles.cardBody} style={{ padding: "10px" }}>
                    {variants.length === 0 ? (
                      <p className={styles.hint} style={{ textAlign: "center", padding: "16px" }}>
                        {!isEditing
                          ? 'Click "Generate / Rebuild Variants Matrix" above or click "Add Variant" to create SKU combinations.'
                          : 'No variants configured yet. Click "Add Variant" to create a SKU combination.'}
                      </p>
                    ) : (
                      <div className={styles.matrixWrapper}>
                        <table className={styles.matrixTable}>
                          <thead>
                            <tr>
                              <th style={{ minWidth: "220px" }}>Variant Attributes</th>
                              <th style={{ minWidth: "120px" }}>SKU</th>
                              <th style={{ minWidth: "90px" }}>Price</th>
                              <th style={{ minWidth: "90px" }}>Compare At</th>
                              <th style={{ minWidth: "80px" }}>Stock</th>
                              <th style={{ minWidth: "90px" }}>Status</th>
                              <th style={{ width: "40px" }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredVariants.map((variant, idx) => {
                              const actualIndex = variants.findIndex(
                                (v) => (v.id && v.id === variant.id) || v.sku === variant.sku
                              );
                              const rowIdx = actualIndex >= 0 ? actualIndex : idx;

                              return (
                                <tr key={variant.id || rowIdx}>
                                  <td>
                                    {options.length > 0 ? (
                                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                                        {options.map((opt) => {
                                          const currentVal = getVariantOptionValue(variant, opt.key);
                                          return (
                                            <div key={opt.key} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                              <span style={{ fontSize: "10px", color: "var(--admin-desktop-muted, #94a3b8)", fontWeight: 600 }}>
                                                {opt.label || (opt as any).name || opt.key}:
                                              </span>
                                              <select
                                                value={currentVal}
                                                onChange={(e) => handleVariantOptionChange(rowIdx, opt.key, e.target.value)}
                                                className={styles.matrixSelect}
                                                style={{ maxWidth: "160px" }}
                                              >
                                                {currentVal && !(opt.values || []).includes(currentVal) && (
                                                  <option value={currentVal}>{currentVal}</option>
                                                )}
                                                {(opt.values || []).map((val: any) => (
                                                  <option key={val} value={val}>
                                                    {val}
                                                  </option>
                                                ))}
                                              </select>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <input
                                        type="text"
                                        value={variant.title || ""}
                                        onChange={(e) => {
                                          const next = [...variants];
                                          next[rowIdx] = { ...variant, title: e.target.value };
                                          setVariants(next);
                                        }}
                                        className={styles.tableInput}
                                        style={{ width: "100%" }}
                                      />
                                    )}
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      value={variant.sku}
                                      onChange={(e) => {
                                        const next = [...variants];
                                        next[rowIdx] = { ...variant, sku: e.target.value.toUpperCase() };
                                        setVariants(next);
                                      }}
                                      className={styles.tableInput}
                                      style={{ width: "100%", fontFamily: "ui-monospace, monospace" }}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      min="0.01"
                                      step="any"
                                      placeholder="0.00"
                                      value={variant.price === 0 && !isEditing ? "" : variant.price}
                                      onChange={(e) => {
                                        const next = [...variants];
                                        const raw = e.target.value;
                                        next[rowIdx] = { ...variant, price: raw === "" ? ("" as any) : Number(raw) };
                                        setVariants(next);
                                      }}
                                      className={styles.tableInput}
                                      style={{
                                        width: "80px",
                                        ...(productType === "variant" && (Number(variant.price) <= 0 || !variant.price)
                                          ? { borderColor: "#ef4444", backgroundColor: "rgba(239, 68, 68, 0.06)" }
                                          : {}),
                                      }}
                                    />
                                    {productType === "variant" && (Number(variant.price) <= 0 || !variant.price) && (
                                      <span style={{ display: "block", fontSize: "10px", color: "#ef4444", marginTop: "2px" }}>
                                        Price req.
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      value={variant.compareAtPrice || ""}
                                      onChange={(e) => {
                                        const next = [...variants];
                                        next[rowIdx] = {
                                          ...variant,
                                          compareAtPrice: Number(e.target.value) || 0,
                                        };
                                        setVariants(next);
                                      }}
                                      className={styles.tableInput}
                                      style={{ width: "80px" }}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      value={variant.stock}
                                      onChange={(e) => {
                                        const next = [...variants];
                                        next[rowIdx] = { ...variant, stock: Number(e.target.value) || 0 };
                                        setVariants(next);
                                      }}
                                      className={styles.tableInput}
                                      style={{ width: "70px", fontWeight: 600 }}
                                    />
                                  </td>
                                  <td>
                                    <select
                                      value={variant.status || "active"}
                                      onChange={(e) => {
                                        const next = [...variants];
                                        next[rowIdx] = { ...variant, status: e.target.value as any };
                                        setVariants(next);
                                      }}
                                      className={styles.matrixSelect}
                                      style={{ width: "80px" }}
                                    >
                                      <option value="active">Active</option>
                                      <option value="draft">Draft</option>
                                    </select>
                                  </td>
                                  <td>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setVariants((prev) => prev.filter((_, i) => i !== rowIdx))
                                      }
                                      className={styles.deleteBtn}
                                      title="Delete variant"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Variant Modal Dialog */}
                {isAddVariantModalOpen && (
                  <div className={styles.modalOverlay} onClick={() => setIsAddVariantModalOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                      <div className={styles.modalHeader}>
                        <div className={styles.modalTitle}>
                          <PlusCircle size={16} color="var(--admin-desktop-accent, #22c55e)" />
                          <span>Add Product Variant</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddVariantModalOpen(false)}
                          className={styles.modalCloseBtn}
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className={styles.modalBody}>
                        {options.length > 0 ? (
                          options.map((opt) => {
                            const currentSelected = newVariantDraft.optionValues[opt.key] || opt.values[0] || "";
                            return (
                              <div key={opt.key} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "11px", fontWeight: 700, color: "#e2e8f0" }}>
                                  {opt.label || (opt as any).name || opt.key}
                                </label>
                                <select
                                  value={currentSelected}
                                  onChange={(e) => {
                                    const updatedVals = {
                                      ...newVariantDraft.optionValues,
                                      [opt.key]: e.target.value,
                                    };
                                    setNewVariantDraft({
                                      ...newVariantDraft,
                                      optionValues: updatedVals,
                                      sku: generateSKUWithBaseSKU(form.sku || "PRD", updatedVals) || newVariantDraft.sku,
                                    });
                                  }}
                                  className={styles.select}
                                >
                                  {(opt.values || []).map((val: any) => (
                                    <option key={val} value={val}>
                                      {val}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label style={{ fontSize: "11px", fontWeight: 700, color: "#e2e8f0" }}>
                              Variant Title / Note
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Standard"
                              value={newVariantDraft.sku}
                              onChange={(e) => setNewVariantDraft({ ...newVariantDraft, sku: e.target.value })}
                              className={styles.input}
                            />
                          </div>
                        )}

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label style={{ fontSize: "11px", fontWeight: 700, color: "#e2e8f0" }}>
                              SKU
                            </label>
                            <input
                              type="text"
                              value={newVariantDraft.sku}
                              onChange={(e) =>
                                setNewVariantDraft({ ...newVariantDraft, sku: e.target.value.toUpperCase() })
                              }
                              placeholder="e.g. PRD-MED-BLU"
                              className={styles.input}
                              style={{ fontFamily: "ui-monospace, monospace" }}
                            />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label style={{ fontSize: "11px", fontWeight: 700, color: "#e2e8f0" }}>
                              Stock / Inventory
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={newVariantDraft.stock}
                              onChange={(e) =>
                                setNewVariantDraft({ ...newVariantDraft, stock: e.target.value })
                              }
                              placeholder="10"
                              className={styles.input}
                            />
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label style={{ fontSize: "11px", fontWeight: 700, color: "#e2e8f0" }}>
                              Price
                            </label>
                            <input
                              type="number"
                              min="0.01"
                              step="any"
                              value={newVariantDraft.price}
                              onChange={(e) =>
                                setNewVariantDraft({ ...newVariantDraft, price: e.target.value })
                              }
                              placeholder="0.00"
                              className={styles.input}
                            />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label style={{ fontSize: "11px", fontWeight: 700, color: "#e2e8f0" }}>
                              Compare At Price (optional)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={newVariantDraft.compareAtPrice}
                              onChange={(e) =>
                                setNewVariantDraft({ ...newVariantDraft, compareAtPrice: e.target.value })
                              }
                              placeholder="0.00"
                              className={styles.input}
                            />
                          </div>
                        </div>
                      </div>

                      <div className={styles.modalFooter}>
                        <button
                          type="button"
                          onClick={() => setIsAddVariantModalOpen(false)}
                          className={styles.cancelBtn}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const sku = newVariantDraft.sku.trim();
                            if (!sku) {
                              toast.error("Variant SKU is required.");
                              return;
                            }
                            const price = Number(newVariantDraft.price);
                            if (!price || price <= 0 || isNaN(price)) {
                              toast.error("A valid variant price greater than 0 is required.");
                              return;
                            }

                            if (variants.some((v) => v.sku?.toUpperCase() === sku.toUpperCase())) {
                              toast.error(`A variant with SKU ${sku} already exists.`);
                              return;
                            }

                            const combo = newVariantDraft.optionValues;
                            const title = buildCombinationTitle(combo) || `${form.name} Variant ${variants.length + 1}`;
                            const newVar: Variant = {
                              id: `var-${Date.now()}`,
                              title,
                              sku: sku.toUpperCase(),
                              price,
                              compareAtPrice: Number(newVariantDraft.compareAtPrice) || 0,
                              stock: Number(newVariantDraft.stock) || 0,
                              currency: "INR",
                              optionValues: combo,
                              attributeValues: Object.entries(combo).map(([k, v]) => ({
                                attributeId: k,
                                value: String(v),
                              })),
                              imageId: primaryImageId || "",
                              status: "active",
                            };

                            setVariants((prev) => [...prev, newVar]);
                            setIsAddVariantModalOpen(false);
                            toast.success(`Variant ${newVar.sku} added to matrix.`);
                          }}
                          className={styles.submitBtn}
                        >
                          <Plus size={14} />
                          <span>Add to Matrix</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── 3. PRICING & STOCK TAB ─────────────────────────────────────── */}
        {activeTab === "pricing" && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <IndianRupee />
                <span>Pricing & Inventory Controls</span>
              </div>
              <span className={styles.keyTag}>
                Total Stock: {productType === "variant" ? calculatedStock : pricing.stock || 0}
              </span>
            </div>

            <div className={styles.cardBody}>
              {productType === "variant" && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "rgba(34, 197, 94, 0.08)",
                    border: "1px solid rgba(34, 197, 94, 0.2)",
                    fontSize: "11px",
                    color: "#86efac",
                  }}
                >
                  Total inventory stock is automatically calculated from your {variants.length} configured variants ({calculatedStock} units total).
                </div>
              )}

              <div className={styles.grid3}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    Price (INR / ₹) <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 14999"
                    value={pricing.price}
                    onChange={(e) =>
                      setPricing((prev) => ({ ...prev, price: e.target.value }))
                    }
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Compare-At Price</label>
                  <input
                    type="number"
                    placeholder="e.g. 19999"
                    value={pricing.compareAtPrice}
                    onChange={(e) =>
                      setPricing((prev) => ({ ...prev, compareAtPrice: e.target.value }))
                    }
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Cost Per Item</label>
                  <input
                    type="number"
                    placeholder="e.g. 8500"
                    value={pricing.costPerItem}
                    onChange={(e) =>
                      setPricing((prev) => ({ ...prev, costPerItem: e.target.value }))
                    }
                    className={styles.input}
                  />
                </div>
              </div>

              {productType !== "variant" && (
                <div className={styles.grid2}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Available Stock Count</label>
                    <input
                      type="number"
                      placeholder="10"
                      value={pricing.stock}
                      onChange={(e) =>
                        setPricing((prev) => ({ ...prev, stock: e.target.value }))
                      }
                      className={styles.input}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "20px", marginTop: "8px" }}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={pricing.chargeTax}
                    onChange={(e) =>
                      setPricing((prev) => ({ ...prev, chargeTax: e.target.checked }))
                    }
                    className={styles.checkboxInput}
                  />
                  <span>Charge tax on this product</span>
                </label>

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={pricing.trackQuantity}
                    onChange={(e) =>
                      setPricing((prev) => ({ ...prev, trackQuantity: e.target.checked }))
                    }
                    className={styles.checkboxInput}
                  />
                  <span>Track inventory quantity</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ── 4. ORGANIZATION TAB ────────────────────────────────────────── */}
        {activeTab === "organization" && (
          <>
            {/* Status */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <ShieldCheck size={14} />
                  <span>Publication Status</span>
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.statusContainer}>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, status: "active" }))}
                    className={`${styles.statusPill} ${
                      form.status === "active" ? styles.statusPillActive : ""
                    }`}
                  >
                    <Check size={12} />
                    <span>Active</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, status: "draft" }))}
                    className={`${styles.statusPill} ${
                      form.status === "draft" ? styles.statusPillDraft : ""
                    }`}
                  >
                    <span>Draft</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, status: "archived" }))}
                    className={`${styles.statusPill} ${
                      form.status === "archived" ? styles.statusPillArchived : ""
                    }`}
                  >
                    <span>Archived</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Category Placement */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <FolderTree />
                  <span>Catalog Categories</span>
                </div>
              </div>

              <div className={styles.cardBody}>
                <p className={styles.hint}>
                  Select all relevant categories for this product. The first selected is treated as primary.
                </p>

                <div className={styles.chipsSelector}>
                  {allCategories.map((cat) => {
                    const id = cat.id || cat._id || "";
                    const isSelected = form.categoryIds.includes(id);
                    const isPrimary = form.primaryCategoryId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleCategory(id)}
                        className={`${styles.chipBtn} ${
                          isSelected ? styles.chipBtnSelected : ""
                        }`}
                      >
                        {isSelected ? <Check size={12} /> : <FolderTree size={12} />}
                        <span>{cat.name}</span>
                        {isPrimary && (
                          <span
                            style={{
                              fontSize: "9px",
                              background: "var(--admin-desktop-accent, #22c55e)",
                              color: "#051b0d",
                              padding: "1px 5px",
                              borderRadius: "4px",
                              fontWeight: 800,
                            }}
                          >
                            PRIMARY
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Product Layout Template */}
                <div className={styles.fieldGroup} style={{ marginTop: "12px" }}>
                  <label className={styles.label}>Product Layout Template</label>
                  <select
                    value={form.templateKey}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, templateKey: e.target.value }))
                    }
                    className={styles.select}
                  >
                    {PRODUCT_TEMPLATE_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label} — {opt.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Attribute Sets */}
            {allAttributes && allAttributes.length > 0 && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>
                    <Layers />
                    <span>Associated Attribute Sets</span>
                  </div>
                  <span className={styles.keyTag}>{form.attributeSetIds.length} Linked</span>
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.hint}>
                    Link attribute sets to specify technical and vertical specifications for this product.
                  </p>
                  <div className={styles.chipsSelector}>
                    {allAttributes.map((attr: any) => {
                      const id = attr.key || attr.id || attr._id || "";
                      const isSelected = form.attributeSetIds.includes(id);
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleAttributeSet(id)}
                          className={`${styles.chipBtn} ${
                            isSelected ? styles.chipBtnSelected : ""
                          }`}
                        >
                          {isSelected ? <Check size={12} /> : <Tag size={12} />}
                          <span>{attr.name || attr.key}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Related Products */}
            {allProducts && allProducts.length > 1 && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>
                    <Link2 />
                    <span>Cross-sell & Related Products</span>
                  </div>
                  <span className={styles.keyTag}>{form.relatedProductIds.length} Linked</span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.chipsSelector}>
                    {allProducts
                      .filter((p: any) => (p.id || p._id) !== (initialData?.id || initialData?._id))
                      .slice(0, 15)
                      .map((p: any) => {
                        const id = p.id || p._id;
                        const isSelected = form.relatedProductIds.includes(id);
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => toggleRelatedProduct(id)}
                            className={`${styles.chipBtn} ${
                              isSelected ? styles.chipBtnSelected : ""
                            }`}
                          >
                            {isSelected ? <Check size={12} /> : null}
                            <span>{p.name}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── 5. MEDIA GALLERY TAB ───────────────────────────────────────── */}
        {activeTab === "media" && (
          <div className={styles.productMediaCard}>
            <CanvasMediaLibraryModal
              isOpen={isMediaModalOpen}
              onClose={() => setIsMediaModalOpen(false)}
              onSelect={handleSelectFromLibrary}
            />

            <div className={styles.productMediaHeader}>
              <div className={styles.productMediaTitleWrap}>
                <div className={styles.productMediaAccentBar} />
                <h3 className={styles.productMediaTitle}>Product Media</h3>
              </div>
              <span className={styles.productMediaCount}>
                {gallery.length} / 10 Images
              </span>
            </div>

            <div className={styles.galleryGrid}>
              {/* Dashed Upload Image Card - Opens Canvas Media Library */}
              <div
                onClick={() => setIsMediaModalOpen(true)}
                className={styles.uploadMediaPlaceholder}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsMediaModalOpen(true);
                  }
                }}
              >
                <div className={styles.uploadMediaIconBox}>
                  <PlusCircle size={22} />
                </div>
                <span className={styles.uploadMediaText}>Upload Image</span>
              </div>

              {/* Existing Gallery Images */}
              {gallery.map((item) => {
                const isPrimary = primaryImageId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`${styles.galleryCard} ${
                      isPrimary ? styles.galleryCardPrimary : ""
                    }`}
                  >
                    <img
                      src={getMediaUrl(item.url)}
                      alt={item.alt || form.name || "Product Image"}
                      className={styles.galleryThumb}
                    />

                    {isPrimary && (
                      <div className={styles.primaryBadge}>Cover Image</div>
                    )}

                    <div className={styles.mediaHoverOverlay}>
                      <button
                        type="button"
                        onClick={() => setPrimaryImageId(item.id)}
                        className={`${styles.mediaActionBtn} ${
                          isPrimary ? styles.mediaActionBtnPrimaryActive : ""
                        }`}
                        title="Set as Primary"
                      >
                        <ShieldCheck size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(item.id)}
                        className={`${styles.mediaActionBtn} ${styles.mediaActionBtnRemove}`}
                        title="Remove"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* URL Input Area matching Image 2 */}
            <div className={styles.urlInputContainer}>
              <div className={styles.urlInputRow}>
                <input
                  type="text"
                  placeholder="Paste image URL to add..."
                  value={galleryUrlDraft}
                  onChange={(e) => setGalleryUrlDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addGalleryImage();
                    }
                  }}
                  className={styles.urlInput}
                />
                <button
                  type="button"
                  onClick={addGalleryImage}
                  disabled={!galleryUrlDraft.trim()}
                  className={styles.addUrlBtn}
                >
                  Add from URL
                </button>
              </div>
              <p className={styles.supportedFormats}>
                <span className={styles.formatDot} />
                Supported formats: JPG, PNG, WEBP
              </p>
            </div>
          </div>
        )}

        {/* ── 6. SEO & SEARCH TAB ────────────────────────────────────────── */}
        {activeTab === "seo" && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <Search />
                <span>Search Appearance & SERP Calibration</span>
              </div>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  SEO Title
                  <span className={styles.metaCount}>
                    {(form.metaTitle || form.name).length}/60
                  </span>
                </label>
                <input
                  type="text"
                  placeholder={form.name || "Product Title"}
                  value={form.metaTitle}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, metaTitle: e.target.value }))
                  }
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  SEO Description
                  <span className={styles.metaCount}>
                    {(form.metaDescription || form.description).length}/160
                  </span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain product benefits and key customer search terms..."
                  value={form.metaDescription}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      metaDescription: e.target.value,
                    }))
                  }
                  className={styles.textarea}
                />
              </div>

              {/* SERP Preview Box */}
              <div className={styles.serpPreview}>
                <span className={styles.serpUrl}>
                  yourdomain.com/products/{form.slug || "product-url"}
                </span>
                <p className={styles.serpTitle}>
                  {form.metaTitle || form.name || "Product Title"}
                </p>
                <p className={styles.serpDesc}>
                  {form.metaDescription ||
                    form.description ||
                    "Enter a search description to preview search crawler appearance."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Fixed Bottom Action Bar ────────────────────────────────────── */}
      <div className={styles.actionBar}>
        <button
          type="button"
          onClick={handleAutofill}
          className={styles.autofillBtn}
        >
          <WandSparkles size={13} />
          <span>Autofill Sample</span>
        </button>

        <button type="button" onClick={onCancel} className={styles.cancelBtn}>
          Cancel
        </button>

        <button
          type="submit"
          disabled={isLoading || !form.name.trim() || !form.sku.trim()}
          className={styles.submitBtn}
        >
          {isLoading ? (
            <div
              style={{
                width: "13px",
                height: "13px",
                border: "2px solid rgba(0,0,0,0.3)",
                borderTopColor: "#000",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
          ) : (
            <Save size={13} />
          )}
          <span>{isEditing ? "Save Changes" : "Create Product"}</span>
        </button>
      </div>
    </form>
  );
}
