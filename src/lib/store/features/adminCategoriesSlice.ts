import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = "/api";

export const fetchCategories = createAsyncThunk('adminCategories/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/commerce/categories`, { credentials: "include" });
    if (!response.ok) throw new Error('Failed to fetch categories');
    const data = await response.json();
    const list = Array.isArray(data.data) ? data.data : Array.isArray(data.categories) ? data.categories : Array.isArray(data) ? data : [];
    return list;
  } catch (err: any) { return rejectWithValue(err.message); }
});

interface AdminCategoriesState {
  items: any[];
  allCategories: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  loading: boolean;
  categoryLoading: boolean;
  isFetched: boolean;
}

const initialState: AdminCategoriesState = {
  items: [],
  allCategories: [],
  status: 'idle',
  error: null,
  loading: false,
  categoryLoading: false,
  isFetched: false,
};

const adminCategoriesSlice = createSlice({
  name: 'adminCategories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCategories.pending, (state) => {
      state.status = 'loading';
      state.loading = true;
      state.categoryLoading = true;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.items = action.payload;
      state.allCategories = action.payload;
      state.loading = false;
      state.categoryLoading = false;
      state.isFetched = true;
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message || 'Something went wrong';
      state.loading = false;
      state.categoryLoading = false;
      state.isFetched = true;
    });
  },
});

export default adminCategoriesSlice.reducer;
