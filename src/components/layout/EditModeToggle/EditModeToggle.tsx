'use client';

import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { setEditMode } from '@/lib/store/pages/pagesSlice';
import { saveCurrentPage, cancelCurrentPageEdits } from '@/lib/store/pages/saveField';
import { useTenantStaff } from '@/lib/useTenantStaff';
import { Check, X, Loader2 } from 'lucide-react';

export default function EditModeToggle() {
  const isStaff = useTenantStaff();
  const dispatch = useAppDispatch();
  const isEditable = useAppSelector((state) => state.pages.isEditablePage);
  const isSaving = useAppSelector((state) => state.pages.isSaving);
  const currentPages = useAppSelector((state) => state.pages.currentPages);

  // Only authorized tenant-admin or staff of this particular tenant can see and use EditModeToggle
  if (!isStaff) return null;

  if (isEditable) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(28, 25, 23, 0.95)',
          padding: '6px 8px',
          borderRadius: 9999,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <button
          type="button"
          onClick={() => saveCurrentPage(dispatch, currentPages)}
          disabled={isSaving}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 18px',
            borderRadius: 9999,
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '0.04em',
            border: 'none',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            background: '#16a34a',
            color: '#fff',
            opacity: isSaving ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isSaving) e.currentTarget.style.background = '#15803d';
          }}
          onMouseLeave={(e) => {
            if (!isSaving) e.currentTarget.style.background = '#16a34a';
          }}
          title="Save changes to database"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          <span>{isSaving ? 'Saving...' : 'Save'}</span>
        </button>

        <button
          type="button"
          onClick={() => cancelCurrentPageEdits(dispatch)}
          disabled={isSaving}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 9999,
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '0.04em',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
          }}
          title="Discard changes and exit edit mode"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => dispatch(setEditMode(true))}
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 50,
        padding: '8px 18px',
        borderRadius: 9999,
        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: '0.04em',
        border: '1px solid rgba(255,255,255,0.3)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: 'var(--primary)',
        color: '#fff',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--primary-dark)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--primary)';
      }}
    >
      Edit Mode OFF
    </button>
  );
}
