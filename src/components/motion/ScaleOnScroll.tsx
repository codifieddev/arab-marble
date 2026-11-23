'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'motion/react';

interface ScaleOnScrollProps {
  children: React.ReactNode;
  fromScale?: number;
  toScale?: number;
  className?: string;
}

/**
 * Subtle architectural scale effect tied directly to scroll progress.
 * As the user scrolls past the container, it gently breathes or zooms smoothly.
 */
export default function ScaleOnScroll({
  children,
  fromScale = 1.08,
  toScale = 1.0,
  className = '',
}: ScaleOnScrollProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start end', 'end start'],
  });

  const rawScale = useTransform(scrollYProgress, [0, 1], [fromScale, toScale]);
  const smoothScale = useSpring(rawScale, { stiffness: 120, damping: 25, mass: 0.2 });

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={targetRef} className={`relative overflow-hidden ${className}`}>
      <motion.div
        style={{ scale: smoothScale }}
        className="w-full h-full will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}
