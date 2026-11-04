'use client';

import { useState, useEffect } from 'react';

export default function LocaleNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if the cookie 'locale_notice=unsupported' exists
    const match = document.cookie.match(/(?:^|;\s*)locale_notice=([^;]+)/);
    if (match && match[1] === 'unsupported') {
      setVisible(true);
      // Clear cookie immediately so refreshing does not show notice again
      document.cookie = 'locale_notice=; path=/; max-age=0; SameSite=Lax';

      // Auto dismiss after 7 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      role="alert"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[92%] sm:w-auto px-4 py-3 bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <svg
        className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div className="text-sm font-medium leading-snug flex-1">
        This language is not available. Showing content in the default language.
      </div>
      <button
        onClick={() => setVisible(false)}
        className="text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-100 p-1 rounded-md transition-colors"
        aria-label="Dismiss notice"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
