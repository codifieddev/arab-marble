'use client';

import React from 'react';

interface PageLoaderProps {
  text?: string;
  className?: string;
}

export default function PageLoader({ text, className = '' }: PageLoaderProps) {
  return (
    <div
      className={`w-full min-h-[75vh] px-4 md:px-8 py-12 max-w-[1240px] mx-auto animate-pulse ${className}`}
      aria-busy="true"
      aria-label={text || 'Loading stone collection...'}
    >
      <style>{`
        @keyframes shimmerWave {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .stone-shimmer {
          position: relative;
          overflow: hidden;
          background-color: #f5f5f4;
        }
        .stone-shimmer::after {
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0,
            rgba(255, 255, 255, 0.45) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmerWave 1.8s infinite;
          content: '';
        }
      `}</style>

      {/* Hero Banner Shimmer */}
      <div className="w-full h-48 md:h-64 stone-shimmer border border-stone-200 mb-12 flex flex-col items-center justify-center p-6">
        <div className="h-8 md:h-10 w-64 md:w-80 bg-stone-200 mb-4" />
        <div className="h-3 md:h-4 w-48 md:w-96 bg-stone-200" />
      </div>

      {/* Grid Header Shimmer */}
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="h-6 w-48 bg-stone-200 mb-3" />
        <div className="w-16 h-0.5 bg-stone-300 mx-auto mb-3" />
        <div className="h-3 w-72 bg-stone-100" />
      </div>

      {/* 4-Column Stone Grid Shimmer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <div className="aspect-square w-full stone-shimmer border border-stone-200" />
            <div className="h-4 w-3/4 bg-stone-200 mx-auto" />
            <div className="h-3 w-1/2 bg-stone-100 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
