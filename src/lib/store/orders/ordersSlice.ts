import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  cancelOrder,
  getOrderById,
  getOrders,
  requestOrderReturn,
  type Order,
  type OrderReturnRequest,
} from "@/lib/services/orders";
import { logout } from "@/lib/store/auth/authSlice";

interface OrdersState {
  orders: Order[];
  selectedOrder: Order | null;
  loading: boolean;
  error: string | null;
  actionLoading: boolean;
  actionError: string | null;
}

const initialState: OrdersState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  actionLoading: false,
  actionError: null,
};

export const fetchOrders = createAsyncThunk<
  Order[],
  { userId?: string; email?: string; scope?: string } | void,
  { rejectValue: string }
>(
  "orders/fetchAll",
  async (input, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const currentAuthUser = state?.auth?.user;
      const userId = input?.userId || currentAuthUser?.id || currentAuthUser?.userId || currentAuthUser?.customerId;
      const email = input?.email || currentAuthUser?.email;
      const scope = input?.scope || (currentAuthUser ? "self" : undefined);
      return await getOrders(userId, email, scope);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch orders");
    }
  },
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchById",
  async (payload: string | { id: string; token?: string }, { rejectWithValue }) => {
    try {
      const id = typeof payload === "string" ? payload : payload.id;
      const token = typeof payload === "string" ? undefined : payload.token;
      return await getOrderById(id, token);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch order");
    }
  },
);

export const cancelOrderThunk = createAsyncThunk<
  Order,
  { id: string; reason: string; note?: string; idempotencyKey: string },
  { rejectValue: string }
>("orders/cancel", async ({ id, ...input }, { rejectWithValue }) => {
  try {
    return await cancelOrder(id, input);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to cancel order");
  }
});

export const requestOrderReturnThunk = createAsyncThunk<
  OrderReturnRequest,
  {
    id: string;
    reasonSummary: string;
    notes?: string;
    idempotencyKey: string;
    lines: Array<{ orderLineId: string; quantity: number; resolutionType: "refund" | "exchange" }>;
  },
  { rejectValue: string }
>("orders/requestReturn", async ({ id, ...input }, { rejectWithValue }) => {
  try {
    return await requestOrderReturn(id, input);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to request return");
  }
});

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrders(state) {
      state.orders = [];
      state.selectedOrder = null;
      state.error = null;
    },
    clearSelectedOrder(state) {
      state.selectedOrder = null;
    },
    clearOrderActionError(state) {
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(cancelOrderThunk.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(cancelOrderThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedOrder = action.payload;
        const index = state.orders.findIndex((order) => order.id === action.payload.id);
        if (index >= 0) state.orders[index] = action.payload;
      })
      .addCase(cancelOrderThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Failed to cancel order";
      })
      .addCase(requestOrderReturnThunk.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(requestOrderReturnThunk.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(requestOrderReturnThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Failed to request return";
      })
      .addCase(logout.fulfilled, (state) => {
        state.orders = [];
        state.selectedOrder = null;
        state.error = null;
      });
  },
});

export const { clearOrders, clearSelectedOrder, clearOrderActionError } = ordersSlice.actions;
export default ordersSlice.reducer;
