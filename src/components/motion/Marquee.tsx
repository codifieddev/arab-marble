'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface MarqueeProps {
  text?: string;
  speed?: number;
  className?: string;
}

/**
 * Scroll-Velocity Marquee:
 * Infinitely gliding marquee text that speeds up or reverses based on page scroll velocity.
 */
export default function Marquee({
  text = 'ARAB MARBLE — TIMELESS STONE — كمال الحجر — ABU DHABI 1973 — LUXURY STONEWORK — ',
  speed = 1.0,
  className = '',
}: MarqueeProps) {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    let xPos = 0;
    let currentSpeed = speed;

    const ctx = gsap.context(() => {
      // Scroll velocity booster
      ScrollTrigger.create({
        onUpdate: (self) => {
          const velocity = self.getVelocity();
          // Boost speed according to scroll speed and direction
          currentSpeed = speed + Math.abs(velocity) * 0.005;
        },
      });

      const ticker = () => {
        xPos -= currentSpeed;
        if (xPos <= -50) {
          xPos = 0;
        }
        if (el) {
          el.style.transform = `translateX(${xPos}%)`;
        }
        // Decay speed smoothly back to normal
        currentSpeed += (speed - currentSpeed) * 0.05;
      };

      gsap.ticker.add(ticker);

      return () => {
        gsap.ticker.remove(ticker);
      };
    }, marqueeRef);

    return () => ctx.revert();
  }, [speed]);

  return (
    <div
      ref={marqueeRef}
      className={`overflow-hidden whitespace-nowrap select-none py-4 border-y border-[#C9A96E]/20 bg-[#161616] text-[#FAF8F5] ${className}`}
    >
      <div ref={innerRef} className="inline-flex will-change-transform">
        <span className="text-xl sm:text-2xl md:text-3xl font-serif tracking-[0.2em] uppercase text-neutral-300">
          {text}
        </span>
        <span className="text-xl sm:text-2xl md:text-3xl font-serif tracking-[0.2em] uppercase text-neutral-300">
          {text}
        </span>
      </div>
    </div>
  );
}
