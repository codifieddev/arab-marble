'use client';

import React from 'react';
import { Pencil } from 'lucide-react';
import { useAppSelector } from '@/lib/store/hooks';
import { useReferenceEditor, ReferenceItemType } from './ReferenceEditorContext';

interface ReferenceEditButtonProps {
  type: ReferenceItemType;
  title?: string;
  data?: any;
  sectionId?: string;
  itemIndex?: number;
  className?: string;
  label?: string;
  compact?: boolean;
  onSave?: (updatedData: any) => Promise<void> | void;
}

export default function ReferenceEditButton({
  type,
  title,
  data = {},
  sectionId,
  itemIndex,
  className = '',
  label,
  compact = false,
  onSave,
}: ReferenceEditButtonProps) {
  const isEditable = useAppSelector((state) => state.pages.isEditablePage || state.pages.isEditable);
  const { openReferenceEditor } = useReferenceEditor();

  // Only visible when Edit Mode is active
  if (!isEditable) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openReferenceEditor({
      type,
      title: title || `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      data: data || {},
      sectionId,
      itemIndex,
      onSave,
    });
  };

  const defaultLabel = label || `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`;

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={defaultLabel}
        aria-label={defaultLabel}
        className={`z-30 flex items-center justify-center w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:scale-110 transition-transform ${className}`}
      >
        <Pencil size={12} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={defaultLabel}
      className={`z-30 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all ${className}`}
    >
      <Pencil size={12} />
      <span>{defaultLabel}</span>
    </button>
  );
}
