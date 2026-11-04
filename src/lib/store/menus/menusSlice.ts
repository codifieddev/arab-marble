import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const API_BASE_URL = "/api";

export interface MenuItem {
  _id?: string;
  label: string;
  href: string;
  order: number;
  parentId?: string;
  icon?: string;
  children?: MenuItem[];
}

interface MenusState {
  menus: MenuItem[];
  loading: boolean;
  error: string | null;
  isFetchedMenus: boolean;
}

const initialState: MenusState = { menus: [], loading: false, error: null, isFetchedMenus: false };

export const fetchMenus = createAsyncThunk(
  "menus/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/cms/menus`, { credentials: "include" });
      const data = await res.json();
      return data.data || data;
    } catch (err: any) { return rejectWithValue(err.message); }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as any;
      if (state?.menus?.loading) {
        return false;
      }
    },
  }
);

export const createMenu = createAsyncThunk("menus/create", async (menu: MenuItem, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/cms/menus`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(menu), credentials: "include",
    });
    const data = await res.json();
    return data.data || data;
  } catch (err: any) { return rejectWithValue(err.message); }
});

export const updateMenu = createAsyncThunk("menus/update", async (menu: MenuItem, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/cms/menus/${menu._id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(menu), credentials: "include",
    });
    const data = await res.json();
    return data.data || data;
  } catch (err: any) { return rejectWithValue(err.message); }
});

export const deleteMenu = createAsyncThunk("menus/delete", async (id: string, { rejectWithValue }) => {
  try {
    await fetch(`${API_BASE_URL}/cms/menus/${id}`, { method: "DELETE", credentials: "include" });
    return id;
  } catch (err: any) { return rejectWithValue(err.message); }
});

const menusSlice = createSlice({
  name: "menus",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchMenus.pending, (state) => { state.loading = true; });
    builder.addCase(fetchMenus.fulfilled, (state, action) => {
      state.loading = false;
      state.menus = action.payload;
      state.isFetchedMenus = true;
    });
    builder.addCase(fetchMenus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.isFetchedMenus = true;
    });
    builder.addCase(createMenu.fulfilled, (state, action) => { state.menus.push(action.payload); });
    builder.addCase(updateMenu.fulfilled, (state, action) => { state.menus = state.menus.map((m) => m._id === action.payload._id ? action.payload : m); });
    builder.addCase(deleteMenu.fulfilled, (state, action) => { state.menus = state.menus.filter((m) => m._id !== action.payload); });
  },
});

export default menusSlice.reducer;
