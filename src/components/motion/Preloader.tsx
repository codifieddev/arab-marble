'use client';

import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

/**
 * Cinematic Preloader (First visit / session only):
 * - Counter 00 -> 100 in refined luxury serif numerals
 * - Precision metallic gold line drawing across the viewport
 * - Dual split-curtain wipe (clip-path / slide) unveiling the hero
 */
export default function Preloader() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const topCurtainRef = useRef<HTMLDivElement>(null);
  const bottomCurtainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only show once per session
    if (typeof window !== 'undefined') {
      const seen = sessionStorage.getItem('arab_marble_preloader_seen');
      if (seen) return;
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const container = containerRef.current;
    const counterEl = counterRef.current;
    const progressEl = progressBarRef.current;
    const topCurtain = topCurtainRef.current;
    const bottomCurtain = bottomCurtainRef.current;

    // Strict guard: all refs must be mounted in DOM before invoking GSAP
    if (!container || !counterEl || !progressEl || !topCurtain || !bottomCurtain) {
      return;
    }

    document.body.style.overflow = 'hidden';

    const ctx = gsap.context(() => {
      const counterObj = { val: 0 };

      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem('arab_marble_preloader_seen', 'true');
          document.body.style.overflow = '';
          window.dispatchEvent(new CustomEvent('arab-marble:preloader-done'));
          setMounted(false);
        },
      });

      // 1. Counter 0 -> 100
      tl.to(counterObj, {
        val: 100,
        duration: 1.8,
        ease: 'power3.inOut',
        onUpdate: () => {
          if (counterEl) {
            counterEl.textContent = String(Math.floor(counterObj.val)).padStart(2, '0');
          }
        },
      });

      // 2. Gold line fill
      tl.to(
        progressEl,
        {
          scaleX: 1,
          duration: 1.8,
          ease: 'power3.inOut',
        },
        0
      );

      // 3. Fade out counter & text
      tl.to(
        [counterEl, progressEl],
        {
          opacity: 0,
          y: -20,
          duration: 0.4,
          ease: 'power2.in',
        },
        '+=0.1'
      );

      // 4. Split curtain reveal (top slides up, bottom slides down)
      tl.to(
        topCurtain,
        {
          yPercent: -100,
          duration: 1.0,
          ease: 'expo.inOut',
        },
        '-=0.1'
      );

      tl.to(
        bottomCurtain,
        {
          yPercent: 100,
          duration: 1.0,
          ease: 'expo.inOut',
        },
        '<'
      );
    }, container);

    return () => {
      ctx.revert();
      document.body.style.overflow = '';
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] pointer-events-auto flex flex-col justify-between"
    >
      {/* Top Curtain Half */}
      <div
        ref={topCurtainRef}
        className="absolute top-0 left-0 w-full h-1/2 bg-[#121212] z-10 will-change-transform border-b border-[#C9A96E]/20"
      />

      {/* Bottom Curtain Half */}
      <div
        ref={bottomCurtainRef}
        className="absolute bottom-0 left-0 w-full h-1/2 bg-[#121212] z-10 will-change-transform border-t border-[#C9A96E]/20"
      />

      {/* Center Counter & Brand Line */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none px-6">
        <div className="flex flex-col items-center gap-4">
          <span className="text-[11px] uppercase tracking-[0.35em] text-[#C9A96E] font-medium">
            Arab Marble • Abu Dhabi 1973
          </span>

          <div className="text-6xl sm:text-8xl md:text-9xl font-serif text-white tracking-tighter font-light">
            <span ref={counterRef}>00</span>
            <span className="text-2xl sm:text-4xl text-[#C9A96E] font-sans ml-1 font-extralight">%</span>
          </div>

          <div className="w-48 sm:w-64 h-[1.5px] bg-neutral-800 relative overflow-hidden mt-4">
            <div
              ref={progressBarRef}
              className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-[#C9A96E] to-[#FAF8F5] origin-left scale-x-0 will-change-transform"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
