import { useTenantStaff } from '@/lib/useTenantStaff';
"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Edit3,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { setEditMode } from "@/lib/store/pages/pagesSlice";
import { saveCurrentPage, cancelCurrentPageEdits } from "@/lib/store/pages/saveField";
import { RootState } from "@/lib/store/store";
import { useAnnotatorStore } from "@/components/annotationPlugin/store";
import { AnnotatorPlugin } from "@/components/annotationPlugin/AnnotatorPlugin";

export default function AdminBar() {
  const dispatch = useAppDispatch();

  const { isAuthenticated, user } = useAppSelector((state: RootState) => state.auth);
  // ✅ Real edit mode state from Redux (same as EditModeToggle uses)
  const { isEditablePage: isEditable, isSaving, currentPages } = useAppSelector((state: RootState) => state.pages);

  // Only render for non-customer authenticated users
    const isStaff = useTenantStaff();
  const isAdmin = isStaff;

  // ✅ Real comment mode state from AnnotatorStore
  const { isCommentModeActive, toggleCommentMode, annotations } = useAnnotatorStore();

  const [isVisible, setIsVisible] = useState(true);
  const commentCount = annotations.length;

  if (!isAdmin) return null;

  // Collapsed floating button when bar is hidden
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{ backgroundColor: "#063A1D" }}
        className="fixed top-3 right-3 z-[10000] flex items-center gap-2 px-4 h-8 border border-white/20 text-white/80 rounded-full transition-all duration-200 hover:scale-105 hover:text-white font-semibold text-[11px] shadow-lg shadow-black/40"
        title="Show Admin Bar"
      >
        <Eye className="w-3.5 h-3.5" style={{ color: "#98c45f" }} />
        <span>Show Admin Bar</span>
      </button>
    );
  }

  return (
    <div
      data-annotator-ui="true"
      style={{ backgroundColor: "#063A1D" }}
      className="w-full text-white text-[13px] font-sans border-b border-white/10 relative z-[9999] select-none"
    >
      <div 
        className="w-full px-2 sm:px-4 h-11 flex items-center justify-between gap-4 overflow-x-auto whitespace-nowrap"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .admin-bar-scroll::-webkit-scrollbar { display: none; }
        ` }} />

        {/* Left — Dashboard link */}
        <div className="flex items-center shrink-0 admin-bar-scroll">
          <Link
            href={process.env.NEXT_PUBLIC_PROD_ADMIN_URL || "https://zerolive.kalptree.xyz"}
            target="_blank"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200 font-bold uppercase tracking-wider text-[11px]"
          >
            <LayoutDashboard className="w-3.5 h-3.5 shrink-0" style={{ color: "#98c45f" }} />
            <span className="hidden sm:inline">ADMIN DASHBOARD</span>
            <span className="sm:hidden">ADMIN</span>
          </Link>
        </div>

        {/* Right — Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Comments toggle */}
          <button
            onClick={() => toggleCommentMode()}
            style={
              isCommentModeActive
                ? { borderColor: "#98c45f", color: "#98c45f", backgroundColor: "rgba(152,196,95,0.1)" }
                : { borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", backgroundColor: "rgba(255,255,255,0.05)" }
            }
            className="h-7 px-2 sm:px-3 rounded-full flex items-center gap-1.5 sm:gap-2 transition-all border text-[11px] font-semibold hover:opacity-90 shrink-0"
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">{isCommentModeActive ? "Hide Comments" : `Show Comments (${commentCount})`}</span>
            <span className="md:hidden">{commentCount}</span>
          </button>

          {/* ✅ Edit Mode Controls */}
          {isEditable ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => saveCurrentPage(dispatch, currentPages)}
                disabled={isSaving}
                style={{
                  backgroundColor: "#16a34a",
                  borderColor: "#16a34a",
                  color: "#FFFFFF",
                  boxShadow: "0 0 12px rgba(22, 163, 74, 0.45)",
                }}
                className="h-7 px-2.5 sm:px-3 rounded-full flex items-center gap-1.5 transition-all text-[11px] font-semibold border hover:opacity-90 shrink-0 cursor-pointer disabled:opacity-60"
                title="Save changes to database"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> : <Check className="w-3.5 h-3.5 shrink-0" />}
                <span>{isSaving ? "Saving..." : "Save"}</span>
              </button>

              <button
                type="button"
                onClick={() => cancelCurrentPageEdits(dispatch)}
                disabled={isSaving}
                style={{
                  borderColor: "rgba(255,255,255,0.25)",
                  color: "#FFFFFF",
                  backgroundColor: "rgba(255,255,255,0.1)",
                }}
                className="h-7 px-2.5 rounded-full flex items-center gap-1.5 transition-all text-[11px] font-semibold border hover:bg-red-500/20 hover:border-red-400 shrink-0 cursor-pointer disabled:opacity-60"
                title="Discard changes and exit edit mode"
              >
                <X className="w-3.5 h-3.5 shrink-0" />
                <span>Cancel</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => dispatch(setEditMode(true))}
              style={{
                borderColor: "rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.7)",
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
              className="h-7 px-2 sm:px-3 rounded-full flex items-center gap-1.5 transition-all text-[11px] font-semibold border hover:opacity-90 shrink-0"
              title="Enable edit mode"
            >
              <Edit3 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">Edit Mode OFF</span>
              <span className="md:hidden">OFF</span>
            </button>
          )}

          {/* Divider */}
          <span className="text-white/20 select-none">|</span>

          {/* Hide button */}
          <button
            onClick={() => setIsVisible(false)}
            className="h-7 w-7 rounded-full flex items-center justify-center bg-transparent text-white/70 hover:bg-white/15 hover:text-white transition-all shrink-0"
            title="Hide Admin Bar"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Edit mode banner — active when isEditable is true */}
      {isEditable && (
        <div
          style={{ backgroundColor: "#98c45f", color: "#063A1D" }}
          className="w-full text-center py-2 text-[12px] font-semibold border-t border-white/10"
        >
          ✨ Inline editing is active. Hover over any text block on the page and click to update.
        </div>
      )}
      
      {/* Global Annotator Plugin (only renders for admins since AdminBar is admin-only) */}
      <AnnotatorPlugin />
    </div>
  );
}
