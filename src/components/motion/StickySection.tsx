'use client';

import React from 'react';

interface StickySectionProps {
  children: React.ReactNode;
  height?: string;
  className?: string;
}

/**
 * Pinned sticky section for luxury stone storytelling.
 * Pins the wrapper while content or background gracefully scrolls.
 */
export default function StickySection({
  children,
  height = 'min-h-screen',
  className = '',
}: StickySectionProps) {
  return (
    <div className={`relative ${height} ${className}`}>
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center">
        {children}
      </div>
    </div>
  );
}
