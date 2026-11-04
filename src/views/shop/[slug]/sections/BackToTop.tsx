'use client';

import React from 'react';

export default function BackToTop() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      type="button"
      className="fixed right-6 bottom-20 w-12 h-12 bg-[var(--primary)] text-white rounded-full shadow-lg flex items-center justify-center text-xl cursor-pointer hover:bg-[var(--primary-hover)] transition-all z-40"
    >
      &uarr;
    </button>
  );
}
