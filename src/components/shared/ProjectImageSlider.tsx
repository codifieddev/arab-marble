'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProjectImageSliderProps {
  images: string[];
  title: string;
  className?: string;
  aspectRatioClassName?: string;
}

export default function ProjectImageSlider({
  images,
  title,
  className = '',
  aspectRatioClassName = 'h-[320px] md:h-[420px]',
}: ProjectImageSliderProps) {
  const cleanImages = (images && images.length > 0)
    ? images.filter(Boolean)
    : ['/images/products-tile.jpg'];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? cleanImages.length - 1 : prev - 1));
  }, [cleanImages.length]);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev === cleanImages.length - 1 ? 0 : prev + 1));
  }, [cleanImages.length]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 50) nextImage();
    else if (diff < -50) prevImage();
    setTouchStartX(null);
  };

  const hasMultiple = cleanImages.length > 1;

  return (
    <div
      className={`relative w-full ${aspectRatioClassName} bg-neutral-900 overflow-hidden group select-none ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Current Image */}
      <img
        src={cleanImages[currentIndex]}
        alt={`${title} - view ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
        key={cleanImages[currentIndex]}
      />

      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors pointer-events-none" />

      {hasMultiple && (
        <>
          {/* Slide Counter Badge */}
          <div className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-xs text-white text-[11px] font-mono tracking-widest px-2.5 py-1 rounded-xs border border-white/10">
            {currentIndex + 1} / {cleanImages.length}
          </div>

          {/* Left Arrow - Always visible with luxury hover state */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              prevImage();
            }}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-[#C9A96E] hover:text-black text-white flex items-center justify-center backdrop-blur-sm border border-white/30 transition-all duration-300 opacity-90 hover:opacity-100 cursor-pointer hover:scale-110 active:scale-95 shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow - Always visible with luxury hover state */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              nextImage();
            }}
            aria-label="Next image"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-[#C9A96E] hover:text-black text-white flex items-center justify-center backdrop-blur-sm border border-white/30 transition-all duration-300 opacity-90 hover:opacity-100 cursor-pointer hover:scale-110 active:scale-95 shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-1.5 pointer-events-none">
            {cleanImages.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`transition-all duration-300 pointer-events-auto rounded-full ${
                  idx === currentIndex
                    ? 'w-6 h-1.5 bg-[#C9A96E]'
                    : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
