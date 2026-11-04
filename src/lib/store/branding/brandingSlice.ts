import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const API_BASE_URL = "/api";

interface BrandingConfig {
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  country?: string;
  language?: string;
  businessName?: string;
  tagline?: string;
  [key: string]: any;
}

interface BrandingState {
  config: BrandingConfig | null;
  loading: boolean;
  error: string | null;
}

const initialState: BrandingState = { config: null, loading: false, error: null };

export const fetchBranding = createAsyncThunk("branding/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/branding`, { credentials: "include" });
    const data = await res.json();
    return data.data || data;
  } catch (err: any) { return rejectWithValue(err.message); }
});

export const updateBranding = createAsyncThunk("branding/update", async (config: BrandingConfig, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/branding`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config), credentials: "include",
    });
    const data = await res.json();
    return data.data || data;
  } catch (err: any) { return rejectWithValue(err.message); }
});

const brandingSlice = createSlice({
  name: "branding",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchBranding.pending, (state) => { state.loading = true; });
    builder.addCase(fetchBranding.fulfilled, (state, action) => { state.loading = false; state.config = action.payload; });
    builder.addCase(fetchBranding.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    builder.addCase(updateBranding.fulfilled, (state, action) => { state.config = action.payload; });
  },
});

export default brandingSlice.reducer;
