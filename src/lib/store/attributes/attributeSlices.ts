import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const API_BASE_URL = "/api";

export interface AttributeSetRecord {
  _id: string;
  name: string;
  key?: string;
  appliesTo?: string;
  contexts?: string[];
  description?: string;
  attributes?: Array<{ key?: string; label?: string; type?: string; options?: string[]; enabled?: boolean }>;
  isSystem?: boolean;
  businessType?: string;
}

interface AttributeState {
  allAttributes: AttributeSetRecord[];
  loading: boolean;
  error: string | null;
  hasFetched: boolean;
}

const initialState: AttributeState = { allAttributes: [], loading: false, error: null, hasFetched: false };

export const fetchAttributes = createAsyncThunk("attributes/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/commerce/attribute-sets`, { credentials: "include" });
    const data = await res.json();
    return data;
  } catch (err: any) { return rejectWithValue(err.message); }
});

export const createAttributeSet = createAsyncThunk("attributes/create", async (attr: AttributeSetRecord, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/commerce/attribute-sets`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(attr), credentials: "include",
    });
    const data = await res.json();
    return data;
  } catch (err: any) { return rejectWithValue(err.message); }
});

export const updateAttributeSet = createAsyncThunk("attributes/update", async (attr: AttributeSetRecord, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/commerce/attribute-sets/${attr._id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(attr), credentials: "include",
    });
    const data = await res.json();
    return data;
  } catch (err: any) { return rejectWithValue(err.message); }
});

export const deleteAttributeSet = createAsyncThunk("attributes/delete", async (id: string, { rejectWithValue }) => {
  try {
    await fetch(`${API_BASE_URL}/commerce/attribute-sets/${id}`, { method: "DELETE", credentials: "include" });
    return { data: id };
  } catch (err: any) { return rejectWithValue(err.message); }
});

const attributeSlice = createSlice({
  name: "attributes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAttributes.pending, (state) => { state.loading = true; state.hasFetched = false; });
    builder.addCase(fetchAttributes.fulfilled, (state, action) => { state.loading = false; state.allAttributes = action.payload.data || []; state.hasFetched = true; });
    builder.addCase(fetchAttributes.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; state.hasFetched = true; });
    builder.addCase(createAttributeSet.fulfilled, (state, action) => { state.allAttributes = [action.payload.data, ...state.allAttributes]; });
    builder.addCase(updateAttributeSet.fulfilled, (state, action) => { state.allAttributes = state.allAttributes.map((a) => a._id === action.payload.data._id ? action.payload.data : a); });
    builder.addCase(deleteAttributeSet.fulfilled, (state, action) => { state.allAttributes = state.allAttributes.filter((a) => a._id !== action.payload.data); });
  },
});

export default attributeSlice.reducer;
