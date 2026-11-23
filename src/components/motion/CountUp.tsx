'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface CountUpProps {
  value: string | number;
  suffix?: string;
  duration?: number;
  className?: string;
}

/**
 * Animated statistics count-up triggered seamlessly when scrolled into view.
 */
export default function CountUp({
  value,
  suffix = '',
  duration = 1.8,
  className = '',
}: CountUpProps) {
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = numberRef.current;
    if (!el) return;

    // Parse numeric portion
    const numValue = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
    const hasPlus = String(value).includes('+');
    const autoSuffix = suffix || (hasPlus ? '+' : '');

    const obj = { val: 0 };

    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: numValue,
        duration,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          if (el) {
            el.textContent = `${Math.floor(obj.val)}${autoSuffix}`;
          }
        },
      });
    }, el);

    return () => ctx.revert();
  }, [value, suffix, duration]);

  return (
    <span ref={numberRef} className={`inline-block font-serif ${className}`}>
      {value}
    </span>
  );
}
