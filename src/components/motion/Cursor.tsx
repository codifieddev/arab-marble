'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/**
 * Awwwards Custom Cursor:
 * - Center micro-dot + smooth lagging magnetic ring
 * - Dynamic context labels: "View", "Explore", "Drag" when hovering interactive elements
 * - Automatically hidden on mobile / touch devices
 */
export default function Cursor() {
  const [label, setLabel] = useState<string>('');
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable on touch devices
    const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    if (isTouch) {
      setIsTouchDevice(true);
      return;
    }
    setIsTouchDevice(false);

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const setDotX = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power2.out' });
    const setDotY = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power2.out' });
    const setRingX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' });
    const setRingY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });

    const handleMouseMove = (e: MouseEvent) => {
      setDotX(e.clientX);
      setDotY(e.clientY);
      setRingX(e.clientX);
      setRingY(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const cursorTarget = target?.closest('[data-cursor]') as HTMLElement | null;
      if (cursorTarget) {
        const text = cursorTarget.getAttribute('data-cursor') || '';
        setLabel(text);
        setIsHovered(true);
      } else if (target?.closest('a, button, [role="button"]')) {
        setLabel('');
        setIsHovered(true);
      } else {
        setLabel('');
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  if (isTouchDevice) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9990] overflow-hidden">
      {/* Center micro dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 -ml-1 -mt-1 rounded-full bg-[#C9A96E] mix-blend-difference will-change-transform transition-transform duration-150"
        style={{ transform: 'translate(-100px, -100px)' }}
      />

      {/* Lagging outer magnetic ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 flex items-center justify-center rounded-full border border-[#C9A96E]/80 backdrop-blur-[1px] will-change-transform transition-all duration-300 ${
          isHovered
            ? 'w-16 h-16 -ml-8 -mt-8 bg-[#C9A96E]/20 scale-100 shadow-[0_0_20px_rgba(201,169,110,0.3)]'
            : 'w-8 h-8 -ml-4 -mt-4 bg-transparent scale-75'
        }`}
        style={{ transform: 'translate(-100px, -100px)' }}
      >
        {label && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#FAF8F5] drop-shadow-md">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
