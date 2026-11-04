import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchForms } from './formsSlice';
import type { FormSubmit } from './formsType';

export const fetchAllForm = fetchForms;

export const subMitFormData = createAsyncThunk<
  FormSubmit,
  Omit<FormSubmit, 'id'>,
  { rejectValue: string }
>('forms/submitFormData', async (payload, { rejectWithValue }) => {
  try {
    const response = await fetch('/api/form-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body.message || body.error || 'Failed to submit form');
    }

    return (body.data || body) as FormSubmit;
  } catch (error: unknown) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to submit form');
  }
});
