import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const API_BASE_URL = "/api";

interface UserRecord {
  _id?: string; id?: string; email?: string; first_name?: string; last_name?: string;
  role?: string; phone?: string; createdAt?: string;
}

interface UsersState {
  users: UserRecord[];
  currentUser: UserRecord | null;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = { users: [], currentUser: null, loading: false, error: null };

export const fetchUsers = createAsyncThunk("users/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users`, { credentials: "include" });
    const data = await res.json();
    return data.data || data;
  } catch (err: any) { return rejectWithValue(err.message); }
});

export const createUser = createAsyncThunk("users/create", async (user: UserRecord, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(user), credentials: "include",
    });
    const data = await res.json();
    return data.data || data;
  } catch (err: any) { return rejectWithValue(err.message); }
});

export const updateUser = createAsyncThunk("users/update", async (user: UserRecord, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/${user._id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(user), credentials: "include",
    });
    const data = await res.json();
    return data.data || data;
  } catch (err: any) { return rejectWithValue(err.message); }
});

export const deleteUser = createAsyncThunk("users/delete", async (id: string, { rejectWithValue }) => {
  try {
    await fetch(`${API_BASE_URL}/admin/users/${id}`, { method: "DELETE", credentials: "include" });
    return id;
  } catch (err: any) { return rejectWithValue(err.message); }
});

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.pending, (state) => { state.loading = true; });
    builder.addCase(fetchUsers.fulfilled, (state, action) => { state.loading = false; state.users = action.payload; });
    builder.addCase(fetchUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    builder.addCase(createUser.fulfilled, (state, action) => { state.users.push(action.payload); });
    builder.addCase(updateUser.fulfilled, (state, action) => { state.users = state.users.map((u) => u._id === action.payload._id ? action.payload : u); });
    builder.addCase(deleteUser.fulfilled, (state, action) => { state.users = state.users.filter((u) => u._id !== action.payload); });
  },
});

export default usersSlice.reducer;
