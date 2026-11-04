import { updatePageField, cancelEditMode, saveEditModeSuccess } from './pagesSlice';
import type { Page } from './pageType';
import { updatePageThunk } from './pageThunk';
import { toast } from 'sonner';
import type { AppDispatch } from '../store';

/**
 * Updates an individual field in the current page draft (in-memory Redux update).
 * Does not make a server request immediately so the user can review all changes
 * and click "Save" or "Cancel".
 */
export const saveField = (
  dispatch: AppDispatch,
  _currentPage: Page | null,
  sectionId: string,
  fieldPath: string,
  value: string,
  locale: string = 'en'
): void => {
  dispatch(updatePageField({ sectionId, fieldPath, value, locale }));
};

/**
 * Persists all in-memory changes for the active page to the database.
 */
export const saveCurrentPage = async (
  dispatch: AppDispatch,
  currentPage?: Page | null
): Promise<boolean> => {
  // If an editable element currently has focus, blur it so its handleBlur / onSave fires
  if (typeof document !== 'undefined' && document.activeElement && 'blur' in document.activeElement) {
    (document.activeElement as HTMLElement).blur();
  }
  // Allow pending blur handlers and React microtasks to settle into Redux state
  await new Promise((resolve) => setTimeout(resolve, 100));

  try {
    const resultAction = await dispatch(
      updatePageThunk(currentPage ? { slug: currentPage.slug, pageData: currentPage } : undefined)
    );

    if (updatePageThunk.fulfilled.match(resultAction)) {
      dispatch(saveEditModeSuccess());
      toast.success('Changes saved to database successfully!');
      return true;
    } else {
      const errorMsg =
        (resultAction.payload as string) ||
        resultAction.error?.message ||
        'Failed to save changes. Please try again.';
      console.error('[CMS saveCurrentPage] Failed to save page:', errorMsg);
      toast.error(errorMsg);
      return false;
    }
  } catch (error: any) {
    console.error('[CMS saveCurrentPage] Failed to save page:', error);
    toast.error(error?.message || 'Failed to save changes. Please try again.');
    return false;
  }
};

/**
 * Discards all un-saved changes made during the current edit session.
 */
export const cancelCurrentPageEdits = (dispatch: AppDispatch): void => {
  dispatch(cancelEditMode());
  toast.info('Changes cancelled');
};

