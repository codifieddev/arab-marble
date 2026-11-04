import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '@/lib/store/store';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'user' | 'admin' | 'customer' | 'tenant_admin';
  first_name?: string;
  last_name?: string;
  createdAt?: string;
  wishlist?: string[];
  addresses?: Address[];
  tenant_id?: string;
  tenantId?: string;
  tenant_slug?: string;
  tenantSlug?: string;
  tenant_db?: string;
  tenantDb?: string;
  isTenantOwner?: boolean;
}

export interface Address {
  id?: string;
  label?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export type AddInProfile = Address;

function normalizeUser(value: any): User {
  return {
    ...value,
    id: String(value?.id || value?._id || ''),
    email: value?.email || '',
    firstName: value?.firstName || value?.first_name || '',
    lastName: value?.lastName || value?.last_name || '',
    first_name: value?.first_name || value?.firstName || '',
    last_name: value?.last_name || value?.lastName || '',
    phone: value?.phone || '',
    role: value?.role || 'customer',
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  isLoading: false,
  error: null,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textError = await response.text();
        console.error("Non-JSON response received:", textError.substring(0, 200));
        throw new Error("Backend API is unreachable or returned an invalid HTML response (e.g. 404/500). Please check your .env API URLs.");
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || "Login failed");
      
      return {
        status: response.status,
        user: normalizeUser(data.session || data.customer || data.user),
        token:data.access_token
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; password: string; firstName: string; lastName: string; phone: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || 'Registration failed');
      return {
        user: normalizeUser(data.session || data.customer || data.user),
        token: data.access_token,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMeThunk = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || 'Session unavailable');
      return { user: normalizeUser(data.user || data) };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || data.message || 'Logout failed');
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateProfileThunk = createAsyncThunk(
  'auth/updateProfile',
  async ({ userData }: { userData: Record<string, unknown> }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/customer/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || data.message || 'Profile update failed');
      const user = normalizeUser(data.customer || data.user || data.data);
      return { ...data, data: user, user };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateWishlistThunk = createAsyncThunk(
  'auth/updateWishlist',
  async ({ productId, add }: { productId: string; add: boolean }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/auth/customer/wishlist/${encodeURIComponent(productId)}`, {
        method: add ? 'PUT' : 'DELETE',
        credentials: 'include',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || data.message || 'Wishlist update failed');
      return normalizeUser(data.customer || data.user || data.data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const signupThunk = createAsyncThunk(
  'auth/signup',
  async (input: Record<string, any>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...input,
          firstName: input.firstName || input.first_name,
          lastName: input.lastName || input.last_name,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || data.message || 'Registration failed');
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const getUserThunk = fetchMeThunk;

export function isTokenExpired(token: string | null): boolean {
  if (!token || typeof token !== 'string') return true;
  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      (typeof window !== 'undefined' && window.atob
        ? window.atob(base64)
        : Buffer.from(base64, 'base64').toString('binary'))
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    if (!parsed || typeof parsed.exp !== 'number') return false;
    const nowSec = Math.floor(Date.now() / 1000);
    return nowSec >= parsed.exp - 5;
  } catch {
    return false;
  }
}

export const clearLocalStorageAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    if (typeof document !== 'undefined') {
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    logoutLocal: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.isLoading = false;
      state.error = null;
      clearLocalStorageAuth();
    },
    setAuth: (state, action: PayloadAction<{ access_token: string; expires_at: string; session: any }>) => {
      const token = action.payload.access_token;
      if (isTokenExpired(token)) {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        clearLocalStorageAuth();
        return;
      }
      state.token = token;
      state.user = normalizeUser(action.payload.session);
      state.isAuthenticated = !!action.payload.session;
    },
    setCredentials: (state, action: PayloadAction<{ user: any; token?: string }>) => {
      if (action.payload.token && isTokenExpired(action.payload.token)) {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        clearLocalStorageAuth();
        return;
      }
      state.user = normalizeUser(action.payload.user);
      state.token = action.payload.token || state.token;
      state.isAuthenticated = Boolean(action.payload.user);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginThunk.pending, (state) => {
      state.loading = true;
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    });
    builder.addCase(loginThunk.rejected, (state, action) => {
      state.loading = false;
      state.isLoading = false;
      state.error = action.payload as string;
    });
    builder.addCase(registerThunk.pending, (state) => {
      state.loading = true;
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    });
    builder.addCase(registerThunk.rejected, (state, action) => {
      state.loading = false;
      state.isLoading = false;
      state.error = action.payload as string;
    });
    builder.addCase(fetchMeThunk.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchMeThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    });
    builder.addCase(fetchMeThunk.rejected, (state) => {
      state.isLoading = false;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      clearLocalStorageAuth();
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      clearLocalStorageAuth();
    });
    builder.addCase(logout.rejected, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      clearLocalStorageAuth();
    });
    builder.addCase(updateProfileThunk.fulfilled, (state, action) => {
      state.user = action.payload.user;
    });
    builder.addCase(updateWishlistThunk.fulfilled, (state, action) => {
      state.user = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    });
    builder.addCase(signupThunk.fulfilled, (state, action) => {
      const user = normalizeUser(action.payload.session || action.payload.customer || action.payload.user);
      state.user = user;
      state.token = action.payload.access_token || null;
      state.isAuthenticated = Boolean(user.id);
    });
  },
});

export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;

export const { clearAuthError, logoutLocal, setAuth, setCredentials } = authSlice.actions;
export default authSlice.reducer;
