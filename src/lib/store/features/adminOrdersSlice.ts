import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = "/api";

interface AdminOrdersState {
  items: any[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminOrdersState = { items: [], loading: true, error: null };

export const fetchOrders = createAsyncThunk('adminOrders/fetchOrders', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/commerce/orders`, { credentials: "include" });
    if (!response.ok) throw new Error('Failed to fetch orders');
    const data = await response.json();
    return Array.isArray(data) ? data : (data.orders || data.data || []);
  } catch (err: any) { return rejectWithValue(err.message); }
});

const adminOrdersSlice = createSlice({
  name: 'adminOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchOrders.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchOrders.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; });
    builder.addCase(fetchOrders.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Error loading orders'; });
  },
});

export const selectAdminOrders = (state: any) => state.adminOrders?.items || [];
export default adminOrdersSlice.reducer;
