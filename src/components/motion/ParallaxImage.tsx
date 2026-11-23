'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'motion/react';

interface ParallaxImageProps {
  src: string;
  alt?: string;
  speed?: number;
  scale?: number;
  className?: string;
  containerClassName?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  unoptimized?: boolean;
}

/**
 * ParallaxImage renders an image inside an overflow-hidden wrapper,
 * scaling it slightly and translating on scroll to produce an inner parallax depth.
 * Uses native <img> with lazy loading to ensure 100% compatibility with arbitrary CMS
 * and external media hostnames without throwing Next.js unconfigured-host runtime errors.
 */
export default function ParallaxImage({
  src,
  alt = 'Arab Marble Stone',
  speed = 0.15,
  scale = 1.15,
  className = '',
  containerClassName = '',
  fill = false,
  priority = false,
  sizes,
  width,
  height,
  style,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const effectiveSpeed = shouldReduceMotion ? 0 : isMobile ? speed * 0.5 : speed;
  const maxOffset = effectiveSpeed * 80;

  const rawY = useTransform(scrollYProgress, [0, 1], [-maxOffset, maxOffset]);
  const smoothY = useSpring(rawY, { stiffness: 100, damping: 25, mass: 0.2 });

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${containerClassName}`}
      style={style}
    >
      <motion.div
        style={{
          y: shouldReduceMotion ? 0 : smoothY,
          scale: shouldReduceMotion ? 1 : scale,
        }}
        className="relative w-full h-full will-change-transform"
      >
        <img
          src={imgSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => {
            if (imgSrc !== '/images/arab-marble-logo.svg') {
              setImgSrc('/images/arab-marble-logo.svg');
            }
          }}
          className={`object-cover w-full h-full ${fill ? 'absolute inset-0' : ''} ${className}`}
          style={width && height ? { width, height } : undefined}
        />
      </motion.div>
    </div>
  );
}
