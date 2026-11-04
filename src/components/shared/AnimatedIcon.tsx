'use client';

import { motion, type Easing } from 'motion/react';
import { ReactNode } from 'react';

interface AnimatedIconProps {
  children: ReactNode;
  animation?: 'float' | 'pulse' | 'bounce' | 'spin' | 'glow';
  delay?: number;
  duration?: number;
  className?: string;
  color?: string;
  bgColor?: string;
  size?: number;
}

const easingInOut: Easing = [0.25, 0.1, 0.25, 1];
const easingOut: Easing = [0, 0, 0.2, 1];
const easingLinear: Easing = [0, 0, 1, 1];

export function AnimatedIcon({
  children,
  animation = 'float',
  delay = 0,
  duration = 3,
  className = '',
  color = 'var(--primary)',
  bgColor = 'rgba(217,84,122,0.1)',
  size = 52,
}: AnimatedIconProps) {
  const animations = {
    float: {
      y: [0, -8, 0],
      transition: { duration, repeat: Infinity, ease: easingInOut, delay },
    },
    pulse: {
      scale: [1, 1.12, 1],
      transition: { duration: duration * 0.6, repeat: Infinity, ease: easingInOut, delay },
    },
    bounce: {
      y: [0, -12, 0],
      transition: { duration: duration * 0.5, repeat: Infinity, ease: easingOut, delay },
    },
    spin: {
      rotate: [0, 360],
      transition: { duration: duration * 1.5, repeat: Infinity, ease: easingLinear, delay },
    },
    glow: {
      boxShadow: [
        `0 0 0px ${color}22`,
        `0 0 20px ${color}44`,
        `0 0 0px ${color}22`,
      ],
      transition: { duration: duration * 0.8, repeat: Infinity, ease: easingInOut, delay },
    },
  };

  return (
    <motion.div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        background: bgColor,
        color,
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, delay, ease: easingInOut },
      }}
      viewport={{ once: true }}
      animate={animations[animation]}
    >
      {children}
    </motion.div>
  );
}
