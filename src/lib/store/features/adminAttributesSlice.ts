import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = "/api";

export const fetchAttributes = createAsyncThunk('adminAttributes/fetchAttributes', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/commerce/attribute-sets`, { credentials: "include" });
    if (!response.ok) throw new Error('Failed to fetch attributes');
    const data = await response.json();
    return data.data || data;
  } catch (err: any) { return rejectWithValue(err.message); }
});

interface AdminAttributesState {
  items: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  loading: boolean;
  hasAttributeFetched: boolean;
}

const initialState: AdminAttributesState = {
  items: [],
  status: 'idle',
  error: null,
  loading: false,
  hasAttributeFetched: false,
};

const adminAttributesSlice = createSlice({
  name: 'adminAttributes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAttributes.pending, (state) => {
      state.status = 'loading';
      state.loading = true;
    });
    builder.addCase(fetchAttributes.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.items = action.payload;
      state.loading = false;
      state.hasAttributeFetched = true;
    });
    builder.addCase(fetchAttributes.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message || 'Something went wrong';
      state.loading = false;
      state.hasAttributeFetched = true;
    });
  },
});

export default adminAttributesSlice.reducer;
