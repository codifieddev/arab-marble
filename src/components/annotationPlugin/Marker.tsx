'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Trash2, CheckCircle2, Clock, AlertCircle, MonitorSmartphone, GripHorizontal, Save } from 'lucide-react';
import type { Annotation, CommentStatus, ScreenSize } from './store';
import { useAnnotatorStore } from './store';
import { isPointVisible, getCssSelector, getScreenSize, resolveTargetElement } from './utils';
import { useDispatch } from 'react-redux';

import { updateCommentThunk, deleteCommentThunk } from '@/lib/store/comments/commentThunk';
import { toast } from 'sonner';
import { AppDispatch } from '@/lib/store/store';

interface MarkerProps {
  annotation: Annotation;
}

const statusConfig: Record<CommentStatus, { color: string; icon: React.ElementType; label: string }> = {
  open: { color: 'bg-red-500 ring-red-200 text-red-700', icon: AlertCircle, label: 'Open' },
  pending: { color: 'bg-yellow-500 ring-yellow-200 text-yellow-700', icon: Clock, label: 'Pending' },
  done: { color: 'bg-green-500 ring-green-200 text-green-700', icon: CheckCircle2, label: 'Done' },
};

export const Marker: React.FC<MarkerProps> = ({ annotation }) => {
  const markerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasDraggedRef = useRef(false);
  const {
    activeAnnotationId,
    setActiveAnnotationId,
    removeAnnotation,
    updateAnnotationStatus,
    updateAnnotationScreen,
    updateAnnotationPosition,
    settings,
    annotations
  } = useAnnotatorStore();
  const dispatch = useDispatch<AppDispatch>();

  const [isDragging, setIsDragging] = useState(false);
  const [currentScreenSize, setCurrentScreenSize] = useState<ScreenSize>(() =>
    typeof window === 'undefined' ? 'desktop' : getScreenSize(window.innerWidth)
  );
  const annotationKey = annotation._id ?? annotation.id;

  const isActive = activeAnnotationId === annotationKey;
  const config = statusConfig[annotation?.status ?? "open"];

  useEffect(() => {
    const handleResize = () => setCurrentScreenSize(getScreenSize(window.innerWidth));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let rafId: number;

    const updatePosition = () => {
      if (!markerRef.current || isDragging) {
        if (!isDragging) rafId = requestAnimationFrame(updatePosition);
        return;
      }

      const target = resolveTargetElement(annotation?.selector);

      if (!target) {
        markerRef.current.style.opacity = '0';
        markerRef.current.style.pointerEvents = 'none';
        rafId = requestAnimationFrame(updatePosition);
        return;
      }
      let x = 0;
      let y = 0;
      let rect: DOMRect | Pick<DOMRect, 'width' | 'height' | 'left' | 'top' | 'right' | 'bottom'> = {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
      };

      if (typeof annotation.offsetX === 'number' && typeof annotation.offsetY === 'number') {
        rect = target.getBoundingClientRect();
        x = rect.left + (rect.width * annotation.offsetX) / 100;
        y = rect.top + (rect.height * annotation.offsetY) / 100;
      }

      const isVisible = rect.width > 0 && rect.height > 0 && isPointVisible(x, y, target);

      if (!isVisible) {
        markerRef.current.style.opacity = '0';
        markerRef.current.style.pointerEvents = 'none';
      } else {
        markerRef.current.style.opacity = '1';
        markerRef.current.style.pointerEvents = 'auto';
        markerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }

      rafId = requestAnimationFrame(updatePosition);
    };

    rafId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(rafId);
  }, [annotation, isDragging]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    hasDraggedRef.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current || !markerRef.current) return;

    if (!hasDraggedRef.current) {
      const deltaX = Math.abs(e.clientX - dragStartRef.current.x);
      const deltaY = Math.abs(e.clientY - dragStartRef.current.y);

      if (deltaX < 4 && deltaY < 4) {
        return;
      }

      hasDraggedRef.current = true;
      setIsDragging(true);
    }

    markerRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (!hasDraggedRef.current || !markerRef.current) {
      dragStartRef.current = null;
      hasDraggedRef.current = false;
      return;
    }

    setIsDragging(false);
    dragStartRef.current = null;
    hasDraggedRef.current = false;

    // Temporarily hide marker to find the element underneath
    markerRef.current.style.display = 'none';
    const target = document.elementFromPoint(e.clientX, e.clientY);
    markerRef.current.style.display = '';

    if (target && target !== document.body && target !== document.documentElement) {
      const rect = target.getBoundingClientRect();
      const offsetX = ((e.clientX - rect.left) / rect.width) * 100;
      const offsetY = ((e.clientY - rect.top) / rect.height) * 100;
      const selector = getCssSelector(target);
      updateAnnotationPosition(annotationKey, selector, offsetX, offsetY);
    }
  };

  // Check visibility based on settings and screen size
  if (!settings.showResolved && annotation.status === 'done') return null;
  if (annotation.screenSize !== 'all' && annotation.screenSize !== currentScreenSize) return null;


  const handleUpdateComment = async () => {
    const updatedData = annotations.find((item: Annotation) => (item._id ?? item.id) === annotationKey);
    if (updatedData && updatedData._id) {
      try {
        await dispatch(updateCommentThunk({ id: updatedData._id, commentData: updatedData as any })).unwrap();
        setActiveAnnotationId(annotationKey);
        toast.success('comments updated successfully');
      } catch (error) {
        console.error('Failed to update comments in Redux:', error);
        toast.error('Failed to update comments');
      }
    }
  };

  const handleStatusChange = async (status: CommentStatus) => {
    updateAnnotationStatus(annotationKey, status);
    setActiveAnnotationId(annotationKey);
  };

  const handleScreenChange = async (screenSize: ScreenSize) => {
    updateAnnotationScreen(annotationKey, screenSize);
    setActiveAnnotationId(annotationKey);
  };

  const handleDeleteComment = async () => {
    try {
      if (annotation._id) {
        await dispatch(deleteCommentThunk(annotation._id)).unwrap();
      }
      removeAnnotation(annotationKey);
      setActiveAnnotationId(null);
      toast.success('comments deleted successfully');
    } catch (error) {
      console.error('Failed to delete comments:', error);
      toast.error('Failed to delete comments');
    }
  };

  return (
    <div
      ref={markerRef}
      data-annotator-ui="true"
      className="fixed top-0 left-0 z-[9999]"
      style={{ transformOrigin: 'top left', touchAction: 'none' }}
    >
      {/* The Pin */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full shadow-lg flex items-center justify-center text-white transition-transform ${isActive ? `${config.color.split(' ')[0]} scale-110 ring-4 ${config.color.split(' ')[1]}` : `${config.color.split(' ')[0]} hover:scale-110`
          } ${isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab'}`}
        onClick={(e) => {
          if (hasDraggedRef.current) return;
          e.stopPropagation();
          setActiveAnnotationId(isActive ? null : annotationKey);
        }}
      >
        <MessageCircle size={16} />
      </div>

      {/* The Popover */}
      <AnimatePresence>
        {isActive && !isDragging && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Status Bar */}
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <config.icon size={16} className={config.color.split(' ')[2]} />
                <select
                  value={annotation.status}
                  onChange={(e) => {
                    e.stopPropagation();
                    void handleStatusChange(e.target.value as CommentStatus);
                  }}
                  className="text-sm font-medium bg-transparent border-none focus:ring-0 cursor-pointer p-0 text-slate-700"
                >
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1 text-slate-400 mr-2" title="Visible on screen size">
                  <MonitorSmartphone size={14} />
                  <select
                    value={annotation.screenSize}
                    onChange={(e) => {
                      e.stopPropagation();
                      void handleScreenChange(e.target.value as ScreenSize);
                    }}
                    className="text-xs bg-transparent border-none focus:ring-0 cursor-pointer p-0 text-slate-500"
                  >
                    <option value="all">All Screens</option>
                    <option value="desktop">Desktop</option>
                    <option value="tablet">Tablet</option>
                    <option value="mobile">Mobile</option>
                  </select>
                </div>
                <button
                  onClick={() => void handleDeleteComment()}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                  title="Delete annotation"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                {annotation.content}
              </p>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-400">
                {annotation.createdAt ? new Date(annotation.createdAt).toLocaleString() : 'just now'}
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => void handleUpdateComment()}
                  className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-dark"
                  title="Update comment"
                >
                  <Save size={12} />
                  Update
                </button>
                <div className="flex items-center gap-1 text-slate-400 text-xs" title="Drag pin to move">
                  <GripHorizontal size={12} />
                  <span>Draggable</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
