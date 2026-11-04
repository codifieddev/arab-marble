'use client';

import { motion } from 'motion/react';
import { ReactNode } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale' | 'rotate';

interface FadeInViewProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  staggerChildren?: boolean;
  staggerDelay?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'span';
}

const directionVariants = {
  up: { y: 60, x: 0 },
  down: { y: -60, x: 0 },
  left: { x: 60, y: 0 },
  right: { x: -60, y: 0 },
  fade: { opacity: 0 },
  scale: { scale: 0.8, opacity: 0 },
  rotate: { rotate: -6, scale: 0.9, opacity: 0 },
};

export function FadeInView({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 60,
  once = true,
  staggerChildren = false,
  staggerDelay = 0.1,
  className,
  as = 'div',
}: FadeInViewProps) {
  const initial = {
    ...directionVariants[direction],
    ...(direction !== 'fade' && direction !== 'scale' && direction !== 'rotate'
      ? { opacity: 0 }
      : {}),
  };

  if (staggerChildren) {
    return (
      <motion.div
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: '-50px' }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: staggerDelay,
              delayChildren: delay,
            },
          },
        }}
      >
        {children}
      </motion.div>
    );
  }

  const Component = motion[as as keyof typeof motion] as any;

  return (
    <Component
      className={className}
      initial={initial}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        rotate: 0,
        transition: {
          duration,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        },
      }}
      viewport={{ once, margin: '-50px' }}
    >
      {children}
    </Component>
  );
}

export function FadeInStagger({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function FadeInItem({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
