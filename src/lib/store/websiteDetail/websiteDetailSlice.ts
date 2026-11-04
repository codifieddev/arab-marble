import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const API_BASE_URL = "/api";

interface WebsiteDetail {
  _id?: string;
  name?: string;
  domain?: string;
  tenantId?: string;
  status?: string;
  settings?: Record<string, any>;
  [key: string]: any;
}

interface WebsiteDetailState {
  detail: WebsiteDetail | null;
  websiteDetail: WebsiteDetail | null;
  loading: boolean;
  error: string | null;
  isFetchedWebsiteDetail: boolean;
}

const initialState: WebsiteDetailState = {
  detail: null,
  websiteDetail: null,
  loading: false,
  error: null,
  isFetchedWebsiteDetail: false,
};

export const fetchWebsiteDetail = createAsyncThunk("websiteDetail/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/website`, { credentials: "include" });
    const data = await res.json();
    return data.data || data;
  } catch (err: any) { return rejectWithValue(err.message); }
});

export const updateWebsiteDetail = createAsyncThunk("websiteDetail/update", async (detail: WebsiteDetail, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/website`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(detail), credentials: "include",
    });
    const data = await res.json();
    return data.data || data;
  } catch (err: any) { return rejectWithValue(err.message); }
});

const websiteDetailSlice = createSlice({
  name: "websiteDetail",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchWebsiteDetail.pending, (state) => { state.loading = true; });
    builder.addCase(fetchWebsiteDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.detail = action.payload;
      state.websiteDetail = action.payload;
      state.isFetchedWebsiteDetail = true;
    });
    builder.addCase(fetchWebsiteDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.isFetchedWebsiteDetail = true;
    });
    builder.addCase(updateWebsiteDetail.fulfilled, (state, action) => {
      state.detail = action.payload;
      state.websiteDetail = action.payload;
    });
  },
});

export default websiteDetailSlice.reducer;

export const fetchWebsiteDetailThunk = fetchWebsiteDetail;
