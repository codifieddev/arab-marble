'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, MessageSquareOff, MessageSquarePlus, Settings2, Eye, EyeOff, ScanLine } from 'lucide-react';
import { Annotation, useAnnotatorStore } from './store';
import { getCssSelector, getScreenSize } from './utils';
import { Marker } from './Marker';

import { createCommentThunk } from '@/lib/store/comments/commentThunk';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';

import GetAllCommments from './GetAllCommments';
import { usePathname } from 'next/navigation';
import { RootState } from '@/lib/store/store';
import { useAppDispatch } from '@/lib/store/hooks';
import { setPageComments } from '@/lib/store/comments/commentSlice';

export const AnnotatorPlugin: React.FC = () => {
  const {
    annotations,
    isCommentModeActive,
    toggleCommentMode,
    addAnnotation,
    setActiveAnnotationId,
    settings,
    setAnnotations,
    updateSettings
  } = useAnnotatorStore();
  const pagesState = useSelector((state: RootState) => state.pages);
  const currentPages = pagesState?.currentPages;
  const [draft, setDraft] = useState<{
    x: number;
    y: number;
    selector: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const [draftContent, setDraftContent] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const commentsState = useSelector((state: RootState) => state.comments);
  const allComments = commentsState?.comments || [];
  const dispatch = useAppDispatch()

  // get url slug

  const pathname = usePathname()
  const slug = pathname?.split("/").filter(Boolean).pop() || 'home';

  // update the annotation
  useEffect(() => {
    if(slug && allComments){
      const filterComments = allComments.filter((comment: any) => comment.slug === slug);
      if (filterComments.length > 0) {
        dispatch(setPageComments(filterComments));
        
        // Ensure each comment has an 'id' string to satisfy Annotation type
        const annotations = filterComments.map((c: any) => ({
          ...c,
          id: c.id || c._id || Math.random().toString(36).substring(2, 9)
        }));
        
        setAnnotations(annotations);
      }
    }
  }, [slug, allComments, dispatch, setAnnotations]);
  // Apply calibration mode styles
  useEffect(() => {
    if (settings.calibrationMode && isCommentModeActive) {
      document.body.classList.add('annotator-calibration-mode');
    } else {
      document.body.classList.remove('annotator-calibration-mode');
    }

    return () => {
      document.body.classList.remove('annotator-calibration-mode');
    };
  }, [settings.calibrationMode, isCommentModeActive]);

  // Handle clicking on the document to create an annotation
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!isCommentModeActive) return;

    e.preventDefault();
    e.stopPropagation();

    // 1. Temporarily hide the capture overlay so we can find the real element underneath
    const overlay = e.currentTarget as HTMLElement;
    overlay.style.display = 'none';

    // 2. Find the actual target element
    const target = document.elementFromPoint(e.clientX, e.clientY);

    // 3. Restore the overlay
    overlay.style.display = 'block';

    if (!target || target === document.body || target === document.documentElement) {
      if (!target) return;
    }

    if (target instanceof Element && target.closest('[data-annotator-ui="true"]')) {
      return;
    }

    // 4. Calculate relative percentages
    const rect = target.getBoundingClientRect();
    const offsetX = ((e.clientX - rect.left) / rect.width) * 100;
    const offsetY = ((e.clientY - rect.top) / rect.height) * 100;

    // 5. Generate robust selector
    const selector = getCssSelector(target);

    setDraft({
      x: e.clientX,
      y: e.clientY,
      selector,
      offsetX,
      offsetY
    });
    setShowSettings(false);
  };
  // Close active annotation if clicking outside
  useEffect(() => {
    const handleGlobalClick = () => {
      if (!isCommentModeActive && !draft) {
        setActiveAnnotationId(null);
        setShowSettings(false);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [isCommentModeActive, draft, setActiveAnnotationId]);

  const handleSaveDraft = async () => {
    if (!draft || !draftContent.trim()) return;
    const data = {
      selector: draft.selector,
      offsetX: draft.offsetX,
      offsetY: draft.offsetY,
      content: draftContent.trim(),
      status: 'open' as const,
      screenSize: getScreenSize(window.innerWidth),
      pageId: currentPages?._id || "",
      slug: slug
    };
    addAnnotation(data);
    setDraft(null);
    setDraftContent('');

    // add comment inot Db
    const response = await dispatch(createCommentThunk(data)).unwrap()
    if (response.success) {
      toast.success("Comment added successfully")
    } else {
      toast.error("Failed to add comment")
    }
  };

  const handleCancelDraft = () => {
    setDraft(null);
    setDraftContent('');
  };
  return (
    <>

      {/* get all comments */}
      <GetAllCommments />
      {/* Calibration Mode Global Styles */}
      <style>{`
        body.annotator-calibration-mode [data-annotate-id] {
          outline: 2px dashed #6366f1 !important;
          outline-offset: 2px !important;
          position: relative;
        }
        body.annotator-calibration-mode [data-annotate-id]::after {
          content: attr(data-annotate-id);
          position: absolute;
          top: -24px;
          left: 0;
          background: #6366f1;
          color: white;
          font-size: 11px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 4px;
          z-index: 10000;
          pointer-events: none;
          white-space: nowrap;
        }
      `}</style>



      {/* Only render markers and capture layer if Comment Mode is ACTIVE */}
      {isCommentModeActive && (
        <>
          {/* Invisible overlay to capture clicks when in annotation mode */}
          {!draft && (
            <div
              data-annotator-ui="true"
              className="fixed inset-x-0 bottom-0 top-[44px] z-[9998] cursor-crosshair"
              onClickCapture={handleCanvasClick}
            >
              {/* Subtle border to indicate mode is active */}
              <div className="absolute inset-0 border-4 border-indigo-500/30 pointer-events-none" />
            </div>
          )}

          {/* Render existing markers */}
          {annotations.map((annotation: Annotation) => (
            <Marker key={annotation._id ?? annotation.id} annotation={annotation} />
          ))}

          {/* Draft Annotation Popover */}
          {draft && (
            <div
              data-annotator-ui="true"
              className="fixed z-[10000] -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${draft.x}px`, top: `${draft.y}px` }}
            >
              {/* Draft Pin (Red for 'Open' default) */}
              <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-red-500 rounded-full shadow-lg ring-4 ring-red-200 flex items-center justify-center text-white">
                <MessageSquarePlus size={16} />
              </div>

              {/* Draft Input Dialog */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="p-4">
                  <textarea
                    autoFocus
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    placeholder="Type your comment here..."
                    className="w-full h-24 text-sm text-slate-800 placeholder-slate-400 border-none focus:ring-0 resize-none outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSaveDraft();
                      }
                      if (e.key === 'Escape') {
                        handleCancelDraft();
                      }
                    }}
                  />
                </div>
                <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex justify-end gap-2" style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    onClick={handleCancelDraft}
                    style={{
                      padding: '6px 12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text-secondary, #64748b)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '6px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDraft}
                    disabled={!draftContent.trim()}
                    style={{
                      padding: '6px 16px',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'white',
                      background: draftContent.trim() ? 'var(--primary, #D9547A)' : 'var(--blush, #C4B5D4)',
                      border: 'none',
                      cursor: draftContent.trim() ? 'pointer' : 'not-allowed',
                      borderRadius: '6px',
                      transition: 'background 0.2s'
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};
