import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store/store";

export interface CartItem {
  id: string;
  _id?: string;
  cartItemId: string;
  productId: string;
  name: string;
  price: number;
  unitPriceMinor?: number;
  currency?: string;
  quantity: number;
  image: string;
  variantId?: string;
  variantName?: string;
  maxQuantity: number;
  size?: string;
  color?: string;
  slug?: string;
  sku?: string;
  selectedVariant?: {
    id?: string;
    _id?: string;
    sku?: string;
    price?: number | string;
    title?: string;
    image?: string;
    imageId?: string;
    stock?: number | string;
  };
  pricing?: {
    price?: number | string;
    compareAtPrice?: number | string;
  };
  selectedOptions?: Record<string, string>;
  gallery?: { id?: string; url: string; alt?: string; [key: string]: unknown }[];
  primaryImageId?: string;
  primaryCategoryId?: string;
}

export interface AddCartItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
  selectedOptions?: Record<string, string>;
  selectedVariant?: CartItem["selectedVariant"];
  [key: string]: unknown;
}

export interface CartState {
  items: CartItem[];
  couponCode: string | null;
  discount: number;
  loading: boolean;
  error: string | null;
  isDrawerOpen: boolean;
  hasCartFetched: boolean;
}

const initialState: CartState = {
  items: [],
  couponCode: null,
  discount: 0,
  loading: false,
  error: null,
  isDrawerOpen: false,
  hasCartFetched: false,
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(...values: unknown[]): string {
  const found = values.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
  return typeof found === "string" ? found.trim() : "";
}

function numberValue(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeCartItem(value: unknown): CartItem {
  const item = record(value);
  const selectedOptions = record(item.selectedOptions) as Record<string, string>;
  const cartItemId = stringValue(item.cartItemId, item.id, item._id);
  const unitPriceMinor = Number.isFinite(Number(item.unitPriceMinor))
    ? Number(item.unitPriceMinor)
    : undefined;
  const price = unitPriceMinor !== undefined
    ? unitPriceMinor / 100
    : numberValue(item.price ?? record(item.pricing).price);
  const sizeVal = stringValue(selectedOptions.size, selectedOptions.Size, item.size);
  const lengthVal = stringValue(selectedOptions.length, selectedOptions.Length, item.length);
  const colorVal = stringValue(selectedOptions.color, selectedOptions.Color, item.color);

  let formattedVariant = "";
  if (sizeVal || colorVal || lengthVal) {
    formattedVariant = [sizeVal, lengthVal, colorVal].filter(Boolean).join(" / ");
  }

  const rawVariantTitle = stringValue(item.variantTitle, item.variantName);
  let finalVariantName = formattedVariant || rawVariantTitle || Object.values(selectedOptions).filter(Boolean).join(" / ") || undefined;
  if (lengthVal && rawVariantTitle && !rawVariantTitle.includes(lengthVal)) {
    finalVariantName = `${rawVariantTitle} / ${lengthVal}`;
  }

  const maxQuantity = Math.max(
    1,
    numberValue(item.maxQuantity ?? item.stock ?? record(item.selectedVariant).stock, 99),
  );

  return {
    ...item,
    id: cartItemId,
    cartItemId,
    productId: stringValue(item.productId),
    name: stringValue(item.name, item.title) || "Product",
    price,
    ...(unitPriceMinor !== undefined ? { unitPriceMinor } : {}),
    currency: stringValue(item.currency) || "USD",
    quantity: Math.max(1, numberValue(item.quantity, 1)),
    image: stringValue(item.image) || "/placeholder.png",
    variantId: stringValue(item.variantId) || undefined,
    variantName: finalVariantName,
    maxQuantity,
    size: stringValue(selectedOptions.size, selectedOptions.Size, item.size) || undefined,
    color: stringValue(selectedOptions.color, selectedOptions.Color, item.color) || undefined,
    slug: stringValue(item.slug) || undefined,
    sku: stringValue(item.sku) || undefined,
    selectedOptions,
  };
}

function normalizeCartItems(value: unknown): CartItem[] {
  return Array.isArray(value) ? value.map(normalizeCartItem) : [];
}

async function requestCart(
  url: string,
  options: RequestInit = {},
): Promise<CartItem[]> {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      body.detail || body.message || body.error || "Unable to update cart",
    );
  }
  return normalizeCartItems(body.data ?? body.items ?? body);
}

export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await requestCart("/api/commerce/cart");
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unable to fetch cart",
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as any;
      if (state?.cart?.loading) {
        return false;
      }
    },
  },
);

export const addToCartAsync = createAsyncThunk(
  "cart/add",
  async (item: AddCartItemInput, { rejectWithValue }) => {
    try {
      return await requestCart("/api/commerce/cart", {
        method: "POST",
        body: JSON.stringify(item),
      });
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unable to add item",
      );
    }
  },
);

export const updateQuantityAsync = createAsyncThunk(
  "cart/update",
  async (
    { cartItemId, quantity }: { cartItemId: string; quantity: number },
    { rejectWithValue },
  ) => {
    try {
      return await requestCart("/api/commerce/cart", {
        method: "PUT",
        body: JSON.stringify({ cartItemId, quantity }),
      });
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unable to update item",
      );
    }
  },
);

