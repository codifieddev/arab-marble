import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export type CategoryType = "product" | "portfolio" | "blog";

export type CategoryRecord = {
  id?: string;
  _id?: string;
  name?: string;
  title?: string | Record<string, string>;
  slug: string;
  type: CategoryType;
  parentId?: string | null;
  description?: string | Record<string, string>;
  entityCount?: number;
  pageStatus?: string;
  bannerImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  banner?: { altText?: string; caption?: string; url?: string };
};

type CategoryState = {
  allCategories: CategoryRecord[];
  categoryLoading: boolean;
  categoryError: string | null;
  hasCategoriesFetched: boolean;
};

const initialState: CategoryState = {
  allCategories: [],
  categoryLoading: false,
  categoryError: null,
  hasCategoriesFetched: false,
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/commerce/categories`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || "Failed to fetch categories");
      const list = Array.isArray(data.data) ? data.data : Array.isArray(data.categories) ? data.categories : Array.isArray(data) ? data : [];
      return list;
    } catch (err: any) { return rejectWithValue(err.message); }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as any;
      if (state?.categories?.categoryLoading) {
        return false;
      }
    },
  }
);

export const createCategory = createAsyncThunk("categories/create", async (cat: CategoryRecord, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/commerce/categories`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cat), credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || "Failed to create category");
    return data.data || data;
  } catch (err: any) { return rejectWithValue(err.message); }
});

export const updateCategory = createAsyncThunk("categories/update", async (cat: CategoryRecord, { rejectWithValue }) => {
  try {
    const id = cat.id || cat._id;
    if (!id) throw new Error("Category ID is required");
    const res = await fetch(`/api/commerce/categories/${encodeURIComponent(id)}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cat), credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || "Failed to update category");
    return data.data || data;
  } catch (err: any) { return rejectWithValue(err.message); }
});

export const deleteCategory = createAsyncThunk("categories/delete", async (id: string, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/commerce/categories/${encodeURIComponent(id)}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || data.message || "Failed to delete category");
    }
    return id;
  } catch (err: any) { return rejectWithValue(err.message); }
});

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setAllCategories: (state, action: PayloadAction<CategoryRecord[]>) => { state.allCategories = action.payload; },
    setLoading: (state, action: PayloadAction<boolean>) => { state.categoryLoading = action.payload; },
    setError: (state, action: PayloadAction<string | null>) => { state.categoryError = action.payload; },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCategories.pending, (state) => { state.categoryLoading = true; state.hasCategoriesFetched = false; });
    builder.addCase(fetchCategories.fulfilled, (state, action) => { state.categoryLoading = false; state.allCategories = action.payload; state.hasCategoriesFetched = true; });
    builder.addCase(fetchCategories.rejected, (state, action) => { state.categoryLoading = false; state.hasCategoriesFetched = true; state.categoryError = action.payload as string; });
    builder.addCase(createCategory.fulfilled, (state, action) => { state.allCategories = [action.payload, ...state.allCategories]; });
    builder.addCase(updateCategory.fulfilled, (state, action) => { state.allCategories = state.allCategories.map((c) => c._id === action.payload._id ? action.payload : c); });
    builder.addCase(deleteCategory.fulfilled, (state, action) => { state.allCategories = state.allCategories.filter((c) => c._id !== action.payload); });
  },
});

export const { setAllCategories, setLoading, setError } = categorySlice.actions;
export default categorySlice.reducer;
