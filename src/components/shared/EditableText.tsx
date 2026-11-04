'use client';

import { useState, useRef, useEffect, type ElementType, KeyboardEvent } from 'react';

interface EditableTextProps {
  value: string;
  onSave?: (value: string) => Promise<void> | void;
  isEditable?: boolean;
  isReferenced?: boolean;
  tag?: ElementType;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  sectionId?: string;
  fieldPath?: string;
  currentPages?: any;
}

export default function EditableText({
  value,
  onSave,
  isEditable: isEditableProp,
  isReferenced = false,
  tag: Tag = 'span',
  className = '',
  placeholder = 'Click to edit...',
  multiline = false,
  sectionId,
  fieldPath,
}: EditableTextProps) {
  const isInsideStudio = typeof window !== 'undefined' && (
    window.location.search.includes('studio_preview=true') ||
    window.parent !== window
  );

  // If this item is referenced, it must NEVER be editable on storefront
  const isEditable = isReferenced ? false : (isEditableProp ?? isInsideStudio);
  const [isFocused, setIsFocused] = useState(false);
  const elementRef = useRef<HTMLElement>(null);
  const lastSavedValueRef = useRef(value);

  useEffect(() => {
    if (elementRef.current && !isFocused) {
      if (value) {
        elementRef.current.innerHTML = value;
      } else {
        elementRef.current.innerText = placeholder;
      }
      lastSavedValueRef.current = elementRef.current.innerText.trim();
    }
  }, [value, isFocused, placeholder]);

  const handleFocus = () => {
    if (!isEditable) return;
    setIsFocused(true);
    if (elementRef.current && elementRef.current.innerText === placeholder) {
      elementRef.current.innerText = '';
    }
  };

  const handleBlur = async () => {
    setIsFocused(false);
    if (!elementRef.current) return;
    const newText = elementRef.current.innerText.trim();

    if (newText === '' && placeholder) {
      elementRef.current.innerText = placeholder;
    }

    if (newText && newText !== lastSavedValueRef.current && newText !== placeholder) {
      lastSavedValueRef.current = newText;
      if (onSave) {
        await onSave(newText);
      }
      if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'STUDIO_PROP_UPDATED',
          sectionId,
          fieldPath,
          value: newText
        }, '*');
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!multiline && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      elementRef.current?.blur();
    }
    if (e.key === 'Escape') {
      if (elementRef.current) {
        elementRef.current.innerHTML = lastSavedValueRef.current || placeholder;
      }
      elementRef.current?.blur();
    }
  };

  const isWhite = className.includes('text-white');

  return (
    <Tag
      ref={elementRef}
      contentEditable={isEditable}
      suppressContentEditableWarning={true}
      title={isReferenced ? '🔒 Referenced data: Edit from Kalp Admin Dashboard' : undefined}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      style={isWhite ? { color: '#ffffff' } : undefined}
      className={`${className} ${
        isEditable
          ? 'outline-none cursor-text transition-all duration-150 hover:outline-dashed hover:outline-1 hover:outline-rose-500/60 hover:outline-offset-2 focus:outline-solid focus:outline-2 focus:outline-rose-500 focus:outline-offset-2 focus:ring-4 focus:ring-rose-500/20 rounded'
          : isReferenced
            ? 'transition-opacity'
            : ''
      }`}
      dangerouslySetInnerHTML={{ __html: value || (isEditable ? placeholder : '') }}
    />
  );
}
