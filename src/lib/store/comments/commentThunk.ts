import { createAsyncThunk } from '@reduxjs/toolkit';
import { Annotation } from '@/components/annotationPlugin/store';

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

// Fetch all comments
export const fetchCommentsThunk = createAsyncThunk(
  'comments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/comments', { credentials: 'include' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch comments');
      }
      const data = await response.json();
      return data.pages;
    } catch (error: unknown) {
      return rejectWithValue(errorMessage(error, 'Failed to fetch comments'));
    }
  }
);

// Fetch comments by page
export const fetchCommentsByPageThunk = createAsyncThunk(
  'comments/fetchByPage',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`, {
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch page comments');
      }
      const data = await response.json();
      return data.comments;
    } catch (error: unknown) {
      return rejectWithValue(errorMessage(error, 'Failed to fetch page comments'));
    }
  }
);

// Create a new comment
export const createCommentThunk = createAsyncThunk(
  'comments/create',
  async (commentData: Partial<Annotation>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify(commentData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create comment');
      }
      const data = await response.json();
      return data;
    } catch (error: unknown) {
      return rejectWithValue(errorMessage(error, 'Failed to create comment'));
    }
  }
);

// Update a comment
export const updateCommentThunk = createAsyncThunk(
  'comments/update',
  async ({ id, commentData }: { id: string; commentData: Partial<Annotation> }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({ ...commentData, _id: id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update comment');
      }
      const data = await response.json();
      return data.comment;
    } catch (error: unknown) {
      return rejectWithValue(errorMessage(error, 'Failed to update comment'));
    }
  }
);
  
// Delete a comment
export const deleteCommentThunk = createAsyncThunk(
  'comments/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/comments?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete comment');
      }
      return id;
    } catch (error: unknown) {
      return rejectWithValue(errorMessage(error, 'Failed to delete comment'));
    }
  }
);
