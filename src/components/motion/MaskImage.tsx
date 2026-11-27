'use client';

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

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
 * MaskImage: Clean architectural image container with subtle entrance reveal
 * and hover zoom. Always visible (never stuck clipped by ScrollTrigger).
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
  const shouldReduceMotion = useReducedMotion();
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden ${containerClassName}`}
      style={{
        aspectRatio,
        ...style,
      }}
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
        className={`w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03] ${className}`}
      />
    </motion.div>
  );
}