export const removeFromCartAsync = createAsyncThunk(
  "cart/remove",
  async (cartItemId: string, { rejectWithValue }) => {
    try {
      return await requestCart(
        `/api/commerce/cart?cartItemId=${encodeURIComponent(cartItemId)}`,
        { method: "DELETE" },
      );
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unable to remove item",
      );
    }
  },
);

export const clearCartAsync = createAsyncThunk(
  "cart/clear",
  async (_, { rejectWithValue }) => {
    try {
      return await requestCart("/api/commerce/cart?clear=true", {
        method: "DELETE",
      });
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unable to clear cart",
      );
    }
  },
);

export const recoverCartAsync = createAsyncThunk(
  "cart/recover",
  async (token: string, { rejectWithValue }) => {
    try {
      return await requestCart("/api/commerce/cart/recover", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unable to recover cart",
      );
    }
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (
      state,
      action: PayloadAction<{
        productId: string;
        name: string;
        price: number;
        quantity: number;
        image: string;
        slug?: string;
        size?: string;
        color?: string;
      }>,
    ) => {
      const localId = [
        action.payload.productId,
        action.payload.size,
        action.payload.color,
      ].filter(Boolean).join("__");
      const existing = state.items.find((item) => item.id === localId);
      if (existing) {
        existing.quantity += action.payload.quantity;
        return;
      }
      state.items.push({
        ...action.payload,
        id: localId,
        cartItemId: localId,
        maxQuantity: 99,
        currency: "USD",
      });
    },
    clearCart: (state) => {
      state.items = [];
      state.couponCode = null;
      state.discount = 0;
    },
    updateQuantity: (
      state,
      action: PayloadAction<{
        id?: string;
        cartItemId?: string;
        quantity: number;
      }>,
    ) => {
      const id = action.payload.cartItemId || action.payload.id;
      const item = state.items.find(
        (candidate) => candidate.cartItemId === id || candidate.id === id,
      );
      if (item && action.payload.quantity > 0) {
        item.quantity = Math.min(action.payload.quantity, item.maxQuantity);
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload && item.cartItemId !== action.payload,
      );
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload && item.cartItemId !== action.payload,
      );
    },
    openCartDrawer: (state) => {
      state.isDrawerOpen = true;
    },
    closeCartDrawer: (state) => {
      state.isDrawerOpen = false;
    },
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state: CartState) => {
      state.loading = true;
      state.error = null;
    };
    const fulfilled = (state: CartState, action: PayloadAction<CartItem[]>) => {
      state.loading = false;
      state.items = action.payload;
      state.hasCartFetched = true;
    };
    const rejected = (state: CartState, action: PayloadAction<unknown>) => {
      state.loading = false;
      state.error = String(action.payload || "Cart request failed");
      state.hasCartFetched = true;
    };

    builder
      .addCase(fetchCart.pending, pending)
      .addCase(fetchCart.fulfilled, fulfilled)
      .addCase(fetchCart.rejected, rejected)
      .addCase(addToCartAsync.pending, pending)
      .addCase(addToCartAsync.fulfilled, fulfilled)
      .addCase(addToCartAsync.rejected, rejected)
      .addCase(updateQuantityAsync.pending, pending)
      .addCase(updateQuantityAsync.fulfilled, fulfilled)
      .addCase(updateQuantityAsync.rejected, rejected)
      .addCase(removeFromCartAsync.pending, pending)
      .addCase(removeFromCartAsync.fulfilled, fulfilled)
      .addCase(removeFromCartAsync.rejected, rejected)
      .addCase(clearCartAsync.pending, pending)
      .addCase(clearCartAsync.fulfilled, fulfilled)
      .addCase(clearCartAsync.rejected, rejected)
      .addCase(recoverCartAsync.pending, pending)
      .addCase(recoverCartAsync.fulfilled, fulfilled)
      .addCase(recoverCartAsync.rejected, rejected);
  },
});

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartTotal = (state: RootState) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
export const selectCartItemCount = (state: RootState) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartCount = selectCartItemCount;
export const selectCartDiscount = (state: RootState) => state.cart.discount;
export const selectCartLoading = (state: RootState) => state.cart.loading;
export const selectCartDrawerOpen = (state: RootState) => state.cart.isDrawerOpen;
export const selectHasCartFetched = (state: RootState) => state.cart.hasCartFetched;
export const selectShippingCost = (state: RootState) => {
  const total = selectCartTotal(state);
  return total > 0 ? Math.round(total * 0.05 * 100) / 100 : 0;
};

export const {
  addItem,
  clearCart,
  updateQuantity,
  removeItem,
  removeFromCart,
  openCartDrawer,
  closeCartDrawer,
  clearCartError,
} = cartSlice.actions;

export const fetchCartThunk = fetchCart;
export const addToCartThunk = addToCartAsync;
export const updateCartItemThunk = updateQuantityAsync;
export const removeCartItemThunk = removeFromCartAsync;
export const recoverCartThunk = recoverCartAsync;

export default cartSlice.reducer;
