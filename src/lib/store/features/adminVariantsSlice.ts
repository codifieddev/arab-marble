import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = "/api";

export const fetchVariants = createAsyncThunk('adminVariants/fetchVariants', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/commerce/variants`, { credentials: "include" });
    if (!response.ok) throw new Error('Failed to fetch variants');
    return response.json();
  } catch (err: any) { return rejectWithValue(err.message); }
});

interface AdminVariantsState {
  items: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AdminVariantsState = { items: [], status: 'idle', error: null };

const adminVariantsSlice = createSlice({
  name: 'adminVariants',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchVariants.pending, (state) => { state.status = 'loading'; });
    builder.addCase(fetchVariants.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = action.payload; });
    builder.addCase(fetchVariants.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message || 'Something went wrong'; });
  },
});

export default adminVariantsSlice.reducer;
