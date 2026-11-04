import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '@/lib/store/store';
import type { BlueprintPayload, Theme, BrandValue, BusinessProfile, Navigation } from './blueprintType';

async function fetchWithTenant(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const fetchBlueprintThunk = createAsyncThunk(
  'blueprint/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithTenant('/api/platform/business-blueprint');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBlueprintThunk = createAsyncThunk(
  'blueprint/update',
  async (payload: BlueprintPayload, { rejectWithValue }) => {
    try {
      const response = await fetchWithTenant('/api/platform/business-blueprint', {
        method: 'PUT',
        body: JSON.stringify({ payload }),
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateThemeThunk = createAsyncThunk(
  'blueprint/updateTheme',
  async ({ context, theme }: { context: 'public' | 'admin'; theme: Partial<Theme> }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const currentPayload = state.blueprint.payload;

    if (!currentPayload) {
      return rejectWithValue('No blueprint payload found');
    }

    const updatedPayload = {
      ...currentPayload,
      [context === 'public' ? 'public_theme' : 'admin_theme']: {
        ...(context === 'public' ? currentPayload.public_theme : currentPayload.admin_theme),
        ...theme,
      },
    };

    try {
      const response = await fetchWithTenant('/api/platform/business-blueprint', {
        method: 'PUT',
        body: JSON.stringify({ payload: updatedPayload }),
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBrandValueThunk = createAsyncThunk(
  'blueprint/updateBrandValue',
  async (brandValue: BrandValue, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const currentPayload = state.blueprint.payload;

    if (!currentPayload) {
      return rejectWithValue('No blueprint payload found');
    }

    const updatedPayload = {
      ...currentPayload,
      business_profile: {
        ...currentPayload.business_profile,
        values: [...currentPayload.business_profile.values, brandValue],
      },
    };

    try {
      const response = await fetchWithTenant('/api/platform/business-blueprint', {
        method: 'PUT',
        body: JSON.stringify({ payload: updatedPayload }),
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBusinessProfileThunk = createAsyncThunk(
  'blueprint/updateBusinessProfile',
  async (profile: Partial<BusinessProfile>, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const currentPayload = state.blueprint.payload;

    if (!currentPayload) {
      return rejectWithValue('No blueprint payload found');
    }

    const updatedPayload = {
      ...currentPayload,
      business_profile: {
        ...currentPayload.business_profile,
        ...profile,
      },
    };

    try {
      const response = await fetchWithTenant('/api/platform/business-blueprint', {
        method: 'PUT',
        body: JSON.stringify({ payload: updatedPayload }),
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateNavigationThunk = createAsyncThunk(
  'blueprint/updateNavigation',
  async ({ context, navigation }: { context: 'public' | 'admin'; navigation: Partial<Navigation> }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const currentPayload = state.blueprint.payload;

    if (!currentPayload) {
      return rejectWithValue('No blueprint payload found');
    }

    const updatedPayload = {
      ...currentPayload,
      [context === 'public' ? 'public_navigation' : 'admin_navigation']: {
        ...(context === 'public' ? currentPayload.public_navigation : currentPayload.admin_navigation),
        ...navigation,
      },
    };

    try {
      const response = await fetchWithTenant('/api/platform/business-blueprint', {
        method: 'PUT',
        body: JSON.stringify({ payload: updatedPayload }),
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
