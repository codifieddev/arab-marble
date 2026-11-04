'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ReferenceItemType = 'product' | 'testimonial' | 'review' | 'form' | 'project';

export interface ReferenceEditorOpenOptions {
  type: ReferenceItemType;
  title?: string;
  data: any;
  sectionId?: string;
  itemIndex?: number;
  onSave?: (updatedData: any) => Promise<void> | void;
}

interface ReferenceEditorContextValue {
  isOpen: boolean;
  type: ReferenceItemType | null;
  title: string;
  itemData: any;
  sectionId?: string;
  itemIndex?: number;
  openReferenceEditor: (options: ReferenceEditorOpenOptions) => void;
  closeReferenceEditor: () => void;
  customSaveHandler?: (updatedData: any) => Promise<void> | void;
}

const ReferenceEditorContext = createContext<ReferenceEditorContextValue | null>(null);

export function ReferenceEditorProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<ReferenceItemType | null>(null);
  const [title, setTitle] = useState('');
  const [itemData, setItemData] = useState<any>(null);
  const [sectionId, setSectionId] = useState<string | undefined>(undefined);
  const [itemIndex, setItemIndex] = useState<number | undefined>(undefined);
  const [customSaveHandler, setCustomSaveHandler] = useState<((updatedData: any) => Promise<void> | void) | undefined>(undefined);

  const openReferenceEditor = useCallback((options: ReferenceEditorOpenOptions) => {
    setType(options.type);
    setTitle(options.title || `Edit Reference ${options.type.charAt(0).toUpperCase() + options.type.slice(1)}`);
    setItemData(options.data);
    setSectionId(options.sectionId);
    setItemIndex(options.itemIndex);
    setCustomSaveHandler(() => options.onSave);
    setIsOpen(true);
  }, []);

  const closeReferenceEditor = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ReferenceEditorContext.Provider
      value={{
        isOpen,
        type,
        title,
        itemData,
        sectionId,
        itemIndex,
        openReferenceEditor,
        closeReferenceEditor,
        customSaveHandler,
      }}
    >
      {children}
    </ReferenceEditorContext.Provider>
  );
}

export function useReferenceEditor() {
  const context = useContext(ReferenceEditorContext);
  if (!context) {
    throw new Error('useReferenceEditor must be used within a ReferenceEditorProvider');
  }
  return context;
}
