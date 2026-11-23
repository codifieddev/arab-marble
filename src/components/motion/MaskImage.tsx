'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface MaskImageProps {
  src: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  style?: React.CSSProperties;
  aspectRatio?: string;
}

/**
 * MaskImage: Architectural curtain wipe (clip-path: inset(100% 0 0 0) -> inset(0% 0 0 0))
 * with simultaneous inner image counter-scale (1.25 -> 1.0) and scrubbed parallax.
 * Uses native <img> with lazy loading to avoid any next/image unconfigured host crashes.
 */
export default function MaskImage({
  src,
  alt = 'Arab Marble',
  className = '',
  containerClassName = '',
  priority = false,
  style,
  aspectRatio = '4/3',
}: MaskImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  useEffect(() => {
    const container = containerRef.current;
    const img = imageRef.current;
    if (!container || !img) return;

    const ctx = gsap.context(() => {
      // 1. Curtain wipe reveal on enter viewport
      gsap.fromTo(
        container,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.35,
          ease: 'power4.inOut',
          scrollTrigger: {
            trigger: container,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      // 2. Parallax scale & translate scrub
      gsap.fromTo(
        img,
        { scale: 1.25, yPercent: -10 },
        {
          scale: 1.0,
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.1,
          },
        }
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden will-change-transform ${containerClassName}`}
      style={{
        clipPath: 'inset(100% 0% 0% 0%)',
        aspectRatio,
        ...style,
      }}
    >
      <img
        ref={imageRef}
        src={imgSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => {
          if (imgSrc !== '/images/arab-marble-logo.svg') {
            setImgSrc('/images/arab-marble-logo.svg');
          }
        }}
        className={`w-full h-full object-cover will-change-transform ${className}`}
      />
    </div>
  );
}
