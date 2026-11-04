'use client';

import React from 'react';
import Image from 'next/image';

export default function Lightbox({
  image, onClose
}: {
  image: string | null;
  onClose: () => void;
}) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
        <Image src={image} alt="Review image preview" fill className="object-contain" unoptimized />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-xl cursor-pointer hover:bg-white transition-all"
          aria-label="Close preview"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
