'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'motion/react';

interface ParallaxLayerProps {
  children: React.ReactNode;
  /** Speed multiplier: negative moves against scroll, positive moves with scroll. Typical 0.1 to 0.3 */
  speed?: number;
  className?: string;
  direction?: 'vertical' | 'horizontal';
}

/**
 * ParallaxLayer wraps content to move it at an offset speed relative to page scroll.
 * On mobile (<768px), intensity is automatically reduced by 50% to maintain butter-smooth 60fps.
 */
export default function ParallaxLayer({
  children,
  speed = 0.15,
  className = '',
  direction = 'vertical',
}: ParallaxLayerProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start end', 'end start'],
  });

  // Calculate distance based on speed and device
  const effectiveSpeed = shouldReduceMotion ? 0 : isMobile ? speed * 0.5 : speed;
  const maxTranslate = effectiveSpeed * 200; // max px offset

  const rawTransform = useTransform(
    scrollYProgress,
    [0, 1],
    [-maxTranslate, maxTranslate]
  );

  // Apply smooth spring physics
  const springTransform = useSpring(rawTransform, {
    stiffness: 120,
    damping: 24,
    mass: 0.2,
  });

  if (shouldReduceMotion || effectiveSpeed === 0) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={targetRef} className={`relative will-change-transform ${className}`}>
      <motion.div
        style={{
          [direction === 'vertical' ? 'y' : 'x']: springTransform,
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
