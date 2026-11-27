'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface SplitRevealProps {
  children: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  stagger?: number;
  delay?: number;
}

/**
 * SplitReveal: reveals headings line-by-line / word-by-word from hidden masks
 * using GSAP ScrollTrigger (yPercent: 110 -> 0, ease: 'power4.out').
 */
export default function SplitReveal({
  children,
  className = '',
  as = 'h2',
  stagger = 0.04,
  delay = 0,
}: SplitRevealProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const words = el.querySelectorAll('.split-word-inner');
    if (!words.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { yPercent: 115, opacity: 0, rotateZ: 1.5 },
        {
          yPercent: 0,
          opacity: 1,
          rotateZ: 0,
          duration: 1.1,
          stagger,
          delay,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, el);

    const rafId = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(rafId);
      ctx.revert();
    };
  }, [children, stagger, delay]);

  if (typeof children !== 'string') {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const lines = children.split(/\r?\n|\\n/);
  const Tag = as;

  return (
    <Tag ref={containerRef as any} className={`overflow-hidden ${className}`}>
      {lines.map((line, lIdx) => (
        <span key={lIdx} className="block overflow-hidden leading-tight">
          {line.split(' ').map((word, wIdx) => (
            <span key={wIdx} className="inline-block overflow-hidden mr-[0.25em] align-top text-[#505050]">
              <span className="split-word-inner inline-block will-change-transform">
                {word}
              </span>
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
