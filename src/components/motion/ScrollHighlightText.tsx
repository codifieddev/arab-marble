'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollHighlightTextProps {
  children: string;
  className?: string;
}

/**
 * Scrubbed word-by-word highlight:
 * Words illuminate from 15% opacity to 100% deep rich tone as you scroll through.
 */
export default function ScrollHighlightText({ children, className = '' }: ScrollHighlightTextProps) {
  const containerRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const words = el.querySelectorAll('.highlight-word');
    if (!words.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: 0.18, color: '#9e9e9e' },
        {
          opacity: 1,
          color: '#1a1a1a',
          stagger: 0.08,
          ease: 'power1.inOut',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            end: 'bottom 45%',
            scrub: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [children]);

  if (typeof children !== 'string') {
    return <p className={className}>{children}</p>;
  }

  const words = children.split(' ');

  return (
    <p ref={containerRef} className={`leading-relaxed ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="highlight-word inline-block mr-[0.28em] transition-colors duration-200">
          {word}
        </span>
      ))}
    </p>
  );
}
