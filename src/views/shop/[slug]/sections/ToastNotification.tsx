'use client';

import React from 'react';

export default function ToastNotification({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[var(--primary)] text-white px-6 py-3 rounded-full shadow-lg text-sm font-bold animate-fade-in-up"
      role="alert"
    >
      {message}
    </div>
  );
}
