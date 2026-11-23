'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
  duration?: number;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
}

/**
 * TextReveal delivers a luxury architectural headline reveal.
 * Splits text into masked words that glide upwards smoothly from hidden overflow.
 */
export default function TextReveal({
  children,
  className = '',
  delay = 0,
  duration = 0.9,
  as = 'h2',
}: TextRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  // If text is not a string, render directly
  if (typeof children !== 'string') {
    return <span className={className}>{children}</span>;
  }

  // Split lines by newline or words by spaces
  const lines = children.split('\n');

  if (shouldReduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const Tag = as;

  return (
    <Tag className={className}>
      {lines.map((line, lineIndex) => {
        const words = line.split(' ');
        return (
          <span key={lineIndex} className="block overflow-hidden">
            {words.map((word, wordIndex) => {
              const wordDelay = delay + (lineIndex * 0.15) + (wordIndex * 0.04);
              return (
                <span key={wordIndex} className="inline-block overflow-hidden mr-[0.25em] align-top">
                  <motion.span
                    initial={{ y: '115%', opacity: 0 }}
                    whileInView={{ y: '0%', opacity: 1 }}
                    viewport={{ once: true, margin: '-20px' }}
                    transition={{
                      duration,
                      delay: wordDelay,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="inline-block will-change-transform"
                  >
                    {word}
                  </motion.span>
                </span>
              );
            })}
          </span>
        );
      })}
    </Tag>
  );
}
