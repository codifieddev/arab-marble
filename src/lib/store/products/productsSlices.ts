import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductOption, ProductGalleryItem, VariantRow } from "@/lib/admin-products/utils";
import {
  fetchProducts,
  fetchProductById,
  saveProduct,
  deleteProduct,
  bulkImportProducts,
  fetchProductsByCategory,
  BATCH_SIZE,
} from "./productsThunk";

export type { ProductOption, ProductGalleryItem, VariantRow };
export { BATCH_SIZE, fetchProducts, fetchProductById, saveProduct, deleteProduct, bulkImportProducts, fetchProductsByCategory };

export interface ProductFormState {
  _id?: string;
  id?: string;
  name: string;
  sku: string;
  slug: string;
  description: string;
  detailsTabs?: Array<{ key?: string; label?: string; content?: string }>;
  status: string;
  type: string;
  categoryIds: string[];
  attributeSetIds: string[];
  pricing: {
    price: string;
    compareAtPrice: string;
    costPerItem: string;
    chargeTax: boolean;
    trackQuantity: boolean;
  };
  options: ProductOption[];
  variants: VariantRow[];
  gallery: ProductGalleryItem[];
  primaryImageId: string;
  primaryCategoryId: string;
  relatedProductIds: string[];
  templateKey: string;
  price?: string;
  rating?: number | string;
  reviewCount?: number | string;
}

interface ProductsState {
  allProducts: ProductFormState[];
  currentProduct: ProductFormState | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  hasFetched: boolean;
  cmsFilters: any[];
  totalProducts: number;
  loadingMore: boolean;
}

const initialFormState: ProductFormState = {
  name: "", sku: "", slug: "", description: "", status: "active", type: "physical",
  detailsTabs: [],
  categoryIds: [], attributeSetIds: [],
  pricing: { price: "", compareAtPrice: "", costPerItem: "", chargeTax: true, trackQuantity: true },
  options: [], variants: [], gallery: [], primaryImageId: "", primaryCategoryId: "",
  relatedProductIds: [], templateKey: "product-split",
};

const initialState: ProductsState = {
  allProducts: [], currentProduct: initialFormState,
  loading: false, saving: false, error: null, hasFetched: false,
  cmsFilters: [],
  totalProducts: 0, loadingMore: false,
};

