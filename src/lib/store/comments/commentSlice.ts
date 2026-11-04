import { Annotation } from '@/components/annotationPlugin/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createCommentThunk, fetchCommentsThunk, updateCommentThunk, deleteCommentThunk } from './commentThunk';

interface CommentState {
  comments: Annotation[];
  pageComments: Annotation[];
  isFetchedComments: boolean;
  isError: boolean;
  isLoading: boolean;
}

const initialState: CommentState = {
  comments: [],
  pageComments: [],
  isFetchedComments: false,
  isError: false,
  isLoading: false,
};

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    setAllComments: (state, action: PayloadAction<Annotation[]>) => {
      state.comments = action.payload;
      state.isFetchedComments = true;
      state.isLoading = false;
      state.isError = false;
    },
    setPageComments: (state, action: PayloadAction<Annotation[]>) => {
      state.pageComments = action.payload;
    },
    resetPageComments: (state) => {
        state.pageComments = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<boolean>) => {
      state.isError = action.payload;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder.
    addCase(createCommentThunk.fulfilled, (state, action) => {
      const data = action.payload.comment;
      if (data) {
        state.comments.push(data);
        state.pageComments.push(data);
      }
      state.isLoading = false;
      state.isError = false; 
    })
    .addCase(createCommentThunk.rejected, (state) => {
      state.isLoading = false;
      state.isError = true; 
    })
    .addCase(createCommentThunk.pending, (state) => {
      state.isLoading = true;
      state.isError = false; 
    })

    // add all comment 
    .addCase(fetchCommentsThunk.fulfilled, (state, action) => {
      state.comments = action.payload;
      state.isFetchedComments = true;
      state.isLoading = false;
      state.isError = false; 
    })
    .addCase(fetchCommentsThunk.rejected, (state) => {
      state.isLoading = false;
      state.isError = true; 
      state.isFetchedComments = true;
    })
    
    // Update comment
    .addCase(updateCommentThunk.fulfilled, (state, action: PayloadAction<Annotation>) => {
      const updatedComment = action.payload;
      state.comments = state.comments.map(c => c._id === updatedComment._id ? updatedComment : c);
      state.pageComments = state.pageComments.map(c => c._id === updatedComment._id ? updatedComment : c);
      state.isLoading = false;
      state.isError = false;
    })
    .addCase(updateCommentThunk.rejected, (state) => {
      state.isLoading = false;
      state.isError = true;
    })
    .addCase(updateCommentThunk.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
    })

    // Delete comment
    .addCase(deleteCommentThunk.fulfilled, (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.comments = state.comments.filter(c => c._id !== id);
      state.pageComments = state.pageComments.filter(c => c._id !== id);
      state.isLoading = false;
      state.isError = false;
    })
    .addCase(deleteCommentThunk.rejected, (state) => {
      state.isLoading = false;
      state.isError = true;
    })
    .addCase(deleteCommentThunk.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
    });
  },
});

export const { setAllComments, setPageComments, setLoading, setError, resetPageComments } = commentSlice.actions;
export default commentSlice.reducer;
