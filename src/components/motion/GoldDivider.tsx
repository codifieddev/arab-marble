'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface GoldDividerProps {
  className?: string;
  delay?: number;
  centered?: boolean;
}

/**
 * Fine metallic gold line (#C9A96E) that draws across on scroll view,
 * adding an authentic luxury architectural signature to headings and sections.
 */
export default function GoldDivider({
  className = '',
  delay = 0.2,
  centered = false,
}: GoldDividerProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={`h-[1px] relative overflow-hidden bg-transparent my-4 ${
        centered ? 'mx-auto' : ''
      } ${className}`}
      style={{ maxWidth: '140px' }}
    >
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: '100%' }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{
          duration: shouldReduceMotion ? 0.3 : 1.1,
          delay: shouldReduceMotion ? 0 : delay,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="h-full bg-gradient-to-r from-[#D4AF37] via-[#C9A96E] to-transparent"
        style={{ backgroundColor: '#C9A96E' }}
      />
    </div>
  );
}