function buildDetailsTabs(product: any) {
  if (Array.isArray(product.detailsTabs)) return product.detailsTabs;

  const descriptionTab = product.descriptionTab || product.productDescriptionTab;
  const shippingReturnsTab = product.shippingReturnsTab || product.shippingTab || product.shipping;

  return [
    { key: "description", label: "Description", content: descriptionTab || "" },
    { key: "shipping-returns", label: "Shipping & Returns", content: shippingReturnsTab || "" },
  ].filter((tab) => tab.content);
}

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProductFormField: (state, action: PayloadAction<{ field: keyof ProductFormState; value: any }>) => {
      if (state.currentProduct) (state.currentProduct as any)[action.payload.field] = action.payload.value;
    },
    setPricingField: (state, action: PayloadAction<{ field: keyof ProductFormState["pricing"]; value: any }>) => {
      if (state.currentProduct) (state.currentProduct.pricing as any)[action.payload.field] = action.payload.value;
    },
    resetProductForm: (state) => { state.currentProduct = initialFormState; },
    setCurrentProduct: (state, action: PayloadAction<ProductFormState>) => { state.currentProduct = action.payload; },
    updateLocalProduct: (state, action: PayloadAction<any>) => {
      const updated = action.payload;
      const targetId = String(updated.id || updated._id || updated.slug || '');
      state.allProducts = state.allProducts.map((p) => {
        if (String(p.id || p._id || p.slug || '') === targetId) {
          return {
            ...p,
            ...updated,
            pricing: {
              ...(p.pricing || {}),
              ...(updated.pricing || {}),
              price: updated.price !== undefined ? String(updated.price) : p.pricing?.price,
              compareAtPrice: updated.compareAtPrice !== undefined ? String(updated.compareAtPrice) : p.pricing?.compareAtPrice,
            },
          };
        }
        return p;
      });
      if (state.currentProduct && String(state.currentProduct.id || state.currentProduct._id || state.currentProduct.slug || '') === targetId) {
        state.currentProduct = {
          ...state.currentProduct,
          ...updated,
          pricing: {
            ...(state.currentProduct.pricing || {}),
            ...(updated.pricing || {}),
            price: updated.price !== undefined ? String(updated.price) : state.currentProduct.pricing?.price,
            compareAtPrice: updated.compareAtPrice !== undefined ? String(updated.compareAtPrice) : state.currentProduct.pricing?.compareAtPrice,
          },
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.hasFetched = false; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.allProducts = action.payload.data || [];
        state.cmsFilters = action.payload.filters || [];
        state.totalProducts = action.payload.totalProducts ?? action.payload.data?.length ?? 0;
        state.hasFetched = true;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; state.hasFetched = true; })

      .addCase(fetchProductById.pending, (state) => { state.loading = true; })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        const p: ProductFormState = action.payload.data || action.payload;
        state.currentProduct = {
          _id: p._id,
          id: p.id || p._id,
          name: p.name || "",
          sku: p.sku || "",
          slug: p.slug || "",
          description: p.description || "",
          detailsTabs: buildDetailsTabs(p),
          status: p.status || "active",
          type: p.type || "physical",
          categoryIds: Array.isArray(p.categoryIds) ? p.categoryIds : [],
          attributeSetIds: Array.isArray(p.attributeSetIds) ? p.attributeSetIds : [],
          pricing: {
            price: String(p.pricing?.price ?? p.price ?? ""),
            compareAtPrice: String(p.pricing?.compareAtPrice ?? ""),
            costPerItem: String(p.pricing?.costPerItem ?? ""),
            chargeTax: p.pricing?.chargeTax !== false,
            trackQuantity: p.pricing?.trackQuantity !== false,
          },
          options: Array.isArray(p.options) ? p.options : [],
          variants: (p.variants || []).map((v: any, i: number) => ({
            _id: v._id || `v-${i}`,
            optionValues: v.optionValues || {},
            sku: v.sku || "",
            price: String(v.price ?? ""),
            stock: String(v.stock ?? ""),
            status: v.status || "active",
            createdAt: v.createdAt || "",
            title: v.title || "",
          })),
          gallery: p.gallery || [],
          primaryImageId: p.primaryImageId || "",
          primaryCategoryId: p.primaryCategoryId || "",
          relatedProductIds: p.relatedProductIds || [],
          templateKey: p.templateKey || "product-split",
        };
      })
      .addCase(fetchProductById.rejected, (state, action) => { state.loading = false; state.currentProduct = null; state.error = action.payload as string; })

      .addCase(saveProduct.pending, (state) => { state.saving = true; })
      .addCase(saveProduct.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload.editingId) {
          state.allProducts = state.allProducts.map((p) =>
            p._id === action.payload.editingId ? action.payload.data : p,
          );
        } else {
          state.allProducts.push(action.payload.data);
        }
      })
      .addCase(saveProduct.rejected, (state, action) => { state.saving = false; state.error = action.payload as string; })

      .addCase(deleteProduct.pending, (state) => { state.loading = true; })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.allProducts = state.allProducts.map((p) =>
          p._id === action.payload.id ? { ...p, status: "archived" } : p,
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      .addCase(bulkImportProducts.fulfilled, (state, action) => {
        state.allProducts.push(...(action.payload.data || action.payload));
      })
      .addCase(bulkImportProducts.rejected, (state, action) => { state.error = action.payload as string; })

      .addCase(fetchProductsByCategory.pending, (state, action) => {
        if (action.meta.arg?.offset && action.meta.arg.offset > 0) {
          state.loadingMore = true;
        } else {
          state.loading = true;
          state.hasFetched = false;
        }
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        const newProducts = action.payload.data ?? [];
        const isAppend = !!action.meta.arg?.offset;

        if (isAppend) {
          const existingIds = new Set(state.allProducts.map((p) => p.id || p._id));
          state.allProducts.push(
            ...newProducts.filter((p: any) => !existingIds.has(p.id || p._id)),
          );
        } else {
          state.allProducts = newProducts;
        }

        state.totalProducts = action.payload.totalProducts ?? newProducts.length;
        state.cmsFilters = action.payload.filters ?? state.cmsFilters;
        state.loading = false;
        state.loadingMore = false;
        state.hasFetched = true;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload as string;
        state.hasFetched = true;
      });
  },
});

export const {
  setProductFormField,
  setPricingField,
  resetProductForm,
  setCurrentProduct,
  updateLocalProduct,
} = productsSlice.actions;
export default productsSlice.reducer;
