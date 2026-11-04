import { createAsyncThunk } from "@reduxjs/toolkit";
import type { ProductFormState } from "./productsSlices";
import { normalizeCommerceProduct } from "@/lib/commerce/product-normalization";

export const BATCH_SIZE = 50;

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (_, { rejectWithValue }) => {
    // const slug = "peekeeper-escape-proof-dog-diaper";
    try {
      const res = await fetch(`/api/commerce/products`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch products");
      return {
        ...data,
        data: Array.isArray(data.data)
          ? data.data.map(normalizeCommerceProduct)
          : [],
      };
    } catch (err: any) { return rejectWithValue(err.message); }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as any;
      if (state?.products?.loading) {
        return false;
      }
    },
  }
);

export const fetchProductById = createAsyncThunk("products/fetchById", async (id: string, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/commerce/products/${encodeURIComponent(id)}`, { credentials: "include" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch product");
    return { data: normalizeCommerceProduct(data.data || data) };
  } catch (err: any) { return rejectWithValue(err.message); }
});

export const saveProduct = createAsyncThunk(
  "products/save",
  async (product: { data: ProductFormState; editingId?: string }, { rejectWithValue }) => {
    try {
      const endpoint = product.editingId
        ? `/api/commerce/products/${encodeURIComponent(product.editingId)}`
        : `/api/commerce/products`;
      const method = product.editingId ? "PUT" : "POST";

      const raw = product.data as any;
      const cleanData: any = { ...raw };

      // Ensure root price / compareAtPrice are numeric or null
      if (cleanData.price !== undefined) {
        cleanData.price = cleanData.price !== "" && !isNaN(Number(cleanData.price)) ? Number(cleanData.price) : 0;
      }
      if (cleanData.compareAtPrice !== undefined) {
        cleanData.compareAtPrice =
          cleanData.compareAtPrice !== "" && !isNaN(Number(cleanData.compareAtPrice)) && Number(cleanData.compareAtPrice) > 0
            ? Number(cleanData.compareAtPrice)
            : null;
      }

      if (cleanData.pricing) {
        const p = cleanData.pricing;
        cleanData.pricing = {
          ...p,
          price: p.price !== undefined && p.price !== "" && !isNaN(Number(p.price)) ? Number(p.price) : 0,
          compareAtPrice:
            p.compareAtPrice !== undefined && p.compareAtPrice !== "" && !isNaN(Number(p.compareAtPrice)) && Number(p.compareAtPrice) > 0
              ? Number(p.compareAtPrice)
              : null,
          costPerItem:
            p.costPerItem !== undefined && p.costPerItem !== "" && !isNaN(Number(p.costPerItem)) && Number(p.costPerItem) > 0
              ? Number(p.costPerItem)
              : null,
          chargeTax: Boolean(p.chargeTax !== false),
          trackQuantity: Boolean(p.trackQuantity !== false),
        };
      }

      if (Array.isArray(cleanData.variants)) {
        cleanData.variants = cleanData.variants.map((v: any) => ({
          ...v,
          price: v.price !== undefined && v.price !== "" && !isNaN(Number(v.price)) ? Number(v.price) : 0,
          compareAtPrice:
            v.compareAtPrice !== undefined && v.compareAtPrice !== "" && !isNaN(Number(v.compareAtPrice)) && Number(v.compareAtPrice) > 0
              ? Number(v.compareAtPrice)
              : null,
        }));
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanData),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to save product");
      return { data: data.data, editingId: product.editingId };
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

export const deleteProduct = createAsyncThunk("products/delete", async (id: string, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/commerce/products/${encodeURIComponent(id)}`, { method: "DELETE", credentials: "include" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete product");
    return { id };
  } catch (err: any) { return rejectWithValue(err.message); }
});

export const bulkImportProducts = createAsyncThunk(
  "products/bulkImport",
  async (products: any[], { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/commerce/products/importproduct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(products),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to import products");
      return data;
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  "products/fetchByCategory",
  async (
    {
      category,
      filters,
      offset = 0,
      limit = BATCH_SIZE,
    }: {
      category: string;
      filters: Record<string, string>;
      offset?: number;
      limit?: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const { page: _page, perPage: _perPage, ...realFilters } = filters;
      const params = new URLSearchParams(realFilters);
      params.set("page", String(offset / limit + 1));
      params.set("perPage", String(limit));

      const res = await fetch(
        `/api/commerce/products?category=${encodeURIComponent(category)}&${params.toString()}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch products");
      return {
        ...data,
        data: Array.isArray(data.data)
          ? data.data.map(normalizeCommerceProduct)
          : [],
      };
    } catch (err: any) { return rejectWithValue(err.message); }
  }
);
