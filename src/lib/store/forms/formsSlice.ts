import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const API_BASE_URL = "/api";

export interface FormField {
  id: string;
  key?: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  helperText?: string;
  value?: string;
}

export interface FormRecord {
  id?: string;
  _id?: string;
  name: string;
  key?: string;
  fields: FormField[];
  description?: string;
  settings?: {
    successMessage?: string;
    [key: string]: unknown;
  };
  createdAt?: string;
  submissions?: number;
}

interface FormsState {
  forms: FormRecord[];
  allForms: FormRecord[];
  currentForm: FormRecord | null;
  loading: boolean;
  error: string | null;
  isFetchedForms: boolean;
}

const initialState: FormsState = {
  forms: [],
  allForms: [],
  currentForm: null,
  loading: false,
  error: null,
  isFetchedForms: false,
};

export const fetchForms = createAsyncThunk("forms/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/forms`, { credentials: "include" });
    const data = await res.json();
    return data.data || data;
  } catch (err: any) { return rejectWithValue(err.message); }
});

export const createForm = createAsyncThunk("forms/create", async (form: FormRecord, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/forms`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form), credentials: "include",
    });
    const data = await res.json();
    return data.data || data;
  } catch (err: any) { return rejectWithValue(err.message); }
});

export const updateForm = createAsyncThunk("forms/update", async (form: FormRecord, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/forms/${form._id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form), credentials: "include",
    });
    const data = await res.json();
    return data.data || data;
  } catch (err: any) { return rejectWithValue(err.message); }
});

export const deleteForm = createAsyncThunk("forms/delete", async (id: string, { rejectWithValue }) => {
  try {
    await fetch(`${API_BASE_URL}/forms/${id}`, { method: "DELETE", credentials: "include" });
    return id;
  } catch (err: any) { return rejectWithValue(err.message); }
});

const formsSlice = createSlice({
  name: "forms",
  initialState,
  reducers: { setCurrentForm: (state, action: PayloadAction<FormRecord | null>) => { state.currentForm = action.payload; } },
  extraReducers: (builder) => {
    builder.addCase(fetchForms.pending, (state) => { state.loading = true; });
    builder.addCase(fetchForms.fulfilled, (state, action) => {
      state.loading = false;
      state.forms = action.payload;
      state.allForms = action.payload;
      state.isFetchedForms = true;
    });
    builder.addCase(fetchForms.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.isFetchedForms = true;
    });
    builder.addCase(createForm.fulfilled, (state, action) => {
      state.forms.push(action.payload);
      state.allForms.push(action.payload);
    });
    builder.addCase(updateForm.fulfilled, (state, action) => {
      state.forms = state.forms.map((form) => form._id === action.payload._id ? action.payload : form);
      state.allForms = state.allForms.map((form) => form._id === action.payload._id ? action.payload : form);
    });
    builder.addCase(deleteForm.fulfilled, (state, action) => {
      state.forms = state.forms.filter((form) => form._id !== action.payload);
      state.allForms = state.allForms.filter((form) => form._id !== action.payload);
    });
  },
});

export const { setCurrentForm } = formsSlice.actions;
export default formsSlice.reducer;
